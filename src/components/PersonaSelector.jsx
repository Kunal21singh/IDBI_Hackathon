import React from 'react';

const PersonaSelector = ({ currentPersonaId, onSelect }) => {
  const personasList = [
    { id: "rohan", name: "Rohan (26)", role: "Engineer 💻", emoji: "🙋‍♂️" },
    { id: "priya", name: "Priya (35)", role: "Marketing 📈", emoji: "🙋‍♀️" },
    { id: "vikram", name: "Vikram (48)", role: "Business Owner 💼", emoji: "🧔" }
  ];

  return (
    <div className="persona-selector-container">
      <span className="persona-selector-label">Test Profile:</span>
      {personasList.map(p => (
        <button
          key={p.id}
          className={`persona-btn ${currentPersonaId === p.id ? 'active' : ''}`}
          onClick={() => onSelect(p.id)}
        >
          <span className="persona-emoji">{p.emoji}</span>
          <span>{p.name}</span>
          <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 400 }}>({p.role})</span>
        </button>
      ))}
    </div>
  );
};

export default PersonaSelector;
