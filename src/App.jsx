import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  BarChart3, 
  TrendingUp, 
  MessageSquare, 
  Phone, 
  Laptop, 
  Smartphone, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Menu
} from 'lucide-react';
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

  // 2. Sidebar Collapsible State
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // 3. Global Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const recognitionRef = useRef(null);

  // 4. Core Dashboard States
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

  // Initialize Global Speech Recognition (STT)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Indian English pronunciation

      rec.onstart = () => {
        setIsListening(true);
        setAvatarState("listening");
        setRecognitionError(null);
      };

      rec.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (transcript.trim()) {
          // Switch to chat tab dynamically on vocal trigger input
          setActiveTab("chat");
          handleSendMessage(transcript);
        }
      };

      rec.onerror = (e) => {
        console.error("Global Speech recognition error: ", e);
        setRecognitionError("Failed to capture speech. Try typing!");
        setIsListening(false);
        setAvatarState("idle");
      };

      rec.onend = () => {
        setIsListening(false);
        setAvatarState(prev => prev === 'listening' ? 'idle' : prev);
      };

      recognitionRef.current = rec;
    }
  }, [currentPersonaId]);

  const toggleSpeechListening = () => {
    if (!recognitionRef.current) {
      setRecognitionError("Speech-to-text not supported in this browser. Please use Chrome!");
      alert("Speech-to-text not supported in this browser. Please use Chrome!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        setRecognitionError(null);
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

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
        
        setLatestSpeechText(`Welcome ${customName}! Let's optimize your wealth advisory portfolio today!`);
      } else {
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

      holdings.forEach(h => {
        const exists = actualUser.accounts.some(acc => acc.name === h.name);
        if (!exists) {
          actualUser.accounts.push(h);
        }
      });

      actualUser.metrics.netWorth += totalValue;
      
      const savingsAccount = actualUser.accounts.find(a => a.name.includes("Savings"));
      if (savingsAccount && savingsAccount.balance > 50000) {
        actualUser.metrics.cashDrag = savingsAccount.balance - 50000;
      }

      if (userUid) {
        saveActualUserProfile(userUid, actualUser);
      }

      return updated;
    });

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
    
    setChatLogs(prev => ({
      ...prev,
      [currentPersonaId]: [
        ...prev[currentPersonaId],
        { sender, text, time: timeString }
      ]
    }));

    if (sender === 'ai') {
      setLatestSpeechText(text); 
      if (forceState) {
        setAvatarState(forceState);
      } else {
        setAvatarState("speaking");
      }
    }
  };

  // Chat Submission Handler
  const handleSendMessage = (messageText) => {
    addChatMessage(messageText, 'user');
    setAvatarState("thinking");

    setTimeout(() => {
      const aiResult = generateAIResponse(messageText, activePersona);
      addChatMessage(aiResult.text, 'ai', aiResult.state);

      if (aiResult.actionTrigger && aiResult.actionTrigger.type === "OPEN_TAB") {
        setActiveTab(aiResult.actionTrigger.payload);
      }
    }, 1000);
  };

  const handleSelectPersona = (id) => {
    setCurrentPersonaId(id);
    setAvatarState("idle");
    setLatestSpeechText("");
    setActiveTab("overview");
  };

  const handleUpdatePersonaGoal = (goalId, newSip, newDuration) => {
    setPersonaData(prev => {
      const updated = { ...prev };
      const persona = updated[currentPersonaId];
      const goalIndex = persona.goals.findIndex(g => g.id === goalId);
      if (goalIndex !== -1) {
        const goal = persona.goals[goalIndex];
        goal.sip = newSip;
        goal.duration = newDuration;
        
        const totalInvestedProjected = goal.current + (newSip * newDuration * 0.7);
        goal.progress = Math.min(100, Math.round((totalInvestedProjected / goal.target) * 100));
      }

      if (authType === "actual" && userUid) {
        saveActualUserProfile(userUid, updated.actual);
      }

      return updated;
    });
  };

  const handleCreatePersonaGoal = (newGoal) => {
    setPersonaData(prev => {
      const updated = { ...prev };
      const persona = updated[currentPersonaId];
      
      const totalInvestedProjected = newGoal.current + (newGoal.sip * newGoal.duration * 0.7);
      newGoal.progress = Math.min(100, Math.round((totalInvestedProjected / newGoal.target) * 100));
      
      persona.goals.push(newGoal);

      if (authType === "actual" && userUid) {
        saveActualUserProfile(userUid, updated.actual);
      }

      return updated;
    });
  };

  const handleModifyPersonaGoal = (updatedGoal) => {
    setPersonaData(prev => {
      const updated = { ...prev };
      const persona = updated[currentPersonaId];
      const idx = persona.goals.findIndex(g => g.id === updatedGoal.id);
      if (idx !== -1) {
        const totalInvestedProjected = updatedGoal.current + (updatedGoal.sip * updatedGoal.duration * 0.7);
        updatedGoal.progress = Math.min(100, Math.round((totalInvestedProjected / updatedGoal.target) * 100));
        persona.goals[idx] = updatedGoal;
      }

      if (authType === "actual" && userUid) {
        saveActualUserProfile(userUid, updated.actual);
      }

      return updated;
    });
  };

  const handleQuickPrompt = (promptText) => {
    if (activeTab !== "chat") {
      setActiveTab("chat");
    }
    handleSendMessage(promptText);
  };

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
            onAddPersonaGoal={handleCreatePersonaGoal}
            onModifyPersonaGoal={handleModifyPersonaGoal}
            onAddChatMessage={addChatMessage}
          />
        );
      case "chat":
        return (
          <ChatInterface 
            messages={activeChat} 
            onSendMessage={handleSendMessage} 
            persona={activePersona}
            isListening={isListening}
            onToggleListening={toggleSpeechListening}
          />
        );
      default:
        return null;
    }
  };

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
              <div className="mobile-phone-notch">
                <div className="notch-camera"></div>
                <div className="notch-speaker"></div>
              </div>
              
              <div className="mobile-screen-content">
                
                <div className="mobile-app-header">
                  <span className="mobile-app-logo">
                    <span style={{ color: 'var(--color-primary)' }}>IDBI</span> Wealth
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                    <span>5G LTE</span>
                    <span>100%</span>
                  </div>
                </div>

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

                {renderActiveViewport()}

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

                <div className="mobile-device-home-indicator"></div>
              </div>
            </div>
          </div>
        )}

        {/* 2. FULL WIDTH DESKTOP PORTAL VIEW MODE */}
        {viewMode === 'desktop' && (
          <div className={`desktop-dashboard-view ${isSidebarCollapsed ? 'collapsed' : ''}`}>
            
            {/* Sidebar Panel containing the Active Avatar & Tab Controls */}
            <div className={`desktop-sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
              
              {/* Talking AI Avatar Panel */}
              <AvatarView 
                avatarName={activePersona.avatarName}
                latestResponseText={latestSpeechText}
                avatarState={avatarState}
                setAvatarState={setAvatarState}
                isMuted={isMuted}
                setIsMuted={setIsMuted}
                isListening={isListening}
                onToggleListening={toggleSpeechListening}
              />

              {/* Sidebar Navigation Card (Collapsible) */}
              <div className="glass-panel" style={{ padding: isSidebarCollapsed ? '0.75rem 0.25rem' : '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                
                <span 
                  className="persona-selector-label" 
                  style={{ 
                    padding: 0, 
                    display: isSidebarCollapsed ? 'none' : 'block'
                  }}
                >
                  Navigation Portal
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: isSidebarCollapsed ? '0.5rem' : 0 }}>
                  <button 
                    className={`view-toggle-btn nav-portal-btn ${activeTab === 'overview' ? 'active' : ''}`}
                    style={{ 
                      width: '100%', 
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', 
                      borderRadius: '12px',
                      padding: isSidebarCollapsed ? '8px' : '0.5rem 1rem'
                    }}
                    onClick={() => setActiveTab('overview')}
                    title="Financial Overview"
                  >
                    <Wallet size={15} />
                    {!isSidebarCollapsed && <span>Financial Overview</span>}
                  </button>
                  <button 
                    className={`view-toggle-btn nav-portal-btn ${activeTab === 'spending' ? 'active' : ''}`}
                    style={{ 
                      width: '100%', 
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', 
                      borderRadius: '12px',
                      padding: isSidebarCollapsed ? '8px' : '0.5rem 1rem'
                    }}
                    onClick={() => setActiveTab('spending')}
                    title="Spending Insights"
                  >
                    <BarChart3 size={15} />
                    {!isSidebarCollapsed && <span>Spending Insights</span>}
                  </button>
                  <button 
                    className={`view-toggle-btn nav-portal-btn ${activeTab === 'advisory' ? 'active' : ''}`}
                    style={{ 
                      width: '100%', 
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', 
                      borderRadius: '12px',
                      padding: isSidebarCollapsed ? '8px' : '0.5rem 1rem'
                    }}
                    onClick={() => setActiveTab('advisory')}
                    title="Goal Advisory Simulator"
                  >
                    <TrendingUp size={15} />
                    {!isSidebarCollapsed && <span>Goal Advisory Simulator</span>}
                  </button>
                  <button 
                    className={`view-toggle-btn nav-portal-btn ${activeTab === 'chat' ? 'active' : ''}`}
                    style={{ 
                      width: '100%', 
                      justifyContent: isSidebarCollapsed ? 'center' : 'flex-start', 
                      borderRadius: '12px',
                      padding: isSidebarCollapsed ? '8px' : '0.5rem 1rem'
                    }}
                    onClick={() => setActiveTab('chat')}
                    title="Interactive Advisor Chat"
                  >
                    <MessageSquare size={15} />
                    {!isSidebarCollapsed && <span>Interactive Advisor Chat</span>}
                  </button>
                </div>

                {/* Collapsible toggle arrow positioned at the bottom of the portal card */}
                <div style={{ 
                  borderTop: '1px solid rgba(255,255,255,0.06)', 
                  paddingTop: '0.5rem', 
                  marginTop: '0.25rem',
                  display: 'flex',
                  justifyContent: 'center',
                  width: '100%'
                }}>
                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    className="sidebar-collapse-btn"
                    title={isSidebarCollapsed ? "Expand Navigation" : "Collapse Navigation"}
                    style={{
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-secondary)',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
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
          isListening={isListening}
          onToggleListening={toggleSpeechListening}
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
