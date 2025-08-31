"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, Check, X, Search } from "lucide-react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import TaskModal from "../components/TaskModal";

const API =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/tasks";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // fetch tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API);
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  // add task
  const handleAddTask = async (task) => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let status = "pending";
    if (dueDate.getTime() === today.getTime()) status = "in-progress";

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status }),
      });
      if (!res.ok) throw new Error("Failed to add task");

      Swal.fire("Added!", "Task has been added.", "success");
      fetchTasks();
      setIsModalOpen(false);
    } catch {
      Swal.fire("Error", "Failed to add task", "error");
    }
  };

  // update task
  const handleUpdateTask = async (updatedTask) => {
    try {
      const res = await fetch(`${API}/${updatedTask._id}`, {
        method: "PATCH", // ✅ FIXED: use PATCH instead of PUT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTask),
      });

      if (!res.ok) throw new Error("Failed to update task");

      Swal.fire("Updated!", "Task updated successfully.", "success");
      fetchTasks();
      setEditingTask(null);
    } catch {
      Swal.fire("Error", "Failed to update task.", "error");
    }
  };

  // delete task
  const handleDeleteTask = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e3342f",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(`${API}/${id}`, { method: "DELETE" });
          Swal.fire("Deleted!", "Task deleted.", "success");
          fetchTasks();
        } catch {
          Swal.fire("Error", "Failed to delete task.", "error");
        }
      }
    });
  };

  // mark complete
  const handleCheckboxChange = (task) => {
    handleUpdateTask({ ...task, status: "completed" });
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter ? task.status === filter : true;
    return matchesSearch && matchesFilter;
  });

  const getCardColor = (task) => {
    const due = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (task.status === "completed") return "bg-green-200";
    if (due.getTime() === today.getTime() && task.status !== "completed")
      return "bg-orange-200";
    if (due < today && task.status !== "completed") return "bg-red-200";
    return "bg-yellow-100";
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-6">
      {/* Title outside card */}
      <h1 className="text-4xl font-bold text-yellow-600 mb-4">Task Manager</h1>

      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-6">
        {/* Add Task Button (below right of title) */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
          >
            <Plus className="mr-2" size={18} /> Add Task
          </button>
        </div>

        {/* Search & Filter (sticky row) */}
        <div className="flex gap-3 mb-6 sticky top-0 bg-white py-2 z-10">
          <div className="flex items-center border rounded-lg flex-1 px-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 outline-none"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg p-2"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Task List */}
        <ul className="space-y-4">
          {filteredTasks.map((task) => (
            <li
              key={task._id}
              className={`p-4 rounded-lg shadow-md border flex items-start justify-between ${getCardColor(
                task
              )}`}
            >
              <div className="flex items-start gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === "completed"}
                  onChange={() => handleCheckboxChange(task)}
                  className="mt-1"
                />
                {editingTask?._id === task._id ? (
                  <div className="flex flex-col flex-1 gap-2">
                    <input
                      type="text"
                      value={editingTask.title}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          title: e.target.value,
                        })
                      }
                      className="border p-1 rounded"
                    />
                    <textarea
                      value={editingTask.description}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          description: e.target.value,
                        })
                      }
                      className="border p-1 rounded"
                    />
                    <input
                      type="date"
                      value={editingTask.dueDate?.split("T")[0]}
                      onChange={(e) =>
                        setEditingTask({
                          ...editingTask,
                          dueDate: e.target.value,
                        })
                      }
                      className="border p-1 rounded"
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-600">{task.description}</p>
                    <p className="text-xs text-gray-500">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs font-medium">Status: {task.status}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-2">
                {editingTask?._id === task._id ? (
                  <>
                    <button
                      onClick={() => handleUpdateTask(editingTask)}
                      className="text-green-600"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateTask({ ...editingTask, status: "in-progress" })
                      }
                      className="text-yellow-600"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => setEditingTask(null)}
                      className="text-red-600"
                    >
                      <X size={18} />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditingTask(task)}
                      className="text-blue-600"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>

        {/* Task Modal */}
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleAddTask}
        />
      </div>
    </div>
  );
}
