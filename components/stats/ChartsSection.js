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
  // גרף פעילות יומית (14 ימים אחרונים)
  const DailyActivityChart = () => (
    <div className="bg-[#1a1f2e] rounded-lg p-4 md:p-6 border-2 border-[#8e7845] border-opacity-50 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#D9d8d6]">
        📅 פעילות יומית - 14 ימים אחרונים
      </h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <BarChart data={stats.dailyActivity || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a6372" opacity={0.3} />
            <XAxis
              dataKey="displayDate"
              stroke="#Bbbbbb"
              tick={{ fill: '#Bbbbbb', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-[#1a1f2e] border border-[#8e7845] rounded-lg p-3">
                      <p className="text-[#D9d8d6] font-bold mb-2">{label} ({data.dayName})</p>
                      <p className="text-[#8e7845]">לידים: {data.leads}</p>
                      <p className="text-[#7f2629]">יצירות: {data.artworks}</p>
                      <p className="text-[#4a6372]">לייקים: {data.likes}</p>
                      <p className="text-[#D9d8d6]">צפיות: {data.views}</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend 
              wrapperStyle={{ color: '#D9d8d6' }}
              iconType="square"
            />
            <Bar dataKey="leads" fill="#8e7845" name="לידים" />
            <Bar dataKey="artworks" fill="#7f2629" name="יצירות" />
            <Bar dataKey="likes" fill="#4a6372" name="לייקים" />
            <Bar dataKey="views" fill="#D9d8d6" name="צפיות" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף טרנדים יומיים
  const DailyTrendsChart = () => (
    <div className="bg-[#1a1f2e] rounded-lg p-4 md:p-6 border-2 border-[#8e7845] border-opacity-50 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#D9d8d6]">
        📈 טרנדים כוללים (30 ימים)
      </h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart data={stats.dailyTrends?.slice(-30) || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a6372" opacity={0.3} />
            <XAxis
              dataKey="date"
              stroke="#Bbbbbb"
              tick={{ fill: '#Bbbbbb', fontSize: 12 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })}
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
              labelFormatter={(value) => new Date(value).toLocaleDateString('he-IL')}
              labelStyle={{ color: '#D9d8d6' }}
            />
            <Legend wrapperStyle={{ color: '#D9d8d6' }} />
            <Line type="monotone" dataKey="leads" stroke="#8e7845" name="לידים" strokeWidth={2} />
            <Line type="monotone" dataKey="artworks" stroke="#7f2629" name="יצירות" strokeWidth={2} />
            <Line type="monotone" dataKey="likes" stroke="#4a6372" name="לייקים" strokeWidth={2} />
            <Line type="monotone" dataKey="views" stroke="#D9d8d6" name="צפיות" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף התפלגות לפי שעות
  const HourlyChart = () => (
    <div className="bg-[#1a1f2e] rounded-lg p-4 md:p-6 border-2 border-[#8e7845] border-opacity-50 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#D9d8d6]">
        ⏰ פעילות לפי שעות ביום
      </h2>
      <div style={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <AreaChart data={stats.hourly || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a6372" opacity={0.3} />
            <XAxis
              dataKey="hour"
              stroke="#Bbbbbb"
              tick={{ fill: '#Bbbbbb' }}
              label={{ value: 'שעה', position: 'insideBottom', offset: -5, fill: '#Bbbbbb' }}
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
            <Legend wrapperStyle={{ color: '#D9d8d6' }} />
            <Area type="monotone" dataKey="artworks" stackId="1" stroke="#8e7845" fill="#8e7845" fillOpacity={0.6} name="יצירות" />
            <Area type="monotone" dataKey="leads" stackId="2" stroke="#7f2629" fill="#7f2629" fillOpacity={0.6} name="לידים" />
            <Area type="monotone" dataKey="views" stackId="3" stroke="#4a6372" fill="#4a6372" fillOpacity={0.6} name="צפיות" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  // גרף התפלגות מכשירים
  const DevicePieChart = () => (
    <div className="bg-[#1a1f2e] rounded-lg p-4 md:p-6 border-2 border-[#8e7845] border-opacity-50 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#D9d8d6]">
        📱 התפלגות מכשירים
      </h2>
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
    <div className="bg-[#1a1f2e] rounded-lg p-4 md:p-6 border-2 border-[#8e7845] border-opacity-50 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#D9d8d6]">
        🔗 TOP 10 מקורות טראפיק
      </h2>
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
    <div className="bg-[#1a1f2e] rounded-lg p-4 md:p-6 border-2 border-[#8e7845] border-opacity-50 mb-4 md:mb-6">
      <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-[#D9d8d6]">
        🏆 TOP 10 יצירות לפי לייקים
      </h2>
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

