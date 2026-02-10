import TasksView from "@/views/TasksView";

export default function TasksPage({ params }: { params: { id: string } }) {
  return <TasksView projectId={Number(params.id)} />;
}
