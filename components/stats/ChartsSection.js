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

const COLORS = {
  gold: '#8e7845',
  accent: '#7f2629',
  chrome: '#4a6372',
  text: '#D9d8d6',
  muted: '#Bbbbbb'
}

const CHART_COLORS = ['#8e7845', '#7f2629', '#4a6372', '#D9d8d6', '#Bbbbbb']

export default function ChartsSection({ stats }) {
  // גרף התפלגות לפי ימים בשבוע
  const DayOfWeekChart = () => (
    <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 md:p-6 border border-[#8e7845] border-opacity-30 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: '#D9d8d6' }}>
        התפלגות פעילות לפי ימים בשבוע
      </h2>
      <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
        <BarChart data={stats.dayOfWeek || []}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chrome} opacity={0.3} />
          <XAxis
            dataKey="day"
            stroke={COLORS.muted}
            style={{ fill: COLORS.muted }}
          />
          <YAxis stroke={COLORS.muted} style={{ fill: COLORS.muted }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#00050e',
              border: `1px solid ${COLORS.gold}`,
              borderRadius: '8px',
              color: COLORS.text
            }}
          />
          <Legend />
          <Bar dataKey="leads" fill={CHART_COLORS[0]} name="לידים" />
          <Bar dataKey="artworks" fill={CHART_COLORS[1]} name="יצירות" />
          <Bar dataKey="likes" fill={CHART_COLORS[2]} name="לייקים" />
          <Bar dataKey="views" fill={CHART_COLORS[3]} name="צפיות" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  // גרף טרנדים יומיים
  const DailyTrendsChart = () => (
    <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 md:p-6 border border-[#8e7845] border-opacity-30 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: '#D9d8d6' }}>
        טרנדים יומיים
      </h2>
      <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
        <LineChart data={stats.dailyTrends?.slice(-30) || []}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chrome} opacity={0.3} />
          <XAxis
            dataKey="date"
            stroke={COLORS.muted}
            style={{ fill: COLORS.muted }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
          />
          <YAxis stroke={COLORS.muted} style={{ fill: COLORS.muted }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#00050e',
              border: `1px solid ${COLORS.gold}`,
              borderRadius: '8px',
              color: COLORS.text
            }}
            labelFormatter={(value) => new Date(value).toLocaleDateString('he-IL')}
          />
          <Legend />
          <Line type="monotone" dataKey="leads" stroke={CHART_COLORS[0]} name="לידים" strokeWidth={2} />
          <Line type="monotone" dataKey="artworks" stroke={CHART_COLORS[1]} name="יצירות" strokeWidth={2} />
          <Line type="monotone" dataKey="likes" stroke={CHART_COLORS[2]} name="לייקים" strokeWidth={2} />
          <Line type="monotone" dataKey="views" stroke={CHART_COLORS[3]} name="צפיות" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )

  // גרף התפלגות לפי שעות
  const HourlyChart = () => (
    <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 md:p-6 border border-[#8e7845] border-opacity-30 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: '#D9d8d6' }}>
        פעילות לפי שעות ביום
      </h2>
      <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
        <AreaChart data={stats.hourly || []}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chrome} opacity={0.3} />
          <XAxis
            dataKey="hour"
            stroke={COLORS.muted}
            style={{ fill: COLORS.muted }}
            label={{ value: 'שעה', position: 'insideBottom', offset: -5, style: { fill: COLORS.muted } }}
          />
          <YAxis stroke={COLORS.muted} style={{ fill: COLORS.muted }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#00050e',
              border: `1px solid ${COLORS.gold}`,
              borderRadius: '8px',
              color: COLORS.text
            }}
          />
          <Legend />
          <Area type="monotone" dataKey="artworks" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.6} name="יצירות" />
          <Area type="monotone" dataKey="leads" stackId="2" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.6} name="לידים" />
          <Area type="monotone" dataKey="views" stackId="3" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.6} name="צפיות" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )

  // גרף התפלגות מכשירים
  const DevicePieChart = () => (
    <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 md:p-6 border border-[#8e7845] border-opacity-30 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: '#D9d8d6' }}>
        התפלגות מכשירים
      </h2>
      <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
        <PieChart>
          <Pie
            data={stats.deviceBreakdown || []}
            cx="50%"
            cy="50%"
            labelLine={false}
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
              backgroundColor: '#00050e',
              border: `1px solid ${COLORS.gold}`,
              borderRadius: '8px',
              color: COLORS.text
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  // גרף מקורות טראפיק
  const ReferrerChart = () => (
    <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 md:p-6 border border-[#8e7845] border-opacity-30 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: '#D9d8d6' }}>
        TOP 10 מקורות טראפיק
      </h2>
      <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
        <BarChart data={stats.referrerBreakdown || []} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chrome} opacity={0.3} />
          <XAxis type="number" stroke={COLORS.muted} style={{ fill: COLORS.muted }} />
          <YAxis
            type="category"
            dataKey="referrer"
            stroke={COLORS.muted}
            style={{ fill: COLORS.muted }}
            width={150}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#00050e',
              border: `1px solid ${COLORS.gold}`,
              borderRadius: '8px',
              color: COLORS.text
            }}
          />
          <Bar dataKey="count" fill={COLORS.gold} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  // גרף TOP יצירות
  const TopArtworksChart = () => (
    <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 md:p-6 border border-[#8e7845] border-opacity-30 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: '#D9d8d6' }}>
        TOP 10 יצירות לפי לייקים
      </h2>
      <ResponsiveContainer width="100%" height={300} className="md:h-[400px]">
        <BarChart data={stats.topArtworks || []}>
          <CartesianGrid strokeDasharray="3 3" stroke={COLORS.chrome} opacity={0.3} />
          <XAxis
            dataKey="user_name"
            stroke={COLORS.muted}
            style={{ fill: COLORS.muted }}
            angle={-45}
            textAnchor="end"
            height={100}
          />
          <YAxis stroke={COLORS.muted} style={{ fill: COLORS.muted }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#00050e',
              border: `1px solid ${COLORS.gold}`,
              borderRadius: '8px',
              color: COLORS.text
            }}
          />
          <Bar dataKey="likes" fill={COLORS.gold} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  return (
    <div className="mb-6 md:mb-8">
      <DayOfWeekChart />
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

