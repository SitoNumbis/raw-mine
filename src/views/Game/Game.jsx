import { useEffect, useState, useRef } from "react";
import dungeoneer from "dungeoneer";

import * as PIXI from "pixi.js";

// context
import { useAudioController } from "../../context/AudioController";
import { useAudioConfig } from "../../context/AudioConfig";

// sprites
// character
// down
import down1 from "../../assets/images/character/down1.png";
import down2 from "../../assets/images/character/down2.png";
import left1 from "../../assets/images/character/left1.png";
import left2 from "../../assets/images/character/left2.png";
import right1 from "../../assets/images/character/right1.png";
import right2 from "../../assets/images/character/right2.png";
import up1 from "../../assets/images/character/up1.png";
import up2 from "../../assets/images/character/up2.png";

import spark from "../../assets/images/spark.gif";
import crate from "../../assets/images/wall.png";
import dirt from "../../assets/images/grass.png";

// utils
import app from "../../utils/app";
import CreateSpark from "../../utils/spark";
import { CreateEnemy, CreateMineral } from "../../utils/create";

// models
import Weapon, { WeaponsEnum } from "../../models/weapon";
import Player from "../../models/player";
import Collider from "../../models/collider";
import Drill, { DrillsEnum } from "../../models/drill";
import { AllDead } from "../../models/enemy";
// styles
import "./style.css";
import Bag, { BagsEnum } from "../../models/bag";

// textures
const d1 = new PIXI.Texture.from(down1);
const d2 = new PIXI.Texture.from(down2);
const u1 = new PIXI.Texture.from(up1);
const u2 = new PIXI.Texture.from(up2);
const l1 = new PIXI.Texture.from(left1);
const l2 = new PIXI.Texture.from(left2);
const r1 = new PIXI.Texture.from(right1);
const r2 = new PIXI.Texture.from(right2);

let playerX = 0;
let playerY = 0;

// character
const character = new PIXI.Sprite(d1);

character.width = 35;
character.height = 35;

let sparks = [];
let sparkXs = [];
let sparkYs = [];
let sparkCount = 0;
// let sparkA = CreateSpark(spark, playerX, playerY);

// keys intervals
let iDown = null;
let iRight = null;
let iLeft = null;
let iUp = null;
// fire
let fDown = null;
let fRight = null;
let fLeft = null;
let fUp = null;
// drill
let drillTimer = null;

// fire intervals
let fires = [];

// all colliders
let allColliders = [
  new Player(
    {
      name: "Sito",
      life: { max: 15, current: 15 },
      weapon: new Weapon(WeaponsEnum[4]),
      drill: new Drill(DrillsEnum[0]),
      bag: new Bag(BagsEnum[0]),
    },
    character
  ),
];
let allEnemies = [];
let allWalls = [];
let allMinerals = [];

const player = allColliders[0];

let onReload = false;

const seed = new Date().getTime();

/*const DungeonA = {
  rooms: [],
  tiles: Array<[]>,
  seed: seed,
};*/

