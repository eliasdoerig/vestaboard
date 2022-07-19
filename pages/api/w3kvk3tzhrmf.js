import { clientPromise } from "../../util/mongodb";

export default async function handler(req, res) {
  if (req.method != "GET") return;

  const time = timeToRoundedString();

  try {
    const client = await clientPromise;
    const db = await client.db();

    const messages = await db.collection("messages").find({}).toArray();

    const currentMessages = messages.filter((m) => m.time == time);
    const messageToSend = filterMessageToSend(currentMessages);

    // const response = await fetch(
    //   //"https://platform.vestaboard.com/subscriptions/3fbe4044-e200-4f68-935f-9f6bae683077/message",
    //   {
    //     method: "POST",
    //     headers: {
    //       "X-Vestaboard-Api-Key": process.env.VESTABOARD_KEY,
    //       "X-Vestaboard-Api-Secret": process.env.VESTABOARD_SECRET,
    //     },
    //     body: JSON.stringify({ characters: characters }),
    //   }
    // );
    // const vestaboard_response = await response.json();
    res
      .status(200)
      .json(
        messageToSend
          ? { m: messageToSend, t: time }
          : { m: currentMessages, t: time }
      );
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "error loading messages" });
  }
}

function timeToRoundedString(date = new Date()) {
  const interval = 5;
  const ms = 1000 * 60 * interval;
  const time = new Date(Math.floor(date.getTime() / ms) * ms);
  const hours = `0${time.getHours()}`.slice(-2);
  const minutes = `0${time.getMinutes()}`.slice(-2);
  return `${hours}:${minutes}`;
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
    if (message.daily && message.activ && !found) {
      messageToSend = message;
    } else if (
      !message.daily &&
      message.activ &&
      isDateInBetween(message.date.dateFrom, message.date.dateTo)
    ) {
      messageToSend = message;
      found = true;
    }
  });
  return messageToSend;
}
