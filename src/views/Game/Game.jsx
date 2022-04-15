import { useEffect, useState, useRef } from "react";

import * as PIXI from "pixi.js";

import back from "../../assets/images/back.png";
import characterImg from "../../assets/images/character.png";
import spark from "../../assets/images/spark.gif";

// utils
import app from "../../utils/app";

// styles
import "./style.css";

let playerX = 0;
let playerY = 0;

// back
const sprite = new PIXI.Sprite.from(back);
sprite.width = app.screen.width;
sprite.height = app.screen.height;
sprite.interactive = true;

// character
const character = new PIXI.Sprite.from(characterImg);

character.width = 60;
character.height = 60;

let mouseX = 0;
let mouseY = 0;

let sparks = [];
let sparkXs = [];
let sparkYs = [];
let sparkCount = 0;
// let sparkA = new PIXI.Sprite.from(spark);

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

// fire intervals
let fires = [];

const Game = () => {
  const ref = useRef(null);
  const [mousePosition, setMousePosition] = useState();
  const [w, setW] = useState(false);
  const [a, setA] = useState(false);
  const [d, setD] = useState(false);
  const [s, setS] = useState(false);
  const [up, setUp] = useState(false);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(false);
  const [down, setDown] = useState(false);

  const activate = (which) => {
    switch (which) {
      default: // fire up
        iUp = setInterval(() => {}, []);
        break;
    }
  };

  const onClick = (e) => {
    const { global, button } = e.data;
    mouseX = global.x;
    mouseY = global.y;
    if (button === 2) {
      // collect();
    } else {
      // fire();
    }
  };

  const fire = (direction) => {
    sparkCount += 1;
    const newLength = sparkCount;
    sparks[newLength] = new PIXI.Sprite.from(spark);
    sparkXs[newLength] = playerX + 30;
    sparkYs[newLength] = playerY + 30;
    app.stage.addChild(sparks[newLength]);

    app.ticker.add((delta) => {
      sparks[newLength].x = sparkXs[newLength];
      sparks[newLength].y = sparkYs[newLength];
    });

    const index = fires.length;
    let newI = setInterval(() => {
      if (direction === "up") {
        sparkYs[newLength] -= 1;
        if (sparkYs[sparkCount - 1] < -10) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      } else if (direction === "right") {
        sparkXs[sparkCount - 1] += 1;
        if (sparkXs[newLength] > app.screen.width) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      } else if (direction === "down") {
        sparkYs[sparkCount - 1] += 1;
        if (sparkYs[sparkCount - 1] > app.screen.height) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      } else if (direction === "left") {
        sparkXs[newLength] -= 1;
        if (sparkXs[newLength] < -10) {
          clearInterval(fires[index]);
          app.stage.removeChild(sparks[newLength]);
        }
      }
    }, 1);
    fires.push(newI);
  };

  const init = (delta) => {
    character.x = playerX;
    character.y = playerY;
  };

  useEffect(() => {
    document.body.onkeydown = keyPress;
    document.body.onkeyup = keyRelease;
    // On first render add app to DOM
    ref.current.appendChild(app.view);
    // Start the PixiJS app
    app.start();

    sprite.on("pointerdown", onClick);
    app.stage.addChild(sprite);

    playerX = app.screen.width / 2;
    playerY = app.screen.height / 2;

    app.stage.addChild(character);

    app.ticker.add(init);

    return () => {
      // On unload stop the application
      app.stop();
    };
  }, []);

  const keyRelease = (e) => {
    const { key } = e;
    switch (key) {
      case "w":
      case "W":
        return setW(false);
      case "d":
      case "D":
        return setD(false);
      case "s":
      case "S":
        return setS(false);
      case "a":
      case "A":
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
    const { key } = e;
    switch (key) {
      case "w":
      case "W":
        playerY -= 5;
        setW(true);
        break;
      case "d":
      case "D":
        playerX += 5;
        setD(true);
        break;
      case "s":
      case "S":
        playerY += 5;
        setS(true);
        break;
      case "a":
      case "A":
        playerX -= 5;
        setA(true);
        break;
      case "ArrowUp":
        fire("up");
        setUp(true);
        break;
      case "ArrowRight":
        fire("right");
        setRight(true);
        break;
      case "ArrowDown":
        fire("down");
        setDown(true);
        break;
      case "ArrowLeft":
        fire("left");
        setLeft(true);
        break;
      default:
        break;
    }
  };

  const handleDirection = (e) => {
    const { id } = e.target;
    switch (id) {
      case "fup":
        fire("up");
        // activate("fUp");
        break;
      case "fright":
        fire("right");
        break;
      case "fleft":
        fire("down");
        break;
      case "fdown":
        fire("left");
        break;
      case "up":
        playerY -= 5;
        break;
      case "right":
        playerX += 5;
        break;
      case "down":
        playerY += 5;
        break;
      default: //left
        playerX -= 5;
    }
  };

  return (
    <div ref={ref}>
      <div className="keys">
        <div className="wContainer">
          <button
            id="up"
            className={w ? "active" : ""}
            onClick={handleDirection}
          >
            W
          </button>
        </div>
        <div className="adContainer">
          <button
            id="left"
            className={a ? "active" : ""}
            onClick={handleDirection}
          >
            A
          </button>
          <button
            id="right"
            className={d ? "active" : ""}
            onClick={handleDirection}
          >
            D
          </button>
        </div>
        <div className="wContainer">
          <button
            id="down"
            className={s ? "active" : ""}
            onClick={handleDirection}
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
            onClick={handleDirection}
          >
            ↑
          </button>
        </div>
        <div className="adContainer">
          <button
            id="fleft"
            className={`arrow ${left ? "active" : ""}`}
            onClick={handleDirection}
          >
            ←
          </button>
          <button
            id="fright"
            className={`arrow ${right ? "active" : ""}`}
            onClick={handleDirection}
          >
            →
          </button>
        </div>
        <div className="wContainer">
          <button
            id="fdown"
            className={`arrow ${down ? "active" : ""}`}
            onClick={handleDirection}
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
};

export default Game;
