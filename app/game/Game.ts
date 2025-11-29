import { Player } from './entities/Player'
import { Bot } from './entities/Bot'
import { Enemy } from './entities/Enemy'
import { Projectile } from './entities/Projectile'
import { Obstacle } from './entities/Obstacle'

export interface GameSettings {
  damageMultiplier: number
  movementSpeed: 'Standard' | 'Fast' | 'Very Fast'
}

export class Game {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private animationId: number = 0
  private lastTime: number = 0
  private isPaused: boolean = false

  private player: Player
  private bots: Bot[] = []
  private enemies: Enemy[] = []
  private projectiles: Projectile[] = []
  private obstacles: Obstacle[] = []

  private settings: GameSettings
  private keys: Set<string> = new Set()
  private mouse: { x: number; y: number; pressed: boolean } = { x: 0, y: 0, pressed: false }

  constructor(canvas: HTMLCanvasElement, settings: GameSettings) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.settings = settings

    this.player = new Player(100, 100)

    // Create bot teammates
    this.bots = [
      new Bot(150, 150, 'Alpha', this.settings),
      new Bot(50, 150, 'Bravo', this.settings),
      new Bot(100, 200, 'Charlie', this.settings)
    ]

    // Create obstacles
    this.createObstacles()

    // Spawn initial enemies
    this.spawnEnemies()

