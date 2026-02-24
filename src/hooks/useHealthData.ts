import { useState, useEffect, useCallback } from "react";
import { Capacitor } from "@capacitor/core";
import { healthService } from "@/services/healthService";

interface HealthData {
  dailySteps: number;
  weeklySteps: number[];
  heartRate: number | null;
  calories: number;
  isConnected: boolean;
  isNative: boolean;
  loading: boolean;
}

export const useHealthData = () => {
  const isNative = Capacitor.isNativePlatform();

  const [data, setData] = useState<HealthData>({
    dailySteps: isNative ? 0 : Math.floor(Math.random() * 8000) + 3000,
    weeklySteps: isNative
      ? Array(7).fill(0)
      : Array.from({ length: 7 }, () => Math.floor(Math.random() * 10000) + 2000),
    heartRate: null,
    calories: 0,
    isConnected: false,
    isNative,
    loading: false,
  });

  const connect = useCallback(async () => {
    if (!isNative) return false;
    setData(prev => ({ ...prev, loading: true }));

    const available = await healthService.isAvailable();
    if (!available) {
      setData(prev => ({ ...prev, loading: false }));
      return false;
    }

    const authorized = await healthService.requestAuthorization();
    if (!authorized) {
      setData(prev => ({ ...prev, loading: false }));
      return false;
    }

    setData(prev => ({ ...prev, isConnected: true }));
    await refresh();
    return true;
  }, [isNative]);

  const refresh = useCallback(async () => {
    if (!isNative) return;
    setData(prev => ({ ...prev, loading: true }));
    try {
      const [dailySteps, weeklySteps, heartRate, calories] = await Promise.all([
        healthService.getDailySteps(),
        healthService.getWeeklySteps(),
        healthService.getHeartRate(),
        healthService.getCalories(),
      ]);
      setData(prev => ({
        ...prev,
        dailySteps,
        weeklySteps,
        heartRate,
        calories,
        loading: false,
      }));
    } catch {
      setData(prev => ({ ...prev, loading: false }));
    }
  }, [isNative]);

  // Auto-refresh every 5 minutes when connected
  useEffect(() => {
    if (!data.isConnected) return;
    const interval = setInterval(refresh, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [data.isConnected, refresh]);

  return { ...data, connect, refresh };
};
