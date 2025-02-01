interface Obstacle {
  row: number;
  col: number;
  color: string;
}

interface GridPosition {
  row: number;
  col: number;
}

class CollisionManager {
  players: Player[];
  entities: Entity[];
  scoreManager: ScoreManager;
  private removeEntityCallback: (entity: Entity) => void; // Callback-funktion

  constructor(
    players: Player[],
    entities: Entity[],
    scoreManager: ScoreManager,
    removeEntityCallback: (entity: Entity) => void // Add this parameter
  ) {
    this.players = players;
    this.entities = entities;
    this.scoreManager = scoreManager;
    this.removeEntityCallback = removeEntityCallback; // Spara callback
  }

  private handleTetrisCollision(player: Player): void {
    sounds.blockCollision.play();
    if (music.backgroundMusic.isPlaying()) {
      music.backgroundMusic.stop();
    }

    player.isColliding = true;
    player.isMoving = false;
    console.log(`Player ${player.playerNumber} collided with a TetrisBlock.`);

    this.showGameOver(player.playerNumber);
  }

  private handleBlockCollision(player: Player): void {
    sounds.wallCollision.play();
    if (music.backgroundMusic.isPlaying()) {
      music.backgroundMusic.stop();
    }
    player.isColliding = true;
    player.isMoving = false;
    console.log(`Player ${player.playerNumber} collided with a TetrisBlock.`);

    this.showGameOver(player.playerNumber);
  }

  private handleWinBlockCollision(player: Player): void {
    sounds.goalline.play();
    if (music.backgroundMusic.isPlaying()) {
      music.backgroundMusic.stop();
    }

    player.isColliding = true;
    player.isMoving = false;
    console.log(`Player ${player.playerNumber} won!`);
    const otherPlayerNumber = player.playerNumber === 1 ? 2 : 1;
    this.showGameOver(otherPlayerNumber);
  }

  private handleStarCollision(player: Player, star: Entity): void {
    if (star.isRemoved) return; // Prevent multiple collections
    sounds.starPickUp.play();
    player.isColliding = true;

    player.scoreMultiplier = 2;

    const scoreInterval = setInterval(() => {
      this.scoreManager.updateScore(
        player.getPlayerNumber(),
        50 * player.scoreMultiplier
      ); // Multiplicera poäng med multiplier
    }, 1000);

    setTimeout(() => {
      player.scoreMultiplier = 1;
      clearInterval(scoreInterval);
      console.log(`Player ${player.playerNumber}'s score multiplier reset.`);
    }, 10000);

    star.isRemoved = true;
    this.removeEntityCallback(star);
    console.log(`Star entity removed:`, star);
  }

  private handleHeartCollision(player: Player, heart: Entity): void {
    if (heart.isRemoved) return; // Prevent multiple collections

    sounds.gainheart.play();
    player.isColliding = true;
    console.log(`Player ${player.playerNumber} collected a Heart!`);

    if (player.lives < player.maxLives) {
      player.lives += 1;
    }
    heart.isRemoved = true; // Mark heart as removed
    this.removeEntityCallback(heart);
    console.log(`Heart entity removed:`, heart); // Added logging
  }

  private handlePlantCollision(player: Player): void {
    const currentTime = Date.now();

    // Kontrollera om cooldown-perioden har passerat
    if (currentTime - player.lastCollisionTime < player.collisionCooldown) {
      return; // Ignorera kollisionen om cooldown inte är klar
    }

    // Uppdatera tidpunkten för senaste kollision
    player.lastCollisionTime = currentTime;

    console.log(`Player lives before collision: ${player.lives}`); // Debuggning
    sounds.blockCollision.play();
    player.isColliding = true;

    player.lives -= 2;

    console.log(`Player lives after collision: ${player.lives}`); // Debuggning

    // Se till att liv inte går under 0
    if (player.lives < 0) {
      player.lives = 0;
    }

    // Kontrollera om livet är mindre än eller lika med 0 för att visa Game Over
    if (player.lives <= 0) {
      if (music.backgroundMusic.isPlaying()) {
        music.backgroundMusic.stop();
      }

      this.showGameOver(player.playerNumber);
    }
  }

