"use client"

import { useEffect } from "react"
import { Sidebar } from "@/components/sidebar"
import { Dashboard } from "@/components/dashboard"
import { Tasks } from "@/components/tasks"
import { Budget } from "@/components/budget"
import { Goals } from "@/components/goals"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { initialData } from "@/lib/initial-data"

export default function Home() {
  const [data, setData] = useLocalStorage("budget-task-app-data", initialData)
  const [activeView, setActiveView] = useLocalStorage("active-view", "dashboard")

  // Initialize data if it doesn't exist
  useEffect(() => {
    if (!data) {
      setData(initialData)
    }
  }, [data, setData])

  // Render the active view
  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard data={data} />
      case "tasks":
        return <Tasks data={data} setData={setData} />
      case "budget":
        return <Budget data={data} setData={setData} />
      case "goals":
        return <Goals data={data} setData={setData} />
      default:
        return <Dashboard data={data} />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1 overflow-auto p-6">{renderView()}</main>
    </div>
  )
}

