/**
 * Exercise Movement Specification System
 * 
 * Each exercise defines anatomically accurate phases with joint landmarks,
 * tempo, breath sync, and form constraints. The avatar animation engine
 * reads these specs to produce biomechanically correct movement.
 */

// Anatomical joint landmark positions in a 100x100 SVG coordinate system
export interface JointPose {
  // Head / Spine
  skull: [number, number];
  c_spine: [number, number]; // cervical
  t_spine: [number, number]; // thoracic (mid)
  l_spine: [number, number]; // lumbar
  // Shoulders
  shoulder_l: [number, number];
  shoulder_r: [number, number];
  scap_l: [number, number];
  scap_r: [number, number];
  // Arms
  elbow_l: [number, number];
  elbow_r: [number, number];
  wrist_l: [number, number];
  wrist_r: [number, number];
  hand_l: [number, number];
  hand_r: [number, number];
  // Core
  sternum: [number, number];
  pelvis: [number, number];
  sacrum: [number, number];
  // Legs
  hip_l: [number, number];
  hip_r: [number, number];
  knee_l: [number, number];
  knee_r: [number, number];
  ankle_l: [number, number];
  ankle_r: [number, number];
  heel_l: [number, number];
  heel_r: [number, number];
  forefoot_l: [number, number];
  forefoot_r: [number, number];
  // Rib cage (for breathing visualization)
  rib_l: [number, number];
  rib_r: [number, number];
}

export type BreathPhase = "inhale" | "exhale" | "hold" | "natural";

export interface MovementPhase {
  name: string;
  pose: JointPose;
  duration: number; // seconds
  breath: BreathPhase;
  easing: "easeInOut" | "easeIn" | "easeOut" | "linear" | [number, number, number, number];
  cue?: string; // on-screen coaching text
  muscles?: string[]; // muscles to highlight
}

export type Position = "standing" | "seated" | "supine" | "prone" | "quadruped" | "half_kneeling" | "side_lying" | "kneeling";
export type ViewAngle = "front" | "side" | "45deg";
export type MovementGoal = "mobility" | "stability" | "strength" | "neural_downshift" | "tissue_tolerance";
export type Plane = "sagittal" | "frontal" | "transverse";

export interface ExerciseMovementSpec {
  exercise_id: string;
  exercise_name: string;
  program_tag: string;
  difficulty: number; // 1-5
  equipment: string;
  position: Position;
  view_angle_default: ViewAngle;
  goal: MovementGoal;
  primary_outcome: string;
  contraindications?: string;
  movement_type: string;
  primary_joints: string[];
  locked_segments: string[];
  planes: Plane[];
  rom_targets?: string;
  phases: MovementPhase[];
  reps?: number;
  sets?: number;
  hold_seconds?: number;
  form_checks: string[];
  highlight_muscles?: string[];
}

// ─── NEUTRAL STANDING POSE (baseline) ─────────────────────────
const NEUTRAL_STANDING: JointPose = {
  skull: [50, 12], c_spine: [50, 18], t_spine: [50, 28], l_spine: [50, 38],
  shoulder_l: [38, 24], shoulder_r: [62, 24], scap_l: [40, 27], scap_r: [60, 27],
  elbow_l: [34, 38], elbow_r: [66, 38], wrist_l: [32, 48], wrist_r: [68, 48],
  hand_l: [31, 51], hand_r: [69, 51], sternum: [50, 24], pelvis: [50, 46],
  sacrum: [50, 48], hip_l: [44, 48], hip_r: [56, 48],
  knee_l: [43, 64], knee_r: [57, 64], ankle_l: [42, 78], ankle_r: [58, 78],
  heel_l: [41, 81], heel_r: [57, 81], forefoot_l: [44, 82], forefoot_r: [60, 82],
  rib_l: [42, 28], rib_r: [58, 28],
};

// ─── NEUTRAL SEATED POSE ─────────────────────────
const NEUTRAL_SEATED: JointPose = {
  skull: [50, 14], c_spine: [50, 20], t_spine: [50, 30], l_spine: [50, 40],
  shoulder_l: [38, 26], shoulder_r: [62, 26], scap_l: [40, 29], scap_r: [60, 29],
  elbow_l: [34, 40], elbow_r: [66, 40], wrist_l: [36, 50], wrist_r: [64, 50],
  hand_l: [36, 53], hand_r: [64, 53], sternum: [50, 26], pelvis: [50, 48],
  sacrum: [50, 50], hip_l: [44, 50], hip_r: [56, 50],
  knee_l: [36, 60], knee_r: [64, 60], ankle_l: [30, 72], ankle_r: [70, 72],
  heel_l: [29, 75], heel_r: [69, 75], forefoot_l: [32, 76], forefoot_r: [72, 76],
  rib_l: [42, 30], rib_r: [58, 30],
};

// ─── NEUTRAL SUPINE POSE ─────────────────────────
const NEUTRAL_SUPINE: JointPose = {
  skull: [15, 50], c_spine: [20, 50], t_spine: [30, 50], l_spine: [40, 50],
  shoulder_l: [22, 42], shoulder_r: [22, 58], scap_l: [24, 44], scap_r: [24, 56],
  elbow_l: [28, 36], elbow_r: [28, 64], wrist_l: [32, 32], wrist_r: [32, 68],
  hand_l: [33, 30], hand_r: [33, 70], sternum: [22, 50], pelvis: [48, 50],
  sacrum: [50, 50], hip_l: [50, 44], hip_r: [50, 56],
  knee_l: [62, 40], knee_r: [62, 60], ankle_l: [74, 38], ankle_r: [74, 62],
  heel_l: [77, 37], heel_r: [77, 63], forefoot_l: [78, 39], forefoot_r: [78, 61],
  rib_l: [28, 44], rib_r: [28, 56],
};

// ─── NEUTRAL QUADRUPED POSE ─────────────────────────
const NEUTRAL_QUADRUPED: JointPose = {
  skull: [22, 38], c_spine: [26, 40], t_spine: [36, 42], l_spine: [46, 43],
  shoulder_l: [24, 38], shoulder_r: [28, 42], scap_l: [26, 39], scap_r: [30, 43],
  elbow_l: [20, 48], elbow_r: [24, 50], wrist_l: [18, 58], wrist_r: [22, 60],
  hand_l: [17, 61], hand_r: [21, 63], sternum: [26, 40], pelvis: [54, 44],
  sacrum: [56, 44], hip_l: [56, 40], hip_r: [56, 48],
  knee_l: [66, 54], knee_r: [66, 58], ankle_l: [76, 54], ankle_r: [76, 58],
  heel_l: [78, 54], heel_r: [78, 58], forefoot_l: [80, 54], forefoot_r: [80, 58],
  rib_l: [32, 40], rib_r: [32, 46],
};

// ─── NEUTRAL PRONE POSE ─────────────────────────
const NEUTRAL_PRONE: JointPose = {
  skull: [15, 50], c_spine: [20, 50], t_spine: [30, 50], l_spine: [40, 50],
  shoulder_l: [22, 42], shoulder_r: [22, 58], scap_l: [24, 44], scap_r: [24, 56],
  elbow_l: [20, 36], elbow_r: [20, 64], wrist_l: [18, 32], wrist_r: [18, 68],
  hand_l: [17, 30], hand_r: [17, 70], sternum: [22, 50], pelvis: [48, 50],
  sacrum: [50, 50], hip_l: [50, 44], hip_r: [50, 56],
  knee_l: [65, 44], knee_r: [65, 56], ankle_l: [78, 44], ankle_r: [78, 56],
  heel_l: [80, 44], heel_r: [80, 56], forefoot_l: [82, 44], forefoot_r: [82, 56],
  rib_l: [28, 44], rib_r: [28, 56],
};

// Helper to create pose variations from a base
function poseFrom(base: JointPose, overrides: Partial<JointPose>): JointPose {
  return { ...base, ...overrides };
}

// ═══════════════════════════════════════════════════════════════
// EXERCISE MOVEMENT SPECS — 50 exercises
// ═══════════════════════════════════════════════════════════════

