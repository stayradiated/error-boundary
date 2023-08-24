import { describe, test, expect } from 'vitest'
import { serializeError } from './serialize-error.js'

class CodedError extends Error {
  code: string | null = null

  constructor(message: string) {
    super(message)
    this.name = 'CodedError'
  }
}

describe('serializeError', () => {
  test('should serialize error', () => {
    const error = new Error('hello world')
    const serialized = serializeError(error)
    expect(serialized).toStrictEqual({
      message: 'hello world',
      stack: expect.any(String) as string,
      cause: null,
    })
  })

  test('should serialize error with custom properties', () => {
    const error = new CodedError('hello world')
    error.code = 'ENOENT'
    const serialized = serializeError(error)
    expect(serialized).toStrictEqual({
      name: 'CodedError',
      message: 'hello world',
      stack: expect.any(String) as string,
      code: 'ENOENT',
      cause: null,
    })
  })

  test('should serialize error with custom properties and omit keys', () => {
    const error = new CodedError('hello world')
    error.code = 'ENOENT'
    const serialized = serializeError(error, { keysToOmit: ['code'] })
    expect(serialized).toStrictEqual({
      name: 'CodedError',
      message: 'hello world',
      stack: expect.any(String) as string,
      code: null,
      cause: null,
    })
  })

  test('should serialize error with a cause', () => {
    const cause = new Error('cause')
    const error = new Error('hello world', { cause })
    const serialized = serializeError(error)
    expect(serialized).toStrictEqual({
      message: 'hello world',
      stack: expect.any(String) as string,
      cause: {
        message: 'cause',
        stack: expect.any(String) as string,
        cause: null,
      },
    })
  })
})
