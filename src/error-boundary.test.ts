import { describe, test, expect } from 'vitest'
import { errorBoundary, errorBoundarySync } from './error-boundary.js'

describe('errorBoundarySync', () => {
  test('should catch error', () => {
    const value = errorBoundarySync(() => {
      throw new Error('hello world')
    })
    expect(value).toBeInstanceOf(Error)
  })

  test('should return value', () => {
    const value = errorBoundarySync(() => 'value')
    expect(value).toBe('value')
  })
})

describe('errorBoundary', () => {
  test('should catch error', async () => {
    const value = await errorBoundary(async () => {
      throw new Error('hello world')
    })
    expect(value).toBeInstanceOf(Error)
  })

  test('should return value', async () => {
    const value = await errorBoundary(async () => 'value')
    expect(value).toBe('value')
  })
})
