import { useEffect, useRef, useState } from "react";
import "./App.css";
import Images from "./Images";
import { shuffle, take } from "lodash";
import chime from "./chime.mp3";
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function App() {
  const LOCAL_STORAGE_KEY = "memory-game-layout";
  const [cards, setCards] = useState(shuffle([...Images, ...Images]));
  const [clicks, setClicks] = useState(0);
  const [won, setWon] = useState(false);
  const [activeCards, setActiveCards] = useState([]);
  const [foundPairs, setFoundPairs] = useState([]);
  const [layout, setLayout] = useState(6);
  const boardRef = useRef();
  const cardOuterRef = useRef([]);

  useEffect(() => {
    const retrievedLayout = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
    if (retrievedLayout) setLayout(retrievedLayout);
  }, []);

  // handle layout changes
  function handleLayoutChange(value) {
    const newImagesArray = take(Images, (value * value) / 2);
    setClicks(0);
    setActiveCards([]);
    setFoundPairs([]);
    setLayout(parseInt(value));
    setWon(false);
    setCards(shuffle([...newImagesArray, ...newImagesArray]));
  }

  //suprise setting for easter egg
  function setEasterEggSettings() {
    const imagesArray = shuffle(take(Images, (layout * layout) / 2));
    const newImagesArray = [];
    // Easter egg array
    const pairs = [
      [1, 2],
      [3, 5],
      [7, 11],
      [13, 14],
      [4, 8],
      [6, 12],
      [9, 16],
      [10, 15],
    ];
    pairs.forEach((val, index) => {
      newImagesArray[val[0] - 1] = newImagesArray[val[1] - 1] =
        imagesArray[index];
      // console.log([
      //   newImagesArray[val[0] - 1],
      //   newImagesArray[val[1] - 1],
      //   imagesArray[index],
      // ]);
    });

    setCards(newImagesArray);
  }

  // styling changes sideeffect on layout changes
  useEffect(() => {
    const newImagesArray = take(Images, (layout * layout) / 2);
    setClicks(0);
    setActiveCards([]);
    setFoundPairs([]);
    setCards(shuffle([...newImagesArray, ...newImagesArray]));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
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

  // handling flip card action logic
  async function flipCard(index) {
    if (clicks === 0 && index === 6 && layout === 4) {
      setEasterEggSettings();
    }
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
        new Audio(chime).play();
        setActiveCards([]);
        setFoundPairs([...foundPairs, firstIndex, secondIndex]);
        if (foundPairs.length + 2 === cards.length) setWon(true);
      } else {
        setActiveCards([...activeCards, index]);
        await delay(1000);
        setActiveCards([]);
      }
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
        Clicks: {clicks} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Found Pairs:{" "}
        {foundPairs.length / 2}
        <br />
        <select
          name=""
          id=""
          onChange={(e) => handleLayoutChange(e.target.value)}
        >
          <option value={layout}>Select Layout</option>
          <option value="4">4 x 4</option>
          <option value="6">6 x 6</option>
        </select>
        <br />
        {foundPairs.length !== 0 && (
            <button onClick={(e) => handleLayoutChange(layout)}>Reset</button>
        )}
        
      </div>
    </div>
  );
}

export default App;
