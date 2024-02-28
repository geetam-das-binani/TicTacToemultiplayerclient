import { useState } from "react";
import "./sqaure.css";

const circleSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
        stroke="#ffffff"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);
const crossSvg = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
    <g
      id="SVGRepo_tracerCarrier"
      stroke-linecap="round"
      stroke-linejoin="round"
    ></g>
    <g id="SVGRepo_iconCarrier">
      {" "}
      <path
        d="M19 5L5 19M5.00001 5L19 19"
        stroke="#fff"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      ></path>{" "}
    </g>
  </svg>
);
const Square = ({
  socket,
  playingAs,
  id,
  setGameState,
  currentPlayer,
  setCurrentPlayer,
  finishedState,
  finishedArrayState,
  currentElement,
}) => {
  const [icon, setIcon] = useState(null);
  const handleClick = () => {
    if (finishedState) return;
    if (playingAs !== currentPlayer) return;
    if (!icon) {
      if (currentPlayer === "circle") {
        setIcon(circleSvg);
      } else {
        setIcon(crossSvg);
      }
    }
    const myCurrentPlayer = currentPlayer;
    socket.emit("playerMoveFromClient", {
      id,
      sign: myCurrentPlayer,
    });
    setCurrentPlayer(currentPlayer === "circle" ? "cross" : "circle");
    setGameState((prevState) => {
      const newState = [...prevState];

      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;
      newState[rowIndex][colIndex] = myCurrentPlayer;

      return newState;
    });
  };
  return (
    <div
      onClick={handleClick}
      className={`square ${finishedState && "not-allowed"}
       ${
         finishedArrayState.includes(id) &&
         finishedState === "circle" &&
         "circle-one"
       }
       ${
         finishedArrayState.includes(id) &&
         finishedState === "cross" &&
         "cross-one"
       }
       ${currentPlayer !== playingAs && "not-allowed"}

       ${finishedState && finishedState !== playingAs && "gray-background"}
       `}
    >
      {currentElement === "circle"
        ? circleSvg
        : currentElement === "cross"
        ? crossSvg
        : icon}
    </div>
  );
};

export default Square;
