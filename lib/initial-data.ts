import type { AppData } from "./types"
import { getCurrentMonthYear } from "./date-utils"

const { currentMonth, currentYear } = getCurrentMonthYear()

export const initialData: AppData = {
  tasks: [
    {
      id: "task1",
      title: "Complete project proposal",
      description: "Finish the draft and send it to the team for review",
      category: "Work",
      priority: "high",
      status: "in-progress",
      dueDate: new Date().toISOString().split("T")[0],
      isPinned: true,
      isRecurring: false,
      recurringFrequency: "none",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task2",
      title: "Grocery shopping",
      description: "Buy fruits, vegetables, and other essentials",
      category: "Personal",
      priority: "medium",
      status: "pending",
      dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
      isPinned: false,
      isRecurring: true,
      recurringFrequency: "weekly",
      createdAt: new Date().toISOString(),
    },
    {
      id: "task3",
      title: "Morning jog",
      description: "30 minutes of jogging in the park",
      category: "Health",
      priority: "medium",
      status: "completed",
      dueDate: new Date().toISOString().split("T")[0],
      isPinned: false,
      isRecurring: true,
      recurringFrequency: "daily",
      createdAt: new Date().toISOString(),
    },
  ],
  expenses: [
    {
      id: "expense1",
      amount: 45.99,
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      notes: "Grocery shopping at Whole Foods",
      tags: ["groceries", "essentials"],
    },
    {
      id: "expense2",
      amount: 120.0,
      category: "Utilities",
      date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
      notes: "Electricity bill for the month",
      tags: ["bills", "monthly"],
    },
    {
      id: "expense3",
      amount: 9.99,
      category: "Entertainment",
      date: new Date(Date.now() - 172800000).toISOString().split("T")[0],
      notes: "Netflix subscription",
      tags: ["subscription", "monthly"],
    },
  ],
  income: [
    {
      id: "income1",
      amount: 2500.0,
      source: "Salary",
      date: new Date(Date.now() - 259200000).toISOString().split("T")[0],
      notes: "Monthly salary",
    },
    {
      id: "income2",
      amount: 150.0,
      source: "Freelance",
      date: new Date(Date.now() - 345600000).toISOString().split("T")[0],
      notes: "Website design project",
    },
  ],
  goals: [
    {
      id: "goal1",
      targetAmount: 3000.0,
      month: currentMonth,
      year: currentYear,
    },
  ],
}

