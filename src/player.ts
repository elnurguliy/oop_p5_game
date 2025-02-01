/// <reference path="entity.ts" />

/**
 * TODO: Lägg till JSDoc för klassen Player, dess konstruktor och metoder.
 */
interface KeyBindings {
  UP: number;
  DOWN: number;
  RIGHT: number;
  LEFT: number;
}

class Player extends Entity {
  public trail: p5.Vector[];
  public playerNumber: number;
  private trailFillColor: string;
  private trailStrokeColor: string;
  private moveTimer: number;
  private nextDirection: p5.Vector;
  private keyBindings: KeyBindings;

  public lives: number;
  public maxLives: number;
  public lastCollisionTime: number; // Tidpunkt för senaste kollision
  public collisionCooldown: number; // Cooldown-tid i millisekunder
  public scoreMultiplier: number;
  public canPassThroughObstacles: boolean;

  public isMoving: boolean;
  public isColliding: boolean = false;

  getPlayerNumber(): number {
    return this.playerNumber;
  }

  constructor(
    position: p5.Vector,
    playerNumber: number,
    trailFillColor: string,
    trailStrokeColor: string,
    keyBindings: KeyBindings
  ) {
    const size = createVector(32, 32);
    position.x = position.x + 16;
    position.y = position.y + 16;
    super(position, size, 0, 0, createVector(0, 500), undefined);
    this.trail = [
      createVector(this.position.x - size.x, this.position.y),
      createVector(this.position.x - size.x * 2, this.position.y),
      createVector(this.position.x - size.x * 3, this.position.y),
      createVector(this.position.x - size.x * 4, this.position.y),
      createVector(this.position.x - size.x * 5, this.position.y),
      createVector(this.position.x - size.x * 6, this.position.y),
      createVector(this.position.x - size.x * 7, this.position.y),
      createVector(this.position.x - size.x * 8, this.position.y),
    ];
    this.playerNumber = playerNumber;
    this.trailFillColor = trailFillColor;
    this.trailStrokeColor = trailStrokeColor;
    this.moveTimer = 0;
    this.direction = createVector(32, 0);
    this.nextDirection = this.direction.copy();
    this.keyBindings = keyBindings;

    this.isMoving = true;

    this.lives = 3;
    this.maxLives = 10;
    this.lastCollisionTime = 0; // Tidpunkt för senaste kollision
    this.collisionCooldown = 1000; // 1 sekunds cooldown
    this.scoreMultiplier = 1; // Standard multiplikator
    this.canPassThroughObstacles = false; // Inaktiverad hinderpassering som standard
  }

  private handleInput(): void {
    // Lyssnar på tangenttryckningar och sätter nästa riktning

    if (keyIsDown(this.keyBindings.UP) && this.direction.y === 0) {
      this.nextDirection = createVector(0, -32); // Upp
    } else if (keyIsDown(this.keyBindings.DOWN) && this.direction.y === 0) {
      this.nextDirection = createVector(0, 32); // Ner
    } else if (keyIsDown(this.keyBindings.LEFT) && this.direction.x === 0) {
      this.nextDirection = createVector(-32, 0); // Vänster
    } else if (keyIsDown(this.keyBindings.RIGHT) && this.direction.x === 0) {
      this.nextDirection = createVector(32, 0); // Höger
    }
  }

  // Update players state and position
  update(): void {
    if (!this.isMoving) {
      return;
    }
    this.moveTimer += deltaTime;
    if (this.moveTimer >= 200) {
      // ↓ Justera this value att ändra hastigheten på spelaren
      this.moveTimer = -20;

      this.direction = this.nextDirection.copy();
      const head = this.trail[0];
      const newHead = createVector(
        head.x + this.direction.x,
        head.y + this.direction.y
      );
      this.trail.unshift(newHead);
      this.trail.pop();
    }

    this.handleInput();
  }

  draw(): void {
    push();
    strokeWeight(0);

    for (let i = 0; i < this.trail.length; i++) {
      const position = this.trail[i];
      let diameter = Math.max(this.size.x, this.size.y);

      // Add shadow effect
      drawingContext.shadowBlur = 15;
      drawingContext.shadowColor = "rgba(0, 0, 0, 0.3)";
      drawingContext.shadowOffsetX = 5;
      drawingContext.shadowOffsetY = 5;

      // Create 3D gradient effect
      let ctx = drawingContext;
      let gradient = ctx.createRadialGradient(
        position.x - diameter * 0.3,
        position.y - diameter * 0.3,
        diameter * 0.1,
        position.x,
        position.y,
        diameter * 0.8
      );

      if (i === 0) {
        // Head segment with more pronounced 3D effect
        gradient.addColorStop(0, "#FFE5CC");
        gradient.addColorStop(0.3, "#FFA500");
        gradient.addColorStop(1, "#804600");
      } else {
        // Body segments with darker colors
        gradient.addColorStop(
          0,
          lerpColor(
            color(this.trailFillColor),
            color("#ffffff"),
            0.2
          ).toString()
        ); // Less highlight
        gradient.addColorStop(0.3, this.trailFillColor); // Main color
        gradient.addColorStop(
          1,
          lerpColor(color(this.trailStrokeColor), color(0), 0.7).toString()
        ); // Darker shadow
      }

      ctx.fillStyle = gradient;
      noStroke();
      ellipse(position.x, position.y, diameter, diameter);

      // Reset shadow for next iteration
      drawingContext.shadowBlur = 0;
      drawingContext.shadowOffsetX = 0;
      drawingContext.shadowOffsetY = 0;
    }

    pop();
  }

  // NYA METODER

  /**
   * Lägger till poäng till spelaren.
   * @param {number} points - Antal poäng att lägga till
   */
  public addScore(points: number): void {
    const totalPoints = points * this.scoreMultiplier;
    console.log(`Player ${this.playerNumber} gained ${totalPoints} points!`);
  }

  /**
   * Tillåter spelaren att passera hinder under en viss tidsperiod.
   * @param {number} duration - Tiden i millisekunder
   */
  public enableObstaclePassing(duration: number): void {
    this.canPassThroughObstacles = true;
    console.log(`Player ${this.playerNumber} can now pass through obstacles`);

    setTimeout(() => {
      this.canPassThroughObstacles = false;
      console.log(
        `Player ${this.playerNumber} can no longer pass through obstacles`
      );
    }, duration);
  }

  /**
   * Fördubblar antalet liv sedan klipper vid maxgräns.
   */
  doubleLives(): void {
    this.lives = Math.min(this.lives * 2, this.maxLives);
    console.log(`Player ${this.playerNumber} now has ${this.lives} lives.`);
  }
}
