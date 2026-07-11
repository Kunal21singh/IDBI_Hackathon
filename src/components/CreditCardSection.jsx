import React, { useState } from 'react';
import { 
  CreditCard, 
  PlusCircle, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Lock, 
  Unlock, 
  Globe, 
  Wifi, 
  AlertCircle, 
  Calendar, 
  CheckCircle,
  TrendingDown,
  Info
} from 'lucide-react';

const CreditCardSection = ({ persona, onPayCreditCard, onLinkCreditCard }) => {
  const { creditCards = [], accounts = [] } = persona;
  
  const [selectedCardId, setSelectedCardId] = useState(creditCards[0]?.id || "");
  const [showAddCard, setShowAddCard] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentType, setPaymentType] = useState("full"); // "full", "min", "custom"
  const [selectedSourceAccount, setSelectedSourceAccount] = useState(accounts[0]?.name || "");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // New Card Form States
  const [newCardName, setNewCardName] = useState("");
  const [newCardNumber, setNewCardNumber] = useState("");
  const [newCardType, setNewCardType] = useState("Visa");
  const [newCardLimit, setNewCardLimit] = useState("");
  const [newCardBalance, setNewCardBalance] = useState("");
  const [newCardExpiry, setNewCardExpiry] = useState("");
  const [newCardRate, setNewCardRate] = useState("38.0");
  const [newCardDueDate, setNewCardDueDate] = useState("");

  const selectedCard = creditCards.find(c => c.id === selectedCardId) || creditCards[0];

  // Card Toggles (stored locally in UI state for simulation)
  const [cardToggles, setCardToggles] = useState({});

  const handleToggle = (cardId, field) => {
    setCardToggles(prev => {
      const current = prev[cardId] || { locked: false, online: true, intl: false };
      const updated = { ...current, [field]: !current[field] };
      
      // If locking, automatically turn off online/intl in visual state
      if (field === 'locked' && updated.locked) {
        updated.online = false;
        updated.intl = false;
      } else if (field === 'locked' && !updated.locked) {
        updated.online = true;
      }
      
      return {
        ...prev,
        [cardId]: updated
      };
    });
  };

  const getToggles = (cardId) => {
    return cardToggles[cardId] || { 
      locked: selectedCard?.status === 'locked' || false, 
      online: selectedCard?.onlineTx !== undefined ? selectedCard.onlineTx : true, 
      intl: selectedCard?.intlTx !== undefined ? selectedCard.intlTx : false 
    };
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!selectedCard) return;

    let amount = 0;
    if (paymentType === "full") {
      amount = selectedCard.balance;
    } else if (paymentType === "min") {
      amount = selectedCard.minDue;
    } else {
      amount = parseFloat(paymentAmount);
    }

    if (isNaN(amount) || amount <= 0) {
      setErrorMessage("Please enter a valid payment amount.");
      return;
    }

    if (amount > selectedCard.balance) {
      setErrorMessage("Payment amount cannot exceed the current outstanding balance.");
      return;
    }

    const sourceAcc = accounts.find(a => a.name === selectedSourceAccount);
    if (!sourceAcc || sourceAcc.balance < amount) {
      setErrorMessage(`Insufficient funds in ${selectedSourceAccount}. Available balance: ₹${(sourceAcc?.balance || 0).toLocaleString('en-IN')}`);
      return;
    }

    // Call the parent payment handler
    onPayCreditCard(selectedCard.id, amount, selectedSourceAccount);

    setPaymentSuccess(true);
    setErrorMessage("");
    setPaymentAmount("");
    
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 4000);
  };

  const handleLinkCardSubmit = (e) => {
    e.preventDefault();

    if (!newCardName || !newCardLimit || !newCardExpiry || !newCardDueDate) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    const limit = parseFloat(newCardLimit);
    const balance = parseFloat(newCardBalance || 0);

    if (isNaN(limit) || limit <= 0) {
      setErrorMessage("Please enter a valid credit limit.");
      return;
    }

    if (isNaN(balance) || balance < 0 || balance > limit) {
      setErrorMessage("Current balance must be between 0 and the credit limit.");
      return;
    }

    const cardNum = newCardNumber.trim() ? `**** ${newCardNumber.trim().slice(-4)}` : `**** ${Math.floor(1000 + Math.random() * 9000)}`;

    const gradients = [
      "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
      "linear-gradient(135deg, #004d40 0%, #00695c 100%)",
      "linear-gradient(135deg, #37474f 0%, #4f5b62 100%)",
      "linear-gradient(135deg, #4a148c 0%, #6a1b9a 100%)",
      "linear-gradient(135deg, #bf360c 0%, #d84315 100%)"
    ];
    const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

    const newCard = {
      id: `cc_custom_${Date.now()}`,
      name: newCardName,
      cardNumber: cardNum,
      cardType: newCardType,
      cardColor: randomGradient,
      limit: limit,
      availableLimit: limit - balance,
      balance: balance,
      dueDate: newCardDueDate,
      minDue: Math.round(balance * 0.05),
      rate: `${parseFloat(newCardRate).toFixed(1)}% APR`,
      status: "active",
      onlineTx: true,
      intlTx: false,
      transactions: []
    };

    onLinkCreditCard(newCard);

    // Reset Form
    setNewCardName("");
    setNewCardNumber("");
    setNewCardType("Visa");
    setNewCardLimit("");
    setNewCardBalance("");
    setNewCardExpiry("");
    setNewCardRate("38.0");
    setNewCardDueDate("");
    setShowAddCard(false);
    setErrorMessage("");

    setSelectedCardId(newCard.id);
  };

  const getCardLogo = (type) => {
    switch (type.toLowerCase()) {
      case "visa":
        return <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '1rem', color: '#00e5ff' }}>VISA</span>;
      case "mastercard":
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ff5e7e', marginRight: '-4px', opacity: 0.9 }}></span>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ffa62f', opacity: 0.9 }}></span>
          </div>
        );
      case "amex":
        return <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', color: '#00e676', border: '1px solid #00e676', padding: '1px 3px', borderRadius: '3px' }}>AMEX</span>;
      default:
        return <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#ffa62f' }}>RuPay</span>;
    }
  };

  return (
    <div className="panel-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Upper Area: Carousel or selector of cards */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CreditCard size={18} color="var(--color-primary)" />
            Linked Credit Cards
          </h3>
          <button 
            onClick={() => setShowAddCard(!showAddCard)} 
            className="view-toggle-btn active"
            style={{ padding: '4px 10px', fontSize: '0.72rem', borderRadius: '12px' }}
          >
            <PlusCircle size={13} />
            <span>Link New Card</span>
          </button>
        </div>

        {/* Link Card Form Toggle */}
        {showAddCard && (
          <form onSubmit={handleLinkCardSubmit} className="glass-panel-glow" style={{ padding: '1rem', marginBottom: '1rem', background: 'rgba(18, 25, 41, 0.9)', border: '1px solid rgba(0, 229, 255, 0.2)' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--color-ai)' }}>Link a Credit Card</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.72rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Card Name (e.g. HDFC Regalia)</label>
                <input 
                  type="text" 
                  value={newCardName} 
                  onChange={e => setNewCardName(e.target.value)} 
                  placeholder="Card Name"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Card Number (Last 4 Digits or Full)</label>
                <input 
                  type="text" 
                  value={newCardNumber} 
                  onChange={e => setNewCardNumber(e.target.value)} 
                  placeholder="e.g. 5234"
                  maxLength={16}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Card Issuer / Network</label>
                <select 
                  value={newCardType} 
                  onChange={e => setNewCardType(e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                >
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                  <option value="RuPay">RuPay</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Credit Limit (₹)</label>
                <input 
                  type="number" 
                  value={newCardLimit} 
                  onChange={e => setNewCardLimit(e.target.value)} 
                  placeholder="Limit in ₹"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Current Outstanding Balance (₹)</label>
                <input 
                  type="number" 
                  value={newCardBalance} 
                  onChange={e => setNewCardBalance(e.target.value)} 
                  placeholder="Outstanding dues in ₹"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Expiry Date (MM/YY)</label>
                <input 
                  type="text" 
                  value={newCardExpiry} 
                  onChange={e => setNewCardExpiry(e.target.value)} 
                  placeholder="08/29"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Card APR Interest Rate (%)</label>
                <input 
                  type="number" 
                  value={newCardRate} 
                  onChange={e => setNewCardRate(e.target.value)} 
                  placeholder="e.g. 38.0"
                  step="0.1"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label>Payment Due Date</label>
                <input 
                  type="date" 
                  value={newCardDueDate} 
                  onChange={e => setNewCardDueDate(e.target.value)} 
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white' }}
                  required
                />
              </div>

            </div>

            {errorMessage && <div style={{ color: 'var(--color-danger)', fontSize: '0.7rem', marginTop: '0.5rem' }}>{errorMessage}</div>}
            
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => setShowAddCard(false)} 
                className="view-toggle-btn"
                style={{ fontSize: '0.72rem', padding: '4px 12px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="view-toggle-btn active"
                style={{ fontSize: '0.72rem', padding: '4px 12px', border: '1px solid var(--color-ai)' }}
              >
                Link Card
              </button>
            </div>
          </form>
        )}

        {/* Scrollable list of card thumbnails */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {creditCards.map(card => {
            const isSelected = card.id === selectedCardId;
            return (
              <div 
                key={card.id}
                onClick={() => {
                  setSelectedCardId(card.id);
                  setErrorMessage("");
                }}
                style={{ 
                  flex: '0 0 160px',
                  borderRadius: '12px',
                  background: card.cardColor || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid var(--color-ai)' : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: isSelected ? 'var(--shadow-glow-ai)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '95px',
                  transition: 'all 0.2s ease',
                  opacity: getToggles(card.id).locked ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                    {card.name}
                  </span>
                  {getCardLogo(card.cardType)}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.5px' }}>Outstanding Dues</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: card.balance > 0 ? '#ff5e7e' : '#00e676' }}>
                    ₹{card.balance.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)' }}>
                  <span>{card.cardNumber}</span>
                  {getToggles(card.id).locked && <span style={{ color: 'var(--color-danger)', fontWeight: 700 }}>LOCKED</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCard ? (
        <>
          {/* Main Visual Credit Card & Details Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            
            {/* Visual Card Display Card */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'center' }}>
              <div style={{
                width: '100%',
                aspectRatio: '1.58 / 1',
                borderRadius: '16px',
                background: selectedCard.cardColor || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                padding: '1.25rem',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                opacity: getToggles(selectedCard.id).locked ? 0.6 : 1
              }}>
                {/* Glossy overlay sheen */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  left: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 80%)',
                  pointerEvents: 'none'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', letterSpacing: '0.5px' }}>{selectedCard.name}</span>
                    <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.6)' }}>IDBI Smart Wealth Link</span>
                  </div>
                  {getCardLogo(selectedCard.cardType)}
                </div>

                {/* Golden Contactless Chip */}
                <div style={{
                  width: '32px',
                  height: '24px',
                  background: 'linear-gradient(135deg, #ffd54f 0%, #ffb300 100%)',
                  borderRadius: '4px',
                  position: 'relative',
                  border: '1px solid rgba(0,0,0,0.1)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '2px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-around', height: '100%' }}>
                    <span style={{ width: '1px', background: 'rgba(0,0,0,0.15)' }}></span>
                    <span style={{ width: '1px', background: 'rgba(0,0,0,0.15)' }}></span>
                    <span style={{ width: '1px', background: 'rgba(0,0,0,0.15)' }}></span>
                  </div>
                </div>

                <div style={{ zIndex: 1 }}>
                  <div style={{ 
                    fontSize: '1.1rem', 
                    fontWeight: 700, 
                    color: 'white', 
                    letterSpacing: '2px', 
                    fontFamily: 'monospace',
                    marginBottom: '4px'
                  }}>
                    {selectedCard.cardNumber}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Card Holder</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white' }}>{persona.name}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Expires</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'white' }}>{selectedCard.expiry}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Limit utilization progress meter */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.72rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                  <span>Credit Limit Utilization</span>
                  <span>{Math.round((selectedCard.balance / selectedCard.limit) * 100)}% Used</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${Math.min(100, Math.round((selectedCard.balance / selectedCard.limit) * 100))}%`, 
                    height: '100%', 
                    background: selectedCard.balance / selectedCard.limit > 0.3 ? 'var(--color-danger)' : 'var(--color-success)',
                    borderRadius: '3px'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <span>Limit: ₹{selectedCard.limit.toLocaleString('en-IN')}</span>
                  <span>Available: ₹{selectedCard.availableLimit.toLocaleString('en-IN')}</span>
                </div>

                {selectedCard.balance / selectedCard.limit > 0.3 && (
                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 94, 126, 0.05)', padding: '6px', borderRadius: '8px', border: '1px solid rgba(255, 94, 126, 0.1)', marginTop: '4px' }}>
                    <AlertCircle size={12} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.3 }}>
                      Utilization is above 30%. Keeping this below 30% helps maintain or improve your credit rating.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Pay Dues & Dues Overview Panel */}
            <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="var(--color-primary)" />
                Outstanding Dues Detail
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Outstanding Balance</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: selectedCard.balance > 0 ? 'var(--color-danger)' : 'var(--color-success)', margin: '2px 0' }}>
                    ₹{selectedCard.balance.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Interest Rate: {selectedCard.rate}</span>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>Payment Due Date</span>
                  <span style={{ fontSize: '1.0rem', fontWeight: 700, color: 'white', margin: '4px 0' }}>
                    {selectedCard.dueDate}
                  </span>
                  <span style={{ 
                    fontSize: '0.58rem', 
                    fontWeight: 700, 
                    color: selectedCard.balance === 0 ? 'var(--color-success)' : 'var(--color-warning)'
                  }}>
                    {selectedCard.balance === 0 ? 'Fully Paid' : 'Dues Pending'}
                  </span>
                </div>
              </div>

              {selectedCard.balance > 0 ? (
                <form onSubmit={handlePaymentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pay Credit Card Dues</span>
                  
                  {/* Select Payment Type */}
                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.65rem' }}>
                    <label style={{ flex: 1, background: paymentType === 'full' ? 'rgba(0,229,255,0.08)' : 'rgba(0,0,0,0.1)', border: paymentType === 'full' ? '1px solid var(--color-ai)' : '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', cursor: 'pointer', textAlign: 'center', fontWeight: 600 }}>
                      <input 
                        type="radio" 
                        name="payType" 
                        checked={paymentType === "full"} 
                        onChange={() => setPaymentType("full")} 
                        style={{ display: 'none' }} 
                      />
                      Full Due (₹{selectedCard.balance.toLocaleString('en-IN')})
                    </label>
                    <label style={{ flex: 1, background: paymentType === 'min' ? 'rgba(0,229,255,0.08)' : 'rgba(0,0,0,0.1)', border: paymentType === 'min' ? '1px solid var(--color-ai)' : '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', cursor: 'pointer', textAlign: 'center', fontWeight: 600 }}>
                      <input 
                        type="radio" 
                        name="payType" 
                        checked={paymentType === "min"} 
                        onChange={() => setPaymentType("min")} 
                        style={{ display: 'none' }} 
                      />
                      Min Due (₹{selectedCard.minDue.toLocaleString('en-IN')})
                    </label>
                    <label style={{ flex: 1, background: paymentType === 'custom' ? 'rgba(0,229,255,0.08)' : 'rgba(0,0,0,0.1)', border: paymentType === 'custom' ? '1px solid var(--color-ai)' : '1px solid var(--border-color)', borderRadius: '6px', padding: '6px', cursor: 'pointer', textAlign: 'center', fontWeight: 600 }}>
                      <input 
                        type="radio" 
                        name="payType" 
                        checked={paymentType === "custom"} 
                        onChange={() => setPaymentType("custom")} 
                        style={{ display: 'none' }} 
                      />
                      Custom
                    </label>
                  </div>

                  {paymentType === "custom" && (
                    <input 
                      type="number" 
                      value={paymentAmount} 
                      onChange={e => setPaymentAmount(e.target.value)} 
                      placeholder="Enter amount in ₹"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '0.72rem' }}
                      required
                    />
                  )}

                  {/* Select Source Account */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.65rem' }}>
                    <label style={{ color: 'var(--text-secondary)' }}>Pay From Linked Account</label>
                    <select 
                      value={selectedSourceAccount} 
                      onChange={e => setSelectedSourceAccount(e.target.value)}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '6px 8px', color: 'white', fontSize: '0.72rem' }}
                    >
                      {accounts.map((acc, i) => (
                        <option key={i} value={acc.name}>
                          {acc.name} (Balance: ₹{acc.balance.toLocaleString('en-IN')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {errorMessage && <div style={{ color: 'var(--color-danger)', fontSize: '0.65rem', margin: '2px 0' }}>{errorMessage}</div>}

                  <button 
                    type="submit" 
                    className="view-toggle-btn active"
                    disabled={getToggles(selectedCard.id).locked}
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      borderRadius: '8px', 
                      fontSize: '0.78rem',
                      justifyContent: 'center',
                      background: 'linear-gradient(90deg, var(--color-primary) 0%, #6897ff 100%)',
                      border: 'none',
                      color: 'white',
                      fontWeight: 700,
                      cursor: getToggles(selectedCard.id).locked ? 'not-allowed' : 'pointer',
                      opacity: getToggles(selectedCard.id).locked ? 0.5 : 1
                    }}
                  >
                    Confirm Bill Payment
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(0, 230, 118, 0.03)', border: '1px solid rgba(0, 230, 118, 0.12)', borderRadius: '12px', flex: 1 }}>
                  <CheckCircle size={32} color="var(--color-success)" style={{ marginBottom: '8px' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'white' }}>No Outstanding Balance!</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '2px' }}>
                    You have paid all dues on this card. Keep it up!
                  </span>
                </div>
              )}

              {paymentSuccess && (
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(0, 230, 118, 0.08)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(0, 230, 118, 0.2)', alignItems: 'center' }}>
                  <CheckCircle size={16} color="var(--color-success)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.7rem', color: 'white', fontWeight: 600 }}>Payment successfully credited! Dues cleared.</span>
                </div>
              )}

            </div>

          </div>

          {/* Card Features Controls / Security Panel */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={15} color="var(--color-primary)" />
              Card Controls & Security
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.72rem' }}>
              
              {/* Lock card toggle */}
              <div 
                onClick={() => handleToggle(selectedCard.id, 'locked')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 12px', 
                  background: getToggles(selectedCard.id).locked ? 'rgba(255, 94, 126, 0.05)' : 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {getToggles(selectedCard.id).locked ? <Lock size={16} color="var(--color-danger)" /> : <Unlock size={16} color="var(--color-success)" />}
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>Lock Card</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Temporarily block card</span>
                  </div>
                </div>
                <div style={{
                  width: '28px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: getToggles(selectedCard.id).locked ? 'var(--color-danger)' : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  padding: '2px',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    marginLeft: getToggles(selectedCard.id).locked ? '12px' : '0px',
                    transition: 'margin-left 0.2s'
                  }}></div>
                </div>
              </div>

              {/* Online Transactions toggle */}
              <div 
                onClick={() => !getToggles(selectedCard.id).locked && handleToggle(selectedCard.id, 'online')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 12px', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: getToggles(selectedCard.id).locked ? 'not-allowed' : 'pointer',
                  opacity: getToggles(selectedCard.id).locked ? 0.4 : 1
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Wifi size={16} color="var(--color-primary)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>Online Usage</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>E-commerce transactions</span>
                  </div>
                </div>
                <div style={{
                  width: '28px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: getToggles(selectedCard.id).online ? 'var(--color-success)' : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  padding: '2px',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    marginLeft: getToggles(selectedCard.id).online ? '12px' : '0px',
                    transition: 'margin-left 0.2s'
                  }}></div>
                </div>
              </div>

              {/* International usage toggle */}
              <div 
                onClick={() => !getToggles(selectedCard.id).locked && handleToggle(selectedCard.id, 'intl')}
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 12px', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  cursor: getToggles(selectedCard.id).locked ? 'not-allowed' : 'pointer',
                  opacity: getToggles(selectedCard.id).locked ? 0.4 : 1
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Globe size={16} color="var(--color-gold)" />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 700, color: 'white' }}>International</span>
                    <span style={{ fontSize: '0.58rem', color: 'var(--text-muted)' }}>Foreign transaction approval</span>
                  </div>
                </div>
                <div style={{
                  width: '28px',
                  height: '16px',
                  borderRadius: '8px',
                  backgroundColor: getToggles(selectedCard.id).intl ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)',
                  position: 'relative',
                  padding: '2px',
                  transition: 'background-color 0.2s'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    marginLeft: getToggles(selectedCard.id).intl ? '12px' : '0px',
                    transition: 'margin-left 0.2s'
                  }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Card Specific Transactions Log */}
          <div className="glass-panel" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h4 style={{ margin: 0, color: 'white' }}>Card Transactions ({selectedCard.name})</h4>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Linked statements fetched</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedCard.transactions && selectedCard.transactions.length > 0 ? (
                selectedCard.transactions.map((tx) => {
                  const isCredit = tx.type === 'credit' || tx.amount > 0;
                  return (
                    <div 
                      key={tx.id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '8px 12px', 
                        background: 'rgba(255,255,255,0.01)', 
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px' 
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: isCredit ? 'rgba(0, 230, 118, 0.08)' : 'rgba(255, 94, 126, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isCredit ? <ArrowUpRight size={16} color="var(--color-success)" /> : <ArrowDownLeft size={16} color="var(--color-danger)" />}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'white' }}>{tx.desc}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{tx.date} • {tx.category}</span>
                        </div>
                      </div>
                      <span style={{ 
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.85rem', 
                        fontWeight: 700, 
                        color: isCredit ? '#00e676' : '#ff5e7e' 
                      }}>
                        {isCredit ? "+" : "-"}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.75rem', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '8px', justifyContent: 'center' }}>
                  <Info size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No recent card transactions detected.</span>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <CreditCard size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <span style={{ color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>No Credit Card Linked</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textAlign: 'center', marginTop: '4px', maxWidth: '280px' }}>
            Get started by linking your cards to track interest rates, payments, and limit utilization.
          </span>
          <button 
            onClick={() => setShowAddCard(true)}
            className="view-toggle-btn active"
            style={{ marginTop: '1rem', padding: '6px 14px', borderRadius: '16px' }}
          >
            Link Credit Card
          </button>
        </div>
      )}

    </div>
  );
};

export default CreditCardSection;
