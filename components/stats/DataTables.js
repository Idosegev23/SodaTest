'use client'

import { useState, useMemo } from 'react'
import Papa from 'papaparse'

const getDayOfWeek = (dateString) => {
  const dayMap = {
    0: 'ראשון',
    1: 'שני',
    2: 'שלישי',
    3: 'רביעי',
    4: 'חמישי',
    5: 'שישי',
    6: 'שבת'
  }
  if (!dateString) return '-'
  const day = new Date(dateString).getDay()
  return dayMap[day] || '-'
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('he-IL')
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('he-IL')
}

const exportToCSV = (data, filename) => {
  const csv = Papa.unparse(data)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function DataTable({ title, data, columns, defaultSortKey }) {
  const [sortKey, setSortKey] = useState(defaultSortKey)
  const [sortDirection, setSortDirection] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAndSortedData = useMemo(() => {
    let filtered = data || []
    
    // חיפוש
    if (searchTerm) {
      filtered = filtered.filter(row => {
        return Object.values(row).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // מיון
    if (sortKey) {
      filtered = [...filtered].sort((a, b) => {
        const aVal = a[sortKey]
        const bVal = b[sortKey]
        
        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1
        
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
        }
        
        const aStr = String(aVal).toLowerCase()
        const bStr = String(bVal).toLowerCase()
        
        if (sortDirection === 'asc') {
          return aStr.localeCompare(bStr, 'he')
        } else {
          return bStr.localeCompare(aStr, 'he')
        }
      })
    }

    return filtered
  }, [data, sortKey, sortDirection, searchTerm])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredAndSortedData.slice(start, start + pageSize)
  }, [filteredAndSortedData, currentPage, pageSize])

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize)

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('desc')
    }
    setCurrentPage(1)
  }

  const handleExport = () => {
    const exportData = filteredAndSortedData.map(row => {
      const exportRow = {}
      columns.forEach(col => {
        exportRow[col.label] = row[col.key] || '-'
      })
      return exportRow
    })
    exportToCSV(exportData, `${title}_${new Date().toISOString().split('T')[0]}.csv`)
  }

  return (
    <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-6 border border-[#8e7845] border-opacity-30 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold" style={{ color: '#D9d8d6' }}>
          {title}
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="חיפוש..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="px-3 py-2 bg-[#00050e] border border-[#8e7845] border-opacity-30 rounded-lg text-[#D9d8d6] placeholder-[#Bbbbbb]"
          />
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#8e7845] hover:bg-opacity-80 text-[#D9d8d6] rounded-lg transition-all"
          >
            ייצוא CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="border-b border-[#8e7845] border-opacity-30">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-[#D9d8d6] font-semibold cursor-pointer hover:bg-[#4a6372] hover:bg-opacity-20"
                  onClick={() => handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {sortKey === col.key && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-[#Bbbbbb]">
                  אין נתונים
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-[#4a6372] border-opacity-20 hover:bg-[#4a6372] hover:bg-opacity-10"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-[#Bbbbbb]">
                      {col.format ? col.format(row[col.key], row) : (row[col.key] || '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <div className="text-[#Bbbbbb] text-sm">
            מציג {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredAndSortedData.length)} מתוך {filteredAndSortedData.length}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-[#4a6372] hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-[#D9d8d6] rounded-lg transition-all"
            >
              קודם
            </button>
            <span className="px-4 py-2 text-[#Bbbbbb]">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-[#4a6372] hover:bg-opacity-80 disabled:opacity-50 disabled:cursor-not-allowed text-[#D9d8d6] rounded-lg transition-all"
            >
              הבא
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function DataTables({ rawData }) {
  if (!rawData) return null

  const leadsColumns = [
    { key: 'name', label: 'שם' },
    { key: 'email', label: 'אימייל' },
    { key: 'phone', label: 'טלפון' },
    { key: 'consent', label: 'הסכמה', format: (val) => val ? '✓' : '✗' },
    { key: 'created_at', label: 'תאריך', format: formatDateTime },
    { key: 'day_of_week', label: 'יום בשבוע', format: (_, row) => getDayOfWeek(row.created_at) }
  ]

  const artworksColumns = [
    { key: 'user_name', label: 'שם משתמש' },
    { key: 'user_email', label: 'אימייל' },
    { key: 'prompt', label: 'פרומפט' },
    { key: 'likes', label: 'לייקים', format: (val) => val || 0 },
    { key: 'created_at', label: 'תאריך', format: formatDateTime },
    { key: 'day_of_week', label: 'יום בשבוע', format: (_, row) => getDayOfWeek(row.created_at) }
  ]

  const queueColumns = [
    { key: 'user_name', label: 'שם' },
    { key: 'user_email', label: 'אימייל' },
    { key: 'status', label: 'סטטוס' },
    { key: 'created_at', label: 'תאריך', format: formatDateTime },
    { key: 'day_of_week', label: 'יום בשבוע', format: (_, row) => getDayOfWeek(row.created_at) }
  ]

  const pageViewsColumns = [
    { key: 'page_path', label: 'דף' },
    { key: 'device_type', label: 'מכשיר' },
    { key: 'country', label: 'מדינה' },
    { key: 'city', label: 'עיר' },
    { key: 'created_at', label: 'תאריך', format: formatDateTime },
    { key: 'day_of_week', label: 'יום בשבוע', format: (_, row) => getDayOfWeek(row.created_at) }
  ]

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6" style={{ color: '#D9d8d6' }}>
        טבלאות נתונים
      </h2>
      
      {rawData.leads && rawData.leads.length > 0 && (
        <DataTable
          title="לידים"
          data={rawData.leads}
          columns={leadsColumns}
          defaultSortKey="created_at"
        />
      )}

      {rawData.artworks && rawData.artworks.length > 0 && (
        <DataTable
          title="יצירות"
          data={rawData.artworks}
          columns={artworksColumns}
          defaultSortKey="created_at"
        />
      )}

      {rawData.queue && rawData.queue.length > 0 && (
        <DataTable
          title="תור עיבוד"
          data={rawData.queue}
          columns={queueColumns}
          defaultSortKey="created_at"
        />
      )}

      {rawData.pageViews && rawData.pageViews.length > 0 && (
        <DataTable
          title="צפיות בדפים"
          data={rawData.pageViews}
          columns={pageViewsColumns}
          defaultSortKey="created_at"
        />
      )}
    </div>
  )
}

