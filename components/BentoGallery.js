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
      const storageImages = await getImagesFromStorage('artworks')
      const artworksFromDB = await getArtworks()

      let allImages = [...storageImages]

      if (artworksFromDB && artworksFromDB.length > 0) {
        const storageIds = storageImages.map(img => img.id)
        const uniqueArtworks = artworksFromDB.filter(
          art => !storageIds.includes(art.id) && art.image_url
        )
        allImages = [...allImages, ...uniqueArtworks]
      }

      if (allImages.length === 0) {
        setArtworks(Array.from({ length: 6 }, (_, i) => ({
          id: `fallback-${i}`,
          image_url: `https://picsum.photos/400/400?random=${i}`,
          user_name: 'אמן דיגיטלי',
          prompt: `יצירה דיגיטלית ${i + 1}`,
          created_at: new Date().toISOString()
        })))
      } else {
        // מיון לפי תאריך אם קיים, אחרת לפי id/string
        const sorted = allImages.sort((a, b) => {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at) - new Date(a.created_at)
          }
          return (b.id || '').toString().localeCompare((a.id || '').toString())
        })

        // רק 6 האחרונות
        setArtworks(sorted.slice(0, 6))
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
      <section className="px-3 py-8 bg-[var(--color-bg)] min-h-screen">
        <div
          className="
            grid gap-2 sm:gap-3 md:gap-4
            grid-cols-2
            sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]
            auto-rows-[10rem] sm:auto-rows-[12rem] md:auto-rows-[14rem] lg:auto-rows-[16rem]
            w-full max-w-7xl mx-auto
          "
        >
          {artworks.map((art, index) => (
            <figure
              key={art.id || index}
              onClick={() => openPopup(art)}
              className="relative overflow-hidden rounded-lg sm:rounded-xl cursor-pointer group"
            >
              <img
                src={art.image_url}
                alt={art.prompt}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                onError={(e) => {
                  e.target.src = `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 200)}`
                }}
              />
              {/* Overlay + caption */}
              <figcaption className="
                absolute inset-0 flex flex-col justify-end
                bg-gradient-to-t from-black/80 via-black/40 to-transparent
                p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500
              ">
                <h3 className="text-white text-xs sm:text-sm font-light line-clamp-1">
                  {art.prompt}
                </h3>
                <p className="text-gray-300 text-[10px] sm:text-xs">
                  {art.user_name}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Popup Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closePopup}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={closePopup}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="bg-white rounded-xl overflow-hidden shadow-2xl">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                className="w-full h-auto max-h-[70vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedImage.prompt}</h2>
                <p className="text-gray-600 mb-4">יצר על ידי: {selectedImage.user_name}</p>
                {selectedImage.created_at && (
                  <p className="text-sm text-gray-500">
                    {new Date(selectedImage.created_at).toLocaleDateString('he-IL')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
