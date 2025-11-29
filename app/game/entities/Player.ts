import { Projectile } from './Projectile'
import { Obstacle } from './Obstacle'

export class Player {
  public x: number
  public y: number
  public radius: number = 20
  public health: number = 100
  public maxHealth: number = 100
  public speed: number = 250
  private shootCooldown: number = 0
  private shootDelay: number = 0.2

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public update(dt: number, keys: Set<string>, mouse: { x: number; y: number }, obstacles: Obstacle[]) {
    let dx = 0
    let dy = 0

    if (keys.has('w')) dy -= 1
    if (keys.has('s')) dy += 1
    if (keys.has('a')) dx -= 1
    if (keys.has('d')) dx += 1

    if (dx !== 0 || dy !== 0) {
      const length = Math.sqrt(dx * dx + dy * dy)
      dx /= length
      dy /= length

      const newX = this.x + dx * this.speed * dt
      const newY = this.y + dy * this.speed * dt

      if (!this.checkCollision(newX, this.y, obstacles)) {
        this.x = newX
      }
      if (!this.checkCollision(this.x, newY, obstacles)) {
        this.y = newY
      }
    }

    this.shootCooldown = Math.max(0, this.shootCooldown - dt)
  }

  private checkCollision(x: number, y: number, obstacles: Obstacle[]): boolean {
    return obstacles.some(obs =>
      x + this.radius > obs.x &&
      x - this.radius < obs.x + obs.width &&
      y + this.radius > obs.y &&
      y - this.radius < obs.y + obs.height
    )
  }

  public canShoot(): boolean {
    return this.shootCooldown <= 0
  }

  public shoot(targetX: number, targetY: number): Projectile | null {
    if (!this.canShoot()) return null

    this.shootCooldown = this.shootDelay

    const dx = targetX - this.x
    const dy = targetY - this.y
    const length = Math.sqrt(dx * dx + dy * dy)

    return new Projectile(
      this.x,
      this.y,
      (dx / length) * 800,
      (dy / length) * 800,
      'player',
      25
    )
  }

  public takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Player body
    ctx.fillStyle = '#00aaff'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Player outline
    ctx.strokeStyle = '#00ffff'
    ctx.lineWidth = 3
    ctx.stroke()

    // Health bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(this.x - 25, this.y - 35, 50, 6)
    ctx.fillStyle = this.health > 50 ? '#00ff88' : '#ff4444'
    ctx.fillRect(this.x - 25, this.y - 35, (this.health / this.maxHealth) * 50, 6)
  }
}
