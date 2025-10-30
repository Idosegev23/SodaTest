'use client'

export default function KPICards({ kpi }) {
  const cards = [
    {
      title: 'סך הכל לידים',
      value: kpi.totalLeads || 0,
      subtitle: `${kpi.leadsWithConsent || 0} עם הסכמה`,
      color: 'gold',
      icon: '👥'
    },
    {
      title: 'סך הכל יצירות',
      value: kpi.totalArtworks || 0,
      subtitle: `${kpi.avgLikesPerArtwork?.toFixed(1) || 0} לייקים ממוצע`,
      color: 'gold',
      icon: '🎨'
    },
    {
      title: 'סך הכל לייקים',
      value: kpi.totalLikes || 0,
      subtitle: `${kpi.avgLikesPerArtwork?.toFixed(1) || 0} לייקים ליצירה`,
      color: 'gold',
      icon: '❤️'
    },
    {
      title: 'סך הכל צפיות',
      value: kpi.totalPageViews || 0,
      subtitle: `${kpi.totalSessions || 0} sessions ייחודיים`,
      color: 'gold',
      icon: '👁️'
    },
    {
      title: 'יצירות בתור',
      value: kpi.queueStats?.total || 0,
      subtitle: `Pending: ${kpi.queueStats?.pending || 0} | Processing: ${kpi.queueStats?.processing || 0}`,
      color: 'accent',
      icon: '⏳'
    },
    {
      title: 'זוכים שבועיים',
      value: kpi.weeklyWinnersCount || 0,
      subtitle: `שיעור המרה: ${kpi.conversionRate || 0}%`,
      color: 'gold',
      icon: '🏆'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-[#4a6372] bg-opacity-20 rounded-lg p-4 md:p-6 border border-[#8e7845] border-opacity-30 hover:border-opacity-50 transition-all"
        >
          <div className="flex items-start justify-between mb-3 md:mb-4">
            <div className="flex-1">
              <div className="text-[#Bbbbbb] text-xs md:text-sm mb-1">{card.title}</div>
              <div className="text-2xl md:text-3xl font-bold" style={{ color: '#D9d8d6' }}>
                {card.value.toLocaleString('he-IL')}
              </div>
            </div>
            <div className="text-3xl md:text-4xl mr-2">{card.icon}</div>
          </div>
          <div className="text-[#Bbbbbb] text-xs md:text-sm">{card.subtitle}</div>
        </div>
      ))}
    </div>
  )
}

