import { useEffect, useState } from "react";

export default function Messages({ messages, handleActiv, handleRemove }) {
  const [orderedMessages, setOrderedMessages] = useState();

  useEffect(() => {
    if (!messages) return;
    const messagesByTime = messages.sort(function (a, b) {
      return a.time > b.time ? 1 : a.time < b.time ? -1 : 0;
    });
    setOrderedMessages(messagesByTime);
  }, [messages]);

  const printDate = (dateFrom, dateTo) => {
    if (dateFrom === dateTo) {
      return dateFrom;
    } else {
      return `${dateFrom} - ${dateTo}`;
    }
  };

  return (
    <ul className="messages">
      {orderedMessages ? (
        orderedMessages?.map((message) => {
          return (
            <li key={message._id} className={message.activ ? "" : "disabled"}>
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
                    handleRemove(message._id);
                  }}
                >
                  Remove
                </button>
                <button
                  onClick={() => {
                    handleActiv(message._id, !message.activ);
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
