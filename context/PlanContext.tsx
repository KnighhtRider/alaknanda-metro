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
    isPlanOpen: boolean
    setIsPlanOpen: (open: boolean) => void
    userDetails: { name: string, company: string, email: string, phone: string }
    setUserDetails: (details: { name: string, company: string, email: string, phone: string }) => void
}

const PlanContext = createContext<PlanContextType | undefined>(undefined)

const STORAGE_KEY = 'alaknanda_selected_plans'

export function PlanProvider({ children }: { children: React.ReactNode }) {
    const [selectedPlans, setSelectedPlans] = useState<PlanItem[]>([])
    const [hydrated, setHydrated] = useState(false)
    const [isPlanOpen, setIsPlanOpen] = useState(false)
    const [userDetails, setUserDetails] = useState({ name: '', company: '', email: '', phone: '' })

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                setSelectedPlans(parsed.plans || [])
                if (parsed.user) {
                    setUserDetails(parsed.user)
                }
            }
        } catch {
            // ignore parse errors
        }
        setHydrated(true)
    }, [])

    // Persist to localStorage on every change (after hydration)
    useEffect(() => {
        if (hydrated) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ plans: selectedPlans, user: userDetails }))
        }
    }, [selectedPlans, userDetails, hydrated])

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
        <PlanContext.Provider value={{
            selectedPlans,
            addToPlan,
            removeFromPlan,
            clearPlan,
            isInPlan,
            isPlanOpen,
            setIsPlanOpen,
            userDetails,
            setUserDetails
        }}>
            {children}
        </PlanContext.Provider>
    )
}

export function usePlan() {
    const ctx = useContext(PlanContext)
    if (!ctx) throw new Error('usePlan must be used within PlanProvider')
    return ctx
}
