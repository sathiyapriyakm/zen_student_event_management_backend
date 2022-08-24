import express from "express";
// import { auth } from "../middleware/auth.js";
import { getUserByAdminEmail, createAdmin ,createNewEvent,getAllEvents} from "./helper.js";
import {generateHashedPassword} from "../index.js" ;
import bcrypt from "bcrypt";

const router =express.Router();


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

  router.post('/newevent',async function (request, response) {
    const data=request.body;
    console.log(data);
    //db.movies.insertMany(data);
    const result=await createNewEvent(data);
    response.send(result);
    })
  
    router.get('/events',async function (request, response) {
      //db.movies.find({});
      
      const events= await getAllEvents();
      response.send(events);
      })
    export const adminRouter=router;
  
