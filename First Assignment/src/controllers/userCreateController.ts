import { Request, Response, Errback,NextFunction } from "express";
import { User } from "../entity/Users";
import { AppPostgressSource } from "../config/data-source";
import Crypto from "../Services/crypto";
import { generateToken, verifyToken } from "../Services/jwt"
import { sendEmail } from "../Services/mail";

const userRepository = AppPostgressSource.getRepository(User);

// Login User
export const fetchUsers = async (req: Request, res: Response,looperror:Errback) => {
  const j_token = await req.headers.authorization;
  console.log("<= End")
    let body: any = await Crypto.decryptJson(req.body.data);
    // const body:any = await CryptoService.encryptJson(req.body)
    console.log("Decrypted Data => ",body)

  const { email, password, id} = body;

  if (!(email || id) || !password) {
    res.status(400).json({ message: "Please provide ID or email and password" });
  }

  let user;
  try {

    if(!j_token)res.status(401).json({ message: "Not Set JWT Token." });
    try{
      verifyToken(j_token)  //Jwt Verify
     }catch(err){
      res.status(401).json({ message: `Invalid JWT Token.`,Error: err});
     }

    if (id) {
      user = await userRepository.findOneOrFail({ where: { u_id: id } });
    } else {
      user = await userRepository.findOneOrFail({ where: { email } });
    }
    const isValidPassword = (await Crypto.encrypt(password)) === user.password ? true : false;

    if (!isValidPassword) {
      res.status(401).json({ message: "Invalid credential." });
    }
    res.status(200).json({ message: `Welcome ${user.firstname}`  });
  } catch (error) {
    looperror(error);
  }
};


// Add User
export const addUser = async (req: Request, res: Response) => {
  const user = req.body;
//   console.log("Password is => ",await CryptoService.encrypt(user.password).then());
  user.password = await Crypto.encrypt(user.password).then(); //Pasword ecpt

  const count = await userRepository.count({
    where: { firstname: user.firstname },
  });
  user.u_id = user.firstname.slice(0, 3) + "000" + count; //Uid Set
  console.log(user);
  user.jwt_token = await generateToken(user.u_id)

  try {
    const newUser = userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(user) 
      .execute();
    res.status(201).json("New User Created");
      await sendEmail(
        "raj.sathavara122@gmail.com",
        `New Account Created.`,
        user.firstname,
        `New User ${user.firstname}, U_ID ${user.u_id} Created If You Want To Acctive This Account Then Click The Given Link`,
        "http://localhost:3000/api/active "
      ); 
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const encry = async (req: Request, res: Response) => {
  // Temperary Encrypt and Decrypt
  const user = req.body;
  console.log("Authorization => ",req.headers.Authorization)
  console.log(" <= End")

  try {
    if (req.body.flag===true) {
      let data: any = await Crypto.decryptJson(req.body.data);
      res.status(201).json(data);
    } else {
      let data: any = await Crypto.encryptJson(req.body);
      res.status(201).json(data);
    }
  } catch (error) {
    if (!res.headersSent) {
            res.status(500).json({ error: "An unexpected error occurred." });
          }
  }
};
