import QRCode from 'qrcode'

export async function generateQRCodeDataURL(text: string, size: number = 300): Promise<string> {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return dataURL
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw error
  }
}

export async function downloadQRCode(text: string, filename: string, size: number = 300): Promise<void> {
  try {
    const dataURL = await generateQRCodeDataURL(text, size)
    
    // Convert data URL to blob
    const response = await fetch(dataURL)
    const blob = await response.blob()
    
    // Create blob URL
    const blobUrl = URL.createObjectURL(blob)
    
    // Create download link
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up blob URL
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Error downloading QR code:', error)
    throw error
  }
}