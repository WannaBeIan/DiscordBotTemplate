import type { ExtendedClient } from "../core/ExtendedClient"

let timer: NodeJS.Timeout | null = null

export async function start(client: ExtendedClient) {
  if (timer) return
  timer = setInterval(() => client.logger.debug("Job tick"), 60000)
}