  private handleGhostProximity(player: Player, ghost: Entity) {
    const distance = dist(
      player.trail[0].x,
      player.trail[0].y,
      ghost.position.x,
      ghost.position.y
    );

    if (distance < 200) {
      console.log("Ghost is near, playing sound...");

      // if (!ghost.isSoundPlaying) {
      //   sounds.ghost.play();
      //   ghost.isSoundPlaying = true;
      //   console.log("Ghost sound started");
      // } else {
      //   if (ghost.isSoundPlaying) {
      //     sounds.ghost.stop();
      //     ghost.isSoundPlaying = false;
      //     console.log("Ghost sound stopped");
      //   }
      // }
    }
  }

  private handleGhostCollision(player: Player): void {
    const currentTime = Date.now();

    // Cooldown för kollisioner
    if (currentTime - player.lastCollisionTime > 2000) {
      // 1 sekunds cooldown
      player.isColliding = true;
      player.lives -= 1;

      if (player.lives < 0) {
        player.lives = 0;
      }

      if (player.lives === 0) {
        this.showGameOver(player.playerNumber);
      }

      // Ta bort poäng vid faktisk kollision
      this.scoreManager.updateScore(player.getPlayerNumber(), -5);

      // Uppdatera tidpunkten för senaste kollision
      player.lastCollisionTime = currentTime;
    }
  }

  checkCollision(): void {
    for (const player of this.players) {
      const head = player.trail[0];
      const headLeft = head.x;
      const headRight = head.x + player.size.x;
      const headTop = head.y;
      const headBottom = head.y + player.size.y;

      // Flagga för att spåra om en kollision upptäcks
      let hasCollision = false;

      for (const entity of this.entities) {
        if (entity instanceof Ghost) {
          this.handleGhostProximity(player, entity);
        }

        const entityLeft = entity.position.x;
        const entityRight = entity.position.x + entity.size.x;
        const entityTop = entity.position.y;
        const entityBottom = entity.position.y + entity.size.y;

        // Kontrollera om ormens huvud överlappar blockets kant
        const isColliding =
          headRight > entityLeft &&
          headLeft < entityRight &&
          headBottom > entityTop &&
          headTop < entityBottom;

        if (isColliding) {
          hasCollision = true; // Markera att en kollision upptäckts

          if (!player.isColliding) {
            // Hantera kollision baserat på entitetstyp
            if (entity instanceof TetrisBlock) {
              this.handleTetrisCollision(player);
            } else if (entity instanceof Block) {
              this.handleBlockCollision(player);
            } else if (entity instanceof Star) {
              this.handleStarCollision(player, entity);
            } else if (entity instanceof Heart) {
              this.handleHeartCollision(player, entity);
            } else if (entity instanceof Plant) {
              this.handlePlantCollision(player);
            } else if (entity instanceof Ghost) {
              this.handleGhostCollision(player);
            } else if (entity instanceof WinBlock) {
              this.handleWinBlockCollision(player);
            }

            // Avsluta loopen för entiteter eftersom kollision upptäcktes
            break;
          }
        }

        // Återställ kollisionen om ingen upptäcktes
        if (!hasCollision) {
          player.isColliding = false;
        }
      }
    }
  }

  private showGameOver(losingPlayer: number): void {
    const winnerMessage =
      losingPlayer === 1
        ? " - Player 2"
        : losingPlayer === 2
        ? " - Player 1"
        : "Game Over!";

    game.changeScreen(new GameOverScreen(winnerMessage, this.scoreManager));
    console.log(winnerMessage);
  }

  showPopupMessage(message: string, duration: number = 3000): void {
    const popup = document.createElement("div");
    popup.innerText = message;
    popup.style.position = "absolute";
    popup.style.top = "10px"; // Placera det var du vill
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    popup.style.color = "white";
    popup.style.padding = "10px 20px";
    popup.style.borderRadius = "8px";
    popup.style.zIndex = "1000";
    document.body.appendChild(popup);

    setTimeout(() => {
      document.body.removeChild(popup);
    }, duration);
  }
}
