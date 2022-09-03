import express from "express";
import {
  getUserByAdminEmail,
  createAdmin,
  createNewEvent,
  getAllEvents,
  getEventById,
  updateEventById,
  deleteEventById,
  updateEventRegistrationById,
  getUserByName,
} from "./helper.js";
import { generateHashedPassword } from "../index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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
      
      const secret = process.env.SECRET_KEY;
      const payload = {
        Email: Email,
      };
      
    let token = jwt.sign(payload, secret, { expiresIn: "1h" });
    let userData={
      id:userFromDB._id,
      FirstName:userFromDB.FirstName,
      LastName:userFromDB.LastName,
      Email:userFromDB.Email,
       type: "admin"
      }
    response.status(200).send({ code: 0, message: 'ok', data: token, user: userData });

      
    } else {
      response.status(400).send({ message: "Invalid Credential" });
      return;
    }
  }
});

router.get("/detail/:email",authorizedUser, async function (request, response) {
  const { email } = request.params;
  const student = await getUserByName(email);
  student ? response.send({id:student._id, name:student.FirstName,email:student.Email}) : response.status(404).send({ msg: "user not found" })
});

router.post("/newevent",authorizedUser, async function (request, response) {
  const {eventname,eventposter,eventsummary,eventenddate,eventtrailer,questionlink}=request.body;
  const data = {
    eventname: eventname,
    eventposter: eventposter,
    eventsummary: eventsummary,
    eventenddate: eventenddate,
    eventtrailer: eventtrailer,
    questionlink: questionlink,
    participantlist:[]
  }
  //db.movies.insertMany(data);
  const result = await createNewEvent(data);
  response.send(result);
});

router.post("/newEmail",authorizedUser, async function (request, response) {
  const { eventid,studentId,studentEmail,studentName,eventname,questionlink, frontendcode,backendcode,frontenddeploy,backenddeploy,mark,comment} = request.body;
  //send a mail using nodemailer

    //Create Transporter
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    //Mail options
    let mailOptions = {
      from: "no-reply@noreply.com",
      to: studentEmail,
      subject: `Evaluvation detail of ${eventname}`,
      html: `<h4>Hello ${studentName},</h4>
      <p>Kidly find below evaluvation details of ${eventname}</p><br/>
      <p>Question Link:<u> ${questionlink}</u></p>
      <p>Front-end Source Code: <u> ${frontendcode}</u></p>
      <p>Back-end Source Code:<u> ${backendcode}</u></p>
      <p>Front-end deployment:<u> ${frontenddeploy}</u></p>
      <p>Back-end deployment :<u> ${backenddeploy}</u></p>
      <p>Mark : ${mark}</p>
      <p>Evaluvation comment: ${comment}</p><br/><br/>
      <h4>Thanks and Regards</h4>
      <p>Event Organizing team</p>`,
    };
    //Send mail
    transporter.sendMail(mailOptions, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        console.log("email sent successfully");
      }
    });
    //store in DB as mail is sent
    
    const eventFromDB = await getEventById(eventid);
    const participantlist=[];
    let evalList={};
    for(let i=0;i<eventFromDB.participantlist.length;i++){
      if(eventFromDB.participantlist[i].studentId===studentId){
        
        evalList={
          studentId:eventFromDB.participantlist[i].studentId,
          studentName:eventFromDB.participantlist[i].studentName,
          studentEmail:eventFromDB.participantlist[i].studentEmail,
          studentCode:{
            frontendcode:eventFromDB.participantlist[i].studentCode.frontendcode,
            backendcode:eventFromDB.participantlist[i].studentCode.backendcode,
            frontenddeploy:eventFromDB.participantlist[i].studentCode.frontenddeploy,
            backenddeploy:eventFromDB.participantlist[i].studentCode.backenddeploy
          },
          mark:mark,
          comment:comment,
          result:"Sent",
        }
        participantlist.push(evalList);
      }
      else{
      participantlist.push(eventFromDB.participantlist[i]);
      }
    }
    const result = await updateEventRegistrationById(eventid, participantlist);
    response.send(result);
});

router.get("/events", authorizedUser,async function (request, response) {
  //db.movies.find({});

  const events = await getAllEvents();
  response.send(events);
});

