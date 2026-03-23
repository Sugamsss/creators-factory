from dataclasses import dataclass, field
from typing import List, Optional

from src.modules.avatars.models import AvatarBuildState, AvatarTrainingStatus


class AvatarTransitionError(ValueError):
    pass


@dataclass
class AvatarCompletionContext:
    has_active_base: bool
    reference_count: int
    training_status: Optional[AvatarTrainingStatus]
    name: Optional[str]
    age: Optional[int]
    description: Optional[str]
    backstory: Optional[str]
    communication_principles_count: int
    industry_id: Optional[int]
    role_paragraph: Optional[str]


@dataclass
class StepReadiness:
    step_id: int
    step_name: str
    is_complete: bool
    can_enter: bool
    blocked_reasons: List[str] = field(default_factory=list)


@dataclass
class AvatarReadinessSnapshot:
    current_step: int
    steps: List[StepReadiness]
    can_complete_avatar: bool
    completion_blockers: List[str] = field(default_factory=list)


def _derive_current_step(build_state: AvatarBuildState) -> int:
    if build_state == AvatarBuildState.DRAFT_VISUAL:
        return 1
    if build_state in {
        AvatarBuildState.DRAFT_APPEARANCE,
        AvatarBuildState.TRAINING_LORA,
        AvatarBuildState.FAILED_TRAINING,
    }:
        return 2
    return 3


def derive_avatar_readiness(
    build_state: AvatarBuildState, context: AvatarCompletionContext
) -> AvatarReadinessSnapshot:
    completion_blockers: List[str] = []

    step1_blockers: List[str] = []
    if not context.has_active_base:
        step1_blockers.append("Select an active base image in Step 1.")

    step2_blockers: List[str] = []
    if not context.has_active_base:
        step2_blockers.append("Step 1 is incomplete: active base image is missing.")
    if context.reference_count != 15:
        step2_blockers.append(
            f"Generate all 15 reference images before training (current: {context.reference_count})."
        )
    if context.training_status != AvatarTrainingStatus.COMPLETED:
        step2_blockers.append("LoRA training must be completed.")

    if not context.has_active_base:
        completion_blockers.append("Active base image is required.")
    if context.reference_count != 15:
        completion_blockers.append("Reference set must contain exactly 15 images.")
    if context.training_status != AvatarTrainingStatus.COMPLETED:
        completion_blockers.append("LoRA training must be completed.")
    if not context.name or len(context.name.strip()) < 2:
        completion_blockers.append("Name must be at least 2 characters.")
    if not context.description or len(context.description.strip()) < 20:
        completion_blockers.append("Description must be at least 20 characters.")
    if not context.backstory or len(context.backstory.strip()) < 80:
        completion_blockers.append("Backstory must be at least 80 characters.")
    if context.communication_principles_count <= 0:
        completion_blockers.append("Add at least one communication principle.")
    if context.industry_id is None:
        completion_blockers.append("Industry is required.")
    if not context.role_paragraph or not context.role_paragraph.strip():
        completion_blockers.append("Role is required.")

    current_step = _derive_current_step(build_state)
    step1_complete = len(step1_blockers) == 0
    step2_complete = len(step2_blockers) == 0
    step3_complete = len(completion_blockers) == 0 and build_state == AvatarBuildState.READY

    steps = [
        StepReadiness(
            step_id=1,
            step_name="Visual Identity",
            is_complete=step1_complete,
            can_enter=True,
            blocked_reasons=step1_blockers,
        ),
        StepReadiness(
            step_id=2,
            step_name="Finalize Appearance",
            is_complete=step2_complete,
            can_enter=step1_complete,
            blocked_reasons=step2_blockers,
        ),
        StepReadiness(
            step_id=3,
            step_name="Personality",
            is_complete=step3_complete,
            can_enter=step2_complete
            or build_state in {AvatarBuildState.DRAFT_PERSONALITY, AvatarBuildState.READY},
            blocked_reasons=completion_blockers,
        ),
    ]
    return AvatarReadinessSnapshot(
        current_step=current_step,
        steps=steps,
        can_complete_avatar=len(completion_blockers) == 0,
        completion_blockers=completion_blockers,
    )


def apply_avatar_command(
    current_state: AvatarBuildState,
    command: str,
    readiness: AvatarReadinessSnapshot,
) -> AvatarBuildState:
    if command == "save_draft":
        if current_state in {
            AvatarBuildState.DRAFT_VISUAL,
            AvatarBuildState.DRAFT_APPEARANCE,
            AvatarBuildState.TRAINING_LORA,
            AvatarBuildState.FAILED_TRAINING,
            AvatarBuildState.DRAFT_PERSONALITY,
            AvatarBuildState.READY,
        }:
            return current_state
        return AvatarBuildState.DRAFT_PERSONALITY

    if command == "complete_avatar":
        if current_state not in {
            AvatarBuildState.DRAFT_PERSONALITY,
            AvatarBuildState.READY,
        }:
            raise AvatarTransitionError(
                f"Cannot complete avatar from state '{current_state.value}'."
            )
        if not readiness.can_complete_avatar:
            raise AvatarTransitionError(
                "Avatar is not ready to complete: "
                + "; ".join(readiness.completion_blockers)
            )
        return AvatarBuildState.READY

    raise AvatarTransitionError(f"Unsupported avatar command '{command}'.")


def get_training_lifecycle_label(
    training_status: Optional[AvatarTrainingStatus], last_message: Optional[str] = None
) -> str:
    if training_status == AvatarTrainingStatus.RETRYING:
        return "Retrying"
    if training_status == AvatarTrainingStatus.FAILED:
        return "Failed"
    if training_status == AvatarTrainingStatus.COMPLETED:
        return "Completed"
    if training_status in {AvatarTrainingStatus.QUEUED, AvatarTrainingStatus.NOT_STARTED}:
        return "Preparing dataset"

    message = (last_message or "").strip().lower()
    if "validat" in message:
        return "Validating"
    if "prepar" in message:
        return "Preparing dataset"
    return "Training"
