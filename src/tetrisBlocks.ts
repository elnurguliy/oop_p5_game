class TetrisBlock extends Entity {
  private fallDelay: number;
  private fallCounter: number;
  /**
   * Creates a new instance of the TetrisBlock class.
   *
   * The TetrisBlock is given a random initial position, a fixed size, and the
   * image of a Tetris block. The initial velocity is set to (0, 0), and the
   * initial direction is set to (0, 0).
   */
  constructor() {
    super(
      createVector(random(width), random(height)),
      createVector(50, 70),
      images.tetris,
      0,
      1,
      createVector(0, 0)
    );

    this.fallDelay = 30;
    this.fallCounter = 0;
  }

  /**
   * Draws the Tetris block entity.
   *
   * This method is called by the game's draw loop. It will translate the
   * canvas to the Tetris block's position, and then draw the Tetris block's
   * image at the Tetris block's size.
   *
   * If the Tetris block's image is not loaded, it will log an error and do
   * nothing.
   */
  draw(): void {
    if (!this.image) {
      console.error("Ghost image not loaded");
      return;
    }

    push();
    translate(this.position.x, this.position.y);
    image(
      this.image,
      -this.size.x / 2,
      -this.size.y / 2,
      this.size.x,
      this.size.y
    );
    pop();
  }

  update(): void {
    this.fallCounter++;

    if (this.fallCounter >= this.fallDelay) {
      this.fallCounter = 0;

      this.position.y += this.size.y;

      if (this.position.y + this.size.y >= height) {
        this.position.y = this.size.y;
      }
    }
  }
}
