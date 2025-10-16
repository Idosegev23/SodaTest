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

    // תוכן המייל
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
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      margin: -30px -30px 30px -30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    .stat-number {
      font-size: 36px;
      font-weight: bold;
      margin: 10px 0;
    }
    .stat-label {
      font-size: 14px;
      opacity: 0.9;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      color: #667eea;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #667eea;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      color: #666;
      font-size: 12px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: right;
      border-bottom: 1px solid #eee;
    }
    th {
      background: #f8f9fa;
      font-weight: bold;
      color: #667eea;
    }
    .highlight {
      background: #fff3cd;
      padding: 2px 6px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 דוח לידים יומי - ®ensō Gallery</h1>
      <p style="margin: 10px 0 0 0;">${report.date}</p>
    </div>

    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">סך הכל לידים</div>
        <div class="stat-number">${report.summary.total_leads}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">לידים עם הסכמה</div>
        <div class="stat-number">${report.summary.leads_with_consent}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">יצירות שנוצרו</div>
        <div class="stat-number">${report.summary.total_artworks_created}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">🎨 סטטיסטיקת יצירות</div>
      <table>
        <tr>
          <td>סך הכל לייקים:</td>
          <td style="text-align: left;"><strong>${report.artworks_stats.total_likes}</strong></td>
        </tr>
        <tr>
          <td>ממוצע לייקים ליצירה:</td>
          <td style="text-align: left;"><strong>${report.artworks_stats.average_likes}</strong></td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">📋 רשימת לידים</div>
      <p>רשימה מלאה של ${report.summary.total_leads} לידים מצורפת כקובץ CSV.</p>
      <p>הקובץ כולל: תאריך יצירה, שם, מייל, טלפון והסכמה.</p>
    </div>

    <div class="footer">
      <p>דוח נוצר אוטומטית ב-${new Date().toLocaleString('he-IL')}</p>
      <p>®ensō Gallery - SodaStream Campaign</p>
    </div>
  </div>
</body>
</html>
    `

    // שליחת המייל
    const info = await transporter.sendMail({
      from: `"®ensō Gallery" <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_TO,
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

