import React, { useEffect, useRef, useState } from "react";
import GameManager from "./base/GameManager";
import classnames from "classnames";

function UI() {
  const [data, setData] = useState({
    player1: 0,
    player2: 0,
    player3: 0,
    dealer: 0,
    msg: "",
    balance: "",
    count: 0,
    bet: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const gmInstance = useRef();
  useEffect(() => {
    setTimeout(() => {
      gmInstance.current = new GameManager();
      gmInstance.current.onUiUpdate = (boardData) => onUiUpdate(boardData);
      setTimeout(() => {
        setLoaded(true), 1000;
      });
    }, 3000);
  }, []);
  function onUiUpdate(boardData) {
    setData({ ...boardData });
  }
  return <div className="absolute w-full h-[70%] flex flex-col items-center gap-1"></div>;
}

export default UI;
