export function textToCanvas(canva: HTMLCanvasElement, text: string): void {
    let ctx: CanvasRenderingContext2D | null = canva.getContext("2d")

    if (!ctx) {
        throw new Error("Error getting canva context")
    }
    // Set line width
    ctx.lineWidth = 10;

    // Wall
    ctx.strokeRect(75, 140, 150, 110);

    // Door
    ctx.fillRect(130, 190, 40, 60);

    // Roof
    ctx.beginPath();
    ctx.moveTo(50, 140);
    ctx.lineTo(150, 60);
    ctx.lineTo(250, 140);
    ctx.closePath();
    ctx.stroke();
}