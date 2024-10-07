import { Errback, Request, Response } from "express";
import { Customer } from "../entity/Customer";
import { User } from "../entity/Users";
import { AppPostgressSource } from "../config/data-source";
import { sendEmail } from "../Services/mail";


export const active = async (req: Request, res: Response, err:Errback) => {
  try {
    // Validate request parameters
    const user_id:any = req.query.user;
    
    const { authorization: jwtToken } = req.headers;;

    if (!user_id) {
      res.status(400).json({ error: 'User ID is required' });
    }

    if (!jwtToken) {
      res.status(401).json({ error: 'JWT token is required' });
    }

    // Verify super user
    const SuperRepository = AppPostgressSource.getRepository(User);
    const superUser = await SuperRepository.findOneBy({ u_id: "Raj0001" });
    if (!superUser) {
      res.status(500).json({ error: 'Super user not found' });
    }

    if (superUser.jwt_token !== jwtToken) {
      res.status(401).json({ error: 'Invalid JWT token' });
    }

    // Activate user account
    const userRepository = AppPostgressSource.getRepository(Customer);
    const user = await userRepository.findOneBy({ u_id: user_id });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    }

    user.status = true; // Update user status directly
    await userRepository.save(user);

    // Send activation email
    await sendEmail(
      "raj.sathavara122@gmail.com",
      `${user.u_id} Account Activated.`,
      superUser.firstname,
      `New User ${user.firstname} ,U_ID is ${user.u_id} Is Now Activated`
    );

    res.status(201).json(`${user.u_id} Account Activated`);
  } catch (error) {
    console.error(err,error);
  }
};