import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "firebase/firestore";
import { ACTUAL_USER_TEMPLATE } from "./mockData";

// Read configuration from Vite environment variables (VITE_ prefix is required by Vite)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Check if credentials are configured (non-empty strings and not placeholders)
const isFirebaseConfigured = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "YOUR_API_KEY" &&
  firebaseConfig.projectId;

let app;
let auth;
let db;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase connection initialization failed:", error);
  }
}

// 1. Sign In handler
export const signInActualUser = async (email, password) => {
  if (!isFirebaseConfigured) {
    // Graceful fallback for demo when Firebase is not connected yet
    return simulateMockLogin(email, password);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Fetch user details from Firestore users collection
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid,
        email: userCredential.user.email,
        name: data.name || "Actual User",
        selectedPersona: "actual",
        profile: data
      };
    } else {
      // If doc does not exist, create a fallback doc
      const profileData = {
        ...ACTUAL_USER_TEMPLATE,
        name: email.split("@")[0],
        email,
        selectedPersona: "actual",
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, profileData);
      return {
        uid,
        email,
        name: profileData.name,
        selectedPersona: "actual",
        profile: profileData
      };
    }
  } catch (error) {
    throw new Error(error.message || "Failed to sign in. Check email and password.");
  }
};

// 2. Register / Sign Up handler
export const registerActualUser = async (email, password, name) => {
  if (!isFirebaseConfigured) {
    // Graceful fallback for demo when Firebase is not connected yet
    return simulateMockRegister(email, password, name);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Store custom onboarding profile in Firestore using the actual user template
    const userDocRef = doc(db, "users", uid);
    const profileData = {
      ...ACTUAL_USER_TEMPLATE,
      name,
      email,
      selectedPersona: "actual",
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, profileData);

    return {
      uid,
      email,
      name,
      selectedPersona: "actual",
      profile: profileData
    };
  } catch (error) {
    throw new Error(error.message || "Failed to register user. Try a different email.");
  }
};

// 3. Save profile data to Firestore
export const saveActualUserProfile = async (uid, updatedProfileData) => {
  if (!isFirebaseConfigured) {
    // Save to LocalStorage mock database
    const localUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
    // Find key matching user email
    const emailKey = Object.keys(localUsers).find(k => `mock_${k}` === uid);
    if (emailKey) {
      localUsers[emailKey].profile = updatedProfileData;
      localStorage.setItem("mock_users", JSON.stringify(localUsers));
    }
    return;
  }

  try {
    const userDocRef = doc(db, "users", uid);
    await setDoc(userDocRef, updatedProfileData, { merge: true });
  } catch (error) {
    console.error("Failed to sync profile changes with Firestore:", error);
  }
};

// 4. Sign Out handler
export const logOutActualUser = async () => {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  }
};

// --- SIMULATED FALLBACK METHODS FOR EASY DEMO ---
const simulateMockLogin = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const localUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
      const user = localUsers[email.toLowerCase()];

      if (user && user.password === password) {
        // Return custom loaded profile if present, else fallback
        const profile = user.profile || {
          ...ACTUAL_USER_TEMPLATE,
          name: user.name,
          email
        };
        resolve({
          uid: `mock_${email}`,
          email,
          name: user.name,
          selectedPersona: "actual",
          profile
        });
      } else {
        // Fallback: If not registered, create mock default profile
        const profileData = {
          ...ACTUAL_USER_TEMPLATE,
          name: email.split("@")[0],
          email
        };
        resolve({
          uid: `mock_${email}`,
          email,
          name: profileData.name,
          selectedPersona: "actual",
          profile: profileData
        });
      }
    }, 1000);
  });
};

const simulateMockRegister = async (email, password, name) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const localUsers = JSON.parse(localStorage.getItem("mock_users") || "{}");
      const profileData = {
        ...ACTUAL_USER_TEMPLATE,
        name,
        email,
        selectedPersona: "actual"
      };
      
      localUsers[email.toLowerCase()] = {
        name,
        password,
        selectedPersona: "actual",
        profile: profileData
      };
      localStorage.setItem("mock_users", JSON.stringify(localUsers));
      
      resolve({
        uid: `mock_${email}`,
        email,
        name,
        selectedPersona: "actual",
        profile: profileData
      });
    }, 1000);
  });
};

export { auth, db, isFirebaseConfigured };
