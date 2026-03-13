# Avatar Image Prompts

This prompt set is reconstructed from the latest Mar 12 Codex sessions and cross-checked against the surviving planning docs.

## What is high-confidence

- Step 1 used a richer photoreal studio-generation wrapper.
- Step 1 edits used a strict identity-preserving edit wrapper.
- Step 2 switched to a `14 + 1` structure:
  - `1` selected base image reused as `front_normal_smile`
  - `14` generated variants
- Step 2 used the same edit wrapper as Step 1 edits.
- Step 2 used fixed model `seedream_v5` (`Seedream v5 lite`).

## Step 1 - New generation wrapper

```text
Photorealistic studio portrait of {user_prompt} - straight-on frontal view with body and head facing directly at the camera, eyes looking straight into the lens with confident natural eye contact, relaxed yet professional approachable expression, medium close-up framing from head to upper chest perfectly centered on rule of thirds at eye level.

Background is intelligently matched to the character (e.g. softly blurred setting if described) or clean high-end photography studio with creamy bokeh that makes the subject pop.

Professional studio lighting: large softbox key light from front-left at 45 degrees with subtle fill from the right and gentle hair/rim light, even natural exposure, soft flattering shadows, warm realistic skin tones, no harsh or overly bright highlights. Shot on Canon EOS R5 with 85mm f/1.8 lens, realistic skin pores and micro-details, natural hair strands and fabric texture, subtle film grain, shallow depth of field, perfect professional color grading.

Keep the exact same framing, pose, camera angle, lighting direction, eye contact, and background style unchanged no matter what. Captured in a real high-end professional photoshoot, ultra-photorealistic, flawless yet completely natural and lifelike, no text, no watermarks, no AI artifacts or plastic look.
```

## Step 1 - Edit wrapper

```text
Edit the provided reference image to: {user_prompt}

Apply only the requested changes. Preserve all non-requested details exactly from the reference image.

Preserve identity and photographic fingerprint from the reference image: camera perspective, lens look, framing scale, lighting direction and ratio, exposure balance, skin tone rendering, color grading, texture detail, natural hair strands, subtle film grain, depth of field, and background style.

If the request explicitly asks to change pose, head angle, camera angle, framing, lighting, expression, color, or clothing, change only that requested attribute and keep everything else untouched.

Quality target: real high-end professional photoshoot, Canon EOS R5 with 85mm f/1.8 look, ultra-photorealistic, natural and lifelike, no text, no watermarks, no AI artifacts, no plastic skin.
Output exactly one edited image.
```

## Step 2 - Final intended slot set

The final same-day behavior was `14 generated + 1 selected base`.

The selected base image becomes:
- `front_normal_smile`
- not regenerated
- displayed in the Identity Training grid as the front-facing normal-smile slot

The 14 generated prompts were:

1. `turn her 45 degrees to left`
2. `turn her 90 degrees to left`
3. `turn her 45 degrees to right`
4. `turn her 90 degrees to right`
5. `turn her to look up 45 degrees`
6. `turn her to look down 45 degrees`
7. `make her smile a bit peacefully`
8. `make her extremely happy`
9. `make her a bit sad`
10. `make her extremely sad`
11. `make her angry`
12. `make her excited`
13. `make her serious`
14. `make her devastated`

## Confidence note

- Prompts 1-8 and 10-12 are directly evidenced in the Mar 12 conversation.
- `serious` and `devastated` are directly evidenced as the two added final emotions.
- `make her a bit sad` is reconstructed from the user wording `make her bit sad` plus the final backend slot key `sad_mild`.
- A temporary assistant claim that a third extra emotion was needed was incorrect; the later implemented slot inventory confirms `14 prompts + base = 15 total slots`.

## Important non-prompt decisions that affected the flow

- Trigger Step 2 immediately after `Save and Proceed`.
- Use the selected Step 1 image as the source attachment for every generated Step 2 variant.
- Use fixed model `seedream_v5`.
- Use the current edit wrapper for all Step 2 variants.

These are not prompts themselves, but they were part of the final prompt execution contract.
