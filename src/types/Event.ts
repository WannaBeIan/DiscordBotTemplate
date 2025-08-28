import type { ExtendedClient } from "../core/ExtendedClient"

export type Event = {
  name: string
  once?: boolean
  run: (client: ExtendedClient, ...args: any[]) => Promise<void> | void
}
