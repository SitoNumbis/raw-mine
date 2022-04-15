import { useEffect, useState, useRef } from "react";

import * as PIXI from "pixi.js";

import back from "../../assets/images/back.png";
import characterImg from "../../assets/images/character.png";

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

const Game = () => {
  const ref = useRef(null);
  const [mousePosition, setMousePosition] = useState();
  const [w, setW] = useState(false);
  const [a, setA] = useState(false);
  const [d, setD] = useState(false);
  const [s, setS] = useState(false);

  const onClick = (e) => {
    const { global, button } = e.data;
    setMousePosition(global);
    if (button === 2) {
      collect();
    } else {
      fire();
    }
  };

  const fire = () => {
    console.log("fire");
  };

  const collect = () => {
    console.log("collect");
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

  const keyRelease = () => {
    setW(false);
    setA(false);
    setD(false);
    setS(false);
  };

  const keyPress = (e) => {
    const { key } = e;
    switch (key) {
      case "w":
      case "W":
      case "ArrowUp":
        playerY -= 5;
        setW(true);
        break;
      case "d":
      case "D":
      case "ArrowRight":
        playerX += 5;
        setD(true);
        break;
      case "s":
      case "S":
      case "ArrowDown":
        playerY += 5;
        setS(true);
        break;
      case "a":
      case "A":
      case "ArrowLeft":
        playerX -= 5;
        setA(true);
        break;
      default:
        break;
    }
  };

  const handleDirection = (e) => {
    const { id } = e.target;
    switch (id) {
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
    </div>
  );
};

export default Game;