import express from "express";
// import { auth } from "../middleware/auth.js";
import {
  getUserByAdminEmail,
  createAdmin,
  createNewEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  updateEventRegistrationById,
} from "./helper.js";
import { generateHashedPassword } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {authorizedUser} from "../middleware/auth.js"

const router = express.Router();

router.post("/signup", async function (request, response) {
  const { FirstName, LastName, Email, Password } = request.body;
  const userFromDB = await getUserByAdminEmail(Email);

  if (userFromDB) {
    response.status(400).send({ message: "Username already exists" });
  } else {
    const hashedPassword = await generateHashedPassword(Password);
    const result = await createAdmin({
      FirstName: FirstName,
      LastName: LastName,
      Email: Email,
      Password: hashedPassword,
    });
    response.send({ message: "successful Signup" });
  }
});

router.post("/login", async function (request, response) {
  const { Email, Password } = request.body;
  const userFromDB = await getUserByAdminEmail(Email);

  if (!userFromDB) {
    response.status(400).send({ message: "Invalid Credential" });
    return;
  } else {
    // check password
    const storedPassword = userFromDB.Password;
    const isPasswordMatch = await bcrypt.compare(Password, storedPassword);
    if (isPasswordMatch) {
      // response.send({ message: "successful login" });
      const secret = process.env.SECRET_KEY;
      const payload = {
        Email: Email,
      };
      
    let token = jwt.sign(payload, secret, { expiresIn: "1h" });
    console.log(token);
    response.status(200).send({ code: 0, message: 'ok', data: token });

      // localStorage.setItem("currentUser",UserName);
    } else {
      response.status(400).send({ message: "Invalid Credential" });
      return;
    }
  }
});

router.post("/newevent", async function (request, response) {
  const {eventname,eventposter,eventsummary,eventdate,eventstarttime,eventduration}=request.body;
  const data = {
    eventname: eventname,
    eventposter: eventposter,
    eventsummary: eventsummary,
    eventdate: eventdate,
    eventstarttime: eventstarttime,
    eventduration: eventduration,
    participantlist:[]
  }
  //db.movies.insertMany(data);
  const result = await createNewEvent(data);
  response.send(result);
});

router.get("/events", authorizedUser,async function (request, response) {
  //db.movies.find({});

  const events = await getAllEvents();
  response.send(events);
});
export const adminRouter = router;

router.get("/event/:id", async function (request, response) {
  const { id } = request.params;
  // const movie=movies.find((mv)=>mv.id===id);
  const event = await getEventById(id);
  event
    ? response.send(event)
    : response.status(404).send({ msg: "event not found" });
});

router.put("/event/:id", async function (request, response) {
  const { id } = request.params;
  const data = request.body;
  const result = await updateEventById(id, data);
  response.send(result);
});


router.delete('/event/:id',authorizedUser, async function (request, response) {
  const {id} = request.params;
        // const movie=movies.find((mv)=>mv.id===id);
  const result= await deleteEventById(id);
  result.deletedCount>0?response.send({msg:"event deleted successfully"}):response.status(404).send({msg:"event not found"});
    })

router.put("/eventreister/:id", async function (request, response) {
      const { id } = request.params;
      const eventFromDB = await getEventById(id);
      const Participants = request.body;
      const participantlist=[];
      let res= eventFromDB.participantlist.map((item)=>(participantlist.push(item)));
      participantlist.push(Participants);
      const result = await updateEventRegistrationById(id, participantlist);
      response.send(result);
    });

    