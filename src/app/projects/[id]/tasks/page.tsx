import TasksView from "@/views/TasksView";

export default async function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TasksView projectId={Number(id)} />;
}
