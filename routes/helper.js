
import { client } from "../index.js";
import { ObjectId } from "mongodb";


export async function getUserByName(Email) {
    //db.users.findOne({username: username });
  return await client.db("zen-event-app").collection("student").findOne({ Email: Email });
}
export async function getUserById(id) {
  //db.users.findOne({_id: id });
  return await client.db("zen-event-app").collection("student").findOne({ _id:ObjectId(id)});
}

export async function createUser(data) {
    //db.users.insertOne(data);
  return await client.db("zen-event-app").collection("student").insertOne(data);
}
export async function createAdmin(data) {
  //db.users.insertOne(data);
return await client.db("zen-event-app").collection("admin").insertOne(data);
}

export async function getUserByEmail(Email) {
    //db.users.findOne({username: username });
  return await client.db("zen-event-app").collection("student").findOne({Email: Email});
}
export async function getUserByAdminEmail(Email) {
  //db.users.findOne({username: username });
return await client.db("zen-event-app").collection("admin").findOne({ Email: Email });
}

export async function createNewEvent(data) {
  //db.users.findOne({username: username });
  return await client.db("zen-event-app").collection("event_new").insertOne(data);
}

export async function getAllEvents() {
  return await client.db("zen-event-app").collection("event_new").find({}).toArray();
}

export async function getEventById(id) {
  return await client.db("zen-event-app").collection("event_new").findOne({ _id: ObjectId(id) });
}

export async function updateEventById(id, data) {
  return await client.db("zen-event-app").collection("event_new").updateOne({ _id: ObjectId(id) }, { $set: data });
}

export async function deleteEventById(id) {
  return await client.db("zen-event-app").collection("event_new").deleteOne({ _id: ObjectId(id) });
}
export async function updateEventRegistrationById(id, participantlist) {
  return await client.db("zen-event-app").collection("event_new").updateOne({ _id: ObjectId(id) }, { $set:{participantlist:participantlist}  });
}




