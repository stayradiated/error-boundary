import { describe, test, expect } from 'vitest'
import {
  errorListBoundary,
  errorListBoundarySync,
} from './error-list-boundary.js'

describe('errorListBoundarySync', () => {
  test('should return list', () => {
    const list = ['a', 'b', 'c']
    const value = errorListBoundarySync(() => list)
    expect(value).toBe(list)
  })

  test('should return error', () => {
    const list = ['a', new Error('Fail A'), 'b', 'c']
    const value = errorListBoundarySync(() => list)
    expect(value).toMatchObject({
      message: 'E_MULTI: Caught 1 error: [Fail A]',
    })
  })
})

describe('errorListBoundary', () => {
  test('should return list', async () => {
    const list = ['a', 'b', 'c']
    const value = await errorListBoundary(async () => list)
    expect(value).toBe(list)
  })

  test('should return error', async () => {
    const list = ['a', new Error('Fail A'), 'b', 'c', new Error('Fail B')]
    const value = await errorListBoundary(async () => list)
    expect(value).toMatchObject({
      message: 'E_MULTI: Caught 2 errors: [Fail A, Fail B]',
    })
  })

  test('should return error (Promise.all)', async () => {
    const items = [3, 2, 1, -1, -2]
    const value = await errorListBoundary(async () =>
      Promise.all(
        items.map(async (item) => {
          if (item < 0) {
            return new Error(`${item} is not >= 0`)
          }

          return 2 ** item
        }),
      ),
    )
    expect(value).toMatchObject({
      message: 'E_MULTI: Caught 2 errors: [-1 is not >= 0, -2 is not >= 0]',
    })
  })
})
