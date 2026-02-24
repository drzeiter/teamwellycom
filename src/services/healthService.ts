import { Capacitor } from "@capacitor/core";

interface HealthSample {
  value: number;
  startDate: string;
  endDate: string;
}

interface HealthService {
  isAvailable: () => Promise<boolean>;
  requestAuthorization: () => Promise<boolean>;
  getDailySteps: () => Promise<number>;
  getWeeklySteps: () => Promise<number[]>;
  getHeartRate: () => Promise<number | null>;
  getCalories: () => Promise<number>;
}

// Create the health service - lazy-loads native plugin only when needed
const createHealthService = (): HealthService => {
  const isNative = Capacitor.isNativePlatform();

  const getPlugin = async () => {
    if (!isNative) return null;
    try {
      const { Health } = await import("@capgo/capacitor-health");
      return Health;
    } catch {
      console.warn("HealthKit plugin not available");
      return null;
    }
  };

  return {
    isAvailable: async () => {
      const plugin = await getPlugin();
      if (!plugin) return false;
      try {
        const { available } = await plugin.isAvailable();
        return available;
      } catch {
        return false;
      }
    },

    requestAuthorization: async () => {
      const plugin = await getPlugin();
      if (!plugin) return false;
      try {
        await plugin.requestAuthorization({
          read: ["steps", "heartRate", "calories", "distance"],
          write: [],
        });
        return true;
      } catch (err) {
        console.error("HealthKit authorization failed:", err);
        return false;
      }
    },

    getDailySteps: async () => {
      const plugin = await getPlugin();
      if (!plugin) return 0;
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const { samples } = await plugin.queryAggregated({
          dataType: "steps",
          startDate: startOfDay.toISOString(),
          endDate: now.toISOString(),
          bucket: "day",
        });
        return samples.reduce((sum: number, s: HealthSample) => sum + s.value, 0);
      } catch (err) {
        console.error("Failed to read daily steps:", err);
        return 0;
      }
    },

    getWeeklySteps: async () => {
      const plugin = await getPlugin();
      if (!plugin) return Array(7).fill(0);
      try {
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const { samples } = await plugin.queryAggregated({
          dataType: "steps",
          startDate: weekAgo.toISOString(),
          endDate: now.toISOString(),
          bucket: "day",
        });

        // Map samples to 7-day array (Mon-Sun)
        const dailySteps = Array(7).fill(0);
        samples.forEach((s: HealthSample) => {
          const date = new Date(s.startDate);
          const dayIndex = (date.getDay() + 6) % 7; // Mon=0, Sun=6
          dailySteps[dayIndex] += s.value;
        });
        return dailySteps;
      } catch (err) {
        console.error("Failed to read weekly steps:", err);
        return Array(7).fill(0);
      }
    },

    getHeartRate: async () => {
      const plugin = await getPlugin();
      if (!plugin) return null;
      try {
        const { samples } = await plugin.readSamples({
          dataType: "heartRate",
          startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
          limit: 1,
        });
        return samples.length > 0 ? Math.round(samples[0].value) : null;
      } catch {
        return null;
      }
    },

    getCalories: async () => {
      const plugin = await getPlugin();
      if (!plugin) return 0;
      try {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const { samples } = await plugin.queryAggregated({
          dataType: "calories",
          startDate: startOfDay.toISOString(),
          endDate: now.toISOString(),
          bucket: "day",
        });
        return Math.round(samples.reduce((sum: number, s: HealthSample) => sum + s.value, 0));
      } catch {
        return 0;
      }
    },
  };
};

export const healthService = createHealthService();
export type { HealthService };
