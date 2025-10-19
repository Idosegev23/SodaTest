import nodemailer from 'nodemailer'

// יצירת transporter לשליחת מיילים
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
}

// המרת נתונים ל-CSV
export function convertToCSV(data, headers) {
  if (!data || data.length === 0) {
    return headers.join(',') + '\n'
  }

  // שורת כותרות
  const headerRow = headers.join(',')
  
  // שורות נתונים
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || ''
      // Escape quotes and wrap in quotes if contains comma
      if (value.toString().includes(',') || value.toString().includes('"') || value.toString().includes('\n')) {
        return `"${value.toString().replace(/"/g, '""')}"`
      }
      return value
    }).join(',')
  }).join('\n')

  return `${headerRow}\n${dataRows}`
}

// שליחת דוח לידים יומי
export async function sendDailyLeadsReport(report) {
  try {
    const transporter = createTransporter()

    // יצירת CSV
    const csvHeaders = ['תאריך יצירה', 'שם', 'מייל', 'טלפון', 'הסכמה']
    const csvData = report.leads.map(lead => ({
      'תאריך יצירה': new Date(lead.created_at).toLocaleString('he-IL'),
      'שם': lead.name,
      'מייל': lead.email,
      'טלפון': lead.phone || 'לא צוין',
      'הסכמה': lead.consent ? 'כן' : 'לא'
    }))

    const csvContent = convertToCSV(csvData, csvHeaders)
    const csvBuffer = Buffer.from('\uFEFF' + csvContent, 'utf-8') // BOM for Excel Hebrew support

    // תוכן המייל - דשבורד מעוצב מקצועי
    const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Rubik, Arial, sans-serif;
      background-color: #0f1729;
      margin: 0;
      padding: 20px;
      color: #333;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    }
    .header {
      background: linear-gradient(135deg, #0f1729 0%, #1a2742 50%, #12294a 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
      position: relative;
    }
    .header::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #d4af37 0%, #f4e285 50%, #d4af37 100%);
    }
    .header h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 700;
      color: #d4af37;
    }
    .header .date {
      font-size: 16px;
      opacity: 0.9;
      margin: 0;
      color: #fff;
    }
    .content {
      padding: 30px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin: 30px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #12294a 0%, #1e3a5f 100%);
      color: white;
      padding: 24px 20px;
      border-radius: 12px;
      text-align: center;
      border: 1px solid rgba(212, 175, 55, 0.2);
      transition: transform 0.2s;
    }
    .stat-card.gold {
      background: linear-gradient(135deg, #d4af37 0%, #f4e285 100%);
      color: #0f1729;
    }
    .stat-number {
      font-size: 42px;
      font-weight: bold;
      margin: 12px 0 8px 0;
      line-height: 1;
    }
    .stat-label {
      font-size: 13px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 500;
    }
    .section {
      margin: 40px 0;
      background: #f8f9fa;
      padding: 24px;
      border-radius: 12px;
      border-right: 4px solid #d4af37;
    }
    .section-title {
      color: #0f1729;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 20px 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-title::before {
      content: '';
      width: 4px;
      height: 24px;
      background: #d4af37;
      display: inline-block;
    }
    .top-artworks {
      display: grid;
      gap: 16px;
    }
    .artwork-item {
      background: white;
      padding: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 1px solid #e9ecef;
    }
    .artwork-rank {
      background: #d4af37;
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 18px;
      flex-shrink: 0;
    }
    .artwork-details {
      flex: 1;
    }
    .artwork-user {
      font-weight: 600;
      color: #0f1729;
      margin-bottom: 4px;
    }
    .artwork-prompt {
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }
    .artwork-likes {
      background: #fff3cd;
      padding: 6px 12px;
      border-radius: 20px;
      font-weight: 600;
      color: #856404;
      white-space: nowrap;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 8px;
      overflow: hidden;
    }
    th, td {
      padding: 14px 16px;
      text-align: right;
      border-bottom: 1px solid #e9ecef;
    }
    th {
      background: #0f1729;
      font-weight: 600;
      color: #d4af37;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      font-size: 15px;
    }
    tr:last-child td {
      border-bottom: none;
    }
    tr:hover {
      background: #f8f9fa;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .badge-success {
      background: #d4edda;
      color: #155724;
    }
    .badge-info {
      background: #d1ecf1;
      color: #0c5460;
    }
    .badge-warning {
      background: #fff3cd;
      color: #856404;
    }
    .footer {
      text-align: center;
      padding: 30px;
      background: #f8f9fa;
      border-top: 3px solid #d4af37;
      color: #6c757d;
    }
    .footer p {
      margin: 6px 0;
      font-size: 13px;
    }
    .footer strong {
      color: #0f1729;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 דשבורד יומי - ®ensō Gallery</h1>
      <p class="date">📅 ${new Date(report.date).toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>

    <div class="content">
      <!-- זוכה שבועי - רק ביום ראשון -->
      ${report.weekly_winner ? `
      <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e285 100%); padding: 30px; border-radius: 12px; margin-bottom: 30px; text-align: center; color: #0f1729;">
        <h2 style="margin: 0 0 10px 0; font-size: 28px; font-weight: bold;">🏆 זוכה השבוע!</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; opacity: 0.9;">${report.weekly_winner.week_start} - ${report.weekly_winner.week_end}</p>
        <div style="background: white; padding: 20px; border-radius: 8px; margin-top: 16px;">
          <h3 style="margin: 0 0 8px 0; font-size: 22px; color: #d4af37;">${report.weekly_winner.user_name || 'משתמש אנונימי'}</h3>
          <p style="margin: 0 0 12px 0; color: #666; font-size: 14px;">${report.weekly_winner.user_email}</p>
          ${report.weekly_winner.artwork ? `
            <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6;"><strong>היצירה הזוכה:</strong><br>${report.weekly_winner.artwork.prompt}</p>
            <p style="margin: 12px 0 0 0; font-size: 18px;"><strong>❤️ ${report.weekly_winner.artwork.likes} לייקים</strong></p>
          ` : ''}
          <p style="margin: 16px 0 0 0; font-size: 16px; font-weight: 600; color: #d4af37;">🎁 זכה בסדנת קוקטיילים זוגית!</p>
        </div>
      </div>
      ` : ''}

      <!-- סטטיסטיקות יום אתמול -->
      <h2 style="color: #0f1729; margin: 0 0 16px 0; font-size: 18px;">📈 פעילות אתמול</h2>
      <div class="stats-grid">
        <div class="stat-card gold">
          <div class="stat-label">👥 לידים חדשים</div>
          <div class="stat-number">${report.summary.total_leads}</div>
          <div style="font-size: 13px; margin-top: 8px; opacity: 0.9;">
            ${parseFloat(report.summary.leads_change) >= 0 ? '📈' : '📉'} ${report.summary.leads_change}% מאתמול שלשום
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">✅ הסכמה לשיווק</div>
          <div class="stat-number">${report.summary.leads_with_consent}</div>
          <div style="font-size: 13px; margin-top: 8px; opacity: 0.9;">
            ${report.summary.total_leads > 0 ? Math.round((report.summary.leads_with_consent / report.summary.total_leads) * 100) : 0}% מהלידים
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">🎨 יצירות שנוצרו</div>
          <div class="stat-number">${report.summary.total_artworks_created}</div>
          <div style="font-size: 13px; margin-top: 8px; opacity: 0.9;">
            ${parseFloat(report.summary.artworks_change) >= 0 ? '📈' : '📉'} ${report.summary.artworks_change}% מאתמול שלשום
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-label">❤️ לייקים</div>
          <div class="stat-number">${report.summary.total_likes}</div>
          <div style="font-size: 13px; margin-top: 8px; opacity: 0.9;">
            ממוצע ${report.yesterday_artworks.average_likes} ליצירה
          </div>
        </div>
      </div>

      <!-- TOP 5 יצירות - רק אם יש יצירות עם לייקים -->
      ${report.yesterday_artworks.top_artworks && report.yesterday_artworks.top_artworks.length > 0 ? `
      <div class="section">
        <div class="section-title">🏆 TOP 5 יצירות עם הכי הרבה לייקים מאתמול</div>
        <div class="top-artworks">
          ${report.yesterday_artworks.top_artworks.map((artwork, idx) => `
            <div class="artwork-item">
              <div class="artwork-rank">${idx + 1}</div>
              <div class="artwork-details">
                <div class="artwork-user">${artwork.user_name || 'אנונימי'}</div>
                <div class="artwork-prompt">${artwork.prompt || 'אין תיאור'}</div>
              </div>
              <div class="artwork-likes">❤️ ${artwork.likes}</div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : `
      <div class="section">
        <div class="section-title">🎨 יצירות מאתמול</div>
        <p style="text-align: center; color: #666; padding: 20px;">
          אתמול נוצרו ${report.yesterday_artworks.total} יצירות, אך עדיין לא קיבלו לייקים.
        </p>
      </div>
      `}

      <!-- סטטיסטיקות כלליות -->
      <div class="section">
        <div class="section-title">📊 סטטיסטיקות כלליות - מתחילת הקמפיין</div>
        <table>
          <thead>
            <tr>
              <th>מדד</th>
              <th style="text-align: center;">ערך</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>👥 סה״כ לידים</strong></td>
              <td style="text-align: center;"><span class="badge badge-success">${report.overall_stats.total_leads_all_time}</span></td>
            </tr>
            <tr>
              <td><strong>🎨 סה״כ יצירות</strong></td>
              <td style="text-align: center;"><span class="badge badge-info">${report.overall_stats.total_artworks_all_time}</span></td>
            </tr>
            <tr>
              <td><strong>❤️ סה״כ לייקים</strong></td>
              <td style="text-align: center;"><span class="badge badge-warning">${report.overall_stats.total_likes_all_time}</span></td>
            </tr>
            <tr>
              <td><strong>📊 ממוצע לייקים ליצירה</strong></td>
              <td style="text-align: center;"><strong>${report.overall_stats.average_likes_all_time}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- משתמשים פעילים -->
      ${report.user_insights && report.user_insights.most_active_user ? `
      <div class="section">
        <div class="section-title">👥 המשתמשים הכי פעילים - מתחילת הקמפיין</div>
        
        <!-- משתמש הכי פעיל -->
        <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e285 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; color: #0f1729;">
          <div style="display: flex; align-items: center; gap: 16px;">
            <div style="background: white; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; flex-shrink: 0;">
              👑
            </div>
            <div style="flex: 1;">
              <div style="font-size: 18px; font-weight: bold; margin-bottom: 4px;">
                ${report.user_insights.most_active_user.name}
              </div>
              <div style="font-size: 13px; opacity: 0.9;">
                ${report.user_insights.most_active_user.email}
              </div>
            </div>
            <div style="text-align: left;">
              <div style="font-size: 32px; font-weight: bold; line-height: 1;">
                ${report.user_insights.most_active_user.artworks_count}
              </div>
              <div style="font-size: 12px; opacity: 0.9;">יצירות</div>
            </div>
            <div style="text-align: left;">
              <div style="font-size: 32px; font-weight: bold; line-height: 1;">
                ${report.user_insights.most_active_user.total_likes}
              </div>
              <div style="font-size: 12px; opacity: 0.9;">לייקים</div>
            </div>
          </div>
        </div>

        <!-- TOP 5 משתמשים -->
        ${report.user_insights.top_5_users && report.user_insights.top_5_users.length > 1 ? `
        <table>
          <thead>
            <tr>
              <th>מקום</th>
              <th>משתמש</th>
              <th style="text-align: center;">יצירות</th>
              <th style="text-align: center;">לייקים</th>
            </tr>
          </thead>
          <tbody>
            ${report.user_insights.top_5_users.map((user, idx) => `
              <tr>
                <td><strong>${idx + 1}</strong></td>
                <td>
                  <div style="font-weight: 600;">${user.name}</div>
                  <div style="font-size: 12px; color: #666;">${user.email}</div>
                </td>
                <td style="text-align: center;"><span class="badge badge-info">${user.artworks_count}</span></td>
                <td style="text-align: center;"><span class="badge badge-warning">${user.total_likes}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ` : ''}
        
        <p style="margin: 16px 0 0 0; text-align: center; color: #666; font-size: 14px;">
          📊 סה״כ <strong>${report.user_insights.total_unique_users}</strong> משתמשים ייחודיים השתתפו בגלריה
        </p>
      </div>
      ` : ''}

      <!-- תובנות פעילות -->
      ${report.activity_insights && report.activity_insights.peak_hour ? `
      <div class="section">
        <div class="section-title">⏰ תובנות פעילות</div>
        <div style="background: white; padding: 16px; border-radius: 8px; border: 2px solid #d4af37;">
          <div style="text-align: center;">
            <div style="font-size: 16px; color: #666; margin-bottom: 8px;">שעת השיא של אתמול</div>
            <div style="font-size: 28px; font-weight: bold; color: #d4af37;">
              ⏰ ${report.activity_insights.peak_hour}
            </div>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- סטטיסטיקות תור -->
      <div class="section">
        <div class="section-title">⚙️ מצב התור</div>
        <table>
          <thead>
            <tr>
              <th>סטטוס</th>
              <th style="text-align: center;">כמות</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>⏳ ממתין</td>
              <td style="text-align: center;"><strong>${report.queue_stats.pending}</strong></td>
            </tr>
            <tr>
              <td>⚡ בעיבוד</td>
              <td style="text-align: center;"><strong>${report.queue_stats.processing}</strong></td>
            </tr>
            <tr>
              <td>✅ הושלם</td>
              <td style="text-align: center;"><strong>${report.queue_stats.done}</strong></td>
            </tr>
            <tr>
              <td>🚫 חסום</td>
              <td style="text-align: center;"><strong>${report.queue_stats.blocked}</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- רשימת לידים -->
      <div class="section">
        <div class="section-title">📋 רשימת לידים מאתמול</div>
        <p style="margin: 0; line-height: 1.6;">
          <strong style="color: #d4af37;">${report.summary.total_leads} לידים חדשים</strong> נרשמו אתמול<br>
          📎 <strong>קובץ CSV מפורט מצורף</strong> עם כל הפרטים: שם, מייל, טלפון, הסכמה ושעת הרשמה<br>
          ✅ <strong>${report.summary.leads_with_consent} לידים</strong> נתנו הסכמה לשיווק (${report.summary.total_leads > 0 ? Math.round((report.summary.leads_with_consent / report.summary.total_leads) * 100) : 0}%)
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>®ensō Gallery</strong> - SodaStream Campaign</p>
      <p>🤖 דוח נוצר אוטומטית ב-${new Date().toLocaleString('he-IL', { dateStyle: 'long', timeStyle: 'short' })}</p>
      <p style="color: #999; font-size: 11px; margin-top: 12px;">דוח זה נוצר באופן אוטומטי על ידי המערכת ונשלח מדי יום ב-17:00</p>
    </div>
  </div>
</body>
</html>
    `

    // הכנת רשימת נמענים
    const recipients = [process.env.EMAIL_TO]
    if (process.env.EMAIL_TO_2) {
      recipients.push(process.env.EMAIL_TO_2)
    }

    // שליחת המייל
    const info = await transporter.sendMail({
      from: `"®ensō Gallery" <${process.env.EMAIL_FROM}>`,
      to: recipients.join(', '),
      subject: `📊 דוח לידים יומי - ${report.date} - ${report.summary.total_leads} לידים חדשים`,
      html: emailHtml,
      attachments: [
        {
          filename: `leads-${report.date}.csv`,
          content: csvBuffer,
          contentType: 'text/csv; charset=utf-8'
        }
      ]
    })

    console.log('Email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }

  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

// שליחת הודעת זוכה שבועי
export async function sendWeeklyWinnerEmail(winner, weekDates) {
  try {
    const transporter = createTransporter()

    const emailHtml = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
    }
    .crown {
      font-size: 60px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px;
    }
    .winner-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .winner-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .winner-email {
      font-size: 16px;
      opacity: 0.9;
      margin-bottom: 15px;
    }
    .likes-badge {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 18px;
    }
    .artwork-img {
      width: 100%;
      border-radius: 10px;
      margin: 20px 0;
      max-height: 400px;
      object-fit: cover;
    }
    .prompt {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      border-right: 4px solid #667eea;
      margin: 20px 0;
      font-style: italic;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="crown">👑</div>
      <h1>זוכה שבועי נבחר!</h1>
      <p style="margin: 10px 0 0 0;">®ensō Gallery - שבוע ${new Date(weekDates.start).toLocaleDateString('he-IL')} - ${new Date(weekDates.end).toLocaleDateString('he-IL')}</p>
    </div>

    <div class="content">
      <div class="winner-card">
        <div class="winner-name">🎨 ${winner.name}</div>
        <div class="winner-email">📧 ${winner.email}</div>
        <div class="likes-badge">❤️ ${winner.likes} לייקים</div>
      </div>

      ${winner.artwork_url ? `<img src="${winner.artwork_url}" alt="יצירת הזוכה" class="artwork-img" />` : ''}

      <div class="prompt">
        <strong>תיאור היצירה:</strong><br/>
        "${winner.prompt}"
      </div>

      <p style="text-align: center; font-size: 18px; color: #667eea; margin: 30px 0;">
        <strong>מזל טוב לזוכה! 🎉</strong>
      </p>

      <p style="text-align: center; color: #666;">
        הזוכה יקבל סדנת קוקטיילים זוגית
      </p>
    </div>

    <div class="footer">
      <p>הודעה נוצרה אוטומטית ב-${new Date().toLocaleString('he-IL')}</p>
      <p>®ensō Gallery - SodaStream Campaign</p>
    </div>
  </div>
</body>
</html>
    `

    const info = await transporter.sendMail({
      from: `"®ensō Gallery" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
      subject: `👑 זוכה שבועי נבחר - ${winner.name} - ${winner.likes} לייקים`,
      html: emailHtml
    })

    console.log('Winner email sent successfully:', info.messageId)
    return { success: true, messageId: info.messageId }

  } catch (error) {
    console.error('Error sending winner email:', error)
    throw error
  }
}

