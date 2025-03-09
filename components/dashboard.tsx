"use client"

import { BarChart3, CheckSquare, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { AppData } from "@/lib/types"
import { calculateTotalIncome, calculateTotalExpenses, getNetBalance } from "@/lib/budget-utils"
import { getTaskStatusCounts } from "@/lib/task-utils"
import { getCurrentMonthYear } from "@/lib/date-utils"

interface DashboardProps {
  data: AppData
}

export function Dashboard({ data }: DashboardProps) {
  const { currentMonth, currentYear } = getCurrentMonthYear()

  // Calculate budget stats
  const totalIncome = calculateTotalIncome(data.income, currentMonth, currentYear)
  const totalExpenses = calculateTotalExpenses(data.expenses, currentMonth, currentYear)
  const netBalance = getNetBalance(totalIncome, totalExpenses)

  // Calculate task stats
  const { completed, inProgress, pending, total } = getTaskStatusCounts(data.tasks)
  const taskCompletionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  // Calculate goal progress
  const currentGoal = data.goals.find((goal) => goal.month === currentMonth && goal.year === currentYear) || {
    targetAmount: 0,
    currentAmount: 0,
  }

  const goalProgress =
    currentGoal.targetAmount > 0 ? Math.min(100, Math.round((netBalance / currentGoal.targetAmount) * 100)) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your tasks, budget, and goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {completed}/{total}
                </p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
              <CheckSquare className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={taskCompletionRate} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${totalIncome.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  {currentMonth} {currentYear}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
                <p className="text-xs text-gray-500">
                  {currentMonth} {currentYear}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                  ${Math.abs(netBalance).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">{netBalance >= 0 ? "Surplus" : "Deficit"}</p>
              </div>
              <DollarSign className={`h-8 w-8 ${netBalance >= 0 ? "text-green-500" : "text-red-500"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Income Goal Progress</CardTitle>
          <CardDescription>
            {currentMonth} {currentYear} - ${netBalance.toFixed(2)} of ${currentGoal.targetAmount.toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress value={goalProgress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.tasks.slice(0, 3).map((task) => (
              <div key={task.id} className="flex items-start space-x-3 border-b border-gray-100 pb-3">
                <div
                  className={`w-2 h-2 mt-1.5 rounded-full ${
                    task.status === "completed"
                      ? "bg-green-500"
                      : task.status === "in-progress"
                        ? "bg-blue-500"
                        : "bg-yellow-500"
                  }`}
                />
                <div>
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-500">{task.category}</p>
                </div>
              </div>
            ))}

            {data.expenses.slice(0, 3).map((expense) => (
              <div key={expense.id} className="flex items-start space-x-3 border-b border-gray-100 pb-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-red-500" />
                <div>
                  <p className="font-medium text-sm">
                    ${expense.amount.toFixed(2)} - {expense.category}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

