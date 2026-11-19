export type TaskStatus = "To Do" | "In Progress" | "Completed";

export type TaskPriority = "Critical" | "High" | "Normal";

export interface AgencyTask {
  id: string;
  title: string;
  assignedTo: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
}

interface KanbanBoardProps {
  tasks: AgencyTask[];
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
}

const columns: TaskStatus[] = [
  "To Do",
  "In Progress",
  "Completed",
];

const priorityColors: Record<TaskPriority, string> = {
  Critical: "bg-red-100 text-red-700",
  High: "bg-orange-100 text-orange-700",
  Normal: "bg-green-100 text-green-700",
};

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onDelete,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {columns.map((column) => {
        const columnTasks = tasks.filter(
          (task) => task.status === column
        );

        return (
          <section
            key={column}
            className="rounded-xl bg-gray-100 p-4"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">
                {column}
              </h2>

              <span className="rounded-full bg-white px-3 py-1 text-sm">
                {columnTasks.length}
              </span>
            </div>

            <div className="space-y-4">
              {columnTasks.map((task) => (
                <article
                  key={task.id}
                  className="rounded-xl bg-white p-5 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        priorityColors[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>

                    <button
                      type="button"
                      onClick={() => onDelete(task.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-800">
                    {task.title}
                  </h3>

                  <p className="mt-3 text-sm text-gray-600">
                    Assigned to: {task.assignedTo}
                  </p>

                  <p className="mt-1 text-sm text-gray-600">
                    Deadline: {task.dueDate || "Not set"}
                  </p>

                  <label
                    htmlFor={`task-status-${task.id}`}
                    className="mt-4 block text-sm font-medium"
                  >
                    Update Status
                  </label>

                  <select
                    id={`task-status-${task.id}`}
                    value={task.status}
                    onChange={(event) =>
                      onStatusChange(
                        task.id,
                        event.target.value as TaskStatus
                      )
                    }
                    className="mt-2 w-full rounded-lg border border-gray-300 p-2"
                  >
                    {columns.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </article>
              ))}

              {columnTasks.length === 0 && (
                <p className="rounded-lg bg-white p-4 text-center text-sm text-gray-500">
                  No tasks in this column.
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}