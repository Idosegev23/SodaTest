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
    <div className="mb-4 md:mb-6 p-3 md:p-4 bg-[#4a6372] bg-opacity-10 rounded-lg border border-[#8e7845] border-opacity-20">
      <div className="flex flex-wrap gap-2 items-center mb-3 md:mb-0">
        <span className="text-[#Bbbbbb] text-xs md:text-sm mr-2">פילטרים מהירים:</span>
        {Object.entries(presets).map(([key, label]) => (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`px-2 md:px-4 py-1 md:py-2 rounded-lg text-xs md:text-sm transition-all ${
              selectedPreset === key
                ? 'bg-[#8e7845] text-[#D9d8d6] border border-[#8e7845]'
                : 'bg-[#4a6372] bg-opacity-20 text-[#Bbbbbb] border border-[#4a6372] border-opacity-30 hover:bg-opacity-30'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className="mt-3 md:mt-4 flex flex-col sm:flex-row gap-3 md:gap-4 items-start sm:items-center">
        <div>
          <label className="text-[#Bbbbbb] text-xs md:text-sm mr-2 block mb-1">תאריך התחלה:</label>
          <input
            type="date"
            value={dateRange.startDate || ''}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value || null })}
            className="px-2 md:px-3 py-1 md:py-2 bg-[#00050e] border border-[#8e7845] border-opacity-30 rounded-lg text-[#D9d8d6] text-xs md:text-sm"
          />
        </div>
        <div>
          <label className="text-[#Bbbbbb] text-xs md:text-sm mr-2 block mb-1">תאריך סיום:</label>
          <input
            type="date"
            value={dateRange.endDate || ''}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value || null })}
            className="px-2 md:px-3 py-1 md:py-2 bg-[#00050e] border border-[#8e7845] border-opacity-30 rounded-lg text-[#D9d8d6] text-xs md:text-sm"
          />
        </div>
      </div>
    </div>
  )
}

