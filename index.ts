// QR Code capacity computation based on ISO/IEC 18004 standard
// Sources:
// - https://www.qrcode.com/en/about/version.html
// - ISO/IEC 18004:2015 Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification
// - https://en.wikipedia.org/wiki/QR_code
// - https://gcore.jsdelivr.net/gh/tonycrane/tonycrane.github.io/p/409d352d/ISO_IEC18004-2015.pdf

/**
 * Unified QR code specification combining capacity and error correction data
 * Based on ISO/IEC 18004 standard
 */
interface QRVersionSpec {
    version: number;
    module: number;
    totalCodewords: number;
    errorCorrection: {
        L: { dataCodewords: number; ecCodewords: number; blocks: number; dataPerBlock: number; ecPerBlock: number; };
        M: { dataCodewords: number; ecCodewords: number; blocks: number; dataPerBlock: number; ecPerBlock: number; };
        Q: { dataCodewords: number; ecCodewords: number; blocks: number; dataPerBlock: number; ecPerBlock: number; };
        H: { dataCodewords: number; ecCodewords: number; blocks: number; dataPerBlock: number; ecPerBlock: number; };
    };
    alignmentPositions: number[];
    /** Number of bits needed for character count indicator */
    numberOfBits: number;
}

/**
 * Complete QR specifications from ISO/IEC 18004
 * Combines capacity, error correction, and alignment data in one place
 */
const QR_SPECIFICATIONS: Record<number, QRVersionSpec> = {
    1: {
        version: 1,
        module: 21,
        totalCodewords: 26,
        errorCorrection: {
            L: { dataCodewords: 19, ecCodewords: 7, blocks: 1, dataPerBlock: 19, ecPerBlock: 7 },
            M: { dataCodewords: 16, ecCodewords: 10, blocks: 1, dataPerBlock: 16, ecPerBlock: 10 },
            Q: { dataCodewords: 13, ecCodewords: 13, blocks: 1, dataPerBlock: 13, ecPerBlock: 13 },
            H: { dataCodewords: 9, ecCodewords: 17, blocks: 1, dataPerBlock: 9, ecPerBlock: 17 }
        },
        alignmentPositions: [],
        numberOfBits: 8
    },
    2: {
        version: 2,
        module: 25,
        totalCodewords: 44,
        errorCorrection: {
            L: { dataCodewords: 34, ecCodewords: 10, blocks: 1, dataPerBlock: 34, ecPerBlock: 10 },
            M: { dataCodewords: 28, ecCodewords: 16, blocks: 1, dataPerBlock: 28, ecPerBlock: 16 },
            Q: { dataCodewords: 22, ecCodewords: 22, blocks: 1, dataPerBlock: 22, ecPerBlock: 22 },
            H: { dataCodewords: 16, ecCodewords: 28, blocks: 1, dataPerBlock: 16, ecPerBlock: 28 }
        },
        alignmentPositions: [6, 18],
        numberOfBits: 8
    },
    3: {
        version: 3,
        module: 29,
        totalCodewords: 70,
        errorCorrection: {
            L: { dataCodewords: 55, ecCodewords: 15, blocks: 1, dataPerBlock: 55, ecPerBlock: 15 },
            M: { dataCodewords: 44, ecCodewords: 26, blocks: 1, dataPerBlock: 44, ecPerBlock: 26 },
            Q: { dataCodewords: 34, ecCodewords: 36, blocks: 2, dataPerBlock: 17, ecPerBlock: 18 },
            H: { dataCodewords: 26, ecCodewords: 44, blocks: 2, dataPerBlock: 13, ecPerBlock: 22 }
        },
        alignmentPositions: [6, 22],
        numberOfBits: 8
    },
    4: {
        version: 4,
        module: 33,
        totalCodewords: 100,
        errorCorrection: {
            L: { dataCodewords: 80, ecCodewords: 20, blocks: 1, dataPerBlock: 80, ecPerBlock: 20 },
            M: { dataCodewords: 64, ecCodewords: 36, blocks: 2, dataPerBlock: 32, ecPerBlock: 18 },
            Q: { dataCodewords: 48, ecCodewords: 52, blocks: 2, dataPerBlock: 24, ecPerBlock: 26 },
            H: { dataCodewords: 36, ecCodewords: 64, blocks: 4, dataPerBlock: 9, ecPerBlock: 16 }
        },
        alignmentPositions: [6, 26],
        numberOfBits: 8
    },
    5: {
        version: 5,
        module: 37,
        totalCodewords: 134,
        errorCorrection: {
            L: { dataCodewords: 108, ecCodewords: 26, blocks: 1, dataPerBlock: 108, ecPerBlock: 26 },
            M: { dataCodewords: 86, ecCodewords: 48, blocks: 2, dataPerBlock: 43, ecPerBlock: 24 },
            Q: { dataCodewords: 62, ecCodewords: 72, blocks: 2, dataPerBlock: 31, ecPerBlock: 36 },
            H: { dataCodewords: 46, ecCodewords: 88, blocks: 2, dataPerBlock: 23, ecPerBlock: 44 }
        },
        alignmentPositions: [6, 30],
        numberOfBits: 8
    }
};

