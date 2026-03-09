import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Plain-language labels for desk posture mode
const DESK_DISPLAY_KEYS: Record<string, { label: string; displayKey?: string; technicalLabel?: string }> = {
  head_tilt: { label: "Head Lean", displayKey: "head_tilt_display", technicalLabel: "Head tilt" },
  shoulder_elevation: { label: "Shoulder Height", displayKey: "shoulder_elevation_display", technicalLabel: "Shoulder elevation" },
  trunk_lean: { label: "Upper Body Shift", displayKey: "trunk_lean_display", technicalLabel: "Trunk lean" },
  clavicle_asymmetry: { label: "Shoulder Line", displayKey: "clavicle_display", technicalLabel: "Clavicle asymmetry" },
  pelvic_obliquity: { label: "Hip Level", displayKey: "pelvic_display", technicalLabel: "Pelvic obliquity" },
  head_forward_angle: { label: "Head Position", technicalLabel: "Forward head angle" },
  head_rotation: { label: "Head Rotation", technicalLabel: "Head rotation" },
  rib_cage_shift: { label: "Rib Cage", technicalLabel: "Rib cage shift" },
  weight_distribution: { label: "Weight Balance", technicalLabel: "Weight distribution" },
  screen_distance_assessment: { label: "Screen Distance" },
};

// General measurement config for non-desk modes
const GENERAL_CONFIG: Record<string, { label: string; unit?: string; desc?: string }> = {
  knee_valgus_angle: { label: "Knee Valgus", unit: "°" },
  hip_shift: { label: "Hip Shift" },
  pelvic_tilt: { label: "Pelvic Tilt" },
  torso_forward_lean: { label: "Torso Lean", unit: "°" },
  ankle_dorsiflexion_range: { label: "Ankle Dorsiflexion", unit: "°" },
  shoulder_flexion_range: { label: "Shoulder Flexion", unit: "°" },
  squat_depth: { label: "Squat Depth" },
  head_position: { label: "Head Position" },
  head_forward_angle: { label: "Head Forward", unit: "°" },
  lumbar_curve: { label: "Lumbar Curve" },
  thoracic_curve: { label: "Thoracic Curve" },
  knee_over_toe: { label: "Knee Over Toe" },
  feet_turn_out: { label: "Feet Turn Out" },
  weight_distribution: { label: "Weight Distribution" },
  lateral_trunk_lean: { label: "Lateral Lean" },
  stride_symmetry_percent: { label: "Stride Symmetry", unit: "%" },
  estimated_cadence: { label: "Cadence" },
  foot_strike_type: { label: "Foot Strike" },
  vertical_oscillation: { label: "Vertical Bounce" },
  arm_swing_symmetry_percent: { label: "Arm Symmetry", unit: "%" },
  knee_drive: { label: "Knee Drive" },
  overstriding: { label: "Overstriding" },
  contralateral_hip_drop: { label: "Hip Drop", unit: "°" },
};

// Keys to hide completely
const HIDDEN_KEYS = new Set([
  "head_tilt_display", "shoulder_elevation_display", "trunk_lean_display", "clavicle_display", "pelvic_display",
  "head_tilt_measured_angle", "shoulder_height_measured_angle", "trunk_lean_measured_angle",
  "clavicle_measured_angle", "pelvic_measured_angle",
  "hip_shift_degrees", "pelvic_tilt_degrees", "head_forward_degrees", "feet_turn_out_degrees",
  "shoulder_elevation_degrees", "head_tilt_degrees", "trunk_lean_degrees", "lateral_trunk_lean_degrees",
  "pelvic_obliquity_degrees", "cervical_side_bend_degrees", "head_rotation_degrees",
  "cervical_flexion", "cervical_side_bend", "cervical_side_bend_degrees",
  "shoulder_protraction_degrees", "thoracic_kyphosis_angle", "thoracic_rotation",
  "lumbar_lordosis", "lumbar_side_bend", "lateral_pelvic_shift",
  "posture_metrics", "alignment_reference_lines",
]);

function formatValue(value: any, unit?: string): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value === "neutral" || value === "normal" || value === "none" || value === "even" || value === "level" || value === "adequate") return "✓ Normal";
  return `${value}${unit || ""}`;
}

export default function ReportJointMeasurements({ measurements, isDesk = false }: { measurements: Record<string, any>; isDesk?: boolean }) {
  if (!measurements || Object.keys(measurements).length === 0) return null;

  if (isDesk) {
    // Desk mode: show user-friendly cards with display values
    const deskItems = Object.entries(DESK_DISPLAY_KEYS)
      .map(([key, config]) => {
        const rawValue = measurements[key];
        if (rawValue == null) return null;
        const displayValue = config.displayKey ? measurements[config.displayKey] : null;
        const degreesKey = `${key}_degrees`;
        const degrees = measurements[degreesKey];
        const measuredKey = `${key === "shoulder_elevation" ? "shoulder_height" : key}_measured_angle`;
        const measured = measurements[measuredKey];
        const isNormal = typeof rawValue === "string" && ["neutral", "normal", "none", "even", "level", "adequate"].includes(rawValue.toLowerCase());
        return { key, label: config.label, displayValue, rawValue, degrees, measured, isNormal, technicalLabel: config.technicalLabel };
      })
      .filter(Boolean) as any[];

    if (deskItems.length === 0) return null;

    return (
      <TooltipProvider>
        <div className="glass rounded-xl p-4">
          <h3 className="font-display font-semibold text-foreground text-sm mb-3">Posture Measurements</h3>
          <div className="grid grid-cols-2 gap-2">
            {deskItems.map((item: any) => (
              <Tooltip key={item.key}>
                <TooltipTrigger asChild>
                  <div className={`rounded-lg p-3 cursor-default ${item.isNormal ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-secondary/50"}`}>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className={`text-sm font-semibold mt-0.5 ${item.isNormal ? "text-emerald-400" : "text-foreground"}`}>
                      {item.displayValue || formatValue(item.rawValue)}
                    </p>
                    {item.measured != null && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">~{item.measured}°</p>
                    )}
                  </div>
                </TooltipTrigger>
                {item.technicalLabel && (
                  <TooltipContent side="top">
                    <p className="text-xs">Technical: {item.technicalLabel}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Non-desk mode: general measurements
  const items = Object.entries(measurements)
    .filter(([key, value]) => value != null && !HIDDEN_KEYS.has(key) && typeof value !== "object")
    .map(([key, value]) => {
      const config = GENERAL_CONFIG[key] || { label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
      const degreesKey = `${key}_degrees`;
      const extra = measurements[degreesKey] != null ? `${measurements[degreesKey]}°` : null;
      const isNormal = typeof value === "string" && ["neutral", "normal", "none", "even", "level", "adequate"].includes(value.toLowerCase());
      return { ...config, value, extra, isNormal, key };
    });

  if (items.length === 0) return null;

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-display font-semibold text-foreground text-sm mb-3">Measurements</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.key} className={`rounded-lg p-3 ${item.isNormal ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-secondary/50"}`}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
            <p className={`text-sm font-semibold mt-0.5 ${item.isNormal ? "text-emerald-400" : "text-foreground"}`}>
              {formatValue(item.value, item.unit)}
            </p>
            {item.extra && <p className="text-[10px] text-muted-foreground mt-0.5">{item.extra}</p>}
            {item.desc && <p className="text-[10px] text-muted-foreground mt-0.5 opacity-60">{item.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
