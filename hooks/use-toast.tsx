"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Toast } from "@/components/ui/toast"
import { Toaster } from "@/components/ui/toaster"

type ToastProps = {
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<(ToastProps & { id: string })[]>([])

  const toast = useCallback(({ title, description, action, variant = "default" }: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)

    setToasts((prevToasts) => [...prevToasts, { id, title, description, action, variant }])

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 5000)
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }, [])

  const ToastContainer = () => (
    <Toaster>
      {toasts.map((toast) => (
        <Toast key={toast.id} variant={toast.variant}>
          {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
          {toast.description && <Toast.Description>{toast.description}</Toast.Description>}
          {toast.action && <Toast.Action>{toast.action}</Toast.Action>}
          <Toast.Close onClick={() => dismiss(toast.id)} />
        </Toast>
      ))}
    </Toaster>
  )

  return { toast, dismiss, ToastContainer }
}

