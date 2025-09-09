// QR Code capacity computation based on ISO/IEC 18004 standard
// Sources:
// - https://www.qrcode.com/en/about/version.html
// - ISO/IEC 18004:2015 Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification
// - https://en.wikipedia.org/wiki/QR_code

interface VersionConfig {
    version: string,
    module: number,
    errorCorrectionLevel: Record<string, number>
}

function calculateModules(version: number): number {
    return 21 + 4 * (version - 1);
}

const DATA_CODEWORDS = {
    // [L, M, Q, H] error correction levels
    1: [19, 16, 13, 9],
    2: [34, 28, 22, 16],
    3: [55, 44, 34, 26],
    4: [80, 64, 48, 36],
    5: [108, 86, 62, 46],
    6: [136, 108, 76, 60],
    7: [156, 124, 88, 66],
    8: [194, 154, 110, 86],
    9: [232, 182, 132, 100],
    10: [274, 216, 154, 122]
} as const;

function calculateByteCapacity(version: number, errorCorrectionIndex: number): number {
    const codewords = DATA_CODEWORDS[version as keyof typeof DATA_CODEWORDS];
    if (!codewords) {
        throw new Error(`Unsupported QR version: ${version}`);
    }
    const capacity = codewords[errorCorrectionIndex];
    if (capacity === undefined) {
        throw new Error(`Invalid error correction index: ${errorCorrectionIndex}`);
    }
    return capacity;
}

function generateQRConfig() {
    const config: Record<string, { module: number; binary: Record<string, number> }> = {};
    const errorLevels = ['L', 'M', 'Q', 'H'];
    
    for (let version = 1; version <= 10; version++) {
        const modules = calculateModules(version);
        const binary: Record<string, number> = {};
        
        errorLevels.forEach((level, index) => {
            binary[level] = calculateByteCapacity(version, index);
        });
        
        config[`v${version}`] = {
            module: modules,
            binary
        };
    }
    
    return config;
}

const qrConfigMatrix = generateQRConfig();

