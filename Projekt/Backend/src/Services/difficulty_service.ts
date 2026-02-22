import { IDifficulty } from "../Models/difficulty_model";
import { DiffiCultyRepository } from "../Repositories/difficulty_repository";
import { HttpException } from "../middleware/error";

export class DifficultyService {
  private repository: DiffiCultyRepository;

  constructor() {
    this.repository = new DiffiCultyRepository();
  }

  async getDifficulties(): Promise<IDifficulty[]> {
    const results = await this.repository.getDifficulties();
    if (!results || results.length === 0) {
      throw new HttpException(404, "Nincs egy db nehézség se.");
    }
    return results;
  }
}
