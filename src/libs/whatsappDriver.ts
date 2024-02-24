import { Client } from "whatsapp-web.js";

export class WhatsappDriver extends Client {
  async sendMessages(phone: string, messages: string[]) {
    for await (const message of messages) {
      await this.sendMessage(phone, message);
    }
  }
}