export function textToCanvas(
    canva: HTMLCanvasElement, 
    text: string, 
    config: {
        isDebugContext?: boolean,
        encodingType?: string,
        errorCorrectionLevel?: string
    } = {}
): void {
    let ctx: CanvasRenderingContext2D | null = canva.getContext("2d")

    if (!ctx) {
        throw new Error("Error getting canva context")
    }

    const { 
        isDebugContext = false, 
        encodingType = 'binary', 
        errorCorrectionLevel = 'L' 
    } = config;

    console.debug("Encoding type: ", encodingType)
    console.debug("Error Correction Level: ", errorCorrectionLevel)

    const textLen = text.length

    const versionConfig: VersionConfig = findBestConfig(textLen, encodingType, errorCorrectionLevel)
    const blockSize = getBlockSize(canva, versionConfig.module)
    
    console.debug("textLen: ", textLen)
    console.debug("blockNumber: ", versionConfig.module)
    
    // For now, we only compute bytes since we use it for static url
    const bytesEncoding = [0, 1, 0, 0] // equivalent for 0b0100 but as a byte array
    addEncoding(ctx, blockSize, versionConfig.module, bytesEncoding)
    
    if (isDebugContext)
        addBlockGrid(ctx, versionConfig.module, blockSize)

    addQrAnchor(ctx, versionConfig.module, blockSize)
    addAlignementPattern(ctx, blockSize, versionConfig)
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

// Coming from https://gcore.jsdelivr.net/gh/tonycrane/tonycrane.github.io/p/409d352d/ISO_IEC18004-2015.pdf Annex E
function addAlignementPattern(
    ctx: CanvasRenderingContext2D,
    blockSize: number,
    config: VersionConfig
): void {
    type VersionKey = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7' | 'v8' | 'v9' | 'v10'
    // May be compute but still relevant if done like so
    const alignments = {
        v1: [0],
        v2: [6, 18],
        v3: [6, 22],
        v4: [6, 26],
        v5: [6, 30],
        v6: [6, 34],
        v7: [6, 22, 38],
        v8: [6, 24, 42],
        v9: [6, 26, 46],
        v10: [6, 28, 50]
    }

    const isCoordinateForbiden = (module: number, coords: {x: number, y: number}): boolean => {
        if ((coords.x <= 8 && coords.y <= 8) || 
            (coords.x >= module - 8 && coords.y <= 8) ||
            (coords.x <= 8 && coords.y >= module - 8)
        ){
            console.debug(coords)
            return true
        }

        return false
    }

    const acVers = config.version as VersionKey

    const neededAlignement = alignments[acVers]

    if (neededAlignement.length == 0) return

    const len = neededAlignement.length
    neededAlignement.forEach((v, index) => {
        let alreadySeens: Array<{x: number, y: number}> = []
        for (let i = 0; i < len; ++i) {
            //console.debug("v: ", v, " y : ", neededAlignement[i])
            let entry: {x: number, y: number} = {x: v, y: neededAlignement[i]!}
            if (!alreadySeens.some(seen => seen.x === entry.x && seen.y === entry.y) && !isCoordinateForbiden(config.module, entry)) {
                console.debug("entry: ", entry)
                ctx.fillRect((entry.x - 2) * blockSize, (entry.y - 2) * blockSize, 5 * blockSize, blockSize)
                ctx.fillRect((entry.x - 2) * blockSize, (entry.y - 2) * blockSize, blockSize, 5 * blockSize)
                ctx.fillRect((entry.x + 2) * blockSize, (entry.y - 2) * blockSize, blockSize, 5 * blockSize)
                ctx.fillRect((entry.x - 2) * blockSize, (entry.y + 2) * blockSize, 5 * blockSize, blockSize)
                ctx.fillRect(entry.x * blockSize, entry.y * blockSize, blockSize, blockSize)
                alreadySeens.push(entry)
            }
        }
    })
}

function addEncoding(
    ctx: CanvasRenderingContext2D, 
    blockSize: number, 
    blockNumber: number, 
    encoding: number[]
): void {
    const startX = (blockNumber - 2) * blockSize;
    const startY = (blockNumber - 2) * blockSize;
    
    // 2x2 square corresponding the encoding part of the qr
    const positions = [
        { x: 0, y: 0 }, // top-left
        { x: 1, y: 0 }, // top-right
        { x: 0, y: 1 }, // bottom-left
        { x: 1, y: 1 }  // bottom-right
    ];
    
    encoding.forEach((bit, index) => {
        if (index < positions.length) { 
            const pos = positions[index];
            if(!pos) {
                throw new Error("Error while encoding : unaccessible pos, maybe unknown uncoding type")
            }
            const x = startX + pos.x * blockSize;
            const y = startY + pos.y * blockSize;
            
            if (bit === 1) {
                ctx.fillRect(x, y, blockSize, blockSize);
            }
        }
    });
}

function findBestConfig(
    textLength: number,
    encodingType: string,
    errorCorrectionLevel: string
): VersionConfig {
    // Define valid encoding types and error correction levels
    type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
    
    // Validate inputs
    // We currently only handle binary encoding type
    if (encodingType !== 'binary') {
        throw new Error(`Unsupported encoding type: ${encodingType}`);
    }
    
    if (!['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
        throw new Error(`Unsupported error correction level: ${errorCorrectionLevel}`);
    }
    
    const ecLevel = errorCorrectionLevel as ErrorCorrectionLevel;
    
    // Iterate through all available versions to find the best fit
    for (let version = 1; version <= 10; version++) {
        const versionKey = `v${version}`;
        const versionConfig = qrConfigMatrix[versionKey];
        
        if (versionConfig && versionConfig.binary[ecLevel]) {
            const capacity = versionConfig.binary[ecLevel];
            if (textLength <= capacity) {
                return {
                    version: versionKey, 
                    module: versionConfig.module,
                    errorCorrectionLevel: versionConfig.binary
                };
            }
        }
    }

    // If text is too long for our supported versions
    throw new Error(`Text too long (${textLength} chars) for ${encodingType} encoding with ${errorCorrectionLevel} error correction.`);
}