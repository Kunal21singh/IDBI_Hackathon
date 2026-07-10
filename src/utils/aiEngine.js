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
      
      // Inject live mutual fund search results context if query matches fund search keywords
      let liveFundsContext = "";
      if (isFundQuery) {
        const liveFunds = await fetchLiveMutualFunds(message);
        if (liveFunds && liveFunds.length > 0) {
          liveFundsContext = "\nLive Mutual Fund Data retrieved dynamically from registry:\n" + liveFunds.map(f => 
            `- ${f.name} (Category: ${f.category}, Latest NAV: ₹${f.nav.toFixed(2)}${f.return1Yr !== 'N/A' ? `, 1-Yr Return: ${f.return1Yr}` : ''})`
          ).join("\n") + "\n";
        }
      }

      const systemPrompt = `You are Maya, IDBI Bank's intelligent wealth advisor bot. Respond to the user's queries in a friendly, conversational tone.
Active User Profile:
- Name: ${userName}
- Monthly Income: ₹${persona.metrics.monthlyIncome}
- Net Worth: ₹${netWorth}
- Risk Appetite: ${persona.riskProfile} (Score: ${persona.riskScore}/100)
- Current holdings: ${persona.accounts.map(a => `${a.name}: ₹${a.balance}`).join(", ")}
${liveFundsContext}
You can search the web and recommend mutual funds, top credit cards (for travel, dining, cashback, shopping, premium benefits), investment advice, or debt management strategies matching the user's request. Recommend real-world financial products (such as IDBI Bank credit cards like WINGS, Royale, Aspire, or high-value travel cards from SBI, HDFC, Axis, etc.). Do not restrict yourself to IDBI if they ask for other choices. Perform a free, intelligent analysis and comparison using the context. Be helpful and professional. Address them as ${userName}. Limit your answer to 3-4 sentences in a bulleted/bullet-topic format if listing options.`;

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
      console.error("Gemini API call failed", e);
    }
  }

  // 3. Fallback (If no API Key or LLM call fails)
  const userName = persona.name.split(" ")[0];
  const totalAssets = persona.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = persona.liabilities ? persona.liabilities.reduce((sum, l) => sum + l.balance, 0) : 0;
  const netWorth = totalAssets - totalLiabilities;
  
  responseText = `Hi ${userName}, to enable full, live AI financial analysis and credit card comparisons, please configure your **GEMINI_API_KEY** at the top of the file: \`src/utils/aiEngine.js\`. Once configured, Maya will freely analyze and answer any query using Google Gemini!${apiKeyHint}`;
  state = "thinking";

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
