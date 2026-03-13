import { RegisterUser } from "../usecases/RegisterUser.js";
import { LoginUser } from "../usecases/LoginUser.js";
import { RefreshSession } from "../usecases/RefreshSession.js";
import { LogoutUser } from "../usecases/LogoutUser.js";

export class AuthService {
  constructor(userRepository, passwordHasher, tokenService) {
    this.registerUser = new RegisterUser(userRepository, passwordHasher, tokenService);
    this.loginUser = new LoginUser(userRepository, passwordHasher, tokenService);
    this.refreshSession = new RefreshSession(userRepository, tokenService);
    this.logoutUser = new LogoutUser(userRepository);
  }

  async register(data) {
    return this.registerUser.execute(data);
  }

  async login(data) {
    return this.loginUser.execute(data);
  }

  async refresh(refreshToken) {
    return this.refreshSession.execute(refreshToken);
  }

  async logout(userId) {
    return this.logoutUser.execute(userId);
  }
}
