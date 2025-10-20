/**
 * Share Utilities for Social Media Sharing
 * Provides native mobile sharing via Web Share API with fallbacks
 */

/**
 * Check if device is mobile
 */
export function isMobile() {
  if (typeof window === 'undefined') return false
  
  const userAgent = navigator.userAgent || navigator.vendor || window.opera
  
  // Check for mobile devices
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
  return mobileRegex.test(userAgent.toLowerCase())
}

/**
 * Check if Web Share API is supported
 */
export function supportsWebShare() {
  if (typeof navigator === 'undefined') return false
  return 'share' in navigator
}

/**
 * Check if Web Share API supports sharing files
 */
export function canShareFiles() {
  if (typeof navigator === 'undefined') return false
  
  try {
    // Check if canShare method exists and if it supports files
    if ('canShare' in navigator) {
      // Test with a dummy file
      const testFile = new File(['test'], 'test.png', { type: 'image/png' })
      return navigator.canShare({ files: [testFile] })
    }
    
    // Fallback: assume files are supported if share API exists on mobile
    return isMobile() && supportsWebShare()
  } catch (error) {
    console.error('Error checking file share support:', error)
    return false
  }
}

/**
 * Fetch image as Blob from URL (handles CORS)
 */
export async function fetchImageAsBlob(imageUrl) {
  try {
    console.log('Fetching image as blob:', imageUrl)
    
    const response = await fetch(imageUrl, {
      mode: 'cors',
      credentials: 'omit'
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    console.log('Image fetched successfully, size:', blob.size, 'type:', blob.type)
    
    return blob
  } catch (error) {
    console.error('Error fetching image as blob:', error)
    throw error
  }
}

/**
 * Create a File object from Blob for sharing
 */
export function createShareableFile(blob, filename = 'sodastream-enso-artwork.png') {
  try {
    // Ensure proper MIME type
    const mimeType = blob.type || 'image/png'
    
    // Create File object (required for Web Share API)
    const file = new File([blob], filename, { type: mimeType })
    
    console.log('Created shareable file:', file.name, file.type, file.size)
    return file
  } catch (error) {
    console.error('Error creating shareable file:', error)
    throw error
  }
}

/**
 * Main share function - handles native sharing with fallbacks
 * @param {Object} artwork - The artwork object with image_url, prompt, etc.
 * @param {string} platform - Optional platform hint ('instagram', 'facebook', 'whatsapp')
 * @returns {Promise<Object>} - { success: boolean, method: string }
 */
export async function shareNative(artwork, platform = null) {
  const shareText = `🎨 צפו ביצירת האמנות שיצרתי עם SodaStream ensō®!\n\n"${artwork.prompt}"\n\nצרו גם אתם: https://ensogallery.co.il`
  const shareUrl = typeof window !== 'undefined' ? window.location.href : 'https://ensogallery.co.il'
  const imageUrl = artwork.image_url
  
  // Check device and support
  const mobile = isMobile()
  const hasWebShare = supportsWebShare()
  const hasFileShare = canShareFiles()
  
  console.log('Share attempt:', { mobile, hasWebShare, hasFileShare, platform })
  
  // Strategy 1: Web Share API with Files (Best - Mobile)
  if (mobile && hasWebShare && hasFileShare) {
    try {
      console.log('Attempting Web Share API with file...')
      
      // Fetch and convert image to blob
      const imageBlob = await fetchImageAsBlob(imageUrl)
      
      // Create shareable file
      const imageFile = createShareableFile(imageBlob, `enso-artwork-${Date.now()}.png`)
      
      // Prepare share data
      const shareData = {
        text: shareText,
        files: [imageFile]
      }
      
      // Check if this specific data can be shared
      if (navigator.canShare && !navigator.canShare(shareData)) {
        console.warn('Share data not supported, trying without URL')
        // Try without URL if not supported
        delete shareData.url
      }
      
      // Trigger native share
      await navigator.share(shareData)
      
      console.log('Share successful via Web Share API')
      return { success: true, method: 'web-share-api' }
      
    } catch (error) {
      // User cancelled or error occurred
      if (error.name === 'AbortError') {
        console.log('Share cancelled by user')
        return { success: false, method: 'cancelled' }
      }
      
      console.error('Web Share API error:', error)
      // Fall through to fallback
    }
  }
  
  // Strategy 2: Web Share API without Files (Mobile - some browsers)
  if (mobile && hasWebShare && !hasFileShare) {
    try {
      console.log('Attempting Web Share API without file...')
      
      const shareData = {
        title: 'SodaStream ensō® Gallery',
        text: shareText,
        url: imageUrl // Share image URL instead of file
      }
      
      await navigator.share(shareData)
      
      console.log('Share successful via Web Share API (URL only)')
      
      // Also trigger image download in background
      setTimeout(() => {
        downloadImage(imageUrl, `enso-artwork-${Date.now()}.png`)
      }, 500)
      
      return { success: true, method: 'web-share-api-url' }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Share cancelled by user')
        return { success: false, method: 'cancelled' }
      }
      
      console.error('Web Share API (URL) error:', error)
      // Fall through to fallback
    }
  }
  
  // Strategy 3: Mobile Fallback - Download + Copy + Open App
  if (mobile) {
    return fallbackMobileShare(imageUrl, shareText, platform)
  }
  
  // Strategy 4: Desktop Fallback
  return fallbackDesktopShare(platform, shareUrl, shareText, imageUrl)
}

/**
 * Fallback for mobile devices without Web Share API support
 */
export async function fallbackMobileShare(imageUrl, text, platform) {
  console.log('Using mobile fallback:', platform)
  
  try {
    // Download image
    await downloadImage(imageUrl, `enso-artwork-${Date.now()}.png`)
    
    // Copy text to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text)
    }
    
    // Platform-specific actions
    if (platform === 'instagram') {
      // Can't open Instagram directly to post, so just download + instructions
      alert('התמונה הורדה והטקסט הועתק! 📸\n\nעכשיו:\n1. פתח את אינסטגרם\n2. צור פוסט או סטורי חדש\n3. בחר את התמונה שהורדה\n4. הדבק את הטקסט (לחץ לחיצה ארוכה)')
      return { success: true, method: 'mobile-fallback-manual' }
      
    } else if (platform === 'facebook') {
      // Open Facebook (will open app if installed)
      window.open('https://www.facebook.com/', '_blank')
      alert('התמונה הורדה והטקסט הועתק! 📘\n\nפייסבוק נפתח - צור פוסט חדש, העלה את התמונה והדבק את הטקסט')
      return { success: true, method: 'mobile-fallback-facebook' }
      
    } else if (platform === 'whatsapp') {
      // Open WhatsApp with text
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(whatsappUrl, '_blank')
      alert('התמונה הורדה! 💬\n\nווטסאפ נפתח - הטקסט מוכן, כעת הוסף את התמונה שהורדה')
      return { success: true, method: 'mobile-fallback-whatsapp' }
    }
    
    return { success: true, method: 'mobile-fallback-generic' }
    
  } catch (error) {
    console.error('Mobile fallback error:', error)
    alert('שגיאה בהכנת השיתוף. אנא נסה שוב.')
    return { success: false, method: 'fallback-error' }
  }
}

