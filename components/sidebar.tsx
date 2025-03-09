"use client"

import { CheckSquare, DollarSign, Goal, Home } from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    { id: "budget", label: "Budget", icon: DollarSign },
    { id: "goals", label: "Goals", icon: Goal },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800">LifeTrack</h1>
        <p className="text-sm text-gray-500">Budget & Task Manager</p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={cn(
                  "flex items-center w-full px-4 py-2 text-sm rounded-md transition-colors",
                  activeView === item.id
                    ? "bg-gray-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Data saved locally</p>
          <p>Last updated: {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  )
}