const Game = () => {
  const ref = useRef(null);

  const { useConfigState, setAudioConfigState } = useAudioConfig();
  const { setAudioControllerState } = useAudioController();

  const [mousePosition, setMousePosition] = useState();
  const [showBag, setShowBag] = useState(false);
  const [attackSpeed, setAttackSpeed] = useState(player.Weapon.Reload);

  const [drill, setDrill] = useState(false);

  useEffect(() => {
    // init drill
    if (drill) {
      // clearing movements
      clearInterval(iRight);
      clearInterval(iDown);
      clearInterval(iLeft);
      clearInterval(iUp);
      // clearing fire
      clearInterval(fRight);
      clearInterval(fDown);
      clearInterval(fLeft);
      clearInterval(fUp);
      executeDrill();
    } else clearInterval(drillTimer);
  }, [drill]);

  const [w, setW] = useState(false);

  useEffect(() => {
    if (onReload)
      setTimeout(() => {
        onReload = false;
        setAudioControllerState({ type: "reloaded" });
      }, [attackSpeed]);
  }, [onReload]);

  useEffect(() => {
    if (!w) clearInterval(iUp);
    else {
      clearInterval(iRight);
      clearInterval(iDown);
      clearInterval(iLeft);
      executeMoveUp();
    }
  }, [w]);

  const [a, setA] = useState(false);

  useEffect(() => {
    if (!a) clearInterval(iLeft);
    else {
      clearInterval(iRight);
      clearInterval(iDown);
      clearInterval(iUp);
      executeMoveLeft();
    }
  }, [a]);

  const [d, setD] = useState(false);

  useEffect(() => {
    if (!d) clearInterval(iRight);
    else {
      clearInterval(iUp);
      clearInterval(iDown);
      clearInterval(iLeft);
      executeMoveRight();
    }
  }, [d]);

  const [s, setS] = useState(false);

  useEffect(() => {
    if (!s) clearInterval(iDown);
    else {
      clearInterval(iRight);
      clearInterval(iUp);
      clearInterval(iLeft);
      executeMoveDown();
    }
  }, [s]);

  const [up, setUp] = useState(false);

  useEffect(() => {
    if (!up) clearInterval(fUp);
    else {
      clearInterval(fRight);
      clearInterval(fDown);
      clearInterval(fLeft);
      executeFireUp();
    }
  }, [up]);

  const [left, setLeft] = useState(false);

  useEffect(() => {
    if (!left) clearInterval(fLeft);
    else {
      clearInterval(fUp);
      clearInterval(fDown);
      clearInterval(fRight);
      executeFireLeft();
    }
  }, [left]);

  const [right, setRight] = useState(false);

  useEffect(() => {
    if (!right) clearInterval(fRight);
    else {
      clearInterval(fLeft);
      clearInterval(fDown);
      clearInterval(fUp);
      executeFireRight();
    }
  }, [right]);

  const [down, setDown] = useState(false);

  useEffect(() => {
    if (!down) clearInterval(fDown);
    else {
      clearInterval(fRight);
      clearInterval(fUp);
      clearInterval(fLeft);
      executeFireDown();
    }
  }, [down]);

  const onClick = (e) => {
    const { global, button } = e.data;
    // mouseX = global.x;
    // mouseY = global.y;
    if (button === 2) {
      // collect();
    } else {
      // fire();
    }
  };

  // fire execution
  const executeFireUp = () => {
    if (!onReload) {
      setAudioControllerState({ type: "shot" });
      if (character.texture === u1) character.texture = u2;
      else character.texture = u1;
      onReload = true;
      sparkCount += 1;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });

      const index = fires.length;
      let newI = setInterval(() => {
        sparkYs[newLength] -= player.Weapon.Speed;
        if (
          sparkYs[newLength] < -10 ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    } else setAudioControllerState({ type: "reloading" });

    // reload and fire
    fUp = setInterval(() => {
      sparkCount += 1;
      setAudioControllerState({ type: "shot" });
      if (character.texture === u1) character.texture = u2;
      else character.texture = u1;
      onReload = true;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });
      const index = fires.length;
      let newI = setInterval(() => {
        sparkYs[newLength] -= player.Weapon.Speed;
        if (
          sparkYs[newLength] < -10 ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    }, player.Weapon.Reload);
  };

  const executeFireRight = () => {
    if (!onReload) {
      setAudioControllerState({ type: "shot" });
      if (character.texture === r1) character.texture = r2;
      else character.texture = r1;
      onReload = true;
      sparkCount += 1;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });

      const index = fires.length;
      let newI = setInterval(() => {
        sparkXs[newLength] += player.Weapon.Speed;
        if (
          sparkXs[newLength] > app.screen.width ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    } else setAudioControllerState({ type: "reloading" });

    // reload and fire
    fRight = setInterval(() => {
      sparkCount += 1;
      setAudioControllerState({ type: "shot" });
      if (character.texture === r1) character.texture = r2;
      else character.texture = r1;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });
      const index = fires.length;
      let newI = setInterval(() => {
        sparkXs[newLength] += player.Weapon.Speed;
        if (
          sparkXs[newLength] > app.screen.width ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    }, player.Weapon.Reload);
  };

  const executeFireDown = () => {
    if (!onReload) {
      setAudioControllerState({ type: "shot" });
      if (character.texture === d1) character.texture = d2;
      else character.texture = d1;
      onReload = true;
      sparkCount += 1;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });

      const index = fires.length;
      let newI = setInterval(() => {
        sparkYs[newLength] += player.Weapon.Speed;
        if (
          sparkYs[newLength] > app.screen.height ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    } else setAudioControllerState({ type: "reloading" });

    // reload and fire
    fDown = setInterval(() => {
      sparkCount += 1;
      setAudioControllerState({ type: "shot" });
      if (character.texture === d1) character.texture = d2;
      else character.texture = d1;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });
      const index = fires.length;
      let newI = setInterval(() => {
        sparkYs[newLength] += player.Weapon.Speed;
        if (
          sparkYs[newLength] < -10 ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    }, player.Weapon.Reload);
  };

  const executeFireLeft = () => {
    if (!onReload) {
      setAudioControllerState({ type: "shot" });
      if (character.texture === l1) character.texture = l2;
      else character.texture = l1;
      onReload = true;
      sparkCount += 1;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });

      const index = fires.length;
      let newI = setInterval(() => {
        sparkXs[newLength] -= player.Weapon.Speed;
        if (
          sparkXs[newLength] < -10 ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    } else setAudioControllerState({ type: "reloading" });

    // reload and fire
    fLeft = setInterval(() => {
      sparkCount += 1;
      setAudioControllerState({ type: "shot" });
      if (character.texture === l1) character.texture = l2;
      else character.texture = l1;
      const newLength = sparkCount;
      sparks[newLength] = CreateSpark(spark, playerX, playerY);
      sparkXs[newLength] = playerX + 10;
      sparkYs[newLength] = playerY + 10;
      app.stage.addChild(sparks[newLength]);

      app.ticker.add((delta) => {
        sparks[newLength].x = sparkXs[newLength];
        sparks[newLength].y = sparkYs[newLength];
      });
      const index = fires.length;
      let newI = setInterval(() => {
        sparkXs[newLength] -= player.Weapon.Speed;
        if (
          sparkXs[newLength] < -10 ||
          projectileCollision(sparks[newLength])
        ) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }, 1);
      fires.push(newI);
    }, player.Weapon.Reload);
  };

  // move execution
  const executeMoveUp = () => {
    if (playerY >= 5 && !colliderCollision(player.Sprite, "wall")) {
      iUp = setInterval(() => {
        if (character.texture === u1) character.texture = u2;
        else character.texture = u1;
        if (playerY >= 5 && !colliderCollision(player.Sprite, "wall"))
          playerY -= 1;
        else {
          playerY += 5;
        }
      }, 10);
    } else playerY += 7;
  };
  const executeMoveLeft = () => {
    if (playerX >= 5 && !colliderCollision(player.Sprite, "wall")) {
      iLeft = setInterval(() => {
        if (character.texture === l1) character.texture = l2;
        else character.texture = l1;
        if (playerX >= 5 && !colliderCollision(player.Sprite, "wall"))
          playerX -= 1;
        else playerX += 5;
      }, 10);
    } else playerX += 7;
  };
  const executeMoveRight = () => {
    if (
      playerX <= app.screen.width &&
      !colliderCollision(player.Sprite, "wall")
    ) {
      iRight = setInterval(() => {
        if (character.texture === r1) character.texture = r2;
        else character.texture = r1;
        if (
          playerX <= app.screen.width &&
          !colliderCollision(player.Sprite, "wall")
        )
          playerX += 1;
        else playerX -= 5;
      }, 10);
    } else playerX -= 7;
  };
  const executeMoveDown = () => {
    if (
      playerY <= app.screen.height &&
      !colliderCollision(player.Sprite, "wall")
    ) {
      iDown = setInterval(() => {
        if (character.texture === d1) character.texture = d2;
        else character.texture = d1;
        if (
          playerY <= app.screen.height &&
          !colliderCollision(player.Sprite, "wall")
        )
          playerY += 1;
        else playerY -= 5;
      }, 10);
    } else playerY -= 7;
  };

  const executeDrill = () => {
    if (colliderCollision(player.Sprite, "mineral")) {
      const mineral = colliderCollision(player.Sprite, "mineral");
      if (mineral !== false || mineral === 0) {
        setAudioControllerState({ type: "drill" });
        if (allMinerals[mineral].TakeDamage(player.Drill.Damage)) {
          app.stage.removeChild(allMinerals[mineral].Sprite);
          player.Bag.AddMineral(allMinerals[mineral]);
        }
      }
      drillTimer = setInterval(() => {
        const mineral = colliderCollision(player.Sprite, "mineral");
        if (mineral !== false || mineral === 0) {
          setAudioControllerState({ type: "drill" });
          if (allMinerals[mineral].TakeDamage(player.Drill.Damage)) {
            app.stage.removeChild(allMinerals[mineral].Sprite);
            player.Bag.AddMineral(allMinerals[mineral]);
          }
        }
      }, 1000);
    }
  };

  useEffect(() => {
    // initialization

    document.body.onkeydown = keyPress;
    document.body.onkeyup = keyRelease;
    // On first render add app to DOM
    ref.current.appendChild(app.view);
    // Start the PixiJS app
    app.start();

    // dungeon
    const dungeon = dungeoneer.build({
      width: app.screen.width,
      height: app.screen.height,
      seed,
    });
    // app.stage.addChild(sprite);
    const tiles = dungeon.tiles;
    for (let i = 0; i < 25; ++i) {
      for (let j = 0; j < 25; ++j) {
        if (tiles[i][j].type === "wall" || tiles[i][j].type === "door") {
          const wall = new PIXI.Sprite.from(dirt);
          wall.width = 45;
          wall.height = 45;
          wall.x = tiles[i][j].x * 45;
          wall.y = tiles[i][j].y * 45;
          wall.z = 1;
          app.stage.addChild(wall);
          // generation mineral
          const mineral = CreateMineral(wall.x, wall.y);
          if (mineral !== null) {
            allMinerals.push(mineral);
            app.stage.addChild(mineral.Sprite);
          }
          const enemy = CreateEnemy(wall.x, wall.y);
          if (enemy !== null) {
            allColliders.push(enemy);
            allEnemies.push(enemy);
            app.stage.addChild(enemy.Sprite);
          }
        } else {
          const wall = new PIXI.Sprite.from(crate);
          wall.width = 45;
          wall.height = 45;
          wall.x = tiles[i][j].x * 45;
          wall.y = tiles[i][j].y * 45;
          app.stage.addChild(wall);
          allColliders.push(new Collider({ name: "wall" }, wall));
          allWalls.push(new Collider({ name: "wall" }, wall));
        }
      }
    }

    playerX = app.screen.width / 2;
    playerY = app.screen.height / 2;

    character.x = playerX;
    character.y = playerY;

    app.ticker.add((delta) => {
      character.x = playerX;
      character.y = playerY;
    });

    app.stage.addChild(character);

    // damage tick
    const damageTick = setInterval(() => {
      if (!AllDead(allEnemies)) {
        const enemy = colliderCollision(player.Sprite, "enemy");
        if (enemy !== null && enemy !== false)
          player.TakeDamage(allEnemies[enemy].Damage);
        console.log(player.Life, allEnemies[enemy], allEnemies[enemy].Damage);
      } else clearInterval(damageTick);
    }, 1000);

    return () => {
      // On unload stop the application
      app.stop();
    };
  }, []);

  const keyRelease = (e) => {
    const { code } = e;
    switch (code) {
      case "Space":
        return setDrill(false);
      case "KeyW":
        return setW(false);
      case "KeyD":
        return setD(false);
      case "KeyS":
        return setS(false);
      case "KeyA":
        return setA(false);
      case "ArrowUp":
        return setUp(false);
      case "ArrowRight":
        return setRight(false);
      case "ArrowDown":
        return setDown(false);
      case "ArrowLeft":
        return setLeft(false);
      default:
        break;
    }
  };

  const keyPress = (e) => {
    const { code } = e;
    switch (code) {
      case "Space":
        return setDrill(true);
      case "KeyW":
        return setW(true);
      case "KeyD":
        return setD(true);
      case "KeyS":
        return setS(true);
      case "KeyA":
        return setA(true);
      case "ArrowUp":
        return setUp(true);
      case "ArrowRight":
        return setRight(true);
      case "ArrowDown":
        return setDown(true);
      case "ArrowLeft":
        return setLeft(true);
      default:
        break;
    }
  };

  const handleDirection = (e) => {
    const { id } = e.target;
    switch (id) {
      case "drill":
        return setDrill(true);
      case "fup":
        return setUp(true);
      case "fright":
        return setRight(true);
      case "fleft":
        return setLeft(true);
      case "fdown":
        return setDown(true);
      case "up":
        return setW(true);
      case "right":
        return setD(true);
      case "down":
        return setS(true);
      default: //left
        return setA(true);
    }
  };

  const handleRelease = (e) => {
    const { id } = e.target;
    switch (id) {
      case "drill":
        return setDrill(false);
      case "fup":
        return setUp(false);
      case "fright":
        return setRight(false);
      case "fleft":
        return setLeft(false);
      case "fdown":
        return setDown(false);
      case "up":
        return setW(false);
      case "right":
        return setD(false);
      case "down":
        return setS(false);
      default: //left
        return setA(false);
    }
  };

  const colliderCollision = (sprite, which) => {
    let toIterate = [];
    switch (which) {
      case "wall":
        toIterate = allWalls;
        break;
      case "mineral":
        toIterate = allMinerals;
        break;
      default:
        toIterate = allEnemies;
        break;
    }
    for (let i = 0; i < toIterate.length; ++i) {
      const currentSprite = toIterate[i].Sprite;
      let xss = false;
      let yss = false;
      // going by left || going by right
      if (which === "wall") {
        if (
          (sprite.x + sprite.width >= currentSprite.x + 2 &&
            sprite.x + sprite.width <= currentSprite.x + currentSprite.width) ||
          (sprite.x >= currentSprite.x &&
            sprite.x <= currentSprite.x + currentSprite.width - 2)
        ) {
          xss = true;
        }
      } else if (which === "mineral" || which === "enemy") {
        if (
          (sprite.x < currentSprite.x &&
            sprite.x + sprite.width > currentSprite.x + currentSprite.width) ||
          (sprite.x + sprite.width >= currentSprite.x + 2 &&
            sprite.x + sprite.width <= currentSprite.x + currentSprite.width) ||
          (sprite.x >= currentSprite.x &&
            sprite.x <= currentSprite.x + currentSprite.width - 2)
        )
          xss = true;
      }

      if (xss) {
        // down collision || up collision
        if (which === "wall") {
          if (
            (sprite.y >= currentSprite.y &&
              sprite.y <= currentSprite.y + currentSprite.height - 2) ||
            (sprite.y + sprite.height >= currentSprite.y + 2 &&
              sprite.y + sprite.height <=
                currentSprite.y + currentSprite.height)
          )
            yss = true;
        } else if (which === "mineral" || which === "enemy") {
          if (
            (sprite.y < currentSprite.y &&
              sprite.y + sprite.height >
                currentSprite.y + currentSprite.height) ||
            (sprite.y >= currentSprite.y &&
              sprite.y <= currentSprite.y + currentSprite.height - 2) ||
            (sprite.y + sprite.height >= currentSprite.y + 2 &&
              sprite.y + sprite.height <=
                currentSprite.y + currentSprite.height)
          )
            yss = true;
        }
      }

      if (which)
        if (yss) {
          if (which !== "wall") {
            if (!toIterate[i].IsAlive()) return false;
            return i;
          }
          return true;
        }
    }
    return false;
  };

  const projectileCollision = (sprite) => {
    for (let i = 0; i < allColliders.length; ++i) {
      if (allColliders[i].IsPlayer() || !allColliders[i].IsAlive()) continue;
      const currentSprite = allColliders[i].Sprite;
      let xss = false;
      // going by left || going by right
      if (
        (sprite.x + sprite.width >= currentSprite.x &&
          sprite.x + sprite.width <= currentSprite.x + currentSprite.width) ||
        (sprite.x >= currentSprite.x &&
          sprite.x <= currentSprite.x + currentSprite.width)
      ) {
        xss = true;
      }

      if (xss) {
        // down collision || up collision
        if (
          (sprite.y >= currentSprite.y &&
            sprite.y <= currentSprite.y + currentSprite.height) ||
          (sprite.y + sprite.height >= currentSprite.y &&
            sprite.y + sprite.height <= currentSprite.y + currentSprite.height)
        ) {
          if (!allColliders[i].IsCollider()) {
            setAudioControllerState({ type: "enemyHit" });
            if (allColliders[i].TakeDamage(player.Weapon.Damage))
              app.stage.removeChild(currentSprite);
          } else {
            setAudioControllerState({ type: "wallHit" });
          }
          return true;
        }
      }
    }
  };

  return (
    <div ref={ref}>
      <div className="keys">
        <div className="wContainer">
          <button
            id="up"
            className={w ? "active" : ""}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            W
          </button>
        </div>
        <div className="adContainer">
          <button
            id="left"
            className={a ? "active" : ""}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            A
          </button>
          <button
            id="right"
            className={d ? "active" : ""}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            D
          </button>
        </div>
        <div className="wContainer">
          <button
            id="down"
            className={s ? "active" : ""}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            S
          </button>
        </div>
      </div>
      <div className="arrows">
        <div className="wContainer">
          <button
            id="fup"
            className={`arrow ${up ? "active" : ""}`}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            ↑
          </button>
        </div>
        <div className="adContainer">
          <button
            id="fleft"
            className={`arrow ${left ? "active" : ""}`}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            ←
          </button>
          <button
            id="drill"
            className={`arrow ${drill ? "active" : ""}`}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            🔨
          </button>
          <button
            id="fright"
            className={`arrow ${right ? "active" : ""}`}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            →
          </button>
        </div>
        <div className="wContainer">
          <button
            id="fdown"
            className={`arrow ${down ? "active" : ""}`}
            onMouseDown={handleDirection}
            onMouseUp={handleRelease}
          >
            ↓
          </button>
        </div>
      </div>
      <div className="bag">
        <button onClick={() => setShowBag(!showBag)}>💼</button>
        <div style={{ opacity: showBag ? 1 : 0 }}>
          {player &&
            Object.values(player.Bag.Objects).map((item, i) => (
              <div key={i}>
                {item.count} x {item.name}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Game;
