import { createServer } from 'http'
import { textToCanvas } from 'boks-boks-boks-qr-generator'
import { createCanvas } from 'canvas'

const server = createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
        const canvas = createCanvas(300, 300)
        
        textToCanvas(canvas, "QR Code", true)
        
        const dataURL = canvas.toDataURL()
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Generator</title>
            </head>
            <body>
                <h1>QR Generator Output</h1>
                <img src="${dataURL}" alt="Generated QR">
            </body>
            </html>`
        
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(html)
    } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not Found')
    }
})

const port = 8000
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
})