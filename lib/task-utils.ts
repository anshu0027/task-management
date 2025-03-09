import type { Task } from "./types"

export function getTaskStatusCounts(tasks: Task[]) {
  const completed = tasks.filter((task) => task.status === "completed").length
  const inProgress = tasks.filter((task) => task.status === "in-progress").length
  const pending = tasks.filter((task) => task.status === "pending").length
  const total = tasks.length

  return { completed, inProgress, pending, total }
}

