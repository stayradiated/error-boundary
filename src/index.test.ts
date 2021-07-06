/* eslint-disable fp/no-throw */

import test from 'ava'

import { errorBoundary, errorBoundarySync } from './index.js'

test('errorBoundarySync: should catch error', (t) => {
  const value = errorBoundarySync(() => {
    throw new Error('hello world')
  })
  t.true(value instanceof Error)
})

test('errorBoundarySync: should return value', (t) => {
  const value = errorBoundarySync(() => 'value')
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
