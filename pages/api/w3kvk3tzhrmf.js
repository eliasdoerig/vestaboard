import { clientPromise } from "../../util/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
  try {
    const { authorization } = req.headers;
    if (authorization === `Bearer ${process.env.API_SECRET_KEY}`) {
      const client = await clientPromise;
      const db = await client.db();
      const time = timeToRoundedString();
      console.log("Cron job at:", time);
      const messages = await db
        .collection(process.env.MONGODB_DATABASE)
        .find({ times: { $elemMatch: { time: time, activ: true } } })
        .toArray();
      const messageToSend = filterMessageToSend(messages);
      console.log("message: ", messageToSend);
      if (messageToSend) {
        const response = await fetch(process.env.VESTABOARD_URL, {
          method: "POST",
          headers: {
            "X-Vestaboard-Api-Key": process.env.VESTABOARD_KEY,
            "X-Vestaboard-Api-Secret": process.env.VESTABOARD_SECRET,
          },
          body: JSON.stringify({ characters: messageToSend.code }),
        });
        const vestaboard_response = await response.json();
        console.log(vestaboard_response);
        res.status(200).json({
          success: true,
          response: vestaboard_response,
        });
        console.log("message to vestaboard");
      } else {
        res.status(200).json({ success: true, message: "No message" });
        console.log("no message");
      }
    } else {
      res.status(401).json({ statusCode: 401, success: false });
    }
  } catch (err) {
    res.status(500).json({ statusCode: 500, message: err.message });
  }
}

function timeToRoundedString(date = new Date()) {
  const interval = 10;
  const ms = 1000 * 60 * interval;
  const time = new Date(Math.floor(date.getTime() / ms) * ms);
  const localTime = time.toLocaleTimeString([], {
    timeZone: "Europe/Zurich",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  });
  return localTime;
}

function isDateInBetween(_from, _to) {
  const check = new Date();
  const from = Date.parse(`${_from}T00:00Z`);
  const to = Date.parse(`${_to}T23:59Z`);
  return check >= from && check <= to;
}

function filterMessageToSend(messages) {
  let messageToSend = null;
  let found = false;
  messages.forEach((message) => {
    if (message.daily && !found) {
      messageToSend = message;
    } else if (
      !message.daily &&
      isDateInBetween(message.date.dateFrom, message.date.dateTo)
    ) {
      messageToSend = message;
      found = true;
    }
  });
  return messageToSend;
}
