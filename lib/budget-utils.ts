import type { Expense, Income } from "./types"
import { isSameMonth } from "./date-utils"

export function calculateTotalIncome(income: Income[], month: string, year: number) {
  return income.filter((item) => isSameMonth(item.date, month, year)).reduce((total, item) => total + item.amount, 0)
}

export function calculateTotalExpenses(expenses: Expense[], month: string, year: number) {
  return expenses.filter((item) => isSameMonth(item.date, month, year)).reduce((total, item) => total + item.amount, 0)
}

export function getNetBalance(income: number, expenses: number) {
  return income - expenses
}

