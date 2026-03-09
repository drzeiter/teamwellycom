const MEASUREMENT_CONFIG: Record<string, { label: string; unit?: string; desc?: string }> = {
  knee_valgus_angle: { label: "Knee Valgus", unit: "°", desc: "Inward knee collapse" },
  hip_shift: { label: "Hip Shift" },
  hip_shift_degrees: { label: "Hip Shift", unit: "°" },
  pelvic_tilt: { label: "Pelvic Tilt" },
  pelvic_tilt_degrees: { label: "Pelvic Tilt", unit: "°" },
  pelvic_obliquity: { label: "Pelvic Obliquity" },
  pelvic_obliquity_degrees: { label: "Pelvic Obliquity", unit: "°" },
  torso_forward_lean: { label: "Torso Lean", unit: "°", desc: "Forward from vertical" },
  ankle_dorsiflexion_range: { label: "Ankle Dorsiflexion", unit: "°", desc: "Normal: 15-20°" },
  shoulder_flexion_range: { label: "Shoulder Flexion", unit: "°", desc: "Normal: 170-180°" },
  shoulder_elevation: { label: "Shoulder Symmetry" },
  shoulder_elevation_degrees: { label: "Shoulder Diff", unit: "°" },
  squat_depth: { label: "Squat Depth" },
  head_position: { label: "Head Position" },
  head_forward_angle: { label: "Head Forward", unit: "°" },
  head_forward_degrees: { label: "Head Forward", unit: "°" },
  head_tilt: { label: "Head Tilt" },
  head_tilt_degrees: { label: "Head Tilt", unit: "°" },
  head_rotation: { label: "Head Rotation" },
  cervical_side_bend: { label: "Cervical Side Bend" },
  cervical_flexion: { label: "Cervical Flexion", unit: "°" },
  shoulder_protraction_degrees: { label: "Shoulder Protraction", unit: "°" },
  clavicle_asymmetry: { label: "Clavicle Symmetry" },
  thoracic_kyphosis_angle: { label: "Thoracic Kyphosis", unit: "°", desc: "Normal: 20-45°" },
  trunk_lean: { label: "Trunk Lean" },
  trunk_lean_degrees: { label: "Trunk Lean", unit: "°" },
  lateral_trunk_lean: { label: "Lateral Trunk Lean" },
  lateral_trunk_lean_degrees: { label: "Lateral Lean", unit: "°" },
  rib_cage_shift: { label: "Rib Cage Shift" },
  thoracic_rotation: { label: "Thoracic Rotation" },
  lumbar_lordosis: { label: "Lumbar Lordosis" },
  lumbar_curve: { label: "Lumbar Curve" },
  lumbar_side_bend: { label: "Lumbar Side Bend" },
  thoracic_curve: { label: "Thoracic Curve" },
  lateral_pelvic_shift: { label: "Lateral Pelvic Shift" },
  weight_distribution: { label: "Weight Distribution" },
  knee_over_toe: { label: "Knee Over Toe" },
  feet_turn_out: { label: "Feet Turn Out" },
  feet_turn_out_degrees: { label: "Feet Turn Out", unit: "°" },
  screen_distance_assessment: { label: "Screen Distance" },
  stride_symmetry_percent: { label: "Stride Symmetry", unit: "%" },
  estimated_cadence: { label: "Cadence", desc: "Steps per minute" },
  foot_strike_type: { label: "Foot Strike" },
  vertical_oscillation: { label: "Vertical Oscillation" },
  arm_swing_symmetry_percent: { label: "Arm Swing Symmetry", unit: "%" },
  knee_drive: { label: "Knee Drive" },
  overstriding: { label: "Overstriding" },
  contralateral_hip_drop: { label: "Hip Drop", unit: "°" },
  asymmetric_hip_drive: { label: "Asymmetric Hip Drive" },
};

// Keys to skip (sub-values already shown by parent)
const SKIP_KEYS = new Set(["hip_shift_degrees", "pelvic_tilt_degrees", "head_forward_degrees", "feet_turn_out_degrees", "shoulder_elevation_degrees", "head_tilt_degrees", "trunk_lean_degrees", "lateral_trunk_lean_degrees", "pelvic_obliquity_degrees", "cervical_side_bend_degrees", "head_rotation_degrees"]);

export default function ReportJointMeasurements({ measurements }: { measurements: Record<string, any> }) {
  // Also merge running_metrics if present at the same level
  const items = Object.entries(measurements)
    .filter(([key, value]) => value != null && value !== undefined && !SKIP_KEYS.has(key) && typeof value !== "object")
    .map(([key, value]) => {
      const config = MEASUREMENT_CONFIG[key] || { label: key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) };
      const degreesKey = `${key}_degrees`;
      const extra = measurements[degreesKey] != null ? `${measurements[degreesKey]}°` : null;
      const isNeutral = typeof value === "string" && ["neutral", "normal", "none", "even", "level", "adequate"].includes(value.toLowerCase());
      return { ...config, value, extra, isNeutral, key };
    });

  if (items.length === 0) return null;

  return (
    <div className="glass rounded-xl p-4">
      <h3 className="font-display font-semibold text-foreground text-sm mb-3">Joint Measurements</h3>
      <div className="grid grid-cols-2 gap-2">
        {items.map((item) => (
          <div key={item.key} className={`rounded-lg p-3 ${item.isNeutral ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-secondary/50"}`}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
            <p className={`text-sm font-semibold mt-0.5 ${item.isNeutral ? "text-emerald-400" : "text-foreground"}`}>
              {typeof item.value === "boolean" ? (item.value ? "Yes" : "No") : `${item.value}${item.unit || ""}`}
            </p>
            {item.extra && <p className="text-[10px] text-muted-foreground mt-0.5">{item.extra}</p>}
            {item.desc && <p className="text-[10px] text-muted-foreground mt-0.5 opacity-60">{item.desc}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
