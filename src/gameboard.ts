/// <reference path="gamescreen.ts" />
/// <reference path="levelfactory.ts" />
/// <reference path="tetrisBlocks.ts" />

class GameBoard extends GameScreen {
  entities: Entity[];
  players: Player[];
  levelFactory: LevelFactory;
  private collisionManager: CollisionManager;
  private cameraOffset: number = 0;
  private scrollSpeed: number = 2;

  constructor() {
    super(); // Anropa basklassens konstruktor
    this.players = [
      new Player(createVector(100, height * 0.3), 1, "red", "green", {
        UP: UP_ARROW,
        DOWN: DOWN_ARROW,
        RIGHT: RIGHT_ARROW,
        LEFT: LEFT_ARROW,
      }),
      new Player(createVector(100, height * 0.7), 2, "blue", "orange", {
        UP: 87,
        DOWN: 83,
        RIGHT: 68,
        LEFT: 65,
      }),
    ];

    this.levelFactory = new LevelFactory();
    //initialize
    this.collisionManager = new CollisionManager(this.players);

    this.entities = [
      new Heart(),
      new Star(),
      new Ghost(),
      new Plant(),
      new TetrisBlock(),
    ];
  }

  addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity): void {
    this.entities = this.entities.filter((e) => e !== entity);
  }

  public update(): void {
    this.cameraOffset += this.scrollSpeed;

    for (const player of this.players) {
      player.update();
      this.collisionManager.checkCollision(player, this.cameraOffset);
    }

    for (const entity of this.entities) {
      entity.update();
    }

    this.flyingGhost();
  }

  private flyingGhost(): void {
    for (const entity of this.entities) {
      if (entity instanceof Ghost) {
        entity.update();
      }
    }
  }

  draw(): void {
    background("#577BC1"); // Ange bakgrundsfärg
    this.levelFactory.draw(this.cameraOffset);
    this.collisionManager.draw(this.cameraOffset);
    //console.log("Drawing GameBoard");
    for (const entity of this.entities) {
      if (entity instanceof TetrisBlock) {
        entity.draw(this.cameraOffset);
      } else {
        entity.draw();
      }
      for (const player of this.players) {
        player.draw();
      }
    }
  }
}
