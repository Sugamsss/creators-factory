from typing import Dict, List, Optional

from src.core.prompts import (
    STEP1_NEW_GENERATION_PROMPT_TEMPLATE,
    STEP1_EDIT_PROMPT_TEMPLATE,
    STEP1_EDIT_PRESERVE_PROMPT,
    STEP2_REFERENCE_SLOTS,
)


def build_step1_enhanced_prompt(
    user_prompt: str, age: Optional[int] = None, *, is_edit: bool
) -> str:
    full_prompt = user_prompt
    if age is not None and age > 0:
        full_prompt = f"{user_prompt}, age {age}"

    if is_edit:
        return STEP1_EDIT_PROMPT_TEMPLATE.format(user_prompt=full_prompt)
    return STEP1_NEW_GENERATION_PROMPT_TEMPLATE.format(user_prompt=full_prompt)


class PromptTemplateService:
    @staticmethod
    def get_step1_new_generation_prompt(
        user_prompt: str, age: Optional[int] = None
    ) -> str:
        return build_step1_enhanced_prompt(user_prompt, age, is_edit=False)

    @staticmethod
    def get_step1_edit_prompt(user_prompt: str, age: Optional[int] = None) -> str:
        return build_step1_enhanced_prompt(user_prompt, age, is_edit=True)

    @staticmethod
    def get_step1_edit_preserve_prompt() -> str:
        return STEP1_EDIT_PRESERVE_PROMPT

    @staticmethod
    def get_step2_reference_slots() -> List[Dict]:
        return STEP2_REFERENCE_SLOTS

    @staticmethod
    def get_prompt_for_slot(slot_key: str) -> Optional[str]:
        slots = PromptTemplateService.get_step2_reference_slots()
        for slot in slots:
            if slot["slot_key"] == slot_key:
                return slot.get("prompt")
        return None

    @staticmethod
    def get_all_slot_keys() -> List[str]:
        slots = PromptTemplateService.get_step2_reference_slots()
        return [slot["slot_key"] for slot in slots]
