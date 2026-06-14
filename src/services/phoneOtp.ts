"use client";

import { auth } from "@/lib/firebase/client";
import { signInWithPhoneNumber, signInAnonymously, UserCredential, User, RecaptchaVerifier } from "firebase/auth";

const TEST_NUMBERS: Record<string, string> = {
  "9045045553": "123456",
};

let mockUser: User | null = null;
let confirmedPhone: string = "";

class MockConfirmationResult {
  constructor(private phone: string) {}

  async confirm(otp: string) {
    const testOtp = TEST_NUMBERS[this.phone.replace("+91", "")];
    if (otp !== testOtp) {
      throw new Error("Invalid OTP");
    }

    // Create a mock user for testing
    if (!mockUser) {
      const anonResult = await signInAnonymously(auth);
      mockUser = anonResult.user;
    }

    confirmedPhone = this.phone;
    return { user: mockUser } as UserCredential;
  }
}

let mockConfirmationResult: MockConfirmationResult | null = null;

export const phoneOtpService = {
  initRecaptcha() {
    // No-op for test mode
  },

  async sendOtp(phoneNumber: string) {
    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");

      // Check if it's a test number
      if (TEST_NUMBERS[cleanPhone]) {
        const formattedPhone = `+91${cleanPhone}`;
        mockConfirmationResult = new MockConfirmationResult(formattedPhone);
        return { success: true, message: "OTP sent successfully" };
      }

      // For non-test numbers, would use Firebase
      const formattedPhone = `+91${cleanPhone}`;
      try {
        await signInWithPhoneNumber(auth, formattedPhone, null as unknown as RecaptchaVerifier);
      } catch (err) {
        throw new Error("Phone authentication not available in test mode. Use test number: 9045045553");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP";
      return { success: false, error: msg };
    }
  },

  async verifyOtp(otp: string) {
    try {
      if (!mockConfirmationResult) {
        throw new Error("OTP not sent yet");
      }

      const result = await mockConfirmationResult.confirm(otp);
      return {
        success: true,
        user: result.user,
        data: { user: result.user },
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Invalid OTP";
      return { success: false, error: msg };
    }
  },

  getAuth() {
    return auth;
  },
};
