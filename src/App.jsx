import React, { useEffect, useState } from "react";
import "./App.css";
import Square from "./Square/Square";
import { io } from "socket.io-client";
import swal from "sweetalert2";

const renderFrom = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const App = () => {
  const [gameState, setGameState] = useState(renderFrom);
  const [currentPlayer, setCurrentPlayer] = useState("circle");
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playonline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOppenentName] = useState(false);
  const [playingAs, setPlayingAs] = useState(null);
  const checkWinner = () => {
    // ! row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2] &&
        gameState[row][0] !== null
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // ! column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col] &&
        gameState[0][col] !== null
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    // !  diagonal check

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      setFinishedArrayState([0, 4, 8]);
      return gameState[0][0];
    }
    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      setFinishedArrayState([2, 4, 6]);
      return gameState[0][2];
    }
    const isMatchDraw = gameState
      .flat(1)
      .every((item) => item === "circle" || item === "cross");
    if (isMatchDraw) {
      return "draw";
    }
    return null;
  };

  useEffect(() => {
    const winner = checkWinner();

    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState]);

  const takePlayerName = async () => {
    const result = await swal.fire({
      title: "Enter your name",
      input: "text",
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      },
    });

    return result;
  };

  socket?.on("connect", () => {
    setPlayOnline(true);
  });
  socket?.on("OpponentNotFound", () => {
    setOppenentName(false);
  });
  socket?.on("OpponentFound", (data) => {
    setPlayingAs(data.playingAs);

    setOppenentName(data.playerName);
  });
  socket?.on("OpponentLeftMatch", () => {
    setFinishedState("OpponentLeftMatch");
  });

  socket?.on("playerMoveFromServer", (data) => {
    const id = data.id;

    setGameState((prevState) => {
      const newState = [...prevState];

      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = data.sign;

      return newState;
    });
    setCurrentPlayer(data.sign === "circle" ? "cross" : "circle");
  });

  const handlePlayOnline = async () => {
    const result = await takePlayerName();
    if (result.isDismissed) return;
    const username = result.value;
    setPlayerName(username);
    // const newSocket = io("http://localhost:3000");
    const newSocket = io("https://mytictactoeserver.onrender.com");

    newSocket.emit("request_to_play", { playerName: username });
    setSocket(newSocket);
  };

  if (!playonline) {
    return (
      <div className="main-div">
        <button onClick={handlePlayOnline}>Play Online</button>
      </div>
    );
  }

  if (playonline && !opponentName) {
    return (
      <div className="waiting">
        <p className="">Waiting for opponent...</p>
      </div>
    );
  }
  return (
    <div className="main-div">
      <div className="move-detection">
        <div
          className={`left ${
            currentPlayer === playingAs && "current-move-circle"
          }`}
        >
          {playerName}
        </div>
        <div
          className={`right ${
            currentPlayer !== playingAs && "current-move-cross"
          }`}
        >
          {opponentName}
        </div>
      </div>
      <div>
        <h4
          className={`${
            'circle' === playingAs ? "circle-class" : "cross-class"
          }`}
        >
          You are {'circle' === playingAs ? "circle" : "cross"}
        </h4>
        <h4 className="game-heading water-background">Tic Tac Toe</h4>
        <div className="square-wrapper">
          {gameState.flat(1).map((e, index) => (
            <Square
              socket={socket}
              playingAs={playingAs}
              finishedState={finishedState}
              currentPlayer={currentPlayer}
              setCurrentPlayer={setCurrentPlayer}
              finishedArrayState={finishedArrayState}
              id={index}
              key={index}
              setGameState={setGameState}
              currentElement={e}
            />
          ))}
        </div>
        {finishedState && finishedState === "draw" && (
          <h3 className="finished-state">Match Draw!No one won</h3>
        )}{" "}
        {finishedState &&
          finishedState !== "draw" &&
          finishedState !== "OpponentLeftMatch" && (
            <h3 className="finished-state">
              Winner is {finishedState === playingAs ? "You" : opponentName}
            </h3>
          )}
        {finishedState && finishedState === "OpponentLeftMatch" && (
          <h3 className="">You Won ! Opponent has left </h3>
        )}
        {!finishedState && opponentName && (
          <h3>Your are playing against {opponentName}</h3>
        )}
      </div>
    </div>
  );
};

export default App;
