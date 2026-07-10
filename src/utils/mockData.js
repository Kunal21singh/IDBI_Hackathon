export const PERSONAS = {
  rohan: {
    id: "rohan",
    name: "Rohan Sharma",
    age: 26,
    profession: "Software Engineer",
    avatarName: "Aria - Growth Strategist",
    initialGreeting: "Hey Rohan! I notice you've got some heavy food delivery transactions this month, and ₹1,80,000 sitting in your savings account is losing value to inflation. Let's redirect that cash drag into a high-growth SIP! What do you think?",
    riskProfile: "Aggressive",
    riskScore: 78,
    metrics: {
      netWorth: 680000,
      monthlyIncome: 120000,
      monthlyExpenses: 85000,
      monthlySavings: 35000,
      cashDrag: 180000
    },
    accounts: [
      { name: "Savings Account (IDBI)", balance: 220000, rate: "3.5%" },
      { name: "Mutual Funds (Equity)", balance: 310000, rate: "14.2% YTD" },
      { name: "Cryptocurrency / High Risk", balance: 90000, rate: "24.5% YTD" },
      { name: "Digital Gold", balance: 60000, rate: "9.8% YTD" }
    ],
    spendingCategories: [
      { name: "Food & Dining", value: 32000, color: "#FF5E7E" },
      { name: "Rent & Utilities", value: 25000, color: "#4E89FF" },
      { name: "Shopping (Impulsive)", value: 18000, color: "#FFA62F" },
      { name: "Entertainment", value: 10000, color: "#9B51E0" },
      { name: "Investments (SIP)", value: 35000, color: "#00E676" }
    ],
    spendingTrend: [
      { month: "Jan", expenses: 72000, investments: 20000 },
      { month: "Feb", expenses: 78000, investments: 20000 },
      { month: "Mar", expenses: 84000, investments: 25000 },
      { month: "Apr", expenses: 81000, investments: 25000 },
      { month: "May", expenses: 89000, investments: 30000 },
      { month: "Jun", expenses: 85000, investments: 35000 }
    ],
    behaviorBadges: [
      { title: "Impulsive Shopping Spike", type: "warning", desc: "Your shopping expenditures increased by 42% last week, mostly between 10 PM and 12 AM." },
      { title: "Cash Drag Warning", type: "danger", desc: "Over 60% of your liquid net worth is sitting in a low-interest savings account. You are losing ₹1,200/month in interest potential." },
      { title: "Consistent Saver", type: "success", desc: "You have maintained your savings rate above 25% for 4 consecutive months. Keep it up!" }
    ],
    goals: [
      { id: "car", name: "Buy a SUV", target: 1200000, current: 400000, sip: 15000, duration: 36, progress: 33 },
      { id: "trip", name: "Europe Vacation", target: 300000, current: 150000, sip: 10000, duration: 12, progress: 50 }
    ],
    recentTransactions: [
      { id: 1, date: "2026-07-09", desc: "Zomato Premium", category: "Food & Dining", amount: -1450, type: "debit" },
      { id: 2, date: "2026-07-08", desc: "Amazon Pay - Electronics", category: "Shopping (Impulsive)", amount: -12999, type: "debit" },
      { id: 3, date: "2026-07-05", desc: "Salary Credit (IDBI Bank)", category: "Income", amount: 120000, type: "credit" },
      { id: 4, date: "2026-07-03", desc: "Nifty 50 Index SIP", category: "Investments (SIP)", amount: -15000, type: "debit" },
      { id: 5, date: "2026-07-02", desc: "Netflix Subscription", category: "Entertainment", amount: -649, type: "debit" }
    ],
    advisoryTips: [
      "Cancel unused subscriptions: We noticed automated recurring charges for 3 streaming platforms you haven't opened in 45 days. Potential saving: ₹1,500/month.",
      "Redirect your shopping budget: Moving ₹5,000 from Shopping to your Nifty Growth Mutual Fund SIP could speed up your 'Buy a SUV' goal by 5 months.",
      "Tax saving optimization: You have not fully utilized your Section 80C limit. Investing ₹50,000 in IDBI ELSS tax saver fund will save you ₹15,450 in tax."
    ]
  },
  priya: {
    id: "priya",
    name: "Priya Nair",
    age: 35,
    profession: "Marketing Manager",
    avatarName: "Leo - Balanced Planner",
    initialGreeting: "Hello Priya. I've updated your wealth overview. You have ₹4,50,000 lying idle in your savings. By moving ₹3,00,000 into a liquid mutual fund and setting up an auto-sweep, we can increase your yield from 3.5% to 7.2% with zero lock-in. Shall we set it up?",
    riskProfile: "Moderate",
    riskScore: 52,
    metrics: {
      netWorth: 2450000,
      monthlyIncome: 180000,
      monthlyExpenses: 90000,
      monthlySavings: 90000,
      cashDrag: 450000
    },
    accounts: [
      { name: "Savings Account (IDBI)", balance: 650000, rate: "3.5%" },
      { name: "Fixed Deposit (IDBI)", balance: 800000, rate: "7.1%" },
      { name: "Balanced Mutual Funds", balance: 750000, rate: "11.5% YTD" },
      { name: "Public Provident Fund (PPF)", balance: 250000, rate: "7.1%" }
    ],
    spendingCategories: [
      { name: "Rent & Utilities", value: 35000, color: "#4E89FF" },
      { name: "Child Education", value: 20000, color: "#9B51E0" },
      { name: "Food & Groceries", value: 18000, color: "#FF5E7E" },
      { name: "Insurance Premiums", value: 7000, color: "#FFA62F" },
      { name: "Investments (PPF/SIP)", value: 90000, color: "#00E676" }
    ],
    spendingTrend: [
      { month: "Jan", expenses: 82000, investments: 70000 },
      { month: "Feb", expenses: 80000, investments: 75000 },
      { month: "Mar", expenses: 85000, investments: 80000 },
      { month: "Apr", expenses: 88000, investments: 80000 },
      { month: "May", expenses: 92000, investments: 85000 },
      { month: "Jun", expenses: 90000, investments: 90000 }
    ],
    behaviorBadges: [
      { title: "Liquidity Master", type: "success", desc: "You maintain a robust 6-month emergency buffer. Your family safety net is highly secure." },
      { title: "Inflation Leak", type: "warning", desc: "Your cash drag has reached ₹4.5L, which means inflation is eroding about ₹27,000 of your buying power annually." },
      { title: "Disciplined Investor", type: "success", desc: "Your SIPs execute automatically within 24 hours of salary credit, maximizing compounding time." }
    ],
    goals: [
      { id: "education", name: "Child Higher Education", target: 4000000, current: 1200000, sip: 30000, duration: 120, progress: 30 },
      { id: "home", name: "Home Downpayment", target: 2000000, current: 800000, sip: 25000, duration: 48, progress: 40 }
    ],
    recentTransactions: [
      { id: 1, date: "2026-07-10", desc: "Euro Kids Pre-School", category: "Child Education", amount: -15000, type: "debit" },
      { id: 2, date: "2026-07-05", desc: "Salary Credit (IDBI Bank)", category: "Income", amount: 180000, type: "credit" },
      { id: 3, date: "2026-07-04", desc: "IDBI Equity SIP MultiCap", category: "Investments (SIP)", amount: -25000, type: "debit" },
      { id: 4, date: "2026-07-02", desc: "BigBasket Groceries", category: "Food & Groceries", amount: -6500, type: "debit" },
      { id: 5, date: "2026-07-01", desc: "HDFC Life Insurance Prem.", category: "Insurance Premiums", amount: -7000, type: "debit" }
    ],
    advisoryTips: [
      "Activate IDBI Smart Sweep: Linking your savings account to an automated sweep FD will earn 7.1% interest on balances above ₹50,000, while keeping it 100% liquid.",
      "Step-up child education SIP: Increasing your SIP by just 10% annually (₹3,000 in Year 2) will reach your ₹40L education target 2 years early.",
      "Sovereign Gold Bond (SGB): A perfect alternative to physical gold for long-term goals. Earn 2.5% assured interest plus capital appreciation, tax-free at maturity."
    ]
  },
  vikram: {
    id: "vikram",
    name: "Vikram Sen",
    age: 48,
    profession: "Business Owner",
    avatarName: "Maya - Tax Specialist",
    initialGreeting: "Welcome back Vikram. We need to look closely at your tax planning this quarter. Based on your current business dividends, you face a potential 30% tax bracket liability. We should evaluate setting up an IDBI National Pension System (NPS) Tier-1 account to save ₹15,000 in extra tax right away. Ready to review?",
    riskProfile: "Conservative",
    riskScore: 31,
    metrics: {
      netWorth: 8900000,
      monthlyIncome: 350000,
      monthlyExpenses: 210000,
      monthlySavings: 140000,
      cashDrag: 950000
    },
    accounts: [
      { name: "IDBI Current Account", balance: 1400000, rate: "0%" },
      { name: "Savings Account (IDBI)", balance: 950000, rate: "3.5%" },
      { name: "Fixed Deposits (Tax Saver)", balance: 3500000, rate: "7.25%" },
      { name: "Corporate Debt Bonds", balance: 2100000, rate: "8.9%" },
      { name: "National Pension Scheme", balance: 950000, rate: "9.4% Avg" }
    ],
    spendingCategories: [
      { name: "Business Expenses", value: 95000, color: "#FFA62F" },
      { name: "Family Expenses", value: 65000, color: "#4E89FF" },
      { name: "EMIs & Loan Repayments", value: 50000, color: "#FF5E7E" },
      { name: "Investments (Debt/NPS)", value: 140000, color: "#00E676" }
    ],
    spendingTrend: [
      { month: "Jan", expenses: 190000, investments: 120000 },
      { month: "Feb", expenses: 200000, investments: 120000 },
      { month: "Mar", expenses: 240000, investments: 150000 },
      { month: "Apr", expenses: 210000, investments: 130000 },
      { month: "May", expenses: 215000, investments: 135000 },
      { month: "Jun", expenses: 210000, investments: 140000 }
    ],
    behaviorBadges: [
      { title: "High Debt Obligations", type: "warning", desc: "Your EMIs represent 24% of your monthly expenses. Consider prepaying the high-interest business loan to free up cash flow." },
      { title: "Excellent Debt Allocation", type: "success", desc: "You hold a secure allocation in AAA-rated corporate debt, protecting capital against equity downturns." },
      { title: "Tax Planning Lag", type: "danger", desc: "You have not initialized your voluntary tax-saving channels (Sec 80CCD for NPS) for the current financial year." }
    ],
    goals: [
      { id: "retirement", name: "Retirement corpus", target: 15000000, current: 6500000, sip: 50000, duration: 144, progress: 43 },
      { id: "debt", name: "Prepay Business Loan", target: 1500000, current: 600000, sip: 40000, duration: 24, progress: 40 }
    ],
    recentTransactions: [
      { id: 1, date: "2026-07-08", desc: "IDBI Home Loan EMI", category: "EMIs & Loan Repayments", amount: -50000, type: "debit" },
      { id: 2, date: "2026-07-06", desc: "Dividend payout credit", category: "Income", amount: 150000, type: "credit" },
      { id: 3, date: "2026-07-05", desc: "Salary Credit (IDBI Bank)", category: "Income", amount: 200000, type: "credit" },
      { id: 4, date: "2026-07-04", desc: "NPS Voluntary Deposit", category: "Investments (Debt/NPS)", amount: -50000, type: "debit" },
      { id: 5, date: "2026-07-02", desc: "Office Rent & Utilities", category: "Business Expenses", amount: -45000, type: "debit" }
    ],
    advisoryTips: [
      "Prepay Home Loan: Making an annual principal prepayment equal to just 1 extra EMI can reduce your total loan tenure by 4.2 years and save lakhs in interest.",
      "Invest in NPS for extra tax deductions: Depositing ₹50,000 under Section 80CCD(1B) provides an exclusive tax deduction over and above the Section 80C ₹1.5L limit.",
      "FD Laddering: Split your fixed deposit of ₹35L into 5 equal parts maturing in consecutive years. This optimizes liquidity while securing high long-term interest rates."
    ]
  }
};

