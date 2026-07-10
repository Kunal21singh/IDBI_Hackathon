import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Mic, MicOff } from 'lucide-react';

const AvatarView = ({ 
  avatarName, 
  latestResponseText, 
  avatarState, 
  setAvatarState, 
  isMuted, 
  setIsMuted,
  isListening,
  onToggleListening
}) => {
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const [voiceSelected, setVoiceSelected] = useState(null);

  // Initialize and select a high-quality voice if available
  useEffect(() => {
    const loadVoices = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => 
        (v.name.includes("Google") && v.lang.startsWith("en")) || 
        (v.name.includes("Natural") && v.lang.startsWith("en")) ||
        v.name.includes("Zira") || 
        v.name.includes("Samantha") ||
        v.lang.startsWith("en")
      );
      setVoiceSelected(preferredVoice || voices[0]);
    };

    loadVoices();
    if (synthRef.current && synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = loadVoices;
    }
  }, []);

  // Text-To-Speech execution when a new message is received
  useEffect(() => {
    if (!latestResponseText || isMuted || !synthRef.current) return;

    synthRef.current.cancel();

    const speechText = latestResponseText
      .replace(/₹/g, "rupees ")
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');

    const utterance = new SpeechSynthesisUtterance(speechText);
    if (voiceSelected) {
      utterance.voice = voiceSelected;
    }
    
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setAvatarState("speaking");
    };

    utterance.onend = () => {
      setAvatarState("idle");
    };

    utterance.onerror = () => {
      setAvatarState("idle");
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [latestResponseText, isMuted, voiceSelected]);

  const toggleMute = () => {
    if (synthRef.current) {
      if (!isMuted) {
        synthRef.current.cancel();
        setAvatarState("idle");
      }
      setIsMuted(!isMuted);
    }
  };

  const meta = getStateMeta();

  function getStateMeta() {
    switch (avatarState) {
      case "speaking":
        return { text: "Speaking", color: "var(--color-ai)", class: "speaking" };
      case "thinking":
        return { text: "Analyzing Portfolio", color: "#9b51e0", class: "thinking" };
      case "listening":
        return { text: "Listening to Voice", color: "var(--color-success)", class: "listening" };
      case "warning":
        return { text: "Alert Triggered", color: "var(--color-danger)", class: "speaking" };
      case "happy":
        return { text: "Recommending", color: "var(--color-gold)", class: "speaking" };
      default:
        return { text: "Ready to Advise", color: "rgba(255,255,255,0.4)", class: "idle" };
    }
  }

  return (
    <div className="avatar-widget-container glass-panel">
      {/* Dynamic Animated Avatar Wrapper */}
      <div className={`avatar-view-wrapper ${meta.class}`}>
        <svg className="avatar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="avatarSkin" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="aiGlow" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00e5ff" />
              <stop offset="100%" stopColor="#4e89ff" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#aiGlow)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

          {/* Floating animated group containing the friendly robot assistant */}
          <g className="avatar-gently-float" style={{ transformOrigin: '50px 50px' }}>
            {/* Robot Headphone arch */}
            <path d="M 22,38 A 28,28 0 0,1 78,38" fill="none" stroke="#1e293b" strokeWidth="3" />

            {/* Left earphone capsule */}
            <rect x="18" y="32" width="7" height="20" rx="3.5" fill="#1e293b" />
            <circle cx="21.5" cy="42" r="1.5" fill="var(--color-primary)" />

            {/* Right earphone capsule */}
            <rect x="75" y="32" width="7" height="20" rx="3.5" fill="#1e293b" />
            <circle cx="78.5" cy="42" r="1.5" fill="var(--color-primary)" />

            {/* Neck connection */}
            <rect x="46" y="58" width="8" height="12" fill="#0f172a" rx="1" />

            {/* Robot shoulders / base chest */}
            <path d="M 24,70 Q 50,66 76,70 L 71,80 L 29,80 Z" fill="#1e293b" />

            {/* Bot head outer frame */}
            <rect x="25" y="22" width="50" height="42" rx="14" fill="url(#avatarSkin)" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

            {/* Inner glossy screen */}
            <rect x="28" y="25" width="44" height="36" rx="10" fill="#0b0e14" />

            {/* Rosy blush cheeks always on screen for friendliness */}
            <circle cx="35" cy="48" r="3" fill="#ff5e7e" opacity="0.35" />
            <circle cx="65" cy="48" r="3" fill="#ff5e7e" opacity="0.35" />

            {/* Friendly curved eyebrows */}
            <path d="M 33,33 Q 38,30 42,34" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <path d="M 67,33 Q 62,30 58,34" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />

            {/* Smiling mouth */}
            <path 
              className="avatar-mouth"
              d="M 43,49 Q 50,54 57,49" 
              fill="none" 
              stroke="var(--color-primary)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              style={{ 
                transformOrigin: '50px 49px',
                transition: 'transform 0.1s ease',
                d: avatarState === "speaking" ? "M 44,49 Q 50,56 56,49" : avatarState === "happy" ? "M 42,48 Q 50,56 58,48" : "M 43,49 Q 50,54 57,49"
              }} 
            />

            {/* Blinking eyes group */}
            <g className="avatar-eyes">
              <circle cx="38" cy="39" r="4.5" fill="var(--color-primary)" />
              <circle cx="38" cy="39" r="1.3" fill="#fff" transform="translate(-1, -1)" />
              <circle cx="62" cy="39" r="4.5" fill="var(--color-primary)" />
              <circle cx="62" cy="39" r="1.3" fill="#fff" transform="translate(-1, -1)" />
            </g>
          </g>
        </svg>
      </div>

      {/* Avatar Meta descriptions */}
      <div className="avatar-meta-tag">
        <Sparkles size={16} color="var(--color-gold)" className="avatar-meta-sparkle" />
        <span className="avatar-meta-name">{avatarName}</span>
      </div>
      
      <div className="avatar-status-row" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className={`avatar-badge-active-indicator ${avatarState === 'listening' ? 'listening' : ''}`}></span>
        <span className="avatar-status-text" style={{ color: meta.color }}>
          {meta.text}
        </span>
      </div>

      {/* Controls Row */}
      <div className="avatar-controls-row" style={{ display: 'flex', gap: '8px', marginTop: '0.75rem' }}>
        {/* Voice Toggle button */}
        <button className="voice-mute-toggle-btn" onClick={toggleMute} style={{ margin: 0 }}>
          {isMuted ? (
            <VolumeX size={12} color="var(--color-danger)" />
          ) : (
            <Volume2 size={12} color="var(--color-success)" />
          )}
          <span className="btn-label-text">Voice</span>
        </button>

        {/* Speak Toggle button */}
        <button 
          className="voice-mute-toggle-btn speak-toggle" 
          onClick={onToggleListening}
          style={{ 
            margin: 0,
            borderColor: isListening ? 'var(--color-success)' : 'var(--border-color)',
            background: isListening ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 255, 255, 0.04)',
            color: isListening ? 'var(--color-success)' : 'inherit'
          }}
          title={isListening ? "Listening... click to stop" : "Click to Speak"}
        >
          {isListening ? (
            <MicOff size={12} color="var(--color-success)" />
          ) : (
            <Mic size={12} />
          )}
          <span className="btn-label-text">{isListening ? "Listening" : "Speak"}</span>
        </button>
      </div>
    </div>
  );
};

export default AvatarView;
