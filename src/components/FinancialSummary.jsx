import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, TrendingUp, ShieldAlert } from 'lucide-react';

const FinancialSummary = ({ persona, onQuickPrompt, onOpenSyncModal }) => {
  const { metrics, accounts, riskProfile, riskScore, liabilities = [] } = persona;
  
  // Calculate consolidated financial sums
  const totalAssets = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, l) => sum + l.balance, 0);
  const netWorthCalculated = totalAssets - totalLiabilities;
  const debtRatio = totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;

  // Format asset allocation data for Recharts Pie
  const assetData = accounts.map((acc, index) => {
    let name = acc.name.replace(" Account (IDBI)", "").replace(" (IDBI)", "");
    return {
      name,
      value: acc.balance,
      rate: acc.rate
    };
  });

  const COLORS = ['#4e89ff', '#00e676', '#ffa62f', '#ffc107', '#9b51e0'];

  return (
    <div className="panel-content-area" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Metrics Row (3-Column Grid) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', 
        gap: '0.75rem' 
      }}>
        
        {/* Net Worth */}
        <div className="glass-panel" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Total Net Worth</span>
          <span className="networth-glow-val" style={{ fontSize: '1.3rem', margin: '2px 0' }}>
            ₹{netWorthCalculated.toLocaleString('en-IN')}
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', fontSize: '0.62rem', marginTop: '2px' }}>
            <span style={{ color: 'var(--color-success)' }}>A: ₹{(totalAssets/1000).toFixed(0)}k</span>
            <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
            <span style={{ color: 'var(--color-danger)' }}>D: ₹{(totalLiabilities/1000).toFixed(0)}k</span>
          </div>
        </div>

        {/* Debt-To-Asset Ratio */}
        <div className="glass-panel" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Debt / Asset Ratio</span>
          <span style={{ 
            fontSize: '1.3rem', 
            fontWeight: 700, 
            color: totalLiabilities > 0 && debtRatio > 35 ? 'var(--color-danger)' : debtRatio > 0 ? 'var(--color-warning)' : 'var(--color-success)',
            margin: '2px 0' 
          }}>
            {debtRatio}%
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>
            {debtRatio === 0 ? 'Debt Free!' : debtRatio > 35 ? 'High Leverage' : 'Healthy Range'}
          </span>
        </div>

        {/* Risk Appetite */}
        <div className="glass-panel" style={{ padding: '0.85rem', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>Risk Profile</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-primary)', margin: '2px 0' }}>
            {riskProfile}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>Score: {riskScore}/100</span>
        </div>

      </div>

      {/* CAMS / KRA Sync Banner for Actual User */}
      {persona.id === 'actual' && (
        <div 
          className="glass-panel-glow" 
          style={{ 
            padding: '1rem', 
            background: 'radial-gradient(circle at 10% 20%, rgba(78, 137, 255, 0.08) 0%, rgba(18, 25, 41, 0.7) 90%)',
            border: '1px solid rgba(78, 137, 255, 0.25)',
            display: 'flex', 
            gap: '0.75rem', 
            alignItems: 'center',
            cursor: 'pointer' 
          }}
          onClick={onOpenSyncModal}
        >
          <div style={{ padding: '6px', background: 'rgba(78, 137, 255, 0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <TrendingUp size={18} color="var(--color-primary)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Link Portfolios via CAMS / KRA</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
              Fetch outside mutual funds & stock folios automatically. Sync now to enable active advice.
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', background: 'var(--color-primary)', color: 'white', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
            Sync
          </div>
        </div>
      )}

      {/* Cash Drag Alert */}
      {metrics.cashDrag > 0 && (
        <div 
          className="glass-panel-glow" 
          style={{ 
            padding: '1rem', 
            background: 'rgba(255, 166, 47, 0.04)', 
            display: 'flex', 
            gap: '0.75rem', 
            alignItems: 'flex-start',
            cursor: 'pointer' 
          }}
          onClick={() => onQuickPrompt("What is my cash drag issue and how to resolve it?")}
        >
          <div style={{ padding: '4px', background: 'rgba(255, 166, 47, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <AlertTriangle size={18} color="var(--color-warning)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>Inflation Cash Drag Detected!</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
              You have ₹{metrics.cashDrag.toLocaleString('en-IN')} sitting in low-yield savings. Switch to IDBI Auto-Sweep to earn up to 7.1%. Click to ask Avatar.
            </span>
          </div>
        </div>
      )}

      {/* High Debt Liability Warning */}
      {totalLiabilities > 0 && debtRatio > 35 && (
        <div 
          className="glass-panel-glow" 
          style={{ 
            padding: '1rem', 
            background: 'rgba(255, 94, 126, 0.04)', 
            display: 'flex', 
            gap: '0.75rem', 
            alignItems: 'flex-start',
            cursor: 'pointer',
            border: '1px solid rgba(255, 94, 126, 0.15)'
          }}
          onClick={() => onQuickPrompt("How should I pay off my debts? Show me a debt pay-off strategy.")}
        >
          <div style={{ padding: '4px', background: 'rgba(255, 94, 126, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center' }}>
            <ShieldAlert size={18} color="var(--color-danger)" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>High Debt Leverage Alert!</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>
              Your debt represents {debtRatio}% of your total assets. We recommend allocating surplus returns to clear credit card dues. Click to ask Avatar for repayment strategies.
            </span>
          </div>
        </div>
      )}

      {/* Asset Allocation Pie Chart */}
      {totalAssets > 0 && (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
            <h3>Asset Allocation</h3>
          </div>
          <div className="assets-allocation-pie-panel">
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={assetData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {assetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                    contentStyle={{ background: '#0b0e14', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', width: '100%', marginTop: '0.5rem' }}>
              {assetData.map((asset, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span style={{ color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {asset.name} ({(asset.value / totalAssets * 100).toFixed(0)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account Balances List */}
      <div className="glass-panel" style={{ padding: '1rem' }}>
        <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
          <h3>Linked Accounts (Assets)</h3>
        </div>
        <div className="accounts-cards-grid">
          {accounts.map((acc, index) => (
            <div key={index} className="account-mini-card">
              <div className="account-mini-card-left">
                <span className="account-mini-card-name">{acc.name}</span>
                <span className="account-mini-card-rate">Yield: {acc.rate}</span>
              </div>
              <span className="account-mini-card-bal">₹{acc.balance.toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Liabilities list rendering */}
      {liabilities.length > 0 && (
        <div className="glass-panel" style={{ padding: '1rem' }}>
          <div className="card-title-group" style={{ marginBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--color-danger)' }}>Outstanding Liabilities</h3>
          </div>
          <div className="accounts-cards-grid">
            {liabilities.map((l, index) => (
              <div 
                key={index} 
                className="account-mini-card" 
                style={{ borderLeft: '3px solid var(--color-danger)' }}
              >
                <div className="account-mini-card-left">
                  <span className="account-mini-card-name" style={{ color: 'white' }}>{l.name}</span>
                  <span className="account-mini-card-rate" style={{ color: 'var(--text-muted)' }}>
                    Rate: {l.rate} • {l.type}
                  </span>
                </div>
                <span className="account-mini-card-bal" style={{ color: 'var(--color-danger)' }}>
                  - ₹{l.balance.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default FinancialSummary;
