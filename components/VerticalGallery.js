import { useState, useEffect } from 'react'
import { getArtworks } from '../lib/supabaseClient'

export default function VerticalGallery() {
  const [artworks, setArtworks] = useState([])

  useEffect(() => {
    loadArtworks()
    
    // רענון כל 10 שניות
    const interval = setInterval(loadArtworks, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadArtworks = async () => {
    try {
      const fetchedArtworks = await getArtworks()
      
      // אם יש פחות מ-20 יצירות, נכפיל אותן כדי למלא את הגלריה
      let allArtworks = [...fetchedArtworks]
      while (allArtworks.length < 20) {
        allArtworks = [...allArtworks, ...fetchedArtworks]
      }
      
      setArtworks(allArtworks.slice(0, 20))
    } catch (error) {
      console.error('Error loading artworks:', error)
      // תמונות fallback במקרה של שגיאה
      setArtworks(Array.from({ length: 20 }, (_, i) => ({
        id: `fallback-${i}`,
        image_url: `https://picsum.photos/400/600?random=${i}`,
        user_name: 'אמן דיגיטלי',
        prompt: 'יצירת אמנות מרהיבה'
      })))
    }
  }

  // חלוקת היצירות ל-4 עמודות
  const distributeArtworks = (artworks) => {
    const columns = [[], [], [], []]
    artworks.forEach((artwork, index) => {
      columns[index % 4].push(artwork)
    })
    return columns
  }

  const columns = distributeArtworks(artworks)

  return (
    <div className="gallery">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="gallery__strip__wrapper">
          <div className={`gallery__strip ${['one', 'two', 'three', 'four'][columnIndex]}`}>
            {column.map((artwork) => (
              <div key={artwork.id} className="photo">
                <div className="photo__image">
                  <img 
                    src={artwork.image_url} 
                    alt={artwork.prompt}
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/400/600?random=${Math.floor(Math.random() * 1000)}`
                    }}
                  />
                </div>
                <div className="photo__name">
                  {artwork.user_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