/**
 * Calculates module count for any QR version
 * Formula: modules = 21 + 4 × (version - 1)
 * @param version QR code version (1-40)
 * @returns Number of modules per side of the QR code
 */
function calculateModules(version: number): number {
    return 21 + 4 * (version - 1);
}

/**
 * Gets QR specification for a version, with fallback generation for missing versions
 * @param version QR code version (1-40)
 * @returns Complete QR specification including capacity, error correction, and alignment data
 */
function getQRSpec(version: number): QRVersionSpec {
    if (QR_SPECIFICATIONS[version]) {
        return QR_SPECIFICATIONS[version];
    }
    
    // This is a fallback handler created so the qr generator do not crash if a version config is not specified
    // This is a rough estimation and better handling would be to add the complete table from the ISO spec
    const module = calculateModules(version);
    const baseCapacity = Math.floor((module * module - 225) / 8); // Rough estimate
    
    return {
        version,
        module,
        totalCodewords: baseCapacity,
        errorCorrection: {
            L: { dataCodewords: Math.floor(baseCapacity * 0.77), ecCodewords: Math.floor(baseCapacity * 0.23), blocks: 1, dataPerBlock: Math.floor(baseCapacity * 0.77), ecPerBlock: Math.floor(baseCapacity * 0.23) },
            M: { dataCodewords: Math.floor(baseCapacity * 0.64), ecCodewords: Math.floor(baseCapacity * 0.36), blocks: 1, dataPerBlock: Math.floor(baseCapacity * 0.64), ecPerBlock: Math.floor(baseCapacity * 0.36) },
            Q: { dataCodewords: Math.floor(baseCapacity * 0.48), ecCodewords: Math.floor(baseCapacity * 0.52), blocks: 1, dataPerBlock: Math.floor(baseCapacity * 0.48), ecPerBlock: Math.floor(baseCapacity * 0.52) },
            H: { dataCodewords: Math.floor(baseCapacity * 0.34), ecCodewords: Math.floor(baseCapacity * 0.66), blocks: 1, dataPerBlock: Math.floor(baseCapacity * 0.34), ecPerBlock: Math.floor(baseCapacity * 0.66) }
        },
        alignmentPositions: version === 1 ? [] : [6, 6 + 4 * (version - 1)],
        numberOfBits: version < 10 ? 8 : 16
    };
}

/**
 * Main function to render text as a QR code on an HTML canvas
 * @param canva HTML canvas element to draw on
 * @param text Text content to encode in the QR code
 * @param config Configuration options for QR code generation
 * @param config.isDebugContext Whether to show debug grid lines
 * @param config.encodingType Type of encoding (currently only 'binary' supported)
 * @param config.errorCorrectionLevel Error correction level ('L', 'M', 'Q', 'H')
 */
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

    const versionSpec: QRVersionSpec = findBestConfig(textLen, encodingType, errorCorrectionLevel)
    const blockSize = getBlockSize(canva, versionSpec.module)
    
    console.debug(versionSpec)
    
    // For now, we only compute bytes since we use it for static url
    const bytesEncoding = [0, 1, 0, 0] // equivalent for 0b0100 but as a byte array
    addEncoding(ctx, blockSize, versionSpec.module, bytesEncoding)
    
    if (isDebugContext)
        addBlockGrid(ctx, versionSpec.module, blockSize)

    addQrAnchor(ctx, versionSpec.module, blockSize)
    addAlignementPattern(ctx, blockSize, versionSpec)
}

/**
 * Calculates the optimal block size for rendering QR code modules on canvas
 * Ensures the canvas width is evenly divisible by the number of modules
 * @param canva HTML canvas element
 * @param blockNumber Number of modules per side of the QR code
 * @returns Size in pixels for each QR code module
 */
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

/**
 * Draws a debug grid overlay on the QR code canvas
 * Useful for visualizing module boundaries during development
 * @param ctx Canvas 2D rendering context
 * @param blockNumber Number of modules per side
 * @param blockSize Size in pixels of each module
 */
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

