STEP1_NEW_GENERATION_PROMPT_TEMPLATE = """Create a high-quality portrait of: {user_prompt}.

Ensure the subject is clear and well-lit. Maintain all descriptive details from the prompt exactly as requested.

No text, no watermarks, no AI artifacts."""

STEP1_EDIT_PROMPT_TEMPLATE = """Edit the provided reference image to: {user_prompt}

Apply only the requested changes. Preserve all non-requested details exactly from the reference image, including identity, background style, framing, and overall aesthetic. Output exactly one edited image."""

STEP1_EDIT_PRESERVE_PROMPT = """Preserve the input image exactly. Keep identity, framing, lighting, clothing, and background unchanged."""

STEP2_REFERENCE_SLOTS = [
    {
        "slot_key": "front_normal_smile",
        "label": "Front · Normal Smile (Selected Base)",
        "include_base": True,
        "prompt": None,
    },
    {
        "slot_key": "turn_left_45",
        "label": "Turn Left 45°",
        "include_base": False,
        "prompt": "turn 45 degrees to the left",
    },
    {
        "slot_key": "turn_left_90",
        "label": "Turn Left 90°",
        "include_base": False,
        "prompt": "turn 90 degrees to the left",
    },
    {
        "slot_key": "turn_right_45",
        "label": "Turn Right 45°",
        "include_base": False,
        "prompt": "turn 45 degrees to the right",
    },
    {
        "slot_key": "turn_right_90",
        "label": "Turn Right 90°",
        "include_base": False,
        "prompt": "turn 90 degrees to the right",
    },
    {
        "slot_key": "look_up_45",
        "label": "Look Up 45°",
        "include_base": False,
        "prompt": "look up 45 degrees",
    },
    {
        "slot_key": "look_down_45",
        "label": "Look Down 45°",
        "include_base": False,
        "prompt": "look down 45 degrees",
    },
    {
        "slot_key": "smile_peaceful",
        "label": "Peaceful Smile",
        "include_base": False,
        "prompt": "smile a bit peacefully",
    },
    {
        "slot_key": "happy_extreme",
        "label": "Extremely Happy",
        "include_base": False,
        "prompt": "smile an extremely happy smile",
    },
    {
        "slot_key": "sad_mild",
        "label": "A Bit Sad",
        "include_base": False,
        "prompt": "look a bit sad",
    },
    {
        "slot_key": "sad_extreme",
        "label": "Extremely Sad",
        "include_base": False,
        "prompt": "look extremely sad",
    },
    {
        "slot_key": "angry",
        "label": "Angry",
        "include_base": False,
        "prompt": "look angry",
    },
    {
        "slot_key": "excited",
        "label": "Excited",
        "include_base": False,
        "prompt": "look excited",
    },
    {
        "slot_key": "serious",
        "label": "Serious",
        "include_base": False,
        "prompt": "have a serious expression",
    },
    {
        "slot_key": "devastated",
        "label": "Devastated",
        "include_base": False,
        "prompt": "look devastated",
    },
]