    this.setupEventListeners()
  }

  private createObstacles() {
    const obstaclePositions = [
      { x: 400, y: 300, w: 100, h: 100 },
      { x: 700, y: 200, w: 150, h: 80 },
      { x: 1000, y: 400, w: 120, h: 120 },
      { x: 300, y: 600, w: 80, h: 200 },
      { x: 1200, y: 700, w: 200, h: 100 },
      { x: 1500, y: 300, w: 100, h: 150 },
    ]

    this.obstacles = obstaclePositions.map(pos => new Obstacle(pos.x, pos.y, pos.w, pos.h))
  }

  private spawnEnemies() {
    const spawnPoints = [
      { x: 1700, y: 200 },
      { x: 1600, y: 800 },
      { x: 1800, y: 500 },
      { x: 1500, y: 100 },
      { x: 1750, y: 900 }
    ]

    spawnPoints.forEach(point => {
      this.enemies.push(new Enemy(point.x, point.y))
    })
  }

  private setupEventListeners() {
    window.addEventListener('keydown', (e) => this.keys.add(e.key.toLowerCase()))
    window.addEventListener('keyup', (e) => this.keys.delete(e.key.toLowerCase()))

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width)
      this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height)
    })

    this.canvas.addEventListener('mousedown', () => this.mouse.pressed = true)
    this.canvas.addEventListener('mouseup', () => this.mouse.pressed = false)
  }

  public updateSettings(settings: GameSettings) {
    this.settings = settings
    this.bots.forEach(bot => bot.updateSettings(settings))
  }

  public start() {
    this.lastTime = performance.now()
    this.gameLoop(this.lastTime)
  }

  public stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }

  public pause() {
    this.isPaused = true
  }

  public resume() {
    this.isPaused = false
  }

  private gameLoop = (currentTime: number) => {
    this.animationId = requestAnimationFrame(this.gameLoop)

    if (this.isPaused) return

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1)
    this.lastTime = currentTime

    this.update(deltaTime)
    this.render()
  }

  private update(dt: number) {
    // Update player
    this.player.update(dt, this.keys, this.mouse, this.obstacles)

    // Player shooting
    if (this.mouse.pressed && this.player.canShoot()) {
      const projectile = this.player.shoot(this.mouse.x, this.mouse.y)
      if (projectile) this.projectiles.push(projectile)
    }

    // Update bots with AI
    this.bots.forEach(bot => {
      bot.update(dt, this.player, this.enemies, this.obstacles, this.bots)

      // Bot shooting
      if (bot.shouldShoot()) {
        const projectile = bot.shoot()
        if (projectile) this.projectiles.push(projectile)
      }
    })

    // Update enemies
    this.enemies.forEach(enemy => {
      enemy.update(dt, this.player, this.bots, this.obstacles)

      if (enemy.canShoot()) {
        const projectile = enemy.shoot(this.player)
        if (projectile) this.projectiles.push(projectile)
      }
    })

    // Update projectiles
    this.projectiles = this.projectiles.filter(proj => {
      proj.update(dt)

      // Check collision with obstacles
      if (this.checkObstacleCollision(proj)) {
        return false
      }

      // Check if out of bounds
      if (proj.x < 0 || proj.x > this.canvas.width ||
          proj.y < 0 || proj.y > this.canvas.height) {
        return false
      }

      return true
    })

    // Check projectile collisions
    this.checkProjectileCollisions()

    // Remove dead entities
    this.enemies = this.enemies.filter(e => e.health > 0)
    this.bots = this.bots.filter(b => b.health > 0)

    // Respawn enemies if needed
    if (this.enemies.length < 3) {
      this.spawnEnemies()
    }
  }

  private checkObstacleCollision(proj: Projectile): boolean {
    return this.obstacles.some(obs =>
      proj.x > obs.x && proj.x < obs.x + obs.width &&
      proj.y > obs.y && proj.y < obs.y + obs.height
    )
  }

  private checkProjectileCollisions() {
    this.projectiles = this.projectiles.filter(proj => {
      // Player/Bot projectiles hitting enemies
      if (proj.owner === 'player' || proj.owner === 'bot') {
        for (const enemy of this.enemies) {
          if (this.checkEntityCollision(proj, enemy)) {
            const damage = proj.owner === 'bot'
              ? proj.damage * this.settings.damageMultiplier
              : proj.damage
            enemy.takeDamage(damage)
            return false
          }
        }
      }

      // Enemy projectiles hitting player/bots
      if (proj.owner === 'enemy') {
        if (this.checkEntityCollision(proj, this.player)) {
          this.player.takeDamage(proj.damage)
          return false
        }

        for (const bot of this.bots) {
          if (this.checkEntityCollision(proj, bot)) {
            bot.takeDamage(proj.damage)
            return false
          }
        }
      }

      return true
    })
  }

  private checkEntityCollision(proj: Projectile, entity: { x: number; y: number; radius: number }): boolean {
    const dx = proj.x - entity.x
    const dy = proj.y - entity.y
    return Math.sqrt(dx * dx + dy * dy) < entity.radius + 5
  }

  private render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a0a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw grid
    this.drawGrid()

    // Draw obstacles
    this.obstacles.forEach(obs => obs.render(this.ctx))

    // Draw entities
    this.projectiles.forEach(proj => proj.render(this.ctx))
    this.enemies.forEach(enemy => enemy.render(this.ctx))
    this.bots.forEach(bot => bot.render(this.ctx))
    this.player.render(this.ctx)

    // Draw UI
    this.drawUI()
  }

  private drawGrid() {
    this.ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    this.ctx.lineWidth = 1

    for (let x = 0; x < this.canvas.width; x += 50) {
      this.ctx.beginPath()
      this.ctx.moveTo(x, 0)
      this.ctx.lineTo(x, this.canvas.height)
      this.ctx.stroke()
    }

    for (let y = 0; y < this.canvas.height; y += 50) {
      this.ctx.beginPath()
      this.ctx.moveTo(0, y)
      this.ctx.lineTo(this.canvas.width, y)
      this.ctx.stroke()
    }
  }

  private drawUI() {
    // Bot status
    let yOffset = 120
    this.bots.forEach(bot => {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)'
      this.ctx.fillRect(20, yOffset, 200, 60)

      this.ctx.fillStyle = '#00ff88'
      this.ctx.font = 'bold 14px monospace'
      this.ctx.fillText(`BOT ${bot.name}`, 30, yOffset + 20)

      // Health bar
      this.ctx.fillStyle = '#333'
      this.ctx.fillRect(30, yOffset + 30, 180, 15)
      this.ctx.fillStyle = bot.health > 50 ? '#00ff88' : '#ff4444'
      this.ctx.fillRect(30, yOffset + 30, (bot.health / 100) * 180, 15)

      yOffset += 70
    })

    // Enemy counter
    this.ctx.fillStyle = 'rgba(0,0,0,0.7)'
    this.ctx.fillRect(this.canvas.width - 220, 20, 200, 50)
    this.ctx.fillStyle = '#ff4444'
    this.ctx.font = 'bold 16px monospace'
    this.ctx.fillText(`ENEMIES: ${this.enemies.length}`, this.canvas.width - 200, 50)
  }
}