/**
 * Fallback for desktop browsers
 */
export function fallbackDesktopShare(platform, url, text, imageUrl) {
  console.log('Using desktop fallback:', platform)
  
  if (platform === 'instagram') {
    // Instagram desktop - copy and instruct
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${text}\n\n${imageUrl}`)
        .then(() => {
          alert('הקישור והטקסט הועתקו! 📸\n\nפתח את Instagram בדפדפן או באפליקציה והדבק את התוכן')
        })
        .catch(() => {
          prompt('העתק את הטקסט הזה:', `${text}\n\n${imageUrl}`)
        })
    } else {
      prompt('העתק את הטקסט הזה:', `${text}\n\n${imageUrl}`)
    }
    
    // Open Instagram
    window.open('https://www.instagram.com/', '_blank')
    return { success: true, method: 'desktop-instagram' }
    
  } else if (platform === 'facebook') {
    // Facebook Sharer Dialog
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(text)}`
    window.open(shareUrl, '_blank', 'width=600,height=400')
    return { success: true, method: 'desktop-facebook' }
    
  } else if (platform === 'whatsapp') {
    // WhatsApp Web
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n\n${imageUrl}`)}`
    window.open(whatsappUrl, '_blank')
    return { success: true, method: 'desktop-whatsapp' }
  }
  
  return { success: true, method: 'desktop-fallback' }
}

/**
 * Download image to device
 */
export async function downloadImage(imageUrl, filename = 'sodastream-enso-artwork.png') {
  try {
    console.log('Downloading image:', imageUrl)
    
    // Fetch the image
    const response = await fetch(imageUrl, { mode: 'cors' })
    const blob = await response.blob()
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    
    // Cleanup
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    console.log('Image download triggered')
    return true
    
  } catch (error) {
    console.error('Error downloading image:', error)
    
    // Fallback: open in new tab
    window.open(imageUrl, '_blank')
    return false
  }
}

