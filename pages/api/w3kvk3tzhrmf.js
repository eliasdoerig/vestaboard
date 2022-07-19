import { clientPromise } from "../../util/mongodb";

export default async function handler(req, res) {
  if (req.method != "GET") return;

  try {
    const client = await clientPromise;
    const db = await client.db();

    const messages = await db.collection("messages").find({}).toArray();

    console.log("---------------------", messages);

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
    res.status(200).json(messages);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "error loading messages" });
  }
}
