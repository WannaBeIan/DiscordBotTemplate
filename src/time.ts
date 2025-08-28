export const now = () => Date.now()
export const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))
