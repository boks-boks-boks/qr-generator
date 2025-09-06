export function textToCanvas(
    canva: HTMLCanvasElement, 
    text: string, 
    isDebugContext: boolean = false
): void {
    let ctx: CanvasRenderingContext2D | null = canva.getContext("2d")

    if (!ctx) {
        throw new Error("Error getting canva context")
    }

    // admiting this is a v2 qr code
    const blockNumber = 25 // TODO: compute this
    const blockSize = getBlockSize(canva, blockNumber)
    
    if (isDebugContext)
        addBlockGrid(ctx, blockNumber, blockSize)

    addQrAnchor(ctx, blockNumber, blockSize)
}

function getBlockSize(
    canva: HTMLCanvasElement,
    blockNumber: number
): number {
    let width = canva.width
    while(width % blockNumber != 0) {
        width--
    }

    return width / blockNumber
}

function addBlockGrid(
    ctx: CanvasRenderingContext2D,
    blockNumber: number,
    blockSize: number
): void {
    ctx.lineWidth = 10
    for(let i = 0; i < blockNumber; ++i) {
        ctx.moveTo(i * blockSize, 0)
        ctx.lineTo(i * blockSize, blockNumber * blockSize)
    }

    for(let i = 0; i < blockNumber; ++i) {
        ctx.moveTo(0, i * blockSize) 
        ctx.lineTo(blockNumber * blockSize, i * blockSize)
    }

    ctx.stroke()
}

function addQrAnchor(
    ctx: CanvasRenderingContext2D,
    blockNumber: number, 
    blockSize: number
): void {
    // Top left anchor
    {
        // top line
        ctx.fillRect(0, 0, 7 * blockSize, blockSize)

        // left line
        ctx.fillRect(0, 0, blockSize, 7 * blockSize)

        // right line
        ctx.fillRect(6 * blockSize, 0, blockSize, 7 * blockSize)

        // bottom line
        ctx.fillRect(0, 6 * blockSize, 7 * blockSize, blockSize)

        // center block
        ctx.fillRect(2 * blockSize, 2 * blockSize, 3 * blockSize, 3 * blockSize)
    }

    // bottom left anchor 
    {
        const topRightBlockCoords = {x: 0 , y: (blockNumber - 7) * blockSize}

        // top line
        ctx.fillRect(topRightBlockCoords.x, topRightBlockCoords.y, blockSize * 7, blockSize)

        // left line
        ctx.fillRect(topRightBlockCoords.x, topRightBlockCoords.y, blockSize, 7 * blockSize)
    
        // right line
        ctx.fillRect(6 * blockSize, topRightBlockCoords.y, blockSize, 7 * blockSize)

        // bottom line
        ctx.fillRect(0, topRightBlockCoords.y + 6 * blockSize, 7 * blockSize, blockSize)

        // center block
        ctx.fillRect(2 * blockSize, topRightBlockCoords.y + 2 * blockSize, 3 * blockSize, 3 * blockSize)
    }

    // top right anchor
    {
        const topRightBlockCoords = {x: (blockNumber - 7) * blockSize, y: 0}

        // top line
        ctx.fillRect(topRightBlockCoords.x, topRightBlockCoords.y, 7 * blockSize, blockSize)

        // left line
        ctx.fillRect(topRightBlockCoords.x, topRightBlockCoords.y, blockSize, 7 * blockSize)

        // right line
        ctx.fillRect(topRightBlockCoords.x + 6 * blockSize, 0, blockSize, 7 * blockSize)

        // bottom line
        ctx.fillRect(topRightBlockCoords.x, topRightBlockCoords.y + 6 * blockSize, 7 * blockSize, blockSize)

        // center block
        ctx.fillRect(topRightBlockCoords.x + 2 * blockSize, 2 * blockSize, 3 * blockSize, 3 * blockSize)
    }

    // fix pattern 
    {
        const fixBlockNumber = ((blockNumber - 2 * 7) - 1) / 2
        for(let i = 0; i < fixBlockNumber; ++i) {
            // top pattern
            ctx.fillRect((8 + 2 * i) * blockSize, 6 * blockSize, blockSize, blockSize)
        
            // left pattern
            ctx.fillRect(6 * blockSize, (8 + 2 * i) * blockSize, blockSize, blockSize)
        }
    }
}