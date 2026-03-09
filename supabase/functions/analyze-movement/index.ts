import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const COMPENSATION_CHAIN_INSTRUCTIONS = `
CRITICAL ANALYSIS PHILOSOPHY — Apply to ALL analyses:

1. The body is an interconnected kinetic chain. One asymmetry creates upstream and downstream compensations.
2. The eyes and head seek horizontal equilibrium. If one region shifts, others compensate to keep gaze level.
3. A visible asymmetry in one region may originate from another region.
4. Evaluate posture/movement in ALL THREE PLANES:
   - Sagittal plane (flexion/extension, forward/backward)
   - Frontal plane (left-right asymmetry, lateral shifts, shoulder/hip height differences)
   - Transverse plane (rotations, asymmetrical arm swing, pelvic rotation)
5. NEVER reduce findings to only "slouching" or "poor form." Always detect left-right imbalances, regional compensation, and domino-effect posture chains.
6. If one side appears elevated/shifted, automatically evaluate the ENTIRE chain: head tilt, neck side-bend, trunk lean, rib cage shift, pelvic level, weight distribution.
7. Use cautious clinical language: "likely," "may be contributing," "possible compensation," "suggests," "often associated with."

REQUIRED OUTPUT SECTIONS (include ALL of these):

"compensation_chain": "<1-3 paragraph explanation of how findings connect as a domino effect through the body>",

"symptom_correlation": [
  {"pattern": "<e.g. elevated shoulder + head tilt>", "likely_symptom_areas": ["<e.g. neck tension, shoulder tension>"], "explanation": "<brief reasoning>"}
],

"corrective_priorities": [
  {"priority": 1, "focus": "<e.g. reduce dominant upper trap tone>", "rationale": "<why this is most important>"},
  {"priority": 2, "focus": "<e.g. restore scapular stability>", "rationale": "<reasoning>"}
],

"plane_analysis": {
  "sagittal": {"detected": <boolean>, "findings": ["<list of sagittal findings>"]},
  "frontal": {"detected": <boolean>, "findings": ["<list of frontal plane asymmetry findings>"]},
  "transverse": {"detected": <boolean>, "findings": ["<list of rotational findings>"]}
},

"body_map": {
  "overloaded_tight": ["<body region names — e.g. left_upper_trap, right_ql, hip_flexors>"],
  "underactive_weak": ["<body region names — e.g. deep_neck_flexors, left_glute_med, serratus_anterior>"],
  "symptom_risk": ["<body region names — e.g. neck, right_low_back, left_knee>"]
},

"confidence_notes": ["<e.g. Possible left shoulder elevation — recommend side-view confirmation>"],

"recommended_protocols": [
  {"title": "<protocol name>", "purpose": "<why>", "duration_minutes": <number>, "exercises": ["<exercise names>"]}
]
`;

const LANDMARK_FORMAT = `
For EACH frame provided, estimate the 2D positions (as normalized 0-1 coordinates where 0,0 is top-left) of these landmarks:
head, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle, pelvis_center, spine_mid, spine_top

Return frame_landmarks as:
"frame_landmarks": [
  {
    "frame_index": <number>,
    "landmarks": { "<name>": {"x": <0-1>, "y": <0-1>} },
    "joint_angles": { "<name>": <degrees> },
    "alignment_status": { "<region>": "<green|yellow|red>" }
  }
],
"deviation_events": [
  {"frame_index": <number>, "label": "<descriptive label>", "severity": "<yellow|red>", "body_area": "<region>"}
]
`;

