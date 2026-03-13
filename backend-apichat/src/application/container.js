import { AuthService } from "./services/AuthService.js";
import { MessageService } from "./services/MessageService.js";
import { messageRepository, userRepository } from "../infrastructure/repositories/index.js";
import { passwordHasher, tokenService } from "../infrastructure/security/index.js";

const authService = new AuthService(userRepository, passwordHasher, tokenService);
const messageService = new MessageService(messageRepository);

export const container = {
  services: {
    authService,
    messageService,
  },
  security: {
    tokenService,
  },
};
