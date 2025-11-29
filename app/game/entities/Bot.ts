import { Projectile } from './Projectile'
import { Player } from './Player'
import { Enemy } from './Enemy'
import { Obstacle } from './Obstacle'
import { GameSettings } from '../Game'

export class Bot {
  public x: number
  public y: number
  public radius: number = 18
  public health: number = 100
  public maxHealth: number = 100
  public name: string
  private baseSpeed: number = 200
  private speed: number = 200
  private shootCooldown: number = 0
  private shootDelay: number = 0.35
  private targetEnemy: Enemy | null = null
  private moveTarget: { x: number; y: number } | null = null
  private coverPosition: { x: number; y: number } | null = null
  private state: 'follow' | 'engage' | 'cover' | 'flank' = 'follow'
  private stateTimer: number = 0
  private settings: GameSettings

  constructor(x: number, y: number, name: string, settings: GameSettings) {
    this.x = x
    this.y = y
    this.name = name
    this.settings = settings
    this.updateSpeed()
  }

  public updateSettings(settings: GameSettings) {
    this.settings = settings
    this.updateSpeed()
  }

  private updateSpeed() {
    switch (this.settings.movementSpeed) {
      case 'Fast':
        this.speed = this.baseSpeed * 1.5
        break
      case 'Very Fast':
        this.speed = this.baseSpeed * 2.0
        break
      default:
        this.speed = this.baseSpeed
    }
  }

  public update(
    dt: number,
    player: Player,
    enemies: Enemy[],
    obstacles: Obstacle[],
    otherBots: Bot[]
  ) {
    this.shootCooldown = Math.max(0, this.shootCooldown - dt)
    this.stateTimer -= dt

    // AI Decision Making
    this.updateAI(player, enemies, obstacles, otherBots)

    // Execute current behavior
    switch (this.state) {
      case 'follow':
        this.followPlayer(dt, player, obstacles)
        break
      case 'engage':
        this.engageEnemy(dt, obstacles)
        break
      case 'cover':
        this.provideCover(dt, player, obstacles)
        break
      case 'flank':
        this.flankEnemy(dt, obstacles)
        break
    }
  }

  private updateAI(player: Player, enemies: Enemy[], obstacles: Obstacle[], otherBots: Bot[]) {
    // Find nearest enemy
    let nearest: Enemy | null = null
    let minDist = Infinity

    enemies.forEach(enemy => {
      const dist = this.distanceTo(enemy.x, enemy.y)
      if (dist < minDist) {
        minDist = dist
        nearest = enemy
      }
    })

    this.targetEnemy = nearest

    // State machine
    if (this.stateTimer <= 0) {
      if (nearest && minDist < 400) {
        // Enemy nearby - decide between engage, cover, or flank
        const rand = Math.random()
        if (rand < 0.5) {
          this.state = 'engage'
          this.stateTimer = 3
        } else if (rand < 0.75) {
          this.state = 'cover'
          this.coverPosition = this.findCoverPosition(obstacles, player)
          this.stateTimer = 4
        } else {
          this.state = 'flank'
          this.moveTarget = this.calculateFlankPosition(nearest)
          this.stateTimer = 3
        }
      } else {
        // No enemies nearby - follow player
        this.state = 'follow'
        this.stateTimer = 2
      }
    }
  }

  private followPlayer(dt: number, player: Player, obstacles: Obstacle[]) {
    const offsetX = (Math.random() - 0.5) * 100
    const offsetY = (Math.random() - 0.5) * 100
    const targetX = player.x + offsetX
    const targetY = player.y + offsetY

    this.moveTowards(targetX, targetY, dt, obstacles)
  }

  private engageEnemy(dt: number, obstacles: Obstacle[]) {
    if (!this.targetEnemy) return

    // Strafe around enemy
    const angle = Math.atan2(this.targetEnemy.y - this.y, this.targetEnemy.x - this.x)
    const perpAngle = angle + Math.PI / 2
    const strafeX = this.x + Math.cos(perpAngle) * 50
    const strafeY = this.y + Math.sin(perpAngle) * 50

    this.moveTowards(strafeX, strafeY, dt, obstacles, 0.3)
  }

