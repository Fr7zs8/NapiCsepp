import { HttpException } from "../middleware/error";
import { IType } from "../Models/type_model";
import { TypeRepository } from "../Repositories/type_repository";

export class TypeService {
  private repository: TypeRepository;

  constructor() {
    this.repository = new TypeRepository();
  }

  async getTypes(): Promise<IType[]> {
    const results = await this.repository.getTypes();
    if (!results || results.length === 0) {
      throw new HttpException(404, "Nincs egy db típus se.");
    }
    return results;
  }
}
