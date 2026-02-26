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
  "glute bridge": "Glute Bridge",
  "bridge": "Glute Bridge",
  "side plank": "Side Plank",
  "side plank modified": "Side Plank",
  "pallof": "Pallof Press",
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
    // Require ALL significant words to match (strict)
    return matchCount === specWords.length;
  });
}

// Export base poses for fallback generation
export { NEUTRAL_STANDING, NEUTRAL_SEATED, NEUTRAL_SUPINE, NEUTRAL_QUADRUPED, NEUTRAL_PRONE, poseFrom };
