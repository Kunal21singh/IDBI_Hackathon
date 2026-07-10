import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Database, FileText, Send, CheckCircle2, Lock, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const PortfolioSyncModal = ({ isOpen, onClose, onSyncSuccess }) => {
  const [method, setMethod] = useState("otp"); // "otp" or "pdf"
  const [pan, setPan] = useState("");
  const [mobile, setMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  
  const [fileAttached, setFileAttached] = useState(null);
  const [pdfPassword, setPdfPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [success, setSuccess] = useState(false);
  
  const loadingMessages = [
    "Establishing secure connection to CAMS/KRA registry...",
    "Validating PAN and KYC registration status...",
    "Retrieving Consolidated Account Statement (CAS)...",
    "Extracting ISIN holdings and scheme folios...",
    "Syncing transaction pools with IDBI Smart Wealth..."
  ];

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setInterval(() => {
        setLoadingStep(prev => {
          if (prev < loadingMessages.length - 1) {
            return prev + 1;
          } else {
            clearInterval(timer);
            setLoading(false);
            triggerSuccess();
            return 0;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading]);

  const triggerSuccess = () => {
    // Fire confetti celebration!
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.5 }
    });

    setSuccess(true);

    // Mock asset list extracted from CAMS KRA
    const mockSyncedHoldings = [
      { name: "IDBI Equity Advantage Fund (ELSS)", balance: 250000, rate: "14.5% YTD" },
      { name: "IDBI Nifty 50 Index Fund", balance: 180000, rate: "13.8% YTD" },
      { name: "Tata Motors Equity Holdings", balance: 75000, rate: "24.2% YTD" },
      { name: "Reliance Industries Shares", balance: 58300, rate: "9.5% YTD" }
    ];
    
    onSyncSuccess(mockSyncedHoldings, 563300);
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!pan || !mobile) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otpCode) return;
    setLoading(true);
    setLoadingStep(0);
  };

  const handlePdfSubmit = (e) => {
    e.preventDefault();
    if (!fileAttached || !pdfPassword) return;
    setLoading(true);
    setLoadingStep(0);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-panel-glow" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2rem',
        borderRadius: '24px',
        position: 'relative',
        boxShadow: '0 25px 50px rgba(0,0,0,0.8), 0 0 30px rgba(0,229,255,0.15)',
        backgroundColor: '#0c1220'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          <X size={16} />
        </button>

        {/* Success Screen */}
        {success ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(0, 230, 118, 0.08)', borderRadius: '50%', marginBottom: '1rem' }}>
              <CheckCircle2 size={48} color="var(--color-success)" />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'white', fontWeight: 700 }}>
              Holdings Sync Successful!
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.4 }}>
              Your mutual fund and stock assets have been successfully fetched from CAMS/KRA.
            </p>
            
            <div style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '12px', 
              padding: '1rem', 
              margin: '1.25rem 0',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Synced Via</span>
                <span style={{ color: 'white', fontWeight: 600 }}>CAMS/KRA Aggregator</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Holdings Found</span>
                <span style={{ color: 'white', fontWeight: 600 }}>4 Schemes/Stocks</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Consolidated Asset Value</span>
                <span style={{ color: 'var(--color-success)', fontWeight: 700 }}>₹5,63,300</span>
              </div>
            </div>

            <button 
              className="sim-invest-now-btn" 
              style={{ width: '100%', padding: '10px' }}
              onClick={onClose}
            >
              Analyze Synced Portfolio
            </button>
          </div>
        ) : loading ? (
          /* Loading Loader Screen */
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid rgba(0, 229, 255, 0.1)',
              borderTopColor: 'var(--color-ai)',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'listeningPulse 1.2s infinite ease-in-out',
              marginBottom: '1.5rem'
            }}></div>
            <h3 style={{ fontSize: '1rem', color: 'white', fontWeight: 600 }}>Syncing Portfolio...</h3>
            <p style={{ 
              fontSize: '0.78rem', 
              color: 'var(--text-secondary)', 
              marginTop: '8px', 
              minHeight: '40px',
              lineHeight: 1.4,
              padding: '0 1rem'
            }}>
              {loadingMessages[loadingStep]}
            </p>
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '2px', 
              marginTop: '1rem',
              overflow: 'hidden'
            }}>
              <div style={{ 
                height: '100%', 
                background: 'var(--color-ai)', 
                width: `${(loadingStep / (loadingMessages.length - 1)) * 100}%`,
                transition: 'width 1s linear'
              }}></div>
            </div>
          </div>
        ) : (
          /* Input/Selection Screen */
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: 'white', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
              <ShieldCheck size={20} color="var(--color-ai)" />
              <span>CAMS & KRA Portfolio Sync</span>
            </h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1.25rem' }}>
              Consolidate your outside mutual funds & stock portfolios using direct digital consent links or CAS PDF statement files.
            </p>

            {/* Selection Toggles */}
            <div className="auth-tabs" style={{ marginBottom: '1.25rem' }}>
              <button 
                type="button" 
                className={`auth-tab-btn ${method === 'otp' ? 'active' : ''}`}
                onClick={() => setMethod("otp")}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                <Database size={13} />
                <span>Consent Aggregator</span>
              </button>
              <button 
                type="button" 
                className={`auth-tab-btn ${method === 'pdf' ? 'active' : ''}`}
                onClick={() => setMethod("pdf")}
                style={{ fontSize: '0.75rem', padding: '6px' }}
              >
                <FileText size={13} />
                <span>CAS PDF Upload</span>
              </button>
            </div>

            {/* Method A: Consent via OTP */}
            {method === 'otp' ? (
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="auth-form">
                {!otpSent ? (
                  <>
                    <div className="auth-input-group">
                      <label>PAN Card Number</label>
                      <input 
                        type="text" 
                        className="chat-input-text" 
                        style={{ borderRadius: '8px', padding: '8px 12px' }}
                        placeholder="ABCDE1234F" 
                        value={pan}
                        onChange={(e) => setPan(e.target.value.toUpperCase())}
                        maxLength={10}
                        required 
                      />
                    </div>
                    <div className="auth-input-group">
                      <label>Registered Mobile Number</label>
                      <input 
                        type="tel" 
                        className="chat-input-text" 
                        style={{ borderRadius: '8px', padding: '8px 12px' }}
                        placeholder="9876543210" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                        maxLength={10}
                        required 
                      />
                    </div>
                    <button type="submit" className="auth-submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <span>Authorize Consent Fetch</span>
                      <ArrowRight size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="auth-input-group" style={{ textAlign: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        We sent a 6-digit consent OTP to <strong>+91 ******{mobile.slice(-4)}</strong>.
                      </span>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.75rem' }}>
                        <input 
                          type="text" 
                          className="chat-input-text" 
                          style={{ 
                            borderRadius: '8px', 
                            padding: '8px 12px', 
                            textAlign: 'center', 
                            fontSize: '1.2rem', 
                            letterSpacing: '8px',
                            width: '180px'
                          }}
                          placeholder="000000" 
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          maxLength={6}
                          required 
                        />
                      </div>
                    </div>
                    <button type="submit" className="auth-submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <ShieldCheck size={16} />
                      <span>Verify Consent & Sync Portfolio</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setOtpSent(false)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '0.7rem', cursor: 'pointer', marginTop: '0.25rem' }}
                    >
                      Back to details
                    </button>
                  </>
                )}
              </form>
            ) : (
              /* Method B: CAS Statement PDF Upload */
              <form onSubmit={handlePdfSubmit} className="auth-form">
                <div className="auth-input-group">
                  <label>Consolidated Account Statement (PDF/XML)</label>
                  <div 
                    onClick={() => document.getElementById('cas-file').click()}
                    style={{
                      border: '2px dashed var(--border-color)',
                      borderRadius: '12px',
                      padding: '1.5rem 1rem',
                      textAlign: 'center',
                      cursor: 'pointer',
                      background: 'rgba(255,255,255,0.01)',
                      transition: 'border-color 0.3s ease'
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files[0]) {
                        setFileAttached(e.dataTransfer.files[0].name);
                      }
                    }}
                  >
                    <FileText size={24} style={{ margin: '0 auto 8px auto', opacity: 0.5, color: 'var(--color-primary)' }} />
                    <span style={{ fontSize: '0.75rem', display: 'block', color: 'white', fontWeight: 600 }}>
                      {fileAttached ? fileAttached : "Click to select or drag CAS Statement PDF"}
                    </span>
                    <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      Supports CAMS Consolidated statements
                    </span>
                    <input 
                      type="file" 
                      id="cas-file" 
                      accept=".pdf"
                      style={{ display: 'none' }} 
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          setFileAttached(e.target.files[0].name);
                        }
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} color="var(--text-secondary)" />
                    <span>Statement Password</span>
                  </label>
                  <input 
                    type="password" 
                    className="chat-input-text" 
                    style={{ borderRadius: '8px', padding: '8px 12px' }}
                    placeholder="Enter PAN (CAPITAL) or Email" 
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    required 
                  />
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', display: 'block' }}>
                    Statement PDFs generated from CAMS are secured by your PAN in UPPERCASE or email.
                  </span>
                </div>

                <button type="submit" className="auth-submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>Decrypt & Sync Statement</span>
                </button>
              </form>
            )}

            {/* Security Notice */}
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              marginTop: '1.25rem', 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              paddingTop: '0.75rem',
              fontSize: '0.62rem',
              color: 'var(--text-muted)',
              lineHeight: 1.3
            }}>
              <ShieldCheck size={14} style={{ flexShrink: 0, color: 'var(--color-success)' }} />
              <span>We utilize Bank-Grade TLS encryption. Your CAMS consent does not authorize withdrawals or changes. It is strictly read-only for asset tracking.</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default PortfolioSyncModal;
