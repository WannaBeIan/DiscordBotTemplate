import type { ExtendedClient } from "../core/ExtendedClient"

export async function init(client: ExtendedClient) {
  client.logger.debug("Sample module initialized")
}
