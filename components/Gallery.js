import { useState, useEffect } from 'react'
import { getArtworks } from '../lib/supabaseClient'

export default function Gallery() {
  const [artworks, setArtworks] = useState([])

  useEffect(() => {
    loadArtworks()
    
    // רענון כל 10 שניות
    const interval = setInterval(loadArtworks, 10000)
    return () => clearInterval(interval)
  }, [])

  const loadArtworks = async () => {
    try {
      const data = await getArtworks()
      setArtworks(data || [])
    } catch (error) {
      console.error('Error loading artworks:', error)
      setArtworks([])
    }
  }

  // יצירת 3 שורות מהתמונות
  const createRows = () => {
    if (artworks.length === 0) {
      // אם אין תמונות, נציג תמונות דמה
      const dummyImages = [
        'https://picsum.photos/300/300?random=1',
        'https://picsum.photos/300/300?random=2',
        'https://picsum.photos/300/300?random=3',
        'https://picsum.photos/300/300?random=4',
        'https://picsum.photos/300/300?random=5',
        'https://picsum.photos/300/300?random=6',
        'https://picsum.photos/300/300?random=7',
        'https://picsum.photos/300/300?random=8',
        'https://picsum.photos/300/300?random=9',
      ]
      
      return [
        dummyImages.slice(0, 3),
        dummyImages.slice(3, 6),
        dummyImages.slice(6, 9)
      ]
    }

    const rows = [[], [], []]
    artworks.forEach((artwork, index) => {
      rows[index % 3].push(artwork.image_url)
    })

    // מילוי חסר עם תמונות דמה אם צריך
    const minImagesPerRow = 3
    rows.forEach((row, rowIndex) => {
      while (row.length < minImagesPerRow) {
        row.push(`https://picsum.photos/300/300?random=${rowIndex}${row.length}`)
      }
    })

    return rows
  }

  const rows = createRows()

  const rowVariants = [
    {
      animate: {
        x: [0, -1000],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 20,
            ease: 'linear',
          },
        },
      },
    },
    {
      animate: {
        x: [-1000, 0],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 25,
            ease: 'linear',
          },
        },
      },
    },
    {
      animate: {
        x: [0, -1000],
        transition: {
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: 30,
            ease: 'linear',
          },
        },
      },
    },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden opacity-40">
      {rows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex absolute whitespace-nowrap animate-scroll"
                  style={{
                    top: `${rowIndex * 33.33}%`,
                    height: '33.33%',
                    animationDuration: `${25 + rowIndex * 8}s`,
                    animationDirection: rowIndex % 2 === 0 ? 'normal' : 'reverse',
                  }}
                >
          {/* כפולה של התמונות לאפקט אינסופי */}
          {[...row, ...row, ...row].map((imageUrl, imageIndex) => (
            <div
              key={imageIndex}
              className="flex-shrink-0 w-80 h-full mx-6 relative group"
            >
              {/* Blue frame effect */}
              <div className="absolute -inset-1 bg-gradient-to-br from-blue-600/20 to-blue-800/10 rounded-lg"></div>
              <div className="relative h-full bg-gradient-to-br from-blue-950/50 to-black/50 rounded-lg border border-blue-700/20 overflow-hidden">
                <img
                  src={imageUrl}
                  alt="יצירת אומנות"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = `https://picsum.photos/300/300?random=${rowIndex}${imageIndex}`
                  }}
                />
                {/* Gallery overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {/* Museum lighting */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gradient-to-b from-blue-300/10 to-transparent blur-sm"></div>
              </div>
            </div>
          ))}
                </div>
      ))}
    </div>
  )
}
