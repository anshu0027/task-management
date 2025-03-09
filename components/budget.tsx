"use client"

import { useState } from "react"
import { Plus, Search, Filter, X, Edit, Trash2, ArrowUp, ArrowDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { AppData, Expense, Income } from "@/lib/types"
import { generateId } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { getCurrentMonthYear } from "@/lib/date-utils"
import { calculateTotalIncome, calculateTotalExpenses, getNetBalance } from "@/lib/budget-utils"

interface BudgetProps {
  data: AppData
  setData: (data: AppData) => void
}

export function Budget({ data, setData }: BudgetProps) {
  const { toast } = useToast()
  const { currentMonth, currentYear } = getCurrentMonthYear()

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("expenses")

  const [isAddExpenseDialogOpen, setIsAddExpenseDialogOpen] = useState(false)
  const [isEditExpenseDialogOpen, setIsEditExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    amount: 0,
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    tags: [],
  })

  const [isAddIncomeDialogOpen, setIsAddIncomeDialogOpen] = useState(false)
  const [isEditIncomeDialogOpen, setIsEditIncomeDialogOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState<Income | null>(null)
  const [newIncome, setNewIncome] = useState<Partial<Income>>({
    amount: 0,
    source: "Salary",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const [deletedExpenses, setDeletedExpenses] = useState<Expense[]>([])
  const [deletedIncomes, setDeletedIncomes] = useState<Income[]>([])

  // Calculate budget summary
  const totalIncome = calculateTotalIncome(data.income, currentMonth, currentYear)
  const totalExpenses = calculateTotalExpenses(data.expenses, currentMonth, currentYear)
  const netBalance = getNetBalance(totalIncome, totalExpenses)

  // Filter expenses
  const filteredExpenses = data.expenses.filter((expense) => {
    const matchesSearch =
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.notes && expense.notes.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filter incomes
  const filteredIncomes = data.income.filter((income) => {
    const matchesSearch =
      income.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (income.notes && income.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  // Sort incomes by date (newest first)
  const sortedIncomes = [...filteredIncomes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Add new expense
  const handleAddExpense = () => {
    const expense: Expense = {
      id: generateId(),
      amount: newExpense.amount || 0,
      category: newExpense.category || "Food",
      date: newExpense.date || new Date().toISOString().split("T")[0],
      notes: newExpense.notes || "",
      tags: newExpense.tags || [],
    }

    setData({
      ...data,
      expenses: [...data.expenses, expense],
    })

    setNewExpense({
      amount: 0,
      category: "Food",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      tags: [],
    })

    setIsAddExpenseDialogOpen(false)
    toast({
      title: "Expense added",
      description: "Your expense has been added successfully.",
    })
  }

  // Update expense
  const handleUpdateExpense = () => {
    if (!editingExpense) return

    const updatedExpenses = data.expenses.map((expense) =>
      expense.id === editingExpense.id ? editingExpense : expense,
    )

    setData({
      ...data,
      expenses: updatedExpenses,
    })

    setIsEditExpenseDialogOpen(false)
    setEditingExpense(null)
    toast({
      title: "Expense updated",
      description: "Your expense has been updated successfully.",
    })
  }

  // Delete expense
  const handleDeleteExpense = (expenseId: string) => {
    const expenseToDelete = data.expenses.find((expense) => expense.id === expenseId)
    if (!expenseToDelete) return

    // Add to deleted expenses for potential recovery
    setDeletedExpenses([...deletedExpenses, expenseToDelete])

    // Remove from expenses
    const updatedExpenses = data.expenses.filter((expense) => expense.id !== expenseId)
    setData({
      ...data,
      expenses: updatedExpenses,
    })

    toast({
      title: "Expense deleted",
      description: "Expense deleted. Click undo to restore.",
      action: (
        <Button variant="outline" size="sm" onClick={() => handleUndoDeleteExpense(expenseToDelete)}>
          Undo
        </Button>
      ),
    })
  }

  // Undo delete expense
  const handleUndoDeleteExpense = (expense: Expense) => {
    setData({
      ...data,
      expenses: [...data.expenses, expense],
    })

    setDeletedExpenses(deletedExpenses.filter((e) => e.id !== expense.id))

    toast({
      title: "Expense restored",
      description: "Your expense has been restored.",
    })
  }

  // Add new income
  const handleAddIncome = () => {
    const income: Income = {
      id: generateId(),
      amount: newIncome.amount || 0,
      source: newIncome.source || "Salary",
      date: newIncome.date || new Date().toISOString().split("T")[0],
      notes: newIncome.notes || "",
    }

    setData({
      ...data,
      income: [...data.income, income],
    })

    setNewIncome({
      amount: 0,
      source: "Salary",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    })

    setIsAddIncomeDialogOpen(false)
    toast({
      title: "Income added",
      description: "Your income has been added successfully.",
    })
  }

  // Update income
  const handleUpdateIncome = () => {
    if (!editingIncome) return

    const updatedIncomes = data.income.map((income) => (income.id === editingIncome.id ? editingIncome : income))

    setData({
      ...data,
      income: updatedIncomes,
    })

    setIsEditIncomeDialogOpen(false)
    setEditingIncome(null)
    toast({
      title: "Income updated",
      description: "Your income has been updated successfully.",
    })
  }

  // Delete income
  const handleDeleteIncome = (incomeId: string) => {
    const incomeToDelete = data.income.find((income) => income.id === incomeId)
    if (!incomeToDelete) return

    // Add to deleted incomes for potential recovery
    setDeletedIncomes([...deletedIncomes, incomeToDelete])

    // Remove from incomes
    const updatedIncomes = data.income.filter((income) => income.id !== incomeId)
    setData({
      ...data,
      income: updatedIncomes,
    })

    toast({
      title: "Income deleted",
      description: "Income deleted. Click undo to restore.",
      action: (
        <Button variant="outline" size="sm" onClick={() => handleUndoDeleteIncome(incomeToDelete)}>
          Undo
        </Button>
      ),
    })
  }

  // Undo delete income
  const handleUndoDeleteIncome = (income: Income) => {
    setData({
      ...data,
      income: [...data.income, income],
    })

    setDeletedIncomes(deletedIncomes.filter((i) => i.id !== income.id))

    toast({
      title: "Income restored",
      description: "Your income has been restored.",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-500">Manage your income and expenses</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isAddIncomeDialogOpen} onOpenChange={setIsAddIncomeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Plus className="h-4 w-4" />
                Add Income
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Income</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newIncome.amount?.toString()}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: Number.parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Source</Label>
                  <Select
                    value={newIncome.source}
                    onValueChange={(value) => setNewIncome({ ...newIncome, source: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Salary">Salary</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                      <SelectItem value="Investment">Investment</SelectItem>
                      <SelectItem value="Gift">Gift</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newIncome.notes}
                    onChange={(e) => setNewIncome({ ...newIncome, notes: e.target.value })}
                    placeholder="Add notes"
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddIncomeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddIncome}>Add Income</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddExpenseDialogOpen} onOpenChange={setIsAddExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newExpense.amount?.toString()}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: Number.parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newExpense.category}
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Housing">Housing</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Shopping">Shopping</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={newExpense.notes}
                    onChange={(e) => setNewExpense({ ...newExpense, notes: e.target.value })}
                    placeholder="Add notes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={newExpense.tags?.join(", ")}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="groceries, rent, etc."
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsAddExpenseDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddExpense}>Add Expense</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Budget Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            Monthly Summary - {currentMonth} {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Total Income</span>
              <span className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Total Expenses</span>
              <span className="text-2xl font-bold text-red-600">${totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-gray-500">Net Balance</span>
              <span className={`text-2xl font-bold ${netBalance >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${Math.abs(netBalance).toFixed(2)}
                <span className="text-sm ml-1">{netBalance >= 0 ? "(Surplus)" : "(Deficit)"}</span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search transactions..."
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
            {activeTab === "expenses" && (
              <div className="flex space-x-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <span className="truncate">Category</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Tabs defaultValue="expenses" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        <TabsContent value="expenses" className="mt-4">
          <ExpensesList
            expenses={sortedExpenses}
            onEdit={(expense) => {
              setEditingExpense(expense)
              setIsEditExpenseDialogOpen(true)
            }}
            onDelete={handleDeleteExpense}
          />
        </TabsContent>
        <TabsContent value="income" className="mt-4">
          <IncomesList
            incomes={sortedIncomes}
            onEdit={(income) => {
              setEditingIncome(income)
              setIsEditIncomeDialogOpen(true)
            }}
            onDelete={handleDeleteIncome}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Expense Dialog */}
      {editingExpense && (
        <Dialog open={isEditExpenseDialogOpen} onOpenChange={setIsEditExpenseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Expense</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingExpense.amount.toString()}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number.parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingExpense.category}
                  onValueChange={(value) => setEditingExpense({ ...editingExpense, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Housing">Housing</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Entertainment">Entertainment</SelectItem>
                    <SelectItem value="Utilities">Utilities</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingExpense.notes}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
                  placeholder="Add notes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={editingExpense.tags.join(", ")}
                  onChange={(e) =>
                    setEditingExpense({
                      ...editingExpense,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="groceries, rent, etc."
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditExpenseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateExpense}>Update Expense</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Income Dialog */}
      {editingIncome && (
        <Dialog open={isEditIncomeDialogOpen} onOpenChange={setIsEditIncomeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Income</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editingIncome.amount.toString()}
                  onChange={(e) => setEditingIncome({ ...editingIncome, amount: Number.parseFloat(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-source">Source</Label>
                <Select
                  value={editingIncome.source}
                  onValueChange={(value) => setEditingIncome({ ...editingIncome, source: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salary">Salary</SelectItem>
                    <SelectItem value="Freelance">Freelance</SelectItem>
                    <SelectItem value="Investment">Investment</SelectItem>
                    <SelectItem value="Gift">Gift</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editingIncome.date}
                  onChange={(e) => setEditingIncome({ ...editingIncome, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={editingIncome.notes}
                  onChange={(e) => setEditingIncome({ ...editingIncome, notes: e.target.value })}
                  placeholder="Add notes"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditIncomeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateIncome}>Update Income</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface ExpensesListProps {
  expenses: Expense[]
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

function ExpensesList({ expenses, onEdit, onDelete }: ExpensesListProps) {
  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3">
          <ArrowDown className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No expenses found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new expense.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <Card key={expense.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-red-100 p-2">
                  <ArrowDown className="h-4 w-4 text-red-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">${expense.amount.toFixed(2)}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {expense.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{expense.notes}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {expense.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    <span className="text-xs text-gray-500">{new Date(expense.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(expense)} title="Edit">
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(expense.id)} title="Delete">
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

interface IncomesListProps {
  incomes: Income[]
  onEdit: (income: Income) => void
  onDelete: (id: string) => void
}

function IncomesList({ incomes, onEdit, onDelete }: IncomesListProps) {
  if (incomes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-gray-100 p-3">
          <ArrowUp className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mt-4 text-sm font-medium text-gray-900">No income found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by adding a new income.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {incomes.map((income) => (
        <Card key={income.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="rounded-full bg-green-100 p-2">
                  <ArrowUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">${income.amount.toFixed(2)}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {income.source}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{income.notes}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-gray-500">{new Date(income.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="icon" onClick={() => onEdit(income)} title="Edit">
                  <Edit className="h-4 w-4 text-gray-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(income.id)} title="Delete">
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

