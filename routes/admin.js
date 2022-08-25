import express from "express";
// import { auth } from "../middleware/auth.js";
import {
  getUserByAdminEmail,
  createAdmin,
  createNewEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById
} from "./helper.js";
import { generateHashedPassword } from "../index.js";
import bcrypt from "bcrypt";

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
      response.send({ message: "successful login" });
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
  console.log(data);
  //db.movies.insertMany(data);
  const result = await createNewEvent(data);
  response.send(result);
});

router.get("/events", async function (request, response) {
  //db.movies.find({});

  const events = await getAllEvents();
  response.send(events);
});
export const adminRouter = router;

router.get("/event/:id", async function (request, response) {
  const { id } = request.params;
  console.log("id is : ", id);
  // const movie=movies.find((mv)=>mv.id===id);
  const event = await getEventById(id);
  console.log(event);
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


router.delete('/event/:id', async function (request, response) {
  const {id} = request.params;
        // const movie=movies.find((mv)=>mv.id===id);
  const result= await deleteEventById(id);
  result.deletedCount>0?response.send({msg:"event deleted successfully"}):response.status(404).send({msg:"event not found"});
    })

// router.put("/eventreister/:id", async function (request, response) {
//       const { id } = request.params;
//       const Participants = request.body;
//       const result = await updateEventRegistrationById(id, data);
//       response.send(result);
//     });

    // app.put("/assignMentor", async function(req, res){ 
    //   const {mentorName,students}=req.body;
    //   //Get the mentor details
    //   const mentorFromDB=await client.db("mentorAssignment").collection("Mentors").findOne({"mentorName":mentorName});
    //   const studentlist=[];
    //   let initialMenteelength=0;
    //   // If mentor already have students, copy them to new student_ID array to be updated
    //   if(mentorFromDB.student_assigned===true){
    //     initialMenteelength=mentorFromDB.student_ID.length;
    //     mentorFromDB.student_ID.map((stud_id)=>studentlist.push(stud_id));
    //   }
    //   for(let i=0;i<students.length;i++){
    //     const studentName=students[i];
    //     //get details of student from DB
    //     const studentFromDB=await client.db("mentorAssignment").collection("students").findOne({"studentName":studentName});
    //    //check for each student if they already have mentor and if not update the mentor details to student
    //     if(studentFromDB.mentor_assigned===false){
    //       const result1=await client.db("mentorAssignment").collection("students").updateOne({"studentName":studentName},
    //       {$set:{"mentor_ID":mentorFromDB._id,"mentor_name":mentorFromDB.mentorName,"mentor_assigned":true}})
    //       studentlist.push(studentFromDB._id);
    //     }
    //   }
    //   //check if any new student added to the mentor and give response accordingly
    //   if((studentlist.length-initialMenteelength)>0){
    //     // update final stdent_ID array to mentor
    //   const result2=await client.db("mentorAssignment").collection("Mentors").updateOne({"mentorName":mentorName},
    //       {$set:{"student_ID":studentlist,"student_assigned":true}})
    //   res.send(` Students are added to mentor `);}
    //   else {
    //     res.send(`students already have mentor`)
    //   }
    //   });
