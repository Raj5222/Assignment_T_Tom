import { Request, Response, Errback } from "express";
import { AppPostgressSource } from "../config/data-source1";
import { generateToken, verifyToken } from "../Services/jwt";
import { Complain_form } from "../entity/complain_form";

const userRepository = AppPostgressSource.getRepository(Complain_form);

export const complain_form_create = async (req: Request, res: Response, error?: Errback) => {
    try{
      const incomigdata = req.body;
      const token = req.headers.authorization;
      if (!token) res.json({ error: "Token Not Available" });
      if (!incomigdata.form_title) res.json({ error: "Title Not Available" });
      if (!incomigdata.form_field_array) res.json({ error: "Form Field Not Available" });
      const { id } = await verifyToken(token); //Token Check
      
      if(id){

        const Response: any = await userRepository //Postgress
          .createQueryBuilder()
          .insert()
          .into(Complain_form)
          .values({ ...incomigdata, form_create_user_id: id })
          .execute();

        res.json({ Message: "New Form Created" });


      }else{
        res.json("Token Invalid or Expired.")
      }
    }catch(err){
        console.log("Complain From Create Error => ",err)
        error(err)
    }
}