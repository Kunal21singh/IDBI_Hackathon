import React, { useState, useEffect } from 'react';
import { Target, Sliders, RefreshCw, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { calculateSIPProjections } from '../utils/aiEngine';
import confetti from 'canvas-confetti';

const WealthAdvisory = ({ persona, onUpdatePersonaGoal, onAddChatMessage }) => {
  const { goals, riskProfile, riskScore } = persona;
  const [selectedGoal, setSelectedGoal] = useState(goals[0] || null);

  // Simulator States
  const [sipAmount, setSipAmount] = useState(selectedGoal ? selectedGoal.sip : 15000);
  const [returnRate, setReturnRate] = useState(12); // Average mutual fund return rate in India
  const [tenureYears, setTenureYears] = useState(selectedGoal ? Math.round(selectedGoal.duration / 12) : 5);

  // Risk Quiz States
  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizScores, setQuizScores] = useState([]);

  // Sync simulator sliders when selectedGoal changes
  useEffect(() => {
    if (selectedGoal) {
      setSipAmount(selectedGoal.sip);
      setTenureYears(Math.round(selectedGoal.duration / 12) || 2);
    }
  }, [selectedGoal]);

  const projections = calculateSIPProjections(sipAmount, returnRate, tenureYears);

  // Triggered when clicking "Invest Now"
  const handleInvestSimulation = () => {
    // Fire confetti for celebration
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const actionText = `I have successfully authorized a monthly Auto-SIP of ₹${sipAmount.toLocaleString('en-IN')} for my "${selectedGoal ? selectedGoal.name : 'Wealth Growth'}" goal at an expected return of ${returnRate}% for ${tenureYears} years.`;
    
    // Add user message
    onAddChatMessage(actionText, 'user');
    
    // Trigger success feedback response from AI
    setTimeout(() => {
      const responseText = `Excellent choice! I have created a recurring Auto-SIP draft linked to your IDBI bank account for ₹${sipAmount.toLocaleString('en-IN')}/month. Over ${tenureYears} years, your projected total wealth accumulation will be ₹${projections.totalAccumulated.toLocaleString('en-IN')}, which puts you on track to achieve your goal. Your risk-aligned SIP has been scheduled! 🎉`;
      onAddChatMessage(responseText, 'ai', 'happy');
      
      // Update goal state in the app
      if (selectedGoal) {
        onUpdatePersonaGoal(selectedGoal.id, sipAmount, tenureYears * 12);
      }
    }, 1000);
  };

  // Risk Quiz questions
  const quizQuestions = [
    {
      q: "What is your primary investment objective?",
      options: [
        { text: "Preserve capital & protect against inflation", score: 10 },
        { text: "Balanced portfolio with steady interest & dividends", score: 25 },
        { text: "High long-term growth and capital appreciation", score: 40 }
      ]
    },
    {
      q: "How would you react if your stock assets dropped by 20%?",
      options: [
        { text: "Panic and sell everything immediately to prevent losses", score: 5 },
        { text: "Wait out the market downturn without making changes", score: 20 },
        { text: "Invest more cash to buy assets at discounted prices", score: 40 }
      ]
    },
    {
      q: "What is your expected investment horizon for this money?",
      options: [
        { text: "Short Term: Under 3 years", score: 10 },
        { text: "Medium Term: 3 to 7 years", score: 25 },
        { text: "Long Term: Greater than 7 years", score: 40 }
      ]
    }
  ];

  const handleQuizAnswer = (score) => {
    const nextScores = [...quizScores, score];
    setQuizScores(nextScores);
    
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate final risk score
      const totalScore = nextScores.reduce((sum, s) => sum + s, 0);
      let calculatedProfile = "Moderate";
      if (totalScore < 40) calculatedProfile = "Conservative";
      else if (totalScore >= 90) calculatedProfile = "Aggressive";

      // Complete quiz
      setQuizActive(false);
      setQuizStep(0);
      setQuizScores([]);
      
      // Create user message
      const quizActionText = `I completed the risk profiling assessment and scored a total of ${totalScore} points.`;
      onAddChatMessage(quizActionText, 'user');
      
      setTimeout(() => {
        const resultResponse = `I have updated your profile! Your risk score is now ${totalScore}/120 (${calculatedProfile} profile). I recommend structuring your portfolio to align with this tolerance: ${
          calculatedProfile === 'Aggressive' ? '70% Equities, 30% Bonds' : calculatedProfile === 'Moderate' ? '50% Equities, 50% Bonds' : '20% Equities, 80% Bonds'
        }. Shall we rebalance?`;
        
        onAddChatMessage(resultResponse, 'ai', 'happy');
      }, 1000);
    }
  };

  return (
    <div className="panel-content-area wealth-advisory-container">
      
      {/* Risk Assessment Quiz Box */}
      <div className="glass-panel risk-quiz-card">
        {!quizActive ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'white' }}>Risk Profile Assessment</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Current Profile: <strong style={{ color: 'var(--color-primary)' }}>{riskProfile} ({riskScore}/100)</strong>
              </span>
            </div>
            <button 
              className="view-toggle-btn active" 
              style={{ padding: '4px 12px', fontSize: '0.72rem' }}
              onClick={() => setQuizActive(true)}
            >
              Retake Quiz
            </button>
          </div>
        ) : (
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-ai)' }}>
              Risk Assessment (Question {quizStep + 1} of {quizQuestions.length})
            </span>
            <p style={{ fontSize: '0.8rem', margin: '4px 0 8px 0', color: 'white', fontWeight: 500 }}>
              {quizQuestions[quizStep].q}
            </p>
            <div className="quiz-options-vertical-grid">
              {quizQuestions[quizStep].options.map((opt, idx) => (
                <button 
                  key={idx} 
                  className="quiz-option-row-btn"
                  onClick={() => handleQuizAnswer(opt.score)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
            <div className="quiz-progress-text">Step {quizStep + 1} of 3</div>
          </div>
        )}
      </div>

      {/* Target Goals Slider */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
          <h3>Savings Goals Projections</h3>
        </div>
        <div className="goals-simulator-panel">
          {goals.map(g => (
            <div 
              key={g.id} 
              className={`goal-card-item ${selectedGoal?.id === g.id ? 'selected' : ''}`}
              onClick={() => setSelectedGoal(g)}
            >
              <div className="goal-card-top">
                <span className="goal-card-title">{g.name}</span>
                <span className="goal-card-sip-tag">SIP: ₹{g.sip.toLocaleString('en-IN')}/m</span>
              </div>
              <div className="goal-card-bar-wrap">
                <div className="goal-card-bar-fill" style={{ width: `${g.progress}%` }}></div>
              </div>
              <div className="goal-card-bottom">
                <span>Saved: ₹{g.current.toLocaleString('en-IN')} (Target: ₹{g.target.toLocaleString('en-IN')})</span>
                <span>{g.progress}% Complete</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive SIP Projection Simulator */}
      {selectedGoal && (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div className="card-title-group" style={{ marginBottom: '0.25rem' }}>
            <h3>Compound Growth Simulator</h3>
          </div>
          <span className="card-subtitle-desc" style={{ display: 'block', marginTop: '-4px' }}>
            Simulate how scaling your SIP speedruns target goals
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.75rem' }}>
            
            {/* Slider 1: Monthly SIP */}
            <div className="simulator-slider-group">
              <div className="slider-label-row">
                <span>Monthly Investment</span>
                <span className="val">₹{sipAmount.toLocaleString('en-IN')}</span>
              </div>
              <input 
                type="range" 
                min="2000" 
                max="100000" 
                step="1000" 
                className="custom-range-slider"
                value={sipAmount}
                onChange={(e) => setSipAmount(parseInt(e.target.value))}
              />
            </div>

            {/* Slider 2: Rate of return */}
            <div className="simulator-slider-group">
              <div className="slider-label-row">
                <span>Expected Annual Returns</span>
                <span className="val">{returnRate}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="20" 
                step="0.5" 
                className="custom-range-slider"
                value={returnRate}
                onChange={(e) => setReturnRate(parseFloat(e.target.value))}
              />
            </div>

            {/* Slider 3: Duration */}
            <div className="simulator-slider-group">
              <div className="slider-label-row">
                <span>Tenure Duration</span>
                <span className="val">{tenureYears} Years</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="1" 
                className="custom-range-slider"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value))}
              />
            </div>

            {/* Results Grid Box */}
            <div className="simulator-result-box">
              <div className="sim-res-item">
                <span className="sim-res-lbl">Total Invested</span>
                <span className="sim-res-val">₹{projections.investedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="sim-res-item">
                <span className="sim-res-lbl">Returns Gained</span>
                <span className="sim-res-val" style={{ color: 'var(--color-success)' }}>
                  +₹{projections.estimatedReturns.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="sim-res-item" style={{ gridColumn: 'span 2', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                <span className="sim-res-lbl">Wealth Accumulated</span>
                <span className="sim-res-val" style={{ fontSize: '1.1rem', color: 'var(--color-ai)' }}>
                  ₹{projections.totalAccumulated.toLocaleString('en-IN')}
                </span>
              </div>

              {/* Confirm update button */}
              <button className="sim-invest-now-btn" onClick={handleInvestSimulation}>
                Update SIP & Invest Auto-Debit
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Advisory list guidelines */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="card-title-group" style={{ marginBottom: '0.25rem' }}>
          <h3>Smart Portfolio Recommendations</h3>
        </div>
        <span className="card-subtitle-desc" style={{ display: 'block', marginTop: '-4px' }}>
          Custom actionable guidance generated from your account profile
        </span>
        <div className="advisory-checklist-section">
          {persona.advisoryTips.map((tip, idx) => (
            <div 
              key={idx} 
              className="advisory-tip-check-item"
              onClick={() => onQuickPrompt(`tip_${idx}`)}
            >
              <div className="tip-check-icon-box">
                <CheckCircle2 size={16} />
              </div>
              <span className="tip-check-text">{tip}</span>
              <ChevronRight size={14} style={{ marginLeft: 'auto', flexShrink: 0, opacity: 0.5 }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default WealthAdvisory;
