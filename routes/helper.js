
import { client } from "../index.js";
import { ObjectId } from "mongodb";


export async function getUserByName(Email) {
    //db.users.findOne({username: username });
  return await client.db("guvi-event-app").collection("event-management").findOne({ Email: Email });
}
export async function getUserById(id) {
  //db.users.findOne({_id: id });
  return await client.db("guvi-event-app").collection("event-management").findOne({ _id:ObjectId(id)});
}

export async function createUser(data) {
    //db.users.insertOne(data);
  return await client.db("guvi-event-app").collection("event-management").insertOne(data);
}
export async function createAdmin(data) {
  //db.users.insertOne(data);
return await client.db("guvi-event-app").collection("event-management-admin").insertOne(data);
}

export async function getUserByEmail(Email) {
    //db.users.findOne({username: username });
  return await client.db("guvi-event-app").collection("event-management").findOne({Email: Email});
}
export async function getUserByAdminEmail(Email) {
  //db.users.findOne({username: username });
return await client.db("guvi-event-app").collection("event-management-admin").findOne({ Email: Email });
}

export async function createNewEvent(data) {
  //db.users.findOne({username: username });
  return await client.db("guvi-event-app").collection("event-management-event").insertOne(data);
}

export async function getAllEvents() {
  return await client.db("guvi-event-app").collection("event-management-event").find({}).toArray();
}



