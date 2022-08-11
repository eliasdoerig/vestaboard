import { clientPromise } from "../../../util/mongodb";
import { ObjectId } from "mongodb";

export default async function handler(req, res) {
  const id = new ObjectId(req.query.id);
  if (req.method == "GET") {
    try {
      const client = await clientPromise;
      const db = await client.db();

      const data = await db
        .collection(process.env.MONGODB_DATABASE)
        .findOne({ _id: id });

      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "error loading message" });
    }
  }
  if (req.method == "PUT") {
    const message = req.body;
    try {
      const client = await clientPromise;
      const db = await client.db();

      const data = await db
        .collection(process.env.MONGODB_DATABASE)
        .updateOne({ _id: id }, { $set: { times: message.times } });

      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "error updating message" });
    }
  }
  if (req.method == "DELETE") {
    try {
      const client = await clientPromise;
      const db = await client.db();

      const data = await db
        .collection(process.env.MONGODB_DATABASE)
        .findOneAndDelete({ _id: id });

      res.status(200).json(data);
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: "error deleting message" });
    }
  }
}