router.get("/events/:email", authorizedUser,async function (request, response) {

  const { email } = request.params;
  const events = await getAllEvents();
  let notParticipatedList=[];
  let flag=0;

  for(let i=0; i<events.length;i++){
    flag=0;
    for(let j=0;j<events[i].participantlist.length;j++){
      if(events[i].participantlist[j].studentEmail===email){
        flag=1;
        break;
      }
    }
    if(flag===0){
      notParticipatedList.push(events[i])
    }
  }
  response.send(notParticipatedList);
});


router.get("/events/part/:email", authorizedUser,async function (request, response) {

  const { email } = request.params;
  const events = await getAllEvents();
  let Participateddetail=[];
  let temp ={};

  for(let i=0; i<events.length;i++){

    for(let j=0;j<events[i].participantlist.length;j++){
      temp={};
      if(events[i].participantlist[j].studentEmail===email){
      
        temp={
          eventid:events[i]._id,
          eventname:events[i].eventname,
          questionlink:events[i].questionlink,
          studentId:events[i].participantlist[j].studentId,
          studentName:events[i].participantlist[j].studentName,
          frontendcode:events[i].participantlist[j].studentCode.frontendcode,
          backendcode:events[i].participantlist[j].studentCode.backendcode,
          frontenddeploy:events[i].participantlist[j].studentCode.frontenddeploy,
          backenddeploy:events[i].participantlist[j].studentCode.backenddeploy,
          mark:events[i].participantlist[j].mark,
          comment:events[i].participantlist[j].comment,
        }
        Participateddetail.push(temp);
        break;
      }
    }
  }
  response.send(Participateddetail);
});


router.get("/evaluvatedList", authorizedUser,async function (request, response) {

  const events = await getAllEvents();
  let evaluvatedDetail=[];
  let temp ={};

  for(let i=0; i<events.length;i++){

    for(let j=0;j<events[i].participantlist.length;j++){
      temp={};
      if((events[i].participantlist[j].result==="Not Sent")||(events[i].participantlist[j].result==="Sent")){
      
        temp={
          eventid:events[i]._id,
          eventname:events[i].eventname,
          questionlink:events[i].questionlink,
          studentId:events[i].participantlist[j].studentId,
          studentEmail:events[i].participantlist[j].studentEmail,
          studentName:events[i].participantlist[j].studentName,
          frontendcode:events[i].participantlist[j].studentCode.frontendcode,
          backendcode:events[i].participantlist[j].studentCode.backendcode,
          frontenddeploy:events[i].participantlist[j].studentCode.frontenddeploy,
          backenddeploy:events[i].participantlist[j].studentCode.backenddeploy,
          mark:events[i].participantlist[j].mark,
          comment:events[i].participantlist[j].comment,
          result:events[i].participantlist[j].result
        }
        evaluvatedDetail.push(temp);
      }
    }
  }
  response.send(evaluvatedDetail);
});

router.get("/resultDetail/:eventid/:studentId", authorizedUser,async function (request, response) {
  const { eventid } = request.params;
  const {studentId}=request.params;
  const eventFromDB = await getEventById(eventid);
  let resultDetail={};
  let flag=0;

    for(let j=0;j<eventFromDB.participantlist.length;j++){
      if(eventFromDB.participantlist[j].studentId===studentId){
      
        resultDetail={
          eventid:eventFromDB._id,
          eventname:eventFromDB.eventname,
          questionlink:eventFromDB.questionlink,
          studentId:eventFromDB.participantlist[j].studentId,
          studentEmail:eventFromDB.participantlist[j].studentEmail,
          studentName:eventFromDB.participantlist[j].studentName,
          frontendcode:eventFromDB.participantlist[j].studentCode.frontendcode,
          backendcode:eventFromDB.participantlist[j].studentCode.backendcode,
          frontenddeploy:eventFromDB.participantlist[j].studentCode.frontenddeploy,
          backenddeploy:eventFromDB.participantlist[j].studentCode.backenddeploy,
          mark:eventFromDB.participantlist[j].mark,
          comment:eventFromDB.participantlist[j].comment,
          result:eventFromDB.participantlist[j].result
        }
        flag=1;
        break;
      }
    }
    response.send(resultDetail);
});


