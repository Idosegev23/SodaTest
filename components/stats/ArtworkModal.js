'use client'

import React, { useEffect } from 'react'

export default function ArtworkModal({ artwork, onClose }) {
  useEffect(() => {
    // נעילת גלילה כשהמודל פתוח
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  if (!artwork) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        {/* כפתור סגירה */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 w-10 h-10 flex items-center justify-center transition-all shadow-lg"
          aria-label="סגור"
        >
          ✕
        </button>

        {/* תוכן המודל */}
        <div className="flex flex-col md:flex-row">
          {/* התמונה */}
          <div className="md:w-2/3 bg-slate-900 flex items-center justify-center p-8">
            <img
              src={artwork.image_url}
              alt={artwork.prompt || 'יצירה'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* פרטים */}
          <div className="md:w-1/3 p-6 overflow-y-auto max-h-[80vh]">
            <h2 className="text-2xl font-bold text-slate-100 mb-4 border-b border-slate-700 pb-3">
              🎨 פרטי היצירה
            </h2>
            
            <div className="space-y-4">
              {artwork.user_name && (
                <div>
                  <span className="text-slate-400 text-sm block mb-1">👤 שם משתמש:</span>
                  <span className="text-slate-100 font-medium">{artwork.user_name}</span>
                </div>
              )}

              {artwork.user_email && (
                <div>
                  <span className="text-slate-400 text-sm block mb-1">📧 אימייל:</span>
                  <span className="text-slate-100 font-medium text-sm">{artwork.user_email}</span>
                </div>
              )}

              {artwork.prompt && (
                <div>
                  <span className="text-slate-400 text-sm block mb-1">💭 הפרומפט:</span>
                  <p className="text-slate-100 bg-slate-900 p-3 rounded-lg text-sm leading-relaxed">
                    {artwork.prompt}
                  </p>
                </div>
              )}

              {artwork.likes !== undefined && (
                <div className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-lg">
                  <span className="text-2xl">❤️</span>
                  <div>
                    <span className="text-white text-lg font-bold">{artwork.likes.toLocaleString()}</span>
                    <span className="text-purple-100 text-sm mr-2">לייקים</span>
                  </div>
                </div>
              )}

              {artwork.created_at && (
                <div>
                  <span className="text-slate-400 text-sm block mb-1">🕐 תאריך יצירה:</span>
                  <span className="text-slate-100 font-medium text-sm">
                    {new Date(artwork.created_at).toLocaleString('he-IL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {artwork.id && (
                <div>
                  <span className="text-slate-400 text-sm block mb-1">🔑 מזהה:</span>
                  <span className="text-slate-100 font-mono text-xs bg-slate-900 px-2 py-1 rounded">
                    {artwork.id}
                  </span>
                </div>
              )}
            </div>

            {/* כפתור להוריד */}
            {artwork.image_url && (
              <a
                href={artwork.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-all shadow-lg"
              >
                📥 פתח תמונה בחלון חדש
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

