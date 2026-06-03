import plannerHtml from '@/assets/planning/task-tree-planner.html?raw';

export default function PlanningPage() {
  return (
    <main className="h-screen w-screen overflow-hidden bg-[#0f1419]">
      <iframe
        title="Task Tree Planner"
        srcDoc={plannerHtml}
        className="block h-full w-full border-0"
      />
    </main>
  );
}
