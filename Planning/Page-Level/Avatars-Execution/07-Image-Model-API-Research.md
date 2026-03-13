# Image Model API Research (Step 1 Visual Identity)

Date: 2026-03-12  
Scope: Keep existing Step 1 pipeline/prompts intact, switch provider transport to fal.ai, and expose model selection for three requested models.

## Official docs used

1. fal.ai API docs for OpenAI GPT Image 1.5
   - https://fal.ai/models/fal-ai/gpt-image-1.5/api
   - https://fal.ai/models/fal-ai/gpt-image-1.5/edit/api
2. fal.ai API docs for Nano Banana 2
   - https://fal.ai/models/fal-ai/nano-banana-2/api
   - https://fal.ai/models/fal-ai/nano-banana-2/edit/api
3. fal.ai API docs for Seedream 5
   - https://fal.ai/models/fal-ai/bytedance/seedream/v5/lite/text-to-image/api
   - https://fal.ai/models/fal-ai/bytedance/seedream/v5/lite/edit/api
4. fal.ai queue OpenAPI (submit/status/result)
   - `https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=<model-endpoint>`

## Confirmed Step 1 model mapping for product UI

- `openai_image_1_5` -> `fal-ai/gpt-image-1.5` + `fal-ai/gpt-image-1.5/edit`
- `google_nano_banana_2` -> `fal-ai/nano-banana-2` + `fal-ai/nano-banana-2/edit`
- `seedream_v5` -> `fal-ai/bytedance/seedream/v5/lite/text-to-image` + `fal-ai/bytedance/seedream/v5/lite/edit`

## Key API findings

1. fal.ai queue API is uniform across models:
   - `POST /<endpoint>` submit
   - `GET /<endpoint>/requests/{id}/status` poll
   - `GET /<endpoint>/requests/{id}` fetch result
2. Auth header is `Authorization: Key <FAL_KEY>` (or equivalent env key in server runtime).
3. All three selected models support text-to-image and image-to-image with multiple input references (`image_urls`).
4. Mask-based editing is only documented for GPT Image 1.5 (`mask_image_url`).
5. Nano Banana 2 exposes `resolution` (0.5K/1K/2K/4K) instead of `quality`.
6. Seedream v5 Lite does not expose a `quality` tier; image size controls output detail.

## Pipeline decisions implemented

1. Step 1 endpoint remains unchanged: `POST /avatars/{id}/generate-base`.
2. Existing server-side prompt enhancement and edit-preservation prompts are unchanged.
3. Frontend now exposes model selector options:
   - ChatGPT Image
   - Nano Banana 2
   - Seedream v5 lite
4. Backend model quality policy:
   - ChatGPT Image: `medium` (new), `high` (edit)
   - Nano Banana 2: `medium` (new), `high` (edit)
   - Seedream v5 lite: `high` (new/edit)
5. Seedream v5 quality implementation uses largest practical dimensions per selected aspect ratio.
6. Mask uploads remain supported only for OpenAI gpt-image-1.5 and are rejected for other models with 422.

## Environment variables expected

- `FAL_API_KEY` (preferred) or `FAL_KEY` for all Step 1 image calls.
- `MEDIA_ROOT` (optional, default `./media`) for file storage root.
- `MEDIA_URL_PREFIX` (optional, default `/media`) for static mount path.
- `PUBLIC_MEDIA_BASE_URL` (optional) to override request-derived URL base behind proxies/CDNs.

## Cross-check against existing planning docs

- `03-Data-API-and-Events.md`: iterative visual versions remain unchanged.
- `05-Backend-Build-Plan.md`: BE-008 behavior remains compatible; only provider transport/model roster changed.
- `Avatar-page-initial-idea.md`: iterative prompt/refinement flow still matches, now with selectable model strategy.

## Inconsistency called out

- Requested model name was "Seedream v5". On fal.ai the currently available endpoint is **Seedream v5 Lite** (`.../v5/lite/...`), not a non-lite v5 endpoint. The implementation maps UI label "Seedream v5" to the available v5 Lite endpoint.
