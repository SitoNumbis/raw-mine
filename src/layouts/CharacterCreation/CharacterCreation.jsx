import React, { useState, useEffect } from "react";

import axios from "axios";

import { getAuth } from "../../auth/auth";
import config from "../../config";

// style
import "../../views/Home/style.css";

// context
import { useAudioController } from "../../context/AudioController";
import { useSocket } from "../../context/SocketContext";

// character default
import Default from "../../assets/images/character/default.png";

const CharacterCreation = (props) => {
  const { setAudioControllerState } = useAudioController();
  const { socketState } = useSocket();
  const { start } = props;

  const [name, setName] = useState("");
  const [connected, setConnected] = useState(false);

  const handleInputs = (e) => {
    const { id, value } = e.target;
    switch (id) {
      default:
        return setName(value);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setAudioControllerState({ type: "click" });
    start(name);
  };

  useEffect(() => {
    if (socketState.socket) {
      socketState.socket.on("reponse", () => setConnected(true));
      socketState.socket.emit("connected", "");
    }
  }, [socketState.socket]);

  return (
    <div>
      <div className="home-form">
        <h1>Crea tu minero</h1>
        <form onSubmit={submit} className="flex-center">
          <img
            className="player-portrait"
            src={connected ? `https://robohash.org/${name}.png` : Default}
            alt="player-robot"
          />
          <div className="creation-form">
            <label htmlFor="name">Introduce tu nombre:</label>
            <input value={name} onChange={handleInputs} id="name" />
          </div>
        </form>
        <button type="submit" onClick={submit}>
          Comenzar
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;
