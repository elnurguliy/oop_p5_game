interface IMovable {
    position: p5.Vector;
    direction: p5.Vector;
  }
  

abstract class Entity implements IMovable {
  position: p5.Vector;
  size: p5.Vector;
  image: p5.Image;
  velocity: p5.Vector;
  direction: p5.Vector;

  constructor(
    position: p5.Vector,
    size: p5.Vector,
    image: p5.Image,
    velocityX: number,
    velocityY: number,
    direction: p5.Vector
  ) {
    this.position = createVector(position.x, position.y);
    this.size = createVector(size.x, size.y);
    this.velocity = createVector(velocityX, velocityY);
    this.direction = createVector(direction.x, direction.y);
    this.image = image;
  }

  draw(): void {
    push();

    image(
      this.image,
      this.position.x,
      this.position.y,
      this.size.x,
      this.size.y
    );

    pop();
  }

  update(): void {} 
}


//   move(): void {
//     if (typeof this.velocity === "number") {
//       this.position.add(this.direction.mult(this.velocity));
//     } else {
//       console.error("speed must be a number");
//     }
//   }
//   abstract update(): void;
// }
