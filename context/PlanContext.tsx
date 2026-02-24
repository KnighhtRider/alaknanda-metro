'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

export interface PlanItem {
    stationId: number
    stationName: string
    inventoryId: number
    inventoryName: string
    price: number | null
}

interface PlanContextType {
    selectedPlans: PlanItem[]
    addToPlan: (item: PlanItem) => void
    removeFromPlan: (stationId: number, inventoryId: number) => void
    clearPlan: () => void
    isInPlan: (stationId: number, inventoryId: number) => boolean
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

const STORAGE_KEY = 'alaknanda_selected_plans'

export function PlanProvider({ children }: { children: React.ReactNode }) {
    const [selectedPlans, setSelectedPlans] = useState<PlanItem[]>([])
    const [hydrated, setHydrated] = useState(false)

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                setSelectedPlans(JSON.parse(stored))
            }
        } catch {
            // ignore parse errors
        }
        setHydrated(true)
    }, [])

    // Persist to localStorage on every change (after hydration)
    useEffect(() => {
        if (hydrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlans))
        }
    }, [selectedPlans, hydrated])

    const addToPlan = useCallback((item: PlanItem) => {
        setSelectedPlans(prev => {
            if (prev.some(p => p.stationId === item.stationId && p.inventoryId === item.inventoryId)) return prev
            return [...prev, item]
        })
    }, [])

    const removeFromPlan = useCallback((stationId: number, inventoryId: number) => {
        setSelectedPlans(prev => prev.filter(p => !(p.stationId === stationId && p.inventoryId === inventoryId)))
    }, [])

    const clearPlan = useCallback(() => {
        setSelectedPlans([])
    }, [])

    const isInPlan = useCallback((stationId: number, inventoryId: number) => {
        return selectedPlans.some(p => p.stationId === stationId && p.inventoryId === inventoryId)
    }, [selectedPlans])

    return (
        <PlanContext.Provider value={{ selectedPlans, addToPlan, removeFromPlan, clearPlan, isInPlan }}>
            {children}
        </PlanContext.Provider>
    )
}

export function usePlan() {
    const ctx = useContext(PlanContext)
    if (!ctx) throw new Error('usePlan must be used within PlanProvider')
    return ctx
}
