import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

const AvatarView = ({ avatarName, latestResponseText, avatarState, setAvatarState, isMuted, setIsMuted }) => {
  const synthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  const [voiceSelected, setVoiceSelected] = useState(null);

  // Initialize and select a high-quality voice if available
  useEffect(() => {
    const loadVoices = () => {
      if (!synthRef.current) return;
      const voices = synthRef.current.getVoices();
      // Look for a high-quality English voice (Google US English, Microsoft Zira, etc.)
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

    // Cancel any active speech
    synthRef.current.cancel();

    // Clean text from emojis, special symbols for cleaner speech
    const speechText = latestResponseText
      .replace(/₹/g, "rupees ")
      .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');

    const utterance = new SpeechSynthesisUtterance(speechText);
    if (voiceSelected) {
      utterance.voice = voiceSelected;
    }
    
    // Speed adjustments
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

  // Handle manual mute toggle
  const toggleMute = () => {
    if (synthRef.current) {
      if (!isMuted) {
        synthRef.current.cancel();
        setAvatarState("idle");
      }
      setIsMuted(!isMuted);
    }
  };

  // Get color and title for current AI State
  const getStateMeta = () => {
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
  };

  const meta = getStateMeta();

  return (
    <div className="avatar-widget-container glass-panel">
      {/* Dynamic Animated Avatar Wrapper */}
      <div className={`avatar-view-wrapper ${meta.class}`}>
        <svg className="avatar-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Defs for gradients */}
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

          {/* Glowing background halo */}
          <circle cx="50" cy="50" r="46" fill="none" stroke="url(#aiGlow)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

          {/* Hair back shadow */}
          <path d="M 22,50 Q 50,15 78,50 Q 82,65 78,80 L 22,80 Q 18,65 22,50 Z" fill="#0f172a" />

          {/* Neck */}
          <rect x="44" y="65" width="12" height="15" fill="#1e293b" rx="4" />
          <path d="M 44,70 Q 50,75 56,70 L 56,80 L 44,80 Z" fill="#0f172a" opacity="0.4" />

          {/* Head base */}
          <circle cx="50" cy="48" r="24" fill="url(#avatarSkin)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Cheeks blush (happy state) */}
          {avatarState === 'happy' && (
            <>
              <circle cx="36" cy="54" r="3" fill="var(--color-danger)" opacity="0.25" />
              <circle cx="64" cy="54" r="3" fill="var(--color-danger)" opacity="0.25" />
            </>
          )}

          {/* Hair Front Cap */}
          <path d="M 24,42 Q 50,18 76,42 Q 74,32 64,28 Q 50,22 36,28 Q 26,32 24,42 Z" fill="url(#hairGrad)" />
          
          {/* Eyebrows */}
          <path d="M 32,38 Q 38,35 42,39" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />
          <path d="M 68,38 Q 62,35 58,39" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" />

          {/* Blinking Eyes */}
          <g className="avatar-eyes">
            <circle cx="37" cy="44" r="3" fill="var(--color-ai)" />
            <circle cx="37" cy="44" r="1" fill="#fff" transform="translate(-1, -1)" />
            <circle cx="63" cy="44" r="3" fill="var(--color-ai)" />
            <circle cx="63" cy="44" r="1" fill="#fff" transform="translate(-1, -1)" />
          </g>

          {/* Nose */}
          <path d="M 50,45 L 48,51 Q 50,53 52,51 Z" fill="#0f172a" opacity="0.6" />

          {/* Speaking/Idle Mouth */}
          <path 
            className="avatar-mouth"
            d="M 42,57 Q 50,57 58,57" 
            fill="none" 
            stroke="var(--color-ai)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            style={{ 
              transformOrigin: '50px 57px',
              transition: 'transform 0.1s ease',
              // Dynamic adjustments depending on status
              d: avatarState === "speaking" ? "M 44,57 Q 50,64 56,57" : avatarState === "happy" ? "M 43,55 Q 50,62 57,55" : "M 44,57 Q 50,57 56,57"
            }} 
          />

          {/* Glasses frame for "Advisor" look */}
          <circle cx="37" cy="44" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <circle cx="63" cy="44" r="7" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          <line x1="44" y1="44" x2="56" y2="44" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Avatar Meta descriptions */}
      <div className="avatar-meta-tag">
        <Sparkles size={16} color="var(--color-gold)" />
        <span>{avatarName}</span>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span className={`avatar-badge-active-indicator ${avatarState === 'listening' ? 'listening' : ''}`}></span>
        <span className="avatar-status-text" style={{ color: meta.color }}>
          {meta.text}
        </span>
      </div>

      {/* Voice Toggle button */}
      <button className="voice-mute-toggle-btn" onClick={toggleMute}>
        {isMuted ? (
          <>
            <VolumeX size={12} color="var(--color-danger)" />
            <span>Voice Muted</span>
          </>
        ) : (
          <>
            <Volume2 size={12} color="var(--color-success)" />
            <span>Voice Enabled</span>
          </>
        )}
      </button>
    </div>
  );
};

export default AvatarView;
