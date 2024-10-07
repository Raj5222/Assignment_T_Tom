import { Request, Response } from "express";
import { Customer } from "../entity/Customer";
import { User } from "../entity/Users";
import { AppPostgressSource } from "../config/data-source";
import { sendEmail } from "../Services/mail";
import Crypto from "../Services/crypto";
import { generateToken } from "../Services/jwt";

const customerRepository = AppPostgressSource.getRepository(Customer);
const userRepository = AppPostgressSource.getRepository(User);

export const fetchUsers = async (req: Request, res: Response) => {
  try {
    console.log(req.headers);
    const users = await userRepository.find({
      where: { firstname: 'Raj' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addUser = async (req: Request, res: Response) => {
  const user = req.body;
  const jwt:any = req.headers.Authorization
  const super_user = await userRepository.findOneBy({jwt_token: jwt });

  if(!super_user)res.status(500).json("Super User Not Found")

  user.user_u_id = super_user.user_u_id;
  //   console.log("Password is => ",await CryptoService.encrypt(user.password).then());
  user.password = await Crypto.encrypt(user.password).then(); //Pasword ecpt

  const count = await customerRepository.count({
    where: { firstname: user.firstname },
  });
  user.u_id = user.firstname.slice(0, 3) + "000" + count; //Uid Set
  console.log(user);
  user.jwt_token = await generateToken(user.u_id);


  try {
    const newUser = customerRepository
      .createQueryBuilder()
      .insert()
      .into(Customer)
      .values(user)
      .execute();
    res.status(201).json("New User Created");

    await sendEmail(
      "raj.sathavara122@gmail.com",
      `${user.u_id} Account Created.`,super_user.firstname,
      `New User ${user.firstname}, U_ID ${user.u_id} Created If You Want To Activate This Account Then Click The Given Link`,
      `http://localhost:3000/api/active/?user=${user.u_id}`
    );

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};