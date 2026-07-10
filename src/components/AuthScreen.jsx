import React, { useState } from 'react';
import { Mail, Lock, User, Sparkles, LogIn, UserPlus, ShieldCheck, Database, Info } from 'lucide-react';
import { signInActualUser, registerActualUser, isFirebaseConfigured } from '../utils/firebase';

const AuthScreen = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [authMode, setAuthMode] = useState("demo"); // "demo" or "actual"
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("rohan");
  const [rememberMe, setRememberMe] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (authMode === "demo") {
      // 1. DEMO MODE: Bypass Firebase and log in instantly with selected persona presets
      onLoginSuccess(selectedPersona, null, "demo");
    } else {
      // 2. ACTUAL MODE: Connect to real Firestore / Firebase Authentication
      if (!email || !password || (isSignUp && !name)) {
        setErrorMsg("Please fill in all required fields!");
        return;
      }

      setLoading(true);
      try {
        if (isSignUp) {
          const user = await registerActualUser(email, password, name);
          onLoginSuccess(user.selectedPersona, user.name, "actual", user.profile, user.uid);
        } else {
          const user = await signInActualUser(email, password);
          onLoginSuccess(user.selectedPersona, user.name, "actual", user.profile, user.uid);
        }
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || "Authentication failed. Try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glass-card glass-panel-glow">
        
        {/* Brand Header */}
        <div className="auth-brand-header">
          <div className="auth-logo">I</div>
          <h2>IDBI Smart Wealth</h2>
          <p>AI-Powered Digital Wealth Management</p>
        </div>

        {/* Segmented Controller: Demo User vs Actual User */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid var(--border-color)', 
          padding: '3px', 
          borderRadius: '12px',
          marginBottom: '1.5rem',
          gap: '2px'
        }}>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'demo' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('demo');
              setErrorMsg("");
            }}
            style={{ padding: '6px', fontSize: '0.78rem', borderRadius: '8px' }}
          >
            <Sparkles size={13} />
            <span>Demo User Mode</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${authMode === 'actual' ? 'active' : ''}`}
            onClick={() => {
              setAuthMode('actual');
              setErrorMsg("");
            }}
            style={{ padding: '6px', fontSize: '0.78rem', borderRadius: '8px' }}
          >
            <Database size={13} />
            <span>Actual User Mode</span>
          </button>
        </div>

        {/* Display Error Message block */}
        {errorMsg && (
          <div style={{
            background: 'rgba(255, 94, 126, 0.1)',
            border: '1px solid rgba(255, 94, 126, 0.2)',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: 'var(--color-danger)',
            marginBottom: '1.25rem',
            lineHeight: 1.4
          }}>
            {errorMsg}
          </div>
        )}

        {/* Render Tab Selection ONLY for Actual User Mode */}
        {authMode === 'actual' && (
          <div className="auth-tabs">
            <button 
              type="button" 
              className={`auth-tab-btn ${!isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(false)}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
            <button 
              type="button" 
              className={`auth-tab-btn ${isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(true)}
            >
              <UserPlus size={15} />
              <span>Register</span>
            </button>
          </div>
        )}

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === 'demo' ? (
            /* DEMO MODE: Simple single dropdown & submit */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="auth-input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} color="var(--color-gold)" />
                  <span>Choose Demo Profile</span>
                </label>
                <select 
                  className="auth-select"
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                >
                  <option value="rohan">Rohan (26, High Spender, Aggressive)</option>
                  <option value="priya">Priya (35, Family Planner, Moderate)</option>
                  <option value="vikram">Vikram (48, Business Owner, Conservative)</option>
                </select>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                  Loads the sandbox pre-filled with this demo user's assets, transaction logs, and risk preferences.
                </span>
              </div>
              
              <button type="submit" className="auth-submit-btn">
                Launch Sandbox Dashboard
              </button>
            </div>
          ) : (
            /* ACTUAL USER MODE: Email/Password credential verification fields */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {isSignUp && (
                <div className="auth-input-group">
                  <label>Full Name</label>
                  <div className="auth-input-wrapper">
                    <User size={16} className="auth-input-icon" />
                    <input 
                      type="text" 
                      placeholder="Enter your name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="auth-input-group">
                <label>Email Address</label>
                <div className="auth-input-wrapper">
                  <Mail size={16} className="auth-input-icon" />
                  <input 
                    type="email" 
                    placeholder="you@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label>Password</label>
                <div className="auth-input-wrapper">
                  <Lock size={16} className="auth-input-icon" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="auth-actions-row">
                <label className="auth-checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="auth-forgot-link" onClick={(e) => { e.preventDefault(); alert("Simulated: Forgot password link sent!"); }}>
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? "Verifying Credentials..." : isSignUp ? "Create Live Account" : "Access Smart Wealth"}
              </button>
            </div>
          )}
        </form>

        {/* Demo Mode tips vs Connection status badges */}
        <div className="auth-footer-hint">
          {authMode === "demo" ? (
            <span>Demo Mode: Instant access without logins or credentials.</span>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
              {isFirebaseConfigured ? (
                <span style={{ color: 'var(--color-success)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                  <ShieldCheck size={12} />
                  <span>Firestore Active (Auth Connected)</span>
                </span>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ color: 'var(--color-warning)', display: 'inline-flex', alignItems: 'center', gap: '4px', justifyContent: 'center', fontWeight: 600 }}>
                    <Info size={12} stroke="var(--color-warning)" />
                    <span>Firestore Demo Mode (Local Storage)</span>
                  </span>
                  <span style={{ fontSize: '0.58rem', display: 'block', maxWidth: '300px', margin: '0 auto', color: 'var(--text-muted)' }}>
                    Add VITE_FIREBASE_API_KEY / PROJECT_ID inside your .env file to enable real Firestore writes.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