export const EXERCISE_SPECS: ExerciseMovementSpec[] = [
  // ─── 1. CERVICAL RETRACTION (CHIN TUCK) ─────────────────
  {
    exercise_id: "neck_001",
    exercise_name: "Cervical Retraction",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "none",
    position: "seated",
    view_angle_default: "side",
    goal: "stability",
    primary_outcome: "Reduce forward head tone, decrease neck tension",
    movement_type: "glide",
    primary_joints: ["C1_C7"],
    locked_segments: ["thoracic_spine", "scapula"],
    planes: ["sagittal"],
    rom_targets: "Posterior translation 1–2cm; extension max 5–8°",
    phases: [
      {
        name: "Setup",
        pose: NEUTRAL_SEATED,
        duration: 1,
        breath: "natural",
        easing: "easeInOut",
        cue: "Sit tall, shoulders relaxed",
      },
      {
        name: "Glide Back",
        pose: poseFrom(NEUTRAL_SEATED, {
          skull: [47, 14], c_spine: [48, 20],
        }),
        duration: 3,
        breath: "exhale",
        easing: [0.25, 0.1, 0.25, 1],
        cue: "Glide chin straight back",
        muscles: ["deep_neck_flexors", "longus_colli"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_SEATED, {
          skull: [47, 14], c_spine: [48, 20],
        }),
        duration: 2,
        breath: "hold",
        easing: "linear",
        cue: "Hold — keep chin level",
      },
      {
        name: "Return",
        pose: NEUTRAL_SEATED,
        duration: 3,
        breath: "inhale",
        easing: [0.25, 0.1, 0.25, 1],
        cue: "Slowly release forward",
      },
    ],
    reps: 10,
    sets: 1,
    form_checks: [
      "No thoracic flexion",
      "Chin stays level — no tilt down",
      "No shoulder shrug",
    ],
    highlight_muscles: ["deep_neck_flexors", "longus_colli"],
  },

  // ─── 2. SEATED THORACIC EXTENSION ─────────────────
  {
    exercise_id: "desk_002",
    exercise_name: "Seated Thoracic Extension Over Chair",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "chair",
    position: "seated",
    view_angle_default: "side",
    goal: "mobility",
    primary_outcome: "Improve thoracic extension, reduce mid-back stiffness",
    movement_type: "extension",
    primary_joints: ["T1_T12"],
    locked_segments: ["lumbar_neutral"],
    planes: ["sagittal"],
    phases: [
      {
        name: "Setup",
        pose: NEUTRAL_SEATED,
        duration: 1,
        breath: "natural",
        easing: "easeInOut",
        cue: "Hands behind head, sit tall",
      },
      {
        name: "Extend",
        pose: poseFrom(NEUTRAL_SEATED, {
          skull: [52, 10], c_spine: [52, 16], t_spine: [52, 26],
          sternum: [53, 22], shoulder_l: [36, 22], shoulder_r: [64, 22],
          elbow_l: [38, 14], elbow_r: [62, 14],
          rib_l: [40, 26], rib_r: [60, 26],
        }),
        duration: 3,
        breath: "inhale",
        easing: [0.4, 0, 0.2, 1],
        cue: "Lift sternum, extend over chair back",
        muscles: ["erector_spinae", "rhomboids"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_SEATED, {
          skull: [52, 10], c_spine: [52, 16], t_spine: [52, 26],
          sternum: [53, 22], rib_l: [41, 27], rib_r: [59, 27],
        }),
        duration: 3,
        breath: "hold",
        easing: "linear",
        cue: "Hold — breathe into ribs",
      },
      {
        name: "Return",
        pose: NEUTRAL_SEATED,
        duration: 3,
        breath: "exhale",
        easing: [0.4, 0, 0.2, 1],
        cue: "Slowly return to upright",
      },
    ],
    form_checks: ["No lumbar arching", "Sternum leads, not head"],
    highlight_muscles: ["erector_spinae", "rhomboids"],
  },

  // ─── 3. SEATED THORACIC ROTATION ─────────────────
  {
    exercise_id: "desk_003",
    exercise_name: "Seated Thoracic Rotation",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "none",
    position: "seated",
    view_angle_default: "front",
    goal: "mobility",
    primary_outcome: "Improve thoracic rotation, reduce rib stiffness",
    movement_type: "rotation",
    primary_joints: ["T1_T12"],
    locked_segments: ["pelvis", "lumbar_spine"],
    planes: ["transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall, hands on shoulders" },
      {
        name: "Rotate Left",
        pose: poseFrom(NEUTRAL_SEATED, {
          skull: [44, 14], c_spine: [46, 20], t_spine: [47, 30],
          shoulder_l: [32, 28], shoulder_r: [58, 22],
          sternum: [46, 26],
        }),
        duration: 2, breath: "exhale", easing: [0.25, 0.1, 0.25, 1],
        cue: "Rotate left — pelvis stays still",
        muscles: ["obliques", "multifidus"],
      },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { skull: [44, 14], c_spine: [46, 20], t_spine: [47, 30], shoulder_l: [32, 28], shoulder_r: [58, 22] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold rotation" },
      { name: "Center", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: [0.25, 0.1, 0.25, 1], cue: "Return to center" },
      {
        name: "Rotate Right",
        pose: poseFrom(NEUTRAL_SEATED, {
          skull: [56, 14], c_spine: [54, 20], t_spine: [53, 30],
          shoulder_l: [42, 22], shoulder_r: [68, 28],
          sternum: [54, 26],
        }),
        duration: 2, breath: "exhale", easing: [0.25, 0.1, 0.25, 1],
        cue: "Rotate right — pelvis stays still",
        muscles: ["obliques", "multifidus"],
      },
      { name: "Hold Right", pose: poseFrom(NEUTRAL_SEATED, { skull: [56, 14], c_spine: [54, 20], t_spine: [53, 30], shoulder_l: [42, 22], shoulder_r: [68, 28] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold rotation" },
      { name: "Return", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: [0.25, 0.1, 0.25, 1], cue: "Return to center" },
    ],
    form_checks: ["Pelvis stays fixed", "No lumbar rotation", "Scapula follows ribs"],
    highlight_muscles: ["obliques", "multifidus"],
  },

  // ─── 4. UPPER TRAP RELAX + RIB EXPANSION ─────────────────
  {
    exercise_id: "desk_004",
    exercise_name: "Upper Trap Relax + Rib Expansion",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "none",
    position: "seated",
    view_angle_default: "front",
    goal: "neural_downshift",
    primary_outcome: "Release upper trap tension, expand lateral rib cage",
    movement_type: "breath_driven",
    primary_joints: ["rib_cage", "scapula"],
    locked_segments: ["cervical_spine"],
    planes: ["frontal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall, let shoulders drop" },
      {
        name: "Depress & Expand",
        pose: poseFrom(NEUTRAL_SEATED, {
          shoulder_l: [38, 28], shoulder_r: [62, 28],
          rib_l: [38, 30], rib_r: [62, 30],
          scap_l: [40, 31], scap_r: [60, 31],
        }),
        duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Drop shoulders — breathe into side ribs",
        muscles: ["upper_trapezius", "intercostals", "diaphragm"],
      },
      {
        name: "Hold Expansion",
        pose: poseFrom(NEUTRAL_SEATED, {
          shoulder_l: [38, 28], shoulder_r: [62, 28],
          rib_l: [39, 30], rib_r: [61, 30],
        }),
        duration: 2, breath: "hold", easing: "linear",
        cue: "Feel ribs expand sideways",
      },
      {
        name: "Release",
        pose: NEUTRAL_SEATED,
        duration: 4, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Slow exhale — let tension melt",
      },
    ],
    form_checks: ["No cervical sidebend", "Shoulders depress, don't shrug"],
    highlight_muscles: ["upper_trapezius", "intercostals", "diaphragm"],
  },

  // ─── 5. SCAPULAR RETRACTION (LOW TRAP BIAS) ─────────────────
  {
    exercise_id: "desk_005",
    exercise_name: "Scapular Retraction",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "none",
    position: "seated",
    view_angle_default: "side",
    goal: "stability",
    primary_outcome: "Activate lower trap, improve scapular positioning",
    movement_type: "retraction",
    primary_joints: ["scapula"],
    locked_segments: ["lumbar_spine"],
    planes: ["frontal", "transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall, arms relaxed" },
      {
        name: "Retract",
        pose: poseFrom(NEUTRAL_SEATED, {
          scap_l: [42, 30], scap_r: [58, 30],
          shoulder_l: [40, 25], shoulder_r: [60, 25],
          elbow_l: [36, 39], elbow_r: [64, 39],
        }),
        duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1],
        cue: "Squeeze shoulder blades down & together",
        muscles: ["lower_trapezius", "rhomboids"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_SEATED, {
          scap_l: [42, 30], scap_r: [58, 30],
          shoulder_l: [40, 25], shoulder_r: [60, 25],
        }),
        duration: 3, breath: "hold", easing: "linear",
        cue: "Hold — feel lower traps engage",
      },
      {
        name: "Release",
        pose: NEUTRAL_SEATED,
        duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1],
        cue: "Slowly release",
      },
    ],
    form_checks: ["No lumbar arch", "Depress, don't elevate"],
    highlight_muscles: ["lower_trapezius", "rhomboids"],
  },

  // ─── 6. STANDING WALL ANGELS ─────────────────
  {
    exercise_id: "desk_006",
    exercise_name: "Standing Wall Angels",
    program_tag: "Desk Reset",
    difficulty: 2,
    equipment: "wall",
    position: "standing",
    view_angle_default: "side",
    goal: "mobility",
    primary_outcome: "Improve scapular upward rotation, shoulder mobility",
    movement_type: "slide",
    primary_joints: ["scapula", "glenohumeral"],
    locked_segments: ["lumbar_neutral", "rib_cage"],
    planes: ["frontal", "sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [34, 30], elbow_r: [66, 30], wrist_l: [34, 24], wrist_r: [66, 24] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Back flat on wall, arms at 90°" },
      {
        name: "Slide Up",
        pose: poseFrom(NEUTRAL_STANDING, {
          elbow_l: [36, 20], elbow_r: [64, 20],
          wrist_l: [36, 10], wrist_r: [64, 10],
          hand_l: [36, 7], hand_r: [64, 7],
          scap_l: [42, 24], scap_r: [58, 24],
        }),
        duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Slide arms up — keep contact with wall",
        muscles: ["serratus_anterior", "lower_trapezius"],
      },
      {
        name: "Slide Down",
        pose: poseFrom(NEUTRAL_STANDING, {
          elbow_l: [34, 30], elbow_r: [66, 30],
          wrist_l: [34, 24], wrist_r: [66, 24],
          scap_l: [40, 27], scap_r: [60, 27],
        }),
        duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Slide back down — ribs stay flat",
      },
    ],
    form_checks: ["Ribs don't flare", "Lumbar stays neutral against wall"],
    highlight_muscles: ["serratus_anterior", "lower_trapezius"],
  },

  // ─── 7. DOORWAY PEC OPENER ─────────────────
  {
    exercise_id: "desk_007",
    exercise_name: "Doorway Pec Opener",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "doorway",
    position: "standing",
    view_angle_default: "front",
    goal: "mobility",
    primary_outcome: "Open pectorals, improve shoulder external rotation",
    movement_type: "stretch_hold",
    primary_joints: ["glenohumeral", "pectorals"],
    locked_segments: ["rib_cage_neutral"],
    planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [30, 24], elbow_r: [70, 24], hand_l: [28, 16], hand_r: [72, 16] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Arms on doorframe at 90°" },
      {
        name: "Lean Through",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 14], c_spine: [50, 20], t_spine: [52, 29], sternum: [53, 25],
          shoulder_l: [32, 22], shoulder_r: [68, 22],
          elbow_l: [26, 22], elbow_r: [74, 22],
        }),
        duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Step forward gently — feel chest stretch",
        muscles: ["pectoralis_major", "pectoralis_minor"],
      },
      {
        name: "Hold Stretch",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 14], t_spine: [52, 29], sternum: [53, 25],
          shoulder_l: [32, 22], shoulder_r: [68, 22],
        }),
        duration: 20, breath: "natural", easing: "linear",
        cue: "Hold — breathe normally",
      },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Step back, release" },
    ],
    form_checks: ["Rib cage neutral", "No lumbar extension"],
    highlight_muscles: ["pectoralis_major", "pectoralis_minor"],
  },

  // ─── 8. WRIST EXTENSION NERVE GLIDE ─────────────────
  {
    exercise_id: "desk_008",
    exercise_name: "Wrist Extension Nerve Glide",
    program_tag: "Desk Reset",
    difficulty: 2,
    equipment: "none",
    position: "standing",
    view_angle_default: "front",
    goal: "mobility",
    primary_outcome: "Reduce wrist tension, neural mobilization",
    movement_type: "nerve_glide",
    primary_joints: ["wrist", "elbow", "cervical_spine"],
    locked_segments: ["thoracic_spine"],
    planes: ["frontal", "sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall, arms at sides" },
      {
        name: "Extend & Tilt",
        pose: poseFrom(NEUTRAL_STANDING, {
          elbow_r: [72, 36], wrist_r: [76, 44], hand_r: [78, 46],
          skull: [46, 12], c_spine: [48, 18],
        }),
        duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1],
        cue: "Extend wrist, tilt head away",
        muscles: ["median_nerve", "forearm_extensors"],
      },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { elbow_r: [72, 36], wrist_r: [76, 44], hand_r: [78, 46], skull: [46, 12] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold gently — no pain" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Return smoothly" },
    ],
    form_checks: ["No pain — only gentle tension", "Smooth neural glide"],
    highlight_muscles: ["forearm_extensors"],
  },

  // ─── 9. SEATED PELVIC TILTS ─────────────────
  {
    exercise_id: "desk_009",
    exercise_name: "Seated Pelvic Tilts",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "none",
    position: "seated",
    view_angle_default: "side",
    goal: "mobility",
    primary_outcome: "Restore lumbar segmental control",
    movement_type: "tilt",
    primary_joints: ["pelvis", "lumbar_spine"],
    locked_segments: ["thoracic_spine"],
    planes: ["sagittal"],
    phases: [
      { name: "Neutral", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit on sit bones" },
      {
        name: "Anterior Tilt",
        pose: poseFrom(NEUTRAL_SEATED, {
          pelvis: [50, 46], sacrum: [52, 48], l_spine: [50, 38],
        }),
        duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Rock pelvis forward — arch low back",
        muscles: ["erector_spinae", "hip_flexors"],
      },
      {
        name: "Posterior Tilt",
        pose: poseFrom(NEUTRAL_SEATED, {
          pelvis: [50, 50], sacrum: [48, 52], l_spine: [50, 42],
        }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Rock pelvis back — flatten low back",
        muscles: ["rectus_abdominis", "glutes"],
      },
      { name: "Return", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Return to neutral" },
    ],
    form_checks: ["Thoracic spine stays still", "Movement isolated to pelvis"],
    highlight_muscles: ["erector_spinae", "rectus_abdominis"],
  },

  // ─── 10. STANDING BACK EXTENSION RESET ─────────────────
  {
    exercise_id: "desk_010",
    exercise_name: "Standing Back Extension Reset",
    program_tag: "Desk Reset",
    difficulty: 1,
    equipment: "none",
    position: "standing",
    view_angle_default: "side",
    goal: "mobility",
    primary_outcome: "Counteract prolonged flexion, engage posterior chain",
    movement_type: "extension",
    primary_joints: ["lumbar_spine"],
    locked_segments: ["cervical_spine"],
    planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [40, 46], hand_r: [60, 46] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Hands on hips" },
      {
        name: "Extend",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 10], c_spine: [50, 16], t_spine: [52, 26], l_spine: [52, 36],
          sternum: [53, 22], pelvis: [50, 47],
          hand_l: [42, 46], hand_r: [58, 46],
        }),
        duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Extend back 10-15° — glutes engaged",
        muscles: ["erector_spinae", "gluteus_maximus"],
      },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [50, 10], t_spine: [52, 26], l_spine: [52, 36] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel posterior chain" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Return to standing" },
    ],
    form_checks: ["Glutes engage before extending", "Extension 10-15° max"],
    highlight_muscles: ["erector_spinae", "gluteus_maximus"],
  },

  // ─── 11. CAT-COW (SEGMENTAL) ─────────────────
  {
    exercise_id: "back_011",
    exercise_name: "Cat-Cow",
    program_tag: "Low Back P2P",
    difficulty: 1,
    equipment: "none",
    position: "quadruped",
    view_angle_default: "side",
    goal: "mobility",
    primary_outcome: "Segmental spinal motion, reduce stiffness",
    movement_type: "flexion_extension",
    primary_joints: ["pelvis", "lumbar_spine", "thoracic_spine", "cervical_spine"],
    locked_segments: [],
    planes: ["sagittal"],
    phases: [
      { name: "Neutral", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Start on all fours — neutral spine" },
      {
        name: "Cat (Flexion)",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          skull: [24, 44], c_spine: [28, 44], t_spine: [38, 36], l_spine: [48, 38],
          pelvis: [54, 40], sacrum: [56, 40],
          scap_l: [28, 35], scap_r: [32, 39],
        }),
        duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Pelvis tucks → lumbar rounds → thoracic → head drops",
        muscles: ["rectus_abdominis", "serratus_anterior"],
      },
      {
        name: "Cow (Extension)",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          skull: [20, 34], c_spine: [24, 36], t_spine: [34, 46], l_spine: [44, 48],
          pelvis: [54, 48], sacrum: [56, 48],
          sternum: [28, 44],
        }),
        duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Pelvis tips forward → spine extends → head lifts",
        muscles: ["erector_spinae", "multifidus"],
      },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Return to neutral" },
    ],
    form_checks: ["Move segmentally: pelvis leads", "Don't rush transitions"],
    highlight_muscles: ["rectus_abdominis", "erector_spinae"],
  },

  // ─── 12. CHILD'S POSE WITH SIDE REACH ─────────────────
  {
    exercise_id: "back_012",
    exercise_name: "Child's Pose with Side Reach",
    program_tag: "Low Back P2P",
    difficulty: 1,
    equipment: "none",
    position: "kneeling",
    view_angle_default: "front",
    goal: "mobility",
    primary_outcome: "Lat stretch, side body opening",
    movement_type: "stretch",
    primary_joints: ["shoulder", "thoracic_spine", "hip"],
    locked_segments: ["pelvis_grounded"],
    planes: ["frontal", "sagittal"],
    phases: [
      {
        name: "Child's Pose",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          skull: [28, 52], c_spine: [32, 50], t_spine: [42, 48], l_spine: [50, 46],
          pelvis: [58, 52], sacrum: [60, 54],
          shoulder_l: [26, 46], shoulder_r: [30, 50],
          elbow_l: [20, 50], elbow_r: [24, 54],
          wrist_l: [14, 54], wrist_r: [18, 58],
          hand_l: [12, 56], hand_r: [16, 60],
          knee_l: [62, 56], knee_r: [62, 60],
        }),
        duration: 2, breath: "exhale", easing: "easeInOut", cue: "Sit back into child's pose",
      },
      {
        name: "Reach Left",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          skull: [24, 52], c_spine: [28, 50], t_spine: [38, 48],
          hand_l: [6, 52], hand_r: [10, 56],
          wrist_l: [8, 52], wrist_r: [12, 56],
          pelvis: [58, 52],
        }),
        duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1],
        cue: "Walk hands left — feel right lat stretch",
        muscles: ["latissimus_dorsi", "obliques"],
      },
      {
        name: "Center",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          skull: [28, 52], pelvis: [58, 52], hand_l: [12, 56], hand_r: [16, 60],
        }),
        duration: 2, breath: "exhale", easing: "easeInOut", cue: "Return to center",
      },
      {
        name: "Reach Right",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          skull: [32, 52], c_spine: [34, 50], t_spine: [42, 48],
          hand_l: [18, 56], hand_r: [24, 52],
          wrist_l: [16, 56], wrist_r: [22, 52],
          pelvis: [58, 52],
        }),
        duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1],
        cue: "Walk hands right — feel left lat stretch",
        muscles: ["latissimus_dorsi", "obliques"],
      },
      { name: "Return", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [28, 52], pelvis: [58, 52] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Return to center" },
    ],
    form_checks: ["Hips stay back", "Pelvis doesn't lift"],
    highlight_muscles: ["latissimus_dorsi", "obliques"],
  },

  // ─── 13. DEAD BUG ─────────────────
  {
    exercise_id: "back_013",
    exercise_name: "Dead Bug",
    program_tag: "Low Back P2P",
    difficulty: 2,
    equipment: "none",
    position: "supine",
    view_angle_default: "side",
    goal: "stability",
    primary_outcome: "Anti-extension core stability",
    movement_type: "alternating_reach",
    primary_joints: ["shoulder", "hip"],
    locked_segments: ["lumbar_neutral"],
    planes: ["sagittal"],
    phases: [
      {
        name: "Setup",
        pose: poseFrom(NEUTRAL_SUPINE, {
          elbow_l: [26, 38], elbow_r: [26, 62],
          wrist_l: [24, 34], wrist_r: [24, 66],
          knee_l: [56, 40], knee_r: [56, 60],
          ankle_l: [62, 38], ankle_r: [62, 62],
        }),
        duration: 1, breath: "natural", easing: "easeInOut",
        cue: "Arms up, knees at 90° — press low back into floor",
      },
      {
        name: "Extend Right Arm + Left Leg",
        pose: poseFrom(NEUTRAL_SUPINE, {
          wrist_r: [10, 68], hand_r: [8, 70],
          knee_l: [70, 42], ankle_l: [80, 42], heel_l: [82, 42],
          elbow_l: [26, 38], wrist_l: [24, 34],
          knee_r: [56, 60], ankle_r: [62, 62],
        }),
        duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Exhale — extend opposite arm & leg slowly",
        muscles: ["transverse_abdominis", "rectus_abdominis"],
      },
      {
        name: "Return",
        pose: poseFrom(NEUTRAL_SUPINE, {
          elbow_l: [26, 38], elbow_r: [26, 62],
          wrist_l: [24, 34], wrist_r: [24, 66],
          knee_l: [56, 40], knee_r: [56, 60],
        }),
        duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Inhale — bring back to start",
      },
      {
        name: "Extend Left Arm + Right Leg",
        pose: poseFrom(NEUTRAL_SUPINE, {
          wrist_l: [10, 32], hand_l: [8, 30],
          knee_r: [70, 58], ankle_r: [80, 58], heel_r: [82, 58],
          elbow_r: [26, 62], wrist_r: [24, 66],
          knee_l: [56, 40], ankle_l: [62, 38],
        }),
        duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Exhale — extend other side",
        muscles: ["transverse_abdominis", "rectus_abdominis"],
      },
      {
        name: "Reset",
        pose: poseFrom(NEUTRAL_SUPINE, {
          elbow_l: [26, 38], elbow_r: [26, 62],
          wrist_l: [24, 34], wrist_r: [24, 66],
          knee_l: [56, 40], knee_r: [56, 60],
        }),
        duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Inhale — return",
      },
    ],
    form_checks: ["Low back stays pressed to floor", "No rib flare", "Move slowly"],
    highlight_muscles: ["transverse_abdominis", "rectus_abdominis"],
  },

  // ─── 14. BIRD DOG ─────────────────
  {
    exercise_id: "back_014",
    exercise_name: "Bird Dog",
    program_tag: "Low Back P2P",
    difficulty: 2,
    equipment: "none",
    position: "quadruped",
    view_angle_default: "side",
    goal: "stability",
    primary_outcome: "Anti-rotation core stability, posterior chain activation",
    movement_type: "alternating_reach",
    primary_joints: ["shoulder", "hip"],
    locked_segments: ["lumbar_neutral", "pelvis"],
    planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours — imagine glass of water on back" },
      {
        name: "Extend Right Arm + Left Leg",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          hand_r: [8, 40], wrist_r: [10, 42], elbow_r: [14, 44],
          knee_l: [72, 40], ankle_l: [82, 38], heel_l: [84, 38],
        }),
        duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Reach arm forward, leg back — stay level",
        muscles: ["multifidus", "gluteus_maximus", "erector_spinae"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          hand_r: [8, 40], wrist_r: [10, 42],
          knee_l: [72, 40], ankle_l: [82, 38],
        }),
        duration: 3, breath: "hold", easing: "linear",
        cue: "Hold 3 seconds — no hip rotation",
      },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Return slowly" },
      {
        name: "Extend Left Arm + Right Leg",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          hand_l: [8, 58], wrist_l: [10, 60], elbow_l: [14, 56],
          knee_r: [72, 58], ankle_r: [82, 58], heel_r: [84, 58],
        }),
        duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Other side — reach & extend",
        muscles: ["multifidus", "gluteus_maximus", "erector_spinae"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_QUADRUPED, {
          hand_l: [8, 58], knee_r: [72, 58],
        }),
        duration: 3, breath: "hold", easing: "linear",
        cue: "Hold — pelvis stays level",
      },
      { name: "Reset", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Return to start" },
    ],
    form_checks: ["No pelvic rotation", "Neutral spine throughout", "Glass of water test"],
    highlight_muscles: ["multifidus", "gluteus_maximus"],
  },

  // ─── 15. GLUTE BRIDGE ─────────────────
  {
    exercise_id: "back_015",
    exercise_name: "Glute Bridge",
    program_tag: "Low Back P2P",
    difficulty: 1,
    equipment: "none",
    position: "supine",
    view_angle_default: "side",
    goal: "strength",
    primary_outcome: "Glute activation, posterior chain strengthening",
    movement_type: "bridge",
    primary_joints: ["hip", "pelvis"],
    locked_segments: ["rib_cage"],
    planes: ["sagittal"],
    phases: [
      {
        name: "Setup",
        pose: poseFrom(NEUTRAL_SUPINE, {
          knee_l: [58, 38], knee_r: [58, 62],
          ankle_l: [68, 42], ankle_r: [68, 58],
          heel_l: [70, 42], heel_r: [70, 58],
        }),
        duration: 1, breath: "natural", easing: "easeInOut",
        cue: "Knees bent 90°, feet hip width",
      },
      {
        name: "Posterior Tilt",
        pose: poseFrom(NEUTRAL_SUPINE, {
          pelvis: [46, 50], sacrum: [48, 50],
          l_spine: [38, 50],
          knee_l: [58, 38], knee_r: [58, 62],
          ankle_l: [68, 42], ankle_r: [68, 58],
        }),
        duration: 1, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Flatten low back first — tilt pelvis",
        muscles: ["gluteus_maximus", "hamstrings"],
      },
      {
        name: "Lift",
        pose: poseFrom(NEUTRAL_SUPINE, {
          pelvis: [44, 42], sacrum: [46, 44], l_spine: [36, 44], t_spine: [28, 46],
          hip_l: [46, 38], hip_r: [46, 54],
          knee_l: [58, 36], knee_r: [58, 60],
          ankle_l: [68, 42], ankle_r: [68, 58],
          rib_l: [28, 44], rib_r: [28, 56],
        }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Drive hips up — squeeze glutes at top",
        muscles: ["gluteus_maximus", "hamstrings"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_SUPINE, {
          pelvis: [44, 42], sacrum: [46, 44], l_spine: [36, 44],
          hip_l: [46, 38], hip_r: [46, 54],
          knee_l: [58, 36], knee_r: [58, 60],
          ankle_l: [68, 42], ankle_r: [68, 58],
        }),
        duration: 2, breath: "hold", easing: "linear",
        cue: "Hold — hips fully extended",
      },
      {
        name: "Lower",
        pose: poseFrom(NEUTRAL_SUPINE, {
          knee_l: [58, 38], knee_r: [58, 62],
          ankle_l: [68, 42], ankle_r: [68, 58],
        }),
        duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Lower slowly — spine segment by segment",
      },
    ],
    form_checks: ["Posterior tilt BEFORE hip extension", "Rib cage doesn't flare", "Knees aligned over ankles"],
    highlight_muscles: ["gluteus_maximus", "hamstrings"],
  },

  // ─── 16. SIDE PLANK (MODIFIED) ─────────────────
  {
    exercise_id: "back_016",
    exercise_name: "Side Plank",
    program_tag: "Low Back P2P",
    difficulty: 2,
    equipment: "none",
    position: "side_lying",
    view_angle_default: "front",
    goal: "stability",
    primary_outcome: "Lateral core stability, QL activation",
    movement_type: "isometric",
    primary_joints: ["core"],
    locked_segments: ["pelvis_stacked", "shoulder_vertical"],
    planes: ["frontal"],
    phases: [
      {
        name: "Setup",
        pose: poseFrom(NEUTRAL_SUPINE, {
          skull: [20, 44], c_spine: [24, 46], t_spine: [34, 48], l_spine: [42, 50],
          pelvis: [50, 52], hip_l: [52, 48], hip_r: [52, 56],
          elbow_l: [24, 40], wrist_l: [22, 36],
          knee_l: [62, 48], knee_r: [62, 56],
        }),
        duration: 1, breath: "natural", easing: "easeInOut",
        cue: "Side lying, elbow under shoulder",
      },
      {
        name: "Lift",
        pose: poseFrom(NEUTRAL_SUPINE, {
          skull: [20, 40], c_spine: [24, 42], t_spine: [34, 44], l_spine: [42, 46],
          pelvis: [50, 46], hip_l: [52, 42], hip_r: [52, 50],
          elbow_l: [24, 40], wrist_l: [22, 36],
          knee_l: [62, 44], knee_r: [62, 52],
        }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Lift hips — stack pelvis",
        muscles: ["obliques", "quadratus_lumborum", "gluteus_medius"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_SUPINE, {
          skull: [20, 40], t_spine: [34, 44], pelvis: [50, 46],
          hip_l: [52, 42], hip_r: [52, 50],
          elbow_l: [24, 40],
        }),
        duration: 30, breath: "natural", easing: "linear",
        cue: "Hold 20-40 sec — breathe normally",
      },
      {
        name: "Lower",
        pose: poseFrom(NEUTRAL_SUPINE, {
          skull: [20, 44], t_spine: [34, 48], pelvis: [50, 52],
          hip_l: [52, 48], hip_r: [52, 56],
        }),
        duration: 2, breath: "inhale", easing: "easeInOut",
        cue: "Lower with control",
      },
    ],
    form_checks: ["Pelvis stacked", "Shoulder vertical over elbow", "No hip sag"],
    highlight_muscles: ["obliques", "quadratus_lumborum", "gluteus_medius"],
  },

  // ─── 17. PALLOF PRESS ─────────────────
  {
    exercise_id: "back_017",
    exercise_name: "Pallof Press",
    program_tag: "Low Back P2P",
    difficulty: 2,
    equipment: "band",
    position: "standing",
    view_angle_default: "front",
    goal: "stability",
    primary_outcome: "Anti-rotation core strength",
    movement_type: "press",
    primary_joints: ["core"],
    locked_segments: ["pelvis", "thoracic_spine"],
    planes: ["transverse"],
    phases: [
      {
        name: "Setup",
        pose: poseFrom(NEUTRAL_STANDING, {
          hand_l: [42, 34], hand_r: [52, 34],
          wrist_l: [42, 36], wrist_r: [52, 36],
          elbow_l: [38, 38], elbow_r: [56, 38],
        }),
        duration: 1, breath: "natural", easing: "easeInOut",
        cue: "Band at chest, stand athletic",
      },
      {
        name: "Press Out",
        pose: poseFrom(NEUTRAL_STANDING, {
          hand_l: [42, 34], hand_r: [52, 34],
          wrist_l: [42, 36], wrist_r: [52, 36],
          elbow_l: [40, 34], elbow_r: [54, 34],
        }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Press hands straight out — resist rotation",
        muscles: ["obliques", "transverse_abdominis"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_STANDING, {
          hand_l: [42, 34], hand_r: [52, 34],
          elbow_l: [40, 34], elbow_r: [54, 34],
        }),
        duration: 2, breath: "hold", easing: "linear",
        cue: "Hold — ribs stacked, resist pull",
      },
      {
        name: "Return",
        pose: poseFrom(NEUTRAL_STANDING, {
          elbow_l: [38, 38], elbow_r: [56, 38],
        }),
        duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Bring hands back to chest",
      },
    ],
    form_checks: ["No trunk rotation", "Ribs stacked over pelvis"],
    highlight_muscles: ["obliques", "transverse_abdominis"],
  },

  // ─── 18. HIP HINGE DRILL ─────────────────
  {
    exercise_id: "back_018",
    exercise_name: "Hip Hinge Drill",
    program_tag: "Low Back P2P",
    difficulty: 2,
    equipment: "wall",
    position: "standing",
    view_angle_default: "side",
    goal: "mobility",
    primary_outcome: "Teach hip hinge pattern, spare lumbar spine",
    movement_type: "hinge",
    primary_joints: ["hip"],
    locked_segments: ["lumbar_neutral"],
    planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand arm's length from wall" },
      {
        name: "Hinge",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [42, 20], c_spine: [44, 26], t_spine: [46, 34], l_spine: [48, 42],
          pelvis: [54, 50], sacrum: [56, 52],
          hip_l: [50, 52], hip_r: [58, 52],
          knee_l: [44, 66], knee_r: [58, 66],
        }),
        duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Push hips back — chest stays proud",
        muscles: ["hamstrings", "gluteus_maximus"],
      },
      { name: "Touch Wall", pose: poseFrom(NEUTRAL_STANDING, { skull: [42, 20], pelvis: [56, 52], sacrum: [58, 54] }), duration: 1, breath: "hold", easing: "linear", cue: "Tap wall with hips" },
      {
        name: "Drive Up",
        pose: NEUTRAL_STANDING,
        duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Squeeze glutes — stand tall",
        muscles: ["gluteus_maximus"],
      },
    ],
    form_checks: ["Lumbar stays neutral", "Pelvis translates posterior", "Soft knee bend"],
    highlight_muscles: ["hamstrings", "gluteus_maximus"],
  },

  // ─── 19. 90/90 HIP IR ─────────────────
  {
    exercise_id: "back_019",
    exercise_name: "90/90 Hip Internal Rotation",
    program_tag: "Low Back P2P",
    difficulty: 2,
    equipment: "none",
    position: "seated",
    view_angle_default: "front",
    goal: "mobility",
    primary_outcome: "Improve hip internal rotation, pelvic mobility",
    movement_type: "rotation",
    primary_joints: ["hip"],
    locked_segments: ["pelvis_upright"],
    planes: ["transverse"],
    phases: [
      {
        name: "90/90 Position",
        pose: poseFrom(NEUTRAL_SEATED, {
          knee_l: [36, 62], knee_r: [64, 62],
          ankle_l: [22, 56], ankle_r: [78, 56],
          hip_l: [40, 50], hip_r: [60, 50],
        }),
        duration: 1, breath: "natural", easing: "easeInOut",
        cue: "Both knees at 90° — sit tall",
      },
      {
        name: "Transition Left",
        pose: poseFrom(NEUTRAL_SEATED, {
          knee_l: [36, 64], knee_r: [54, 62],
          ankle_l: [22, 58], ankle_r: [64, 56],
          hip_l: [40, 52], hip_r: [56, 50],
        }),
        duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1],
        cue: "Rotate knees to left — control the movement",
        muscles: ["hip_internal_rotators", "gluteus_medius"],
      },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [36, 64], ankle_l: [22, 58] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — stay upright" },
      {
        name: "Transition Right",
        pose: poseFrom(NEUTRAL_SEATED, {
          knee_l: [46, 62], knee_r: [64, 64],
          ankle_l: [36, 56], ankle_r: [78, 58],
        }),
        duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1],
        cue: "Rotate knees to right",
        muscles: ["hip_internal_rotators", "gluteus_medius"],
      },
      { name: "Return", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [36, 62], knee_r: [64, 62] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Return to center" },
    ],
    form_checks: ["Pelvis stays upright", "Slow controlled transitions"],
    highlight_muscles: ["hip_internal_rotators", "gluteus_medius"],
  },

  // ─── 20. JEFFERSON CURL ─────────────────
  {
    exercise_id: "back_020",
    exercise_name: "Jefferson Curl",
    program_tag: "Low Back P2P",
    difficulty: 4,
    equipment: "light_dumbbell",
    position: "standing",
    view_angle_default: "side",
    goal: "mobility",
    primary_outcome: "Segmental spinal flexion under load",
    movement_type: "curl",
    primary_joints: ["cervical_spine", "thoracic_spine", "lumbar_spine"],
    locked_segments: ["knees_straight"],
    planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall, light weight in front" },
      {
        name: "Cervical Curl",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 16], c_spine: [50, 22],
        }),
        duration: 1, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Tuck chin first",
      },
      {
        name: "Thoracic Curl",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 26], c_spine: [50, 28], t_spine: [50, 34],
          shoulder_l: [40, 30], shoulder_r: [60, 30],
          hand_l: [38, 40], hand_r: [62, 40],
        }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Roll thoracic spine down",
        muscles: ["erector_spinae"],
      },
      {
        name: "Full Curl",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 42], c_spine: [50, 38], t_spine: [50, 36], l_spine: [50, 40],
          shoulder_l: [42, 38], shoulder_r: [58, 38],
          hand_l: [44, 56], hand_r: [56, 56],
          wrist_l: [44, 54], wrist_r: [56, 54],
        }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Reach toward floor — 5 sec total descent",
        muscles: ["erector_spinae", "hamstrings"],
      },
      {
        name: "Unroll",
        pose: NEUTRAL_STANDING,
        duration: 5, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Stack back up — lumbar first, then thoracic, then cervical",
      },
    ],
    form_checks: ["Very light load only", "Slow 5-second descent", "Stack segmentally on return"],
    highlight_muscles: ["erector_spinae", "hamstrings"],
  },

  // ─── 21. REVERSE LUNGE ─────────────────
  {
    exercise_id: "back_021",
    exercise_name: "Reverse Lunge",
    program_tag: "Low Back P2P",
    difficulty: 3,
    equipment: "none",
    position: "standing",
    view_angle_default: "side",
    goal: "strength",
    primary_outcome: "Single-leg strength, hip stability",
    movement_type: "lunge",
    primary_joints: ["hip", "knee"],
    locked_segments: ["pelvis_neutral", "torso_upright"],
    planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall, feet hip width" },
      {
        name: "Step Back",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 14], pelvis: [50, 48],
          knee_l: [44, 62], knee_r: [62, 68],
          ankle_l: [42, 76], ankle_r: [66, 80],
          heel_l: [41, 79], heel_r: [68, 82],
          hip_l: [46, 48], hip_r: [54, 50],
        }),
        duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1],
        cue: "Step back — lower with control",
        muscles: ["quadriceps", "gluteus_maximus"],
      },
      {
        name: "Bottom Hold",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [50, 14], pelvis: [50, 50],
          knee_l: [44, 64], knee_r: [64, 70],
          ankle_l: [42, 78], ankle_r: [68, 82],
        }),
        duration: 1, breath: "hold", easing: "linear",
        cue: "Pause — knee tracks over 2nd toe",
      },
      {
        name: "Drive Up",
        pose: NEUTRAL_STANDING,
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Drive through front heel — stand tall",
        muscles: ["gluteus_maximus", "quadriceps"],
      },
    ],
    form_checks: ["Knee tracks over 2nd toe", "Pelvis neutral", "Torso upright"],
    highlight_muscles: ["quadriceps", "gluteus_maximus"],
  },

  // ─── 22. ROMANIAN DEADLIFT (distinct from Hip Hinge #18: loaded, deeper, hamstring bias) ─────
  {
    exercise_id: "back_022",
    exercise_name: "Romanian Deadlift",
    program_tag: "Low Back P2P",
    difficulty: 3,
    equipment: "dumbbell",
    position: "standing",
    view_angle_default: "side",
    goal: "strength",
    primary_outcome: "Loaded hamstring eccentric, hip hinge under tension",
    movement_type: "hinge",
    primary_joints: ["hip"],
    locked_segments: ["spine_neutral", "scapula_retracted"],
    planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 48], hand_r: [62, 48], wrist_l: [38, 46], wrist_r: [62, 46], scap_l: [42, 28], scap_r: [58, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Weights in front, shoulders packed, soft knees" },
      {
        name: "Eccentric Lower",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [36, 28], c_spine: [38, 32], t_spine: [42, 38], l_spine: [46, 44],
          pelvis: [58, 54], sacrum: [60, 56],
          hand_l: [42, 62], hand_r: [58, 62],
          wrist_l: [42, 60], wrist_r: [58, 60],
          knee_l: [44, 68], knee_r: [58, 68],
          hip_l: [48, 54], hip_r: [56, 54],
          scap_l: [42, 32], scap_r: [58, 32],
        }),
        duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1],
        cue: "Slide weights down shins — push hips FAR back",
        muscles: ["hamstrings", "erector_spinae", "gluteus_maximus"],
      },
      {
        name: "Stretch Hold",
        pose: poseFrom(NEUTRAL_STANDING, {
          skull: [34, 30], t_spine: [40, 40], l_spine: [46, 46],
          pelvis: [60, 56], hand_l: [42, 66], hand_r: [58, 66],
          knee_l: [44, 68], knee_r: [58, 68],
        }),
        duration: 2, breath: "hold", easing: "linear",
        cue: "Feel deep hamstring stretch — spine STAYS neutral",
      },
      {
        name: "Concentric Drive",
        pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 48], hand_r: [62, 48], scap_l: [42, 28], scap_r: [58, 28] }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Squeeze glutes HARD — drive hips through",
        muscles: ["gluteus_maximus", "hamstrings"],
      },
    ],
    form_checks: ["Spine STAYS neutral — no rounding", "Weights stay close to legs", "Knees soft but NOT bending more", "Hamstring bias, not lumbar"],
    highlight_muscles: ["hamstrings", "gluteus_maximus", "erector_spinae"],
  },

  // ─── 23-32: NECK / SHOULDER SERIES ─────────────────

  // 23. Deep Neck Flexor Hold
  {
    exercise_id: "neck_023",
    exercise_name: "Deep Neck Flexor Hold",
    program_tag: "Neck Relief",
    difficulty: 1,
    equipment: "none",
    position: "supine",
    view_angle_default: "side",
    goal: "stability",
    primary_outcome: "Activate deep neck flexors, reduce SCM dominance",
    movement_type: "isometric",
    primary_joints: ["C1_C7"],
    locked_segments: ["thoracic_spine"],
    planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SUPINE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie on back, no pillow" },
      {
        name: "Chin Nod",
        pose: poseFrom(NEUTRAL_SUPINE, { skull: [14, 50], c_spine: [18, 50] }),
        duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1],
        cue: "Gentle chin nod — very small movement",
        muscles: ["deep_neck_flexors", "longus_colli"],
      },
      {
        name: "Hold",
        pose: poseFrom(NEUTRAL_SUPINE, { skull: [14, 50], c_spine: [18, 50] }),
        duration: 10, breath: "natural", easing: "linear",
        cue: "Hold 10 sec — no SCM bulging",
      },
      { name: "Release", pose: NEUTRAL_SUPINE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release gently" },
    ],
    form_checks: ["No SCM dominance", "Very subtle movement", "10-sec holds"],
    highlight_muscles: ["deep_neck_flexors", "longus_colli"],
  },

  // 24. Scapular CARs
  {
    exercise_id: "shoulder_024",
    exercise_name: "Scapular CARs",
    program_tag: "Shoulder Relief",
    difficulty: 2,
    equipment: "none",
    position: "standing",
    view_angle_default: "front",
    goal: "mobility",
    primary_outcome: "Full scapular ROM, proprioception",
    movement_type: "rotation",
    primary_joints: ["scapula"],
    locked_segments: ["thoracic_spine"],
    planes: ["frontal", "sagittal", "transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall, relax arms" },
      {
        name: "Elevate",
        pose: poseFrom(NEUTRAL_STANDING, { scap_l: [40, 22], scap_r: [60, 22], shoulder_l: [38, 20], shoulder_r: [62, 20] }),
        duration: 2, breath: "inhale", easing: [0.3, 0, 0.2, 1],
        cue: "Shrug up slowly",
        muscles: ["upper_trapezius"],
      },
      {
        name: "Retract",
        pose: poseFrom(NEUTRAL_STANDING, { scap_l: [42, 24], scap_r: [58, 24], shoulder_l: [40, 22], shoulder_r: [60, 22] }),
        duration: 2, breath: "hold", easing: [0.3, 0, 0.2, 1],
        cue: "Squeeze back",
        muscles: ["rhomboids"],
      },
      {
        name: "Depress",
        pose: poseFrom(NEUTRAL_STANDING, { scap_l: [40, 30], scap_r: [60, 30], shoulder_l: [38, 28], shoulder_r: [62, 28] }),
        duration: 2, breath: "exhale", easing: [0.3, 0, 0.2, 1],
        cue: "Pull down",
        muscles: ["lower_trapezius"],
      },
      {
        name: "Protract",
        pose: poseFrom(NEUTRAL_STANDING, { scap_l: [36, 27], scap_r: [64, 27], shoulder_l: [34, 25], shoulder_r: [66, 25] }),
        duration: 2, breath: "hold", easing: [0.3, 0, 0.2, 1],
        cue: "Reach forward",
        muscles: ["serratus_anterior"],
      },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Complete the circle" },
    ],
    form_checks: ["No thoracic sway", "5 sec per position", "Full controlled circles"],
    highlight_muscles: ["upper_trapezius", "rhomboids", "lower_trapezius", "serratus_anterior"],
  },

  // 25-32 abbreviated but following same pattern
  // 25. Shoulder ER
  {
    exercise_id: "shoulder_025", exercise_name: "Shoulder External Rotation", program_tag: "Shoulder Relief",
    difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front",
    goal: "strength", primary_outcome: "Rotator cuff strengthening",
    movement_type: "rotation", primary_joints: ["glenohumeral"], locked_segments: ["scapula_stable"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [38, 38], elbow_r: [62, 38], hand_l: [44, 38], hand_r: [56, 38] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Elbows pinned at sides" },
      { name: "Rotate Out", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [26, 38], hand_r: [74, 38], wrist_l: [28, 38], wrist_r: [72, 38] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Rotate out — elbows stay pinned", muscles: ["infraspinatus", "teres_minor"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [26, 38], hand_r: [74, 38] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel rotator cuff" },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 38], hand_r: [56, 38] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Return slowly" },
    ],
    form_checks: ["Elbow pinned to side", "Scapula stable"], highlight_muscles: ["infraspinatus", "teres_minor"],
  },

  // 26. Prone Y Raise
  {
    exercise_id: "shoulder_026", exercise_name: "Prone Y Raise", program_tag: "Shoulder Relief",
    difficulty: 2, equipment: "none", position: "prone", view_angle_default: "side",
    goal: "stability", primary_outcome: "Lower trap activation",
    movement_type: "raise", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["neck_neutral", "ribs_down"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_PRONE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie face down, arms at sides" },
      { name: "Raise Y", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [10, 36], hand_r: [10, 64], wrist_l: [12, 36], wrist_r: [12, 64], elbow_l: [16, 38], elbow_r: [16, 62] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift arms into Y — squeeze lower traps", muscles: ["lower_trapezius", "serratus_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [10, 36], hand_r: [10, 64] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold — neck stays neutral" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower with control" },
    ],
    form_checks: ["Neck neutral", "Ribs stay down", "No lumbar extension"], highlight_muscles: ["lower_trapezius"],
  },

  // 27-32: Abbreviated specs
  { exercise_id: "shoulder_027", exercise_name: "Wall Slide with Lift Off", program_tag: "Shoulder Relief", difficulty: 2, equipment: "wall", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "Scapular upward rotation with end-range activation", movement_type: "slide_lift", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["lumbar_neutral", "rib_cage_down"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Start Low", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [32, 34], elbow_r: [68, 34], wrist_l: [30, 28], wrist_r: [70, 28], hand_l: [29, 26], hand_r: [71, 26], scap_l: [40, 28], scap_r: [60, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Forearms flat on wall, elbows below shoulders" },
      { name: "Slide Up Overhead", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [38, 14], elbow_r: [62, 14], wrist_l: [40, 4], wrist_r: [60, 4], hand_l: [40, 2], hand_r: [60, 2], scap_l: [42, 22], scap_r: [58, 22], shoulder_l: [38, 18], shoulder_r: [62, 18] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Slide overhead — scapula tilts posteriorly", muscles: ["serratus_anterior", "lower_trapezius"] },
      { name: "Lift Off Wall", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [38, 12], elbow_r: [62, 12], wrist_l: [40, 2], wrist_r: [60, 2], hand_l: [40, 0], hand_r: [60, 0], scap_l: [43, 21], scap_r: [57, 21] }), duration: 2, breath: "hold", easing: [0.3, 0, 0.2, 1], cue: "Peel hands off wall — hold 2 sec", muscles: ["lower_trapezius", "serratus_anterior", "infraspinatus"] },
      { name: "Replace on Wall", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [38, 14], elbow_r: [62, 14], wrist_l: [40, 4], wrist_r: [60, 4] }), duration: 1, breath: "exhale", easing: "easeInOut", cue: "Place hands back gently" },
      { name: "Slide Down", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [32, 34], elbow_r: [68, 34], wrist_l: [30, 28], wrist_r: [70, 28], hand_l: [29, 26], hand_r: [71, 26] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Slide back to start — ribs stay flat" },
    ], form_checks: ["Ribs stay flat throughout", "Posterior scapular tilt at top", "Hands lift only 1-2 inches"], highlight_muscles: ["serratus_anterior", "lower_trapezius", "infraspinatus"] },

  { exercise_id: "shoulder_028", exercise_name: "Serratus Punch", program_tag: "Shoulder Relief", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "Scapular protraction", movement_type: "punch", primary_joints: ["scapula"], locked_segments: ["ribs_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [22, 36], wrist_r: [22, 64] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Arms straight up" },
      { name: "Punch Up", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [18, 36], wrist_r: [18, 64], scap_l: [20, 42], scap_r: [20, 58] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Reach ceiling — protract scapula", muscles: ["serratus_anterior"] },
      { name: "Return", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [22, 36], wrist_r: [22, 64] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Let scapula settle back" },
    ], form_checks: ["Ribs stay neutral", "Reach from scapula, not elbows"], highlight_muscles: ["serratus_anterior"] },

  { exercise_id: "neck_029", exercise_name: "Levator Scap Stretch", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "mobility", primary_outcome: "Release levator scapulae tension", movement_type: "stretch_hold", primary_joints: ["cervical_spine", "scapula"], locked_segments: [], planes: ["sagittal", "transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall" },
      { name: "Flex & Rotate", pose: poseFrom(NEUTRAL_SEATED, { skull: [42, 18], c_spine: [44, 22], shoulder_r: [62, 28] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Look into armpit — depress opposite shoulder", muscles: ["levator_scapulae"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { skull: [42, 18], c_spine: [44, 22], shoulder_r: [62, 28] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold 20 sec — breathe" },
      { name: "Release", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release slowly" },
    ], form_checks: ["Depress opposite shoulder", "Gentle stretch only"], highlight_muscles: ["levator_scapulae"] },

  { exercise_id: "neck_030", exercise_name: "Thread the Needle", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "quadruped", view_angle_default: "front", goal: "mobility", primary_outcome: "Thoracic rotation, upper back release", movement_type: "rotation", primary_joints: ["thoracic_spine"], locked_segments: ["hips_stable"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours position" },
      { name: "Thread Under", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_r: [36, 56], wrist_r: [34, 54], elbow_r: [30, 50], skull: [30, 48], c_spine: [32, 46], shoulder_r: [32, 48] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Thread right arm under — rotate thoracic", muscles: ["obliques", "rhomboids"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_r: [36, 56], skull: [30, 48] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel upper back stretch" },
      { name: "Open Up", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_r: [22, 30], wrist_r: [20, 32], skull: [24, 34], shoulder_r: [28, 34] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Open to ceiling — rotate the other way", muscles: ["obliques", "rhomboids"] },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Return to start" },
    ], form_checks: ["Hips stay stable", "Rotation from thoracic, not lumbar"], highlight_muscles: ["obliques", "rhomboids"] },

  { exercise_id: "shoulder_031", exercise_name: "Farmer Carry", program_tag: "Shoulder Relief", difficulty: 2, equipment: "dumbbell", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Anti-lateral flexion, grip strength", movement_type: "carry", primary_joints: ["core", "grip"], locked_segments: ["rib_stack", "neutral_gaze"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [30, 52], hand_r: [70, 52] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Hold weights at sides, stand tall" },
      { name: "Walk Phase 1", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 60], knee_r: [58, 68], heel_l: [41, 76], forefoot_r: [60, 84] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Walk with control — don't lean", muscles: ["obliques", "quadratus_lumborum"] },
      { name: "Walk Phase 2", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 68], knee_r: [58, 60], forefoot_l: [44, 84], heel_r: [57, 76] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Stay stacked — ribs over hips" },
      { name: "Walk Phase 3", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 60], knee_r: [58, 68] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "30 seconds total" },
    ], form_checks: ["No lateral lean", "Neutral gaze forward", "Ribs stacked"], highlight_muscles: ["obliques", "quadratus_lumborum"] },

  { exercise_id: "shoulder_032", exercise_name: "Face Pull", program_tag: "Shoulder Relief", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Scapular retraction + external rotation", movement_type: "pull", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["core_braced"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [40, 28], hand_r: [60, 28], elbow_l: [38, 32], elbow_r: [62, 32] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Band at face height, arms extended" },
      { name: "Pull", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [32, 22], hand_r: [68, 22], elbow_l: [34, 28], elbow_r: [66, 28], scap_l: [42, 28], scap_r: [58, 28] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Pull to face — elbows 90°, externally rotate", muscles: ["rhomboids", "posterior_deltoid", "infraspinatus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [32, 22], hand_r: [68, 22] }), duration: 2, breath: "hold", easing: "linear", cue: "Squeeze shoulder blades — feel upper back" },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [40, 28], hand_r: [60, 28] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Slow control back" },
    ], form_checks: ["Elbows at 90°", "Slow control", "No shrugging"], highlight_muscles: ["rhomboids", "posterior_deltoid", "infraspinatus"] },

  // ─── 33-42: HIP / LOWER BODY SERIES ─────────────────

  { exercise_id: "hip_033", exercise_name: "Half Kneeling Hip Flexor Stretch", program_tag: "Hip Relief", difficulty: 1, equipment: "none", position: "half_kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Release hip flexors", movement_type: "stretch_hold", primary_joints: ["hip"], locked_segments: ["pelvis_posterior_tilt", "lumbar_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], ankle_r: [66, 82], pelvis: [50, 50], knee_l: [44, 58] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Half kneeling — tuck pelvis" },
      { name: "Shift Forward", pose: poseFrom(NEUTRAL_STANDING, { skull: [50, 14], pelvis: [52, 48], knee_l: [40, 56], knee_r: [62, 72] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Shift forward — posterior tilt first", muscles: ["iliopsoas", "rectus_femoris"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [52, 48], knee_l: [40, 56] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold 20 sec — squeeze back glute" },
      { name: "Release", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], knee_l: [44, 58] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Shift back" },
    ], form_checks: ["Posterior pelvic tilt FIRST", "Glute activation", "No lumbar extension"], highlight_muscles: ["iliopsoas", "rectus_femoris", "gluteus_maximus"] },

  { exercise_id: "hip_034", exercise_name: "Lateral Band Walk", program_tag: "Hip Relief", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Hip abductor activation", movement_type: "walk", primary_joints: ["hip"], locked_segments: ["pelvis_level"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [40, 64], knee_r: [60, 64] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Band above knees, slight squat" },
      { name: "Step Left", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [32, 81], forefoot_l: [35, 82], knee_l: [34, 64], hip_l: [40, 48] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Step wide left — resist band", muscles: ["gluteus_medius", "tensor_fasciae_latae"] },
      { name: "Follow", pose: poseFrom(NEUTRAL_STANDING, { heel_r: [48, 81], forefoot_r: [51, 82], knee_r: [50, 64] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Follow with right — maintain tension" },
      { name: "Step Right", pose: poseFrom(NEUTRAL_STANDING, { heel_r: [66, 81], forefoot_r: [69, 82], knee_r: [64, 64], hip_r: [60, 48] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Step wide right", muscles: ["gluteus_medius"] },
      { name: "Follow Back", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Follow with left" },
    ], form_checks: ["Pelvis stays level", "Knees slightly bent", "Don't lean"], highlight_muscles: ["gluteus_medius", "tensor_fasciae_latae"] },

  { exercise_id: "hip_035", exercise_name: "Cossack Squat", program_tag: "Hip Relief", difficulty: 3, equipment: "none", position: "standing", view_angle_default: "front", goal: "mobility", primary_outcome: "Frontal plane hip mobility", movement_type: "squat", primary_joints: ["hip", "knee", "ankle"], locked_segments: ["spine_neutral"], planes: ["frontal"],
    phases: [
      { name: "Wide Stance", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [28, 81], heel_r: [72, 81], forefoot_l: [31, 82], forefoot_r: [75, 82], knee_l: [30, 64], knee_r: [70, 64] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Wide stance, toes slightly out" },
      { name: "Shift Left", pose: poseFrom(NEUTRAL_STANDING, { skull: [38, 16], pelvis: [38, 54], hip_l: [36, 52], knee_l: [30, 68], ankle_l: [28, 80], knee_r: [70, 60] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Shift to left — squat deep, right leg straight", muscles: ["adductors", "quadriceps", "gluteus_maximus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [38, 16], pelvis: [38, 54], knee_l: [30, 68] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — heel stays down" },
      { name: "Center", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [28, 81], heel_r: [72, 81], knee_l: [30, 64], knee_r: [70, 64] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Return to center" },
      { name: "Shift Right", pose: poseFrom(NEUTRAL_STANDING, { skull: [62, 16], pelvis: [62, 54], hip_r: [64, 52], knee_r: [70, 68], ankle_r: [72, 80], knee_l: [30, 60] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Shift to right", muscles: ["adductors", "quadriceps"] },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [28, 81], heel_r: [72, 81] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Return to center" },
    ], form_checks: ["Heel stays down on squat side", "Hip shift, not lean"], highlight_muscles: ["adductors", "quadriceps", "gluteus_maximus"] },

  { exercise_id: "hip_036", exercise_name: "Single Leg RDL", program_tag: "Hip Relief", difficulty: 3, equipment: "none", position: "standing", view_angle_default: "side", goal: "stability", primary_outcome: "Single-leg hip hinge, balance", movement_type: "hinge", primary_joints: ["hip"], locked_segments: ["pelvis_square", "spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand on left leg" },
      { name: "Hinge", pose: poseFrom(NEUTRAL_STANDING, { skull: [40, 24], t_spine: [44, 34], l_spine: [46, 42], pelvis: [52, 48], knee_r: [68, 48], ankle_r: [78, 44], heel_r: [80, 44], hand_l: [40, 54], hand_r: [60, 54] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Hinge — back leg extends, chest drops", muscles: ["hamstrings", "gluteus_maximus", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [40, 24], pelvis: [52, 48], knee_r: [68, 48] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — pelvis stays square" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Stand tall — squeeze glute" },
    ], form_checks: ["Pelvis stays square", "Slow descent", "Spine neutral"], highlight_muscles: ["hamstrings", "gluteus_maximus", "gluteus_medius"] },

  { exercise_id: "hip_037", exercise_name: "Step Down Control", program_tag: "Hip Relief", difficulty: 3, equipment: "step", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Eccentric quad control", movement_type: "step_down", primary_joints: ["knee", "hip"], locked_segments: ["pelvis_level"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 76], heel_r: [57, 76] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand on step, one foot near edge" },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [43, 68], ankle_r: [58, 84], heel_r: [57, 86], pelvis: [50, 50] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower slowly — knee tracks over toes", muscles: ["quadriceps", "gluteus_medius"] },
      { name: "Tap", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [43, 70], heel_r: [57, 88] }), duration: 1, breath: "hold", easing: "linear", cue: "Tap heel — don't rest weight" },
      { name: "Drive Up", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 76], heel_r: [57, 76] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive up through stance leg" },
    ], form_checks: ["Knee tracks over toes", "Pelvis stays level", "Slow eccentric"], highlight_muscles: ["quadriceps", "gluteus_medius"] },

  { exercise_id: "hip_038", exercise_name: "Tibialis Raises", program_tag: "Hip Relief", difficulty: 1, equipment: "none", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Ankle dorsiflexion strength", movement_type: "raise", primary_joints: ["ankle"], locked_segments: ["knee_locked"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lean back against wall, heels out" },
      { name: "Lift Toes", pose: poseFrom(NEUTRAL_STANDING, { forefoot_l: [44, 78], forefoot_r: [60, 78], ankle_l: [42, 76], ankle_r: [58, 76] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift toes up — flex at ankle", muscles: ["tibialis_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { forefoot_l: [44, 78], forefoot_r: [60, 78] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold top" },
      { name: "Lower", pose: NEUTRAL_STANDING, duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower slowly" },
    ], form_checks: ["Heels stay down", "Full ROM"], highlight_muscles: ["tibialis_anterior"] },

  { exercise_id: "hip_039", exercise_name: "Calf Raise Tempo", program_tag: "Hip Relief", difficulty: 1, equipment: "none", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Calf strengthening with tempo control", movement_type: "raise", primary_joints: ["ankle"], locked_segments: ["knee_straight"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand on edge of step" },
      { name: "Rise", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 76], heel_r: [57, 76], ankle_l: [42, 74], ankle_r: [58, 74] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "2 sec up", muscles: ["gastrocnemius", "soleus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 76], heel_r: [57, 76] }), duration: 2, breath: "hold", easing: "linear", cue: "2 sec hold" },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 84], heel_r: [57, 84] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "3 sec lower — controlled eccentric" },
    ], form_checks: ["Full ROM", "Controlled 3-sec eccentric"], highlight_muscles: ["gastrocnemius", "soleus"] },

  { exercise_id: "hip_040", exercise_name: "Ankle CARs", program_tag: "Hip Relief", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "mobility", primary_outcome: "Full ankle ROM, proprioception", movement_type: "rotation", primary_joints: ["ankle"], locked_segments: ["knee_locked"], planes: ["sagittal", "frontal", "transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 58] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Cross ankle over knee" },
      { name: "Dorsiflex", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 72], ankle_r: [70, 70] }), duration: 2, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Pull toes up" },
      { name: "Invert", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [68, 74] }), duration: 2, breath: "hold", easing: [0.3, 0, 0.2, 1], cue: "Turn sole inward" },
      { name: "Plantarflex", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 78], ankle_r: [70, 74] }), duration: 2, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Point toes down" },
      { name: "Evert", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [76, 76] }), duration: 2, breath: "hold", easing: [0.3, 0, 0.2, 1], cue: "Turn sole outward" },
      { name: "Complete", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 58] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Complete the circle" },
    ], form_checks: ["Full controlled rotation", "Knee stays locked"], highlight_muscles: ["tibialis_anterior", "peroneals"] },

  { exercise_id: "hip_041", exercise_name: "Copenhagen Plank", program_tag: "Hip Relief", difficulty: 3, equipment: "bench", position: "side_lying", view_angle_default: "front", goal: "strength", primary_outcome: "Adductor strengthening", movement_type: "isometric", primary_joints: ["hip"], locked_segments: ["pelvis_stacked"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], elbow_l: [24, 40], knee_r: [56, 48], ankle_r: [66, 48] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying, top leg on bench" },
      { name: "Lift", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 42], pelvis: [48, 44], hip_l: [50, 40], hip_r: [50, 48], elbow_l: [24, 40] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift hips — squeeze inner thigh", muscles: ["adductors", "obliques"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 42], pelvis: [48, 44] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — pelvis stacked" },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], pelvis: [48, 52] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower with control" },
    ], form_checks: ["Pelvis stacked", "Adductor bias"], highlight_muscles: ["adductors", "obliques"] },

  { exercise_id: "hip_042", exercise_name: "Split Squat", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Quad-dominant single-leg strength, static base", movement_type: "squat", primary_joints: ["knee", "hip"], locked_segments: ["torso_vertical", "feet_fixed"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 58], knee_r: [64, 62], heel_r: [68, 78], forefoot_l: [40, 80], forefoot_r: [70, 82], hip_l: [44, 48], hip_r: [56, 48], ankle_r: [68, 76] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Static split stance — feet stay planted" },
      { name: "Descend Vertical", pose: poseFrom(NEUTRAL_STANDING, { skull: [50, 20], c_spine: [50, 26], t_spine: [50, 34], pelvis: [50, 56], knee_l: [38, 68], knee_r: [68, 76], ankle_r: [70, 84], hip_l: [44, 54], hip_r: [56, 54], heel_r: [72, 86] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Drop straight down — torso stays vertical", muscles: ["quadriceps", "rectus_femoris"] },
      { name: "Bottom Pause", pose: poseFrom(NEUTRAL_STANDING, { skull: [50, 22], pelvis: [50, 58], knee_l: [36, 70], knee_r: [68, 78], hip_l: [44, 56], hip_r: [56, 56] }), duration: 2, breath: "hold", easing: "linear", cue: "Pause — back knee hovers 1 inch off floor" },
      { name: "Drive Up", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 58], knee_r: [64, 62], heel_r: [68, 78], hip_l: [44, 48], hip_r: [56, 48] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Push through front foot — extend both knees", muscles: ["quadriceps", "gluteus_maximus"] },
    ], form_checks: ["Torso stays VERTICAL (unlike lunge forward lean)", "Feet stay planted — no stepping", "Back knee hovers, doesn't touch"], highlight_muscles: ["quadriceps", "rectus_femoris", "gluteus_maximus"] },

  // ─── 43-50: BREATH + NERVOUS SYSTEM ─────────────────

  { exercise_id: "breath_043", exercise_name: "Crocodile Breathing", program_tag: "Breath", difficulty: 1, equipment: "none", position: "prone", view_angle_default: "side", goal: "neural_downshift", primary_outcome: "Diaphragmatic breathing, belly expansion", movement_type: "breath", primary_joints: ["diaphragm", "rib_cage"], locked_segments: ["spine"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [14, 46], hand_r: [14, 54] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie face down, forehead on hands" },
      { name: "Inhale", pose: poseFrom(NEUTRAL_PRONE, { rib_l: [28, 42], rib_r: [28, 58], pelvis: [48, 50] }), duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Breathe into belly — feel floor push back", muscles: ["diaphragm"] },
      { name: "Exhale", pose: poseFrom(NEUTRAL_PRONE, { rib_l: [28, 44], rib_r: [28, 56] }), duration: 6, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Long slow exhale" },
    ], form_checks: ["Belly expands into floor", "Ribs expand laterally", "No chest breathing"], highlight_muscles: ["diaphragm"] },

  { exercise_id: "breath_044", exercise_name: "90/90 Breathing", program_tag: "Breath", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "side", goal: "neural_downshift", primary_outcome: "ZOA position, parasympathetic activation", movement_type: "breath", primary_joints: ["diaphragm", "pelvis"], locked_segments: ["spine_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62], pelvis: [46, 50], sacrum: [48, 50] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Feet on wall, hips & knees at 90°" },
      { name: "Posterior Tilt", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [44, 50], sacrum: [46, 50], l_spine: [38, 50] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Flatten low back — exhale fully", muscles: ["rectus_abdominis", "hamstrings"] },
      { name: "Inhale", pose: poseFrom(NEUTRAL_SUPINE, { rib_l: [28, 42], rib_r: [28, 58], pelvis: [44, 50] }), duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Inhale through nose — ribs expand" },
      { name: "Long Exhale", pose: poseFrom(NEUTRAL_SUPINE, { rib_l: [28, 44], rib_r: [28, 56], pelvis: [44, 50] }), duration: 8, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Long exhale through pursed lips" },
    ], form_checks: ["Hamstrings engaged", "Low back flat", "Rib expansion, not chest rise"], highlight_muscles: ["diaphragm", "rectus_abdominis"] },

  { exercise_id: "breath_045", exercise_name: "Cyclic Sigh", program_tag: "Breath", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "neural_downshift", primary_outcome: "Fast mood improvement, parasympathetic activation", movement_type: "breath", primary_joints: ["diaphragm"], locked_segments: ["spine_tall"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit comfortably" },
      { name: "Inhale 1", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [40, 30], rib_r: [60, 30] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Inhale through nose" },
      { name: "Top-Up Inhale", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [38, 30], rib_r: [62, 30], sternum: [50, 24] }), duration: 1, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Quick second inhale — top up lungs", muscles: ["diaphragm"] },
      { name: "Long Exhale", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [42, 30], rib_r: [58, 30] }), duration: 6, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Long slow exhale through mouth" },
    ], form_checks: ["Double inhale before exhale", "Exhale longer than inhale"], highlight_muscles: ["diaphragm"] },

  { exercise_id: "breath_046", exercise_name: "4-7-8 Breathing", program_tag: "Breath", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "neural_downshift", primary_outcome: "Deep relaxation, sleep preparation", movement_type: "breath", primary_joints: ["diaphragm"], locked_segments: ["spine_tall"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Close eyes, tongue behind upper teeth" },
      { name: "Inhale 4", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [38, 30], rib_r: [62, 30] }), duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Inhale quietly through nose — 4 counts" },
      { name: "Hold 7", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [39, 30], rib_r: [61, 30] }), duration: 7, breath: "hold", easing: "linear", cue: "Hold breath — 7 counts" },
      { name: "Exhale 8", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [42, 30], rib_r: [58, 30] }), duration: 8, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Exhale completely through mouth — 8 counts" },
    ], form_checks: ["Tongue placement", "Exhale audibly", "Complete exhale"], highlight_muscles: ["diaphragm"] },

  { exercise_id: "breath_047", exercise_name: "Coherent Breathing", program_tag: "Breath", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "neural_downshift", primary_outcome: "HRV improvement, nervous system balance", movement_type: "breath", primary_joints: ["diaphragm"], locked_segments: ["spine_tall"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit comfortably — eyes soft" },
      { name: "Inhale", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [38, 30], rib_r: [62, 30] }), duration: 5, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Inhale 5 seconds — smooth and even" },
      { name: "Exhale", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [42, 30], rib_r: [58, 30] }), duration: 5, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Exhale 5 seconds — match the inhale" },
    ], form_checks: ["5-6 breaths per minute", "Equal inhale and exhale", "Smooth transitions"], highlight_muscles: ["diaphragm"] },

  { exercise_id: "breath_048", exercise_name: "Box Breathing", program_tag: "Breath", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "neural_downshift", primary_outcome: "Focus and calm, HRV improvement", movement_type: "breath", primary_joints: ["diaphragm"], locked_segments: ["spine_tall"], planes: ["sagittal"],
    phases: [
      { name: "Inhale", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [38, 30], rib_r: [62, 30] }), duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Inhale — 4 counts" },
      { name: "Hold Top", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [39, 30], rib_r: [61, 30] }), duration: 4, breath: "hold", easing: "linear", cue: "Hold — 4 counts" },
      { name: "Exhale", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [42, 30], rib_r: [58, 30] }), duration: 4, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Exhale — 4 counts" },
      { name: "Hold Bottom", pose: poseFrom(NEUTRAL_SEATED, { rib_l: [42, 30], rib_r: [58, 30] }), duration: 4, breath: "hold", easing: "linear", cue: "Hold empty — 4 counts" },
    ], form_checks: ["Equal phases", "4-4-4-4 pattern"], highlight_muscles: ["diaphragm"] },

  { exercise_id: "breath_049", exercise_name: "Supine Rib Expansion Hold", program_tag: "Breath", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "front", goal: "neural_downshift", primary_outcome: "Lateral rib cage mobility, diaphragm control", movement_type: "breath", primary_joints: ["rib_cage", "diaphragm"], locked_segments: ["spine_flat"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SUPINE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie on back, hands on ribs" },
      { name: "Lateral Expand", pose: poseFrom(NEUTRAL_SUPINE, { rib_l: [28, 40], rib_r: [28, 60] }), duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Breathe into sides — push hands apart", muscles: ["diaphragm", "intercostals"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { rib_l: [28, 40], rib_r: [28, 60] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold rib expansion — 3 sec" },
      { name: "Slow Release", pose: NEUTRAL_SUPINE, duration: 5, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Slow exhale — ribs gently narrow" },
    ], form_checks: ["Lateral expansion, not chest rise", "Hands feel ribs spread"], highlight_muscles: ["diaphragm", "intercostals"] },

  { exercise_id: "breath_050", exercise_name: "Parasympathetic Downshift Combo", program_tag: "Breath", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "side", goal: "neural_downshift", primary_outcome: "Full nervous system reset", movement_type: "combo", primary_joints: ["cervical_spine", "pelvis", "diaphragm"], locked_segments: [], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SUPINE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie on back, eyes closed" },
      { name: "Slow Breath 1", pose: poseFrom(NEUTRAL_SUPINE, { rib_l: [28, 42], rib_r: [28, 58] }), duration: 5, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Deep breath 1 — fill ribs" },
      { name: "Long Exhale 1", pose: NEUTRAL_SUPINE, duration: 8, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Long exhale — let go" },
      { name: "Chin Tuck", pose: poseFrom(NEUTRAL_SUPINE, { skull: [14, 50], c_spine: [18, 50] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Gentle chin tuck — decompress neck", muscles: ["deep_neck_flexors"] },
      { name: "Release Tuck", pose: NEUTRAL_SUPINE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
      { name: "Pelvic Tilt", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [46, 50], sacrum: [48, 50] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Posterior pelvic tilt — flatten back", muscles: ["rectus_abdominis"] },
      { name: "Final Rest", pose: NEUTRAL_SUPINE, duration: 5, breath: "natural", easing: "easeInOut", cue: "Rest — feel the reset" },
    ], form_checks: ["Slow and controlled", "3 breaths minimum", "Complete relaxation at end"], highlight_muscles: ["diaphragm", "deep_neck_flexors", "rectus_abdominis"] },

  // ═══════════════════════════════════════════════════════════════
  // ADDITIONAL EXERCISES — Program-specific movements
  // ═══════════════════════════════════════════════════════════════

  // ─── PRESS UPS (Prone lumbar extension) ─────
  { exercise_id: "lb_051", exercise_name: "Press Ups", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "prone", view_angle_default: "side", goal: "mobility", primary_outcome: "Lumbar extension tolerance", movement_type: "extension", primary_joints: ["lumbar_spine"], locked_segments: ["hips_on_ground"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [20, 42], hand_r: [20, 58], elbow_l: [22, 40], elbow_r: [22, 60] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie face down, hands by shoulders" },
      { name: "Press Up", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50], c_spine: [16, 50], t_spine: [24, 50], l_spine: [36, 50], elbow_l: [18, 38], elbow_r: [18, 62], wrist_l: [16, 36], wrist_r: [16, 64], sternum: [18, 50] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Press up — keep hips on ground", muscles: ["erector_spinae"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50], t_spine: [24, 50], l_spine: [36, 50] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel extension" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower slowly" },
    ], form_checks: ["Hips stay on ground", "Don't force range"], highlight_muscles: ["erector_spinae"] },

  // ─── PRESS UPS W EXHALE ─────
  { exercise_id: "lb_052", exercise_name: "Press Ups w Exhale", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "prone", view_angle_default: "side", goal: "mobility", primary_outcome: "Lumbar extension with breath-driven end range", movement_type: "extension", primary_joints: ["lumbar_spine", "diaphragm"], locked_segments: ["hips_on_ground"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [20, 42], hand_r: [20, 58] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Prone, hands by shoulders" },
      { name: "Press Up", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], c_spine: [14, 50], t_spine: [22, 50], l_spine: [34, 50], elbow_l: [16, 36], elbow_r: [16, 64], sternum: [16, 50] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Press up higher than basic version" },
      { name: "Exhale at Top", pose: poseFrom(NEUTRAL_PRONE, { skull: [8, 50], t_spine: [20, 50], l_spine: [32, 50], rib_l: [24, 44], rib_r: [24, 56] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Exhale fully at top — sink deeper into extension", muscles: ["erector_spinae", "diaphragm"] },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower with control" },
    ], form_checks: ["Hips stay down", "Exhale drives deeper extension", "No pain"], highlight_muscles: ["erector_spinae", "diaphragm"] },

  // ─── OPEN BOOK ─────
  { exercise_id: "lb_053", exercise_name: "Open Book", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "mobility", primary_outcome: "Thoracic rotation from side lying", movement_type: "rotation", primary_joints: ["thoracic_spine"], locked_segments: ["pelvis", "knees_stacked"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], knee_l: [58, 38], knee_r: [58, 58], hand_l: [28, 36], hand_r: [28, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying, knees stacked, arms together" },
      { name: "Open", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 48], hand_r: [28, 68], wrist_r: [26, 66], elbow_r: [24, 62], shoulder_r: [22, 60], t_spine: [30, 52] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Rotate top arm open — follow with eyes", muscles: ["obliques", "rhomboids"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 48], hand_r: [28, 68], t_spine: [30, 52] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel thoracic opening" },
      { name: "Close", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], hand_r: [28, 56] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Close slowly back" },
    ], form_checks: ["Knees stay stacked", "Rotation from thoracic, not lumbar"], highlight_muscles: ["obliques", "rhomboids"] },

  // ─── KNEELING THORACIC HINGE ─────
  { exercise_id: "lb_054", exercise_name: "Kneeling Thoracic Hinge", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Unlock mid/upper back extension", movement_type: "hinge", primary_joints: ["thoracic_spine"], locked_segments: ["lumbar_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [22, 40], knee_l: [66, 58], knee_r: [66, 62] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Kneeling, hands on thighs" },
      { name: "Hinge Back", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [28, 34], c_spine: [30, 36], t_spine: [38, 38], sternum: [32, 38], shoulder_l: [26, 34], shoulder_r: [30, 38] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Hinge through thoracic — lift sternum", muscles: ["erector_spinae", "rhomboids"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [28, 34], t_spine: [38, 38] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — breathe into back" },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Return to neutral" },
    ], form_checks: ["Lumbar stays neutral", "Movement from thoracic only"], highlight_muscles: ["erector_spinae", "rhomboids"] },

  // ─── SCIATIC NERVE FLOSS ─────
  { exercise_id: "lb_055", exercise_name: "Sciatic Nerve Floss", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "side", goal: "mobility", primary_outcome: "Neural mobilization for sciatic symptoms", movement_type: "nerve_glide", primary_joints: ["hip", "knee", "ankle"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall on chair edge" },
      { name: "Extend & Flex", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 56], ankle_r: [74, 56], forefoot_r: [76, 52], skull: [52, 10], c_spine: [52, 16] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Extend knee + look up — gentle glide" },
      { name: "Flex & Tuck", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 64], ankle_r: [70, 72], forefoot_r: [72, 74], skull: [48, 16], c_spine: [48, 22] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Bend knee + tuck chin — reverse glide" },
    ], form_checks: ["No pain", "Gentle tension only", "Smooth oscillation"], highlight_muscles: ["hamstrings"] },

  // ─── TRI PLANAR HIP OPENER ─────
  { exercise_id: "lb_056", exercise_name: "Tri Planar Hip Opener", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "front", goal: "mobility", primary_outcome: "Multi-plane hip mobility", movement_type: "multi_plane", primary_joints: ["hip"], locked_segments: ["spine_neutral"], planes: ["sagittal", "frontal", "transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall, feet hip width" },
      { name: "Forward Open", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 54], hip_r: [58, 46], ankle_r: [66, 56] }), duration: 2, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Open hip forward", muscles: ["iliopsoas", "rectus_femoris"] },
      { name: "Diagonal Open", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [68, 56], hip_r: [60, 46], ankle_r: [72, 60] }), duration: 2, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Open hip diagonal", muscles: ["gluteus_medius", "iliopsoas"] },
      { name: "Side Open", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [72, 60], hip_r: [62, 48], ankle_r: [76, 66] }), duration: 2, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Open hip to side", muscles: ["adductors", "gluteus_medius"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Return to neutral" },
    ], form_checks: ["Pelvis stays level", "Control each plane"], highlight_muscles: ["iliopsoas", "gluteus_medius", "adductors"] },

  // ─── LOW BACK CAT COW (isolated to lumbar) ─────
  { exercise_id: "lb_057", exercise_name: "Low Back Cat Cow", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "mobility", primary_outcome: "Isolated lumbar flexion-extension", movement_type: "flexion_extension", primary_joints: ["lumbar_spine"], locked_segments: ["thoracic_spine", "cervical_spine"], planes: ["sagittal"],
    phases: [
      { name: "Neutral", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours — isolate LOW back" },
      { name: "Lumbar Flexion", pose: poseFrom(NEUTRAL_QUADRUPED, { l_spine: [46, 38], pelvis: [54, 40], sacrum: [56, 40] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Tuck pelvis under — only lumbar rounds", muscles: ["rectus_abdominis"] },
      { name: "Lumbar Extension", pose: poseFrom(NEUTRAL_QUADRUPED, { l_spine: [46, 48], pelvis: [54, 48], sacrum: [56, 48] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Tip pelvis forward — only lumbar extends", muscles: ["erector_spinae", "multifidus"] },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Back to neutral" },
    ], form_checks: ["Thoracic spine stays STILL", "Movement only at lumbar", "Cervical neutral"], highlight_muscles: ["erector_spinae", "rectus_abdominis"] },

  // ─── WINDSHIELD WIPER ─────
  { exercise_id: "lb_058", exercise_name: "Windshield Wiper", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "front", goal: "mobility", primary_outcome: "Lumbar rotation mobility", movement_type: "rotation", primary_joints: ["lumbar_spine", "hip"], locked_segments: ["shoulders_flat"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62], elbow_l: [24, 34], elbow_r: [24, 66] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Knees bent, arms out, shoulders pinned" },
      { name: "Drop Left", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [58, 32], knee_r: [54, 48], hip_l: [50, 40], l_spine: [40, 48] }), duration: 2, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Drop knees left — shoulders stay", muscles: ["obliques"] },
      { name: "Center", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to center" },
      { name: "Drop Right", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [54, 52], knee_r: [58, 68], hip_r: [50, 60], l_spine: [40, 52] }), duration: 2, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Drop knees right", muscles: ["obliques"] },
      { name: "Return", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to center" },
    ], form_checks: ["Shoulders stay flat", "Legs move together"], highlight_muscles: ["obliques"] },

  // ─── BRETZL ─────
  { exercise_id: "lb_059", exercise_name: "Bretzl", program_tag: "Low Back P2P", difficulty: 3, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "mobility", primary_outcome: "Multi-planar hip and thoracic opening", movement_type: "complex_stretch", primary_joints: ["hip", "thoracic_spine", "shoulder"], locked_segments: [], planes: ["sagittal", "frontal", "transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], knee_l: [52, 34], knee_r: [58, 60], hand_l: [28, 36] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying — complex position" },
      { name: "Open Rotation", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 48], shoulder_r: [22, 62], hand_r: [28, 68], t_spine: [30, 52], knee_l: [52, 32] }), duration: 4, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Rotate thoracic open — hold bottom knee", muscles: ["obliques", "pectoralis_major", "iliopsoas"] },
      { name: "Deepen", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 50], hand_r: [30, 70], t_spine: [32, 54] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Exhale — sink deeper into stretch" },
      { name: "Release", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], hand_r: [28, 56] }), duration: 3, breath: "inhale", easing: "easeInOut", cue: "Release slowly" },
    ], form_checks: ["Complex position — take time setting up", "Breathe into tight spots"], highlight_muscles: ["obliques", "pectoralis_major", "iliopsoas"] },

  // ─── BRACING LEG LIFT ─────
  { exercise_id: "lb_060", exercise_name: "Bracing Leg Lift", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "Core bracing with hip flexion", movement_type: "leg_lift", primary_joints: ["hip"], locked_segments: ["lumbar_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Supine, 360° belly brace" },
      { name: "Brace", pose: poseFrom(NEUTRAL_SUPINE, { rib_l: [28, 44], rib_r: [28, 56], l_spine: [38, 50] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Brace — 360° pressure", muscles: ["transverse_abdominis"] },
      { name: "Lift Leg", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [48, 36], ankle_l: [52, 34], hip_l: [48, 42] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift one leg — maintain brace", muscles: ["transverse_abdominis", "iliopsoas"] },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower with control" },
    ], form_checks: ["Low back stays flat", "360° belly pressure", "No rib flare"], highlight_muscles: ["transverse_abdominis", "iliopsoas"] },

  // ─── KNEE SIDE PLANK ─────
  { exercise_id: "lb_061", exercise_name: "Knee Side Plank", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "stability", primary_outcome: "Modified lateral core stability", movement_type: "isometric", primary_joints: ["core"], locked_segments: ["pelvis_stacked"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], elbow_l: [24, 40], knee_l: [56, 48], knee_r: [56, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying from knees, elbow under shoulder" },
      { name: "Lift", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 40], pelvis: [48, 44], hip_l: [50, 40], hip_r: [50, 48], elbow_l: [24, 40] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift hips — hold from knees", muscles: ["obliques", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 40], pelvis: [48, 44] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold 10 sec — breathe normally" },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], pelvis: [48, 52] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower with control" },
    ], form_checks: ["From knees — easier than full side plank", "Pelvis stays stacked"], highlight_muscles: ["obliques", "gluteus_medius"] },

  // ─── LATERAL WALL PLANK ─────
  { exercise_id: "lb_062", exercise_name: "Lateral Wall Plank", program_tag: "Low Back P2P", difficulty: 2, equipment: "wall", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Frontal plane stability at wall", movement_type: "isometric", primary_joints: ["core"], locked_segments: ["spine_neutral"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [30, 30], wrist_l: [28, 24] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side to wall, forearm on wall" },
      { name: "Lean & Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [46, 12], t_spine: [48, 28], pelvis: [48, 46], elbow_l: [28, 28] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lean into wall — maintain alignment", muscles: ["obliques", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [46, 12], pelvis: [48, 46] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — resist lateral flexion" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Push away from wall" },
    ], form_checks: ["Maintain alignment", "No lateral bend"], highlight_muscles: ["obliques", "gluteus_medius"] },

  // ─── QUADRUPED SCORPION ─────
  { exercise_id: "lb_063", exercise_name: "Quadruped Scorpion", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "front", goal: "mobility", primary_outcome: "Combined thoracic and hip rotation", movement_type: "rotation", primary_joints: ["thoracic_spine", "hip"], locked_segments: ["supporting_arm"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours position" },
      { name: "Thread Under", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_r: [34, 54], wrist_r: [32, 52], skull: [30, 46], shoulder_r: [32, 48] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Thread right leg through — rotate", muscles: ["obliques", "hip_internal_rotators"] },
      { name: "Open Up", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_r: [20, 30], wrist_r: [18, 32], skull: [22, 34] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Open to ceiling — rotate opposite", muscles: ["obliques", "rhomboids"] },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Return to start" },
    ], form_checks: ["Hips stay stable", "Full rotation range"], highlight_muscles: ["obliques", "hip_internal_rotators"] },

  // ─── BEAR (Quadruped hover hold) ─────
  { exercise_id: "lb_064", exercise_name: "Bear", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "stability", primary_outcome: "Core anti-extension isometric", movement_type: "isometric", primary_joints: ["core", "shoulder"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Hands under shoulders, knees under hips" },
      { name: "Hover", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift knees 1 inch off ground — brace core", muscles: ["transverse_abdominis", "rectus_abdominis"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold — breathe normally, don't sag" },
      { name: "Lower", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower knees gently" },
    ], form_checks: ["Knees only 1 inch off floor", "No spine movement", "Core stays braced"], highlight_muscles: ["transverse_abdominis", "rectus_abdominis"] },

  // ─── ANTI-EXTENSION DEADBUG ─────
  { exercise_id: "lb_065", exercise_name: "Anti-Extension Deadbug", program_tag: "Low Back P2P", difficulty: 3, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "Advanced anti-extension core", movement_type: "alternating_reach", primary_joints: ["shoulder", "hip"], locked_segments: ["lumbar_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [22, 36], wrist_r: [22, 64], knee_l: [56, 40], knee_r: [56, 60] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Arms extended overhead, knees at 90°" },
      { name: "Full Extension", pose: poseFrom(NEUTRAL_SUPINE, { wrist_r: [10, 66], hand_r: [8, 68], knee_l: [72, 42], ankle_l: [82, 42] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Extend fully — press back into floor", muscles: ["transverse_abdominis", "rectus_abdominis"] },
      { name: "Return", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [22, 36], wrist_r: [22, 64], knee_l: [56, 40], knee_r: [56, 60] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Return — maintain pressure" },
    ], form_checks: ["Low back NEVER lifts off floor", "Full limb extension", "Slower = harder"], highlight_muscles: ["transverse_abdominis", "rectus_abdominis"] },

  // ─── SINGLE LEG GLUTE BRIDGE ─────
  { exercise_id: "lb_066", exercise_name: "Single Leg Glute Bridge", program_tag: "Low Back P2P", difficulty: 3, equipment: "none", position: "supine", view_angle_default: "side", goal: "strength", primary_outcome: "Unilateral glute strength", movement_type: "bridge", primary_joints: ["hip"], locked_segments: ["pelvis_level"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [58, 38], ankle_l: [68, 42], knee_r: [50, 58], ankle_r: [46, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "One foot planted, other leg extended" },
      { name: "Lift", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [44, 42], l_spine: [36, 44], hip_l: [46, 38], knee_l: [58, 36], knee_r: [44, 52] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive up on one leg — squeeze glute", muscles: ["gluteus_maximus", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [44, 42], hip_l: [46, 38] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — pelvis stays level" },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [58, 38], ankle_l: [68, 42] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower with control" },
    ], form_checks: ["Pelvis stays level — no drop", "Single leg drive only"], highlight_muscles: ["gluteus_maximus", "gluteus_medius"] },

  // ─── BEAR CRAWLING ─────
  { exercise_id: "lb_067", exercise_name: "Bear Crawling", program_tag: "Low Back P2P", difficulty: 3, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "stability", primary_outcome: "Dynamic core stability in crawl pattern", movement_type: "crawl", primary_joints: ["shoulder", "hip", "core"], locked_segments: ["spine_neutral"], planes: ["sagittal", "transverse"],
    phases: [
      { name: "Hover", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Bear position — knees hover" },
      { name: "Step Forward R", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_l: [14, 58], knee_r: [62, 54], knee_l: [68, 52] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Opposite hand-foot step forward", muscles: ["transverse_abdominis", "obliques"] },
      { name: "Step Forward L", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_r: [18, 60], knee_l: [62, 52], knee_r: [68, 56] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Other side — slow & controlled" },
      { name: "Reset", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to hover" },
    ], form_checks: ["Move slow & controlled", "Spine stays still", "Opposite hand-foot pattern"], highlight_muscles: ["transverse_abdominis", "obliques"] },

  // ─── HINGING PATTERNS ─────
  { exercise_id: "lb_068", exercise_name: "Hinging Patterns", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "Hip hinge pattern drilling", movement_type: "hinge", primary_joints: ["hip"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall, hands on hips" },
      { name: "Hinge", pose: poseFrom(NEUTRAL_STANDING, { skull: [42, 22], t_spine: [46, 34], pelvis: [54, 50], hip_l: [50, 52], hip_r: [58, 52], knee_l: [44, 66], knee_r: [58, 66] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Push hips back — keep back straight", muscles: ["hamstrings", "gluteus_maximus"] },
      { name: "Stand", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive hips through — stand tall" },
    ], form_checks: ["Back stays straight", "Hip crease deepens", "Soft knees"], highlight_muscles: ["hamstrings", "gluteus_maximus"] },

  // ─── DUMBBELL DEADLIFT ─────
  { exercise_id: "lb_069", exercise_name: "Dumbbell Deadlift", program_tag: "Low Back P2P", difficulty: 3, equipment: "dumbbell", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Loaded hip hinge, posterior chain", movement_type: "hinge", primary_joints: ["hip", "knee"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 50], hand_r: [62, 50] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Weights at sides, feet hip width" },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { skull: [38, 26], t_spine: [44, 36], l_spine: [48, 44], pelvis: [56, 52], hand_l: [42, 62], hand_r: [58, 62], knee_l: [44, 68], knee_r: [58, 68] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Hinge down — weights slide along legs", muscles: ["hamstrings", "erector_spinae"] },
      { name: "Drive Up", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 50], hand_r: [62, 50] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive through feet — squeeze glutes at top", muscles: ["gluteus_maximus", "hamstrings"] },
    ], form_checks: ["Spine neutral throughout", "Weights close to body", "Hip hinge, not squat"], highlight_muscles: ["hamstrings", "gluteus_maximus", "erector_spinae"] },

  // ─── CHIN RETRACTIONS (neck variant) ─────
  { exercise_id: "neck_070", exercise_name: "Chin Retractions", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "side", goal: "stability", primary_outcome: "Reduce forward head posture", movement_type: "glide", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall" },
      { name: "Retract", pose: poseFrom(NEUTRAL_SEATED, { skull: [47, 14], c_spine: [48, 20] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Pull chin straight back — make double chin", muscles: ["deep_neck_flexors", "longus_colli"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { skull: [47, 14], c_spine: [48, 20] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold 3 sec" },
      { name: "Release", pose: NEUTRAL_SEATED, duration: 3, breath: "inhale", easing: [0.25, 0.1, 0.25, 1], cue: "Release slowly" },
    ], form_checks: ["Level chin", "No head tilt"], highlight_muscles: ["deep_neck_flexors", "longus_colli"] },

  // ─── CHIN RETRACTIONS W EXTENSION ─────
  { exercise_id: "neck_071", exercise_name: "Chin Retractions w Extension", program_tag: "Neck Relief", difficulty: 2, equipment: "none", position: "seated", view_angle_default: "side", goal: "mobility", primary_outcome: "Cervical retraction with extension bias", movement_type: "glide_extension", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Retract", pose: poseFrom(NEUTRAL_SEATED, { skull: [47, 14], c_spine: [48, 20] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Chin tuck first", muscles: ["deep_neck_flexors"] },
      { name: "Extend", pose: poseFrom(NEUTRAL_SEATED, { skull: [49, 10], c_spine: [49, 16] }), duration: 2, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Now look up — maintain retraction", muscles: ["deep_neck_flexors", "upper_trapezius"] },
      { name: "Return", pose: NEUTRAL_SEATED, duration: 3, breath: "exhale", easing: "easeInOut", cue: "Return to neutral" },
    ], form_checks: ["Retract BEFORE extending", "No pain"], highlight_muscles: ["deep_neck_flexors"] },

  // ─── PRONE CERVICAL RETRACTION ─────
  { exercise_id: "neck_072", exercise_name: "Prone Cervical Retraction", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "prone", view_angle_default: "side", goal: "stability", primary_outcome: "Gravity-assisted deep neck flexor activation", movement_type: "isometric", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_PRONE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Face down, forehead on towel" },
      { name: "Nod & Lift", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50], c_spine: [16, 50] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Tuck chin, lift head slightly", muscles: ["deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold 10 sec" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower gently" },
    ], form_checks: ["Chin stays tucked", "No neck strain"], highlight_muscles: ["deep_neck_flexors"] },

  // ─── PRONE HEAD LIFTS ─────
  { exercise_id: "neck_073", exercise_name: "Prone Head Lifts", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "prone", view_angle_default: "side", goal: "stability", primary_outcome: "Posterior cervical chain strengthening", movement_type: "lift", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_PRONE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Face down, arms at sides" },
      { name: "Lift", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], c_spine: [14, 50] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift head — chin stays tucked", muscles: ["deep_neck_flexors", "upper_trapezius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold 5 sec" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 3, breath: "inhale", easing: "easeInOut", cue: "Lower slowly" },
    ], form_checks: ["Chin stays slightly tucked", "Lift from neck extensors"], highlight_muscles: ["deep_neck_flexors", "upper_trapezius"] },

  // ─── SUPINE CERVICAL RETRACTION ─────
  { exercise_id: "neck_074", exercise_name: "Supine Cervical Retraction", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "Deep neck flexor training supine", movement_type: "isometric", primary_joints: ["C1_C7"], locked_segments: [], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SUPINE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie on back, no pillow" },
      { name: "Nod", pose: poseFrom(NEUTRAL_SUPINE, { skull: [14, 50], c_spine: [18, 50] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Gentle chin nod — press into floor", muscles: ["deep_neck_flexors", "longus_colli"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { skull: [14, 50] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold 10 sec" },
      { name: "Release", pose: NEUTRAL_SUPINE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Gentle nod only", "No SCM dominance"], highlight_muscles: ["deep_neck_flexors", "longus_colli"] },

  // ─── QUADRUPED CERVICAL RETRACTION ─────
  { exercise_id: "neck_075", exercise_name: "Quadruped Cervical Retraction", program_tag: "Neck Relief", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "stability", primary_outcome: "Anti-gravity cervical retraction", movement_type: "isometric", primary_joints: ["C1_C7"], locked_segments: ["thoracic_stable"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours, head neutral" },
      { name: "Retract", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [20, 38], c_spine: [24, 40] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Tuck chin — hold against gravity", muscles: ["deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [20, 38] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold 5 sec" },
      { name: "Release", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Level gaze", "Retraction not flexion"], highlight_muscles: ["deep_neck_flexors"] },

  // ─── FOAM ROLLER SWIM ─────
  { exercise_id: "neck_076", exercise_name: "Foam Roller Swim", program_tag: "Neck Relief", difficulty: 2, equipment: "foam_roller", position: "supine", view_angle_default: "front", goal: "mobility", primary_outcome: "Scapular mobility, thoracic extension", movement_type: "arm_circles", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["spine_on_roller"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [20, 34], wrist_r: [20, 66] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie on foam roller, arms up" },
      { name: "Arms Overhead", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [10, 34], wrist_r: [10, 66], hand_l: [8, 32], hand_r: [8, 68] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Swim arms overhead — like snow angel", muscles: ["serratus_anterior", "lower_trapezius"] },
      { name: "Arms Down", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [32, 30], wrist_r: [32, 70], hand_l: [34, 28], hand_r: [34, 72] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Sweep arms down — maintain contact" },
    ], form_checks: ["Maintain roller contact", "Slow controlled circles"], highlight_muscles: ["serratus_anterior", "lower_trapezius"] },

  // ─── SIDE LYING ROTATIONS ─────
  { exercise_id: "neck_077", exercise_name: "Side Lying Rotations", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "mobility", primary_outcome: "Thoracic rotation from side lying", movement_type: "rotation", primary_joints: ["thoracic_spine"], locked_segments: ["pelvis_stable"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], knee_l: [58, 38], knee_r: [58, 58] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying, knees stacked" },
      { name: "Rotate", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 48], shoulder_r: [22, 62], hand_r: [28, 68], t_spine: [30, 52] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Open and rotate — follow with eyes", muscles: ["obliques", "rhomboids"] },
      { name: "Return", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Return slowly" },
    ], form_checks: ["Knees stay stacked", "Hips don't roll"], highlight_muscles: ["obliques", "rhomboids"] },

  // ─── PRONE SCORPION ─────
  { exercise_id: "neck_078", exercise_name: "Prone Scorpion", program_tag: "Neck Relief", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "front", goal: "mobility", primary_outcome: "Thoracic rotation with hip opener", movement_type: "rotation", primary_joints: ["thoracic_spine", "hip"], locked_segments: ["arms_spread"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { elbow_l: [20, 32], elbow_r: [20, 68], hand_l: [18, 28], hand_r: [18, 72] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Prone, arms in T position" },
      { name: "Scorpion Right", pose: poseFrom(NEUTRAL_PRONE, { ankle_r: [66, 42], knee_r: [60, 46], hip_r: [50, 50], l_spine: [40, 48] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Cross right foot over to left — rotate spine", muscles: ["obliques", "iliopsoas"] },
      { name: "Center", pose: NEUTRAL_PRONE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Return to center" },
      { name: "Scorpion Left", pose: poseFrom(NEUTRAL_PRONE, { ankle_l: [66, 58], knee_l: [60, 54], hip_l: [50, 50], l_spine: [40, 52] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Cross left foot over to right", muscles: ["obliques", "iliopsoas"] },
    ], form_checks: ["Chest stays flat", "Smooth controlled rotation"], highlight_muscles: ["obliques", "iliopsoas"] },

  // ─── BRUEGGERS ─────
  { exercise_id: "neck_079", exercise_name: "Brueggers", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "stability", primary_outcome: "Postural reset, scapular retraction", movement_type: "postural", primary_joints: ["scapula", "cervical_spine"], locked_segments: [], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Slouch", pose: poseFrom(NEUTRAL_SEATED, { skull: [52, 16], c_spine: [52, 22], t_spine: [52, 32], shoulder_l: [36, 28], shoulder_r: [64, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Start slouched" },
      { name: "Correct", pose: poseFrom(NEUTRAL_SEATED, { skull: [48, 12], c_spine: [49, 18], shoulder_l: [38, 24], shoulder_r: [62, 24], scap_l: [40, 28], scap_r: [60, 28], hand_l: [32, 56], hand_r: [68, 56] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Sit tall — squeeze blades, palms up, chin tuck", muscles: ["lower_trapezius", "rhomboids", "deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { skull: [48, 12], scap_l: [40, 28], scap_r: [60, 28] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold 5 sec" },
      { name: "Release", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Palms face up", "Chin tucks", "Blades squeeze"], highlight_muscles: ["lower_trapezius", "rhomboids", "deep_neck_flexors"] },

  // ─── WALL PEC STRETCH ─────
  { exercise_id: "neck_080", exercise_name: "Wall Pec Stretch", program_tag: "Neck Relief", difficulty: 1, equipment: "wall", position: "standing", view_angle_default: "front", goal: "mobility", primary_outcome: "Pectoral lengthening", movement_type: "stretch_hold", primary_joints: ["glenohumeral"], locked_segments: ["rib_cage_neutral"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_r: [74, 20], elbow_r: [70, 24] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Arm on wall at 90°" },
      { name: "Turn Away", pose: poseFrom(NEUTRAL_STANDING, { skull: [44, 12], t_spine: [46, 28], shoulder_r: [68, 22], hand_r: [74, 18] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Turn body away — feel chest stretch", muscles: ["pectoralis_major", "pectoralis_minor"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [44, 12], shoulder_r: [68, 22] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold 20 sec" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Ribs neutral", "No lumbar extension"], highlight_muscles: ["pectoralis_major", "pectoralis_minor"] },

  // ─── WALL PUSHUP ─────
  { exercise_id: "neck_081", exercise_name: "Wall Pushup", program_tag: "Shoulder Relief", difficulty: 1, equipment: "wall", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Beginner pushing strength with scap engagement", movement_type: "push", primary_joints: ["glenohumeral", "elbow", "scapula"], locked_segments: ["core_braced"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [34, 28], hand_r: [66, 28], elbow_l: [34, 32], elbow_r: [66, 32] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Hands on wall, arms straight" },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { skull: [50, 16], t_spine: [52, 30], hand_l: [34, 28], hand_r: [66, 28], elbow_l: [30, 34], elbow_r: [70, 34] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lean in — elbows bend", muscles: ["pectoralis_major", "serratus_anterior"] },
      { name: "Push", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [34, 28], hand_r: [66, 28] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Push away — protract at end", muscles: ["serratus_anterior"] },
    ], form_checks: ["Core stays braced", "Protract scap at top"], highlight_muscles: ["pectoralis_major", "serratus_anterior"] },

  // ─── BANDED IYT ─────
  { exercise_id: "neck_082", exercise_name: "Banded IYT", program_tag: "Shoulder Relief", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Rotator cuff and scap activation", movement_type: "raise", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["core_neutral"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "I Raise", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 6], hand_r: [62, 6], wrist_l: [38, 8], wrist_r: [62, 8] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Arms straight up — I position", muscles: ["lower_trapezius"] },
      { name: "Y Raise", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [28, 8], hand_r: [72, 8], wrist_l: [30, 10], wrist_r: [70, 10] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Arms at 45° — Y position", muscles: ["lower_trapezius", "serratus_anterior"] },
      { name: "T Raise", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [20, 24], hand_r: [80, 24], wrist_l: [22, 24], wrist_r: [78, 24] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Arms straight out — T position", muscles: ["rhomboids", "posterior_deltoid"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower arms" },
    ], form_checks: ["No shrugging", "Slow and controlled"], highlight_muscles: ["lower_trapezius", "serratus_anterior", "rhomboids"] },

  // ─── JANDA WALL CRAWL ─────
  { exercise_id: "neck_083", exercise_name: "Janda Wall Crawl", program_tag: "Neck Relief", difficulty: 2, equipment: "wall", position: "standing", view_angle_default: "side", goal: "stability", primary_outcome: "Deep cervical flexor activation against wall", movement_type: "crawl", primary_joints: ["C1_C7"], locked_segments: ["thoracic_on_wall"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { skull: [50, 14] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Back against wall, chin neutral" },
      { name: "Crawl Up", pose: poseFrom(NEUTRAL_STANDING, { skull: [48, 12], c_spine: [49, 18] }), duration: 4, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Slide head up wall — maintain chin tuck", muscles: ["deep_neck_flexors", "longus_colli"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [48, 10] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold top position" },
      { name: "Slide Down", pose: NEUTRAL_STANDING, duration: 4, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Slowly slide back down" },
    ], form_checks: ["Maintain wall contact", "Chin stays tucked throughout"], highlight_muscles: ["deep_neck_flexors", "longus_colli"] },

  // ─── ADDITIONAL EXERCISES FROM OTHER PROGRAMS ─────

  // Dorsiflexion Isometrics
  { exercise_id: "fa_084", exercise_name: "Dorsiflexion Isometrics", program_tag: "Foot/Ankle", difficulty: 1, equipment: "wall", position: "standing", view_angle_default: "side", goal: "stability", primary_outcome: "Ankle dorsiflexion strength", movement_type: "isometric", primary_joints: ["ankle"], locked_segments: ["knee_stable"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { forefoot_l: [44, 80] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Foot against wall, press" },
      { name: "Press", pose: poseFrom(NEUTRAL_STANDING, { forefoot_l: [44, 78], ankle_l: [42, 76] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive foot into wall — hold", muscles: ["tibialis_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { forefoot_l: [44, 78] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold 10 sec" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Steady pressure", "No compensation"], highlight_muscles: ["tibialis_anterior"] },

  // Foot Threading
  { exercise_id: "fa_085", exercise_name: "Foot Threading", program_tag: "Foot/Ankle", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "mobility", primary_outcome: "Toe and foot intrinsic mobility", movement_type: "manipulation", primary_joints: ["MTP", "ankle"], locked_segments: [], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 58] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Cross ankle, interlace fingers with toes" },
      { name: "Flex Toes", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 74] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Flex toes down gently" },
      { name: "Extend Toes", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 70] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Extend toes back" },
    ], form_checks: ["Gentle pressure", "Full range"], highlight_muscles: [] },

  // Cowboy Sit
  { exercise_id: "fa_086", exercise_name: "Cowboy Sit", program_tag: "Foot/Ankle", difficulty: 1, equipment: "none", position: "kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Ankle plantar flexion stretch", movement_type: "stretch", primary_joints: ["ankle"], locked_segments: ["spine_tall"], planes: ["sagittal"],
    phases: [
      { name: "Sit Back", pose: poseFrom(NEUTRAL_QUADRUPED, { pelvis: [58, 56], sacrum: [60, 58], knee_l: [66, 60], knee_r: [66, 64] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Sit back on heels — tops of feet flat", muscles: ["tibialis_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { pelvis: [58, 56] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold — feel ankle stretch" },
      { name: "Release", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Come off heels" },
    ], form_checks: ["Tops of feet flat", "Sit tall"], highlight_muscles: ["tibialis_anterior"] },

  // Downward Dog
  { exercise_id: "fa_087", exercise_name: "Downward Dog", program_tag: "Full Body", difficulty: 1, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "mobility", primary_outcome: "Full posterior chain stretch", movement_type: "stretch", primary_joints: ["shoulder", "hip", "ankle"], locked_segments: [], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours" },
      { name: "Lift Hips", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [24, 48], pelvis: [46, 26], sacrum: [48, 28], hip_l: [44, 30], hip_r: [48, 30], knee_l: [54, 50], knee_r: [54, 54], ankle_l: [62, 64], ankle_r: [62, 68], hand_l: [16, 62], hand_r: [18, 66] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Press hips up and back — inverted V", muscles: ["hamstrings", "gastrocnemius", "latissimus_dorsi"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { pelvis: [46, 26], knee_l: [54, 50], knee_r: [54, 54] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — press heels toward floor" },
      { name: "Lower", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower back to all fours" },
    ], form_checks: ["Hands shoulder width", "Press chest toward thighs"], highlight_muscles: ["hamstrings", "gastrocnemius", "latissimus_dorsi"] },

  // Frog Stretch
  { exercise_id: "hip_088", exercise_name: "Frog Stretch", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "front", goal: "mobility", primary_outcome: "Hip adductor lengthening", movement_type: "stretch", primary_joints: ["hip"], locked_segments: ["spine_neutral"], planes: ["frontal"],
    phases: [
      { name: "Wide Knees", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [60, 40], knee_r: [60, 60], hip_l: [54, 36], hip_r: [54, 64] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Wide knees, ankles aligned" },
      { name: "Rock Back", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [30, 48], pelvis: [58, 52], hip_l: [56, 38], hip_r: [56, 62] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Rock hips back — feel inner thigh stretch", muscles: ["adductors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { pelvis: [58, 52] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold — breathe into stretch" },
      { name: "Forward", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Rock forward" },
    ], form_checks: ["Ankles in line with knees", "Spine neutral"], highlight_muscles: ["adductors"] },

  // Hip CARs
  { exercise_id: "hip_089", exercise_name: "Hip CARs", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "front", goal: "mobility", primary_outcome: "Full hip ROM exploration", movement_type: "rotation", primary_joints: ["hip"], locked_segments: ["pelvis_stable", "spine_neutral"], planes: ["sagittal", "frontal", "transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand on one leg, hold wall" },
      { name: "Lift & Out", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [64, 52], hip_r: [58, 46] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Lift knee — circle outward", muscles: ["gluteus_medius", "hip_flexors"] },
      { name: "Abduct", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [72, 58], hip_r: [62, 48] }), duration: 3, breath: "hold", easing: [0.3, 0, 0.2, 1], cue: "Open to side" },
      { name: "Circle Back", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [64, 68], hip_r: [58, 52] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Circle behind — extend" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Complete the circle" },
    ], form_checks: ["Pelvis stays still", "Full controlled circles", "5 sec per rep"], highlight_muscles: ["gluteus_medius", "hip_flexors"] },

  // 90-90 Transition
  { exercise_id: "hip_090", exercise_name: "90-90 Transition", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "seated", view_angle_default: "front", goal: "mobility", primary_outcome: "Hip internal/external rotation transition", movement_type: "transition", primary_joints: ["hip"], locked_segments: ["pelvis_upright"], planes: ["transverse"],
    phases: [
      { name: "Position Left", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [36, 62], knee_r: [64, 62], ankle_l: [22, 56], ankle_r: [78, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "90-90 position — left side forward" },
      { name: "Transition", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [42, 64], knee_r: [58, 64], ankle_l: [30, 60], ankle_r: [70, 60] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Sweep knees to other side", muscles: ["hip_internal_rotators", "gluteus_medius"] },
      { name: "Position Right", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [36, 62], knee_r: [64, 62], ankle_l: [78, 56], ankle_r: [22, 56] }), duration: 2, breath: "hold", easing: "easeInOut", cue: "90-90 other side" },
      { name: "Return", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [36, 62], knee_r: [64, 62] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Transition back" },
    ], form_checks: ["Stay tall", "Controlled transitions"], highlight_muscles: ["hip_internal_rotators", "gluteus_medius"] },

  // 90-90 Lean
  { exercise_id: "hip_091", exercise_name: "90-90 Lean", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "seated", view_angle_default: "front", goal: "mobility", primary_outcome: "Deep hip external rotation stretch", movement_type: "stretch", primary_joints: ["hip"], locked_segments: ["pelvis_upright"], planes: ["sagittal"],
    phases: [
      { name: "90-90", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [36, 62], knee_r: [64, 62], ankle_l: [22, 56], ankle_r: [78, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "90-90 position" },
      { name: "Lean Forward", pose: poseFrom(NEUTRAL_SEATED, { skull: [46, 18], t_spine: [48, 32], pelvis: [50, 50] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Lean forward over front shin — feel deep hip stretch", muscles: ["gluteus_maximus", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { skull: [46, 18], pelvis: [50, 50] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — breathe into hip" },
      { name: "Up", pose: poseFrom(NEUTRAL_SEATED, { knee_l: [36, 62], knee_r: [64, 62] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Sit back up" },
    ], form_checks: ["Spine stays neutral", "Lead with chest, not head"], highlight_muscles: ["gluteus_maximus", "gluteus_medius"] },

  // Adductor Glute Bridge
  { exercise_id: "hip_092", exercise_name: "Adductor Glute Bridge", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "supine", view_angle_default: "side", goal: "strength", primary_outcome: "Combined glute and adductor activation", movement_type: "bridge", primary_joints: ["hip"], locked_segments: ["rib_cage_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [58, 44], knee_r: [58, 56], ankle_l: [68, 46], ankle_r: [68, 54] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Soles of feet together, knees narrow" },
      { name: "Squeeze & Lift", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [44, 42], l_spine: [36, 44], hip_l: [46, 40], hip_r: [46, 52], knee_l: [58, 42], knee_r: [58, 54] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Squeeze inner thighs — lift hips", muscles: ["adductors", "gluteus_maximus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [44, 42] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — squeeze everything" },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [58, 44], knee_r: [58, 56] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower slowly" },
    ], form_checks: ["Knees squeeze together", "No rib flare"], highlight_muscles: ["adductors", "gluteus_maximus"] },

  // End Range Hip Extensions
  { exercise_id: "hip_093", exercise_name: "End Range Hip Extensions", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "side", goal: "strength", primary_outcome: "Glute activation at end range", movement_type: "lift", primary_joints: ["hip"], locked_segments: ["lumbar_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_PRONE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie face down" },
      { name: "Lift Leg", pose: poseFrom(NEUTRAL_PRONE, { knee_r: [62, 52], ankle_r: [72, 48], hip_r: [50, 54] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift straight leg — squeeze glute hard", muscles: ["gluteus_maximus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { knee_r: [62, 52], ankle_r: [72, 48] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold at top" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower slowly" },
    ], form_checks: ["No lumbar extension", "Squeeze glute, not hamstring"], highlight_muscles: ["gluteus_maximus"] },

  // Hamstring Hip Flexor combo
  { exercise_id: "hip_094", exercise_name: "Hamstring Hip Flexor", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "half_kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Combined hamstring and hip flexor stretch", movement_type: "stretch", primary_joints: ["hip", "knee"], locked_segments: ["pelvis_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Hip Flexor", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], pelvis: [52, 48] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Half kneel — shift forward for hip flexor", muscles: ["iliopsoas"] },
      { name: "Transition", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 58] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Shift back" },
      { name: "Hamstring", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 56], ankle_l: [42, 72], forefoot_l: [44, 70], skull: [46, 18] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Straighten front leg — hinge for hamstring", muscles: ["hamstrings"] },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Back to start" },
    ], form_checks: ["Posterior tilt for hip flexor", "Neutral spine for hamstring"], highlight_muscles: ["iliopsoas", "hamstrings"] },

  // Hip Uprighting
  { exercise_id: "hip_095", exercise_name: "Hip Uprighting", program_tag: "Hip Relief", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "stability", primary_outcome: "Pelvic positioning awareness", movement_type: "tilt", primary_joints: ["pelvis"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Slouch", pose: poseFrom(NEUTRAL_SEATED, { pelvis: [50, 52], l_spine: [50, 42] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Start slouched" },
      { name: "Upright", pose: poseFrom(NEUTRAL_SEATED, { pelvis: [50, 46], l_spine: [50, 38], skull: [50, 12] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Stack pelvis — feel sit bones", muscles: ["erector_spinae"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { pelvis: [50, 46] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold — this is neutral" },
    ], form_checks: ["Feel sit bones contact seat", "No overarching"], highlight_muscles: ["erector_spinae"] },

  // Goblet Squat
  { exercise_id: "str_096", exercise_name: "Goblet Squat", program_tag: "Performance", difficulty: 2, equipment: "dumbbell", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Full squat pattern with load", movement_type: "squat", primary_joints: ["hip", "knee", "ankle"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 28], hand_r: [56, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Weight at chest, feet shoulder width" },
      { name: "Descend", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 56], knee_l: [38, 68], knee_r: [62, 68], hip_l: [44, 54], hip_r: [56, 54] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Sit between heels — chest up", muscles: ["quadriceps", "gluteus_maximus"] },
      { name: "Bottom", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 58], knee_l: [36, 70], knee_r: [64, 70] }), duration: 1, breath: "hold", easing: "linear", cue: "Pause at bottom" },
      { name: "Stand", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 28], hand_r: [56, 28] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive up — squeeze glutes", muscles: ["gluteus_maximus", "quadriceps"] },
    ], form_checks: ["Chest stays up", "Knees track toes", "Full depth"], highlight_muscles: ["quadriceps", "gluteus_maximus"] },

  // Bulgarian Split Squat
  { exercise_id: "str_097", exercise_name: "Bulgarian Split Squat", program_tag: "Performance", difficulty: 3, equipment: "bench", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Unilateral leg strength", movement_type: "squat", primary_joints: ["hip", "knee"], locked_segments: ["torso_upright"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { ankle_r: [66, 74], knee_r: [64, 66], forefoot_r: [68, 72] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Rear foot elevated on bench" },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 54], knee_l: [42, 68], knee_r: [64, 72], hip_l: [46, 52] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower straight down — front knee tracks toe", muscles: ["quadriceps", "gluteus_maximus"] },
      { name: "Drive Up", pose: poseFrom(NEUTRAL_STANDING, { ankle_r: [66, 74], knee_r: [64, 66] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive through front heel" },
    ], form_checks: ["Torso stays upright", "Knee doesn't cave"], highlight_muscles: ["quadriceps", "gluteus_maximus"] },

  // RKC Plank
  { exercise_id: "core_098", exercise_name: "RKC Plank", program_tag: "Performance", difficulty: 3, equipment: "none", position: "prone", view_angle_default: "side", goal: "stability", primary_outcome: "Max tension plank", movement_type: "isometric", primary_joints: ["core"], locked_segments: ["full_body_tension"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { skull: [14, 50], elbow_l: [20, 42], elbow_r: [20, 58] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Forearm plank position" },
      { name: "Engage", pose: poseFrom(NEUTRAL_PRONE, { skull: [14, 50], pelvis: [48, 48], knee_l: [62, 44], knee_r: [62, 56] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Squeeze EVERYTHING — glutes, quads, core", muscles: ["rectus_abdominis", "gluteus_maximus", "quadriceps"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { pelvis: [48, 48] }), duration: 15, breath: "natural", easing: "linear", cue: "Max tension hold — 15 sec" },
      { name: "Release", pose: NEUTRAL_PRONE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release to floor" },
    ], form_checks: ["Maximum full-body tension", "Elbows pull toward toes"], highlight_muscles: ["rectus_abdominis", "gluteus_maximus"] },

  // Banded Ankle Walkout
  { exercise_id: "fa_099", exercise_name: "Banded Ankle Walkout", program_tag: "Foot/Ankle", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Ankle eversion strength", movement_type: "walk", primary_joints: ["ankle"], locked_segments: ["knee_stable"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 64], knee_r: [58, 64] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Band around ankles, slight squat" },
      { name: "Step Out", pose: poseFrom(NEUTRAL_STANDING, { ankle_l: [34, 78], heel_l: [33, 81] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Step out against band", muscles: ["peroneals", "gluteus_medius"] },
      { name: "Follow", pose: poseFrom(NEUTRAL_STANDING, { ankle_r: [50, 78] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Follow with other foot" },
    ], form_checks: ["Maintain ankle alignment", "Control band tension"], highlight_muscles: ["peroneals", "gluteus_medius"] },

  // Achilles Eccentrics
  { exercise_id: "fa_100", exercise_name: "Achilles Eccentrics", program_tag: "Foot/Ankle", difficulty: 2, equipment: "step", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Achilles tendon loading", movement_type: "eccentric", primary_joints: ["ankle"], locked_segments: ["knee_straight"], planes: ["sagittal"],
    phases: [
      { name: "Rise", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 74], heel_r: [57, 74], ankle_l: [42, 72], ankle_r: [58, 72] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Rise up on both feet", muscles: ["gastrocnemius", "soleus"] },
      { name: "Single Leg", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 74], ankle_l: [42, 72], knee_r: [58, 60] }), duration: 1, breath: "hold", easing: "linear", cue: "Shift to one foot" },
      { name: "Slow Lower", pose: poseFrom(NEUTRAL_STANDING, { heel_l: [41, 84], ankle_l: [42, 82] }), duration: 5, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower slowly on one leg — 5 seconds", muscles: ["gastrocnemius", "soleus"] },
    ], form_checks: ["5-sec eccentric minimum", "Control descent", "No bouncing"], highlight_muscles: ["gastrocnemius", "soleus"] },

  // Peroneal Walks
  { exercise_id: "fa_101", exercise_name: "Peroneal Walks", program_tag: "Foot/Ankle", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Lateral ankle stability", movement_type: "walk", primary_joints: ["ankle"], locked_segments: [], planes: ["frontal"],
    phases: [
      { name: "Evert", pose: poseFrom(NEUTRAL_STANDING, { ankle_l: [40, 78], ankle_r: [60, 78], forefoot_l: [46, 80], forefoot_r: [62, 80] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Walk on outside edges of feet", muscles: ["peroneals"] },
      { name: "Step", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 62], knee_r: [58, 66] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "10 steps forward" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to normal walking" },
    ], form_checks: ["Control ankle position", "Slow deliberate steps"], highlight_muscles: ["peroneals"] },

  // Banded Knee Extensions
  { exercise_id: "knee_102", exercise_name: "Banded Knee Extensions", program_tag: "Knee Relief", difficulty: 1, equipment: "band", position: "seated", view_angle_default: "side", goal: "strength", primary_outcome: "Quad strengthening", movement_type: "extension", primary_joints: ["knee"], locked_segments: ["hip_stable"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Band around ankle, seated" },
      { name: "Extend", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 58], ankle_r: [74, 56], forefoot_r: [76, 54] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Straighten knee against band", muscles: ["quadriceps"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 58], ankle_r: [74, 56] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold at full extension" },
      { name: "Lower", pose: NEUTRAL_SEATED, duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower slowly" },
    ], form_checks: ["Full extension", "Slow eccentric"], highlight_muscles: ["quadriceps"] },

  // Banded Reverse Walk
  { exercise_id: "knee_103", exercise_name: "Banded Reverse Walk", program_tag: "Knee Relief", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Reverse walking for knee rehab", movement_type: "walk", primary_joints: ["knee", "hip"], locked_segments: ["torso_upright"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 62], knee_r: [58, 62] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Band above knees, slight squat" },
      { name: "Step Back R", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 66], ankle_r: [58, 80], heel_r: [58, 82] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Step back — drive knee back", muscles: ["quadriceps", "gluteus_maximus"] },
      { name: "Step Back L", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 66], ankle_l: [42, 80] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Other side" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to start" },
    ], form_checks: ["Stay in slight squat", "Control band tension"], highlight_muscles: ["quadriceps", "gluteus_maximus"] },

  // Bosu Squat
  { exercise_id: "knee_104", exercise_name: "Bosu Squat", program_tag: "Knee Relief", difficulty: 3, equipment: "bosu", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Balance-challenged squat", movement_type: "squat", primary_joints: ["knee", "hip", "ankle"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Balance", pose: NEUTRAL_STANDING, duration: 2, breath: "natural", easing: "easeInOut", cue: "Stand on Bosu ball — find balance" },
      { name: "Squat", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 54], knee_l: [40, 68], knee_r: [60, 68] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Squat — maintain balance", muscles: ["quadriceps", "gluteus_maximus"] },
      { name: "Stand", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Stand tall" },
    ], form_checks: ["Control wobble", "Knees track toes"], highlight_muscles: ["quadriceps", "gluteus_maximus"] },

  // Around the World Lunge
  { exercise_id: "knee_105", exercise_name: "Around the World Lunge", program_tag: "Knee Relief", difficulty: 3, equipment: "none", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Multi-directional lunge pattern", movement_type: "lunge", primary_joints: ["hip", "knee"], locked_segments: ["torso_upright"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Forward", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 62], knee_r: [58, 70] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Forward lunge", muscles: ["quadriceps", "gluteus_maximus"] },
      { name: "Lateral", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [70, 66], hip_r: [62, 48] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lateral lunge right", muscles: ["adductors", "gluteus_medius"] },
      { name: "Reverse", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 70], ankle_r: [66, 82] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Reverse lunge", muscles: ["gluteus_maximus"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to standing" },
    ], form_checks: ["Control each direction", "Knee tracks toe"], highlight_muscles: ["quadriceps", "gluteus_maximus", "adductors"] },

  // Wall Sit
  { exercise_id: "knee_106", exercise_name: "Wall Sit", program_tag: "Knee Relief", difficulty: 2, equipment: "wall", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Isometric quad strengthening", movement_type: "isometric", primary_joints: ["knee"], locked_segments: ["back_on_wall"], planes: ["sagittal"],
    phases: [
      { name: "Slide Down", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 52], knee_l: [42, 66], knee_r: [58, 66], hip_l: [44, 52], hip_r: [56, 52] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Slide down wall — knees at 90°", muscles: ["quadriceps"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 52], knee_l: [42, 66], knee_r: [58, 66] }), duration: 30, breath: "natural", easing: "linear", cue: "Hold — burn is normal" },
      { name: "Stand", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Slide back up" },
    ], form_checks: ["Knees at 90°", "Back flat on wall"], highlight_muscles: ["quadriceps"] },

  // Elevated Halo
  { exercise_id: "str_107", exercise_name: "Elevated Halo", program_tag: "Shoulder Relief", difficulty: 2, equipment: "dumbbell", position: "standing", view_angle_default: "front", goal: "mobility", primary_outcome: "Shoulder circumduction under load", movement_type: "circle", primary_joints: ["glenohumeral", "scapula"], locked_segments: ["core_braced"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 12], hand_r: [56, 12] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Weight overhead" },
      { name: "Circle Right", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [54, 10], hand_r: [66, 14] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Circle weight around head — right", muscles: ["posterior_deltoid", "obliques"] },
      { name: "Circle Left", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [34, 14], hand_r: [46, 10] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Circle weight — left" },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 12], hand_r: [56, 12] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to top" },
    ], form_checks: ["Core stays braced", "Weight stays close to head"], highlight_muscles: ["posterior_deltoid", "obliques"] },

  // Half-Kneeling Pallof Press
  { exercise_id: "core_108", exercise_name: "Half-Kneeling Pallof Press", program_tag: "Performance", difficulty: 2, equipment: "band", position: "half_kneeling", view_angle_default: "front", goal: "stability", primary_outcome: "Anti-rotation from half kneeling", movement_type: "press", primary_joints: ["core"], locked_segments: ["pelvis_neutral"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], hand_l: [44, 34], hand_r: [52, 34] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Half kneel, band at chest" },
      { name: "Press", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], hand_l: [44, 28], hand_r: [52, 28] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Press out — resist rotation", muscles: ["obliques", "transverse_abdominis"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], hand_l: [44, 28] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — stay square" },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], hand_l: [44, 34] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Bring hands back" },
    ], form_checks: ["No rotation", "Pelvis stays neutral"], highlight_muscles: ["obliques", "transverse_abdominis"] },

  // Standing Pallof Press
  { exercise_id: "core_109", exercise_name: "Standing Pallof Press", program_tag: "Performance", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Anti-rotation standing", movement_type: "press", primary_joints: ["core"], locked_segments: ["pelvis_stable"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 34], hand_r: [52, 34] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Athletic stance, band at chest" },
      { name: "Press", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 26], hand_r: [52, 26] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Press straight out — resist rotation", muscles: ["obliques", "transverse_abdominis"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 26] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold 3 sec" },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 34] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Bring back to chest" },
    ], form_checks: ["No trunk rotation", "Ribs stacked"], highlight_muscles: ["obliques", "transverse_abdominis"] },

  // Pallof Press Lunge
  { exercise_id: "core_110", exercise_name: "Pallof Press (Lunge)", program_tag: "Performance", difficulty: 3, equipment: "band", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Anti-rotation in lunge position", movement_type: "press_lunge", primary_joints: ["core", "hip", "knee"], locked_segments: ["torso_upright"], planes: ["transverse", "sagittal"],
    phases: [
      { name: "Lunge", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 62], knee_r: [62, 70], hand_l: [44, 34], hand_r: [52, 34] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Step into lunge, band at chest" },
      { name: "Press", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 62], knee_r: [62, 70], hand_l: [44, 24], hand_r: [52, 24] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Press out in lunge — resist rotation", muscles: ["obliques", "quadriceps"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Stand back up" },
    ], form_checks: ["Anti-rotation in unstable position"], highlight_muscles: ["obliques", "quadriceps"] },

  // Banded High-to-Low Chop
  { exercise_id: "core_111", exercise_name: "Banded High-to-Low Chop", program_tag: "Performance", difficulty: 3, equipment: "band", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Diagonal core power", movement_type: "chop", primary_joints: ["core", "shoulder"], locked_segments: ["hips_stable"], planes: ["transverse", "sagittal"],
    phases: [
      { name: "High", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [30, 10], hand_r: [42, 12] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Hands high to one side" },
      { name: "Chop", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [58, 56], hand_r: [66, 58], t_spine: [52, 30] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Chop diagonally — rotate through core", muscles: ["obliques", "rectus_abdominis"] },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [30, 10], hand_r: [42, 12] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Return to high position" },
    ], form_checks: ["Power from core, not arms", "Hips stay stable"], highlight_muscles: ["obliques", "rectus_abdominis"] },

  // Double Arm March
  { exercise_id: "fa_112", exercise_name: "Double Arm March", program_tag: "Foot/Ankle", difficulty: 1, equipment: "none", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Marching pattern with arm drive", movement_type: "march", primary_joints: ["hip", "shoulder"], locked_segments: ["core_braced"], planes: ["sagittal"],
    phases: [
      { name: "March R", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 52], hand_l: [34, 22], hand_r: [66, 44] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "High knee — opposite arm drives", muscles: ["hip_flexors", "rectus_abdominis"] },
      { name: "March L", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 52], hand_l: [34, 44], hand_r: [66, 22] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Other side — tall posture" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return" },
    ], form_checks: ["Opposite arm-leg pattern", "Stay tall"], highlight_muscles: ["hip_flexors", "rectus_abdominis"] },

  // Supine Overhead w Breathing
  { exercise_id: "breath_113", exercise_name: "Supine Overhead w Breathing", program_tag: "Breath", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "side", goal: "mobility", primary_outcome: "Overhead reach with breath", movement_type: "reach_breath", primary_joints: ["shoulder", "diaphragm"], locked_segments: ["rib_cage_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SUPINE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie on back" },
      { name: "Reach & Inhale", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [10, 38], wrist_r: [10, 62], rib_l: [28, 42], rib_r: [28, 58] }), duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Arms overhead — inhale, expand ribs", muscles: ["diaphragm", "latissimus_dorsi"] },
      { name: "Lower & Exhale", pose: NEUTRAL_SUPINE, duration: 6, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Arms down — long exhale" },
    ], form_checks: ["Ribs stay flat on floor", "No arching"], highlight_muscles: ["diaphragm", "latissimus_dorsi"] },

  // Bench Thoracic Mobility
  { exercise_id: "neck_114", exercise_name: "Bench Thoracic Mobility", program_tag: "Shoulder Relief", difficulty: 2, equipment: "bench", position: "kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Thoracic extension over bench", movement_type: "extension", primary_joints: ["thoracic_spine"], locked_segments: ["lumbar_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_l: [16, 44], hand_r: [16, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Kneel at bench, elbows on edge" },
      { name: "Sink", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [18, 44], c_spine: [22, 44], t_spine: [32, 40], shoulder_l: [20, 40], shoulder_r: [20, 48] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Sink chest through — feel thoracic extension", muscles: ["erector_spinae", "latissimus_dorsi"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { t_spine: [32, 40] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold — breathe into back" },
      { name: "Release", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Lumbar stays neutral", "Movement from thoracic"], highlight_muscles: ["erector_spinae", "latissimus_dorsi"] },

  // Farmers Carry (DB name variant)
  { exercise_id: "str_115", exercise_name: "Farmers Carry", program_tag: "Performance", difficulty: 2, equipment: "dumbbell", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Anti-lateral flexion, grip", movement_type: "carry", primary_joints: ["core", "grip"], locked_segments: ["rib_stack"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [30, 52], hand_r: [70, 52] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Weights at sides" },
      { name: "Walk 1", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 60], knee_r: [58, 68] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Walk with control — don't lean", muscles: ["obliques", "quadratus_lumborum"] },
      { name: "Walk 2", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 68], knee_r: [58, 60] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Ribs stacked over hips" },
    ], form_checks: ["No lean", "Neutral gaze"], highlight_muscles: ["obliques", "quadratus_lumborum"] },

  // Half Kneeling Shoulder Press
  { exercise_id: "str_116", exercise_name: "Half Kneeling Shoulder Press", program_tag: "Shoulder Relief", difficulty: 3, equipment: "dumbbell", position: "half_kneeling", view_angle_default: "front", goal: "strength", primary_outcome: "Overhead pressing with core demand", movement_type: "press", primary_joints: ["glenohumeral", "core"], locked_segments: ["pelvis_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], hand_r: [64, 24] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Half kneel, weight at shoulder" },
      { name: "Press", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], hand_r: [64, 8], wrist_r: [64, 10] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Press overhead — stay tall", muscles: ["posterior_deltoid", "serratus_anterior"] },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 72], hand_r: [64, 24] }), duration: 3, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Lower with control" },
    ], form_checks: ["No rib flare", "Core engaged throughout"], highlight_muscles: ["posterior_deltoid", "serratus_anterior"] },

  // Squat to Bilateral Row
  { exercise_id: "str_117", exercise_name: "Squat to Bilateral Row", program_tag: "Performance", difficulty: 3, equipment: "band", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Combined squat and pull", movement_type: "squat_row", primary_joints: ["hip", "knee", "scapula"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Squat", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 54], knee_l: [40, 66], knee_r: [60, 66], hand_l: [36, 36], hand_r: [64, 36] }), duration: 2, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Squat — arms extended", muscles: ["quadriceps"] },
      { name: "Stand & Row", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [36, 38], hand_r: [64, 38], elbow_l: [30, 38], elbow_r: [70, 38], scap_l: [42, 28], scap_r: [58, 28] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Stand up — pull band to chest", muscles: ["rhomboids", "gluteus_maximus"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Reset" },
    ], form_checks: ["Smooth transition", "Squeeze at top of row"], highlight_muscles: ["quadriceps", "rhomboids", "gluteus_maximus"] },

  // Sled Push (simplified for avatar)
  { exercise_id: "str_118", exercise_name: "Sled Push", program_tag: "Performance", difficulty: 4, equipment: "sled", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Full body push power", movement_type: "push", primary_joints: ["hip", "knee", "ankle"], locked_segments: ["spine_braced"], planes: ["sagittal"],
    phases: [
      { name: "Drive Position", pose: poseFrom(NEUTRAL_STANDING, { skull: [42, 18], t_spine: [46, 32], pelvis: [52, 48], hand_l: [34, 30], hand_r: [34, 40], knee_l: [42, 62], knee_r: [58, 68] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Lean in, arms extended to sled" },
      { name: "Push Step", pose: poseFrom(NEUTRAL_STANDING, { skull: [40, 18], pelvis: [50, 46], knee_l: [38, 58], knee_r: [60, 70] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive — powerful leg push", muscles: ["quadriceps", "gluteus_maximus", "gastrocnemius"] },
      { name: "Recovery Step", pose: poseFrom(NEUTRAL_STANDING, { skull: [42, 18], knee_l: [44, 64], knee_r: [56, 62] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Recover — next step" },
    ], form_checks: ["Low body angle", "Drive through floor"], highlight_muscles: ["quadriceps", "gluteus_maximus", "gastrocnemius"] },

  // DNS-based developmental positions
  // 3-Month Supine Overhead
  { exercise_id: "dns_119", exercise_name: "3-Month Supine Overhead", program_tag: "DNS", difficulty: 2, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "DNS 3-month position — overhead reach with core control", movement_type: "developmental", primary_joints: ["shoulder", "core"], locked_segments: ["pelvis_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Supine, knees at 90°" },
      { name: "Reach", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [14, 36], wrist_r: [14, 64], hand_l: [12, 34], hand_r: [12, 66] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Reach overhead — maintain core", muscles: ["transverse_abdominis", "serratus_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { wrist_l: [14, 36], wrist_r: [14, 64] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold position" },
      { name: "Return", pose: NEUTRAL_SUPINE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower arms" },
    ], form_checks: ["Ribs stay down", "No arching"], highlight_muscles: ["transverse_abdominis", "serratus_anterior"] },

  // 3-Month Prone
  { exercise_id: "dns_120", exercise_name: "3-Month Prone", program_tag: "DNS", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "side", goal: "stability", primary_outcome: "DNS prone position — forearm support", movement_type: "developmental", primary_joints: ["cervical_spine", "scapula"], locked_segments: ["pelvis_on_floor"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_PRONE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Prone on forearms" },
      { name: "Prop Up", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50], c_spine: [16, 50], t_spine: [24, 50], elbow_l: [20, 40], elbow_r: [20, 60] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Push up on forearms — chin tucked", muscles: ["deep_neck_flexors", "serratus_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50], t_spine: [24, 50] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold — support through scapula" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower" },
    ], form_checks: ["Scapula support", "Chin stays tucked"], highlight_muscles: ["deep_neck_flexors", "serratus_anterior"] },

  // 4.5-Month Prone
  { exercise_id: "dns_121", exercise_name: "4.5-Month Prone", program_tag: "DNS", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "side", goal: "stability", primary_outcome: "Extended prone developmental position", movement_type: "developmental", primary_joints: ["cervical_spine", "scapula", "elbow"], locked_segments: [], planes: ["sagittal"],
    phases: [
      { name: "Prop Higher", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], c_spine: [14, 50], t_spine: [22, 50], elbow_l: [18, 38], elbow_r: [18, 62], wrist_l: [16, 34], wrist_r: [16, 66] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Push higher — extended arm support", muscles: ["serratus_anterior", "deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], t_spine: [22, 50] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold — active support" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower" },
    ], form_checks: ["Active scapular engagement", "Spine neutral"], highlight_muscles: ["serratus_anterior"] },

  // 5-Month Side Lying
  { exercise_id: "dns_122", exercise_name: "5-Month Side Lying", program_tag: "DNS", difficulty: 2, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "stability", primary_outcome: "DNS side-lying developmental position", movement_type: "developmental", primary_joints: ["core", "hip"], locked_segments: [], planes: ["frontal"],
    phases: [
      { name: "Side Position", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], elbow_l: [24, 40], knee_l: [56, 44], knee_r: [56, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying, propped on elbow" },
      { name: "Activate", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 42], pelvis: [48, 46], hip_l: [50, 42], hip_r: [50, 50] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift — stabilize through obliques", muscles: ["obliques", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [48, 46] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold developmental position" },
      { name: "Release", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Controlled position", "No collapsing"], highlight_muscles: ["obliques", "gluteus_medius"] },

  // 11-Month Step Through
  { exercise_id: "dns_123", exercise_name: "11-Month Step Through", program_tag: "DNS", difficulty: 3, equipment: "none", position: "quadruped", view_angle_default: "front", goal: "stability", primary_outcome: "Transitional movement pattern", movement_type: "developmental", primary_joints: ["hip", "core"], locked_segments: [], planes: ["sagittal", "transverse"],
    phases: [
      { name: "Bear", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Start in bear position" },
      { name: "Step Through", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_r: [58, 60], ankle_r: [62, 68], hip_r: [54, 52] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.2, 1], cue: "Thread leg through to seated", muscles: ["obliques", "hip_flexors"] },
      { name: "Return", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.2, 1], cue: "Return to bear" },
    ], form_checks: ["Control the transition", "No collapsing"], highlight_muscles: ["obliques", "hip_flexors"] },

  // Tall Kneeling
  { exercise_id: "dns_124", exercise_name: "Tall Kneeling", program_tag: "DNS", difficulty: 1, equipment: "none", position: "kneeling", view_angle_default: "side", goal: "stability", primary_outcome: "Upright kneeling posture", movement_type: "isometric", primary_joints: ["hip", "core"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Kneel", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], ankle_l: [44, 78], ankle_r: [56, 78], pelvis: [50, 56] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Tall kneel — squeeze glutes, stack ribs", muscles: ["gluteus_maximus", "rectus_abdominis"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], pelvis: [50, 56] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — perfect alignment" },
      { name: "Stand", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Stand up" },
    ], form_checks: ["Glutes engaged", "Ribs stacked over pelvis"], highlight_muscles: ["gluteus_maximus", "rectus_abdominis"] },

  // ═══════════════════════════════════════════════════════════════
  // MISSING SPECS — PT-GRADE BIOMECHANICAL ACCURACY
  // ═══════════════════════════════════════════════════════════════

  // ─── PRESS UPS (side view, prone spinal extension) ─────
  { exercise_id: "back_200", exercise_name: "Press Ups", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "side", goal: "mobility", primary_outcome: "Lumbar extension, disc centralization", movement_type: "extension", primary_joints: ["lumbar_spine"], locked_segments: ["pelvis_on_floor"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [22, 44], hand_r: [22, 56], elbow_l: [22, 40], elbow_r: [22, 60] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie face down, hands under shoulders" },
      { name: "Press Up", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], c_spine: [14, 50], t_spine: [22, 52], l_spine: [36, 52], sternum: [18, 50], shoulder_l: [16, 42], shoulder_r: [16, 58], elbow_l: [20, 38], elbow_r: [20, 62], wrist_l: [24, 36], wrist_r: [24, 64], hand_l: [26, 36], hand_r: [26, 64], pelvis: [50, 54], sacrum: [52, 54], hip_l: [52, 48], hip_r: [52, 56] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Press chest up — hips stay on floor", muscles: ["erector_spinae", "multifidus"] },
      { name: "Hold Top", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], c_spine: [14, 50], t_spine: [22, 52], l_spine: [36, 52], pelvis: [50, 54] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel lumbar extension" },
      { name: "Lower", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [22, 44], hand_r: [22, 56] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Lower slowly — control the descent" },
    ], form_checks: ["Hips STAY on floor", "No shoulder shrug", "Extension from lumbar, not thoracic"], highlight_muscles: ["erector_spinae", "multifidus"] },

  // ─── PRESS UPS W EXHALE ─────
  { exercise_id: "back_201", exercise_name: "Press Ups w Exhale", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "side", goal: "mobility", primary_outcome: "Lumbar extension with exhale to reduce tone", movement_type: "extension", primary_joints: ["lumbar_spine"], locked_segments: ["pelvis_on_floor"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [22, 44], hand_r: [22, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Prone, hands under shoulders" },
      { name: "Press Up", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], c_spine: [14, 50], t_spine: [22, 52], l_spine: [36, 52], pelvis: [50, 54], shoulder_l: [16, 42], shoulder_r: [16, 58], elbow_l: [20, 38], elbow_r: [20, 62] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Press up — inhale on the way up", muscles: ["erector_spinae"] },
      { name: "Exhale at Top", pose: poseFrom(NEUTRAL_PRONE, { skull: [10, 50], t_spine: [22, 52], l_spine: [36, 52], pelvis: [50, 54], rib_l: [24, 46], rib_r: [24, 54] }), duration: 4, breath: "exhale", easing: "linear", cue: "EXHALE fully at top — reduce muscle tone", muscles: ["diaphragm", "erector_spinae"] },
      { name: "Lower", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [22, 44], hand_r: [22, 56] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Lower with control" },
    ], form_checks: ["Full exhale at top position", "Hips stay grounded"], highlight_muscles: ["erector_spinae", "diaphragm"] },

  // ─── OPEN BOOK (side lying T-spine rotation) ─────
  { exercise_id: "back_202", exercise_name: "Open Book", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "mobility", primary_outcome: "Thoracic rotation, stacked pelvis", movement_type: "rotation", primary_joints: ["thoracic_spine"], locked_segments: ["pelvis_stacked", "lumbar_minimal"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], c_spine: [24, 44], t_spine: [34, 46], l_spine: [44, 48], pelvis: [50, 50], knee_l: [58, 40], knee_r: [58, 56], hand_l: [30, 36], hand_r: [30, 56], elbow_l: [28, 38], elbow_r: [28, 54] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying, knees stacked, arms together" },
      { name: "Open", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], t_spine: [34, 48], shoulder_r: [28, 68], elbow_r: [26, 72], wrist_r: [24, 76], hand_r: [22, 78], sternum: [30, 52], rib_l: [32, 42], rib_r: [32, 58], knee_l: [58, 40], knee_r: [58, 56], pelvis: [50, 50] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Open top arm — rotate through T-spine only", muscles: ["obliques", "rhomboids", "intercostals"] },
      { name: "Hold Open", pose: poseFrom(NEUTRAL_SUPINE, { shoulder_r: [28, 70], elbow_r: [26, 74], hand_r: [22, 78], pelvis: [50, 50], knee_l: [58, 40], knee_r: [58, 56] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold — breathe into open side, pelvis stays stacked" },
      { name: "Close", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], hand_l: [30, 36], hand_r: [30, 56], pelvis: [50, 50], knee_l: [58, 40], knee_r: [58, 56] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Close slowly — pelvis doesn't move" },
    ], form_checks: ["Pelvis stays STACKED — no rolling", "Rotation from T-spine, not lumbar", "Knees stay together"], highlight_muscles: ["obliques", "rhomboids", "intercostals"] },

  // ─── KNEELING THORACIC HINGE ─────
  { exercise_id: "back_203", exercise_name: "Kneeling Thoracic Hinge", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Thoracic extension from kneeling", movement_type: "hinge", primary_joints: ["thoracic_spine", "hip"], locked_segments: ["lumbar_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], ankle_l: [44, 80], ankle_r: [56, 80], pelvis: [50, 56], l_spine: [50, 44], t_spine: [50, 32], c_spine: [50, 24], skull: [50, 18], hand_l: [46, 18], hand_r: [54, 18] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Tall kneel, hands behind head" },
      { name: "Hinge Back", pose: poseFrom(NEUTRAL_STANDING, { skull: [56, 26], c_spine: [56, 32], t_spine: [54, 40], l_spine: [52, 48], pelvis: [50, 58], knee_l: [44, 70], knee_r: [56, 70], ankle_l: [44, 82], ankle_r: [56, 82], hand_l: [52, 22], hand_r: [58, 22], sternum: [54, 36], hip_l: [46, 56], hip_r: [54, 56] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Lean back from knees — spine stays long, ribs down", muscles: ["erector_spinae", "rectus_abdominis", "quadriceps"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [56, 26], t_spine: [54, 40], pelvis: [50, 58], knee_l: [44, 70], knee_r: [56, 70] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel thoracic opening, lumbar stays neutral" },
      { name: "Return", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], pelvis: [50, 56], skull: [50, 18], hand_l: [46, 18], hand_r: [54, 18] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Return to tall kneel with control" },
    ], form_checks: ["Lumbar stays NEUTRAL — no excessive arch", "Hinge from knees, not lumbar", "Ribs stay down"], highlight_muscles: ["erector_spinae", "rectus_abdominis", "quadriceps"] },

  // ─── TRI PLANAR CALF STRETCH ─────
  { exercise_id: "fa_204", exercise_name: "Tri Planar Calf Stretch", program_tag: "Foot/Ankle", difficulty: 1, equipment: "wall", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "Calf stretch in sagittal, medial, and lateral planes", movement_type: "stretch_hold", primary_joints: ["ankle", "knee"], locked_segments: ["pelvis_square"], planes: ["sagittal", "frontal", "transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 24], hand_r: [62, 24], knee_l: [42, 60], ankle_r: [64, 82], heel_r: [66, 84], forefoot_r: [68, 82], knee_r: [60, 72] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Lunge facing wall, back heel DOWN" },
      { name: "Sagittal Stretch", pose: poseFrom(NEUTRAL_STANDING, { skull: [48, 16], t_spine: [48, 30], knee_l: [40, 58], ankle_l: [40, 76], ankle_r: [64, 82], heel_r: [66, 84], knee_r: [58, 72], pelvis: [50, 48] }), duration: 4, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Plane 1: Knee forward over 2nd toe — heel stays planted", muscles: ["gastrocnemius", "soleus"] },
      { name: "Hold Sagittal", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [40, 58], ankle_r: [64, 82], heel_r: [66, 84] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold 15 sec — breathe" },
      { name: "Medial Bias", pose: poseFrom(NEUTRAL_STANDING, { skull: [46, 16], knee_l: [38, 58], ankle_r: [62, 82], heel_r: [64, 84], forefoot_r: [66, 80], pelvis: [48, 48] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Plane 2: Angle knee inward — medial calf bias", muscles: ["gastrocnemius", "soleus"] },
      { name: "Hold Medial", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [38, 58], ankle_r: [62, 82] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold 15 sec — feel medial calf stretch" },
      { name: "Lateral Bias", pose: poseFrom(NEUTRAL_STANDING, { skull: [52, 16], knee_l: [44, 58], ankle_r: [66, 82], heel_r: [68, 84], forefoot_r: [70, 82], pelvis: [52, 48] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Plane 3: Angle knee outward — lateral calf bias", muscles: ["gastrocnemius", "soleus", "peroneals"] },
      { name: "Hold Lateral", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 58], ankle_r: [66, 82] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold 15 sec — feel lateral stretch" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Step back — release" },
    ], form_checks: ["Heel MUST stay on floor all 3 planes", "Knee tracks over toes, not inward", "Pelvis stays square"], highlight_muscles: ["gastrocnemius", "soleus", "peroneals"] },

  // ─── SCIATIC NERVE FLOSS ─────
  { exercise_id: "back_205", exercise_name: "Sciatic Nerve Floss", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "seated", view_angle_default: "side", goal: "mobility", primary_outcome: "Neural mobilization of sciatic nerve", movement_type: "nerve_glide", primary_joints: ["hip", "knee", "cervical_spine"], locked_segments: ["lumbar_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall on chair edge" },
      { name: "Extend & Look Up", pose: poseFrom(NEUTRAL_SEATED, { skull: [52, 12], c_spine: [52, 18], knee_r: [64, 56], ankle_r: [74, 58], forefoot_r: [76, 56] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Straighten leg + look up — gentle glide", muscles: ["hamstrings"] },
      { name: "Flex & Look Down", pose: poseFrom(NEUTRAL_SEATED, { skull: [48, 16], c_spine: [48, 22], knee_r: [64, 64], ankle_r: [70, 74], forefoot_r: [72, 76] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Bend knee + look down — smooth glide" },
      { name: "Return", pose: NEUTRAL_SEATED, duration: 2, breath: "natural", easing: "easeInOut", cue: "Return to neutral" },
    ], form_checks: ["SMOOTH oscillation — no jerking", "Pain-free only", "Gentle neural glide, NOT aggressive stretch"], highlight_muscles: ["hamstrings"] },

  // ─── LOW BACK CAT COW (isolated lumbar) ─────
  { exercise_id: "back_206", exercise_name: "Low Back Cat Cow", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "mobility", primary_outcome: "Isolated lumbar segmental motion", movement_type: "flexion_extension", primary_joints: ["lumbar_spine", "pelvis"], locked_segments: ["thoracic_spine", "cervical_spine"], planes: ["sagittal"],
    phases: [
      { name: "Neutral", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours — lock T-spine and neck still" },
      { name: "Lumbar Flex", pose: poseFrom(NEUTRAL_QUADRUPED, { l_spine: [46, 38], pelvis: [54, 40], sacrum: [56, 40] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Tuck pelvis ONLY — round low back only", muscles: ["rectus_abdominis", "multifidus"] },
      { name: "Lumbar Ext", pose: poseFrom(NEUTRAL_QUADRUPED, { l_spine: [46, 48], pelvis: [54, 48], sacrum: [56, 48] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Tip pelvis forward — arch low back only", muscles: ["erector_spinae", "multifidus"] },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Return to neutral" },
    ], form_checks: ["ONLY lumbar moves — T-spine and head stay still", "Pelvis initiates all motion"], highlight_muscles: ["multifidus", "erector_spinae"] },

  // ─── WINDSHIELD WIPER ─────
  { exercise_id: "back_207", exercise_name: "Windshield Wiper", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "supine", view_angle_default: "front", goal: "mobility", primary_outcome: "Hip rotation with controlled trunk", movement_type: "rotation", primary_joints: ["hip"], locked_segments: ["shoulders_flat"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62], ankle_l: [68, 38], ankle_r: [68, 62] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Supine, knees bent, arms out" },
      { name: "Drop Left", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 34], knee_r: [56, 46], ankle_l: [68, 32], ankle_r: [68, 44] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Lower both knees to left — slow control", muscles: ["obliques", "hip_internal_rotators"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 34], knee_r: [56, 46] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — both shoulders stay flat" },
      { name: "Center", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62] }), duration: 2, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Return to center" },
      { name: "Drop Right", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 54], knee_r: [56, 66], ankle_l: [68, 56], ankle_r: [68, 68] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Lower both knees to right", muscles: ["obliques"] },
      { name: "Return", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62] }), duration: 2, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Return to center" },
    ], form_checks: ["Shoulders stay flat on floor", "Slow controlled drops", "No fast whipping"], highlight_muscles: ["obliques", "hip_internal_rotators"] },

  // ─── BRETZL ─────
  { exercise_id: "back_208", exercise_name: "Bretzl", program_tag: "Low Back P2P", difficulty: 3, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "mobility", primary_outcome: "Combined hip flexor, quad, T-spine rotation stretch", movement_type: "stretch", primary_joints: ["thoracic_spine", "hip", "knee"], locked_segments: [], planes: ["transverse", "sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], knee_l: [56, 38], knee_r: [58, 56], hand_l: [30, 36] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying, top knee hugged forward" },
      { name: "Grab Foot", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], knee_r: [58, 62], ankle_r: [52, 66], hand_r: [50, 68], hip_r: [50, 58] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Reach back — grab bottom foot", muscles: ["quadriceps", "iliopsoas"] },
      { name: "Rotate", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], shoulder_r: [24, 68], elbow_r: [22, 72], t_spine: [34, 52], knee_r: [58, 62] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Rotate chest open — T-spine rotation", muscles: ["obliques", "rhomboids"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { shoulder_r: [24, 68], t_spine: [34, 52] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold & breathe — feel everything opening" },
      { name: "Release", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], hand_l: [30, 36] }), duration: 3, breath: "exhale", easing: "easeInOut", cue: "Release slowly" },
    ], form_checks: ["Sequence matters: grab foot THEN rotate", "T-spine rotation, not lumbar crank"], highlight_muscles: ["quadriceps", "iliopsoas", "obliques", "rhomboids"] },

  // ─── BRACING LEG LIFT ─────
  { exercise_id: "back_209", exercise_name: "Bracing Leg Lift", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "360° abdominal bracing during leg movement", movement_type: "brace", primary_joints: ["hip"], locked_segments: ["lumbar_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Brace", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62], rib_l: [28, 46], rib_r: [28, 54] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Brace 360° — feel belly expand all directions", muscles: ["transverse_abdominis", "diaphragm"] },
      { name: "Lift Leg", pose: poseFrom(NEUTRAL_SUPINE, { knee_r: [48, 56], ankle_r: [40, 58], hip_r: [50, 54] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Lift one leg — LOW BACK DOES NOT MOVE", muscles: ["transverse_abdominis", "rectus_abdominis"] },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 38], knee_r: [56, 62] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Lower slowly — maintain brace" },
    ], form_checks: ["If lumbar arches → reject — restart with lighter load", "360° belly pressure maintained"], highlight_muscles: ["transverse_abdominis", "rectus_abdominis", "diaphragm"] },

  // ─── KNEE SIDE PLANK ─────
  { exercise_id: "back_210", exercise_name: "Knee Side Plank", program_tag: "Low Back P2P", difficulty: 1, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "stability", primary_outcome: "Lateral core stability (modified)", movement_type: "isometric", primary_joints: ["core"], locked_segments: ["pelvis_stacked"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], elbow_l: [24, 40], knee_l: [56, 44], knee_r: [56, 56], ankle_l: [60, 44], ankle_r: [60, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying on elbow, knees bent" },
      { name: "Lift", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 42], pelvis: [48, 44], hip_l: [50, 40], hip_r: [50, 48] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift hips — stack pelvis", muscles: ["obliques", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [48, 44] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold 15 sec — hips stacked, no sag" },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], pelvis: [50, 50] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower with control" },
    ], form_checks: ["Hips don't sag", "Pelvis stays stacked"], highlight_muscles: ["obliques", "gluteus_medius"] },

  // ─── QUADRUPED SCORPION ─────
  { exercise_id: "back_211", exercise_name: "Quadruped Scorpion", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "mobility", primary_outcome: "Controlled hip rotation from quadruped", movement_type: "rotation", primary_joints: ["hip"], locked_segments: ["spine_neutral"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours — spine neutral" },
      { name: "Rotate Out", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_r: [64, 62], hip_r: [56, 50], ankle_r: [72, 66] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Lift knee out to side — controlled hip rotation", muscles: ["gluteus_medius", "hip_internal_rotators"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_r: [64, 62] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — spine doesn't move" },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Return slowly" },
    ], form_checks: ["Spine stays neutral", "Controlled rotation, no lumbar whip"], highlight_muscles: ["gluteus_medius", "hip_internal_rotators"] },

  // ─── BEAR (hover hold) ─────
  { exercise_id: "back_212", exercise_name: "Bear", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "stability", primary_outcome: "Anti-extension bear hover", movement_type: "isometric", primary_joints: ["core", "shoulder"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Quadruped", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours" },
      { name: "Hover", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56], ankle_l: [74, 54], ankle_r: [74, 58] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift knees 1 inch — hover hold", muscles: ["transverse_abdominis", "serratus_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — ribs DOWN, no sway" },
      { name: "Lower", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower knees slowly" },
    ], form_checks: ["Ribs stay down — no arch", "Knees hover just 1 inch", "No bouncing"], highlight_muscles: ["transverse_abdominis", "serratus_anterior"] },

  // ─── ANTI-EXTENSION DEADBUG ─────
  { exercise_id: "back_213", exercise_name: "Anti-Extension Deadbug", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "Anti-extension focus dead bug", movement_type: "alternating_reach", primary_joints: ["shoulder", "hip"], locked_segments: ["lumbar_locked_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 40], knee_r: [56, 60], wrist_l: [24, 34], wrist_r: [24, 66] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Press low back into floor HARD" },
      { name: "Extend", pose: poseFrom(NEUTRAL_SUPINE, { wrist_r: [10, 68], hand_r: [8, 70], knee_l: [70, 42], ankle_l: [80, 42] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Extend opposite arm/leg — LOW BACK STAYS FLAT", muscles: ["transverse_abdominis", "rectus_abdominis"] },
      { name: "Return", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [56, 40], knee_r: [56, 60], wrist_l: [24, 34], wrist_r: [24, 66] }), duration: 2, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Return — maintain flat back" },
    ], form_checks: ["If lumbar lifts off floor → STOP, reduce range", "Ultra slow movement"], highlight_muscles: ["transverse_abdominis", "rectus_abdominis"] },

  // ─── SINGLE LEG GLUTE BRIDGE ─────
  { exercise_id: "back_214", exercise_name: "Single Leg Glute Bridge", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "supine", view_angle_default: "side", goal: "strength", primary_outcome: "Unilateral glute activation", movement_type: "bridge", primary_joints: ["hip"], locked_segments: ["rib_cage_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [58, 38], ankle_l: [68, 42], knee_r: [50, 56], ankle_r: [42, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "One foot on floor, other leg extended" },
      { name: "Tilt & Lift", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [44, 42], l_spine: [36, 44], hip_l: [46, 38], knee_l: [58, 36], knee_r: [50, 48] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Posterior tilt then drive up on ONE leg", muscles: ["gluteus_maximus", "hamstrings"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [44, 42] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — squeeze glute hard" },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { knee_l: [58, 38], ankle_l: [68, 42] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Lower slowly — maintain control" },
    ], form_checks: ["No rib flare", "Hips stay LEVEL — don't rotate", "Posterior tilt first"], highlight_muscles: ["gluteus_maximus", "hamstrings"] },

  // ─── BEAR CRAWLING ─────
  { exercise_id: "back_215", exercise_name: "Bear Crawling", program_tag: "Low Back P2P", difficulty: 3, equipment: "none", position: "quadruped", view_angle_default: "front", goal: "stability", primary_outcome: "Contralateral locomotion pattern", movement_type: "locomotion", primary_joints: ["core", "hip", "shoulder"], locked_segments: ["spine_neutral"], planes: ["sagittal", "transverse"],
    phases: [
      { name: "Bear Hover", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Bear hover position" },
      { name: "Crawl R", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_r: [16, 58], knee_l: [62, 48], hand_l: [20, 48], knee_r: [70, 60] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Right hand + left foot forward — SLOW", muscles: ["obliques", "serratus_anterior"] },
      { name: "Crawl L", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_l: [14, 50], knee_r: [62, 60], hand_r: [22, 64], knee_l: [70, 48] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Left hand + right foot forward", muscles: ["obliques", "serratus_anterior"] },
      { name: "Return", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to hover" },
    ], form_checks: ["No sway side to side", "Ribs stay down", "Slow contralateral pattern"], highlight_muscles: ["obliques", "serratus_anterior", "transverse_abdominis"] },

  // ─── HINGING PATTERNS ─────
  { exercise_id: "back_216", exercise_name: "Hinging Patterns", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "General hinge pattern practice", movement_type: "hinge", primary_joints: ["hip"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall, hands on hips" },
      { name: "Hinge", pose: poseFrom(NEUTRAL_STANDING, { skull: [42, 22], t_spine: [46, 34], l_spine: [48, 42], pelvis: [54, 50], sacrum: [56, 52], knee_l: [44, 66], knee_r: [58, 66] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Push hips back — spine stays long", muscles: ["hamstrings", "gluteus_maximus"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Drive hips forward — squeeze glutes" },
    ], form_checks: ["No squat pattern", "Spine stays neutral", "Hinge, don't bend"], highlight_muscles: ["hamstrings", "gluteus_maximus"] },

  // ─── DUMBBELL DEADLIFT ─────
  { exercise_id: "back_217", exercise_name: "Dumbbell Deadlift", program_tag: "Low Back P2P", difficulty: 3, equipment: "dumbbell", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Loaded hip hinge pattern", movement_type: "hinge", primary_joints: ["hip"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 48], hand_r: [62, 48] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Weights at sides" },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { skull: [38, 28], t_spine: [42, 38], l_spine: [46, 44], pelvis: [56, 52], hand_l: [42, 60], hand_r: [58, 60], knee_l: [44, 66], knee_r: [58, 66] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Hinge down — weights slide along thighs", muscles: ["hamstrings", "erector_spinae", "gluteus_maximus"] },
      { name: "Drive", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 48], hand_r: [62, 48] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Squeeze glutes — drive up", muscles: ["gluteus_maximus"] },
    ], form_checks: ["Neutral spine entire time", "Weights stay close to body"], highlight_muscles: ["hamstrings", "gluteus_maximus", "erector_spinae"] },

  // ─── CHIN RETRACTIONS (standing variant) ─────
  { exercise_id: "neck_218", exercise_name: "Chin Retractions", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "standing", view_angle_default: "side", goal: "stability", primary_outcome: "Posterior glide of skull over atlas", movement_type: "glide", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine", "scapula"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand tall" },
      { name: "Retract", pose: poseFrom(NEUTRAL_STANDING, { skull: [47, 12], c_spine: [48, 18] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Glide chin straight back — chin stays level", muscles: ["deep_neck_flexors", "longus_colli"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [47, 12], c_spine: [48, 18] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — no downward tilt" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 3, breath: "inhale", easing: [0.25, 0.1, 0.25, 1], cue: "Release slowly" },
    ], form_checks: ["Posterior translation ONLY — no head nod", "Max extension 5-8°", "No shoulder shrug"], highlight_muscles: ["deep_neck_flexors", "longus_colli"] },

  // ─── CHIN RETRACTIONS W EXTENSION ─────
  { exercise_id: "neck_219", exercise_name: "Chin Retractions w Extension", program_tag: "Neck Relief", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "Chin retraction + small cervical extension", movement_type: "glide_extend", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Retract", pose: poseFrom(NEUTRAL_STANDING, { skull: [47, 12], c_spine: [48, 18] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Glide chin back first", muscles: ["deep_neck_flexors"] },
      { name: "Extend", pose: poseFrom(NEUTRAL_STANDING, { skull: [48, 10], c_spine: [49, 16] }), duration: 2, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Small look up — 5-8° extension only", muscles: ["deep_neck_flexors", "multifidus"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Return smoothly" },
    ], form_checks: ["Retract FIRST, then extend", "Small controlled extension", "No crunching neck back"], highlight_muscles: ["deep_neck_flexors", "multifidus"] },

  // ─── FOAM ROLLER SWIM ─────
  { exercise_id: "neck_220", exercise_name: "Foam Roller Swim", program_tag: "Shoulder Relief", difficulty: 2, equipment: "foam_roller", position: "prone", view_angle_default: "front", goal: "mobility", primary_outcome: "Scapular control with shoulder movement", movement_type: "swim", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["lumbar_neutral"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [12, 44], hand_r: [12, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Prone on floor, arms overhead" },
      { name: "Swim Right", pose: poseFrom(NEUTRAL_PRONE, { hand_r: [40, 60], elbow_r: [30, 62], shoulder_r: [22, 60] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Sweep right arm back — scap control", muscles: ["lower_trapezius", "rhomboids"] },
      { name: "Swim Left", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [40, 40], elbow_l: [30, 38], shoulder_l: [22, 40] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Sweep left arm back", muscles: ["lower_trapezius", "rhomboids"] },
      { name: "Return", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [12, 44], hand_r: [12, 56] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Arms back overhead" },
    ], form_checks: ["No lumbar hyperextension", "Scap control throughout"], highlight_muscles: ["lower_trapezius", "rhomboids"] },

  // ─── SIDE LYING ROTATIONS ─────
  { exercise_id: "neck_221", exercise_name: "Side Lying Rotations", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "mobility", primary_outcome: "Thoracic rotation from side lying", movement_type: "rotation", primary_joints: ["thoracic_spine"], locked_segments: ["pelvis_stacked"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], knee_l: [58, 40], knee_r: [58, 56], hand_l: [30, 36], hand_r: [30, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side lying, arms together" },
      { name: "Rotate Open", pose: poseFrom(NEUTRAL_SUPINE, { shoulder_r: [28, 70], hand_r: [22, 76], t_spine: [34, 50], knee_l: [58, 40], knee_r: [58, 56] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Open top arm — rotate T-spine", muscles: ["obliques", "rhomboids"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { shoulder_r: [28, 70], hand_r: [22, 76] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold — breathe into open side" },
      { name: "Close", pose: poseFrom(NEUTRAL_SUPINE, { hand_l: [30, 36], hand_r: [30, 56] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Close slowly" },
    ], form_checks: ["Pelvis stays stacked", "Rotate from T-spine not lumbar"], highlight_muscles: ["obliques", "rhomboids"] },

  // ─── BRUEGGERS ─────
  { exercise_id: "neck_222", exercise_name: "Brueggers", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "stability", primary_outcome: "Postural reset — scap retraction + ER", movement_type: "posture", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["lumbar_neutral"], planes: ["frontal", "transverse"],
    phases: [
      { name: "Slouch", pose: poseFrom(NEUTRAL_SEATED, { skull: [50, 16], shoulder_l: [36, 28], shoulder_r: [64, 28], t_spine: [50, 32] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Start in relaxed posture" },
      { name: "Retract & Rotate", pose: poseFrom(NEUTRAL_SEATED, { skull: [50, 12], shoulder_l: [40, 24], shoulder_r: [60, 24], scap_l: [42, 28], scap_r: [58, 28], hand_l: [30, 52], hand_r: [70, 52], wrist_l: [32, 50], wrist_r: [68, 50], sternum: [50, 24] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Squeeze blades, rotate palms out — chin neutral", muscles: ["lower_trapezius", "rhomboids", "infraspinatus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { scap_l: [42, 28], scap_r: [58, 28], hand_l: [30, 52], hand_r: [70, 52] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold — feel lower trap engagement" },
      { name: "Release", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release slowly" },
    ], form_checks: ["No lumbar arch", "No shrugging", "Chin stays neutral"], highlight_muscles: ["lower_trapezius", "rhomboids", "infraspinatus"] },

  // ─── WALL PEC STRETCH ─────
  { exercise_id: "neck_223", exercise_name: "Wall Pec Stretch", program_tag: "Shoulder Relief", difficulty: 1, equipment: "wall", position: "standing", view_angle_default: "front", goal: "mobility", primary_outcome: "Pec minor/major stretch at wall", movement_type: "stretch_hold", primary_joints: ["glenohumeral", "pectorals"], locked_segments: ["rib_cage_neutral"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_r: [72, 20], elbow_r: [70, 26], shoulder_r: [64, 24] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Arm on wall at 90°" },
      { name: "Turn Away", pose: poseFrom(NEUTRAL_STANDING, { skull: [44, 14], t_spine: [46, 28], sternum: [48, 24], shoulder_l: [34, 24], hand_r: [72, 20] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Turn body away from wall — feel pec stretch", muscles: ["pectoralis_major", "pectoralis_minor"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [44, 14], hand_r: [72, 20] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold 20 sec — breathe normally" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Turn back — release" },
    ], form_checks: ["Rib cage stays neutral", "No lumbar arch"], highlight_muscles: ["pectoralis_major", "pectoralis_minor"] },

  // ─── WALL PUSHUP ─────
  { exercise_id: "neck_224", exercise_name: "Wall Pushup", program_tag: "Shoulder Relief", difficulty: 1, equipment: "wall", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Push pattern with serratus activation", movement_type: "push", primary_joints: ["glenohumeral", "elbow"], locked_segments: ["core_braced"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 28], hand_r: [62, 28], elbow_l: [36, 32], elbow_r: [64, 32] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Hands on wall, slight lean" },
      { name: "Lower", pose: poseFrom(NEUTRAL_STANDING, { skull: [48, 16], t_spine: [48, 30], elbow_l: [32, 34], elbow_r: [68, 34], scap_l: [42, 30], scap_r: [58, 30] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Lean in — bend elbows", muscles: ["pectoralis_major", "serratus_anterior"] },
      { name: "Push", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 28], hand_r: [62, 28] }), duration: 2, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Push away — plus at the top (reach extra)", muscles: ["serratus_anterior"] },
    ], form_checks: ["Core stays braced", "Serratus push-plus at top"], highlight_muscles: ["pectoralis_major", "serratus_anterior"] },

  // ─── BANDED IYT ─────
  { exercise_id: "neck_225", exercise_name: "Banded IYT", program_tag: "Shoulder Relief", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Scapular stabilizer activation", movement_type: "lift", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["core_braced"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "I Raise", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [44, 6], hand_r: [56, 6], wrist_l: [44, 8], wrist_r: [56, 8] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Arms straight overhead — I position", muscles: ["lower_trapezius"] },
      { name: "Lower", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower" },
      { name: "Y Raise", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [32, 8], hand_r: [68, 8], wrist_l: [34, 10], wrist_r: [66, 10] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Arms in Y — scap retraction", muscles: ["lower_trapezius", "rhomboids"] },
      { name: "Lower", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower" },
      { name: "T Raise", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [22, 24], hand_r: [78, 24], wrist_l: [24, 24], wrist_r: [76, 24] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Arms in T — squeeze shoulder blades", muscles: ["rhomboids", "posterior_deltoid"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Return to rest" },
    ], form_checks: ["No shrugging", "Scap control on each position", "Core stays braced"], highlight_muscles: ["lower_trapezius", "rhomboids", "posterior_deltoid"] },

  // ─── JANDA WALL CRAWL ─────
  { exercise_id: "neck_226", exercise_name: "Janda Wall Crawl", program_tag: "Shoulder Relief", difficulty: 2, equipment: "wall", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "Scapular upward rotation with wall slide", movement_type: "slide", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["rib_cage_neutral"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 28], hand_r: [62, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Face wall, fingertips on wall" },
      { name: "Crawl Up", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 10], hand_r: [62, 10], wrist_l: [38, 12], wrist_r: [62, 12], scap_l: [42, 22], scap_r: [58, 22] }), duration: 4, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Walk fingers up wall — scap rotates up", muscles: ["serratus_anterior", "lower_trapezius"] },
      { name: "Hold Top", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 10], hand_r: [62, 10] }), duration: 3, breath: "hold", easing: "linear", cue: "Hold — feel serratus/lower trap" },
      { name: "Crawl Down", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 28], hand_r: [62, 28] }), duration: 4, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Walk fingers down slowly" },
    ], form_checks: ["No trap shrug", "Ribs stay flat on wall"], highlight_muscles: ["serratus_anterior", "lower_trapezius"] },

  // ─── DORSIFLEXION ISOMETRICS ─────
  { exercise_id: "fa_227", exercise_name: "Dorsiflexion Isometrics", program_tag: "Foot/Ankle", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "side", goal: "strength", primary_outcome: "Anterior tibialis activation", movement_type: "isometric", primary_joints: ["ankle"], locked_segments: ["knee_stable"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Seated, foot on floor" },
      { name: "Dorsiflex", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 72], ankle_r: [70, 70] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Pull toes up hard — no toe clawing", muscles: ["tibialis_anterior"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 72] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold 10 sec — max effort" },
      { name: "Release", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["No toe clawing", "Ankle only, knee stays still"], highlight_muscles: ["tibialis_anterior"] },

  // ─── FOOT THREADING ─────
  { exercise_id: "fa_228", exercise_name: "Foot Threading", program_tag: "Foot/Ankle", difficulty: 2, equipment: "none", position: "seated", view_angle_default: "front", goal: "mobility", primary_outcome: "Midfoot mobility and toe splay", movement_type: "mobilization", primary_joints: ["midfoot", "toes"], locked_segments: ["ankle_stable"], planes: ["frontal", "transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SEATED, { knee_r: [64, 58], ankle_r: [70, 66] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Cross ankle over knee" },
      { name: "Thread & Spread", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 68], hand_r: [72, 66] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Thread fingers between toes — spread wide" },
      { name: "Rotate", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [74, 70], ankle_r: [70, 68] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Circle foot gently — midfoot mobility" },
      { name: "Release", pose: NEUTRAL_SEATED, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Foot moves, not whole leg", "Gentle — no forcing"], highlight_muscles: [] },

  // ─── COWBOY SIT ─────
  { exercise_id: "fa_229", exercise_name: "Cowboy Sit", program_tag: "Foot/Ankle", difficulty: 2, equipment: "none", position: "kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Plantar fascia stretch, ankle mobility", movement_type: "stretch", primary_joints: ["toes", "ankle"], locked_segments: [], planes: ["sagittal"],
    phases: [
      { name: "Tuck Toes", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], ankle_l: [44, 78], ankle_r: [56, 78], pelvis: [50, 60], forefoot_l: [44, 82], forefoot_r: [56, 82] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Kneel with toes tucked under" },
      { name: "Sit Back", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 64], knee_l: [44, 70], knee_r: [56, 70], skull: [50, 22] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Sit back gradually onto heels — feel plantar fascia stretch", muscles: [] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 64] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold — intensity builds gradually" },
      { name: "Release", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lift forward — release" },
    ], form_checks: ["Heels stay aligned", "No knee valgus collapse"], highlight_muscles: [] },

  // ─── DOWNWARD DOG ─────
  { exercise_id: "fa_230", exercise_name: "Downward Dog", program_tag: "Foot/Ankle", difficulty: 1, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "mobility", primary_outcome: "Posterior chain stretch, calf/hamstring", movement_type: "stretch", primary_joints: ["hip", "ankle", "shoulder"], locked_segments: ["spine_long"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Start on all fours" },
      { name: "Push Up", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [28, 48], c_spine: [30, 48], t_spine: [36, 44], l_spine: [42, 40], pelvis: [52, 34], sacrum: [54, 34], hip_l: [52, 32], hip_r: [52, 36], knee_l: [62, 44], knee_r: [62, 48], ankle_l: [70, 56], ankle_r: [70, 60], heel_l: [72, 58], heel_r: [72, 62], hand_l: [18, 60], hand_r: [22, 64] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Push hips up & back — press heels toward floor", muscles: ["hamstrings", "gastrocnemius", "latissimus_dorsi"] },
      { name: "Pedal", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [28, 48], pelvis: [52, 34], knee_l: [60, 42], knee_r: [64, 50], heel_l: [70, 56], heel_r: [74, 64] }), duration: 3, breath: "natural", easing: "easeInOut", cue: "Pedal feet — alternating heel reach", muscles: ["gastrocnemius", "soleus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { pelvis: [52, 34], heel_l: [72, 58], heel_r: [72, 62] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold — long spine, press heels down" },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Walk hands back — return" },
    ], form_checks: ["Long spine — no rounding", "Hip hinge dominant", "Ribs don't flare"], highlight_muscles: ["hamstrings", "gastrocnemius", "latissimus_dorsi"] },

  // ─── FROG STRETCH ─────
  { exercise_id: "hip_231", exercise_name: "Frog Stretch", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "front", goal: "mobility", primary_outcome: "Hip abduction/external rotation stretch", movement_type: "stretch_hold", primary_joints: ["hip"], locked_segments: ["spine_neutral"], planes: ["frontal"],
    phases: [
      { name: "Wide Knees", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 44], knee_r: [66, 64], hip_l: [56, 36], hip_r: [56, 52], ankle_l: [76, 44], ankle_r: [76, 64] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Knees wide, ankles aligned behind" },
      { name: "Rock Back", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [30, 48], pelvis: [60, 48], knee_l: [68, 44], knee_r: [68, 64], hip_l: [58, 36], hip_r: [58, 52] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Rock hips back — feel inner thigh stretch", muscles: ["adductors", "hip_internal_rotators"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { pelvis: [60, 48] }), duration: 20, breath: "natural", easing: "linear", cue: "Hold — breathe deeply" },
      { name: "Release", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Rock forward — release" },
    ], form_checks: ["Pelvis stays neutral — no arching", "Gradual depth increase"], highlight_muscles: ["adductors", "hip_internal_rotators"] },

  // ─── TRI PLANAR HIP OPENER ─────
  { exercise_id: "hip_232", exercise_name: "Tri Planar Hip Opener", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "front", goal: "mobility", primary_outcome: "Hip mobility in 3 planes", movement_type: "dynamic", primary_joints: ["hip"], locked_segments: ["spine_tall", "pelvis_square"], planes: ["sagittal", "frontal", "transverse"],
    phases: [
      { name: "Forward", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 52], hip_r: [56, 46] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Hip flexion — knee to chest", muscles: ["hip_flexors"] },
      { name: "Diagonal", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [64, 50], hip_r: [58, 44] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Open diagonally — external rotation", muscles: ["gluteus_medius"] },
      { name: "Lateral", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [70, 58], hip_r: [62, 48] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Abduct — open to side", muscles: ["gluteus_medius", "adductors"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Return to standing" },
    ], form_checks: ["Pelvis stays square throughout", "Spine stays tall"], highlight_muscles: ["hip_flexors", "gluteus_medius", "adductors"] },

  // ─── PRONE CERVICAL RETRACTION ─────
  { exercise_id: "neck_233", exercise_name: "Prone Cervical Retraction", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "prone", view_angle_default: "side", goal: "stability", primary_outcome: "Chin retraction from prone", movement_type: "glide", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { skull: [14, 50], c_spine: [18, 50] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Face down, forehead on hands" },
      { name: "Retract", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50], c_spine: [16, 50] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Tuck chin — posterior glide", muscles: ["deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50] }), duration: 5, breath: "hold", easing: "linear", cue: "Hold retraction" },
      { name: "Release", pose: poseFrom(NEUTRAL_PRONE, { skull: [14, 50] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Posterior glide, not flexion"], highlight_muscles: ["deep_neck_flexors"] },

  // ─── PRONE HEAD LIFTS ─────
  { exercise_id: "neck_234", exercise_name: "Prone Head Lifts", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "prone", view_angle_default: "side", goal: "strength", primary_outcome: "Cervical extensor strengthening", movement_type: "lift", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_PRONE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Prone, chin tucked" },
      { name: "Lift", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50], c_spine: [16, 50] }), duration: 2, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Lift head — chin stays tucked", muscles: ["deep_neck_flexors", "multifidus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { skull: [12, 50] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold 5 sec" },
      { name: "Lower", pose: NEUTRAL_PRONE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower gently" },
    ], form_checks: ["Chin stays tucked throughout", "Small controlled lift"], highlight_muscles: ["deep_neck_flexors", "multifidus"] },

  // ─── SUPINE CERVICAL RETRACTION ─────
  { exercise_id: "neck_235", exercise_name: "Supine Cervical Retraction", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "supine", view_angle_default: "side", goal: "stability", primary_outcome: "Cervical retraction with gravity assist", movement_type: "glide", primary_joints: ["C1_C7"], locked_segments: ["thoracic_flat"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SUPINE, duration: 1, breath: "natural", easing: "easeInOut", cue: "Lie on back, no pillow" },
      { name: "Press Back", pose: poseFrom(NEUTRAL_SUPINE, { skull: [14, 50], c_spine: [18, 50] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Press back of head into floor — chin stays level", muscles: ["deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { skull: [14, 50] }), duration: 5, breath: "hold", easing: "linear", cue: "Hold — feel deep flexors activate" },
      { name: "Release", pose: NEUTRAL_SUPINE, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Chin doesn't tilt down", "Gentle posterior press"], highlight_muscles: ["deep_neck_flexors"] },

  // ─── QUADRUPED CERVICAL RETRACTION ─────
  { exercise_id: "neck_236", exercise_name: "Quadruped Cervical Retraction", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "stability", primary_outcome: "Chin retraction against gravity in quadruped", movement_type: "glide", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_QUADRUPED, duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours — head neutral" },
      { name: "Retract", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [24, 40], c_spine: [28, 42] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Pull chin in — make double chin", muscles: ["deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [24, 40] }), duration: 5, breath: "hold", easing: "linear", cue: "Hold — gravity adds resistance" },
      { name: "Release", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["Retraction against gravity", "No head nod"], highlight_muscles: ["deep_neck_flexors"] },

  // ─── PRONE SCORPION ─────
  { exercise_id: "neck_237", exercise_name: "Prone Scorpion", program_tag: "Low Back P2P", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "front", goal: "mobility", primary_outcome: "T-spine rotation + hip opener from prone", movement_type: "rotation", primary_joints: ["thoracic_spine", "hip"], locked_segments: ["shoulder_flat"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [14, 38], hand_r: [14, 62] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Prone, arms out to sides" },
      { name: "Scorpion Right", pose: poseFrom(NEUTRAL_PRONE, { knee_r: [50, 64], hip_r: [48, 58], ankle_r: [42, 68], t_spine: [30, 52] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Reach right foot across to left — rotate through T-spine", muscles: ["obliques", "hip_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_PRONE, { knee_r: [50, 64] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel rotation opening" },
      { name: "Return", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [14, 38], hand_r: [14, 62] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Return slowly" },
    ], form_checks: ["Opposite shoulder stays flat", "Control the rotation"], highlight_muscles: ["obliques", "hip_flexors"] },

  // ─── LATERAL WALL PLANK ─────
  { exercise_id: "back_238", exercise_name: "Lateral Wall Plank", program_tag: "Low Back P2P", difficulty: 1, equipment: "wall", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Lateral core activation standing", movement_type: "isometric", primary_joints: ["core"], locked_segments: ["spine_neutral"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [30, 34] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand sideways to wall, forearm on wall" },
      { name: "Press", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [30, 34], shoulder_l: [34, 28] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Press into wall — activate obliques", muscles: ["obliques", "quadratus_lumborum"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [30, 34] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — isometric lateral brace" },
      { name: "Release", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Release" },
    ], form_checks: ["No leaning", "Core stays engaged"], highlight_muscles: ["obliques", "quadratus_lumborum"] },

  // ─── SINGLE LEG BEAR ─────
  { exercise_id: "back_239", exercise_name: "Single Leg Bear", program_tag: "Low Back P2P", difficulty: 3, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "stability", primary_outcome: "Anti-rotation bear with leg extension", movement_type: "brace", primary_joints: ["core", "hip"], locked_segments: ["spine_neutral", "pelvis_level"], planes: ["sagittal"],
    phases: [
      { name: "Bear Hover", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Bear hover — knees 1 inch off" },
      { name: "Extend Leg", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [78, 56], ankle_r: [86, 56] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Extend one leg — pelvis stays level", muscles: ["gluteus_maximus", "transverse_abdominis"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_r: [78, 56] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — no pelvis rotation" },
      { name: "Return", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 2, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Return to hover" },
    ], form_checks: ["No pelvis twist", "No lumbar arch", "No rib flare"], highlight_muscles: ["gluteus_maximus", "transverse_abdominis"] },

  // ─── WORLD'S GREATEST STRETCH ─────
  { exercise_id: "hip_240", exercise_name: "World's Greatest Stretch", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "Combined hip, T-spine, hamstring mobility", movement_type: "flow", primary_joints: ["hip", "thoracic_spine", "ankle"], locked_segments: [], planes: ["sagittal", "transverse"],
    phases: [
      { name: "Lunge", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 60], knee_r: [62, 72], ankle_r: [66, 82], hand_l: [40, 76], hand_r: [58, 76] }), duration: 2, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Step into deep lunge — hands on floor", muscles: ["iliopsoas", "quadriceps"] },
      { name: "Elbow to Instep", pose: poseFrom(NEUTRAL_STANDING, { skull: [44, 44], elbow_l: [38, 68], knee_l: [40, 58] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Drive elbow to instep — feel hip open", muscles: ["adductors", "hip_flexors"] },
      { name: "Rotate", pose: poseFrom(NEUTRAL_STANDING, { skull: [44, 24], hand_l: [36, 14], shoulder_l: [38, 20], t_spine: [46, 34] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Rotate — reach to sky", muscles: ["obliques", "rhomboids"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "exhale", easing: "easeInOut", cue: "Step back — stand tall" },
    ], form_checks: ["Knee alignment", "T-spine rotation, not lumbar", "Control transitions"], highlight_muscles: ["iliopsoas", "obliques", "rhomboids"] },

  // ─── PASSIVE NECK ROTATIONS ─────
  { exercise_id: "neck_241", exercise_name: "Passive Neck Rotations", program_tag: "Neck Relief", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "mobility", primary_outcome: "Gentle cervical rotation with fixed gaze", movement_type: "rotation", primary_joints: ["C1_C7"], locked_segments: ["thoracic_spine"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Sit tall, eyes fixed on point" },
      { name: "Rotate Left", pose: poseFrom(NEUTRAL_SEATED, { skull: [44, 14], c_spine: [46, 20] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Turn head left slowly — eyes lead", muscles: ["deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SEATED, { skull: [44, 14] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold end range" },
      { name: "Center", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: [0.25, 0.1, 0.25, 1], cue: "Return to center" },
      { name: "Rotate Right", pose: poseFrom(NEUTRAL_SEATED, { skull: [56, 14], c_spine: [54, 20] }), duration: 3, breath: "exhale", easing: [0.25, 0.1, 0.25, 1], cue: "Turn right slowly" },
      { name: "Return", pose: NEUTRAL_SEATED, duration: 2, breath: "inhale", easing: [0.25, 0.1, 0.25, 1], cue: "Return to center" },
    ], form_checks: ["Slow rotation — no jerky movement", "Minimal cervical shear", "Gaze stable"], highlight_muscles: ["deep_neck_flexors"] },

  // ─── KNEELING ROW ─────
  { exercise_id: "neck_242", exercise_name: "Kneeling Row", program_tag: "Shoulder Relief", difficulty: 2, equipment: "band", position: "kneeling", view_angle_default: "side", goal: "strength", primary_outcome: "Scapular retraction + depression", movement_type: "pull", primary_joints: ["scapula", "elbow"], locked_segments: ["core_braced"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], hand_l: [34, 36], hand_r: [66, 36] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Tall kneel, band in front" },
      { name: "Row", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], elbow_l: [30, 40], elbow_r: [70, 40], scap_l: [42, 30], scap_r: [58, 30] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Pull elbows back — squeeze shoulder blades", muscles: ["rhomboids", "lower_trapezius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { elbow_l: [30, 40], elbow_r: [70, 40] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold squeeze — no shrugging" },
      { name: "Release", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [44, 68], knee_r: [56, 68], hand_l: [34, 36] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Extend forward slowly" },
    ], form_checks: ["Scap retract + depress — NOT shrug", "Core stays engaged"], highlight_muscles: ["rhomboids", "lower_trapezius"] },

  // ─── SERRATUS WALL SLIDES ─────
  { exercise_id: "neck_243", exercise_name: "Serratus Wall Slides", program_tag: "Shoulder Relief", difficulty: 2, equipment: "wall", position: "standing", view_angle_default: "side", goal: "mobility", primary_outcome: "Serratus activation with wall slide", movement_type: "slide", primary_joints: ["scapula", "glenohumeral"], locked_segments: ["rib_cage_flat"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 28], hand_r: [62, 28], scap_l: [42, 28], scap_r: [58, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Forearms on wall" },
      { name: "Slide Up + Protract", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 10], hand_r: [62, 10], scap_l: [38, 22], scap_r: [62, 22], shoulder_l: [36, 18], shoulder_r: [64, 18] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Slide up — push through with serratus", muscles: ["serratus_anterior", "lower_trapezius"] },
      { name: "Slide Down", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 28], hand_r: [62, 28] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Slide down with control" },
    ], form_checks: ["Serratus protraction at top", "No trap shrug", "Ribs stay flat"], highlight_muscles: ["serratus_anterior", "lower_trapezius"] },

  // ─── PLANK SHOULDER TAPS ─────
  { exercise_id: "core_244", exercise_name: "Plank Shoulder Taps", program_tag: "Performance", difficulty: 2, equipment: "none", position: "prone", view_angle_default: "front", goal: "stability", primary_outcome: "Anti-rotation in plank", movement_type: "tap", primary_joints: ["core", "shoulder"], locked_segments: ["spine_neutral"], planes: ["transverse"],
    phases: [
      { name: "Plank", pose: poseFrom(NEUTRAL_PRONE, { skull: [14, 50], elbow_l: [20, 40], elbow_r: [20, 60], pelvis: [50, 50] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "High plank — wide feet for stability" },
      { name: "Tap Right", pose: poseFrom(NEUTRAL_PRONE, { hand_l: [18, 56], wrist_l: [18, 54] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Tap right shoulder — don't shift hips", muscles: ["obliques", "transverse_abdominis"] },
      { name: "Center", pose: poseFrom(NEUTRAL_PRONE, { skull: [14, 50], pelvis: [50, 50] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Back to plank" },
      { name: "Tap Left", pose: poseFrom(NEUTRAL_PRONE, { hand_r: [18, 44], wrist_r: [18, 46] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Tap left shoulder — hips stay square", muscles: ["obliques"] },
      { name: "Return", pose: poseFrom(NEUTRAL_PRONE, { skull: [14, 50] }), duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to plank" },
    ], form_checks: ["No hip sway — widen stance if needed", "Trunk stays square"], highlight_muscles: ["obliques", "transverse_abdominis"] },

  // ─── WAITER'S CARRY ─────
  { exercise_id: "str_245", exercise_name: "Waiter's Carry", program_tag: "Shoulder Relief", difficulty: 2, equipment: "dumbbell", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Overhead carry stability", movement_type: "carry", primary_joints: ["glenohumeral", "core"], locked_segments: ["rib_cage_stacked"], planes: ["sagittal"],
    phases: [
      { name: "Press Up", pose: poseFrom(NEUTRAL_STANDING, { hand_r: [64, 6], wrist_r: [64, 8], elbow_r: [64, 16], scap_r: [60, 24] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Weight overhead — shoulder packed, ribs down", muscles: ["serratus_anterior", "obliques"] },
      { name: "Walk 1", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 60], hand_r: [64, 6] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Walk — no side bend, no rib flare" },
      { name: "Walk 2", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 60], hand_r: [64, 6] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Ribs stacked over pelvis" },
    ], form_checks: ["No rib flare", "No side bend", "Shoulder stays packed"], highlight_muscles: ["serratus_anterior", "obliques"] },

  // ─── LAT PIR ─────
  { exercise_id: "neck_246", exercise_name: "Lat PIR", program_tag: "Shoulder Relief", difficulty: 2, equipment: "none", position: "kneeling", view_angle_default: "side", goal: "mobility", primary_outcome: "Lat release via post-isometric relaxation", movement_type: "contract_relax", primary_joints: ["glenohumeral", "thoracic_spine"], locked_segments: [], planes: ["sagittal"],
    phases: [
      { name: "Stretch Position", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [28, 52], hand_l: [10, 44], hand_r: [10, 56], pelvis: [58, 52] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Child's pose with arms extended" },
      { name: "Contract", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [28, 52], hand_l: [10, 44], hand_r: [10, 56], pelvis: [58, 52] }), duration: 5, breath: "exhale", easing: "linear", cue: "Gently press hands into floor — 20% effort", muscles: ["latissimus_dorsi"] },
      { name: "Relax & Sink", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [30, 52], pelvis: [60, 54], hand_l: [8, 42], hand_r: [8, 58] }), duration: 5, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Release — sink deeper into stretch" },
    ], form_checks: ["Light contraction only — 20%", "Spine doesn't twist"], highlight_muscles: ["latissimus_dorsi"] },

  // ─── SPANISH SQUAT ISOMETRIC ─────
  { exercise_id: "knee_247", exercise_name: "Spanish Squat Isometric", program_tag: "Knee Relief", difficulty: 2, equipment: "band", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Quad isometric with vertical shin", movement_type: "isometric", primary_joints: ["knee"], locked_segments: ["torso_upright"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 62], knee_r: [58, 62] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Band behind knees, lean back slightly" },
      { name: "Sit Back", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [52, 52], knee_l: [40, 66], knee_r: [60, 66], hip_l: [46, 52], hip_r: [56, 52] }), duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Sit back into band — shin stays vertical", muscles: ["quadriceps"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [52, 52], knee_l: [40, 66], knee_r: [60, 66] }), duration: 30, breath: "natural", easing: "linear", cue: "Hold 30 sec — vertical shin angle" },
      { name: "Stand", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Stand up" },
    ], form_checks: ["Shin vertical", "Torso upright", "Knees don't cave"], highlight_muscles: ["quadriceps"] },

  // ─── SUITCASE CARRY ─────
  { exercise_id: "str_248", exercise_name: "Suitcase Carry", program_tag: "Performance", difficulty: 2, equipment: "dumbbell", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Anti-lateral flexion carry", movement_type: "carry", primary_joints: ["core"], locked_segments: ["pelvis_level"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_r: [70, 52] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Weight in one hand — stand tall" },
      { name: "Walk", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [42, 60], hand_r: [70, 52] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Walk — resist lean toward weight", muscles: ["obliques", "quadratus_lumborum"] },
      { name: "Walk 2", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 60], hand_r: [70, 52] }), duration: 2, breath: "natural", easing: "easeInOut", cue: "Pelvis stays level" },
    ], form_checks: ["NO lean into weight side", "Pelvis level"], highlight_muscles: ["obliques", "quadratus_lumborum"] },

  // ─── KNEELING THORACIC ROTATION ─────
  { exercise_id: "neck_249", exercise_name: "Kneeling Thoracic Rotation", program_tag: "Neck Relief", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "front", goal: "mobility", primary_outcome: "T-spine rotation from quadruped", movement_type: "rotation", primary_joints: ["thoracic_spine"], locked_segments: ["pelvis_stable", "lumbar_neutral"], planes: ["transverse"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_QUADRUPED, { hand_l: [18, 44], hand_r: [50, 44] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "All fours, one hand behind head" },
      { name: "Rotate Up", pose: poseFrom(NEUTRAL_QUADRUPED, { skull: [30, 36], shoulder_r: [34, 32], elbow_r: [32, 28], t_spine: [38, 40] }), duration: 3, breath: "inhale", easing: [0.3, 0, 0.15, 1], cue: "Rotate T-spine — elbow to ceiling", muscles: ["obliques", "multifidus"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { shoulder_r: [34, 32], t_spine: [38, 40] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — feel thoracic rotation" },
      { name: "Return", pose: NEUTRAL_QUADRUPED, duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Return slowly" },
    ], form_checks: ["Pelvis stays stable", "Lumbar doesn't rotate", "T-spine drives rotation"], highlight_muscles: ["obliques", "multifidus"] },

  // ─── STAR DRILL ─────
  { exercise_id: "fa_250", exercise_name: "Star Drill", program_tag: "Foot/Ankle", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Single-leg balance with reach taps", movement_type: "balance", primary_joints: ["hip", "ankle"], locked_segments: ["pelvis_level"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Balance", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand on one leg" },
      { name: "Reach Front", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 56], forefoot_r: [62, 76] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Tap forward — pelvis level", muscles: ["gluteus_medius"] },
      { name: "Reach Side", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [68, 62], forefoot_r: [74, 78] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Tap to side", muscles: ["gluteus_medius"] },
      { name: "Reach Back", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [62, 68], forefoot_r: [66, 84] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Tap behind", muscles: ["gluteus_maximus"] },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return to balance" },
    ], form_checks: ["Pelvis stays level throughout", "Knee tracks over toes", "Foot doesn't collapse"], highlight_muscles: ["gluteus_medius", "gluteus_maximus"] },

  // ─── VALE LEAN ─────
  { exercise_id: "fa_251", exercise_name: "Vale Lean", program_tag: "Foot/Ankle", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "side", goal: "stability", primary_outcome: "Short-foot activation with tibial progression", movement_type: "lean", primary_joints: ["ankle"], locked_segments: ["knee_stable"], planes: ["sagittal"],
    phases: [
      { name: "Tripod", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Establish foot tripod — heel, 1st & 5th met" },
      { name: "Lean Forward", pose: poseFrom(NEUTRAL_STANDING, { skull: [48, 12], t_spine: [48, 28], ankle_l: [42, 76], ankle_r: [58, 76] }), duration: 3, breath: "exhale", easing: [0.35, 0, 0.15, 1], cue: "Lean tibia forward — heel stays GLUED, arch stays active", muscles: ["tibialis_anterior", "gastrocnemius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { skull: [48, 12], ankle_l: [42, 76] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold — feel arch working" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Return upright" },
    ], form_checks: ["Heel MUST stay on floor", "No pronation collapse", "Arch stays active"], highlight_muscles: ["tibialis_anterior", "gastrocnemius"] },

  // ─── TOE LIFTS ─────
  { exercise_id: "fa_252", exercise_name: "Toe Lifts", program_tag: "Foot/Ankle", difficulty: 1, equipment: "none", position: "seated", view_angle_default: "front", goal: "stability", primary_outcome: "Big toe isolation and control", movement_type: "isolation", primary_joints: ["toes"], locked_segments: ["ankle_stable"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: NEUTRAL_SEATED, duration: 1, breath: "natural", easing: "easeInOut", cue: "Feet flat on floor" },
      { name: "Big Toe Up", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 74] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Lift big toe ONLY — others stay down" },
      { name: "Others Up", pose: poseFrom(NEUTRAL_SEATED, { forefoot_r: [72, 72] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Now lift others — big toe stays down" },
      { name: "Return", pose: NEUTRAL_SEATED, duration: 1, breath: "inhale", easing: "easeInOut", cue: "All down" },
    ], form_checks: ["No ankle dorsiflexion substitute", "Foot doesn't roll"], highlight_muscles: [] },

  // ─── STAR SLIDERS ─────
  { exercise_id: "fa_253", exercise_name: "Star Sliders", program_tag: "Foot/Ankle", difficulty: 2, equipment: "none", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Single-leg stability with sliding reaches", movement_type: "slide", primary_joints: ["hip", "ankle"], locked_segments: ["pelvis_level"], planes: ["sagittal", "frontal"],
    phases: [
      { name: "Balance", pose: NEUTRAL_STANDING, duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand on one leg" },
      { name: "Slide Front", pose: poseFrom(NEUTRAL_STANDING, { forefoot_r: [62, 74] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Slide foot forward — stance leg stable", muscles: ["gluteus_medius"] },
      { name: "Slide Lateral", pose: poseFrom(NEUTRAL_STANDING, { forefoot_r: [72, 78] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Slide to side" },
      { name: "Slide Back", pose: poseFrom(NEUTRAL_STANDING, { forefoot_r: [64, 86] }), duration: 2, breath: "exhale", easing: "easeInOut", cue: "Slide behind" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 1, breath: "inhale", easing: "easeInOut", cue: "Return" },
    ], form_checks: ["Stance knee doesn't collapse", "Pelvis stays level"], highlight_muscles: ["gluteus_medius"] },

  // ─── MODIFIED PISTOL SQUAT ─────
  { exercise_id: "str_254", exercise_name: "Modified Pistol Squat", program_tag: "Performance", difficulty: 3, equipment: "chair", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Single-leg squat to chair", movement_type: "squat", primary_joints: ["hip", "knee"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 58] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Stand on one leg, other extended" },
      { name: "Sit Back", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 56], knee_l: [40, 68], hip_l: [44, 54], knee_r: [58, 56] }), duration: 3, breath: "inhale", easing: [0.35, 0, 0.15, 1], cue: "Sit back to chair — single leg", muscles: ["quadriceps", "gluteus_maximus"] },
      { name: "Drive Up", pose: NEUTRAL_STANDING, duration: 3, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Drive up through heel" },
    ], form_checks: ["Knee tracks over midfoot", "No knee valgus", "Control descent"], highlight_muscles: ["quadriceps", "gluteus_maximus"] },

  // ─── STORK DRILL ─────
  { exercise_id: "fa_255", exercise_name: "Stork Drill", program_tag: "Foot/Ankle", difficulty: 3, equipment: "wall", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Explosive loading into wall", movement_type: "drive", primary_joints: ["hip", "ankle"], locked_segments: ["core_braced"], planes: ["sagittal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_STANDING, { hand_l: [38, 28], hand_r: [62, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Face wall, slight lean" },
      { name: "Drive", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 50], hip_r: [56, 46] }), duration: 1, breath: "exhale", easing: [0.2, 0, 0.2, 1], cue: "Drive knee up explosively — wall catch", muscles: ["hip_flexors", "gastrocnemius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [58, 50] }), duration: 2, breath: "hold", easing: "linear", cue: "Hold — absorb at wall" },
      { name: "Return", pose: NEUTRAL_STANDING, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower with control" },
    ], form_checks: ["Drive from hip/foot", "No hip hike", "Foot doesn't collapse on landing"], highlight_muscles: ["hip_flexors", "gastrocnemius"] },

  // ─── SQUAT JUMP ─────
  { exercise_id: "str_256", exercise_name: "Squat Jump", program_tag: "Performance", difficulty: 3, equipment: "none", position: "standing", view_angle_default: "side", goal: "strength", primary_outcome: "Explosive lower body power with soft landing", movement_type: "plyometric", primary_joints: ["hip", "knee", "ankle"], locked_segments: [], planes: ["sagittal"],
    phases: [
      { name: "Dip", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 52], knee_l: [42, 66], knee_r: [58, 66] }), duration: 1, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "Small dip — hips back" },
      { name: "Jump", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 40], knee_l: [44, 56], knee_r: [56, 56], ankle_l: [42, 68], ankle_r: [58, 68] }), duration: 0.5, breath: "exhale", easing: [0.2, 0, 0.2, 1], cue: "JUMP — full extension", muscles: ["quadriceps", "gluteus_maximus", "gastrocnemius"] },
      { name: "Land", pose: poseFrom(NEUTRAL_STANDING, { pelvis: [50, 52], knee_l: [42, 66], knee_r: [58, 66] }), duration: 1, breath: "inhale", easing: [0.4, 0, 0.2, 1], cue: "QUIET landing — knees track, hips back" },
      { name: "Stand", pose: NEUTRAL_STANDING, duration: 1, breath: "exhale", easing: "easeInOut", cue: "Stand tall — reset" },
    ], form_checks: ["Quiet landing", "Knees track toes on landing", "Hips absorb impact"], highlight_muscles: ["quadriceps", "gluteus_maximus", "gastrocnemius"] },

  // ─── SKATERS ─────
  { exercise_id: "str_257", exercise_name: "Skaters", program_tag: "Performance", difficulty: 3, equipment: "none", position: "standing", view_angle_default: "front", goal: "strength", primary_outcome: "Lateral plyometric with soft landing", movement_type: "plyometric", primary_joints: ["hip", "knee", "ankle"], locked_segments: [], planes: ["frontal"],
    phases: [
      { name: "Jump Left", pose: poseFrom(NEUTRAL_STANDING, { hip_l: [38, 48], knee_l: [34, 64], ankle_l: [32, 78], knee_r: [46, 68] }), duration: 1, breath: "exhale", easing: [0.2, 0, 0.2, 1], cue: "Jump left — land soft on left foot", muscles: ["gluteus_medius", "quadriceps"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { knee_l: [34, 64] }), duration: 1, breath: "hold", easing: "linear", cue: "Absorb — low COM" },
      { name: "Jump Right", pose: poseFrom(NEUTRAL_STANDING, { hip_r: [62, 48], knee_r: [66, 64], ankle_r: [68, 78], knee_l: [54, 68] }), duration: 1, breath: "exhale", easing: [0.2, 0, 0.2, 1], cue: "Jump right — land soft", muscles: ["gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { knee_r: [66, 64] }), duration: 1, breath: "hold", easing: "linear", cue: "Absorb landing" },
    ], form_checks: ["Soft quiet landing", "No valgus collapse", "Low center of mass"], highlight_muscles: ["gluteus_medius", "quadriceps"] },

  // ─── OBLIQUE SIT ─────
  { exercise_id: "hip_258", exercise_name: "Oblique Sit", program_tag: "Hip Relief", difficulty: 2, equipment: "none", position: "side_lying", view_angle_default: "front", goal: "stability", primary_outcome: "Lateral core stability from floor", movement_type: "isometric", primary_joints: ["core", "hip"], locked_segments: ["rib_cage_stacked"], planes: ["frontal"],
    phases: [
      { name: "Setup", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44], elbow_l: [24, 40], hip_l: [50, 42], hip_r: [50, 50] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Side sit, propped on elbow" },
      { name: "Lift", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 42], pelvis: [48, 44], hip_l: [50, 40] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Lift hips — stack ribs over pelvis", muscles: ["obliques", "gluteus_medius"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_SUPINE, { pelvis: [48, 44] }), duration: 10, breath: "natural", easing: "linear", cue: "Hold — rib cage stacked, scap set" },
      { name: "Lower", pose: poseFrom(NEUTRAL_SUPINE, { skull: [20, 44] }), duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower with control" },
    ], form_checks: ["Rib cage stacked", "No shoulder shrug", "No hip drop"], highlight_muscles: ["obliques", "gluteus_medius"] },

  // ─── SHOULDER BEAR ─────
  { exercise_id: "neck_259", exercise_name: "Shoulder Bear", program_tag: "Shoulder Relief", difficulty: 2, equipment: "none", position: "quadruped", view_angle_default: "side", goal: "stability", primary_outcome: "Serratus/scap stability in bear", movement_type: "isometric", primary_joints: ["scapula", "core"], locked_segments: ["spine_neutral"], planes: ["sagittal"],
    phases: [
      { name: "Bear Hover", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 2, breath: "exhale", easing: [0.4, 0, 0.2, 1], cue: "Bear hover — serratus active, chin tucked", muscles: ["serratus_anterior", "deep_neck_flexors"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_QUADRUPED, { knee_l: [66, 52], knee_r: [66, 56] }), duration: 15, breath: "natural", easing: "linear", cue: "Hold — push through hands, chin tucked" },
      { name: "Lower", pose: NEUTRAL_QUADRUPED, duration: 2, breath: "inhale", easing: "easeInOut", cue: "Lower knees" },
    ], form_checks: ["Deep neck flexors ON", "Scapula stable — no winging", "Head doesn't jut forward"], highlight_muscles: ["serratus_anterior", "deep_neck_flexors"] },

  // ─── SHOULDER UPRIGHTING ─────
  { exercise_id: "neck_260", exercise_name: "Shoulder Uprighting", program_tag: "Shoulder Relief", difficulty: 1, equipment: "none", position: "standing", view_angle_default: "front", goal: "stability", primary_outcome: "Scap control + cuff positioning", movement_type: "posture", primary_joints: ["scapula"], locked_segments: ["cervical_neutral"], planes: ["frontal"],
    phases: [
      { name: "Slouch", pose: poseFrom(NEUTRAL_STANDING, { shoulder_l: [34, 26], shoulder_r: [66, 26], scap_l: [36, 28], scap_r: [64, 28] }), duration: 1, breath: "natural", easing: "easeInOut", cue: "Start with shoulders forward" },
      { name: "Upright", pose: poseFrom(NEUTRAL_STANDING, { shoulder_l: [40, 22], shoulder_r: [60, 22], scap_l: [42, 26], scap_r: [58, 26], sternum: [50, 22] }), duration: 3, breath: "exhale", easing: [0.3, 0, 0.15, 1], cue: "Roll shoulders back & down — neck neutral", muscles: ["lower_trapezius", "rhomboids"] },
      { name: "Hold", pose: poseFrom(NEUTRAL_STANDING, { scap_l: [42, 26], scap_r: [58, 26] }), duration: 5, breath: "natural", easing: "linear", cue: "Hold — feel lower traps working" },
    ], form_checks: ["No shrugging", "Neck stays neutral"], highlight_muscles: ["lower_trapezius", "rhomboids"] },

];

// ─── NAME ALIASES (maps common DB names → spec exercise_name) ─────
const EXERCISE_ALIASES: Record<string, string> = {
  "chin tuck": "Cervical Retraction",
  "chin tucks": "Cervical Retraction",
  "cervical retraction (chin tuck)": "Cervical Retraction",
  "thoracic extension": "Seated Thoracic Extension Over Chair",
  "thoracic extension over chair": "Seated Thoracic Extension Over Chair",
  "t-spine rotation": "Seated Thoracic Rotation",
  "thoracic rotation seated": "Seated Thoracic Rotation",
  "trap release": "Upper Trap Relax + Rib Expansion",
  "upper trap relax": "Upper Trap Relax + Rib Expansion",
  "scap retraction": "Scapular Retraction",
  "wall angels": "Standing Wall Angels",
  "pec stretch": "Doorway Pec Opener",
  "pec opener": "Doorway Pec Opener",
  "nerve glide": "Wrist Extension Nerve Glide",
  "median nerve glide": "Wrist Extension Nerve Glide",
  "pelvic tilts": "Seated Pelvic Tilts",
  "back extension": "Standing Back Extension Reset",
  "cat cow": "Cat-Cow",
  "cat-cow segmental": "Cat-Cow",
  "child's pose": "Child's Pose with Side Reach",
  "childs pose": "Child's Pose with Side Reach",
  "dead bug": "Dead Bug",
  "deadbug": "Dead Bug",
  "glute bridge": "Glute Bridge",
  "bridge": "Glute Bridge",
  "side plank": "Side Plank",
  "side plank modified": "Side Plank",
  "side plank (modified)": "Side Plank",
  "pallof": "Pallof Press",
  "pallof press": "Pallof Press",
  "hip hinge": "Hip Hinge Drill",
  "hip hinge drill": "Hip Hinge Drill",
  "wall tap hip hinge": "Hip Hinge Drill",
  "90/90 hip": "90/90 Hip Internal Rotation",
  "90 90 hip": "90/90 Hip Internal Rotation",
  "jefferson curl": "Jefferson Curl",
  "reverse lunge": "Reverse Lunge",
  "rdl": "Romanian Deadlift",
  "romanian deadlift": "Romanian Deadlift",
  "deep neck flexor": "Deep Neck Flexor Hold",
  "dnf hold": "Deep Neck Flexor Hold",
  "scapular cars": "Scapular CARs",
  "scap cars": "Scapular CARs",
  "shoulder er": "Shoulder External Rotation",
  "external rotation": "Shoulder External Rotation",
  "prone y": "Prone Y Raise",
  "y raise": "Prone Y Raise",
  "wall slide": "Wall Slide with Lift Off",
  "wall slide lift off": "Wall Slide with Lift Off",
  "serratus punch": "Serratus Punch",
  "levator scap": "Levator Scap Stretch",
  "levator stretch": "Levator Scap Stretch",
  "thread the needle": "Thread the Needle",
  "farmer carry": "Farmer Carry",
  "farmers carry": "Farmers Carry",
  "face pull": "Face Pull",
  "hip flexor stretch": "Half Kneeling Hip Flexor Stretch",
  "half kneeling hip flexor": "Half Kneeling Hip Flexor Stretch",
  "lateral band walk": "Lateral Band Walk",
  "band walk": "Lateral Band Walk",
  "cossack squat": "Cossack Squat",
  "cossack": "Cossack Squat",
  "single leg rdl": "Single Leg RDL",
  "sl rdl": "Single Leg RDL",
  "step down": "Step Down Control",
  "step downs": "Step Down Control",
  "tibialis raise": "Tibialis Raises",
  "tib raise": "Tibialis Raises",
  "calf raise": "Calf Raise Tempo",
  "calf raises": "Calf Raise Tempo",
  "ankle cars": "Ankle CARs",
  "copenhagen plank": "Copenhagen Plank",
  "copenhagen": "Copenhagen Plank",
  "split squat": "Split Squat",
  "crocodile breathing": "Crocodile Breathing",
  "crocodile breath": "Crocodile Breathing",
  "90/90 breathing": "90/90 Breathing",
  "90 90 breathing": "90/90 Breathing",
  "cyclic sigh": "Cyclic Sigh",
  "cyclic sighing": "Cyclic Sigh",
  "4-7-8": "4-7-8 Breathing",
  "4 7 8": "4-7-8 Breathing",
  "coherent breathing": "Coherent Breathing",
  "coherent breath": "Coherent Breathing",
  "box breathing": "Box Breathing",
  "box breath": "Box Breathing",
  "rib expansion": "Supine Rib Expansion Hold",
  "rib expansion hold": "Supine Rib Expansion Hold",
  "parasympathetic downshift": "Parasympathetic Downshift Combo",
  "downshift combo": "Parasympathetic Downshift Combo",
  // Additional DB name aliases
  "press ups": "Press Ups",
  "press up": "Press Ups",
  "press ups w exhale": "Press Ups w Exhale",
  "open book": "Open Book",
  "kneeling thoracic hinge": "Kneeling Thoracic Hinge",
  "sciatic nerve floss": "Sciatic Nerve Floss",
  "sciatic floss": "Sciatic Nerve Floss",
  "tri planar hip opener": "Tri Planar Hip Opener",
  "tri-planar hip opener": "Tri Planar Hip Opener",
  "low back cat cow": "Low Back Cat Cow",
  "low back cat-cow": "Low Back Cat Cow",
  "windshield wiper": "Windshield Wiper",
  "windshield wipers": "Windshield Wiper",
  "bretzl": "Bretzl",
  "bracing leg lift": "Bracing Leg Lift",
  "knee side plank": "Knee Side Plank",
  "lateral wall plank": "Lateral Wall Plank",
  "quadruped scorpion": "Quadruped Scorpion",
  "bear": "Bear",
  "bear hold": "Bear",
  "anti-extension deadbug": "Anti-Extension Deadbug",
  "anti extension deadbug": "Anti-Extension Deadbug",
  "single leg glute bridge": "Single Leg Glute Bridge",
  "single leg bridge": "Single Leg Glute Bridge",
  "bear crawling": "Bear Crawling",
  "bear crawl": "Bear Crawling",
  "hinging patterns": "Hinging Patterns",
  "dumbbell deadlift": "Dumbbell Deadlift",
  "db deadlift": "Dumbbell Deadlift",
  "chin retractions": "Chin Retractions",
  "chin retractions w extension": "Chin Retractions w Extension",
  "prone cervical retraction": "Prone Cervical Retraction",
  "prone head lifts": "Prone Head Lifts",
  "supine cervical retraction": "Supine Cervical Retraction",
  "quadruped cervical retraction": "Quadruped Cervical Retraction",
  "foam roller swim": "Foam Roller Swim",
  "side lying rotations": "Side Lying Rotations",
  "prone scorpion": "Prone Scorpion",
  "brueggers": "Brueggers",
  "bruegger's": "Brueggers",
  "wall pec stretch": "Wall Pec Stretch",
  "wall pushup": "Wall Pushup",
  "wall push up": "Wall Pushup",
  "banded iyt": "Banded IYT",
  "iyt": "Banded IYT",
  "janda wall crawl": "Janda Wall Crawl",
  "dorsiflexion isometrics": "Dorsiflexion Isometrics",
  "foot threading": "Foot Threading",
  "cowboy sit": "Cowboy Sit",
  "downward dog": "Downward Dog",
  "frog stretch": "Frog Stretch",
  "hip cars": "Hip CARs",
  "hip car": "Hip CARs",
  "90-90 transition": "90-90 Transition",
  "90-90 lean": "90-90 Lean",
  "adductor glute bridge": "Adductor Glute Bridge",
  "end range hip extensions": "End Range Hip Extensions",
  "end range hip extension": "End Range Hip Extensions",
  "hamstring hip flexor": "Hamstring Hip Flexor",
  "hip uprighting": "Hip Uprighting",
  "goblet squat": "Goblet Squat",
  "bulgarian split squat": "Bulgarian Split Squat",
  "rkc plank": "RKC Plank",
  "banded ankle walkout": "Banded Ankle Walkout",
  "achilles eccentrics": "Achilles Eccentrics",
  "peroneal walks": "Peroneal Walks",
  "banded knee extensions": "Banded Knee Extensions",
  "banded reverse walk": "Banded Reverse Walk",
  "bosu squat": "Bosu Squat",
  "around the world lunge": "Around the World Lunge",
  "wall sit": "Wall Sit",
  "elevated halo": "Elevated Halo",
  "half-kneeling pallof press": "Half-Kneeling Pallof Press",
  "half kneeling pallof press": "Half-Kneeling Pallof Press",
  "standing pallof press": "Standing Pallof Press",
  "pallof press (lunge)": "Pallof Press (Lunge)",
  "pallof lunge": "Pallof Press (Lunge)",
  "banded high-to-low chop": "Banded High-to-Low Chop",
  "chop": "Banded High-to-Low Chop",
  "double arm march": "Double Arm March",
  "supine overhead w breathing": "Supine Overhead w Breathing",
  "bench thoracic mobility": "Bench Thoracic Mobility",
  "half kneeling shoulder press": "Half Kneeling Shoulder Press",
  "squat to bilateral row": "Squat to Bilateral Row",
  "sled push": "Sled Push",
  "3-month supine overhead": "3-Month Supine Overhead",
  "3-month prone": "3-Month Prone",
  "4.5-month prone": "4.5-Month Prone",
  "5-month side lying": "5-Month Side Lying",
  "11-month step through": "11-Month Step Through",
  "tall kneeling": "Tall Kneeling",
  // Czech Get-Up variants all map to same pattern
  "czech get-up": "11-Month Step Through",
  "czech get up": "11-Month Step Through",
  "czech get up 5-7": "11-Month Step Through",
  "czech get up full": "11-Month Step Through",
  // Additional mappings
  "high oblique sit": "Hip Uprighting",
  "archer drill": "Bird Dog",
  "bottom-up waiters carry": "Farmers Carry",
  "bottom-up waiter's carry": "Farmers Carry",
  "anterior oblique sling": "Pallof Press",
  "half windmill": "Bretzl",
  "tgu": "11-Month Step Through",
  "turkish get up": "11-Month Step Through",
  "split squat (jump)": "Split Squat",
};

// ─── LOOKUP HELPER (precise matching with alias support) ─────
export function findExerciseSpec(exerciseName: string): ExerciseMovementSpec | undefined {
  const n = exerciseName.toLowerCase().trim();

  // 1. Exact match on exercise_name
  const exact = EXERCISE_SPECS.find(s => s.exercise_name.toLowerCase() === n);
  if (exact) return exact;

  // 2. Alias lookup
  const aliasTarget = EXERCISE_ALIASES[n];
  if (aliasTarget) {
    const aliased = EXERCISE_SPECS.find(s => s.exercise_name.toLowerCase() === aliasTarget.toLowerCase());
    if (aliased) return aliased;
  }

  // 3. Check if input contains the full spec name or vice versa
  const containsMatch = EXERCISE_SPECS.find(s => {
    const sn = s.exercise_name.toLowerCase();
    return n.includes(sn) || sn.includes(n);
  });
  if (containsMatch) return containsMatch;

  // 4. Strict fuzzy: ALL significant words (3+ chars) of the spec name must appear in input
  const STOP_WORDS = new Set(["with", "the", "and", "for", "over", "modified"]);
  return EXERCISE_SPECS.find(s => {
    const specWords = s.exercise_name.toLowerCase().split(/[\s\-\/]+/).filter(w => w.length >= 3 && !STOP_WORDS.has(w));
    if (specWords.length === 0) return false;
    const matchCount = specWords.filter(w => n.includes(w)).length;
    return matchCount === specWords.length;
  });
}

// Export base poses for fallback generation
export { NEUTRAL_STANDING, NEUTRAL_SEATED, NEUTRAL_SUPINE, NEUTRAL_QUADRUPED, NEUTRAL_PRONE, poseFrom };
