import { TypeRepository } from "../Repositories/type_repository";

export class TypeService {
  private repository: TypeRepository;

  constructor() {
    this.repository = new TypeRepository();
  }

  async getTypes() {
    const results = await this.repository.getTypes();
    if (!results || results.length === 0) {
      throw new Error("Nincs egy db típus se.");
    }
    return results;
  }
}
