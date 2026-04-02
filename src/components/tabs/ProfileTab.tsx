import { motion } from "framer-motion";
import { LogOut, Zap, Flame, ExternalLink, Calendar, Bell, TrendingUp, Target, Scan, CalendarCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CalendarSync from "@/components/CalendarSync";
import logoWhite from "@/assets/logo-white.png";

interface ProfileTabProps {
  displayName: string;
  points: { total_points: number; current_streak: number; longest_streak: number };
}

export default function ProfileTab({ displayName, points }: ProfileTabProps) {
  const { signOut, user } = useAuth();
  const level = Math.floor(points.total_points / 100) + 1;
  const xpInLevel = points.total_points % 100;

  const REMINDERS = [
    { label: "Morning Stretch", time: "7:00 AM", emoji: "🌅" },
    { label: "Midday Reset", time: "12:00 PM", emoji: "☀️" },
    { label: "Evening Wind Down", time: "6:00 PM", emoji: "🌙" },
  ];

  const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const fadeUp = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } };

  return (
    <motion.div className="pt-6 px-5 space-y-6 pb-4" variants={stagger} initial="hidden" animate="show">
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <img src={logoWhite} alt="" className="h-7 w-auto" />
        <h1 className="font-display text-xl font-bold text-foreground">Profile</h1>
      </motion.div>

      {/* User Card */}
      <motion.div variants={fadeUp} className="glass rounded-2xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-2xl font-bold text-primary-foreground">
            {displayName ? displayName[0].toUpperCase() : "W"}
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">{displayName || "Welly User"}</h2>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{points.total_points}</p>
            <p className="text-[10px] text-muted-foreground">Total Points</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <Flame className="w-4 h-4 text-orange-400 mx-auto mb-1" />
            <p className="font-display text-lg font-bold text-foreground">{points.current_streak}</p>
            <p className="text-[10px] text-muted-foreground">Day Streak</p>
          </div>
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <span className="text-sm">🏆</span>
            <p className="font-display text-lg font-bold text-foreground">Lv.{level}</p>
            <p className="text-[10px] text-muted-foreground">{xpInLevel}/100 XP</p>
          </div>
        </div>
      </motion.div>

      {/* How Your Welly Score Works */}
      <motion.div variants={fadeUp}>
        <h3 className="font-display text-sm font-bold text-foreground mb-3">How Your Welly Score Works</h3>
        <div className="glass rounded-xl p-4 space-y-3">
          {[
            { icon: <TrendingUp className="w-4 h-4 text-primary" />, text: "Complete sessions → improves score" },
            { icon: <Flame className="w-4 h-4 text-orange-400" />, text: "Maintain your streak → improves score" },
            { icon: <Target className="w-4 h-4 text-wellness-purple" />, text: "Follow programs → improves score" },
            { icon: <Scan className="w-4 h-4 text-wellness-gold" />, text: "Perform scans → improves score" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-3">
              {item.icon}
              <span className="text-sm text-foreground">{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calendar Integration */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">Calendar Integration</h3>
        </div>
        <CalendarSync />
      </motion.div>

      {/* Daily Reminders */}
      <motion.div variants={fadeUp}>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm font-bold text-foreground">Daily Reminders</h3>
        </div>
        <div className="space-y-2">
          {REMINDERS.map(r => (
            <div key={r.label} className="glass rounded-xl p-3 flex items-center gap-3">
              <span className="text-xl">{r.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{r.label}</p>
                <p className="text-xs text-muted-foreground">{r.time}</p>
              </div>
              <div className="w-10 h-5 rounded-full bg-secondary relative">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-muted-foreground/50 transition-all" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Book Coaching Call */}
      <motion.div variants={fadeUp}>
        <a
          href="https://calendly.com/drchriszeiter/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full glass rounded-xl p-4 flex items-center gap-3 text-left hover:border-primary/30 transition-all active:scale-[0.98] block"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-lg shrink-0">📞</div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-foreground text-sm">Book a Coaching Call</h4>
            <p className="text-xs text-muted-foreground">1-on-1 guidance from a wellness professional</p>
          </div>
          <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
        </a>
      </motion.div>

      {/* Points System */}
      <motion.div variants={fadeUp}>
        <h3 className="font-display text-sm font-bold text-foreground mb-3">How Points Work</h3>
        <div className="glass rounded-xl p-4 space-y-2">
          {[
            { action: "Complete a session", pts: "+5", emoji: "🏋️" },
            { action: "Complete daily plan", pts: "+10", emoji: "✅" },
            { action: "Perform movement scan", pts: "+3", emoji: "📸" },
            { action: "Schedule movement", pts: "+2", emoji: "📅" },
          ].map(item => (
            <div key={item.action} className="flex items-center gap-3 py-1">
              <span className="text-sm">{item.emoji}</span>
              <span className="text-sm text-foreground flex-1">{item.action}</span>
              <span className="text-xs font-bold text-primary">{item.pts}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Sign Out */}
      <motion.div variants={fadeUp}>
        <button onClick={signOut} className="w-full glass rounded-xl p-4 flex items-center gap-3 text-destructive active:scale-[0.98] transition-transform">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
