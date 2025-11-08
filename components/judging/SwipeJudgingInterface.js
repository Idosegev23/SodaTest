'use client'

import { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from '@use-gesture/react'
import { getAllArtworksForJudging } from '../../lib/supabaseClient'

// רשימת השופטים
const JUDGES = [
  { name: 'Shai Franco', description: 'צלם ואמן ויזואלי' },
  { name: 'Koketit', description: 'אמנית ויוצרת' },
  { name: 'Alon Shabo', description: 'אמן מולטי-דיסציפלינרי' },
  { name: 'Dede Bandaid', description: 'אמן רחוב' },
  { name: 'Amir Bavler', description: '' },
  { name: 'עידו (בדיקות)', description: '🔧 מצב בדיקה' }
]

export default function SwipeJudgingInterface() {
  const [judgeName, setJudgeName] = useState('')
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [artworks, setArtworks] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedCount, setSelectedCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState([]) // לצורך undo
  const [showCompletion, setShowCompletion] = useState(false)
  const [selectedJudge, setSelectedJudge] = useState('')
  
  // Load artworks
  useEffect(() => {
    const loadArtworks = async () => {
      setIsLoading(true)
      const data = await getAllArtworksForJudging()
      setArtworks(data)
      setIsLoading(false)
    }
    
    if (judgeName) {
      loadArtworks()
      loadProgress()
    }
  }, [judgeName])
  
  // Keyboard support
  useEffect(() => {
    if (!judgeName || showCompletion) return
    
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        handleLike()
      } else if (e.key === 'ArrowLeft') {
        handlePass()
      } else if (e.key === 'Backspace') {
        e.preventDefault()
        handleUndo()
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [judgeName, showCompletion, currentIndex, history])
  
  // Save progress to localStorage
  useEffect(() => {
    if (judgeName && currentIndex > 0) {
      localStorage.setItem(`judge_${judgeName}_index`, currentIndex)
      localStorage.setItem(`judge_${judgeName}_selected`, selectedCount)
    }
  }, [currentIndex, selectedCount, judgeName])
  
  // Load previous progress
  const loadProgress = () => {
    const savedIndex = localStorage.getItem(`judge_${judgeName}_index`)
    const savedCount = localStorage.getItem(`judge_${judgeName}_selected`)
    
    if (savedIndex) setCurrentIndex(parseInt(savedIndex))
    if (savedCount) setSelectedCount(parseInt(savedCount))
  }
  
  // Check if demo mode
  useEffect(() => {
    if (judgeName) {
      setIsDemoMode(judgeName.toLowerCase().trim() === 'עידו')
    }
  }, [judgeName])
  
  // Animation state
  const [{ x, rotate, opacity }, api] = useSpring(() => ({
    x: 0,
    rotate: 0,
    opacity: 1
  }))
  
  // Drag gesture
  const bind = useDrag(({ down, movement: [mx], velocity: [vx], direction: [dx] }) => {
    const trigger = vx > 0.2 || Math.abs(mx) > 100
    const dir = dx < 0 ? -1 : 1
    
    if (!down && trigger) {
      // Swipe completed
      if (dir > 0) {
        handleLike()
      } else {
        handlePass()
      }
    }
    
    api.start({
      x: down ? mx : 0,
      rotate: down ? mx / 20 : 0,
      opacity: down && Math.abs(mx) > 50 ? 0.8 : 1,
      immediate: down
    })
  })
  
  // Handle like (swipe right)
  const handleLike = async () => {
    if (currentIndex >= artworks.length) return
    
    const artwork = artworks[currentIndex]
    
    // Save to history
    setHistory([...history, { index: currentIndex, action: 'like' }])
    
    // Update count
    setSelectedCount(prev => prev + 1)
    
    // Save to DB (unless demo mode)
    if (!isDemoMode) {
      try {
        await fetch('/api/judge-selections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            judgeName: judgeName,
            artworkId: artwork.id,
            isSelected: true
          })
        })
      } catch (error) {
        console.error('Error saving selection:', error)
      }
    } else {
      // Demo mode - save to localStorage
      const demoSelections = JSON.parse(localStorage.getItem('demo_selections') || '[]')
      demoSelections.push(artwork.id)
      localStorage.setItem('demo_selections', JSON.stringify(demoSelections))
    }
    
    // Animate out
    api.start({ 
      x: 500, 
      rotate: 20, 
      opacity: 0,
      onRest: () => {
        moveToNext()
      }
    })
  }
  
  // Handle pass (swipe left)
  const handlePass = () => {
    if (currentIndex >= artworks.length) return
    
    // Save to history
    setHistory([...history, { index: currentIndex, action: 'pass' }])
    
    // Animate out
    api.start({ 
      x: -500, 
      rotate: -20, 
      opacity: 0,
      onRest: () => {
        moveToNext()
      }
    })
  }
  
  // Move to next artwork
  const moveToNext = () => {
    const nextIndex = currentIndex + 1
    
    if (nextIndex >= artworks.length) {
      setShowCompletion(true)
    } else {
      setCurrentIndex(nextIndex)
      api.start({ x: 0, rotate: 0, opacity: 1 })
    }
  }
  
  // Handle undo
  const handleUndo = async () => {
    if (history.length === 0 || currentIndex === 0) return
    
    const lastAction = history[history.length - 1]
    
    // Revert count
    if (lastAction.action === 'like') {
      setSelectedCount(prev => prev - 1)
      
      // Delete from DB (unless demo mode)
      if (!isDemoMode) {
        const artwork = artworks[lastAction.index]
        try {
          await fetch('/api/judge-selections', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              judgeName: judgeName,
              artworkId: artwork.id
            })
          })
        } catch (error) {
          console.error('Error deleting selection:', error)
        }
      }
    }
    
    // Go back
    setCurrentIndex(lastAction.index)
    setHistory(history.slice(0, -1))
    api.start({ x: 0, rotate: 0, opacity: 1 })
    setShowCompletion(false)
  }
  
  // Judge selection screen
  if (!judgeName) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[#4a6372] bg-opacity-20 rounded-lg p-8 border border-[#8e7845] border-opacity-30">
            <h1 className="text-3xl font-bold text-[#D9d8d6] mb-2 text-center">
              בחירת שופט
            </h1>
            <p className="text-[#Bbbbbb] mb-6 text-center">
              בחר את שמך מהרשימה
            </p>
            
            <div className="space-y-3">
              {JUDGES.map((judge) => (
                <button
                  key={judge.name}
                  onClick={() => {
                    setSelectedJudge(judge.name)
                    setJudgeName(judge.name)
                  }}
                  className="w-full p-4 bg-[#00050e] border border-[#8e7845] border-opacity-30 rounded-lg text-right hover:bg-[#8e7845] hover:bg-opacity-10 transition-all duration-200 group"
                >
                  <div className="text-[#D9d8d6] font-semibold text-lg group-hover:text-[#8e7845] transition-colors">
                    {judge.name}
                  </div>
                  {judge.description && (
                    <div className="text-[#Bbbbbb] text-sm mt-1">
                      {judge.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center">
        <div className="text-[#D9d8d6] text-xl">טוען יצירות...</div>
      </div>
    )
  }
  
  // Completion screen
  if (showCompletion) {
    return (
      <div className="min-h-screen bg-[#00050e] flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#D9d8d6] mb-4">
            סיימת! 🎉
          </h1>
          <p className="text-[#Bbbbbb] text-xl mb-8">
            בחרת <span className="text-[#8e7845] font-bold">{selectedCount}</span> יצירות מתוך <span className="font-bold">{artworks.length}</span>
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setCurrentIndex(0)
                setSelectedCount(0)
                setHistory([])
                setShowCompletion(false)
                localStorage.removeItem(`judge_${judgeName}_index`)
                localStorage.removeItem(`judge_${judgeName}_selected`)
              }}
              className="px-8 py-3 bg-[#8e7845] hover:bg-[#8e7845] bg-opacity-80 hover:bg-opacity-100 text-[#D9d8d6] font-semibold rounded-lg transition-all duration-200 border border-[#8e7845] border-opacity-50"
            >
              התחל מחדש
            </button>
            
            <button
              onClick={() => {
                setJudgeName('')
                setSelectedJudge('')
                setCurrentIndex(0)
                setSelectedCount(0)
                setHistory([])
                setShowCompletion(false)
              }}
              className="block mx-auto px-8 py-3 bg-transparent border border-[#8e7845] border-opacity-50 text-[#D9d8d6] rounded-lg hover:bg-[#8e7845] hover:bg-opacity-10 transition-all duration-200"
            >
              חזרה לבחירת שופט
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  const currentArtwork = artworks[currentIndex]
  const progress = ((currentIndex / artworks.length) * 100).toFixed(1)
  
  return (
    <div className="min-h-screen bg-[#00050e] flex flex-col">
      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="bg-[#f59e0b] text-black text-center py-3 px-4 font-semibold">
          🔧 מצב בדיקה - הבחירות לא נשמרות למסד נתונים
        </div>
      )}
      
      {/* Header with stats */}
      <div className="p-4 border-b border-[#8e7845] border-opacity-30">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="text-[#D9d8d6]">
              <span className="font-bold">{judgeName}</span>
            </div>
            <div className="text-[#Bbbbbb] text-sm">
              {currentIndex + 1} / {artworks.length}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-[#4a6372] bg-opacity-20 rounded-full h-2 mb-2">
            <div 
              className="bg-[#8e7845] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-[#8e7845] text-sm text-center">
            ❤️ {selectedCount} יצירות נבחרו
          </div>
        </div>
      </div>
      
      {/* Main swipe area */}
      <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
        {currentArtwork && (
          <animated.div
            {...bind()}
            style={{
              x,
              rotate: rotate.to(r => `${r}deg`),
              opacity,
              touchAction: 'none'
            }}
            className="relative w-full max-w-md cursor-grab active:cursor-grabbing"
          >
            {/* Overlay indicators */}
            <animated.div
              style={{
                opacity: x.to([0, 100], [0, 1])
              }}
              className="absolute inset-0 bg-green-500 bg-opacity-30 rounded-lg flex items-center justify-center z-10 pointer-events-none"
            >
              <div className="text-white text-6xl">❤️</div>
            </animated.div>
            
            <animated.div
              style={{
                opacity: x.to([0, -100], [0, 1])
              }}
              className="absolute inset-0 bg-red-500 bg-opacity-30 rounded-lg flex items-center justify-center z-10 pointer-events-none"
            >
              <div className="text-white text-6xl">✕</div>
            </animated.div>
            
            {/* Artwork card */}
            <div className="bg-[#4a6372] bg-opacity-20 rounded-lg border border-[#8e7845] border-opacity-30 overflow-hidden shadow-2xl">
              <div className="relative aspect-square">
                <img
                  src={currentArtwork.image_url}
                  alt={currentArtwork.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                <h3 className="text-2xl font-bold text-[#D9d8d6] mb-2">
                  {currentArtwork.user_name}
                </h3>
                <p className="text-[#Bbbbbb] mb-3 line-clamp-2">
                  {currentArtwork.prompt}
                </p>
                <div className="text-[#8e7845] text-sm">
                  ❤️ {currentArtwork.likes} לייקים
                </div>
              </div>
            </div>
          </animated.div>
        )}
      </div>
      
      {/* Action buttons */}
      <div className="p-6 border-t border-[#8e7845] border-opacity-30">
        <div className="max-w-md mx-auto flex justify-center items-center gap-6">
          {/* Pass button */}
          <button
            onClick={handlePass}
            className="w-16 h-16 rounded-full bg-[#7f2629] hover:bg-[#7f2629] bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center text-3xl text-white transition-all duration-200 shadow-lg"
            aria-label="דלג"
          >
            ✕
          </button>
          
          {/* Undo button */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="w-12 h-12 rounded-full bg-[#4a6372] hover:bg-[#8e7845] bg-opacity-40 hover:bg-opacity-30 flex items-center justify-center text-xl text-[#D9d8d6] transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="ביטול"
          >
            ↶
          </button>
          
          {/* Like button */}
          <button
            onClick={handleLike}
            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 flex items-center justify-center text-3xl text-white transition-all duration-200 shadow-lg"
            aria-label="אהבתי"
          >
            ❤️
          </button>
        </div>
        
        {/* Keyboard hints */}
        <div className="text-center text-[#Bbbbbb] text-xs mt-4">
          מקלדת: → אהבתי | ← דלג | Backspace ביטול
        </div>
      </div>
    </div>
  )
}

