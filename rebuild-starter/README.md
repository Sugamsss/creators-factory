# Rebuild Starter

This directory is a clean rebuild kit assembled from the surviving planning docs, the main UI reference image, and the latest image-prompt logic recovered from the Mar 12 Codex sessions.

Included:
- `docs/Planning/` - planning package copied as-is
- `docs/Avatar-page-initial-idea.md` - page-level spec copy
- `docs/vision.md` - product vision copy
- `reference-ui/screen.png` - primary UI reference image
- `prompts/avatar_image_prompts.py` - directly usable recovered prompt constants
- `prompts/avatar_image_prompts.md` - human-readable prompt notes and provenance
- `prompts/step2_reference_slots.json` - machine-readable Step 2 slot/prompt map

Important notes:
- This kit is meant to be the source input for a clean rebuild, not a continuation of the partially restored app.
- The Step 1 prompt wrapper is high-confidence because its text appears directly in the Mar 12 sessions.
- The Step 2 `14 + 1` flow is high-confidence as behavior and slot set. Most prompt strings are directly evidenced from the same-day conversation; one mild-sad variant is reconstructed from the slot key plus conversation wording.
- Temporary debugging flags from later Mar 12 testing are intentionally not carried into this kit because they were runtime controls, not prompt definitions.
