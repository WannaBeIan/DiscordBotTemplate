import type { ButtonInteraction, StringSelectMenuInteraction, ModalSubmitInteraction } from "discord.js"

export type ComponentKind = "button" | "select" | "modal"

export type ComponentHandler = {
  kind: ComponentKind
  idPrefix: string
  run: (i: ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction) => Promise<void>
}
