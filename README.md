# IDBI Smart Wealth 🚀
### Next-Gen AI-Powered Wealth Advisory & Personal Finance Platform

IDBI Smart Wealth is an interactive, highly aesthetic personal financial management and AI wealth advisory dashboard built for the **IDBI Hackathon**. The platform integrates a conversational AI assistant named **Maya** (who can morph into specialized advisors like **Aria** or **Leo**) to deliver personalized financial planning, credit card debt management, real-time mutual fund tracking, automated goals simulation, and speech-enabled voice interactions.

---

## 🌟 Key Features

1. **Maya: Animated Conversational AI Advisor**
   - Dynamic interactive SVG face with multiple states: `idle`, `speaking`, `thinking`, `listening`, `happy`, and `warning`.
   - Browser-native **Speech-to-Text (STT)** (using the Chrome Web Speech API) and **Text-to-Speech (TTS)** (using Web Speech Synthesis) with India-specific accent settings (`en-IN`).
   - Handles intelligent follow-ups (mic automatically turns back on for 30s after the AI finishes speaking if no manual override occurs).

2. **Dual-Mode Authentication & Sync**
   - **Production Mode**: Backed by **Firebase Authentication** and **Firestore** for user signup, login, and real-time state synchronization.
   - **Demo Mode**: Instant offline sandbox mode that falls back on local storage to preserve custom settings, goals, and card transactions.

3. **External Portfolio Sync (CAMS / KRA)**
   - Simulates CAS (Consolidated Account Statement) importing.
   - Imports holdings across external mutual fund schemes, calculates total external value, updates user's net worth, and triggers advisory suggestions based on risk parameters.

4. **Multi-Persona Financial Simulation**
   Toggle between three detailed personas to demonstrate distinct wealth advisory flows:
   - **Rohan Sharma** (Software Engineer - Aggressive): High cash drag, impulsive food/shopping spending, low interest yields.
   - **Priya Nair** (Marketing Manager - Moderate): Heavy family/child education goals, cash drag of ₹4.5L, disciplined saving habits.
   - **Vikram Sen** (Business Owner - Conservative): High business dividends, high business loans/EMIs, requires tax planning (NPS, Sec 80CCD).

5. **Advanced Credit Card & Debt Center**
   - Linked credit cards with tracking of outstanding dues, credit limits, transaction histories, and interest rates.
   - Enable/disable online and international transactions in real time.
   - Interactive payment mechanism that deducts funds from savings accounts, clears outstanding card dues, logs a debt transaction, re-calculates assets/liabilities, and triggers confetti celebration.

6. **Interactive Wealth Advisory & Planning**
   - **Dynamic Goal Builder**: Add, edit, or delete life goals (e.g., European Vacation, Buying an SUV, Child Higher Education).
   - **Target SIP Calculator**: Input custom monthly SIP amounts and investment durations to compute expected future value and compound gains.
   - **Risk Profiler**: Quick 5-question risk appetite questionnaire to dynamically calculate a user's risk score (0-100) and risk style (Conservative, Moderate, Aggressive).

7. **Spending Insights & Analytics**
   - Beautiful visual charts (Recharts) detailing category breakdowns (food, rent, shopping, etc.).
   - Comparison of spending trends against monthly investments.
   - Behavior badges detecting shopping spikes, cash drag leakages, or disciplined saving milestones.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (JavaScript) + Vite 8
- **Styling**: Vanilla CSS (Next-Gen Glassmorphic Design System, Custom Neon Glow, Mobile App Simulator Frame, and Desktop view toggle)
- **Data Visualization**: Recharts (Pie, Bar, Area, and Line charts)
- **Icons**: Lucide React
- **Animations / UX**: Canvas Confetti, custom CSS keyframe key-points
- **Database / Auth**: Google Firebase (Authentication & Cloud Firestore)
- **AI Core**: Google Gemini REST API Integration + public CORS Mutual Fund search API (`api.mfapi.in`)

---

## 📂 Project Structure

