export class Obstacle {
  public x: number
  public y: number
  public width: number
  public height: number

  constructor(x: number, y: number, width: number, height: number) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Main obstacle
    ctx.fillStyle = '#2a2a3a'
    ctx.fillRect(this.x, this.y, this.width, this.height)

    // Border
    ctx.strokeStyle = '#444455'
    ctx.lineWidth = 3
    ctx.strokeRect(this.x, this.y, this.width, this.height)

    // Highlight
    ctx.fillStyle = 'rgba(100, 100, 150, 0.3)'
    ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 8)
  }
}
