/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON object.
 */
type JsonObject = { [Key in string]?: JsonValue }

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches a JSON array.
 */
type JsonArray = {} & JsonValue[]

/**
 * From https://github.com/sindresorhus/type-fest/
 * Matches any valid JSON value.
 */
type JsonValue = string | number | boolean | JsonObject | JsonArray | null

type ErrorToObjectOptions = {
  keysToOmit?: string[]
}

const omissionValue = null

type AnyToObjectOptions = {
  item: unknown
  keysToOmit: string[]
}

const unknownToJsonValue = (options: AnyToObjectOptions): JsonValue => {
  const { item, keysToOmit } = options

  switch (typeof item) {
    case 'undefined':
    case 'function': {
      return null
    }

    case 'symbol': {
      return String(item)
    }

    case 'number':
    case 'string':
    case 'boolean': {
      return item
    }

    case 'bigint': {
      return Number(item)
    }

    case 'object': {
      if (item === null) {
        return null
      }

      if (Array.isArray(item)) {
        return item.map((arrayItem) =>
          unknownToJsonValue({ item: arrayItem, keysToOmit }),
        )
      }

      if (item instanceof Error) {
        const keys = new Set([
          ...Object.keys(item),
          'message',
          'stack',
          'cause',
        ])

        const output: Record<string, JsonValue> = {}
        for (const key of keys) {
          if (keysToOmit.includes(key)) {
            output[key] = omissionValue
            continue
          }

          if (key === 'cause') {
            output[key] = unknownToJsonValue({ item: item.cause, keysToOmit })
            continue
          }

          output[key] = item[key as keyof Error] as JsonValue
        }

        return output
      }

      const output: Record<string, JsonValue> = {}
      for (const key of Object.keys(item)) {
        if (keysToOmit.includes(key)) {
          output[key] = omissionValue
          continue
        }

        output[key] = unknownToJsonValue({
          item: (item as any)[key],
          keysToOmit,
        })
      }

      return output
    }
  }
}

const serializeError = (
  error: Error,
  options: ErrorToObjectOptions = {},
): JsonValue => {
  const { keysToOmit = [] } = options
  return unknownToJsonValue({ item: error, keysToOmit })
}

export { serializeError }
