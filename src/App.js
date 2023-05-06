import { useEffect, useRef, useState } from "react";
import "./App.css";
import Images from "./Images";
import { shuffle, take } from "lodash";
import chime from "./chime.mp3";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const [cards, setCards] = useState(shuffle([...Images, ...Images]));
  const [clicks, setClicks] = useState(0);
  const [won, setWon] = useState(false);
  const [activeCards, setActiveCards] = useState([]);
  const [foundPairs, setFoundPairs] = useState([]);
  const [layout, setLayout] = useState(6);
  const boardRef = useRef();
  const cardOuterRef = useRef([]);
  function handleLayoutChange(value) {
    const newImagesArray = take(Images, (value * value) / 2);
    setLayout(parseInt(value));
    setCards([...newImagesArray, ...newImagesArray]);
  }

  useEffect(() => {
    boardRef.current.style.gridTemplateColumns = `repeat(${layout}, 1fr)`;
    for (let i = 0; i < cards.length; i++) {
      cardOuterRef.current[
        i
      ].style.height = `calc((100vh - 290px) / ${layout})`;
      cardOuterRef.current[
        i
      ].style.maxHeight = `calc((100vw - 90px) / ${layout})`;
    }
  }, [layout]);
  async function flipCard(index) {
    if (won) {
      setCards(shuffle([...Images, ...Images]));
      setFoundPairs([]);
      setWon(false);
      setClicks(0);
    }
    if (activeCards.length === 0) {
      setActiveCards([index]);
    }
    if (activeCards.length === 1) {
      const firstIndex = activeCards[0];
      const secondIndex = index;
      setActiveCards([...activeCards, index]);
      if (cards[firstIndex] === cards[secondIndex]) {
        setActiveCards([]);
        new Audio(chime).play();
        setFoundPairs([...foundPairs, firstIndex, secondIndex]);
        if (foundPairs.length + 2 === cards.length) setWon(true);
      } else {
        setActiveCards([...activeCards, index]);
        await delay(1000);
        setActiveCards([]);
      }
    }
    if (activeCards.length == 2) {
      setActiveCards([index]);
    }
    setClicks(clicks + 1);
  }
  return (
    <div>
      <div className="board" ref={boardRef}>
        {cards.map((card, index) => {
          const flippedToFront =
            activeCards.indexOf(index) !== -1 ||
            foundPairs.indexOf(index) !== -1
              ? "flipped"
              : "";
          return (
            <div
              className={"card-outer " + flippedToFront}
              onClick={() => flipCard(index)}
              ref={(el) => (cardOuterRef.current[index] = el)}
              key={index}
            >
              <div className="card">
                <div className="front">
                  <img src={card} alt="" />
                </div>
                <div className="back"></div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="stats-settings">
        {won && (
          <>
            You won the game ! Congratulations !<br />
          </>
        )}
        Click: {clicks} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Found Pairs:{" "}
        {foundPairs.length / 2}
        <br />
        <select
          name=""
          id=""
          onChange={(e) => handleLayoutChange(e.target.value)}
          defaultValue="6"
        >
          <option value="4">4 x 4</option>
          <option value="6">6 x 6</option>
        </select>
      </div>
    </div>
  );
}

export default App;
