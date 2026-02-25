import { Wind, Brain, Flame, Lightbulb, Heart, Sparkles, Activity, BarChart3, BookOpen, Zap, Target } from "lucide-react";

export type TipCategory = "breath" | "nervous" | "performance" | "desk" | "action" | "hrv" | "education" | "premium" | "mindset" | "integration";

export interface WellnessTip {
  id: string;
  category: TipCategory;
  text: string;
  isAction?: boolean; // micro-action prompt
}

export const CATEGORY_META: Record<TipCategory, { label: string; iconName: string; color: string }> = {
  breath:      { label: "Breath",       iconName: "Wind",       color: "text-primary" },
  nervous:     { label: "Pain Science", iconName: "Brain",      color: "text-wellness-purple" },
  performance: { label: "Performance",  iconName: "Flame",      color: "text-wellness-coral" },
  desk:        { label: "Desk",         iconName: "Lightbulb",  color: "text-wellness-gold" },
  action:      { label: "Micro Action", iconName: "Zap",        color: "text-wellness-green" },
  hrv:         { label: "HRV",          iconName: "BarChart3",  color: "text-primary" },
  education:   { label: "Education",    iconName: "BookOpen",   color: "text-wellness-purple" },
  premium:     { label: "Elite",        iconName: "Sparkles",   color: "text-wellness-gold" },
  mindset:     { label: "Mindset",      iconName: "Brain",      color: "text-wellness-coral" },
  integration: { label: "Breath+Move",  iconName: "Activity",   color: "text-wellness-green" },
};

// Time-of-day mapping
export type TimeSlot = "morning" | "midday" | "evening";

export const TIME_SLOT_CATEGORIES: Record<TimeSlot, TipCategory[]> = {
  morning: ["performance", "premium", "mindset", "integration"],
  midday:  ["desk", "action", "education", "nervous"],
  evening: ["breath", "hrv", "integration", "education"],
};

export function getTimeSlot(): TimeSlot {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "midday";
  return "evening";
}

let _nextId = 0;
const t = (category: TipCategory, text: string, isAction = false): WellnessTip => ({
  id: `${category}-${_nextId++}`,
  category,
  text,
  isAction,
});

