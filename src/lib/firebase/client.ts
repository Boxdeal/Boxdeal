import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Disable app verification in development (for test phone numbers)
if (process.env.NODE_ENV === "development") {
  (auth as Auth & { settings: { appVerificationDisabledForTesting: boolean } }).settings.appVerificationDisabledForTesting = true;
}

export function setupRecaptcha(containerId: string): RecaptchaVerifier | null {
  if (process.env.NODE_ENV === "development") {
    return null; // Skip reCAPTCHA in dev mode
  }

  return new RecaptchaVerifier(containerId, {
    size: "invisible",
    callback: () => {
      console.log("reCAPTCHA verified");
    },
    "expired-callback": () => {
      console.log("reCAPTCHA expired");
    },
  }, auth);
}

export async function sendPhoneOtp(phoneNumber: string, appVerifier: RecaptchaVerifier | null) {
  return signInWithPhoneNumber(auth, phoneNumber, appVerifier as any);
}

export { signInWithPhoneNumber };
