export interface Task {
  id: string
  title: string
  description: string
  category: string
  priority: "high" | "medium" | "low"
  status: "pending" | "in-progress" | "completed"
  dueDate: string
  isPinned: boolean
  isRecurring: boolean
  recurringFrequency: "none" | "daily" | "weekly" | "monthly"
  createdAt: string
}

export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  notes: string
  tags: string[]
}

export interface Income {
  id: string
  amount: number
  source: string
  date: string
  notes: string
}

export interface Goal {
  id: string
  targetAmount: number
  month: string
  year: number
}

export interface AppData {
  tasks: Task[]
  expenses: Expense[]
  income: Income[]
  goals: Goal[]
}

