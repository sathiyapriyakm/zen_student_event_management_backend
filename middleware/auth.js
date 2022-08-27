// custom middleware
import jwt from "jsonwebtoken";

// export const auth =(request,response,next)=>{
//     try{
//     const token=request.header("x-auth-token");
//     console.log(token);
//     jwt.verify(token,process.env.SECRET_KEY);
//     next();}
//     catch(err){
//         response.status(401).send({error:err.message});
//     }
// }
// const jwt = require("jsonwebtoken");
// const Candidate = require("../model/candidateModel");
// const Recruiter = require("../model/recruiterModel");

export const authorizedUser = async (req, res, next) => {
  let token = req.headers.token;
  // console.log(token);
  if (!token) {
    res.status(401).send({ msg: "user is not authorized" });
  }
  try {
    let decode = await jwt.verify(token,process.env.SECRET_KEY);
    next();
    // console.log(decode);

    // req.user = await Candidate.findOne({ email: decode.email }).select(
    //   "-password"
    // );

    // if (req.user == null) {
    //   req.user = await Recruiter.findOne({ email: decode.email }).select(
    //     "-password"
    //   );
    //   //   console.log(req.user);
    //   next();
    // } else {
    //   //   console.log(req.user);

    //   next();
    // }
  } catch (e) {
    res.send(e);
  }
};
