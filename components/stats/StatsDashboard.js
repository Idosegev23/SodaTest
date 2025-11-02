'use client'

import React, { useState, useEffect } from 'react'
import KPICards from './KPICards'
import ChartsSection from './ChartsSection'
import DataTables from './DataTables'
import FiltersBar from './FiltersBar'
import AllArtworksModal from '../AllArtworksModal'

export default function StatsDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  })
  const [showAllArtworks, setShowAllArtworks] = useState(false)

  const fetchStats = React.useCallback(async () => {
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
  }, [dateRange.startDate, dateRange.endDate])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  // עדכון אוטומטי כל 30 שניות
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStats()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchStats])

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
    <div className="min-h-screen bg-slate-900 text-slate-100 py-4 md:py-8 px-2 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl">
          <h1 className="text-4xl font-bold mb-3 text-white">
            📊 לוח בקרה - סטטיסטיקות קמפיין
          </h1>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-blue-100">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏱️</span>
              <span className="text-sm">
                עדכון אחרון: {lastUpdate ? lastUpdate.toLocaleTimeString('he-IL') : 'טרם עודכן'}
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchStats}
                className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-all shadow-lg"
                disabled={loading}
              >
                {loading ? '⏳ מעדכן...' : '🔄 רענון'}
              </button>
              <button
                onClick={() => setShowAllArtworks(true)}
                className="px-6 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-all shadow-lg"
              >
                🎨 הצג את כל היצירות
              </button>
            </div>
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

      {/* All Artworks Modal */}
      <AllArtworksModal 
        isOpen={showAllArtworks} 
        onClose={() => setShowAllArtworks(false)} 
      />
    </div>
  )
}

