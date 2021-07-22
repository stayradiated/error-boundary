/* eslint-disable fp/no-throw */

import test from 'ava'

import { errorBoundary, errorListBoundary, throwIfError } from './index.js'

test('errorBoundary: should catch sync error', (t) => {
  const value = errorBoundary(() => {
    throw new Error('hello world')
  })
  t.true(value instanceof Error)
})

test('errorBoundary: should return sync value', (t) => {
  const value = errorBoundary(() => 'value')
  t.is(value, 'value')
})

test('errorBoundary: should catch error', async (t) => {
  const value = await errorBoundary(async () => {
    throw new Error('hello world')
  })
  t.true(value instanceof Error)
})

test('errorBoundary: should return value', async (t) => {
  const value = await errorBoundary(async () => 'value')
  t.is(value, 'value')
})

test('errorListBoundary: should return list (sync)', (t) => {
  const list = ['a', 'b', 'c']
  const value = errorListBoundary(() => list)
  t.is(value, list)
})

test('errorListBoundary: should return error (sync)', (t) => {
  const list = ['a', new Error('Fail A'), 'b', 'c', new Error('Fail B')]
  const value = errorListBoundary(() => list)
  t.deepEqual(value, new Error('Fail A\nFail B'))
})

test('errorListBoundary: should return list (async)', async (t) => {
  const list = ['a', 'b', 'c']
  const value = await errorListBoundary(async () => list)
  t.is(value, list)
})

test('errorListBoundary: should return error (async)', async (t) => {
  const list = ['a', new Error('Fail A'), 'b', 'c', new Error('Fail B')]
  const value = await errorListBoundary(async () => list)
  t.deepEqual(value, new Error('Fail A\nFail B'))
})

test('errorListBoundary: should return error (Promise.all)', async (t) => {
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
  t.deepEqual(value, new Error(`-1 is not >= 0\n-2 is not >= 0`))
})

test('throwIfError: should throw for error values', (t) => {
  t.throws(
    () => {
      throwIfError(new Error('fail'))
    },
    {
      message: 'fail',
    },
  )
})

test('throwIfError: should throw for async error values', async (t) => {
  await t.throwsAsync(throwIfError(Promise.reject(new Error('fail'))), {
    message: 'fail',
  })
})

test('throwIfError: should return for non-error values', (t) => {
  const value = {}
  t.is(throwIfError(value), value)
})

test('throwIfError: should return for non-error async values', async (t) => {
  const value = {}
  const resolvedValue = await throwIfError(Promise.resolve(value))
  t.is(resolvedValue, value)
})