router.get("/dashboardDetail/:email", authorizedUser,async function (request, response) {

  const { email } = request.params;
  const events = await getAllEvents();
  const totalEvents=events.length;
  let Participateddetail=[];
  let temp ={};
  let totMark=0;
  let notEval=0;
  let taskEval=[];

  for(let i=0; i<events.length;i++){
    for(let j=0;j<events[i].participantlist.length;j++){
      temp={};
      if(events[i].participantlist[j].studentEmail===email){
        temp={
          eventid:events[i]._id,
          eventname:events[i].eventname,
          questionlink:events[i].questionlink,
          studentId:events[i].participantlist[j].studentId,
          studentName:events[i].participantlist[j].studentName,
          frontendcode:events[i].participantlist[j].studentCode.frontendcode,
          backendcode:events[i].participantlist[j].studentCode.backendcode,
          frontenddeploy:events[i].participantlist[j].studentCode.frontenddeploy,
          backenddeploy:events[i].participantlist[j].studentCode.backenddeploy,
          mark:events[i].participantlist[j].mark,
          comment:events[i].participantlist[j].comment,
        }
        if(temp.mark==="Not evaluvated"){
          notEval += 1;
          taskEval.push({Event:temp.eventname,Mark:"Not Evaluvated"});
        }else{
          totMark= totMark + parseInt(temp.mark)
          taskEval.push({Event:temp.eventname,Mark:temp.mark});
        }
        Participateddetail.push(temp);
        break;
      } 
    }
  }
  const partEvents=Participateddetail.length;

  const dashDetail={
    totalEvents:totalEvents,
    participatedEvents:partEvents,
    totalMarks:totMark,
    taskNotEval:notEval,
    taskEval:taskEval
  }
  response.send(dashDetail);
});



router.get("/event/:id",authorizedUser, async function (request, response) {
  const { id } = request.params;
  // const movie=movies.find((mv)=>mv.id===id);
  const event = await getEventById(id);
  event
    ? response.send(event)
    : response.status(404).send({ msg: "event not found" });
});


router.get("/event/code/:eventid/:studentid",authorizedUser, async function (request, response) {
  const { eventid } = request.params;
  const { studentid } = request.params;
  // const movie=movies.find((mv)=>mv.id===id);
  const event = await getEventById(eventid);
  let codeData={};
for(let i=0;i<event.participantlist.length;i++){
  if(event.participantlist[i].studentId===studentid){
    codeData={
      questionlink:event.questionlink,
      frontendcode:event.participantlist[i].studentCode.frontendcode,
      backendcode:event.participantlist[i].studentCode.backendcode,
      frontenddeploy:event.participantlist[i].studentCode.frontenddeploy,
      backenddeploy:event.participantlist[i].studentCode.backenddeploy,
    }
    break;
  }
  }
  Object.keys(codeData).length >0
    ? response.send(codeData)
    : response.status(404).send({ msg: "event with participant details not found" });
});


router.put("/evaluvate/:eventid/:studentid",authorizedUser, async function (request, response) {
  const { eventid } = request.params;
  const {studentid} = request.params;
  const {mark,comment} = request.body;

  const eventFromDB = await getEventById(eventid);
      
      const participantlist=[];
      let evalList={};
      for(let i=0;i<eventFromDB.participantlist.length;i++){
        if(eventFromDB.participantlist[i].studentId===studentid){
          
          evalList={
            studentId:eventFromDB.participantlist[i].studentId,
            studentName:eventFromDB.participantlist[i].studentName,
            studentEmail:eventFromDB.participantlist[i].studentEmail,
            studentCode:{
              frontendcode:eventFromDB.participantlist[i].studentCode.frontendcode,
              backendcode:eventFromDB.participantlist[i].studentCode.backendcode,
              frontenddeploy:eventFromDB.participantlist[i].studentCode.frontenddeploy,
              backenddeploy:eventFromDB.participantlist[i].studentCode.backenddeploy
            },
            mark:mark,
            comment:comment,
            result:"Not Sent",
          }
          participantlist.push(evalList);
        }
        else{
        participantlist.push(eventFromDB.participantlist[i]);
        }
      }
      const result = await updateEventRegistrationById(eventid, participantlist);
      response.send(result);
});


router.put("/event/:id",authorizedUser, async function (request, response) {
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

router.put("/eventreister/:id",authorizedUser, async function (request, response) {
      const { id } = request.params;
      const eventFromDB = await getEventById(id);
      const Participants = request.body;
      const participantlist=[];
      let res= eventFromDB.participantlist.map((item)=>(participantlist.push(item)));
      participantlist.push(Participants);
      const result = await updateEventRegistrationById(id, participantlist);
      response.send(result);
    });
    export const adminRouter = router;

    