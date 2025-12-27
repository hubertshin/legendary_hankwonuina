import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ProjectRecordingView } from "./recording-view";
import { ProjectProcessingView } from "./processing-view";
import { ProjectDraftView } from "./draft-view";

interface ProjectPageProps {
  params: { id: string };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      audioAssets: {
        orderBy: { clipIndex: "asc" },
      },
      transcripts: true,
      story: true,
      drafts: {
        where: { isActive: true },
        orderBy: { version: "desc" },
        take: 1,
      },
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      payment: true,
    },
  });

  if (!project) notFound();
  if (project.userId !== session.user.id) notFound();

  // Determine which view to show based on project status
  switch (project.status) {
    case "DRAFT":
    case "UPLOADING":
      return <ProjectRecordingView project={project} />;

    case "PROCESSING":
      return <ProjectProcessingView project={project} />;

    case "COMPLETED":
    case "FAILED":
      return <ProjectDraftView project={project} />;

    default:
      return <ProjectRecordingView project={project} />;
  }
}
