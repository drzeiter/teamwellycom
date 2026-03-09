import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANALYSIS_PROMPTS: Record<string, string> = {
  overhead_squat: `You are an expert movement analyst and physical therapist AI for the Team Welly wellness platform.

You will receive sequential frames from a user performing an Overhead Squat Assessment. Analyze the user's movement and posture by examining joint positions across frames.

For EACH frame provided, estimate the 2D positions (as normalized 0-1 coordinates where 0,0 is top-left) of these landmarks:
head, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle, pelvis_center, spine_mid, spine_top

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "overall_score": <number 0-100>,
  "area_scores": {
    "ankles": <number 0-100>,
    "knees": <number 0-100>,
    "hips": <number 0-100>,
    "core": <number 0-100>,
    "shoulders": <number 0-100>
  },
  "frame_landmarks": [
    {
      "frame_index": <number>,
      "landmarks": {
        "head": {"x": <0-1>, "y": <0-1>},
        "left_shoulder": {"x": <0-1>, "y": <0-1>},
        "right_shoulder": {"x": <0-1>, "y": <0-1>},
        "left_elbow": {"x": <0-1>, "y": <0-1>},
        "right_elbow": {"x": <0-1>, "y": <0-1>},
        "left_wrist": {"x": <0-1>, "y": <0-1>},
        "right_wrist": {"x": <0-1>, "y": <0-1>},
        "left_hip": {"x": <0-1>, "y": <0-1>},
        "right_hip": {"x": <0-1>, "y": <0-1>},
        "left_knee": {"x": <0-1>, "y": <0-1>},
        "right_knee": {"x": <0-1>, "y": <0-1>},
        "left_ankle": {"x": <0-1>, "y": <0-1>},
        "right_ankle": {"x": <0-1>, "y": <0-1>},
        "pelvis_center": {"x": <0-1>, "y": <0-1>},
        "spine_mid": {"x": <0-1>, "y": <0-1>},
        "spine_top": {"x": <0-1>, "y": <0-1>}
      },
      "joint_angles": {
        "left_knee_angle": <degrees>,
        "right_knee_angle": <degrees>,
        "left_hip_angle": <degrees>,
        "right_hip_angle": <degrees>,
        "torso_angle": <degrees from vertical>,
        "left_shoulder_angle": <degrees>,
        "right_shoulder_angle": <degrees>
      },
      "alignment_status": {
        "pelvis": "<green|yellow|red>",
        "knees": "<green|yellow|red>",
        "spine": "<green|yellow|red>",
        "shoulders": "<green|yellow|red>",
        "ankles": "<green|yellow|red>"
      }
    }
  ],
  "deviation_events": [
    {
      "frame_index": <number>,
      "label": "<e.g. Pelvic Shift Detected, Knee Valgus Detected, Lumbar Extension Detected>",
      "severity": "<yellow|red>",
      "body_area": "<pelvis|knees|spine|shoulders|ankles>"
    }
  ],
  "joint_measurements": {
    "knee_valgus_angle": <number in degrees>,
    "hip_shift": "<left/right/neutral>",
    "hip_shift_degrees": <number>,
    "pelvic_tilt": "<anterior/posterior/neutral>",
    "pelvic_tilt_degrees": <number>,
    "torso_forward_lean": <number in degrees from vertical>,
    "ankle_dorsiflexion_range": <number in degrees>,
    "shoulder_flexion_range": <number in degrees>,
    "squat_depth": "<full/parallel/quarter/minimal>",
    "head_position": "<forward/neutral/extended>",
    "head_forward_degrees": <number>,
    "lumbar_curve": "<excessive/normal/flat>",
    "thoracic_curve": "<excessive/normal/flat>",
    "knee_over_toe": <boolean>,
    "feet_turn_out": "<none/mild/excessive>",
    "feet_turn_out_degrees": <number>,
    "arm_fall_forward": <boolean>,
    "weight_distribution": "<even/left-heavy/right-heavy/anterior/posterior>"
  },
  "posture_landmarks": {
    "side_view": {
      "ideal_plumb_line": "Ear -> Shoulder -> Hip -> Knee -> Ankle all vertically aligned",
      "user_deviations": [
        {"landmark": "<ear/shoulder/hip/knee/ankle>", "direction": "<forward/backward/left/right>", "offset_cm_approx": <number>}
      ]
    },
    "front_view": {
      "ideal_alignment": "Shoulders level, hips level, knees tracking over 2nd toe",
      "user_deviations": [
        {"landmark": "<left_shoulder/right_shoulder/left_hip/right_hip/left_knee/right_knee>", "direction": "<higher/lower/inward/outward>", "offset_cm_approx": <number>}
      ]
    }
  },
  "risk_flags": [
    {
      "area": "<body area>",
      "severity": "<red|yellow|green>",
      "finding": "<brief description>"
    }
  ],
  "muscle_imbalances": [
    {
      "finding": "<e.g. Excessive Forward Lean, Knee Valgus>",
      "overactive_tight": ["<muscle names>"],
      "underactive_weak": ["<muscle names>"],
      "possible_injuries": ["<injury risks>"]
    }
  ],
  "findings_text": "<2-4 paragraph plain-language explanation>",
  "recommended_categories": ["<category_type values>"],
  "recommended_target_areas": ["<target_area values>"]
}

Use NASM corrective exercise methodology. Analyze carefully: knee valgus, hip shift, pelvic tilt, forward lean, ankle dorsiflexion, shoulder flexion, squat depth, asymmetries.
Be very precise with landmark positions - they will be used to render skeleton overlays on the video replay.`,

  desk_posture: `You are an expert posture analyst AI for the Team Welly wellness platform.

You will receive frames from a user sitting at their desk. Analyze their seated posture.

For EACH frame provided, estimate the 2D positions (normalized 0-1, top-left origin) of these landmarks:
head, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip, left_knee, right_knee, pelvis_center, spine_mid, spine_top, chin, ear_left, ear_right

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "overall_score": <number 0-100>,
  "area_scores": {
    "head_neck": <number 0-100>,
    "shoulders": <number 0-100>,
    "thoracic": <number 0-100>,
    "lumbar": <number 0-100>,
    "pelvis": <number 0-100>
  },
  "frame_landmarks": [
    {
      "frame_index": <number>,
      "landmarks": {
        "head": {"x": <0-1>, "y": <0-1>},
        "chin": {"x": <0-1>, "y": <0-1>},
        "ear_left": {"x": <0-1>, "y": <0-1>},
        "ear_right": {"x": <0-1>, "y": <0-1>},
        "left_shoulder": {"x": <0-1>, "y": <0-1>},
        "right_shoulder": {"x": <0-1>, "y": <0-1>},
        "left_elbow": {"x": <0-1>, "y": <0-1>},
        "right_elbow": {"x": <0-1>, "y": <0-1>},
        "left_wrist": {"x": <0-1>, "y": <0-1>},
        "right_wrist": {"x": <0-1>, "y": <0-1>},
        "left_hip": {"x": <0-1>, "y": <0-1>},
        "right_hip": {"x": <0-1>, "y": <0-1>},
        "left_knee": {"x": <0-1>, "y": <0-1>},
        "right_knee": {"x": <0-1>, "y": <0-1>},
        "pelvis_center": {"x": <0-1>, "y": <0-1>},
        "spine_mid": {"x": <0-1>, "y": <0-1>},
        "spine_top": {"x": <0-1>, "y": <0-1>}
      },
      "joint_angles": {
        "head_forward_angle": <degrees from vertical>,
        "cervical_flexion": <degrees>,
        "thoracic_flexion": <degrees>,
        "shoulder_protraction": <degrees>,
        "lumbar_flexion": <degrees>,
        "pelvic_tilt_angle": <degrees>
      },
      "alignment_status": {
        "head_neck": "<green|yellow|red>",
        "shoulders": "<green|yellow|red>",
        "thoracic": "<green|yellow|red>",
        "lumbar": "<green|yellow|red>",
        "pelvis": "<green|yellow|red>"
      }
    }
  ],
  "deviation_events": [
    {
      "frame_index": <number>,
      "label": "<e.g. Forward Head Posture, Shoulder Rounding Detected, Excessive Thoracic Flexion>",
      "severity": "<yellow|red>",
      "body_area": "<head_neck|shoulders|thoracic|lumbar|pelvis>"
    }
  ],
  "joint_measurements": {
    "head_forward_angle": <degrees>,
    "cervical_flexion": <degrees>,
    "shoulder_protraction_degrees": <degrees>,
    "shoulder_elevation": "<level/left_higher/right_higher>",
    "thoracic_kyphosis_angle": <degrees>,
    "lumbar_lordosis": "<excessive/normal/flat>",
    "pelvic_tilt": "<anterior/posterior/neutral>",
    "pelvic_tilt_degrees": <degrees>,
    "screen_distance_assessment": "<too_close/adequate/too_far>"
  },
  "posture_landmarks": {
    "side_view": {
      "ideal_plumb_line": "Ear -> Shoulder -> Hip aligned vertically when seated",
      "user_deviations": [
        {"landmark": "<ear/shoulder/hip>", "direction": "<forward/backward>", "offset_cm_approx": <number>}
      ]
    },
    "front_view": {
      "ideal_alignment": "Shoulders level, head centered",
      "user_deviations": [
        {"landmark": "<left_shoulder/right_shoulder/head>", "direction": "<higher/lower/tilted>", "offset_cm_approx": <number>}
      ]
    }
  },
  "risk_flags": [
    {"area": "<body area>", "severity": "<red|yellow|green>", "finding": "<brief description>"}
  ],
  "muscle_imbalances": [
    {
      "finding": "<e.g. Forward Head Posture, Rounded Shoulders>",
      "overactive_tight": ["<muscle names>"],
      "underactive_weak": ["<muscle names>"],
      "possible_injuries": ["<injury risks>"]
    }
  ],
  "corrective_suggestions": [
    {"category": "exercise", "suggestion": "<e.g. Chin tuck exercises, 3x10 daily>"},
    {"category": "mobility", "suggestion": "<e.g. Thoracic extension over foam roller, 2 min>"},
    {"category": "activation", "suggestion": "<e.g. Scapular retraction holds, 3x15s>"},
    {"category": "ergonomic", "suggestion": "<e.g. Monitor at eye level, arm rests at elbow height>"}
  ],
  "posture_metrics": {
    "head_forward_angle": {"value": <number>, "unit": "degrees", "normal_range": "0-5°", "status": "<green|yellow|red>"},
    "shoulder_position": {"value": "<protracted/neutral/retracted>", "protraction_degrees": <number>, "status": "<green|yellow|red>"},
    "thoracic_curve": {"value": <number>, "unit": "degrees", "normal_range": "20-45°", "status": "<green|yellow|red>"},
    "pelvic_tilt": {"value": "<anterior/neutral/posterior>", "degrees": <number>, "status": "<green|yellow|red>"}
  },
  "findings_text": "<2-3 paragraph plain-language explanation of desk posture findings>",
  "recommended_categories": ["desk_reset", "quick_reset"],
  "recommended_target_areas": ["<target areas>"]
}

Focus on: head forward posture, cervical flexion, shoulder rounding/protraction, thoracic kyphosis, lumbar support, pelvic tilt. Provide practical desk setup and corrective exercise suggestions.`,

  running_form: `You are an expert running biomechanics analyst AI for the Team Welly wellness platform.

You will receive frames from a user running (treadmill or outdoor). Analyze their running form.

For EACH frame provided, estimate the 2D positions (normalized 0-1, top-left origin) of these landmarks:
head, left_shoulder, right_shoulder, left_elbow, right_elbow, left_wrist, right_wrist, left_hip, right_hip, left_knee, right_knee, left_ankle, right_ankle, left_foot, right_foot, pelvis_center, spine_mid, spine_top

Return ONLY valid JSON (no markdown, no code fences) with this structure:
{
  "overall_score": <number 0-100>,
  "area_scores": {
    "foot_strike": <number 0-100>,
    "knee_mechanics": <number 0-100>,
    "hip_stability": <number 0-100>,
    "trunk_control": <number 0-100>,
    "arm_mechanics": <number 0-100>,
    "symmetry": <number 0-100>
  },
  "frame_landmarks": [
    {
      "frame_index": <number>,
      "landmarks": {
        "head": {"x": <0-1>, "y": <0-1>},
        "left_shoulder": {"x": <0-1>, "y": <0-1>},
        "right_shoulder": {"x": <0-1>, "y": <0-1>},
        "left_elbow": {"x": <0-1>, "y": <0-1>},
        "right_elbow": {"x": <0-1>, "y": <0-1>},
        "left_wrist": {"x": <0-1>, "y": <0-1>},
        "right_wrist": {"x": <0-1>, "y": <0-1>},
        "left_hip": {"x": <0-1>, "y": <0-1>},
        "right_hip": {"x": <0-1>, "y": <0-1>},
        "left_knee": {"x": <0-1>, "y": <0-1>},
        "right_knee": {"x": <0-1>, "y": <0-1>},
        "left_ankle": {"x": <0-1>, "y": <0-1>},
        "right_ankle": {"x": <0-1>, "y": <0-1>},
        "left_foot": {"x": <0-1>, "y": <0-1>},
        "right_foot": {"x": <0-1>, "y": <0-1>},
        "pelvis_center": {"x": <0-1>, "y": <0-1>},
        "spine_mid": {"x": <0-1>, "y": <0-1>},
        "spine_top": {"x": <0-1>, "y": <0-1>}
      },
      "joint_angles": {
        "left_knee_angle": <degrees>,
        "right_knee_angle": <degrees>,
        "left_hip_angle": <degrees>,
        "right_hip_angle": <degrees>,
        "trunk_lean": <degrees from vertical>,
        "left_arm_swing": <degrees>,
        "right_arm_swing": <degrees>
      },
      "alignment_status": {
        "foot_strike": "<green|yellow|red>",
        "knees": "<green|yellow|red>",
        "hips": "<green|yellow|red>",
        "trunk": "<green|yellow|red>",
        "arms": "<green|yellow|red>"
      },
      "gait_phase": "<stance_left|stance_right|flight|toe_off_left|toe_off_right|heel_strike_left|heel_strike_right>"
    }
  ],
  "deviation_events": [
    {
      "frame_index": <number>,
      "label": "<e.g. Hip Drop Detected, Overstriding, Cross-Body Arm Swing>",
      "severity": "<yellow|red>",
      "body_area": "<foot|knees|hips|trunk|arms>"
    }
  ],
  "running_metrics": {
    "stride_symmetry_percent": <number 0-100>,
    "estimated_cadence": "<steps per minute estimate>",
    "hip_drop_degrees": {"left": <number>, "right": <number>},
    "foot_strike_type": "<heel/midfoot/forefoot>",
    "vertical_oscillation": "<low/moderate/excessive>",
    "arm_swing_symmetry_percent": <number 0-100>,
    "trunk_forward_lean": <degrees>,
    "knee_drive": "<adequate/insufficient>",
    "overstriding": <boolean>
  },
  "joint_measurements": {
    "initial_contact_knee_angle": <degrees>,
    "peak_knee_flexion_stance": <degrees>,
    "hip_extension_at_toe_off": <degrees>,
    "trunk_lean": <degrees>,
    "arm_swing_range": <degrees>,
    "contralateral_hip_drop": <degrees>
  },
  "risk_flags": [
    {"area": "<body area>", "severity": "<red|yellow|green>", "finding": "<brief description>"}
  ],
  "muscle_imbalances": [
    {
      "finding": "<e.g. Hip Drop, Overstriding, Cross-Body Arm Swing>",
      "overactive_tight": ["<muscle names>"],
      "underactive_weak": ["<muscle names>"],
      "possible_injuries": ["<injury risks>"]
    }
  ],
  "corrective_suggestions": [
    {"category": "cadence", "suggestion": "<e.g. Increase cadence to 170-180 spm>"},
    {"category": "strength", "suggestion": "<e.g. Single-leg glute bridges for hip stability>"},
    {"category": "mobility", "suggestion": "<e.g. Hip flexor stretching post-run>"},
    {"category": "form", "suggestion": "<e.g. Focus on landing under center of mass>"}
  ],
  "findings_text": "<2-3 paragraph plain-language explanation of running form findings>",
  "recommended_categories": ["performance_program", "quick_reset"],
  "recommended_target_areas": ["<target areas>"]
}

Focus on: stride symmetry, hip drop (Trendelenburg), cadence, foot strike pattern, arm swing, vertical oscillation, trunk control, overstriding. Use running biomechanics principles.`,
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

    // Take up to 8 evenly-spaced frames for analysis (more for better overlay tracking)
    const maxFrames = analysis_type === "running_form" ? 10 : 8;
    const step = Math.max(1, Math.floor(frames.length / maxFrames));
    const selectedFrames = frames.filter((_: string, i: number) => i % step === 0).slice(0, maxFrames);

    const imageContent = selectedFrames.map((frame: string, idx: number) => ({
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
              { type: "text", text: `Analyze these ${selectedFrames.length} sequential frames from a ${analysisLabels[analysis_type] || "movement assessment"}. The frames are in chronological order. For the frame_landmarks array, provide landmark data for each frame (frame_index 0 through ${selectedFrames.length - 1}).` },
              ...imageContent,
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
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

    // Ensure frame_landmarks is always an array
    if (!Array.isArray(analysisData.frame_landmarks)) {
      analysisData.frame_landmarks = [];
    }
    if (!Array.isArray(analysisData.deviation_events)) {
      analysisData.deviation_events = [];
    }

    // Include total frames info for replay
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
