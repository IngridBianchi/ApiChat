import { SendMessage } from "../usecases/SendMessage.js";
import { GetHistory } from "../usecases/GetHistory.js";

export class MessageService {
  constructor(messageRepository) {
    this.sendMessage = new SendMessage(messageRepository);
    this.getHistory = new GetHistory(messageRepository);
  }

  async send(data) {
    return this.sendMessage.execute(data);
  }

  async history(data) {
    return this.getHistory.execute(data);
  }
}
