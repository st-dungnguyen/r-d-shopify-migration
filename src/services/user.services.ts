import { UserRepository } from '../repositories/user.repositories';
import { AppServices } from './app.services';

export class UserServices extends AppServices {
  userRepository: UserRepository;

  constructor() {
    super();
    this.userRepository = new UserRepository();
  }

  async findById(id: string): Promise<any> {
    const result = await this.userRepository.find(id);
    return result;
  }
}
