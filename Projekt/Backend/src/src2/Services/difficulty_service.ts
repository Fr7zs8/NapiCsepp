import { DiffiCultyRepository } from "../Repositories/difficulty_repository";

export class DifficultyService {
  private repository: DiffiCultyRepository;

  constructor() {
    this.repository = new DiffiCultyRepository();
  }

  async getDifficulties() {
    const results = await this.repository.getDifficulties();
    if (!results || results.length === 0) {
      throw new Error("Nincs egy db nehézség se.");
    }
    return results;
  }
}
