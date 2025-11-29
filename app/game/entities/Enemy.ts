import { Projectile } from './Projectile'
import { Player } from './Player'
import { Bot } from './Bot'
import { Obstacle } from './Obstacle'

export class Enemy {
  public x: number
  public y: number
  public radius: number = 18
  public health: number = 80
  public maxHealth: number = 80
  private speed: number = 120
  private shootCooldown: number = 0
  private shootDelay: number = 1.2

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  public update(dt: number, player: Player, bots: Bot[], obstacles: Obstacle[]) {
    this.shootCooldown = Math.max(0, this.shootCooldown - dt)

    // Find nearest target (player or bot)
    let targetX = player.x
    let targetY = player.y
    let minDist = this.distanceTo(player.x, player.y)

    bots.forEach(bot => {
      const dist = this.distanceTo(bot.x, bot.y)
      if (dist < minDist) {
        minDist = dist
        targetX = bot.x
        targetY = bot.y
      }
    })

    // Move towards target if far away, strafe if close
    if (minDist > 300) {
      const dx = targetX - this.x
      const dy = targetY - this.y
      const length = Math.sqrt(dx * dx + dy * dy)

      const newX = this.x + (dx / length) * this.speed * dt
      const newY = this.y + (dy / length) * this.speed * dt

      if (!this.checkCollision(newX, this.y, obstacles)) {
        this.x = newX
      }
      if (!this.checkCollision(this.x, newY, obstacles)) {
        this.y = newY
      }
    } else {
      // Strafe
      const angle = Math.atan2(targetY - this.y, targetX - this.x)
      const perpAngle = angle + Math.PI / 2
      const strafeX = this.x + Math.cos(perpAngle) * this.speed * dt * 0.5
      const strafeY = this.y + Math.sin(perpAngle) * this.speed * dt * 0.5

      if (!this.checkCollision(strafeX, this.y, obstacles)) {
        this.x = strafeX
      }
      if (!this.checkCollision(this.x, strafeY, obstacles)) {
        this.y = strafeY
      }
    }
  }

  private checkCollision(x: number, y: number, obstacles: Obstacle[]): boolean {
    return obstacles.some(obs =>
      x + this.radius > obs.x &&
      x - this.radius < obs.x + obs.width &&
      y + this.radius > obs.y &&
      y - this.radius < obs.y + obs.height
    )
  }

  private distanceTo(x: number, y: number): number {
    const dx = x - this.x
    const dy = y - this.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  public canShoot(): boolean {
    return this.shootCooldown <= 0
  }

  public shoot(player: Player): Projectile | null {
    if (!this.canShoot()) return null

    this.shootCooldown = this.shootDelay

    const dx = player.x - this.x
    const dy = player.y - this.y
    const length = Math.sqrt(dx * dx + dy * dy)

    return new Projectile(
      this.x,
      this.y,
      (dx / length) * 500,
      (dy / length) * 500,
      'enemy',
      15
    )
  }

  public takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Enemy body
    ctx.fillStyle = '#ff4444'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Enemy outline
    ctx.strokeStyle = '#ff0000'
    ctx.lineWidth = 2
    ctx.stroke()

    // Health bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(this.x - 20, this.y - 30, 40, 5)
    ctx.fillStyle = this.health > 40 ? '#ff8888' : '#ff4444'
    ctx.fillRect(this.x - 20, this.y - 30, (this.health / this.maxHealth) * 40, 5)
  }
}
