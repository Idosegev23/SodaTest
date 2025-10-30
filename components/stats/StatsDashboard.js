'use client'

import { useState, useEffect } from 'react'
import KPICards from './KPICards'
import ChartsSection from './ChartsSection'
import DataTables from './DataTables'
import FiltersBar from './FiltersBar'

export default function StatsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  })

  const fetchStats = async () => {
    try {
      setError(null)
      const params = new URLSearchParams()
      if (dateRange.startDate) params.append('startDate', dateRange.startDate)
      if (dateRange.endDate) params.append('endDate', dateRange.endDate)
      
      const response = await fetch(`/api/stats?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }
      const data = await response.json()
      setStats(data)
      setLastUpdate(new Date())
      setLoading(false)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [dateRange])

  // עדכון אוטומטי כל 30 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [dateRange])

  // עדכון יומי ב-7:00
  useEffect(() => {
    const scheduleDailyUpdate = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(7, 0, 0, 0)
      
      const msUntilUpdate = tomorrow.getTime() - now.getTime()
      
      const timeout = setTimeout(() => {
        fetchStats()
        // הגדרת עדכון יומי קבוע
        const dailyInterval = setInterval(() => {
          fetchStats()
        }, 24 * 60 * 60 * 1000)
        
        return () => clearInterval(dailyInterval)
      }, msUntilUpdate)
      
      return () => clearTimeout(timeout)
    }

    scheduleDailyUpdate()
  }, [])

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center">
        <div className="text-[#D9d8d6] text-xl">טוען נתונים...</div>
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-[#7f2629] text-xl mb-4">שגיאה בטעינת הנתונים</div>
          <div className="text-[#Bbbbbb] mb-4">{error}</div>
          <button
            onClick={fetchStats}
            className="px-6 py-2 bg-[#8e7845] hover:bg-opacity-80 text-[#D9d8d6] rounded-lg transition-all"
          >
            נסה שוב
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#00050e] text-[#D9d8d6] py-4 md:py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ color: '#D9d8d6' }}>
            לוח בקרה - סטטיסטיקות קמפיין
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-[#Bbbbbb] text-xs sm:text-sm">
            <span>
              עדכון אחרון: {lastUpdate ? lastUpdate.toLocaleTimeString('he-IL') : 'טרם עודכן'}
            </span>
            <button
              onClick={fetchStats}
              className="px-4 py-1 bg-[#4a6372] hover:bg-opacity-80 rounded-lg transition-all text-[#D9d8d6] text-sm"
              disabled={loading}
            >
              {loading ? 'מעדכן...' : 'רענון'}
            </button>
          </div>
        </div>

        {/* Filters */}
        <FiltersBar dateRange={dateRange} setDateRange={setDateRange} />

        {/* KPI Cards */}
        {stats?.kpi && <KPICards kpi={stats.kpi} />}

        {/* Charts */}
        {stats && <ChartsSection stats={stats} />}

        {/* Data Tables */}
        {stats?.rawData && <DataTables rawData={stats.rawData} />}
      </div>
    </div>
  )
}

