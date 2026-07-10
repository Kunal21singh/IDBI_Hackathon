import React, { useState, useEffect } from 'react';
import { Target, Sliders, RefreshCw, HelpCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { calculateSIPProjections } from '../utils/aiEngine';
import confetti from 'canvas-confetti';

const WealthAdvisory = ({ 
  persona, 
  onUpdatePersonaGoal, 
  onAddPersonaGoal,
  onModifyPersonaGoal,
  onAddChatMessage 
}) => {
  const { goals, riskProfile, riskScore } = persona;
  const [selectedGoal, setSelectedGoal] = useState(goals[0] || null);

  // Form overlay states for Add/Modify
  const [goalFormOpen, setGoalFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" or "modify"
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState(1000000);
  const [goalCurrent, setGoalCurrent] = useState(50000);
  const [goalSip, setGoalSip] = useState(10000);
  const [goalDuration, setGoalDuration] = useState(60);

  // Simulator States
  const [sipAmount, setSipAmount] = useState(selectedGoal ? selectedGoal.sip : 15000);
  const [returnRate, setReturnRate] = useState(12); 
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
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    const actionText = `I have successfully authorized a monthly Auto-SIP of ₹${sipAmount.toLocaleString('en-IN')} for my "${selectedGoal ? selectedGoal.name : 'Wealth Growth'}" goal at an expected return of ${returnRate}% for ${tenureYears} years.`;
    
    onAddChatMessage(actionText, 'user');
    
    setTimeout(() => {
      const responseText = `Excellent choice! I have created a recurring Auto-SIP draft linked to your IDBI bank account for ₹${sipAmount.toLocaleString('en-IN')}/month. Over ${tenureYears} years, your projected total wealth accumulation will be ₹${projections.totalAccumulated.toLocaleString('en-IN')}, which puts you on track to achieve your goal. Your risk-aligned SIP has been scheduled! 🎉`;
      onAddChatMessage(responseText, 'ai', 'happy');
      
      if (selectedGoal) {
        onUpdatePersonaGoal(selectedGoal.id, sipAmount, tenureYears * 12);
      }
    }, 1000);
  };

  // Open Form Handler
  const handleOpenForm = (mode, goal = null) => {
    setFormMode(mode);
    if (mode === "add") {
      setGoalName("");
      setGoalTarget(1000000);
      setGoalCurrent(50000);
      setGoalSip(10000);
      setGoalDuration(60);
    } else if (mode === "modify" && goal) {
      setGoalName(goal.name);
      setGoalTarget(goal.target);
      setGoalCurrent(goal.current);
      setGoalSip(goal.sip);
      setGoalDuration(goal.duration);
    }
    setGoalFormOpen(true);
  };

  // Form Submit Handler
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!goalName) return;

    if (formMode === "add") {
      const newGoal = {
        id: `g_${Date.now()}`,
        name: goalName,
        target: parseInt(goalTarget),
        current: parseInt(goalCurrent),
        sip: parseInt(goalSip),
        duration: parseInt(goalDuration),
      };
      
      onAddPersonaGoal(newGoal);
      setSelectedGoal(newGoal);
      confetti({ particleCount: 100, spread: 60 });

      onAddChatMessage(`I created a new financial goal: "${goalName}" with a target of ₹${parseInt(goalTarget).toLocaleString('en-IN')}.`, 'user');
      setTimeout(() => {
        onAddChatMessage(`I have successfully initialized your new goal "${goalName}"! A monthly Auto-SIP of ₹${parseInt(goalSip).toLocaleString('en-IN')} will accumulate approximately ₹${(parseInt(goalSip) * parseInt(goalDuration) * 1.3).toLocaleString('en-IN')} over the planned ${Math.round(goalDuration / 12)} years with compounded interest. Let's begin routing savings.`, 'ai', 'happy');
      }, 1000);

    } else if (formMode === "modify" && selectedGoal) {
      const updatedGoal = {
        id: selectedGoal.id,
        name: goalName,
        target: parseInt(goalTarget),
        current: parseInt(goalCurrent),
        sip: parseInt(goalSip),
        duration: parseInt(goalDuration),
      };

      onModifyPersonaGoal(updatedGoal);
      setSelectedGoal(updatedGoal);

      setSipAmount(parseInt(goalSip));
      setTenureYears(Math.round(parseInt(goalDuration) / 12) || 2);
    }

    setGoalFormOpen(false);
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
    const updatedScores = [...quizScores, score];
    setQuizScores(updatedScores);

    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const totalScore = updatedScores.reduce((sum, s) => sum + s, 0);
      let calculatedProfile = "Moderate";
      if (totalScore >= 95) calculatedProfile = "Aggressive";
      else if (totalScore <= 55) calculatedProfile = "Conservative";

      setQuizActive(false);
      setQuizStep(0);
      setQuizScores([]);
      
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0 }}>Savings Goals Projections</h3>
          <button 
            onClick={() => handleOpenForm("add")} 
            className="view-toggle-btn active"
            style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '12px' }}
          >
            + Add Goal
          </button>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="goal-card-sip-tag">SIP: ₹{g.sip.toLocaleString('en-IN')}/m</span>
                  {selectedGoal?.id === g.id && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleOpenForm("modify", g);
                      }} 
                      style={{ 
                        border: '1px solid rgba(0, 229, 255, 0.4)', 
                        background: 'rgba(0, 229, 255, 0.05)', 
                        color: 'var(--color-primary)', 
                        padding: '2px 8px', 
                        fontSize: '0.62rem', 
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 600
                      }}
                    >
                      Modify
                    </button>
                  )}
                </div>
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
                <span>Expected Returns (p.a.)</span>
                <span className="val">{returnRate}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="25" 
                step="0.5" 
                className="custom-range-slider"
                value={returnRate}
                onChange={(e) => setReturnRate(parseFloat(e.target.value))}
              />
            </div>

            {/* Slider 3: Duration */}
            <div className="simulator-slider-group">
              <div className="slider-label-row">
                <span>Tenure Period</span>
                <span className="val">{tenureYears} Years</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="30" 
                step="1" 
                className="custom-range-slider"
                value={tenureYears}
                onChange={(e) => setTenureYears(parseInt(e.target.value))}
              />
            </div>

            {/* Calculations & Result Card */}
            <div className="simulator-metrics-card">
              <div className="sim-metric-item">
                <span className="lbl">Invested Principal</span>
                <span className="val">₹{projections.investedAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="sim-metric-item">
                <span className="lbl">Estimated Gains</span>
                <span className="val" style={{ color: 'var(--color-success)' }}>
                  + ₹{projections.estimatedReturns.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="sim-metric-item total">
                <span className="lbl">Total Value Accumulation</span>
                <span className="val">₹{projections.totalAccumulated.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action buttons */}
            <button className="sim-invest-now-btn" onClick={handleInvestSimulation}>
              Confirm Monthly SIP Draft
            </button>

          </div>
        </div>
      )}

      {/* Goal Add / Modify Overlay Form Dialog */}
      {goalFormOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
          padding: '1rem'
        }}>
          <div className="glass-panel-glow" style={{
            width: '100%', maxWidth: '420px', padding: '1.75rem', borderRadius: '20px',
            backgroundColor: '#0c1220', border: '1px solid rgba(0, 229, 255, 0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}>
            <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '1.1rem' }}>
              <Target size={20} color="var(--color-ai)" />
              <span>{formMode === 'add' ? 'Add New Savings Goal' : 'Modify Savings Goal'}</span>
            </h3>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }} className="auth-form">
              <div className="auth-input-group">
                <label>Goal Name</label>
                <input 
                  type="text" 
                  className="chat-input-text" 
                  style={{ borderRadius: '8px', padding: '8px 12px' }}
                  placeholder="e.g. Retirement, Child Higher Ed, SUV" 
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="auth-input-group">
                  <label>Target Amount (₹)</label>
                  <input 
                    type="number" 
                    className="chat-input-text" 
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    min="1000"
                    required 
                  />
                </div>
                <div className="auth-input-group">
                  <label>Currently Saved (₹)</label>
                  <input 
                    type="number" 
                    className="chat-input-text" 
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    min="0"
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="auth-input-group">
                  <label>Planned SIP (₹/m)</label>
                  <input 
                    type="number" 
                    className="chat-input-text" 
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                    value={goalSip}
                    onChange={(e) => setGoalSip(e.target.value)}
                    min="500"
                    required 
                  />
                </div>
                <div className="auth-input-group">
                  <label>Duration (Months)</label>
                  <input 
                    type="number" 
                    className="chat-input-text" 
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                    value={goalDuration}
                    onChange={(e) => setGoalDuration(e.target.value)}
                    min="1"
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '0.75rem' }}>
                <button 
                  type="button" 
                  className="voice-mute-toggle-btn" 
                  style={{ flex: 1, margin: 0, padding: '10px', height: 'auto', borderRadius: '12px' }}
                  onClick={() => setGoalFormOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="auth-submit-btn" 
                  style={{ flex: 1, margin: 0, padding: '10px', height: 'auto', borderRadius: '12px' }}
                >
                  {formMode === 'add' ? 'Create Goal' : 'Save Changes'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default WealthAdvisory;
