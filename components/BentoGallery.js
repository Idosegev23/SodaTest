'use client'

import { useState, useEffect } from 'react'
import { getArtworks, getImagesFromStorage } from '../lib/supabaseClient'

export default function SymmetricGallery() {
  const [artworks, setArtworks] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    loadArtworks()
  }, [])

  const loadArtworks = async () => {
    try {
      // נעדיף תמונות מהטבלה מעל Storage (יש להן מידע מלא יותר)
      const artworksFromDB = await getArtworks()
      
      if (artworksFromDB && artworksFromDB.length > 0) {
        // אם יש תמונות בטבלה, נשתמש רק בהן
        console.log('Using artworks from database:', artworksFromDB.length)
        const sorted = artworksFromDB.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at)
          }
          return (b.id || '').toString().localeCompare((a.id || '').toString())
        })
        setArtworks(sorted.slice(0, 6))
      } else {
        // רק אם אין תמונות בטבלה, נטען מ-Storage
        console.log('No artworks in database, trying storage...')
        const storageImages = await getImagesFromStorage('artworks')
        
        if (storageImages && storageImages.length > 0) {
          console.log('Using artworks from storage:', storageImages.length)
          const sorted = storageImages.sort((a, b) => {
            if (a.created_at && b.created_at) {
              return new Date(b.created_at) - new Date(a.created_at)
            }
            return (b.id || '').toString().localeCompare((a.id || '').toString())
          })
          setArtworks(sorted.slice(0, 6))
        } else {
          // אין תמונות בכלל - תמונות דמה
          console.log('No artworks found, using fallback images')
          setArtworks(Array.from({ length: 6 }, (_, i) => ({
            id: `fallback-${i}`,
            image_url: `https://picsum.photos/400/400?random=${i}`,
            user_name: 'אמן דיגיטלי',
            prompt: `יצירה דיגיטלית ${i + 1}`,
            created_at: new Date().toISOString()
          })))
        }
      }
    } catch (error) {
      console.error('Error loading artworks:', error)
      setArtworks(Array.from({ length: 6 }, (_, i) => ({
        id: `error-${i}`,
        image_url: `https://picsum.photos/400/400?random=${i + 50}`,
        user_name: 'Fallback Artist',
        prompt: `Fallback Art ${i + 1}`,
        created_at: new Date().toISOString()
      })))
    }
  }

  const openPopup = (artwork) => setSelectedImage(artwork)
  const closePopup = () => setSelectedImage(null)

  return (
    <>
      <section className="px-4 py-8 bg-[var(--color-bg)]">
        <div className="w-full max-w-7xl mx-auto">
          {/* Bento Grid - Mobile First with Proper Image Coverage */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-[150px] md:auto-rows-[200px]">
            {artworks.map((art, index) => {
              // Create varied layout for visual interest on all devices
              let gridClass = ""
              
              if (index === 0) {
                // Hero image - large on all devices
                gridClass = "col-span-2 row-span-2"
              } else if (index === 1) {
                // Tall image on mobile, regular on desktop
                gridClass = "col-span-1 row-span-2 md:row-span-1"
              } else if (index === 2) {
                // Regular on mobile, tall on desktop
                gridClass = "col-span-1 row-span-1 md:row-span-2"
              } else if (index === 3) {
                // Wide image
                gridClass = "col-span-2 row-span-1"
              } else if (index === 4) {
                // Square on mobile, wide on desktop
                gridClass = "col-span-1 row-span-1 md:col-span-2"
              } else {
                // Regular grid items
                gridClass = "col-span-1 row-span-1"
              }
              
              return (
                <figure
                  key={art.id || index}
                  onClick={() => openPopup(art)}
                  className={`relative overflow-hidden cursor-pointer group border border-[var(--color-gold-border)] hover:border-[var(--color-gold)] transition-all duration-300 ${gridClass}`}
                  style={{ minHeight: '100%' }}
                >
                  {/* Gold frame effect for featured artwork */}
                  {index === 0 && (
                    <div className="absolute -inset-1 gold-frame opacity-60"></div>
                  )}
                  
                  <img
                    src={art.image_url}
                    alt={art.prompt || 'יצירת אמנות עם SodaStream Enso'}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                    style={{ 
                      minHeight: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 200)}`
                    }}
                  />
                  
                  {/* Museum-style overlay */}
                  <figcaption className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-white text-sm md:text-base font-heebo font-light line-clamp-2 mb-2 leading-relaxed">
                        {art.prompt}
                      </h3>
                      <div className="flex justify-between items-center">
                        <p className="text-[var(--color-gold)] text-xs font-heebo font-light">
                          {art.user_name || 'אמן אנונימי'}
                        </p>
                        {art.created_at && (
                          <p className="text-[var(--color-muted)]/70 text-xs font-heebo">
                            {new Date(art.created_at).toLocaleDateString('he-IL')}
                          </p>
                        )}
                      </div>
                      
                      {/* Featured artwork indicator */}
                      {index === 0 && (
                        <div className="mt-2 text-[var(--color-gold)] text-xs font-heebo font-medium tracking-wide">
                          ★ יצירה מומלצת
                        </div>
                      )}
                    </div>
                  </figcaption>
                  
                  {/* Gallery spotlight effect */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-20 h-8 bg-gradient-to-b from-[var(--color-gold-muted)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
                </figure>
              )
            })}
          </div>
        </div>
      </section>

      {/* Luxury Gallery Popup Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closePopup}
          role="dialog"
          aria-modal="true"
          aria-labelledby="artwork-title"
        >
          <div className="relative max-w-5xl max-h-[95vh] w-full">
            <button
              onClick={closePopup}
              className="absolute -top-12 right-0 text-[var(--color-muted)] hover:text-[var(--color-gold)] transition-colors z-10 focus:outline-none focus:text-[var(--color-gold)]"
              aria-label="סגור תצוגת יצירה"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Museum-style display */}
            <div className="bg-[var(--color-bg)] border border-[var(--color-gold-border)] rounded overflow-hidden shadow-2xl">
              {/* Gallery lighting */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gradient-to-b from-[var(--color-gold-muted)] to-transparent blur-lg opacity-60"></div>
              
              <div className="relative gold-frame m-4">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt || 'יצירת אמנות עם SodaStream Enso'}
                  className="w-full h-auto max-h-[60vh] object-contain bg-[var(--color-bg)]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              
              <div className="p-6 md:p-8 bg-[var(--color-gold-muted)] border-t border-[var(--color-gold-border)]">
                <div className="text-center mb-4">
                  <h2 
                    id="artwork-title"
                    className="text-xl md:text-2xl font-playfair font-light text-[var(--color-text)] mb-2 leading-relaxed"
                  >
                    {selectedImage.prompt}
                  </h2>
                  <div className="w-16 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent mx-auto"></div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-right">
                  <div>
                    <p className="text-[var(--color-muted)] text-sm font-heebo font-light mb-1">יוצר:</p>
                    <p className="text-[var(--color-text)] font-heebo font-medium">
                      {selectedImage.user_name || 'אמן אנונימי'}
                    </p>
                  </div>
                  
                  {selectedImage.created_at && (
                    <div>
                      <p className="text-[var(--color-muted)] text-sm font-heebo font-light mb-1">תאריך:</p>
                      <p className="text-[var(--color-text)] font-heebo font-medium">
                        {new Date(selectedImage.created_at).toLocaleDateString('he-IL', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-[var(--color-gold)] text-sm font-heebo font-light">
                      SodaStream Enso Collection
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
