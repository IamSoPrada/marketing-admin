/**
 * Мок-слой: имитация сетевых задержек для async-операций.
 * При подключении реального backend заменяется на HTTP-клиент (httpLayer),
 * сигнатуры методов сторов не меняются.
 */

export function mockDelay(ms = 350): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let sequence = 1000

export function nextId(prefix: string): string {
  sequence += 1
  return `${prefix}-${sequence}`
}
