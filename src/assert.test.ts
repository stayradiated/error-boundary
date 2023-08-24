import { describe, test, expect } from 'vitest'
import { errorBoundary, errorBoundarySync } from './error-boundary.js'
import { assertOk, assertError } from './assert.js'

describe('assertOk', () => {
  test('should throw for error values', () => {
    const eitherStringOrError = errorBoundarySync<string>(() => {
      throw new Error('eitherStringOrError is an Error')
    })

    expect(() => {
      assertOk(eitherStringOrError)
    }).toThrow('eitherStringOrError is an Error')
  })

  test('should return for non-error values', () => {
    const eitherStringOrError = errorBoundarySync<string>(() => {
      return 'Success'
    })

    assertOk(errorBoundarySync)

    expect(eitherStringOrError).toBe('Success')
  })
})

describe('assertError', () => {
  test('should throw for error values', async () => {
    const eitherStringOrError = await errorBoundary<string>(async () => {
      return 'Success'
    })

    expect(() => {
      assertError(eitherStringOrError)
    }).toThrow('Expected value to be an error.')
  })

  test('should return for non-error values', async () => {
    const eitherStringOrError = errorBoundarySync<string>(() => {
      throw new Error('eitherStringOrError is an Error')
    })

    assertError(eitherStringOrError)

    expect(eitherStringOrError).toBeInstanceOf(Error)
  })
})
