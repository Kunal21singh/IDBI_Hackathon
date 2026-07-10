import React, { useState, useEffect } from 'react';
import { Wallet, BarChart3, TrendingUp, MessageSquare, Phone, Laptop, Smartphone, LogOut } from 'lucide-react';
import PersonaSelector from './components/PersonaSelector';
import AvatarView from './components/AvatarView';
import ChatInterface from './components/ChatInterface';
import FinancialSummary from './components/FinancialSummary';
import SpendingInsights from './components/SpendingInsights';
import WealthAdvisory from './components/WealthAdvisory';
import AuthScreen from './components/AuthScreen';
import PortfolioSyncModal from './components/PortfolioSyncModal';
import { PERSONAS } from './utils/mockData';
import { logOutActualUser, saveActualUserProfile } from './utils/firebase';
import { generateAIResponse } from './utils/aiEngine';
import './App.css';
import './components.css';

function App() {
  // 1. Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authType, setAuthType] = useState("demo"); // "demo" or "actual"
  const [userUid, setUserUid] = useState(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // 2. Core Dashboard States
  const [currentPersonaId, setCurrentPersonaId] = useState("rohan");
  const [activeTab, setActiveTab] = useState("overview"); // overview, spending, advisory, chat
  const [viewMode, setViewMode] = useState("mobile"); // mobile or desktop
  const [isMuted, setIsMuted] = useState(false);

  // Deep copies of persona profiles to support in-memory modifications (like updating SIPs)
  const [personaData, setPersonaData] = useState(() => JSON.parse(JSON.stringify(PERSONAS)));
  
  // preserves independent chat logs for Rohan, Priya, Vikram
  const [chatLogs, setChatLogs] = useState({
    rohan: [
      { sender: "ai", text: PERSONAS.rohan.initialGreeting, time: "11:40 AM" }
    ],
    priya: [
      { sender: "ai", text: PERSONAS.priya.initialGreeting, time: "11:40 AM" }
    ],
    vikram: [
      { sender: "ai", text: PERSONAS.vikram.initialGreeting, time: "11:40 AM" }
    ]
  });

  const [avatarState, setAvatarState] = useState("idle"); // idle, speaking, thinking, listening, warning, happy
  const [latestSpeechText, setLatestSpeechText] = useState("");

  const activePersona = personaData[currentPersonaId];
  const activeChat = chatLogs[currentPersonaId];

  // Handler for successful authentication onboarding
  const handleLoginSuccess = (selectedPersonaId, customName, authTypeSelected, loadedProfile, uid) => {
    setAuthType(authTypeSelected);
    setUserUid(uid || null);

    if (authTypeSelected === "actual" && loadedProfile) {
      // 1. ACTUAL MODE: Initialize clean profile loaded from Firestore / Local Storage
      setPersonaData(prev => ({
        ...prev,
        actual: loadedProfile
      }));

      setChatLogs(prev => ({
        ...prev,
        actual: [
          { 
            sender: "ai", 
            text: loadedProfile.initialGreeting, 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]
      }));

      setCurrentPersonaId("actual");
      setLatestSpeechText(loadedProfile.initialGreeting);
    } else {
      // 2. DEMO MODE: Standard preset layouts (Rohan, Priya, Vikram)
      setCurrentPersonaId(selectedPersonaId);
      
      if (customName) {
        setPersonaData(prev => {
          const updated = { ...prev };
          updated[selectedPersonaId].name = customName;
          // Customize greetings for custom registered name
          updated[selectedPersonaId].initialGreeting = `Hey ${customName}! I notice you've got some heavy transaction outflows, and ₹${personaData[selectedPersonaId].metrics.cashDrag.toLocaleString('en-IN')} sitting in your savings account is losing value to inflation. Let's redirect that cash drag into a high-growth SIP! What do you think?`;
          return updated;
        });

        setChatLogs(prev => {
          const updated = { ...prev };
          updated[selectedPersonaId] = [
            { sender: "ai", text: `Welcome ${customName}! I've preconfigured your wealth advisory dashboard. You're starting out with a net worth of ₹${personaData[selectedPersonaId].metrics.netWorth.toLocaleString('en-IN')}. Let me know if you would like me to analyze your cash drag issues or review your tax limits.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
          ];
          return updated;
        });
        
        // Seed voice greetings
        setLatestSpeechText(`Welcome ${customName}! Let's optimize your wealth advisory portfolio today!`);
      } else {
        // Use default mock persona greeting
        setLatestSpeechText(personaData[selectedPersonaId].initialGreeting);
      }
    }

    setIsLoggedIn(true);
    setAvatarState("happy");
    setActiveTab("overview");
  };

  const handleLogout = async () => {
    await logOutActualUser();
    setIsLoggedIn(false);
    setAuthType("demo");
    setUserUid(null);
    setAvatarState("idle");
    setLatestSpeechText("");
  };

  // Sync outside portfolios from CAMS/KRA
  const handlePortfolioSyncSuccess = (holdings, totalValue) => {
    setPersonaData(prev => {
      const updated = { ...prev };
      const actualUser = updated.actual;
      if (!actualUser) return prev;

      // Merge new holdings avoiding duplication
      holdings.forEach(h => {
        const exists = actualUser.accounts.some(acc => acc.name === h.name);
        if (!exists) {
          actualUser.accounts.push(h);
        }
      });

      // Update net worth and configure cash drag
      actualUser.metrics.netWorth += totalValue;
      
      const savingsAccount = actualUser.accounts.find(a => a.name.includes("Savings"));
      if (savingsAccount && savingsAccount.balance > 50000) {
        actualUser.metrics.cashDrag = savingsAccount.balance - 50000;
      }

      // Sync changes to Firestore / Local Storage database
      if (userUid) {
        saveActualUserProfile(userUid, actualUser);
      }

      return updated;
    });

    // Notify user chat and trigger AI analysis
    setTimeout(() => {
      addChatMessage(`I successfully synced my CAMS folio statement. Estimated value of external schemes is ₹${totalValue.toLocaleString('en-IN')}. Please analyze my allocation.`, 'user');
      
      setTimeout(() => {
        const responseText = `I have successfully imported your Consolidated Account Statement from CAMS! You hold ₹5,63,300 across 4 outside schemes. Adding this to your IDBI assets brings your total net worth to ₹5,63,300. I notice 76% of your portfolio is in Aggressive Equity. Since you prefer a Moderate risk style, let's diversify by redirecting future SIPs into short-term corporate debt funds to shield capital. Shall we set it up?`;
        addChatMessage(responseText, 'ai', 'happy');
      }, 1000);
    }, 500);
  };

  // Helper to add chat messages and trigger TTS
  const addChatMessage = (text, sender = 'ai', forceState = null) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Add to chat history log
    setChatLogs(prev => ({
      ...prev,
      [currentPersonaId]: [
        ...prev[currentPersonaId],
        { sender, text, time: timeString }
      ]
    }));

    if (sender === 'ai') {
      setLatestSpeechText(text); // triggers TTS in Avatar component
      if (forceState) {
        setAvatarState(forceState);
      } else {
        setAvatarState("speaking");
      }
    }
  };

  // Chat Submission Handler
  const handleSendMessage = (messageText) => {
    // 1. Add user's message
    addChatMessage(messageText, 'user');
    setAvatarState("thinking");

    // 2. Query AI advisor script engine
    setTimeout(() => {
      const aiResult = generateAIResponse(messageText, activePersona);
      
      // 3. Add AI advisor reply
      addChatMessage(aiResult.text, 'ai', aiResult.state);

      // 4. Handle dynamic tab switches if requested
      if (aiResult.actionTrigger && aiResult.actionTrigger.type === "OPEN_TAB") {
        setActiveTab(aiResult.actionTrigger.payload);
      }
    }, 1000);
  };

  // Sync state when switching persona
  const handleSelectPersona = (id) => {
    setCurrentPersonaId(id);
    setAvatarState("idle");
    setLatestSpeechText("");
    
    // Switch to overview when swapping persona
    setActiveTab("overview");
  };

  // Dynamic Goal updates
  const handleUpdatePersonaGoal = (goalId, newSip, newDuration) => {
    setPersonaData(prev => {
      const updated = { ...prev };
      const persona = updated[currentPersonaId];
      const goalIndex = persona.goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        const goal = persona.goals[goalIndex];
        goal.sip = newSip;
        goal.duration = newDuration;
        
        // Dynamic progress calculation based on updated SIP values
        const totalInvestedProjected = goal.current + (newSip * newDuration * 0.7);
        goal.progress = Math.min(100, Math.round((totalInvestedProjected / goal.target) * 100));
      }

      // Sync actual user profile updates dynamically with Firestore / Local Storage
      if (authType === "actual" && userUid) {
        saveActualUserProfile(userUid, updated.actual);
      }

      return updated;
    });
  };

  // Helper shortcut prompts (badges and checklist triggers)
  const handleQuickPrompt = (promptText) => {
    if (activeTab !== "chat") {
      setActiveTab("chat");
    }
    handleSendMessage(promptText);
  };

  // Render sub-sections dynamically inside the active panel viewport
  const renderActiveViewport = () => {
    switch (activeTab) {
      case "overview":
        return (
          <FinancialSummary 
            persona={activePersona} 
            onQuickPrompt={handleQuickPrompt} 
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
          />
        );
      case "spending":
        return (
          <SpendingInsights 
            persona={activePersona} 
            onQuickPrompt={handleQuickPrompt} 
          />
        );
      case "advisory":
        return (
          <WealthAdvisory 
            persona={activePersona} 
            onUpdatePersonaGoal={handleUpdatePersonaGoal}
            onAddChatMessage={addChatMessage}
          />
        );
      case "chat":
        return (
          <ChatInterface 
            messages={activeChat} 
            onSendMessage={handleSendMessage} 
            persona={activePersona}
            avatarState={avatarState}
            setAvatarState={setAvatarState}
          />
        );
      default:
        return null;
    }
  };

  // If user is not authenticated, show Login/Signup card
  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-wrapper">
      
      {/* Floating Demo Header */}
      <header className="header-bar glass-panel">
        <div className="header-logo-group">
          <div className="bank-logo-sim">I</div>
          <div className="header-title-container">
            <h1>IDBI Smart Wealth</h1>
            <div className="header-subtitle">
              <span>Next-Gen Wealth Advisory</span>
              <span className="header-subtitle-badge">
                {authType === 'actual' ? 'Production Mode' : 'Avatar AI Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Floating Developer Persona Switcher & Logout Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Renders profile swappers in Demo mode only! */}
          {authType === "demo" && (
            <PersonaSelector 
              currentPersonaId={currentPersonaId} 
              onSelect={handleSelectPersona} 
            />
          )}
          <button 
            className="view-toggle-btn"
            style={{ 
              border: '1px solid rgba(255, 94, 126, 0.4)', 
              color: 'var(--color-danger)',
              padding: '0.4rem 0.75rem',
              borderRadius: '20px'
            }}
            onClick={handleLogout}
            title="Log Out (Reset Demo)"
          >
            <LogOut size={14} />
            <span style={{ fontWeight: 600 }}>Logout</span>
          </button>
        </div>
      </header>

      {/* Switcher Toggles (Mobile simulator vs Full Desktop views) */}
      <div className="layout-switch-bar">
        <button 
          className={`view-toggle-btn ${viewMode === 'mobile' ? 'active' : ''}`}
          onClick={() => setViewMode('mobile')}
        >
          <Smartphone size={15} />
          <span>Mobile App Integration</span>
        </button>
        <button 
          className={`view-toggle-btn ${viewMode === 'desktop' ? 'active' : ''}`}
          onClick={() => setViewMode('desktop')}
        >
          <Laptop size={15} />
          <span>Desktop Portal View</span>
        </button>
      </div>

      {/* Main View Portfolios */}
      <main className="main-view-container">
        
        {/* 1. MOBILE DEVICE SIMULATOR MODE */}
        {viewMode === 'mobile' && (
          <div className="mobile-device-sandbox">
            <div className="mobile-phone-frame">
              {/* Notch decoration */}
              <div className="mobile-phone-notch">
                <div className="notch-camera"></div>
                <div className="notch-speaker"></div>
              </div>
              
              {/* Inside Mobile Screen Content */}
              <div className="mobile-screen-content">
                
                {/* Mobile app header */}
                <div className="mobile-app-header">
                  <span className="mobile-app-logo">
                    <span style={{ color: 'var(--color-primary)' }}>IDBI</span> Wealth
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                    <span>5G LTE</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Simulated Floating Avatar Banner (visible on all tabs except Chat tab to give constant guidance!) */}
                {activeTab !== 'chat' && (
                  <div 
                    className="glass-panel-glow" 
                    style={{ 
                      padding: '0.5rem 0.75rem', 
                      borderRadius: '16px', 
                      marginBottom: '0.75rem', 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      border: '1px solid rgba(0, 229, 255, 0.15)',
                      background: 'radial-gradient(circle at 90% 10%, rgba(0, 229, 255, 0.05) 0%, rgba(18, 25, 41, 0.7) 100%)'
                    }}
                    onClick={() => setActiveTab('chat')}
                  >
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(0, 229, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="32" height="32" viewBox="0 0 100 100">
                        <circle cx="50" cy="48" r="24" fill="#1e293b" />
                        <g className={avatarState === 'speaking' ? 'avatar-mouth' : ''}>
                          <path d="M 44,57 Q 50,59 56,57" fill="none" stroke="var(--color-ai)" strokeWidth="3" />
                        </g>
                        <circle cx="37" cy="44" r="3" fill="var(--color-ai)" />
                        <circle cx="63" cy="44" r="3" fill="var(--color-ai)" />
                      </svg>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'white' }}>{activePersona.avatarName.split(" - ")[0]}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '210px' }}>
                        {latestSpeechText || activePersona.initialGreeting}
                      </span>
                    </div>
                  </div>
                )}

                {/* Sub-tab view viewport content */}
                {renderActiveViewport()}

                {/* Bottom App Navigation Tabs */}
                <nav className="app-nav-tabs">
                  <button 
                    className={`nav-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                  >
                    <Wallet size={16} />
                    <span>Overview</span>
                  </button>
                  <button 
                    className={`nav-tab-btn ${activeTab === 'spending' ? 'active' : ''}`}
                    onClick={() => setActiveTab('spending')}
                  >
                    <BarChart3 size={16} />
                    <span>Spend</span>
                  </button>
                  <button 
                    className={`nav-tab-btn ${activeTab === 'advisory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('advisory')}
                  >
                    <TrendingUp size={16} />
                    <span>Advisory</span>
                  </button>
                  <button 
                    className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageSquare size={16} />
                    <span>Advisor AI</span>
                  </button>
                </nav>

                {/* Simulated mobile home indicator bar */}
                <div className="mobile-device-home-indicator"></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FULL WIDTH DESKTOP PORTAL VIEW MODE */}
        {viewMode === 'desktop' && (
          <div className="desktop-dashboard-view">
            
            {/* Sidebar Panel containing the Active Avatar & Tab Controls */}
            <div className="desktop-sidebar">
              
              {/* Talking AI Avatar Panel */}
              <AvatarView 
                avatarName={activePersona.avatarName}
                latestResponseText={latestSpeechText}
                avatarState={avatarState}
                setAvatarState={setAvatarState}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
              />

              {/* Sidebar Navigation Card */}
              <div className="glass-panel" style={{ padding: '1rem' }}>
                <span className="persona-selector-label" style={{ padding: 0, display: 'block', marginBottom: '0.75rem' }}>Navigation Portal</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button 
                    className={`view-toggle-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '12px' }}
                    onClick={() => setActiveTab('overview')}
                  >
                    <Wallet size={15} />
                    <span>Financial Overview</span>
                  </button>
                  <button 
                    className={`view-toggle-btn ${activeTab === 'spending' ? 'active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '12px' }}
                    onClick={() => setActiveTab('spending')}
                  >
                    <BarChart3 size={15} />
                    <span>Behavior & Spending Insights</span>
                  </button>
                  <button 
                    className={`view-toggle-btn ${activeTab === 'advisory' ? 'active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '12px' }}
                    onClick={() => setActiveTab('advisory')}
                  >
                    <TrendingUp size={15} />
                    <span>Goal Advisory Simulator</span>
                  </button>
                  <button 
                    className={`view-toggle-btn ${activeTab === 'chat' ? 'active' : ''}`}
                    style={{ width: '100%', justifyContent: 'flex-start', borderRadius: '12px' }}
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageSquare size={15} />
                    <span>Interactive Advisor Chat</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Main Panel Viewport */}
            <div className="desktop-main-panel">
              {renderActiveViewport()}
            </div>

          </div>
        )}

      </main>

      {/* Hidden audio element / avatar state synchronizer hook */}
      <div style={{ display: 'none' }}>
        <AvatarView 
          avatarName={activePersona.avatarName}
          latestResponseText={latestSpeechText}
          avatarState={avatarState}
          setAvatarState={setAvatarState}
          isMuted={isMuted}
          setIsMuted={setIsMuted}
        />
      </div>

      <PortfolioSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSyncSuccess={handlePortfolioSyncSuccess}
      />

    </div>
  );
}

export default App;
