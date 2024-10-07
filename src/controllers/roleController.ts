import { Request, Response } from "express";
import { User } from "../entity/Users";
import { Roles } from "../entity/Role";
import { AppPostgressSource } from "../config/data-source";

const userRepository = AppPostgressSource.getRepository(User);
const rolesRepository = AppPostgressSource.getRepository(Roles);

export const updateRole = async (req: Request, res: Response) => {
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
    const superUser = await userRepository.findOneBy({ u_id: "Raj0001" });
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
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
