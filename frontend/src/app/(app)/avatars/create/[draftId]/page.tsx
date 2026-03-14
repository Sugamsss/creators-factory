import { CreationWorkspace } from "@/features/avatars/components/creation/CreationWorkspace";

export default async function CreateAvatarPage({
  params,
}: {
  params: { draftId: string };
}) {
  return <CreationWorkspace draftId={params.draftId} />;
}
