import type { Event } from "../types/Event"

const event: Event = {
  name: "messageCreate",
  run: async (client, message) => {
    if (message.author?.bot) return
  }
}

export default event
