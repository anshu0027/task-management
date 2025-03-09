"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AppData, Goal } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentMonthYear } from "@/lib/date-utils"
import { calculateTotalIncome, calculateTotalExpenses, getNetBalance } from "@/lib/budget-utils"

interface GoalsProps {
  data: AppData
  setData: (data: AppData) => void
}

export function Goals({ data, setData }: GoalsProps) {
  const { toast } = useToast()
  const { currentMonth, currentYear, months } = getCurrentMonthYear()

  const [isAddGoalDialogOpen, setIsAddGoalDialogOpen] = useState(false)
  const [isEditGoalDialogOpen, setIsEditGoalDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    targetAmount: 0,
    month: currentMonth,
    year: currentYear,
  })

  // Get all years from data
  const years = Array.from(new Set([...data.goals.map((goal) => goal.year), currentYear])).sort((a, b) => b - a) // Sort descending

  // Calculate goal progress for each goal
  const goalsWithProgress = data.goals.map((goal) => {
    const totalIncome = calculateTotalIncome(data.income, goal.month, goal.year)
    const totalExpenses = calculateTotalExpenses(data.expenses, goal.month, goal.year)
    const netBalance = getNetBalance(totalIncome, totalExpenses)

    const progress = goal.targetAmount > 0 ? Math.min(100, Math.round((netBalance / goal.targetAmount) * 100)) : 0

    return {
      ...goal,
      progress,
      netBalance,
    }
  })

  // Sort goals by year and month (newest first)
  const sortedGoals = [...goalsWithProgress].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year

    const monthOrder = months.indexOf(b.month) - months.indexOf(a.month)
    return monthOrder
  })

  // Add new goal
  const handleAddGoal = () => {
    // Check if goal already exists for this month/year
    const existingGoal = data.goals.find((goal) => goal.month === newGoal.month && goal.year === newGoal.year)

    if (existingGoal) {
      toast({
        title: "Goal already exists",
        description: `A goal for ${newGoal.month} ${newGoal.year} already exists. Please edit the existing goal.`,
        variant: "destructive",
      })
      return
    }

    const goal: Goal = {
      id: generateId(),
      targetAmount: newGoal.targetAmount || 0,
      month: newGoal.month || currentMonth,
      year: newGoal.year || currentYear,
    }

    setData({
      ...data,
      goals: [...data.goals, goal],
    })

    setNewGoal({
      targetAmount: 0,
      month: currentMonth,
      year: currentYear,
    })

    setIsAddGoalDialogOpen(false)
    toast({
      title: "Goal added",
      description: "Your income goal has been added successfully.",
    })
  }

  // Update goal
  const handleUpdateGoal = () => {
    if (!editingGoal) return

    const updatedGoals = data.goals.map((goal) => (goal.id === editingGoal.id ? editingGoal : goal))

    setData({
      ...data,
      goals: updatedGoals,
    })

    setIsEditGoalDialogOpen(false)
    setEditingGoal(null)
    toast({
      title: "Goal updated",
      description: "Your income goal has been updated successfully.",
    })
  }

  // Delete goal
  const handleDeleteGoal = (goalId: string) => {
    const updatedGoals = data.goals.filter((goal) => goal.id !== goalId)

    setData({
      ...data,
      goals: updatedGoals,
    })

    toast({
      title: "Goal deleted",
      description: "Your income goal has been deleted.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Income Goals</h1>
          <p className="text-gray-500">Set and track your monthly income goals</p>
        </div>
        <Dialog open={isAddGoalDialogOpen} onOpenChange={setIsAddGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Goal</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Income Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Net Income</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  value={newGoal.targetAmount?.toString()}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: Number.parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month">Month</Label>
                  <Select value={newGoal.month} onValueChange={(value) => setNewGoal({ ...newGoal, month: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={newGoal.year?.toString()}
                    onValueChange={(value) => setNewGoal({ ...newGoal, year: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                      <SelectItem value={(currentYear + 1).toString()}>{currentYear + 1}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAddGoalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddGoal}>Add Goal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedGoals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {goal.month} {goal.year}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Target</span>
                  <span className="font-medium">${goal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Current Net Income</span>
                  <span className={`font-medium ${goal.netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ${goal.netBalance.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingGoal(goal)
                      setIsEditGoalDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDeleteGoal(goal.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {sortedGoals.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-gray-100 p-3">
              <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="mt-4 text-sm font-medium text-gray-900">No goals found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new income goal.</p>
          </div>
        )}
      </div>

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <Dialog open={isEditGoalDialogOpen} onOpenChange={setIsEditGoalDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Income Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-targetAmount">Target Net Income</Label>
                <Input
                  id="edit-targetAmount"
                  type="number"
                  value={editingGoal.targetAmount.toString()}
                  onChange={(e) => setEditingGoal({ ...editingGoal, targetAmount: Number.parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-month">Month</Label>
                  <Select
                    value={editingGoal.month}
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, month: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-year">Year</Label>
                  <Select
                    value={editingGoal.year.toString()}
                    onValueChange={(value) => setEditingGoal({ ...editingGoal, year: Number.parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditGoalDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateGoal}>Update Goal</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

