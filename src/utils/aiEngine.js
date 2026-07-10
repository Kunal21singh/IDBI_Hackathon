// Live Mutual Fund search API helper (queries api.mfapi.in which supports CORS)
export const fetchLiveMutualFunds = async (queryText) => {
  try {
    const stopWords = ["suggest", "show", "me", "some", "funds", "fund", "to", "invest", "in", "i", "want", "good", "for", "my", "portfolio", "is", "it", "so", "the", "a", "of", "other", "than", "except", "exclude", "non", "idbi"];
    const autocorrect = {
      "padak": "parag",
      "patek": "parikh",
      "parik": "parikh",
      "nipon": "nippon",
      "hfdc": "hdfc",
      "icic": "icici"
    };

    const excludeIDBI = queryText.toLowerCase().includes("other than idbi") || 
                        queryText.toLowerCase().includes("except idbi") || 
                        queryText.toLowerCase().includes("exclude idbi") || 
                        queryText.toLowerCase().includes("non idbi") ||
                        queryText.toLowerCase().includes("than idbi");
    
    let searchTerms = queryText.toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .map(w => autocorrect[w] || w)
      .filter(w => w.length > 2 && !stopWords.includes(w));
      
    if (excludeIDBI) {
      searchTerms = searchTerms.filter(w => w !== "idbi");
    }
    
    let apiQuery = searchTerms.join(" ");
    if (searchTerms.length === 0) {
      // Default to high-quality index or growth funds if query is generic
      apiQuery = queryText.toLowerCase().includes("tax") || queryText.toLowerCase().includes("save") ? "elss direct growth" : "index direct growth";
    }
    
    let searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(apiQuery)}`);
    let searchData = await searchRes.json();
    
    // Fallback search
    if ((!searchData || searchData.length === 0) && searchTerms.length > 1) {
      const brandTerms = searchTerms.filter(t => t !== "small" && t !== "mid" && t !== "large" && t !== "cap");
      const fallbackQuery = brandTerms.length > 0 ? brandTerms.join(" ") : searchTerms[0];
      searchRes = await fetch(`https://api.mfapi.in/mf/search?q=${encodeURIComponent(fallbackQuery)}`);
      searchData = await searchRes.json();
    }
    
    if (!searchData || searchData.length === 0) return [];
    
    const topSchemes = searchData.slice(0, 5); // Fetch top 5 to allow filtering out IDBI
    const detailedSchemes = await Promise.all(
      topSchemes.map(async (scheme) => {
        try {
          const detailRes = await fetch(`https://api.mfapi.in/mf/${scheme.schemeCode}`);
          const detailData = await detailRes.json();
          if (detailData && detailData.meta) {
            const history = detailData.data || [];
            const latestNav = history[0] ? parseFloat(history[0].nav) : 0;
            
            let return1Yr = "N/A";
            if (history.length > 250) {
              const oldNav = parseFloat(history[250].nav);
              if (oldNav > 0) {
                return1Yr = `${(((latestNav - oldNav) / oldNav) * 100).toFixed(1)}%`;
              }
            }
            
            return {
              name: detailData.meta.scheme_name,
              fundHouse: detailData.meta.fund_house,
              category: detailData.meta.scheme_category,
              nav: latestNav,
              return1Yr
            };
          }
        } catch (err) {
          console.error("Error fetching live scheme detail", scheme.schemeCode, err);
        }
        return null;
      })
    );
    
    let result = detailedSchemes.filter(s => s !== null && s.nav > 0);
    if (excludeIDBI) {
      result = result.filter(s => !s.name.toLowerCase().includes("idbi"));
    }
    return result.slice(0, 3);
  } catch (e) {
    console.error("Live mutual fund search failed:", e);
    return [];
  }
};

// ============================================================================
// 🔑 PASTE YOUR GEMINI API KEY HERE TO UNLEASH LIVE GENERATIVE AI RESPONSES:
// ============================================================================
const GEMINI_API_KEY = "AQ.Ab8RN6KFNE32g8Rx95HTUpwOO8XXhjAtFE-g7tSdK2Mzww5gyQ"; 