/**
 * Draws the three finder patterns (position detection patterns) for QR codes
 * Located in top-left, top-right, and bottom-left corners
 * Also adds timing patterns and dark module as per ISO/IEC 18004
 * @param ctx Canvas 2D rendering context
 * @param blockNumber Number of modules per side
 * @param blockSize Size in pixels of each module
 */
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

/**
 * Draws alignment patterns for QR code versions 2 and above
 * Based on ISO/IEC 18004 Annex E alignment pattern positions
 * Alignment patterns help with accurate scanning of larger QR codes
 * @param ctx Canvas 2D rendering context
 * @param blockSize Size in pixels of each module
 * @param config QR version configuration containing alignment positions
 */
function addAlignementPattern(
    ctx: CanvasRenderingContext2D,
    blockSize: number,
    config: QRVersionSpec
): void {
    /**
     * Checks if coordinates conflict with finder patterns or other reserved areas
     * @param module Number of modules per side
     * @param coords X,Y coordinates to check
     * @returns True if coordinates are in a forbidden area
     */
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

    // Extract version number from config.version
    const versionNumber = config.version;
    const spec = getQRSpec(versionNumber);
    const alignmentPositions = spec.alignmentPositions;

    if (alignmentPositions.length === 0) return;

    const len = alignmentPositions.length;
    alignmentPositions.forEach((v, index) => {
        let alreadySeens: Array<{x: number, y: number}> = [];
        for (let i = 0; i < len; ++i) {
            let entry: {x: number, y: number} = {x: v, y: alignmentPositions[i]!};
            if (!alreadySeens.some(seen => seen.x === entry.x && seen.y === entry.y) && 
                !isCoordinateForbiden(config.module, entry)) {
                console.debug("entry: ", entry);
                // Draw alignment pattern (5x5 with hollow center)
                ctx.fillRect((entry.x - 2) * blockSize, (entry.y - 2) * blockSize, 5 * blockSize, blockSize);
                ctx.fillRect((entry.x - 2) * blockSize, (entry.y - 2) * blockSize, blockSize, 5 * blockSize);
                ctx.fillRect((entry.x + 2) * blockSize, (entry.y - 2) * blockSize, blockSize, 5 * blockSize);
                ctx.fillRect((entry.x - 2) * blockSize, (entry.y + 2) * blockSize, 5 * blockSize, blockSize);
                ctx.fillRect(entry.x * blockSize, entry.y * blockSize, blockSize, blockSize);
                alreadySeens.push(entry);
            }
        }
    });
}

/**
 * Adds encoding mode information in the bottom-right corner of the QR code
 * Uses a 2x2 grid to display the 4-bit encoding mode indicator
 * @param ctx Canvas 2D rendering context
 * @param blockSize Size in pixels of each module
 * @param blockNumber Number of modules per side
 * @param encoding 4-bit array representing the encoding mode (e.g., [0,1,0,0] for byte mode)
 */
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

/**
 * Finds the optimal QR code version and configuration for the given text length
 * Iterates through QR versions to find the smallest one that can accommodate the text
 * @param textLength Length of text to encode
 * @param encodingType Type of encoding (currently only 'binary' supported)
 * @param errorCorrectionLevel Error correction level ('L', 'M', 'Q', 'H')
 * @returns Version configuration with capacity and module information
 * @throws Error if text is too long for supported QR versions or invalid parameters
 */
function findBestConfig(
    textLength: number,
    encodingType: string,
    errorCorrectionLevel: string
): QRVersionSpec {
    // Define valid encoding types and error correction levels
    type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
    
    // Validate inputs
    if (encodingType !== 'binary') {
        throw new Error(`Unsupported encoding type: ${encodingType}`);
    }
    
    if (!['L', 'M', 'Q', 'H'].includes(errorCorrectionLevel)) {
        throw new Error(`Unsupported error correction level: ${errorCorrectionLevel}`);
    }
    
    const ecLevel = errorCorrectionLevel as ErrorCorrectionLevel;
    
    // Iterate through versions to find the best fit
    for (let version = 1; version <= 10; version++) {
        const spec = getQRSpec(version);
        const capacity = spec.errorCorrection[ecLevel].dataCodewords;
        
        if (textLength <= capacity) {
            return spec; // Return the complete QR specification
        }
    }

    // If text is too long for our supported versions
    throw new Error(`Text too long (${textLength} chars) for ${encodingType} encoding with ${errorCorrectionLevel} error correction.`);
}