export const ALL_TIPS: WellnessTip[] = [
  // 🔥 BREATHWORK
  t("breath", "Your breath is the only body system you control that directly rewires stress in real time."),
  t("breath", "2 minutes of slow breathing can reduce cortisol up to 30%. That's free stress control."),
  t("breath", "Longer exhales = stronger parasympathetic activation."),
  t("breath", "If your exhale is shorter than your inhale, your body thinks you're in danger."),
  t("breath", "Cyclic sighing has been shown to outperform meditation for fast mood improvement."),
  t("breath", "5 breaths per minute is the nervous system sweet spot."),
  t("breath", "Your diaphragm is a core stabilizer AND a stress regulator."),
  t("breath", "Shallow chest breathing increases neck tension."),
  t("breath", "Your neck pain might be a breathing problem."),
  t("breath", "Breath control improves HRV within minutes."),

  // 🧠 NERVOUS SYSTEM
  t("nervous", "Pain isn't just tissue damage — it's nervous system sensitivity."),
  t("nervous", "If you feel stiff, your brain may feel unsafe."),
  t("nervous", "Mobility begins with safety."),
  t("nervous", "Tight muscles are often guarded muscles."),
  t("nervous", "Stress amplifies pain signals."),
  t("nervous", "The body protects before it performs."),
  t("nervous", "You can't stretch your way out of a stressed nervous system."),
  t("nervous", "Recovery isn't passive — it's regulated."),
  t("nervous", "Sleep quality is a nervous system skill."),
  t("nervous", "Your vagus nerve influences digestion, mood, and inflammation."),

  // 🏃 PERFORMANCE
  t("performance", "Mobility without stability creates injury."),
  t("performance", "Strength without control creates compensation."),
  t("performance", "Performance starts with positioning."),
  t("performance", "The best athletes master their breath."),
  t("performance", "Your warm-up tells you how your nervous system feels."),
  t("performance", "Range of motion you can't control is range you can't use."),
  t("performance", "Recovery is a competitive advantage."),
  t("performance", "Consistency beats intensity."),
  t("performance", "15 focused minutes > 90 distracted ones."),
  t("performance", "The body adapts to what you repeat."),

  // 💼 DESK
  t("desk", "Sitting isn't the problem. Staying still is."),
  t("desk", "Every 60–90 minutes, your spine wants movement."),
  t("desk", "Neck tension increases when your ribs don't move."),
  t("desk", "Your shoulders mirror your breathing pattern."),
  t("desk", "Screen height affects nervous system load."),
  t("desk", "The best posture is your next posture."),
  t("desk", "Stand up before you feel stiff."),
  t("desk", "Movement breaks increase productivity."),
  t("desk", "Stress posture = rounded shoulders + shallow breath."),
  t("desk", "Your desk shouldn't dictate your mobility."),

  // 🧘 MICRO ACTIONS
  t("action", "Take 5 slow breaths right now.", true),
  t("action", "Lengthen your next exhale.", true),
  t("action", "Relax your tongue from the roof of your mouth.", true),
  t("action", "Unclench your jaw.", true),
  t("action", "Drop your shoulders 1 inch.", true),
  t("action", "Let your ribs expand sideways.", true),
  t("action", "Breathe into your low back.", true),
  t("action", "Check your sitting posture.", true),
  t("action", "Stand up for 30 seconds.", true),
  t("action", "Move your neck gently side to side.", true),

  // 📊 HRV
  t("hrv", "Higher HRV = better stress adaptability."),
  t("hrv", "Breathing at 5–6 breaths/min increases HRV."),
  t("hrv", "Poor sleep lowers recovery metrics."),
  t("hrv", "Chronic stress lowers blood oxygen efficiency."),
  t("hrv", "Breathwork improves oxygen utilization."),
  t("hrv", "Recovery metrics improve before performance improves."),
  t("hrv", "HRV reflects nervous system balance."),
  t("hrv", "Your wearable measures output. Breath controls input."),
  t("hrv", "Recovery days build performance days."),
  t("hrv", "Stress compounds — so does recovery."),

  // 💡 EDUCATION
  t("education", "The diaphragm attaches to your spine."),
  t("education", "Breathing affects core stability."),
  t("education", "Tension in your hip flexors affects your breathing."),
  t("education", "Your rib cage mobility affects shoulder pain."),
  t("education", "Inflammation increases with chronic stress."),
  t("education", "Deep breathing improves blood flow."),
  t("education", "Slow breathing increases CO₂ tolerance."),
  t("education", "CO₂ tolerance affects endurance."),
  t("education", "Your nervous system prioritizes survival over flexibility."),
  t("education", "Recovery improves hormone balance."),

  // 🔥 PREMIUM
  t("premium", "Top performers train their nervous system."),
  t("premium", "Recovery is a skill."),
  t("premium", "Elite performance requires elite recovery."),
  t("premium", "You're building resilience, not just flexibility."),
  t("premium", "Regulate before you dominate."),
  t("premium", "Master your breath, master your state."),
  t("premium", "Calm is a performance enhancer."),
  t("premium", "Recovery is proactive, not reactive."),
  t("premium", "Strong nervous systems outperform strong muscles."),
  t("premium", "This is performance science."),

  // 🧠 MINDSET
  t("mindset", "Pain is information, not identity."),
  t("mindset", "Your body is adaptable."),
  t("mindset", "Small daily inputs change long-term outcomes."),
  t("mindset", "You don't need more motivation — you need structure."),
  t("mindset", "Consistency rewires the brain."),
  t("mindset", "Stress isn't the enemy. Chronic stress is."),
  t("mindset", "Recovery is productive."),
  t("mindset", "Your health compounds."),
  t("mindset", "Five minutes today matters."),
  t("mindset", "Discipline creates freedom."),

  // 🌀 BREATH + MOVEMENT
  t("integration", "Inhale to prepare. Exhale to move."),
  t("integration", "Exhale during effort."),
  t("integration", "Your core activates on exhale."),
  t("integration", "Breathe behind the shield."),
  t("integration", "Expand your ribs before lifting."),
  t("integration", "Breath controls spinal pressure."),
  t("integration", "Slow breath = smooth movement."),
  t("integration", "Rushed breath = rushed tension."),
  t("integration", "Your breath sets your rhythm."),
  t("integration", "Movement is medicine when regulated."),
];

// ─── Repeat prevention (localStorage) ───────────────
const STORAGE_KEY = "welly_seen_tips";
const MAX_HISTORY = 10; // sessions

function getSeenIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function markSeen(ids: string[]) {
  const prev = getSeenIds();
  // keep last MAX_HISTORY sessions worth (~5 tips per session)
  const combined = [...prev, ...ids].slice(-(MAX_HISTORY * 5));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
}

/**
 * Get tips for the current session, respecting:
 * - time-of-day category weighting
 * - repeat prevention within last 10 sessions
 * - optional category filter
 */
export function getSessionTips(count = 8, categoryFilter?: TipCategory): WellnessTip[] {
  const timeSlot = getTimeSlot();
  const preferredCats = TIME_SLOT_CATEGORIES[timeSlot];
  const seen = new Set(getSeenIds());

  let pool = categoryFilter
    ? ALL_TIPS.filter(t => t.category === categoryFilter)
    : ALL_TIPS;

  // Filter out recently seen
  const unseen = pool.filter(t => !seen.has(t.id));
  // If we've seen everything, reset
  const source = unseen.length >= count ? unseen : pool;

  // Weight preferred categories higher
  const weighted = source.map(tip => ({
    tip,
    weight: preferredCats.includes(tip.category) ? 3 : 1,
  }));

  // Weighted shuffle
  const shuffled = weighted
    .map(w => ({ ...w, sort: Math.random() * w.weight }))
    .sort((a, b) => b.sort - a.sort)
    .map(w => w.tip)
    .slice(0, count);

  markSeen(shuffled.map(t => t.id));
  return shuffled;
}