  private provideCover(dt: number, player: Player, obstacles: Obstacle[]) {
    if (this.coverPosition) {
      this.moveTowards(this.coverPosition.x, this.coverPosition.y, dt, obstacles)
    } else {
      this.followPlayer(dt, player, obstacles)
    }
  }

  private flankEnemy(dt: number, obstacles: Obstacle[]) {
    if (!this.moveTarget) return
    this.moveTowards(this.moveTarget.x, this.moveTarget.y, dt, obstacles)
  }

  private moveTowards(
    targetX: number,
    targetY: number,
    dt: number,
    obstacles: Obstacle[],
    speedMult: number = 1
  ) {
    const dx = targetX - this.x
    const dy = targetY - this.y
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist > 20) {
      const moveX = this.x + (dx / dist) * this.speed * speedMult * dt
      const moveY = this.y + (dy / dist) * this.speed * speedMult * dt

      if (!this.checkCollision(moveX, this.y, obstacles)) {
        this.x = moveX
      }
      if (!this.checkCollision(this.x, moveY, obstacles)) {
        this.y = moveY
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

  private findCoverPosition(obstacles: Obstacle[], player: Player): { x: number; y: number } {
    if (obstacles.length === 0) {
      return { x: player.x - 100, y: player.y }
    }

    const nearest = obstacles.reduce((prev, curr) => {
      const prevDist = this.distanceTo(prev.x, prev.y)
      const currDist = this.distanceTo(curr.x, curr.y)
      return currDist < prevDist ? curr : prev
    })

    return { x: nearest.x - 30, y: nearest.y + nearest.height / 2 }
  }

  private calculateFlankPosition(enemy: Enemy): { x: number; y: number } {
    const angle = Math.atan2(enemy.y - this.y, enemy.x - this.x)
    const flankAngle = angle + (Math.random() > 0.5 ? Math.PI / 2 : -Math.PI / 2)
    const dist = 200

    return {
      x: enemy.x + Math.cos(flankAngle) * dist,
      y: enemy.y + Math.sin(flankAngle) * dist
    }
  }

  private distanceTo(x: number, y: number): number {
    const dx = x - this.x
    const dy = y - this.y
    return Math.sqrt(dx * dx + dy * dy)
  }

  public shouldShoot(): boolean {
    if (!this.targetEnemy || this.shootCooldown > 0) return false

    const dist = this.distanceTo(this.targetEnemy.x, this.targetEnemy.y)
    return dist < 500
  }

  public shoot(): Projectile | null {
    if (!this.targetEnemy || this.shootCooldown > 0) return null

    this.shootCooldown = this.shootDelay

    const dx = this.targetEnemy.x - this.x
    const dy = this.targetEnemy.y - this.y
    const length = Math.sqrt(dx * dx + dy * dy)

    return new Projectile(
      this.x,
      this.y,
      (dx / length) * 700,
      (dy / length) * 700,
      'bot',
      20
    )
  }

  public takeDamage(amount: number) {
    this.health = Math.max(0, this.health - amount)
  }

  public render(ctx: CanvasRenderingContext2D) {
    // Bot body
    ctx.fillStyle = '#00ff88'
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fill()

    // Bot outline
    ctx.strokeStyle = '#00ffaa'
    ctx.lineWidth = 2
    ctx.stroke()

    // Health bar
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(this.x - 20, this.y - 30, 40, 5)
    ctx.fillStyle = this.health > 50 ? '#00ff88' : '#ff4444'
    ctx.fillRect(this.x - 20, this.y - 30, (this.health / this.maxHealth) * 40, 5)

    // State indicator
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(this.state.toUpperCase(), this.x, this.y + 35)
  }
}