export const ACTUAL_USER_TEMPLATE = {
  id: "actual",
  name: "Actual User",
  age: 30,
  profession: "Retail Investor",
  avatarName: "Maya - Wealth Advisor",
  initialGreeting: "Welcome to IDBI Smart Wealth! I have configured a clean dashboard for your profile. Let's start by defining your financial goals. What are we planning for first (e.g. Retirement, Buying a Home)?",
  riskProfile: "Moderate",
  riskScore: 50,
  metrics: {
    netWorth: 0,
    monthlyIncome: 60000,
    monthlyExpenses: 40000,
    monthlySavings: 20000,
    cashDrag: 0
  },
  accounts: [
    { name: "Savings Account (IDBI)", balance: 0, rate: "3.5%" },
    { name: "Mutual Funds (Equity)", balance: 0, rate: "12.0%" }
  ],
  spendingCategories: [
    { name: "Rent & Utilities", value: 15000, color: "#4E89FF" },
    { name: "Food & Dining", value: 10000, color: "#FF5E7E" },
    { name: "Investments (SIP)", value: 5000, color: "#00E676" },
    { name: "Others", value: 10000, color: "#ffa62f" }
  ],
  spendingTrend: [
    { month: "May", expenses: 32000, investments: 4000 },
    { month: "Jun", expenses: 35000, investments: 5000 }
  ],
  behaviorBadges: [],
  goals: [
    { id: "wealth", name: "Retirement Fund", target: 5000000, current: 0, sip: 5000, duration: 120, progress: 0 }
  ],
  recentTransactions: [],
  advisoryTips: [
    "Configure your financial goals to enable active compound projections.",
    "Add your monthly savings to help Aria detect your cash drag thresholds.",
    "Link your savings account to an automated IDBI FD Auto-Sweep to earn extra returns."
  ]
};

