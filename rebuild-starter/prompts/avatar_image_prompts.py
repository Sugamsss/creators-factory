"""Recovered avatar image prompt set from Mar 12, 2026 sessions.

This file is intended as clean rebuild input.
It captures the latest prompt logic that was clearly evidenced in the surviving
same-day Codex sessions.
"""

from __future__ import annotations


STEP1_EDIT_PRESERVE_PROMPT = (
    "Preserve the input image exactly. Keep identity, framing, lighting, clothing, "
    "and background unchanged."
)


STEP1_NEW_GENERATION_PROMPT_TEMPLATE = """
Photorealistic studio portrait of {user_prompt} - straight-on frontal view with body and head facing directly at the camera, eyes looking straight into the lens with confident natural eye contact, relaxed yet professional approachable expression, medium close-up framing from head to upper chest perfectly centered on rule of thirds at eye level.

Background is intelligently matched to the character (e.g. softly blurred setting if described) or clean high-end photography studio with creamy bokeh that makes the subject pop.

Professional studio lighting: large softbox key light from front-left at 45 degrees with subtle fill from the right and gentle hair/rim light, even natural exposure, soft flattering shadows, warm realistic skin tones, no harsh or overly bright highlights. Shot on Canon EOS R5 with 85mm f/1.8 lens, realistic skin pores and micro-details, natural hair strands and fabric texture, subtle film grain, shallow depth of field, perfect professional color grading.

Keep the exact same framing, pose, camera angle, lighting direction, eye contact, and background style unchanged no matter what. Captured in a real high-end professional photoshoot, ultra-photorealistic, flawless yet completely natural and lifelike, no text, no watermarks, no AI artifacts or plastic look.
""".strip()


STEP1_EDIT_PROMPT_TEMPLATE = """
Edit the provided reference image to: {user_prompt}

Apply only the requested changes. Preserve all non-requested details exactly from the reference image.

Preserve identity and photographic fingerprint from the reference image: camera perspective, lens look, framing scale, lighting direction and ratio, exposure balance, skin tone rendering, color grading, texture detail, natural hair strands, subtle film grain, depth of field, and background style.

If the request explicitly asks to change pose, head angle, camera angle, framing, lighting, expression, color, or clothing, change only that requested attribute and keep everything else untouched.

Quality target: real high-end professional photoshoot, Canon EOS R5 with 85mm f/1.8 look, ultra-photorealistic, natural and lifelike, no text, no watermarks, no AI artifacts, no plastic skin.
Output exactly one edited image.
""".strip()


def build_step1_enhanced_prompt(user_prompt: str, *, is_edit: bool) -> str:
    if is_edit:
        return STEP1_EDIT_PROMPT_TEMPLATE.format(user_prompt=user_prompt)
    return STEP1_NEW_GENERATION_PROMPT_TEMPLATE.format(user_prompt=user_prompt)


STEP2_FIXED_MODEL = "seedream_v5"
STEP2_FLOW_MODE = "14_generated_plus_1_selected_base"
STEP2_SELECTED_BASE_SLOT_KEY = "front_normal_smile"
STEP2_SELECTED_BASE_SLOT_PROMPT = None
STEP2_PROMPT_WRAPPER = "build_step1_enhanced_prompt(prompt, is_edit=True)"


STEP2_REFERENCE_SLOTS = [
    {
        "slot_key": "front_normal_smile",
        "label": "Front · Normal Smile (Selected Base)",
        "include_base": True,
        "prompt": None,
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "turn_left_45",
        "label": "Turn Left 45°",
        "include_base": False,
        "prompt": "turn her 45 degrees to left",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "turn_left_90",
        "label": "Turn Left 90°",
        "include_base": False,
        "prompt": "turn her 90 degrees to left",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "turn_right_45",
        "label": "Turn Right 45°",
        "include_base": False,
        "prompt": "turn her 45 degrees to right",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "turn_right_90",
        "label": "Turn Right 90°",
        "include_base": False,
        "prompt": "turn her 90 degrees to right",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "look_up_45",
        "label": "Look Up 45°",
        "include_base": False,
        "prompt": "turn her to look up 45 degrees",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "look_down_45",
        "label": "Look Down 45°",
        "include_base": False,
        "prompt": "turn her to look down 45 degrees",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "smile_peaceful",
        "label": "Peaceful Smile",
        "include_base": False,
        "prompt": "make her smile a bit peacefully",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "happy_extreme",
        "label": "Extremely Happy",
        "include_base": False,
        "prompt": "make her extremely happy",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "sad_mild",
        "label": "A Bit Sad",
        "include_base": False,
        "prompt": "make her a bit sad",
        "prompt_confidence": "reconstructed_from_conversation_and_slot_key",
    },
    {
        "slot_key": "sad_extreme",
        "label": "Extremely Sad",
        "include_base": False,
        "prompt": "make her extremely sad",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "angry",
        "label": "Angry",
        "include_base": False,
        "prompt": "make her angry",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "excited",
        "label": "Excited",
        "include_base": False,
        "prompt": "make her excited",
        "prompt_confidence": "exact",
    },
    {
        "slot_key": "serious",
        "label": "Serious",
        "include_base": False,
        "prompt": "make her serious",
        "prompt_confidence": "reconstructed_from_confirmed_slot_and_user_decision",
    },
    {
        "slot_key": "devastated",
        "label": "Devastated",
        "include_base": False,
        "prompt": "make her devastated",
        "prompt_confidence": "reconstructed_from_confirmed_slot_and_user_decision",
    },
]
