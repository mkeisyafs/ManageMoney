import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as Crypto from "expo-crypto";
import { useSettings } from "@/hooks/useSettings";

interface AuthContextType {
  isLocked: boolean;
  isAuthenticated: boolean;
  isPinEnabled: boolean;
  isBiometricEnabled: boolean;
  isBiometricAvailable: boolean;
  unlock: () => void;
  lock: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  setPin: (pin: string) => Promise<void>;
  removePin: () => void;
  authenticateWithBiometric: () => Promise<boolean>;
  enableBiometric: () => Promise<boolean>;
  disableBiometric: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { settings, enablePin, disablePin, enableBiometric, disableBiometric } =
    useSettings();

  const [isLocked, setIsLocked] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();

    // If no security is enabled, auto-unlock
    if (!settings.pinEnabled && !settings.biometricEnabled) {
      setIsLocked(false);
      setIsAuthenticated(true);
    }
  }, [settings.pinEnabled, settings.biometricEnabled]);

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(compatible && enrolled);
  };

  const hashPin = async (pin: string): Promise<string> => {
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      pin
    );
    return hash;
  };

  const verifyPin = async (pin: string): Promise<boolean> => {
    if (!settings.pinHash) return false;
    const hash = await hashPin(pin);
    const isValid = hash === settings.pinHash;

    if (isValid) {
      setIsLocked(false);
      setIsAuthenticated(true);
    }

    return isValid;
  };

  const setPin = async (pin: string): Promise<void> => {
    const hash = await hashPin(pin);
    enablePin(hash);
  };

  const removePin = () => {
    disablePin();
    setIsLocked(false);
    setIsAuthenticated(true);
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock ManageMoney",
        fallbackLabel: "Use PIN",
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Biometric auth error:", error);
      return false;
    }
  };

  const enableBiometricAuth = async (): Promise<boolean> => {
    if (!isBiometricAvailable) return false;

    // Test biometric first
    const result = await authenticateWithBiometric();
    if (result) {
      enableBiometric();
      return true;
    }
    return false;
  };

  const disableBiometricAuth = () => {
    disableBiometric();
  };

  const unlock = useCallback(() => {
    setIsLocked(false);
    setIsAuthenticated(true);
  }, []);

  const lock = useCallback(() => {
    if (settings.pinEnabled || settings.biometricEnabled) {
      setIsLocked(true);
      setIsAuthenticated(false);
    }
  }, [settings.pinEnabled, settings.biometricEnabled]);

  return (
    <AuthContext.Provider
      value={{
        isLocked,
        isAuthenticated,
        isPinEnabled: settings.pinEnabled,
        isBiometricEnabled: settings.biometricEnabled,
        isBiometricAvailable,
        unlock,
        lock,
        verifyPin,
        setPin,
        removePin,
        authenticateWithBiometric,
        enableBiometric: enableBiometricAuth,
        disableBiometric: disableBiometricAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
