'use client'

import { useState, useEffect } from 'react'

const PASSWORD = '123456'
const SESSION_KEY = 'stats_authenticated'
const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 דקות

export default function PasswordProtection({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // בדיקה אם המשתמש כבר מאומת
    const checkAuth = () => {
      const authData = localStorage.getItem(SESSION_KEY)
      if (authData) {
        const { timestamp } = JSON.parse(authData)
        const now = Date.now()
        if (now - timestamp < SESSION_TIMEOUT) {
          setIsAuthenticated(true)
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (password === PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        timestamp: Date.now()
      }))
    } else {
      setError('סיסמה שגויה. נסה שוב.')
      setPassword('')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem(SESSION_KEY)
    setPassword('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center">
        <div className="text-[#D9d8d6] text-xl">טוען...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-8 border border-[#8e7845] border-opacity-30">
            <h1 className="text-3xl font-bold text-[#D9d8d6] mb-2 text-center">
              דף מנהלים
            </h1>
            <p className="text-[#Bbbbbb] mb-6 text-center">
              נא להזין סיסמה כדי לגשת לדף הסטטיסטיקות
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="סיסמה"
                  className="w-full px-4 py-3 bg-[#00050e] border border-[#8e7845] border-opacity-30 rounded-lg text-[#D9d8d6] placeholder-[#Bbbbbb] focus:outline-none focus:border-[#8e7845] focus:ring-2 focus:ring-[#8e7845] focus:ring-opacity-50"
                  autoFocus
                />
              </div>
              
              {error && (
                <div className="text-[#7f2629] text-sm text-center bg-[#7f2629] bg-opacity-10 border border-[#7f2629] border-opacity-30 rounded-lg p-2">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full py-3 bg-[#8e7845] hover:bg-[#8e7845] bg-opacity-80 hover:bg-opacity-100 text-[#D9d8d6] font-semibold rounded-lg transition-all duration-200 border border-[#8e7845] border-opacity-50"
              >
                התחבר
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-[#7f2629] hover:bg-[#7f2629] bg-opacity-80 hover:bg-opacity-100 text-[#D9d8d6] text-sm rounded-lg transition-all duration-200 border border-[#7f2629] border-opacity-50"
        >
          התנתק
        </button>
      </div>
      {children}
    </div>
  )
}

