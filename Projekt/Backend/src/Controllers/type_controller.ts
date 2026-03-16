import { TypeService } from "../Services/type_service";
import { Response } from "express";

export class TypeController {
  private service: TypeService = new TypeService();
  async getTypes(_req: any, res: Response):Promise<void> {
    try {
      const results = await this.service.getTypes();
      res.status(200).send(results);
    } catch (err: any) {
      res
        .status(err.status || 500)
        .send({ message: err.message || "Hiba történt a lekérés során." });
    }
  }
}
