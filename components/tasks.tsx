"use client"

import { useState } from "react"
import { Plus, Search, Filter, X, Edit, Trash2, Pin, PinOff, CheckSquare } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import type { AppData, Task } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface TasksProps {
  data: AppData
  setData: (data: AppData) => void
}

export function Tasks({ data, setData }: TasksProps) {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "",
    description: "",
    category: "Personal",
    priority: "medium",
    status: "pending",
    dueDate: new Date().toISOString().split("T")[0],
    isPinned: false,
    isRecurring: false,
    recurringFrequency: "none",
  })
  const [deletedTasks, setDeletedTasks] = useState<Task[]>([])

  // Filter tasks
  const filteredTasks = data.tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || task.category === categoryFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesStatus = statusFilter === "all" || task.status === statusFilter

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus
  })

  // Sort tasks (pinned first, then by priority)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Add new task
  const handleAddTask = () => {
    const task: Task = {
      id: generateId(),
      title: newTask.title || "New Task",
      description: newTask.description || "",
      category: newTask.category || "Personal",
      priority: newTask.priority || "medium",
      status: newTask.status || "pending",
      dueDate: newTask.dueDate || new Date().toISOString().split("T")[0],
      isPinned: newTask.isPinned || false,
      isRecurring: newTask.isRecurring || false,
      recurringFrequency: newTask.recurringFrequency || "none",
      createdAt: new Date().toISOString(),
    }

    setData({
      ...data,
      tasks: [...data.tasks, task],
    })

    setNewTask({
      title: "",
      description: "",
      category: "Personal",
      priority: "medium",
      status: "pending",
      dueDate: new Date().toISOString().split("T")[0],
      isPinned: false,
      isRecurring: false,
      recurringFrequency: "none",
    })

    setIsAddDialogOpen(false)
    toast({
      title: "Task added",
      description: "Your task has been added successfully.",
    })
  }

  // Update task
  const handleUpdateTask = () => {
    if (!editingTask) return

    const updatedTasks = data.tasks.map((task) => (task.id === editingTask.id ? editingTask : task))

    setData({
      ...data,
      tasks: updatedTasks,
    })

    setIsEditDialogOpen(false)
    setEditingTask(null)
    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    })
  }

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = data.tasks.find((task) => task.id === taskId)
    if (!taskToDelete) return

    // Add to deleted tasks for potential recovery
    setDeletedTasks([...deletedTasks, taskToDelete])

    // Remove from tasks
    const updatedTasks = data.tasks.filter((task) => task.id !== taskId)
    setData({
      ...data,
      tasks: updatedTasks,
    })

    toast({
      title: "Task deleted",
      description: "Task deleted. Click undo to restore.",
      action: (
        <Button variant="outline" size="sm" onClick={() => handleUndoDelete(taskToDelete)}>
          Undo
        </Button>
      ),
    })
  }

  // Undo delete
  const handleUndoDelete = (task: Task) => {
    setData({
      ...data,
      tasks: [...data.tasks, task],
    })

    setDeletedTasks(deletedTasks.filter((t) => t.id !== task.id))

    toast({
      title: "Task restored",
      description: "Your task has been restored.",
    })
  }

  // Toggle task status
  const handleToggleStatus = (taskId: string) => {
    const updatedTasks = data.tasks.map((task) => {
      if (task.id === taskId) {
        const newStatus = task.status === "completed" ? "pending" : "completed"
        return { ...task, status: newStatus }
      }
      return task
    })

    setData({
      ...data,
      tasks: updatedTasks,
    })
  }

  // Toggle pin status
  const handleTogglePin = (taskId: string) => {
    const updatedTasks = data.tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, isPinned: !task.isPinned }
      }
      return task
    })

    setData({
      ...data,
      tasks: updatedTasks,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-500">Manage your tasks and to-dos</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newTask.category}
                    onValueChange={(value) => setNewTask({ ...newTask, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPinned"
                    checked={newTask.isPinned}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, isPinned: checked as boolean })}
                  />
                  <Label htmlFor="isPinned">Pin Task</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isRecurring"
                    checked={newTask.isRecurring}
                    onCheckedChange={(checked) => setNewTask({ ...newTask, isRecurring: checked as boolean })}
                  />
                  <Label htmlFor="isRecurring">Recurring Task</Label>
                </div>
              </div>
              {newTask.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="recurringFrequency">Frequency</Label>
                  <Select
                    value={newTask.recurringFrequency}
                    onValueChange={(value) => setNewTask({ ...newTask, recurringFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search tasks..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex space-x-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="truncate">Category</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Health">Health</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <span className="truncate">Priority</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" onClick={() => setStatusFilter("all")}>
            All
          </TabsTrigger>
          <TabsTrigger value="pending" onClick={() => setStatusFilter("pending")}>
            Pending
          </TabsTrigger>
          <TabsTrigger value="in-progress" onClick={() => setStatusFilter("in-progress")}>
            In Progress
          </TabsTrigger>
          <TabsTrigger value="completed" onClick={() => setStatusFilter("completed")}>
            Completed
          </TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <TasksList
            tasks={sortedTasks}
            onToggleStatus={handleToggleStatus}
            onTogglePin={handleTogglePin}
            onEdit={(task) => {
              setEditingTask(task)
              setIsEditDialogOpen(true)
            }}
            onDelete={handleDeleteTask}
          />
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <TasksList
            tasks={sortedTasks.filter((task) => task.status === "pending")}
            onToggleStatus={handleToggleStatus}
            onTogglePin={handleTogglePin}
            onEdit={(task) => {
              setEditingTask(task)
              setIsEditDialogOpen(true)
            }}
            onDelete={handleDeleteTask}
          />
        </TabsContent>
        <TabsContent value="in-progress" className="mt-4">
          <TasksList
            tasks={sortedTasks.filter((task) => task.status === "in-progress")}
            onToggleStatus={handleToggleStatus}
            onTogglePin={handleTogglePin}
            onEdit={(task) => {
              setEditingTask(task)
              setIsEditDialogOpen(true)
            }}
            onDelete={handleDeleteTask}
          />
        </TabsContent>
        <TabsContent value="completed" className="mt-4">
          <TasksList
            tasks={sortedTasks.filter((task) => task.status === "completed")}
            onToggleStatus={handleToggleStatus}
            onTogglePin={handleTogglePin}
            onEdit={(task) => {
              setEditingTask(task)
              setIsEditDialogOpen(true)
            }}
            onDelete={handleDeleteTask}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Task Dialog */}
      {editingTask && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  placeholder="Task title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingTask.description}
                  onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                  placeholder="Task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={editingTask.category}
                    onValueChange={(value) => setEditingTask({ ...editingTask, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={editingTask.priority}
                    onValueChange={(value) => setEditingTask({ ...editingTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingTask.status}
                    onValueChange={(value) => setEditingTask({ ...editingTask, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dueDate">Due Date</Label>
                  <Input
                    id="edit-dueDate"
                    type="date"
                    value={editingTask.dueDate}
                    onChange={(e) => setEditingTask({ ...editingTask, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isPinned"
                    checked={editingTask.isPinned}
                    onCheckedChange={(checked) => setEditingTask({ ...editingTask, isPinned: checked as boolean })}
                  />
                  <Label htmlFor="edit-isPinned">Pin Task</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit-isRecurring"
                    checked={editingTask.isRecurring}
                    onCheckedChange={(checked) => setEditingTask({ ...editingTask, isRecurring: checked as boolean })}
                  />
                  <Label htmlFor="edit-isRecurring">Recurring Task</Label>
                </div>
              </div>
              {editingTask.isRecurring && (
                <div className="space-y-2">
                  <Label htmlFor="edit-recurringFrequency">Frequency</Label>
                  <Select
                    value={editingTask.recurringFrequency}
                    onValueChange={(value) => setEditingTask({ ...editingTask, recurringFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateTask}>Update Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface TasksListProps {
  tasks: Task[]
  onToggleStatus: (id: string) => void
  onTogglePin: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

function TasksList({ tasks, onToggleStatus, onTogglePin, onEdit, onDelete }: TasksListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3">
          <CheckSquare className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No tasks found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card
          key={task.id}
          className={`transition-all duration-200 ${task.isPinned ? "border-blue-200 shadow-sm" : ""}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => onToggleStatus(task.id)}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-medium ${task.status === "completed" ? "line-through text-gray-400" : ""}`}>
                      {task.title}
                    </h3>
                    {task.isPinned && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Pinned
                      </Badge>
                    )}
                    {task.isRecurring && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {task.recurringFrequency}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <Badge variant="secondary" className="text-xs">
                      {task.category}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        task.priority === "high"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : task.priority === "medium"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : "bg-green-50 text-green-700 border-green-200"
                      }`}
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </Badge>
                    <span className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onTogglePin(task.id)}
                  title={task.isPinned ? "Unpin" : "Pin"}
                >
                  {task.isPinned ? (
                    <PinOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Pin className="h-4 w-4 text-gray-500" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onEdit(task)} title="Edit">
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} title="Delete">
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

