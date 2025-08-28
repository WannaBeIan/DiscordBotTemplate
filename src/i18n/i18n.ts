type Dict = Record<string, string>
type Bundle = Record<string, Dict>

const DEFAULT_LOCALE = "en-US" as const

const bundles: Bundle = {
  "en-US": {
    "help.title": "Commands",
    "ping.pong": "Pong {ms}ms",
    "errors.unavailable": "Unavailable command.",
    "errors.guildOnly": "Guild only.",
    "errors.chooseSuggestion": "Choose a value from the suggestions.",
    "locale.get": "Current locale: {loc}",
    "locale.set": "Locale updated to {loc}"
  },
  "es-ES": {
    "help.title": "Comandos",
    "ping.pong": "Pong {ms}ms",
    "errors.unavailable": "Comando no disponible.",
    "errors.guildOnly": "Solo en servidor.",
    "errors.chooseSuggestion": "Elige un valor de las sugerencias.",
    "locale.get": "Idioma actual: {loc}",
    "locale.set": "Idioma actualizado a {loc}"
  }
}

function getDict(locale: string): Dict {
  return bundles[locale] ?? bundles[DEFAULT_LOCALE]!
}

export function t(key: string, locale: string, vars?: Record<string, string | number>) {
  const dict = getDict(locale)
  let out = dict[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.replace(new RegExp(`\\{${k}\\}`, "g"), String(v))
  return out
}

export function hasLocale(loc: string) {
  return loc in bundles
}

export const supportedLocales = Object.keys(bundles)
