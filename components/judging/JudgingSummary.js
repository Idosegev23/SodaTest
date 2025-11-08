'use client'

import { useState, useEffect } from 'react'

export default function JudgingSummary() {
  const [summary, setSummary] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    loadSummary()
  }, [])
  
  const loadSummary = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/judge-selections/summary')
      
      if (!response.ok) {
        throw new Error('Failed to fetch summary')
      }
      
      const data = await response.json()
      setSummary(data.summary || [])
      setStats(data.stats || {})
    } catch (err) {
      console.error('Error loading summary:', err)
      setError('שגיאה בטעינת הנתונים')
    } finally {
      setIsLoading(false)
    }
  }
  
  const exportToCSV = () => {
    if (summary.length === 0) return
    
    // CSV headers
    const headers = ['מקום', 'שם יוצר', 'פרומפט', 'לייקים', 'בחירות שופטים', 'אחוז', 'שופטים']
    
    // CSV rows
    const rows = summary.map((item, index) => [
      index + 1,
      item.user_name || '',
      `"${(item.prompt || '').replace(/"/g, '""')}"`, // Escape quotes
      item.likes || 0,
      item.judge_selections || 0,
      `${item.selection_percentage || 0}%`,
      `"${(item.judges || []).join(', ')}"`
    ])
    
    // Combine
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `judge_selections_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center">
        <div className="text-[#D9d8d6] text-xl">טוען סיכום...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#7f2629] text-xl mb-4">{error}</div>
          <button
            onClick={loadSummary}
            className="px-6 py-3 bg-[#8e7845] hover:bg-[#8e7845] bg-opacity-80 hover:bg-opacity-100 text-[#D9d8d6] rounded-lg transition-all duration-200"
          >
            נסה שוב
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-[#00050e] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#D9d8d6] mb-4">
            סיכום בחירות השופטים
          </h1>
          
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 border border-[#8e7845] border-opacity-30">
                <div className="text-[#Bbbbbb] text-sm mb-1">סה״כ בחירות</div>
                <div className="text-[#D9d8d6] text-3xl font-bold">{stats.total_selections}</div>
              </div>
              
              <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 border border-[#8e7845] border-opacity-30">
                <div className="text-[#Bbbbbb] text-sm mb-1">יצירות ייחודיות</div>
                <div className="text-[#D9d8d6] text-3xl font-bold">{stats.unique_artworks}</div>
              </div>
              
              <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 border border-[#8e7845] border-opacity-30">
                <div className="text-[#Bbbbbb] text-sm mb-1">שופטים פעילים</div>
                <div className="text-[#D9d8d6] text-3xl font-bold">{stats.active_judges}</div>
              </div>
              
              <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 border border-[#8e7845] border-opacity-30">
                <div className="text-[#Bbbbbb] text-sm mb-1">שופטים</div>
                <div className="text-[#D9d8d6] text-sm">
                  {stats.judges && stats.judges.join(', ')}
                </div>
              </div>
            </div>
          )}
          
          {/* Export button */}
          <button
            onClick={exportToCSV}
            disabled={summary.length === 0}
            className="px-6 py-3 bg-[#8e7845] hover:bg-[#8e7845] bg-opacity-80 hover:bg-opacity-100 text-[#D9d8d6] rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ייצא ל-CSV
          </button>
        </div>
        
        {/* Table */}
        {summary.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[#Bbbbbb] text-xl">
              אין בחירות עדיין
            </div>
          </div>
        ) : (
          <div className="bg-[#4a6372] bg-opacity-20 rounded-lg border border-[#8e7845] border-opacity-30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#8e7845] bg-opacity-20">
                  <tr>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">מקום</th>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">תמונה</th>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">שם יוצר</th>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">פרומפט</th>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">לייקים</th>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">בחירות</th>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">%</th>
                    <th className="px-4 py-3 text-right text-[#D9d8d6] font-semibold">שופטים</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.map((item, index) => (
                    <tr 
                      key={item.artwork_id}
                      className="border-t border-[#8e7845] border-opacity-20 hover:bg-[#8e7845] hover:bg-opacity-10 transition-colors"
                    >
                      <td className="px-4 py-3 text-[#D9d8d6] font-bold">
                        {index === 0 && '🥇'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && (index + 1)}
                      </td>
                      <td className="px-4 py-3">
                        <img
                          src={item.image_url}
                          alt={item.user_name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-[#D9d8d6]">{item.user_name}</td>
                      <td className="px-4 py-3 text-[#Bbbbbb] max-w-xs truncate">
                        {item.prompt}
                      </td>
                      <td className="px-4 py-3 text-[#8e7845]">
                        ❤️ {item.likes}
                      </td>
                      <td className="px-4 py-3 text-[#D9d8d6] font-bold text-lg">
                        {item.judge_selections}
                      </td>
                      <td className="px-4 py-3 text-[#8e7845]">
                        {item.selection_percentage}%
                      </td>
                      <td className="px-4 py-3 text-[#Bbbbbb] text-sm">
                        {item.judges && item.judges.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

