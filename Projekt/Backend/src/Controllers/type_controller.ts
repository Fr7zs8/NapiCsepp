import { TypeService } from "../Services/type_service";
import { Response } from "express";

const service: TypeService = new TypeService();

export class TypeController {
  async getTypes(_req: any, res: Response) {
    try {
      const results = await service.getTypes();
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
