'use client'

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

// פלטת צבעים מקצועית ונעימה לעיניים
const COLORS = {
  primary: '#3b82f6',    // כחול
  success: '#10b981',    // ירוק
  warning: '#f59e0b',    // כתום
  purple: '#8b5cf6',     // סגול
  pink: '#ec4899',       // ורוד
  cyan: '#06b6d4',       // ציאן
  text: '#f1f5f9',       // טקסט בהיר
  muted: '#94a3b8',      // טקסט משני
  bg: '#0f172a',         // רקע כהה
  bgSecondary: '#1e293b' // רקע משני
}

const CHART_COLORS = [
  '#3b82f6', // כחול
  '#10b981', // ירוק
  '#f59e0b', // כתום
  '#8b5cf6', // סגול
  '#ec4899', // ורוד
  '#06b6d4'  // ציאן
]

export default function ChartsSection({ stats }) {
  // גרף פעילות יומית
  const DailyActivityChart = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-slate-100">
        📅 פעילות יומית לפי תאריכים
      </h2>
      <div className="text-sm text-slate-400 mb-4">
        מספר הצפיות, לידים ויצירות בכל יום
      </div>
      <div style={{ width: '100%', height: 450 }}>
        <ResponsiveContainer>
          <BarChart data={stats.dailyActivity || []} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey="displayDate"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #3b82f6',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
              }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-slate-800 border border-blue-500 rounded-lg p-4 shadow-2xl">
                      <p className="text-slate-100 font-bold mb-3 text-lg border-b border-slate-700 pb-2">
                        {data.displayDate} - {data.dayName}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-blue-400">📊 צפיות:</span>
                          <span className="text-slate-100 font-semibold">{data.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-green-400">👥 לידים:</span>
                          <span className="text-slate-100 font-semibold">{data.leads.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-orange-400">🎨 יצירות:</span>
                          <span className="text-slate-100 font-semibold">{data.artworks.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-purple-400">❤️ לייקים:</span>
                          <span className="text-slate-100 font-semibold">{data.likes.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Bar dataKey="views" fill={COLORS.primary} name="צפיות" radius={[8, 8, 0, 0]} />
            <Bar dataKey="leads" fill={COLORS.success} name="לידים" radius={[8, 8, 0, 0]} />
            <Bar dataKey="artworks" fill={COLORS.warning} name="יצירות" radius={[8, 8, 0, 0]} />
            <Bar dataKey="likes" fill={COLORS.purple} name="לייקים" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף טרנדים יומיים
  const DailyTrendsChart = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-6">
      <h2 className="text-xl font-bold mb-3 text-slate-100">
        📈 טרנד ארוך טווח
      </h2>
      <div className="text-sm text-slate-400 mb-4">
        מגמות לאורך זמן
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <LineChart data={stats.dailyTrends?.slice(-30) || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #3b82f6',
                borderRadius: '12px',
                padding: '12px'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString('he-IL')}
            />
            <Legend />
            <Line type="monotone" dataKey="views" stroke={COLORS.primary} name="צפיות" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="leads" stroke={COLORS.success} name="לידים" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="artworks" stroke={COLORS.warning} name="יצירות" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="likes" stroke={COLORS.purple} name="לייקים" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף התפלגות לפי שעות
  const HourlyChart = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-6">
      <h2 className="text-xl font-bold mb-3 text-slate-100">
        ⏰ פעילות לפי שעות
      </h2>
      <div className="text-sm text-slate-400 mb-4">
        באיזו שעה הכי פעילים?
      </div>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <AreaChart data={stats.hourly || []} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
            <XAxis
              dataKey="hour"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8' }}
              label={{ value: 'שעה', position: 'insideBottom', offset: -10, fill: '#94a3b8' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #3b82f6',
                borderRadius: '12px',
                padding: '12px'
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="views" stackId="1" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.7} name="צפיות" />
            <Area type="monotone" dataKey="leads" stackId="1" stroke={COLORS.success} fill={COLORS.success} fillOpacity={0.7} name="לידים" />
            <Area type="monotone" dataKey="artworks" stackId="1" stroke={COLORS.warning} fill={COLORS.warning} fillOpacity={0.7} name="יצירות" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף התפלגות מכשירים
  const DevicePieChart = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-6">
      <h2 className="text-xl font-bold mb-3 text-slate-100">
        📱 התפלגות מכשירים
      </h2>
      <div className="text-sm text-slate-400 mb-4">
        מה המכשירים המועדפים?
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={stats.deviceBreakdown || []}
              cx="50%"
              cy="50%"
              labelLine={true}
              label={({ device, count, percent }) => `${device}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {(stats.deviceBreakdown || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #8e7845',
                borderRadius: '8px',
                color: '#D9d8d6'
              }}
            />
            <Legend wrapperStyle={{ color: '#D9d8d6' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף מקורות טראפיק
  const ReferrerChart = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-6">
      <h2 className="text-xl font-bold mb-3 text-slate-100">
        🔗 מקורות טראפיק מובילים
      </h2>
      <div className="text-sm text-slate-400 mb-4">
        מהיכן מגיעים המבקרים?
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={stats.referrerBreakdown || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#4a6372" opacity={0.3} />
            <XAxis 
              type="number" 
              stroke="#Bbbbbb" 
              tick={{ fill: '#Bbbbbb' }}
            />
            <YAxis
              type="category"
              dataKey="referrer"
              stroke="#Bbbbbb"
              tick={{ fill: '#Bbbbbb' }}
              width={150}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #8e7845',
                borderRadius: '8px',
                color: '#D9d8d6'
              }}
              labelStyle={{ color: '#D9d8d6' }}
            />
            <Bar dataKey="count" fill="#8e7845" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף TOP יצירות
  const TopArtworksChart = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-xl border border-slate-700 mb-6">
      <h2 className="text-xl font-bold mb-3 text-slate-100">
        🏆 יצירות מובילות
      </h2>
      <div className="text-sm text-slate-400 mb-4">
        היצירות עם הכי הרבה לייקים
      </div>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={stats.topArtworks || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a6372" opacity={0.3} />
            <XAxis
              dataKey="user_name"
              stroke="#Bbbbbb"
              tick={{ fill: '#Bbbbbb', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis 
              stroke="#Bbbbbb" 
              tick={{ fill: '#Bbbbbb' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #8e7845',
                borderRadius: '8px',
                color: '#D9d8d6'
              }}
              labelStyle={{ color: '#D9d8d6' }}
            />
            <Bar dataKey="likes" fill="#8e7845" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  return (
    <div className="mb-6 md:mb-8">
      <DailyActivityChart />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <DailyTrendsChart />
        <HourlyChart />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
        <DevicePieChart />
        <ReferrerChart />
      </div>
      <TopArtworksChart />
    </div>
  )
}