```
IDBI_Hackathon/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, sounds, and media
│   ├── components/         # React Components
│   │   ├── AuthScreen.jsx          # Login/Register Glassmorphic Portal
│   │   ├── AvatarView.jsx          # Animated SVG avatar & speech orchestration
│   │   ├── ChatInterface.jsx       # Chat window, quick prompts, speech controls
│   │   ├── CreditCardSection.jsx   # Card listings, limit bars, card payments
│   │   ├── FinancialSummary.jsx    # Asset/liability breakdowns & Net Worth gauges
│   │   ├── PersonaSelector.jsx     # Header dropdown to switch demo accounts
│   │   ├── PortfolioSyncModal.jsx  # Simulated CAMS folio file sync
│   │   ├── SpendingInsights.jsx    # Expense categorization & trend graphs
│   │   └── WealthAdvisory.jsx      # Goals builder, SIP projection & Risk Profiler
│   ├── utils/              # Utility helpers
│   │   ├── aiEngine.js             # Live Gemini API connector & MF API registry
│   │   ├── firebase.js             # Firebase auth/database connector & demo fallbacks
│   │   └── mockData.js             # Rohan, Priya, Vikram & Actual User schemas
│   ├── App.jsx             # Main Application shell and state coordinator
│   ├── App.css             # Main wrapper grid styles
│   ├── components.css      # Core component styles (cards, chats, forms)
│   ├── index.css           # Global design system, colors, variables, fonts
│   └── main.jsx            # React root mount point
├── .env                    # Local environment secrets configuration
├── Dockerfile              # Multi-stage production docker building script
├── default.conf.template   # Nginx template configuration for Cloud Run/Docker
├── package.json            # Scripts & project dependencies
└── vite.config.js          # Vite compilation configurations
```

---

## 🚀 Setup & Installation

### Option 1: Running Locally (Development Mode)

1. **Clone the Repository**
   Ensure you have [Node.js](https://nodejs.org/) installed (v20+ recommended).

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root folder of the project. Fill in your API keys:
   ```env
   # Google Gemini API Key (Optional but highly recommended)
   VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

   # Firebase Configuration (Optional - will fall back to Local Storage if blank)
   VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
   ```

4. **Launch Dev Server**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

### Option 2: Running via Docker

The project includes a multi-stage `Dockerfile` which builds the React app using Node and serves the static production files via Nginx.

1. **Build Docker Image**
   ```bash
   docker build -t idbi-smart-wealth .
   ```

2. **Run Docker Container**
   ```bash
   docker run -p 8080:8080 idbi-smart-wealth
   ```
   Open your browser and navigate to `http://localhost:8080`.

---

## 📈 Feature Highlights & Usage

### 👥 Persona Swapping (Demo Mode)
- Click the dropdown selector at the top header to alternate between **Rohan**, **Priya**, and **Vikram**.
- Witness the entire layout, metrics, charts, behavior badges, and financial tips dynamically load and adjust to reflect that user's situation.
- The AI Avatar will automatically speak a custom welcome greeting reflecting their primary financial leak (e.g., cash drag or tax savings).

### 💳 Credit Card Payments & Control
- Go to the **Cards** tab.
- Switch the online/international transaction toggles and see real-time updates.
- Click **Pay Bill** on HDFC or Amex cards. Select the source account (e.g. IDBI Savings Account) and the payment amount.
- Watch confetti fly! Your savings account balance will drop, your outstanding liabilities will decrease, your net worth will recalculate instantly, and Maya will verbally congratulate you on improving your credit health.

### 🔄 CAMS Portfolio Sync
- Under the **Overview** tab, click **Sync Portfolio**.
- Click **Upload CAMS Statement File**.
- The simulator imports ₹5,63,300 worth of external mutual fund holdings, recalculates your net worth, redirects your asset distribution chart, and adds a chat notification from Maya suggesting re-diversification strategies.

### 🤖 Generative AI Chat & Live Mutual Funds
- Type or speak any mutual fund name (e.g., "Suggest Nippon mutual fund" or "Check Parag Parikh").
- The system automatically triggers a dynamic API search request to the live mutual fund registry (`api.mfapi.in`), extracts real-time NAV prices, calculates annual returns, formats them, and highlights whether they match your current risk profile.
- If a `VITE_GEMINI_API_KEY` is configured, Maya will use the Gemini LLM model stack to provide an unrestricted, intelligent, conversational comparison of credit cards, tax strategies, and general financial advice tailored specifically to the active user's age, income, and risk appetite.

### 🎙️ Speech-to-Text & Text-to-Speech
- Ensure you are running the application in **Google Chrome** to support speech-to-text.
- Click the **Microphone** icon in the chat screen. Give the browser permission to access your mic.
- Speak your financial questions (e.g. "How can I reduce my tax?"). The interface will display your spoken words in the text area and automatically submit them once you stop speaking.
- Maya will respond with a spoken voice. The avatar's mouth will animate in sync with the audio duration.
- *Voice Follow-up Mode*: After Maya stops talking, the mic automatically reactivates for 30 seconds to allow seamless back-and-forth conversation, without needing to click the microphone button again.

---

## 🛡️ Production Onboarding & Firebase Sync
To sync your real-world progress:
1. Click **Register** on the initial authentication screen.
2. Enter your credentials and select your initial risk appetite.
3. If Firebase is connected, the profile is permanently stored in Firestore under your user UUID. Subsequent updates to goals, credit cards, and asset levels will persist across sessions.
4. If Firebase is not connected, the registration will store your profile in **Local Storage** under a simulated mock account, giving you a full profile persistence experience without requiring server configuration.
