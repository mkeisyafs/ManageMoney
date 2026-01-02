import { useState, useEffect, useCallback } from "react";
import { AppSettings, ThemeMode, Language } from "@/types";
import {
  getSettings,
  saveSettings,
  updateSettings,
} from "@/services/storage/mmkv";
import { DEFAULT_SETTINGS } from "@/constants/defaults";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  const loadSettings = useCallback(() => {
    setIsLoading(true);
    const data = getSettings();
    setSettings(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const update = useCallback((updates: Partial<AppSettings>) => {
    const newSettings = updateSettings(updates);
    setSettings(newSettings);
    return newSettings;
  }, []);

  const setTheme = useCallback(
    (theme: ThemeMode) => {
      return update({ theme });
    },
    [update]
  );

  const setLanguage = useCallback(
    (language: Language) => {
      return update({ language });
    },
    [update]
  );

  const setCurrency = useCallback(
    (currency: string) => {
      return update({ currency });
    },
    [update]
  );

  const enablePin = useCallback(
    (pinHash: string) => {
      return update({ pinEnabled: true, pinHash });
    },
    [update]
  );

  const disablePin = useCallback(() => {
    return update({ pinEnabled: false, pinHash: undefined });
  }, [update]);

  const enableBiometric = useCallback(() => {
    return update({ biometricEnabled: true });
  }, [update]);

  const disableBiometric = useCallback(() => {
    return update({ biometricEnabled: false });
  }, [update]);

  const completeOnboarding = useCallback(() => {
    return update({ onboardingCompleted: true });
  }, [update]);

  const updateLastOpened = useCallback(() => {
    return update({ lastOpenedAt: new Date().toISOString() });
  }, [update]);

  const refresh = useCallback(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    isLoading,
    updateSettings: update,
    setTheme,
    setLanguage,
    setCurrency,
    enablePin,
    disablePin,
    enableBiometric,
    disableBiometric,
    completeOnboarding,
    updateLastOpened,
    refresh,
  };
}
