import { useEffect, useState } from "react";

export default function Messages({
  messages,
  handleActiv,
  handleRemove,
  handleEdit,
}) {
  const [orderedMessages, setOrderedMessages] = useState();

  useEffect(() => {
    if (!messages) return;
    let messagesSplitTime = [];
    messages.forEach((m) => {
      m.times.forEach((t) => {
        messagesSplitTime.push({ ...m, time: t.time, activ: t.activ });
      });
    });
    console.log(messagesSplitTime);
    const messagesByTime = messagesSplitTime.sort(function (a, b) {
      return a.time > b.time ? 1 : a.time < b.time ? -1 : 0;
    });
    setOrderedMessages(messagesByTime);
  }, [messages]);

  const printDate = (_from, _to) => {
    const fromArr = _from.split("-");
    const toArr = _to.split("-");
    return `${fromArr[2]}/${fromArr[1]}/${fromArr[0]}-${toArr[2]}/${toArr[1]}/${toArr[0]}`;
  };

  function isDateInBetween(_from, _to) {
    const check = new Date();
    const from = Date.parse(`${_from}T00:00Z`);
    const to = Date.parse(`${_to}T23:59Z`);
    return check >= from && check <= to;
  }

  return (
    <ul className="messages">
      {orderedMessages ? (
        orderedMessages?.map((message, i) => {
          return (
            <li key={i} className={message.activ ? "" : "disabled"}>
              {message.chars?.map((line, i) => {
                return (
                  <p key={i}>
                    {line.map((char, i) => {
                      return char.charAt(0) !== "$" ? (
                        <span key={i}>{char ? char : " "}</span>
                      ) : (
                        <span key={i} className={char.substring(1)}></span>
                      );
                    })}
                  </p>
                );
              })}
              <div className="controls">
                <button
                  onClick={() => {
                    handleEdit(message._id);
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleRemove(message._id, message.times, message.time);
                  }}
                >
                  Remove
                </button>
                <button
                  onClick={() => {
                    handleActiv(
                      message._id,
                      message.times,
                      message.time,
                      !message.activ
                    );
                  }}
                >
                  {message.activ ? "Disable" : "Enable"}
                </button>
              </div>
              <div className="details">
                {message.daily ? (
                  <div>Daily</div>
                ) : (
                  <div>
                    {printDate(message.date.dateFrom, message.date.dateTo)}
                  </div>
                )}
                <div>{message.time}</div>
              </div>
            </li>
          );
        })
      ) : (
        <div>Loading...</div>
      )}
    </ul>
  );
}
