const ALPHABET =
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export const toBase62 = (counter: number): string => {
  if (!Number.isInteger(counter)) {
    throw new TypeError('Counter must be an integer')
  }

  if (counter <= 0) {
    throw new RangeError('Counter must be greater than 0')
  }

  let result = ''
  let current = counter

  while (current > 0) {
    const remainder = current % 62
    result = ALPHABET[remainder] + result
    current = Math.floor(current / 62)
  }

  return result
}