export const generateAIResponse = async (message, persona, currentContext = {}) => {
  const query = message.toLowerCase();
  let responseText = "";
  let state = "speaking";
  let actionTrigger = null;

  const apiKey = GEMINI_API_KEY || localStorage.getItem("GEMINI_API_KEY") || "";
  const apiKeyHint = !apiKey ? "\n\n💡 *Tip: Configure GEMINI_API_KEY inside src/utils/aiEngine.js to enable live generative AI responses!*" : "";

  // 1. Check if the message is a mutual fund inquiry. If so, fetch live financial data.
  const isFundQuery = query.includes("fund") || query.includes("invest") || query.includes("cap") || 
                       query.includes("saver") || query.includes("elss") || query.includes("lss") || 
                       query.includes("ellss") || query.includes("parag") || query.includes("patek") || 
                       query.includes("padak") || query.includes("nippon") || query.includes("sbi") || 
                       query.includes("hdfc") || query.includes("icici") || query.includes("recommend");

  if (isFundQuery) {
    const liveFunds = await fetchLiveMutualFunds(message);
    if (liveFunds && liveFunds.length > 0) {
      const userName = persona.name.split(" ")[0];
      let fundsText = liveFunds.map((f) => 
        `• **${f.name}**\n  - Category: ${f.category}\n  - Latest NAV: ₹${f.nav.toFixed(2)}${f.return1Yr !== 'N/A' ? `\n  - Simulated 1-Yr Return: ${f.return1Yr}` : ''}`
      ).join("\n\n");
      
      responseText = `Hi ${userName}, I queried the live mutual fund registry. Here is the real-time financial data for your search:\n\n${fundsText}\n\nAnalyzing this for your Moderate profile, these options are compatible. Shall I open the advisory simulator to see your projected growth?`;
      state = "happy";
      actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
      return { text: responseText, state, actionTrigger };
    }
  }

  // 2. If API Key is present, query Google Gemini API
  if (apiKey) {
    try {
      const userName = persona.name.split(" ")[0];
      const totalAssets = persona.accounts.reduce((sum, acc) => sum + acc.balance, 0);
      const totalLiabilities = persona.liabilities ? persona.liabilities.reduce((sum, l) => sum + l.balance, 0) : 0;
      const netWorth = totalAssets - totalLiabilities;
      
      const systemPrompt = `You are Maya, IDBI Bank's intelligent wealth advisor bot. Respond to the user's queries in a friendly, conversational tone.
Active User Profile:
- Name: ${userName}
- Monthly Income: ₹${persona.metrics.monthlyIncome}
- Net Worth: ₹${netWorth}
- Risk Appetite: ${persona.riskProfile} (Score: ${persona.riskScore}/100)
- Current holdings: ${persona.accounts.map(a => `${a.name}: ₹${a.balance}`).join(", ")}

Search the web and recommend top-rated Indian mutual fund schemes (like Nippon India, SBI, HDFC, Parag Parikh, Axis, Tata, etc.) that match the user's inquiry. Do NOT restrict yourself to IDBI funds if the user asks for other options or non-IDBI funds. Be helpful and professional. Address them as ${userName}. Limit your answer to 3-4 sentences.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { role: "user", parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] }
            ]
          })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        responseText = data.candidates[0].content.parts[0].text.trim();
        state = "happy";
        
        // Simple heuristic action triggers based on AI text
        if (responseText.toLowerCase().includes("spending") || responseText.toLowerCase().includes("insights")) {
          actionTrigger = { type: "OPEN_TAB", payload: "spending" };
        } else if (responseText.toLowerCase().includes("simulator") || responseText.toLowerCase().includes("calculator") || responseText.toLowerCase().includes("advisory")) {
          actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
        }
        
        return { text: responseText, state, actionTrigger };
      }
    } catch (e) {
      console.error("Gemini API call failed, falling back to local NLP search", e);
    }
  }

  // 3. Local Search & Rule Engine (Fallback)
  
  // Risk profiling triggers
  if (query.includes("risk") || query.includes("quiz") || query.includes("appetite")) {
    responseText = `Your current profile is ${persona.riskProfile} (Score: ${persona.riskScore}/100). This is based on your asset allocation. Would you like to retake the Risk Profiling Quiz now to recalculate your optimal portfolio structure?`;
    state = "thinking";
    actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
  }
  
  // Tax saving requests
  else if (
    query.includes("tax") || 
    query.includes("80c") || 
    query.includes("nps") || 
    query.includes("elss") || 
    query.includes("ellss") || 
    query.includes("lss") ||
    query.includes("tax saving") ||
    query.includes("tax saver")
  ) {
    const userName = persona.name.split(" ")[0];
    const liveFunds = await fetchLiveMutualFunds("elss growth");
    let fundsText = "• **SBI Long Term Equity Fund** (Direct Growth)\n  - Latest NAV: ₹394.22\n  - Simulated 1-Yr Return: 22.4%\n\n• **Nippon India Tax Saver Fund** (Direct Growth)\n  - Latest NAV: ₹104.50\n  - Simulated 1-Yr Return: 18.5%\n\n• **HDFC ELSS Tax Saver** (Direct Growth)\n  - Latest NAV: ₹1124.70\n  - Simulated 1-Yr Return: 19.8%";

    if (liveFunds && liveFunds.length > 0) {
      fundsText = liveFunds.map((f) => `• **${f.name}**\n  - Category: ${f.category}\n  - Latest NAV: ₹${f.nav.toFixed(2)}${f.return1Yr !== 'N/A' ? `\n  - Simulated 1-Yr Return: ${f.return1Yr}` : ''}`).join("\n\n");
    }
    
    responseText = `Hi ${userName}, here are some top tax-saving ELSS funds retrieved dynamically:\n\n${fundsText}\n\nELSS funds offer tax savings under Section 80C with the shortest lock-in period (3 years) of all options. Would you like me to set up an Auto-SIP draft for one of these?${apiKeyHint}`;
    state = "happy";
  }

  // Spending and budget habits
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

  // Investment, savings and SIP guidance
  else if (
    query.includes("sip") || 
    query.includes("invest") || 
    query.includes("mutual fund") || 
    query.includes("stocks") || 
    query.includes("gold") ||
    query.includes("small cap") ||
    query.includes("large cap") ||
    query.includes("recommend")
  ) {
    const userName = persona.name.split(" ")[0];
    const liveFunds = await fetchLiveMutualFunds(query);
    let fundsText = "• **Nippon India Growth Fund** (Direct Growth)\n  - Latest NAV: ₹3400.12\n  - Simulated 1-Yr Return: 25.4%\n\n• **SBI Bluechip Fund** (Direct Growth)\n  - Latest NAV: ₹84.50\n  - Simulated 1-Yr Return: 14.2%\n\n• **HDFC Index Fund Nifty 50 Plan** (Direct Growth)\n  - Latest NAV: ₹36.23\n  - Simulated 1-Yr Return: 18.5%";

    if (liveFunds && liveFunds.length > 0) {
      fundsText = liveFunds.map((f) => `• **${f.name}**\n  - Category: ${f.category}\n  - Latest NAV: ₹${f.nav.toFixed(2)}${f.return1Yr !== 'N/A' ? `\n  - Simulated 1-Yr Return: ${f.return1Yr}` : ''}`).join("\n\n");
    }
    
    responseText = `Hi ${userName}, based on your search for investments, here are the top matching funds retrieved dynamically:\n\n${fundsText}\n\nThese selections are tailored to align with your profile. Shall I open the compound growth simulator to model your SIP?${apiKeyHint}`;
    state = "happy";
    actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
  }

  // Savings Goals
  else if (query.includes("goal") || query.includes("car") || query.includes("education") || query.includes("retirement") || query.includes("trip")) {
    const goalsList = persona.goals.map(g => `${g.name} (Progress: ${g.progress}%)`).join(", ");
    responseText = `You currently have the following goals configured: ${goalsList}. You can navigate to the Goal Advisory tab to run simulations or adjust your monthly contributions. Let me know if you'd like me to calculate the SIP required for a new goal!`;
    state = "happy";
    actionTrigger = { type: "OPEN_TAB", payload: "advisory" };
  }

  // Cash drag / Emergency fund
  else if (query.includes("drag") || query.includes("idle") || query.includes("saving") || query.includes("sweep")) {
    responseText = `You have ₹${persona.metrics.cashDrag.toLocaleString('en-IN')} classified as cash drag. Keeping this cash in a regular savings account means it gains very little interest. Let me help you move ₹${(persona.metrics.cashDrag * 0.7).toLocaleString('en-IN')} to high-yield sweep accounts or liquid funds. Would you like to proceed?`;
    state = "warning";
  }

  // Custom advisory tips clicks
  else if (query.startsWith("tip_")) {
    const tipIndex = parseInt(query.split("_")[1]);
    responseText = persona.advisoryTips[tipIndex] || "That tip is highly recommended for your profile. Let me know if you would like me to help implement it step-by-step!";
    state = "happy";
  }

  // CAMS/KRA portfolio sync checks
  else if (query.includes("sync") || query.includes("cams") || query.includes("kra") || query.includes("imported") || query.includes("synced")) {
    if (persona.id === "actual") {
      responseText = `I've analyzed your synced portfolio from CAMS/KRA. You have imported ₹5,63,300 across 3 Mutual Funds and 2 Stocks. Current allocation is 80% Equity and 20% Debt. Since your risk score is 50 (Moderate), we should balance this by routing future SIPs to short-term corporate debt funds to shield capital. Would you like me to set it up?`;
      state = "happy";
    } else {
      responseText = `Portfolio sync is only available for Actual User accounts. For Demo profiles, you can swap layouts using the floating selector at the top!`;
      state = "warning";
    }
  }

  // Debt repayment strategies
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

  // Net worth and account balance queries
  else if (query.includes("net worth") || query.includes("balance") || query.includes("amount") || query.includes("portfolio value") || query.includes("holding") || query.includes("asset")) {
    const userName = persona.name.split(" ")[0];
    const totalAssets = persona.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = persona.liabilities ? persona.liabilities.reduce((sum, l) => sum + l.balance, 0) : 0;
    const netWorth = totalAssets - totalLiabilities;
    
    let breakdown = persona.accounts.map(a => `${a.name.replace(" (IDBI)", "").replace(" Account", "")}: ₹${a.balance.toLocaleString('en-IN')}`).join(", ");
    
    responseText = `Hi ${userName}, your current Net Worth is ₹${netWorth.toLocaleString('en-IN')}. This consists of total assets of ₹${totalAssets.toLocaleString('en-IN')}${totalLiabilities > 0 ? ` minus outstanding liabilities of ₹${totalLiabilities.toLocaleString('en-IN')}` : ''}. Your holdings: ${breakdown}.`;
    
    if (persona.id === "actual" && totalAssets > 240000) {
      responseText += ` (Includes ₹5,63,300 linked via CAMS / KRA folio sync).`;
    }
    state = "happy";
  }

  // Fallback greetings checks
  else if (query.match(/\b(hi|hello|hey|greetings|good morning|good afternoon)\b/)) {
    const userName = persona.name.split(" ")[0];
    responseText = `Hello ${userName}! I'm your digital wealth avatar, Maya. How can I help optimize your financial growth today? You can ask me to analyze your spending habits, explain tax-saving options, or model your savings goals.`;
    state = "happy";
  }

  // Default fallback conversational responses
  else {
    const userName = persona.name.split(" ")[0];
    const totalAssets = persona.accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = persona.liabilities ? persona.liabilities.reduce((sum, l) => sum + l.balance, 0) : 0;
    const netWorth = totalAssets - totalLiabilities;
    
    responseText = `${userName}, I understand you're asking about "${message}". Let me analyze your financial profile. Based on your current net worth of ₹${netWorth.toLocaleString('en-IN')} and a monthly income of ₹${persona.metrics.monthlyIncome.toLocaleString('en-IN')}, we can set up an optimized allocation. Would you like me to show your spending insights or recommend investment options?${apiKeyHint}`;
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