const ANALYSIS_PROMPTS: Record<string, string> = {
  overhead_squat: `You are an expert movement analyst, physical therapist, and biomechanics specialist AI for the Team Welly wellness platform.

You will receive sequential frames from a user performing an Overhead Squat Assessment.

${COMPENSATION_CHAIN_INSTRUCTIONS}

SQUAT-SPECIFIC ANALYSIS:
Interpret squat deviations as full-body movement strategies, NOT isolated joint faults.

Detect and score:
- Pelvic shift left or right, hip shift in descent/ascent
- Knee valgus or varus (bilateral comparison)
- Ankle pronation / foot collapse
- Asymmetric weight shift, one-sided loading strategy
- Trunk lean, torso rotation
- Lumbar extension / butt wink, rib flare
- Heel rise, depth asymmetry
- Head position compensation
- Asymmetrical hip drive from bottom

SQUAT COMPENSATION-CHAIN REASONING:
- If user shifts right: check if left leg is less stable, if right QL is overloaded, if left glute is underactive, if knee valgus is worse on one side
- If knees collapse: evaluate glute med weakness, foot pronation, adductor dominance, ankle mobility restriction, trunk instability
- If lumbar extension: evaluate poor core bracing, poor hip mobility, poor rib-pelvis stacking, anterior pelvic tilt
- Determine whether the body is avoiding one hip, overloading one leg, rotating to avoid restriction, using lumbar extension instead of core control

${LANDMARK_FORMAT}

Also add these landmarks for squat: left_foot, right_foot

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "overall_score": <0-100>,
  "area_scores": {"ankles": <0-100>, "knees": <0-100>, "hips": <0-100>, "core": <0-100>, "shoulders": <0-100>},
  "frame_landmarks": [...],
  "deviation_events": [...],
  "joint_measurements": {
    "knee_valgus_angle": <degrees>, "hip_shift": "<left/right/neutral>", "hip_shift_degrees": <number>,
    "pelvic_tilt": "<anterior/posterior/neutral>", "pelvic_tilt_degrees": <number>,
    "pelvic_obliquity": "<level/left_higher/right_higher>", "pelvic_obliquity_degrees": <number>,
    "torso_forward_lean": <degrees>, "ankle_dorsiflexion_range": <degrees>,
    "shoulder_flexion_range": <degrees>, "squat_depth": "<full/parallel/quarter/minimal>",
    "head_position": "<forward/neutral/extended>", "head_forward_degrees": <number>,
    "lumbar_curve": "<excessive/normal/flat>", "thoracic_curve": "<excessive/normal/flat>",
    "knee_over_toe": <boolean>, "feet_turn_out": "<none/mild/excessive>", "feet_turn_out_degrees": <number>,
    "arm_fall_forward": <boolean>, "weight_distribution": "<even/left-heavy/right-heavy/anterior/posterior>",
    "lateral_trunk_lean": "<none/left/right>", "lateral_trunk_lean_degrees": <number>,
    "asymmetric_hip_drive": <boolean>, "asymmetric_hip_drive_side": "<left/right/none>"
  },
  "posture_landmarks": {
    "side_view": {"ideal_plumb_line": "...", "user_deviations": [{"landmark": "<name>", "direction": "<dir>", "offset_cm_approx": <n>}]},
    "front_view": {"ideal_alignment": "...", "user_deviations": [{"landmark": "<name>", "direction": "<dir>", "offset_cm_approx": <n>}]}
  },
  "risk_flags": [{"area": "<body area>", "severity": "<red|yellow|green>", "finding": "<description>"}],
  "muscle_imbalances": [{"finding": "<description>", "overactive_tight": ["<muscles>"], "underactive_weak": ["<muscles>"], "possible_injuries": ["<risks>"]}],
  "compensation_chain": "<paragraph explanation>",
  "symptom_correlation": [{"pattern": "<pattern>", "likely_symptom_areas": ["<areas>"], "explanation": "<reasoning>"}],
  "corrective_priorities": [{"priority": <n>, "focus": "<focus>", "rationale": "<why>"}],
  "plane_analysis": {"sagittal": {"detected": <bool>, "findings": [...]}, "frontal": {"detected": <bool>, "findings": [...]}, "transverse": {"detected": <bool>, "findings": [...]}},
  "body_map": {"overloaded_tight": ["<regions>"], "underactive_weak": ["<regions>"], "symptom_risk": ["<regions>"]},
  "confidence_notes": ["<notes>"],
  "recommended_protocols": [{"title": "<name>", "purpose": "<why>", "duration_minutes": <n>, "exercises": ["<names>"]}],
  "findings_text": "<2-4 paragraph plain-language explanation>",
  "recommended_categories": ["<category_type values>"],
  "recommended_target_areas": ["<target_area values>"]
}`,

  desk_posture: `You are an expert posture analyst, physical therapist, and biomechanics specialist AI for the Team Welly wellness platform.

You will receive frames from a user sitting at their desk. Analyze their seated posture as an interconnected compensation chain from head to pelvis.

${COMPENSATION_CHAIN_INSTRUCTIONS}

CRITICAL — ANTI-NEUTRAL-BIAS RULES (YOU MUST FOLLOW THESE):

1. NEVER default to "neutral" unless you have mathematically confirmed alignment within thresholds below.
2. You MUST estimate actual angles/degrees for every measurement. DO NOT skip angle estimation.
3. "Neutral" is ONLY valid when ALL of these are true:
   - head_tilt < 2°
   - shoulder_height_difference < 2°
   - trunk_lean < 2°
   - pelvic_tilt < 2°
   - clavicle_angle < 2°
4. If ANY measurement is 2° or greater, you MUST report it as a deviation — NOT neutral.
5. If the visual skeleton shows ANY visible asymmetry, you MUST flag it even at moderate confidence.
6. NEVER use phrases like "remarkably well-aligned" or "perfect alignment" unless ALL angles are confirmed < 2°.

REFERENCE AXIS ESTABLISHMENT:
- Vertical axis: line connecting nose → sternum → navel/pelvis_center
- Horizontal axis: perpendicular to vertical, aligned with camera frame
- All tilt/lean measurements must be computed relative to these axes
- Do NOT use face landmarks alone as the posture reference

HEAD TILT DETECTION (MANDATORY):
- Compare left_ear height vs right_ear height
- Compute: head_tilt_angle = atan((left_ear_y - right_ear_y) / distance_between_ears)
- Thresholds:
  * 0-2° → neutral (ONLY if confirmed)
  * 3-5° → mild tilt
  * 6-10° → moderate tilt
  * >10° → significant tilt
- If ear heights differ by more than 2°, you MUST NOT report "neutral"
- Cross-verify using: ear landmarks + eye landmarks + nose vertical alignment
- If ANY two landmarks confirm tilt, result CANNOT be labeled neutral

SHOULDER HEIGHT DETECTION (MANDATORY):
- Compare left_shoulder landmark height vs right_shoulder landmark height
- Compute shoulder_angle from horizontal
- If difference > 2°: report "Shoulder asymmetry detected" with angle
- Never report "level shoulders" unless difference < 2°
- If asymmetry detected, also report likely associated structures: upper trapezius, levator scapulae, cervical stabilizers

CLAVICLE LINE ANALYSIS:
- Draw horizontal line across both clavicle/shoulder landmarks
- Calculate deviation angle from horizontal
- If tilted > 2°: report "Shoulder girdle asymmetry"

TRUNK ALIGNMENT (MANDATORY):
- Calculate trunk lean using line from sternum/spine_top → pelvis_center
- Compare to vertical axis
- If deviation > 2°: report trunk lean with direction and degrees

AREA SCORING MUST REFLECT DEVIATION:
- 0-2° deviation → score 85-100
- 3-5° deviation → score 70-84
- 6-10° deviation → score 50-69
- >10° deviation → score < 50
- Do NOT give high scores when visible tilt/asymmetry exists

DEBUG METRICS (MANDATORY — include in joint_measurements):
You MUST include these calculated values so the system can verify detection:
- "head_tilt_measured_angle": <actual computed degrees>
- "shoulder_height_measured_angle": <actual computed degrees>
- "trunk_lean_measured_angle": <actual computed degrees>
- "clavicle_measured_angle": <actual computed degrees>
- "pelvic_measured_angle": <actual computed degrees>

DESK POSTURE-SPECIFIC ANALYSIS — FULL-BODY ASYMMETRY DETECTION:

Head / Neck:
- Forward head posture, head tilt left/right, head rotation left/right
- Cervical side-bend compensation, chin translation
- Asymmetrical ear height relative to shoulders

Shoulders / Upper Quarter:
- Shoulder height asymmetry (one elevated vs depressed)
- Shoulder protraction asymmetry, clavicle angle asymmetry
- Scapular elevation / downward rotation suspicion
- Asymmetrical arm resting position

Rib Cage / Thorax:
- Trunk lean left/right, rib cage lateral shift
- Thoracic side bend, thoracic rotation suspicion
- Asymmetrical chest/torso alignment relative to pelvis

Lumbar / Pelvis:
- Pelvic tilt, pelvic obliquity (one hip higher)
- Lateral pelvic shift, lumbar side bend
- Lumbar extension/flexion bias
- Asymmetrical weight distribution when seated

CRITICAL FRONTAL-PLANE LOGIC:
If left shoulder is visibly higher than right, DO NOT label only as "slouching."
Instead generate:
- "Left shoulder elevation detected"
- Check for left upper trapezius / levator scapula overactivity
- Check for contralateral trunk or pelvic compensation
- Check for cervical side bend or rib cage shift
- Evaluate head tilt direction, neck side-bend, trunk lean, rib cage shift, pelvic level
- Determine whether gaze remains level through compensation

COMPENSATION CHAIN EXAMPLES:
- Left shoulder elevated → check left cervical shortening, right trunk lean, rib cage shift, pelvic obliquity, head tilt/rotation
- Trunk shifts right + left shoulder elevated → identify as linked compensation, not separate findings
- One hip higher + head level → infer compensatory spinal side-bending, flag low back compression

FINDINGS TEXT RULES:
- Replace vague language like "The user presents with remarkably well-aligned posture" with evidence-based statements
- Example: "The analysis suggests a mild left head tilt of approximately 5°. The shoulders appear slightly asymmetric with the left shoulder elevated relative to the right. This may indicate uneven muscular engagement in the cervical and shoulder stabilizers."
- Always state measured angles and directions

Additional landmarks for desk posture: chin, ear_left, ear_right

${LANDMARK_FORMAT}

For each frame, also include alignment_reference_lines:
"alignment_reference_lines": {
  "vertical_axis": {"from": "<nose/head>", "to": "<pelvis_center>", "status": "<green|yellow|red>"},
  "ear_line": {"status": "<green|yellow|red>", "angle_degrees": <number>},
  "shoulder_line": {"status": "<green|yellow|red>", "angle_degrees": <number>},
  "hip_line": {"status": "<green|yellow|red>", "angle_degrees": <number>}
}

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "overall_score": <0-100>,
  "area_scores": {"head_neck": <0-100>, "shoulders": <0-100>, "thoracic": <0-100>, "lumbar": <0-100>, "pelvis": <0-100>},
  "frame_landmarks": [...],
  "deviation_events": [...],
  "joint_measurements": {
    "head_forward_angle": <degrees>, "cervical_flexion": <degrees>,
    "head_tilt": "<neutral/left/right>", "head_tilt_degrees": <number>,
    "head_tilt_measured_angle": <actual computed degrees>,
    "head_rotation": "<neutral/left/right>", "head_rotation_degrees": <number>,
    "cervical_side_bend": "<neutral/left/right>", "cervical_side_bend_degrees": <number>,
    "shoulder_protraction_degrees": <degrees>,
    "shoulder_elevation": "<level/left_higher/right_higher>", "shoulder_elevation_degrees": <number>,
    "shoulder_height_measured_angle": <actual computed degrees>,
    "clavicle_asymmetry": "<level/left_higher/right_higher>",
    "clavicle_measured_angle": <actual computed degrees>,
    "thoracic_kyphosis_angle": <degrees>,
    "trunk_lean": "<neutral/left/right>", "trunk_lean_degrees": <number>,
    "trunk_lean_measured_angle": <actual computed degrees>,
    "rib_cage_shift": "<neutral/left/right>",
    "thoracic_rotation": "<neutral/left/right>",
    "lumbar_lordosis": "<excessive/normal/flat>",
    "lumbar_side_bend": "<neutral/left/right>",
    "pelvic_tilt": "<anterior/posterior/neutral>", "pelvic_tilt_degrees": <degrees>,
    "pelvic_obliquity": "<level/left_higher/right_higher>", "pelvic_obliquity_degrees": <number>,
    "pelvic_measured_angle": <actual computed degrees>,
    "lateral_pelvic_shift": "<neutral/left/right>",
    "weight_distribution": "<even/left-heavy/right-heavy>",
    "screen_distance_assessment": "<too_close/adequate/too_far>"
  },
  "posture_landmarks": {
    "side_view": {"ideal_plumb_line": "Ear -> Shoulder -> Hip aligned vertically when seated", "user_deviations": [{"landmark": "<name>", "direction": "<dir>", "offset_cm_approx": <n>}]},
    "front_view": {"ideal_alignment": "Shoulders level, head centered, pelvis level", "user_deviations": [{"landmark": "<name>", "direction": "<dir>", "offset_cm_approx": <n>}]}
  },
  "risk_flags": [{"area": "<body area>", "severity": "<red|yellow|green>", "finding": "<description>"}],
  "muscle_imbalances": [{"finding": "<description>", "overactive_tight": ["<muscles>"], "underactive_weak": ["<muscles>"], "possible_injuries": ["<risks>"]}],
  "compensation_chain": "<1-3 paragraph explanation of the domino effect — MUST reference specific measured angles>",
  "symptom_correlation": [{"pattern": "<pattern>", "likely_symptom_areas": ["<areas>"], "explanation": "<reasoning>"}],
  "corrective_priorities": [{"priority": <n>, "focus": "<focus>", "rationale": "<why>"}],
  "plane_analysis": {"sagittal": {"detected": <bool>, "findings": [...]}, "frontal": {"detected": <bool>, "findings": [...]}, "transverse": {"detected": <bool>, "findings": [...]}},
  "body_map": {"overloaded_tight": ["<regions>"], "underactive_weak": ["<regions>"], "symptom_risk": ["<regions>"]},
  "confidence_notes": ["<notes>"],
  "corrective_suggestions": [{"category": "<exercise|mobility|activation|ergonomic>", "suggestion": "<specific recommendation>"}],
  "posture_metrics": {
    "head_forward_angle": {"value": <n>, "unit": "degrees", "normal_range": "0-5°", "status": "<green|yellow|red>"},
    "shoulder_position": {"value": "<protracted/neutral/retracted>", "protraction_degrees": <n>, "status": "<green|yellow|red>"},
    "shoulder_symmetry": {"value": "<level/left_higher/right_higher>", "difference_degrees": <n>, "status": "<green|yellow|red>"},
    "thoracic_curve": {"value": <n>, "unit": "degrees", "normal_range": "20-45°", "status": "<green|yellow|red>"},
    "trunk_alignment": {"value": "<centered/left_lean/right_lean>", "lean_degrees": <n>, "status": "<green|yellow|red>"},
    "pelvic_tilt": {"value": "<anterior/neutral/posterior>", "degrees": <n>, "status": "<green|yellow|red>"},
    "pelvic_symmetry": {"value": "<level/left_higher/right_higher>", "difference_degrees": <n>, "status": "<green|yellow|red>"}
  },
  "recommended_protocols": [{"title": "<name>", "purpose": "<why>", "duration_minutes": <n>, "exercises": ["<names>"]}],
  "findings_text": "<2-4 paragraph plain-language explanation — MUST include specific measured angles and directions. NEVER say 'well-aligned' unless all angles < 2°>",
  "recommended_categories": ["desk_reset", "quick_reset"],
  "recommended_target_areas": ["<target areas>"]
}`,

  running_form: `You are an expert running biomechanics analyst, physical therapist, and gait specialist AI for the Team Welly wellness platform.

You will receive frames from a user running (treadmill or outdoor). Analyze their running form as a repeating compensation pattern across the full kinetic chain.

${COMPENSATION_CHAIN_INSTRUCTIONS}

RUNNING-SPECIFIC ANALYSIS:
Running is a series of single-leg landings and propulsion phases. For each side evaluate:
- Loading acceptance, pelvic control, trunk control, push-off quality
- Symmetry of arm-leg coordination
- Whether one side collapses more, stays on ground longer, or produces less force

Detect and score:
- Cadence, stride symmetry, stance time asymmetry
- Vertical oscillation, hip drop, contralateral pelvic drop
- Trunk lean, arm swing asymmetry, cross-body arm swing
- Head position, overstride suspicion
- Foot strike pattern, knee drive symmetry, push-off symmetry
- Pelvic rotation asymmetry, ankle stiffness / pronation suspicion
- One-sided impact loading tendency

RUNNING COMPENSATION-CHAIN REASONING:
- If left hip drop during right stance → check right glute med, trunk compensation, arm swing asymmetry, head level through compensation
- If low cadence + overstride → evaluate increased braking forces at knees, hips, low back, shins
- If one arm swings differently → check trunk rotation asymmetry, pelvic rotation
- If one side pushes off less → infer weakness/protective unloading through calf, glute, hamstring, foot

Additional landmarks for running: left_foot, right_foot

${LANDMARK_FORMAT}

Also include for each frame: "gait_phase": "<stance_left|stance_right|flight|toe_off_left|toe_off_right|heel_strike_left|heel_strike_right>"

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "overall_score": <0-100>,
  "area_scores": {"foot_strike": <0-100>, "knee_mechanics": <0-100>, "hip_stability": <0-100>, "trunk_control": <0-100>, "arm_mechanics": <0-100>, "symmetry": <0-100>},
  "frame_landmarks": [...],
  "deviation_events": [...],
  "running_metrics": {
    "stride_symmetry_percent": <0-100>, "estimated_cadence": "<spm>",
    "hip_drop_degrees": {"left": <n>, "right": <n>},
    "foot_strike_type": "<heel/midfoot/forefoot>",
    "vertical_oscillation": "<low/moderate/excessive>",
    "arm_swing_symmetry_percent": <0-100>,
    "trunk_forward_lean": <degrees>, "knee_drive": "<adequate/insufficient>",
    "overstriding": <boolean>,
    "stance_time_asymmetry": "<even/left_longer/right_longer>",
    "push_off_symmetry": "<even/left_weaker/right_weaker>",
    "pelvic_rotation_asymmetry": "<even/left_greater/right_greater>"
  },
  "joint_measurements": {
    "initial_contact_knee_angle": <degrees>, "peak_knee_flexion_stance": <degrees>,
    "hip_extension_at_toe_off": <degrees>, "trunk_lean": <degrees>,
    "arm_swing_range": <degrees>, "contralateral_hip_drop": <degrees>,
    "lateral_trunk_lean": "<none/left/right>", "lateral_trunk_lean_degrees": <number>
  },
  "posture_landmarks": {
    "side_view": {"ideal_plumb_line": "...", "user_deviations": [{"landmark": "<name>", "direction": "<dir>", "offset_cm_approx": <n>}]},
    "front_view": {"ideal_alignment": "...", "user_deviations": [{"landmark": "<name>", "direction": "<dir>", "offset_cm_approx": <n>}]}
  },
  "risk_flags": [{"area": "<body area>", "severity": "<red|yellow|green>", "finding": "<description>"}],
  "muscle_imbalances": [{"finding": "<description>", "overactive_tight": ["<muscles>"], "underactive_weak": ["<muscles>"], "possible_injuries": ["<risks>"]}],
  "compensation_chain": "<1-3 paragraph explanation>",
  "symptom_correlation": [{"pattern": "<pattern>", "likely_symptom_areas": ["<areas>"], "explanation": "<reasoning>"}],
  "corrective_priorities": [{"priority": <n>, "focus": "<focus>", "rationale": "<why>"}],
  "plane_analysis": {"sagittal": {"detected": <bool>, "findings": [...]}, "frontal": {"detected": <bool>, "findings": [...]}, "transverse": {"detected": <bool>, "findings": [...]}},
  "body_map": {"overloaded_tight": ["<regions>"], "underactive_weak": ["<regions>"], "symptom_risk": ["<regions>"]},
  "confidence_notes": ["<notes>"],
  "corrective_suggestions": [{"category": "<cadence|strength|mobility|form>", "suggestion": "<recommendation>"}],
  "recommended_protocols": [{"title": "<name>", "purpose": "<why>", "duration_minutes": <n>, "exercises": ["<names>"]}],
  "findings_text": "<2-4 paragraph plain-language explanation including compensation chain reasoning>",
  "recommended_categories": ["performance_program", "quick_reset"],
  "recommended_target_areas": ["<target areas>"]
}`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { frames, analysis_type = "overhead_squat" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      throw new Error("No frames provided");
    }

    const systemPrompt = ANALYSIS_PROMPTS[analysis_type] || ANALYSIS_PROMPTS.overhead_squat;

    const maxFrames = analysis_type === "running_form" ? 10 : 8;
    const step = Math.max(1, Math.floor(frames.length / maxFrames));
    const selectedFrames = frames.filter((_: string, i: number) => i % step === 0).slice(0, maxFrames);

    const imageContent = selectedFrames.map((frame: string) => ({
      type: "image_url" as const,
      image_url: { url: frame.startsWith("data:") ? frame : `data:image/jpeg;base64,${frame}` },
    }));

    const analysisLabels: Record<string, string> = {
      overhead_squat: "Overhead Squat Assessment",
      desk_posture: "Desk Posture Assessment",
      running_form: "Running Form Assessment",
    };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Analyze these ${selectedFrames.length} sequential frames from a ${analysisLabels[analysis_type] || "movement assessment"}. The frames are in chronological order. For the frame_landmarks array, provide landmark data for each frame (frame_index 0 through ${selectedFrames.length - 1}). IMPORTANT: Analyze the FULL body as an interconnected chain. Detect left-right asymmetries, compensation patterns, and domino effects. Do NOT reduce findings to simple labels like "slouching" — provide detailed compensation-chain reasoning.` },
              ...imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI analysis failed");
    }

    const aiResult = await response.json();
    const rawContent = aiResult.choices?.[0]?.message?.content || "";

    let analysisData;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      analysisData = {
        overall_score: 50,
        area_scores: {},
        frame_landmarks: [],
        deviation_events: [],
        joint_measurements: {},
        risk_flags: [],
        findings_text: "Analysis could not be fully completed. Please try again with better lighting and camera positioning.",
        recommended_categories: [],
        recommended_target_areas: [],
      };
    }

    if (!Array.isArray(analysisData.frame_landmarks)) analysisData.frame_landmarks = [];
    if (!Array.isArray(analysisData.deviation_events)) analysisData.deviation_events = [];

    analysisData.total_captured_frames = frames.length;
    analysisData.analyzed_frame_count = selectedFrames.length;
    analysisData.analysis_type = analysis_type;

    return new Response(JSON.stringify(analysisData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-movement error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
