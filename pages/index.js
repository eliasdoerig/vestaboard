import Head from "next/head";
import { useEffect, useState } from "react";
import Messages from "../components/Messages/Messages";

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [change, setchange] = useState(false);

  //current board
  const [tool, setTool] = useState("text");
  const [currentId, setCurrentID] = useState(null);
  const charRows = 6;
  const charCols = 22;
  const [characters, setCharacters] = useState(
    Array(charRows)
      .fill("")
      .map(() => Array(charCols).fill(""))
  );
  const [daily, setDaily] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [time, setTime] = useState([]);
  const [date, setDate] = useState({
    dateFrom: "",
    dateTo: "",
  });
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/messages`)
      .then((res) => res.json())
      .then((data) => setMessages(data));
  }, [change]);

  const changeChar = (row, char, value) => {
    let copy = [...characters];
    copy[row][char] = value;
    setCharacters(copy);
  };

  const handleKeyDown = (e) => {
    const currentRow = parseInt(e.target.getAttribute("row"));
    const currentChar = parseInt(e.target.getAttribute("char"));

    if (e.key === "Enter") {
      e.preventDefault();
      if (currentRow < charRows - 1)
        document
          .querySelector(`[row="${currentRow + 1}"][char="${0}"]`)
          .focus();
    }

    if (e.key === "Backspace") {
      if (currentChar > 0) {
        if (currentChar == charCols - 1 && currentRow == charRows - 1) {
          changeChar(currentRow, currentChar, "");
        }
        changeChar(currentRow, currentChar - 1, "");
        document
          .querySelector(`[row="${currentRow}"][char="${currentChar - 1}"]`)
          .focus();
      }
      if (currentChar == 0 && currentRow != 0) {
        changeChar(currentRow - 1, charCols - 1, "");
        document
          .querySelector(`[row="${currentRow - 1}"][char="${charCols - 1}"]`)
          .focus();
      }
    }
  };

  const handleBoardClick = (e) => {
    console.log("click", e);
    e.preventDefault();
    const currentRow = parseInt(e.target.getAttribute("row"));
    const currentChar = parseInt(e.target.getAttribute("char"));

    if (tool != "text") {
      const color = `$${tool}`;
      changeChar(currentRow, currentChar, color);
    }
  };

  const handleBoardChange = (e) => {
    const currentRow = parseInt(e.target.getAttribute("row"));
    const currentChar = parseInt(e.target.getAttribute("char"));
    if (tool == "text") {
      changeChar(currentRow, currentChar, e.target.value);
      if (e.target.value != "") {
        if (currentChar < charCols - 1)
          document
            .querySelector(`[row="${currentRow}"][char="${currentChar + 1}"]`)
            .focus();
        if (currentChar == charCols - 1 && currentRow != charRows - 1)
          document
            .querySelector(`[row="${currentRow + 1}"][char="${0}"]`)
            .focus();
      }
    }
  };

  const handlePaste = (e) => {
    let currentRow = parseInt(e.target.getAttribute("row"));
    let currentChar = parseInt(e.target.getAttribute("char"));

    let paste = (e.clipboardData || window.clipboardData)
      .getData("text")
      .split("");

    paste.forEach((value, i) => {
      changeChar(currentRow, currentChar, value);
      if (currentChar < charCols - 1) {
        currentChar++;
      } else if (currentChar == charCols - 1) {
        currentRow++;
        currentChar = 0;
      }
      if (i == paste.length - 1) {
        document
          .querySelector(`[row="${currentRow}"][char="${currentChar + 1}"]`)
          .focus();
      }
    });
  };

  const formAddTime = (e) => {
    e.preventDefault();
    const re = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (time.indexOf(timeInput) == -1 && re.exec(timeInput)) {
      setTime((prevState) => [...prevState, timeInput]);
      setTimeInput("");
    }
  };

  const formRemoveTime = (e) => {
    if (e.target.tagName !== "SPAN") return;
    const value = e.target.parentNode.getAttribute("data-time");
    setTime(time.filter((t) => t !== value));
  };

  const handeDateChange = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    console.log(id, value);
    if (id == "dateFrom") {
      setDate((prevState) => ({
        dateFrom: value,
        dateTo: value > date.dateTo || !date.dateTo ? value : prevState.dateTo,
      }));
    }
    if (id == "dateTo") {
      setDate((prevState) => ({
        dateFrom:
          value < date.dateTo || !date.dateTo ? value : prevState.dateTo,
        dateTo: value,
      }));
    }
  };

  const handleTools = (e) => {
    const selectedTool = e.target.id;
    if (selectedTool) {
      setTool(selectedTool);
    }
    console.log(tool);
  };

  const resetBoard = () => {
    setCurrentID(null);
    setCharacters(
      Array(charRows)
        .fill("")
        .map(() => Array(charCols).fill(""))
    );
    setDaily(false);
    setTime([]);
    setDate({ dateFrom: "", dateTo: "" });
  };

  const handleSubmit = async (e) => {
    console.log("submit");
    e.preventDefault();

    if (time.length == 0) {
      alert("you need to add a time");
      return;
    }
    if (!daily && (date.dateFrom == "" || date.dateTo == "")) {
      alert("you need to add a date or choos daily");
      return;
    }

    console.log(date.dateFrom, date.dateFrom.split("-"));

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/messages`,
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          _id: currentId,
          chars: characters,
          time: time,
          date: date,
          daily: daily,
        }), // body data type must match "Content-Type" header
      }
    );
    const data = await response.json();
    console.log(data);
    if (data) {
      resetBoard();
    }

    setchange((change) => !change);
  };

  const handleActiv = async (id, times, time, activ) => {
    console.log("change", id);
    const updatedTimes = times.map((t) => {
      return t.time === time ? { ...t, activ: activ } : { ...t };
    });

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/messages/${id}`,
      {
        method: "PUT",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ times: updatedTimes }),
      }
    );
    const data = await response.json();
    console.log(data);

    setchange((change) => !change);
  };

  const handleRemoveTime = async (id, times, time) => {
    if (
      window.confirm(
        `Do you really want to remove ${id} at ${time} from the collection?`
      )
    ) {
      //update if there are more than 1 entry else remove message
      if (times.length > 1) {
        const updatedTimes = times.filter((t) => t.time !== time);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/messages/${id}`,
          {
            method: "PUT",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ times: updatedTimes }),
          }
        );
        const data = await response.json();
        console.log(data);
      } else {
        handleRemove(id);
      }
      setchange((change) => !change);
    } else {
      console.log("Exit remove");
    }
  };

  const handleRemove = async (id) => {
    console.log("remove", id);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/messages/${id}`,
      {
        method: "DELETE",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id }),
      }
    );

    const data = await response.json();
    console.log(data);

    if (currentId === id) {
      resetBoard();
    }

    setchange((change) => !change);
  };

  const handleEdit = async (id) => {
    const messageToEdit = messages.find((m) => m._id == id);
    setCharacters(messageToEdit.chars);
    setTime(messageToEdit.times.map((t) => t.time));
    setCurrentID(messageToEdit._id);
    setDate({
      dateFrom: messageToEdit.date.dateFrom,
      dateTo: messageToEdit.date.dateTo,
    });
    setDaily(messageToEdit.daily);
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="planning">
          <h2>TIMETABLE</h2>
          <p className="subhead">10 MIN INTERVAL</p>
          <Messages
            messages={messages}
            handleActiv={handleActiv}
            handleRemove={handleRemoveTime}
            handleEdit={handleEdit}
          />
        </div>
        <div>
          <h1>VESTABOARD</h1>
          {currentId && (
            <>
              <p className="subhead">Message id: {currentId}</p>
              <button className="subhead-btn" onClick={resetBoard}>
                new message
              </button>
            </>
          )}

          <div className="tools" onClick={handleTools}>
            <button id="orange" className={tool == "orange" ? "selected" : ""}>
              Arancione
            </button>
            <button id="yellow" className={tool == "yellow" ? "selected" : ""}>
              Giallo
            </button>
            <button id="green" className={tool == "green" ? "selected" : ""}>
              Verde
            </button>
            <button id="blue" className={tool == "blue" ? "selected" : ""}>
              Blu
            </button>
            <button id="purple" className={tool == "purple" ? "selected" : ""}>
              Viola
            </button>
            <button id="red" className={tool == "red" ? "selected" : ""}>
              Rosso
            </button>
            <button id="white" className={tool == "white" ? "selected" : ""}>
              Bianco
            </button>
            <button id="text" className={tool == "text" ? "selected" : ""}>
              T
            </button>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <div className={`board ${tool != "text" ? "tool-color" : ""}`}>
              {characters.map((row, i) => {
                return (
                  <div className="row" key={`row-${i}`}>
                    {row.map((char, j) => {
                      return char.charAt(0) !== "$" ? (
                        <input
                          key={`char-${j}`}
                          type="text"
                          value={char}
                          maxLength={1}
                          row={i}
                          char={j}
                          onChange={handleBoardChange}
                          onClick={handleBoardClick}
                          onKeyDown={handleKeyDown}
                          onPaste={handlePaste}
                        />
                      ) : (
                        <input
                          key={`char-${j}`}
                          type="text"
                          value={""}
                          maxLength={1}
                          row={i}
                          char={j}
                          className={char.substring(1)}
                          onChange={handleBoardChange}
                          onClick={handleBoardClick}
                          onKeyDown={handleKeyDown}
                          onPaste={handlePaste}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
            <div className="settings">
              <div className="time-wrapper">
                <div className="time-input">
                  <label>
                    Time
                    <input
                      type="time"
                      id="time"
                      step="900"
                      value={timeInput}
                      onChange={(e) => {
                        setTimeInput(e.target.value);
                      }}
                    />
                  </label>
                  <button onClick={formAddTime}>+</button>
                </div>
                <div className="time-display">
                  {time?.map((t, i) => {
                    return (
                      <div
                        className="time"
                        key={i}
                        data-time={t}
                        onClick={formRemoveTime}
                      >
                        {t} <span>×</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <label className={daily ? "deactivated" : ""}>
                From
                <input
                  type="date"
                  id="dateFrom"
                  value={date.dateFrom}
                  onChange={handeDateChange}
                />
              </label>
              <label className={daily ? "deactivated" : ""}>
                To
                <input
                  type="date"
                  id="dateTo"
                  value={date.dateTo}
                  onChange={handeDateChange}
                />
              </label>
              <label>
                Daily
                <input
                  type="checkbox"
                  id="daily"
                  checked={daily}
                  onChange={(e) => setDaily(e.target.checked)}
                ></input>
              </label>
              <input type="submit" value="Save" />
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
