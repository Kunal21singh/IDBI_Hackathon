import React, { useEffect, useRef, useState } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

const ChatInterface = ({ messages, onSendMessage, persona, isListening, onToggleListening }) => {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef(null);

  // Auto-scroll chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText, true);
      setInputText("");
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
      case "actual":
        return [
          { text: "Analyze outside assets", prompt: "I successfully synced my CAMS folio statement. Estimated value of external schemes is ₹5,63,300. Please analyze my allocation." },
          { text: "Auto-Sweep FD Interest", prompt: "Explain the IDBI Auto-Sweep link FD for extra yield." },
          { text: "Risk Profiling Form", prompt: "I want to take the risk profiling assessment quiz." }
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
            onClick={() => onSendMessage(qr.prompt, true)}
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
        
        {/* Microphone Button linking to globally managed STT */}
        <button 
          type="button" 
          className={`chat-voice-btn ${isListening ? 'listening' : ''}`}
          onClick={onToggleListening}
          title={isListening ? "Stop listening" : "Speak to Advisor"}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        {/* Send Button */}
        <button type="submit" className="chat-send-btn" disabled={isListening}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
