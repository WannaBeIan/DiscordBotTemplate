export function validateDiscordToken(token: string) {
  const t = token.trim()
  if (!t) throw new Error("DISCORD_TOKEN not set")
  if (t.startsWith("mfa.")) throw new Error("User token detected. Use Bot Token from Developer Portal > Bot > Reset Token")
  if (t.toLowerCase().startsWith("bot ")) throw new Error('Do not prefix the token with "Bot " in DISCORD_TOKEN')
  const parts = t.split(".")
  if (parts.length !== 3) throw new Error("Token format invalid. Expected three dot-separated parts")
  if (t.length < 50 || t.length > 200) throw new Error("Token length looks wrong")
  return t
}
