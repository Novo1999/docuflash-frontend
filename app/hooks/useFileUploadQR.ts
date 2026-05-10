const useFileUploadQR = ({ files }: { files: File[] }) => {
  const handleQrDownload = () => {
    const svg = document.getElementById('share-qr-code')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 240
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 240, 240)
      ctx.drawImage(img, 0, 0, 240, 240)
      const a = document.createElement('a')
      const uploadedFileName = files?.[0]?.name?.replace(/\.[^/.]+$/, '') ?? 'file'
      a.download = `docuflash-qr-${uploadedFileName}.png`
      a.href = canvas.toDataURL('image/png')
      a.click()
    }
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return { handleQrDownload }
}
export default useFileUploadQR
