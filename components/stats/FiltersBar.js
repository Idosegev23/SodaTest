'use client'

import { useState } from 'react'

export default function FiltersBar({ dateRange, setDateRange }) {
  const [selectedPreset, setSelectedPreset] = useState('all')

  const presets = {
    today: 'היום',
    yesterday: 'אתמול',
    last7: '7 ימים אחרונים',
    last30: '30 ימים אחרונים',
    thisWeek: 'שבוע זה',
    thisMonth: 'חודש זה',
    all: 'הכל'
  }

  const applyPreset = (preset) => {
    const now = new Date()
    let startDate = null
    let endDate = null

    switch (preset) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        endDate = new Date(now.setHours(23, 59, 59, 999))
        break
      case 'yesterday':
        const yesterday = new Date(now)
        yesterday.setDate(yesterday.getDate() - 1)
        startDate = new Date(yesterday.setHours(0, 0, 0, 0))
        endDate = new Date(yesterday.setHours(23, 59, 59, 999))
        break
      case 'last7':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 7)
        endDate = new Date(now)
        break
      case 'last30':
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 30)
        endDate = new Date(now)
        break
      case 'thisWeek':
        const dayOfWeek = now.getDay()
        startDate = new Date(now)
        startDate.setDate(now.getDate() - dayOfWeek)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(now)
        break
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now)
        break
      case 'all':
      default:
        startDate = null
        endDate = null
        break
    }

    setDateRange({
      startDate: startDate ? startDate.toISOString().split('T')[0] : null,
      endDate: endDate ? endDate.toISOString().split('T')[0] : null
    })
    setSelectedPreset(preset)
  }

  return (
    <div className="mb-6 p-4 md:p-6 bg-slate-800 rounded-xl border border-slate-700 shadow-lg">
      <div className="flex flex-wrap gap-2 items-center mb-4">
        <span className="text-slate-300 text-sm font-semibold mr-3">🎯 פילטרים מהירים:</span>
        {Object.entries(presets).map(([key, label]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedPreset === key
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex-1">
          <label className="text-slate-300 text-sm font-medium mr-2 block mb-2">📅 תאריך התחלה:</label>
          <input
            type="date"
            value={dateRange.startDate || ''}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value || null })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <div className="flex-1">
          <label className="text-slate-300 text-sm font-medium mr-2 block mb-2">📅 תאריך סיום:</label>
          <input
            type="date"
            value={dateRange.endDate || ''}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value || null })}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
      </div>
    </div>
  )
}

