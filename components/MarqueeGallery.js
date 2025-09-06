import { useState, useEffect } from 'react'
import { getArtworks } from '../lib/supabaseClient'

export default function MarqueeGallery() {
  const [artworks, setArtworks] = useState([])

  useEffect(() => {
    console.log('MarqueeGallery: Component mounted, loading artworks...')
    loadArtworks()
    
    // רענון כל 10 שניות
    const interval = setInterval(() => {
      console.log('MarqueeGallery: Refreshing artworks (10s interval)...')
      loadArtworks()
    }, 10000)
    return () => {
      console.log('MarqueeGallery: Component unmounting, clearing interval')
      clearInterval(interval)
    }
  }, [])

  const loadArtworks = async () => {
    try {
      const fetchedArtworks = await getArtworks()
      
      console.log('Fetched artworks:', fetchedArtworks)
      
      if (!fetchedArtworks || fetchedArtworks.length === 0) {
        console.log('No artworks found in database, using fallback images')
        throw new Error('No artworks found')
      }
      
      // נוודא שיש מספיק תמונות לאפקט אינסופי - לפחות 20
      let allArtworks = [...fetchedArtworks]
      while (allArtworks.length < 20) {
        allArtworks = [...allArtworks, ...fetchedArtworks]
      }
      
      console.log('Setting artworks:', allArtworks.slice(0, 20))
      setArtworks(allArtworks.slice(0, 20))
    } catch (error) {
      console.error('Error loading artworks:', error)
      // תמונות fallback במקרה של שגיאה - מספיק לאפקט אינסופי
      console.log('Using fallback placeholder images')
      setArtworks(Array.from({ length: 20 }, (_, i) => ({
        id: `fallback-${i}`,
        image_url: `https://picsum.photos/400/300?random=${i}`,
        user_name: 'אמן דיגיטלי',
        prompt: 'יצירת אמנות מרהיבה'
      })))
    }
  }

  // חלוקת היצירות לשתי שורות
  const firstRow = (artworks || []).slice(0, 10)
  const secondRow = (artworks || []).slice(10, 20)

  console.log('MarqueeGallery: Rendering with', artworks?.length || 0, 'artworks')
  console.log('MarqueeGallery: firstRow length:', firstRow.length, 'secondRow length:', secondRow.length)

  if (!artworks || artworks.length === 0) {
    console.log('MarqueeGallery: No artworks to display, showing fallback')
    return (
      <section className="bg-[var(--color-bg)] py-12 overflow-hidden space-y-8">
        <div className="flex justify-center items-center h-32">
          <div className="text-[var(--color-muted)]/50 text-sm">טוען גלריה...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[var(--color-bg)] py-12 overflow-hidden space-y-8">
      {/* שורה ראשונה - תנועה שמאלה */}
      <div className="animate-marquee flex gap-6" style={{ width: 'max-content' }}>
        {/* כפילויות מרובות לאפקט אינסופי חלק */}
        {[...firstRow, ...firstRow, ...firstRow, ...firstRow].map((artwork, index) => (
          <img 
            key={`row1-${artwork.id}-${index}`}
            src={artwork.image_url} 
            alt={artwork.prompt}
            className="h-32 md:h-40 w-auto object-cover rounded-xl shadow-lg flex-shrink-0"
            onError={(e) => {
              e.target.src = `https://picsum.photos/400/300?random=${index}`
            }}
          />
        ))}
      </div>

      {/* שורה שנייה - תנועה ימינה */}
      <div className="animate-marquee-reverse flex gap-6" style={{ width: 'max-content' }}>
        {/* כפילויות מרובות לאפקט אינסופי חלק */}
        {[...secondRow, ...secondRow, ...secondRow, ...secondRow].map((artwork, index) => (
          <img 
            key={`row2-${artwork.id}-${index}`}
            src={artwork.image_url} 
            alt={artwork.prompt}
            className="h-32 md:h-40 w-auto object-cover rounded-xl shadow-lg flex-shrink-0"
            onError={(e) => {
              e.target.src = `https://picsum.photos/400/300?random=${index + 100}`
            }}
          />
        ))}
      </div>
    </section>
  )
}
