import { toBase62 } from './base62Encoder.js'

const CODE_LENGTH = 6

export const toShortCode = (counter: number): string => {
  const code = toBase62(counter)

  if (code.length > CODE_LENGTH) {
    throw new RangeError(`Code exceeds ${CODE_LENGTH}-character limit`)
  }

  return code.padStart(CODE_LENGTH, '0')
}
