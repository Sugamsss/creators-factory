STEP1_NEW_GENERATION_PROMPT_TEMPLATE = """Photorealistic studio portrait of {user_prompt} - straight-on frontal view with body and head facing directly at the camera, eyes looking straight into the lens with confident natural eye contact, relaxed yet professional approachable expression, medium close-up framing from head to upper chest perfectly centered on rule of thirds at eye level.

Background is intelligently matched to the character (e.g. softly blurred setting if described) or clean high-end photography studio with creamy bokeh that makes the subject pop.

Professional studio lighting: large softbox key light from front-left at 45 degrees with subtle fill from the right and gentle hair/rim light, even natural exposure, soft flattering shadows, warm realistic skin tones, no harsh or overly bright highlights. Shot on Canon EOS R5 with 85mm f/1.8 lens, realistic skin pores and micro-details, natural hair strands and fabric texture, subtle film grain, shallow depth of field, perfect professional color grading.

Keep the exact same framing, pose, camera angle, lighting direction, eye contact, and background style unchanged no matter what. Captured in a real high-end professional photoshoot, ultra-photorealistic, flawless yet completely natural and lifelike, no text, no watermarks, no AI artifacts or plastic look."""

STEP1_EDIT_PROMPT_TEMPLATE = """Edit the provided reference image to: {user_prompt}

Apply only the requested changes. Preserve all non-requested details exactly from the reference image.

Preserve identity and photographic fingerprint from the reference image: camera perspective, lens look, framing scale, lighting direction and ratio, exposure balance, skin tone rendering, color grading, texture detail, natural hair strands, subtle film grain, depth of field, and background style.

If the request explicitly asks to change pose, head angle, camera angle, framing, lighting, expression, color, or clothing, change only that requested attribute and keep everything else untouched.

Quality target: real high-end professional photoshoot, Canon EOS R5 with 85mm f/1.8 look, ultra-photorealistic, natural and lifelike, no text, no watermarks, no AI artifacts, no plastic skin.
Output exactly one edited image."""

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
