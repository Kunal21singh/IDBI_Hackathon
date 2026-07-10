import React, { useEffect, useRef, useState } from 'react';
import { Send, Mic, MicOff, AlertCircle } from 'lucide-react';

const ChatInterface = ({ messages, onSendMessage, persona, avatarState, setAvatarState }) => {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [recognitionError, setRecognitionError] = useState(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Speech Recognition (STT)
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
          onSendMessage(transcript);
        }
      };

      rec.onerror = (e) => {
        console.error("STT Error: ", e);
        setRecognitionError("Failed to capture speech. Try typing!");
        setIsListening(false);
        setAvatarState("idle");
      };

      rec.onend = () => {
        setIsListening(false);
        if (avatarState === 'listening') {
          setAvatarState("idle");
        }
      };

      recognitionRef.current = rec;
    }
  }, [onSendMessage, avatarState]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText("");
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setRecognitionError("Speech-to-text not supported in this browser. Please use Chrome!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Get quick recommendation shortcuts for the active profile
  const getQuickReplies = () => {
    switch (persona.id) {
      case "rohan":
        return [
          { text: "Trim my dining expenses", prompt: "How can I cut dining out costs and save?" },
          { text: "What is my Cash Drag?", prompt: "What is my cash drag issue and how to resolve it?" },
          { text: "Show ELSS tax options", prompt: "How can I save ₹15,000 using ELSS tax funds?" }
        ];
      case "priya":
        return [
          { text: "Enable Auto-Sweep FD", prompt: "Explain the IDBI Auto-Sweep link FD for extra yield." },
          { text: "Accelerate Child Education goal", prompt: "How can I reach my Child Education goal 2 years early?" },
          { text: "PPF vs Balanced SIP", prompt: "Should I invest in PPF or Balanced Mutual Fund SIP?" }
        ];
      case "vikram":
        return [
          { text: "NPS tax saving deduction", prompt: "How can I save extra tax using Section 80CCD NPS?" },
          { text: "Prepay Business Loan vs Invest", prompt: "Should I prepay my business loan EMIs or invest?" },
          { text: "Set up FD Laddering", prompt: "Show me how to structure an FD laddering plan." }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="chat-widget-container glass-panel" style={{ padding: '1rem', flex: 1 }}>
      <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
        <h3>AI Financial Advisor Chat</h3>
      </div>
      
      {recognitionError && (
        <div style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          background: 'rgba(255, 94, 126, 0.1)', 
          border: '1px solid rgba(255, 94, 126, 0.2)', 
          padding: '6px 10px', 
          borderRadius: '8px',
          fontSize: '0.7rem',
          color: 'var(--color-danger)',
          marginBottom: '8px'
        }}>
          <AlertCircle size={12} />
          <span>{recognitionError}</span>
        </div>
      )}

      {/* Chat Messages Logs */}
      <div className="chat-history-log">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-bubble-wrapper ${m.sender}`}>
            <div className="chat-bubble">
              {m.text}
            </div>
            <span className="chat-bubble-timestamp">{m.time}</span>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Replies Recommendations Tray */}
      <div className="quick-replies-feed">
        {getQuickReplies().map((qr, idx) => (
          <button 
            key={idx} 
            className="quick-reply-btn"
            onClick={() => onSendMessage(qr.prompt)}
          >
            {qr.text}
          </button>
        ))}
      </div>

      {/* Text Input Row */}
      <form onSubmit={handleSend} className="chat-input-row">
        <input 
          type="text" 
          className="chat-input-text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? "Listening... Speak now!" : "Ask your financial avatar..."}
          disabled={isListening}
        />
        
        {/* Microphone Button (Speech recognition) */}
        <button 
          type="button" 
          className={`chat-voice-btn ${isListening ? 'listening' : ''}`}
          onClick={handleVoiceInput}
          title="Speak to Avatar"
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Send Button */}
        <button type="submit" className="chat-send-btn">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
