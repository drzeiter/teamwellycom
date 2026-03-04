import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { frames } = await req.json(); // array of base64 image strings
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      throw new Error("No frames provided");
    }

    // Take up to 6 evenly-spaced frames for analysis
    const step = Math.max(1, Math.floor(frames.length / 6));
    const selectedFrames = frames.filter((_: string, i: number) => i % step === 0).slice(0, 6);

    const systemPrompt = `You are an expert movement analyst and physical therapist AI for the Team Welly wellness platform.

You will receive frames from a user performing an Overhead Squat Assessment. Analyze the user's movement and posture by examining joint positions across frames.

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
  "joint_measurements": {
    "knee_valgus_angle": <number in degrees, estimate even if approximate>,
    "hip_shift": "<left/right/neutral>",
    "hip_shift_degrees": <number in degrees of lateral deviation from center, 0 if neutral>,
    "pelvic_tilt": "<anterior/posterior/neutral>",
    "pelvic_tilt_degrees": <number in degrees of tilt>,
    "torso_forward_lean": <number in degrees from vertical>,
    "ankle_dorsiflexion_range": <number in degrees>,
    "shoulder_flexion_range": <number in degrees>,
    "squat_depth": "<full/parallel/quarter/minimal>",
    "head_position": "<forward/neutral/extended>",
    "head_forward_degrees": <number in degrees of forward deviation>,
    "lumbar_curve": "<excessive/normal/flat>",
    "thoracic_curve": "<excessive/normal/flat>",
    "knee_over_toe": <boolean whether knees track past toes>,
    "feet_turn_out": "<none/mild/excessive>",
    "feet_turn_out_degrees": <number in degrees>,
    "arm_fall_forward": <boolean whether arms fall forward during overhead>,
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
      "finding": "<e.g. Excessive Forward Lean, Knee Valgus, Arms Falling Forward>",
      "overactive_tight": ["<muscle names that are likely tight/overactive, e.g. Soleus, Gastrocnemius, Hip Flexor Group, Piriformis>"],
      "underactive_weak": ["<muscle names that are likely weak/underactive, e.g. Tibialis Anterior, Glute Max, Core Stabilizers>"],
      "possible_injuries": ["<potential injury risks if left unaddressed, e.g. Hamstring Strain, Low Back Pain, Patellar Tendinopathy>"]
    }
  ],
  "findings_text": "<2-4 paragraph plain-language explanation of findings, written in second person. Include specific observations and practical meaning. Example: 'You are shifting your weight to the left during your squat, likely due to limited right ankle mobility or reduced left glute stability.'>",
  "recommended_categories": ["<category_type values from: performance_program, quick_reset, breathwork, desk_reset matching issues found>"],
  "recommended_target_areas": ["<target_area values like: Low Back, Hips, Shoulders, Foot/Ankle, Knee, etc.>"]
}

For each compensatory pattern observed, provide a muscle_imbalances entry identifying:
- The specific movement fault/finding
- Which muscles are likely overactive/tight causing the compensation
- Which muscles are likely underactive/weak allowing the compensation
- What injuries or conditions this pattern can lead to over time

Use NASM corrective exercise methodology as the basis for muscle imbalance identification.

Analyze carefully:
- knee valgus (knees caving inward)
- hip shift to either side
- pelvic tilt (anterior or posterior)
- excessive forward lean of torso
- ankle dorsiflexion limitations (heels rising)
- shoulder flexion limitations (arms falling forward)
- squat depth achieved
- left/right asymmetries

Be specific and actionable in findings_text. If the image quality is poor or the person isn't visible, still return the JSON structure with reasonable defaults and note the limitation in findings_text.`;

    const imageContent = selectedFrames.map((frame: string) => ({
      type: "image_url" as const,
      image_url: { url: frame.startsWith("data:") ? frame : `data:image/jpeg;base64,${frame}` },
    }));

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
              { type: "text", text: "Analyze these frames from an Overhead Squat Assessment. The frames are in sequence from start to end of the squat movement." },
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

    // Parse JSON from AI response (strip markdown fences if present)
    let analysisData;
    try {
      const cleaned = rawContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      analysisData = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", rawContent);
      analysisData = {
        overall_score: 50,
        area_scores: { ankles: 50, knees: 50, hips: 50, core: 50, shoulders: 50 },
        joint_measurements: {},
        risk_flags: [],
        findings_text: "Analysis could not be fully completed. Please try again with better lighting and camera positioning.",
        recommended_categories: [],
        recommended_target_areas: [],
      };
    }

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
