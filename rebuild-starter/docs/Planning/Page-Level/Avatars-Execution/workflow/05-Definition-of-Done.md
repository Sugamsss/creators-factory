# 05 — Definition of Done

## Purpose

This file defines what counts as done at three levels:
- task level
- milestone level
- page level

## 1. Task-Level Done

A task is `done` only when all conditions below are true:
- the implementation behavior matches the execution docs
- dependencies are respected
- no known blocker remains inside the task scope
- basic validation/testing for the task was performed
- handoff notes were recorded if the task changed shared behavior
- status trackers were updated

A task is **not** done if:
- the happy path works but edge cases are unhandled
- behavior differs from contract but seems “good enough”
- another agent must still fix a core part of the same task

## 2. Milestone-Level Done

A milestone is `done` only when:
- all required tasks under that milestone are done
- no blocking defects remain for that milestone
- downstream phases can begin without contract ambiguity
- relevant acceptance checks for that milestone pass

## 3. Page-Level Done

The Avatars page is done only when:
- `/avatars` is functional end-to-end
- `/avatars/all` is functional
- create/resume flow is functional
- edit completed avatar flow is functional
- Explore is functional
- clone behavior is correct
- Use/Pause/Delete/Restore behavior is correct
- org rules are enforced
- acceptance checklist in `../06-Test-Plan-and-Acceptance.md` is fully satisfied
- no unresolved high-severity defects remain

## 4. Minimum Test Expectations by Work Type

### Frontend task
- route or component renders correctly
- interactions work
- loading/error states handled where applicable
- keyboard behavior checked for interactive elements

### Backend task
- API behavior tested
- permission rules tested where applicable
- state transitions tested where applicable
- destructive or async side effects verified where applicable

### QA task
- scenario coverage documented
- observed result recorded
- pass/fail clearly stated
- regression risk called out if relevant

## 5. Done Criteria for High-Risk Flows

These flows require extra caution and should not be marked done lightly:
- LoRA failure/retry behavior
- clone lock enforcement
- delete side effects on automation bindings
- restore limit blocking
- completed-avatar edit restrictions
- replace-binding logic in deploy flow

## 6. Final Signoff Rule

No one should call the Avatars page complete unless:
- milestone board is fully done
- task board is fully done or explicitly deferred with approval
- acceptance checklist is checked
- workflow files still reflect reality
