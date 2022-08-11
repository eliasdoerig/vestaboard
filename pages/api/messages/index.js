import { clientPromise } from "../../../util/mongodb";
import { ObjectId } from "mongodb";
import { charToCode } from "../../../util/vestabord";

export default async function handler(req, res) {
  if (req.method == "GET") {
    try {
      const client = await clientPromise;
      const db = await client.db();

      const data = await db
        .collection(process.env.MONGODB_DATABASE)
        .find({})
        .toArray();

      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "error loading messages" });
    }
  }
  if (req.method == "POST") {
    const message = req.body;

    const code = message.chars.map((line) => {
      return line.map((char) => {
        return charToCode(char);
      });
    });

    try {
      const client = await clientPromise;
      const db = await client.db();
      const id = new ObjectId(message._id);

      const data = await db.collection(process.env.MONGODB_DATABASE).updateOne(
        { _id: id },
        {
          $set: {
            chars: message.chars,
            code: code,
            type: message.type,
            times: message.time.map((time) => ({
              time: time,
              activ: true,
            })),
            date: message.date,
            daily: message.daily,
          },
        },
        { upsert: true }
      );

      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "error loading messages" });
    }
  }
  return;
}
