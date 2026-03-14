"""
Test prompt generation without making any fal.ai API calls (free test)
"""

import sys

sys.path.insert(0, "/Users/sugam/Personal Projects/Creators Factory/backend")

from src.services.ai.prompt_templates import PromptTemplateService


def test_prompt_with_age():
    """Test prompt with age - should append age"""
    prompt = PromptTemplateService.get_step1_new_generation_prompt(
        user_prompt="young woman with curly hair", age=28
    )
    assert "young woman with curly hair, age 28" in prompt
    print("✅ test_prompt_with_age PASSED")


def test_prompt_without_age():
    """Test prompt without age - should NOT append age"""
    prompt = PromptTemplateService.get_step1_new_generation_prompt(
        user_prompt="young woman with curly hair", age=None
    )
    assert "young woman with curly hair, age" not in prompt
    assert "young woman with curly hair" in prompt
    print("✅ test_prompt_without_age PASSED")


def test_prompt_with_zero_age():
    """Test prompt with age=0 - should NOT append age (0 is falsy)"""
    prompt = PromptTemplateService.get_step1_new_generation_prompt(
        user_prompt="young woman with curly hair", age=0
    )
    assert "age 0" not in prompt
    print("✅ test_prompt_with_zero_age PASSED")


def test_edit_prompt_with_age():
    """Test edit prompt with age"""
    prompt = PromptTemplateService.get_step1_edit_prompt(
        user_prompt="add glasses", age=35
    )
    assert "add glasses, age 35" in prompt
    print("✅ test_edit_prompt_with_age PASSED")


def test_edit_prompt_without_age():
    """Test edit prompt without age"""
    prompt = PromptTemplateService.get_step1_edit_prompt(
        user_prompt="add glasses", age=None
    )
    assert "add glasses, age" not in prompt
    assert "add glasses" in prompt
    print("✅ test_edit_prompt_without_age PASSED")


def test_step2_slots():
    """Test Step 2 reference slots"""
    slots = PromptTemplateService.get_step2_reference_slots()

    assert len(slots) == 15  # 14 variants + 1 base
    assert slots[0]["slot_key"] == "front_normal_smile"
    assert slots[0]["include_base"]

    # Check gender-neutral prompts
    for slot in slots[1:]:  # Skip base
        if slot.get("prompt"):
            assert "her" not in slot["prompt"].lower()
            assert "him" not in slot["prompt"].lower()

    print("✅ test_step2_slots PASSED")


def test_prompt_structure():
    """Test that prompt templates have correct structure"""
    new_gen = PromptTemplateService.get_step1_new_generation_prompt("test", age=10)

    # Should have the key elements
    assert "Photorealistic studio portrait" in new_gen
    assert "Canon EOS R5" in new_gen
    assert "test, age 10" in new_gen

    edit = PromptTemplateService.get_step1_edit_prompt("test edit", age=20)
    assert "Edit the provided reference image" in edit
    assert "test edit, age 20" in edit

    print("✅ test_prompt_structure PASSED")


if __name__ == "__main__":
    print("\n🧪 Running prompt tests (no API calls - free)...\n")

    test_prompt_with_age()
    test_prompt_without_age()
    test_prompt_with_zero_age()
    test_edit_prompt_with_age()
    test_edit_prompt_without_age()
    test_step2_slots()
    test_prompt_structure()

    print("\n✅ All tests passed!\n")
