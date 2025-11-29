export class Projectile {
  public x: number
  public y: number
  public vx: number
  public vy: number
  public owner: 'player' | 'bot' | 'enemy'
  public damage: number
  public radius: number = 5

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    owner: 'player' | 'bot' | 'enemy',
    damage: number
  ) {
    this.x = x
    this.y = y
    this.vx = vx
    this.vy = vy
    this.owner = owner
    this.damage = damage
  }

  public update(dt: number) {
    this.x += this.vx * dt
    this.y += this.vy * dt
  }

  public render(ctx: CanvasRenderingContext2D) {
    let color = '#ffffff'

    switch (this.owner) {
      case 'player':
        color = '#00ffff'
        break
      case 'bot':
        color = '#00ff88'
        break
      case 'enemy':
        color = '#ff4444'
        break
    }

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Trail effect
    ctx.fillStyle = color + '40'
    ctx.beginPath()
    ctx.arc(this.x - this.vx * 0.01, this.y - this.vy * 0.01, this.radius * 0.7, 0, Math.PI * 2)
    ctx.fill()
  }
}
