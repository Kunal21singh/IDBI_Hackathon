export const generateAIResponse = (message, persona, currentContext = {}) => {
  const query = message.toLowerCase();
  
  // Custom states that the avatar can take: 'idle', 'speaking', 'thinking', 'happy', 'warning', 'listening'
  let state = "speaking"; 
  let responseText = "";
  let actionTrigger = null; // triggers a state change in the UI if needed
  
  // 1. Check for greetings or simple triggers
  if (query.match(/\b(hi|hello|hey|greetings|good morning|good afternoon)\b/)) {
    responseText = `Hello ${persona.name}! I'm your digital wealth avatar, ${persona.avatarName.split(" - ")[0]}. How can I help optimize your financial growth today? You can ask me to analyze your spending habits, explain tax-saving options, or model your savings goals.`;
    state = "happy";
  }
  
  // 2. Risk profiling triggers
  else if (query.includes("risk") || query.includes("quiz") || query.includes("appetite")) {
    responseText = `Your current profile is ${persona.riskProfile} (Score: ${persona.riskScore}/100). This is based on your asset allocation. Would you like to retake the Risk Profiling Quiz now to recalculate your optimal portfolio structure?`;
    state = "thinking";
    actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
  }
  
  // 3. Tax saving requests
  else if (query.includes("tax") || query.includes("80c") || query.includes("nps") || query.includes("elss")) {
    if (persona.id === "rohan") {
      responseText = `Rohan, you haven't utilized your ₹1.5 Lakh limit under Section 80C. I highly recommend investing in the IDBI ELSS Tax Saver Fund (historical 14.5% returns). A monthly SIP of ₹12,500 will maximize your tax savings. Shall I set up a draft SIP for you?`;
      state = "happy";
    } else if (persona.id === "priya") {
      responseText = `Priya, you're currently allocating well under Section 80C. However, did you know you can get an additional tax deduction of up to ₹50,000 under Section 80CCD(1B) by investing in the National Pension Scheme (NPS)? Let's open an IDBI NPS account!`;
      state = "happy";
    } else if (persona.id === "vikram") {
      responseText = `Vikram, as a business owner, you can optimize your tax bracket significantly. In addition to investing in the NPS Tier 1 (Sec 80CCD(1B)), we should explore dividend distribution strategies and splitting your savings into Tax-Free Corporate Bonds. Let me know if you want a detailed asset breakdown.`;
      state = "thinking";
    } else {
      const userName = persona.name.split(" ")[0];
      responseText = `${userName}, based on your current income of ₹${persona.metrics.monthlyIncome.toLocaleString('en-IN')}, I highly recommend maximizing your Sec 80C deductions by investing in ELSS tax saving Mutual Funds (historically yielding 14.5%) or checking out the National Pension System (NPS) for an additional ₹50,000 exemption. Shall I show you tax savers?`;
      state = "happy";
    }
  }

  // 4. Spending and budget habits
  else if (query.includes("spend") || query.includes("budget") || query.includes("expense") || query.includes("buying") || query.includes("dining")) {
    const diningCategory = persona.spendingCategories ? persona.spendingCategories.find(c => c.name.includes("Food") || c.name.includes("Dining")) : null;
    const diningAmt = diningCategory ? diningCategory.value : 0;
    
    if (persona.id === "rohan") {
      responseText = `Rohan, my analysis of your behavior shows you spent ₹${diningAmt.toLocaleString('en-IN')} on food deliveries and dining out this month, which is 27% of your net income. If we trim this by just 15% and redirect ₹5,000 to your 'Buy a SUV' SIP, you will reach your target 4 months earlier!`;
      state = "warning";
      actionTrigger = { type: "OPEN_TAB", payload: "spending" };
    } else if (persona.id === "priya") {
      responseText = `Priya, your household budgeting is very disciplined! Your primary spending is on Rent/Utilities and Child Education. However, you have an inflation leak: ₹4.5 Lakhs in your Savings account is losing value. Let's move ₹3 Lakhs to a liquid fund yielding 7.2%.`;
      state = "happy";
      actionTrigger = { type: "OPEN_TAB", payload: "spending" };
    } else if (persona.id === "vikram") {
      responseText = `Vikram, your business expenses constitute your largest outflow. Your EMI payments (₹50,000/month) represent 24% of your total expenses. Prepaying your high-interest business loan would immediately yield an effective risk-free return equal to the loan's interest rate.`;
      state = "warning";
      actionTrigger = { type: "OPEN_TAB", payload: "spending" };
    } else {
      const userName = persona.name.split(" ")[0];
      const savingsRate = Math.round((persona.metrics.monthlySavings / persona.metrics.monthlyIncome) * 100) || 0;
      responseText = `${userName}, you currently save ₹${persona.metrics.monthlySavings.toLocaleString('en-IN')} out of ₹${persona.metrics.monthlyIncome.toLocaleString('en-IN')} income (a savings rate of ${savingsRate}%). I recommend budgeting 30%+ of your income to speed up goal completion. Let's look at your monthly spend graph.`;
      state = "warning";
      actionTrigger = { type: "OPEN_TAB", payload: "spending" };
    }
  }

  // 5. Investment, savings and SIP guidance
  else if (query.includes("sip") || query.includes("invest") || query.includes("mutual fund") || query.includes("stocks") || query.includes("gold")) {
    if (persona.id === "rohan") {
      responseText = `With your Aggressive profile, a 70% Equity, 15% Debt, and 15% Gold allocation is recommended. Currently, you hold ₹90,000 in volatile crypto assets. I suggest rebalancing ₹40,000 of that into the IDBI Nifty 50 Index Fund for sustainable growth.`;
      state = "happy";
      actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
    } else if (persona.id === "priya") {
      responseText = `Priya, we can create an automated monthly SIP portfolio containing 60% Bluechip Equity and 40% Dynamic Debt. This matches your Moderate risk profile perfectly. Since you save ₹90,000/month, we can easily allocate ₹40,000 towards your Child's Higher Education goal.`;
      state = "happy";
      actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
    } else if (persona.id === "vikram") {
      responseText = `Vikram, because your business income varies, a conservative investment plan fits best. Let's maximize your PPF limits and ladder your fixed deposits. Linking your Current Account to an IDBI Auto-Sweep FD will let your surplus business cash earn 7.1% interest.`;
      state = "happy";
      actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
    } else {
      const userName = persona.name.split(" ")[0];
      responseText = `${userName}, for your ${persona.riskProfile} risk profile, a balanced mutual fund SIP containing 60% equities and 40% debt/gold instruments is recommended. Let's navigate to the Advisory tab to configure your Auto-SIP drafts or run compound simulator calculators.`;
      state = "happy";
      actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
    }
  }

  // 6. Savings Goals
  else if (query.includes("goal") || query.includes("car") || query.includes("education") || query.includes("retirement") || query.includes("trip")) {
    const goalsList = persona.goals.map(g => `${g.name} (Progress: ${g.progress}%)`).join(", ");
    responseText = `You currently have the following goals configured: ${goalsList}. You can navigate to the Goal Advisory tab to run simulations or adjust your monthly contributions. Let me know if you'd like me to calculate the SIP required for a new goal!`;
    state = "happy";
    actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
  }

  // 7. Cash drag / Emergency fund
  else if (query.includes("drag") || query.includes("idle") || query.includes("saving") || query.includes("sweep")) {
    responseText = `You have ₹${persona.metrics.cashDrag.toLocaleString('en-IN')} classified as cash drag. Keeping this cash in a regular savings account means it gains very little interest. Let me help you move ₹${(persona.metrics.cashDrag * 0.7).toLocaleString('en-IN')} to high-yield sweep accounts or liquid funds. Would you like to proceed?`;
    state = "warning";
  }

  // 8. Custom advisory tips clicks
  else if (query.startsWith("tip_")) {
    const tipIndex = parseInt(query.split("_")[1]);
    responseText = persona.advisoryTips[tipIndex] || "That tip is highly recommended for your profile. Let me know if you would like me to help implement it step-by-step!";
    state = "happy";
  }

  // 9. CAMS/KRA portfolio sync checks
  else if (query.includes("sync") || query.includes("cams") || query.includes("kra") || query.includes("imported") || query.includes("synced")) {
    if (persona.id === "actual") {
      responseText = `I've analyzed your synced portfolio from CAMS/KRA. You have imported ₹5,63,300 across 3 Mutual Funds and 2 Stocks. Current allocation is 80% Equity and 20% Debt. Since your risk score is 50 (Moderate), we should balance this by routing future SIPs to short-term corporate debt funds to shield capital. Would you like me to set it up?`;
      state = "happy";
    } else {
      responseText = `Portfolio sync is only available for Actual User accounts. For Demo profiles, you can swap layouts using the floating selector at the top!`;
      state = "warning";
    }
  }

  // 10. Debt repayment strategies
  else if (query.includes("debt") || query.includes("loan") || query.includes("liability") || query.includes("cc dues") || query.includes("credit card")) {
    const totalDues = persona.liabilities ? persona.liabilities.reduce((sum, l) => sum + l.balance, 0) : 0;
    if (totalDues > 0) {
      responseText = `You currently have ₹${totalDues.toLocaleString('en-IN')} in outstanding liabilities. I recommend utilizing the Debt Avalanche method: focus surplus savings on prepaying the highest interest liability first (e.g. credit card dues at ${persona.liabilities[0].rate}) while maintaining minimum payments on others. This saves you the maximum amount of interest compound. Shall we check your monthly surplus allocation?`;
      state = "warning";
    } else {
      responseText = `Congratulations! You are completely debt-free with zero outstanding liabilities. Let's focus your surplus monthly income of ₹${persona.metrics.monthlySavings.toLocaleString('en-IN')} entirely on high-yield compounding investments!`;
      state = "happy";
    }
  }

  // Default fallback conversational responses
  else {
    const userName = persona.name.split(" ")[0];
    responseText = `${userName}, I understand you're asking about "${message}". Let me analyze your financial profile. Based on your current net worth of ₹${persona.metrics.netWorth.toLocaleString('en-IN')} and a monthly income of ₹${persona.metrics.monthlyIncome.toLocaleString('en-IN')}, we can set up an optimized allocation. Would you like me to show your spending insights or recommend investment options?`;
    state = "thinking";
  }

  return {
    text: responseText,
    state,
    actionTrigger
  };
};

export const calculateSIPProjections = (monthlySIP, annualRate, tenureYears) => {
  const P = monthlySIP;
  const i = (annualRate / 100) / 12;
  const n = tenureYears * 12;
  
  // SIP Future Value formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
  const futureValue = P * (((Math.pow(1 + i, n) - 1) / i)) * (1 + i);
  const totalInvested = P * n;
  const wealthGained = futureValue - totalInvested;
  
  return {
    investedAmount: Math.round(totalInvested),
    estimatedReturns: Math.round(wealthGained),
    totalAccumulated: Math.round(futureValue)
  };
};
