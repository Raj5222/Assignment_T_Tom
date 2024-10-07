import { Errback, Request, Response } from "express";
import { User } from "../entity/Users";
import { Roles } from "../entity/Role";
import { AppPostgressSource } from "../config/data-source";

const userRepository = AppPostgressSource.getRepository(User);
const rolesRepository = AppPostgressSource.getRepository(Roles);

export const updateRole = async (req: Request, res: Response,err:Errback) => {
  try {
    // Validate request body
    const newrole = req.body.newrole;
    if (!newrole) {
      res.status(400).json({ error: "Invalid request: newrole is required" });
    }

    // Validate JWT token
    const jwtToken = req.headers.authorization;
    if (!jwtToken) {
      res.status(401).json({ error: "JWT token is required" });
    }

    // Verify super user
    const superUser = await userRepository
      .createQueryBuilder("user")
      .select(["user.jwt_token"])
      .where("user.u_id = :temp", { temp:'Raj0001' })
      .getOne();

    if (!superUser) {
      res.status(500).json({ error: "Super user not found" });
    }

    if (superUser.jwt_token !== jwtToken) {
      res.status(401).json({ error: "Invalid JWT token" });
    }

    // Create new role
    const dataRole = rolesRepository.create({ role: newrole });
    const roleUpdate = await rolesRepository.save(dataRole);

    // Return success response
    res.status(201).json({Message:"New Role Inserted" ,Updated: roleUpdate});
  } catch (error) {
    err(error);
  }
};
