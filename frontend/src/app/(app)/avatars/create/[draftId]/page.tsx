import { CreationWorkspace } from "@/features/avatars/components/creation/CreationWorkspace";

export default async function CreateAvatarPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  return <CreationWorkspace draftId={draftId} />;
}
