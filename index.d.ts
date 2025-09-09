/**
 * Main function to render text as a QR code on an HTML canvas
 * @param canva HTML canvas element to draw on
 * @param text Text content to encode in the QR code
 * @param config Configuration options for QR code generation
 * @param config.isDebugContext Whether to show debug grid lines
 * @param config.encodingType Type of encoding (currently only 'binary' supported)
 * @param config.errorCorrectionLevel Error correction level ('L', 'M', 'Q', 'H')
 */
export declare function textToCanvas(canva: HTMLCanvasElement, text: string, config?: {
    isDebugContext?: boolean;
    encodingType?: string;
    errorCorrectionLevel?: string;
}): void;
//# sourceMappingURL=index.d.ts.map