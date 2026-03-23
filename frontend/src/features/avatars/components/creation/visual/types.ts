export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export const SUPPORTED_ASPECT_RATIOS: AspectRatio[] = ["1:1", "3:4", "9:16", "4:3", "16:9"];

export const MODEL_MAPPING = {
  ChatGPT: "openai_image_1_5",
  "Nano Banana": "google_nano_banana_2",
  "Seedream v5 Lite": "seedream_v5",
} as const;

export type ModelLabel = keyof typeof MODEL_MAPPING;

export const REVERSE_MODEL_MAPPING: Record<string, ModelLabel> = {
  openai_image_1_5: "ChatGPT",
  google_nano_banana_2: "Nano Banana",
  seedream_v5: "Seedream v5 Lite",
};

export const MODEL_OPTIONS: ModelLabel[] = ["ChatGPT", "Nano Banana", "Seedream v5 Lite"];

export const isAspectRatio = (value: string): value is AspectRatio =>
  SUPPORTED_ASPECT_RATIOS.includes(value as AspectRatio);
