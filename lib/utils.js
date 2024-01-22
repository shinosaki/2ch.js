const unixNow = (d = Date.now()) => Math.trunc(d / 1000)

export const Ikioi = (res, time, now = unixNow()) => {
  return Number(res) / ( (now - Number(time)) / 86400 )
}

export const trunc = (n, c) => {
  const p = Math.pow(10, c)
  return Math.trunc(n * p) / p
}