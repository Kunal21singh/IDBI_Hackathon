import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { CreditCard, ShieldAlert, Award, ShoppingBag, PlusCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const SpendingInsights = ({ persona, onQuickPrompt }) => {
  const { spendingCategories, spendingTrend, behaviorBadges, recentTransactions } = persona;

  // Custom colors for Recharts Bar
  const trendData = spendingTrend.map(t => ({
    ...t,
    Expenses: t.expenses,
    Investments: t.investments
  }));

  const getBadgeIcon = (type) => {
    switch (type) {
      case "danger":
        return <ShieldAlert size={16} color="var(--color-danger)" />;
      case "warning":
        return <ShieldAlert size={16} color="var(--color-warning)" />;
      default:
        return <Award size={16} color="var(--color-success)" />;
    }
  };

  return (
    <div className="panel-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Trend Bar Chart */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
          <h3>Spend vs Invest Trend</h3>
        </div>
        <div style={{ width: '100%', height: 170 }}>
          <ResponsiveContainer>
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
              <Tooltip 
                formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                contentStyle={{ background: '#0b0e14', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
              <Bar dataKey="Expenses" fill="var(--color-danger)" opacity={0.8} radius={[4, 4, 0, 0]} />
              <Bar dataKey="Investments" fill="var(--color-success)" opacity={0.8} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Behavioral Badges / AI Insights Alerts */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
          <h3>AI Spending Behavior Analysis</h3>
        </div>
        <span className="card-subtitle-desc" style={{ display: 'block', marginTop: '-4px' }}>
          Real-time pattern tracking based on transaction categorization
        </span>
        <div className="behavior-badges-scroll">
          {behaviorBadges.map((badge, idx) => (
            <div 
              key={idx} 
              className={`behavior-badge-item ${badge.type}`}
              onClick={() => onQuickPrompt(badge.title.includes("Shopping") ? "How can I cut dining out costs and save?" : "What is my cash drag issue and how to resolve it?")}
              style={{ cursor: 'pointer' }}
            >
              <div className="behavior-badge-icon-wrap">
                {getBadgeIcon(badge.type)}
              </div>
              <div className="behavior-badge-body">
                <span className="behavior-badge-title">{badge.title}</span>
                <span className="behavior-badge-desc">{badge.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transaction Log */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
          <h3>Recent Transactions</h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {recentTransactions.map((tx) => {
            const isDebit = tx.type === 'debit';
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
                    background: isDebit ? 'rgba(255, 94, 126, 0.08)' : 'rgba(0, 230, 118, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isDebit ? <ArrowDownLeft size={16} color="var(--color-danger)" /> : <ArrowUpRight size={16} color="var(--color-success)" />}
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
                  color: isDebit ? '#ff5e7e' : '#00e676' 
                }}>
                  {isDebit ? "-" : "+"}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SpendingInsights;
