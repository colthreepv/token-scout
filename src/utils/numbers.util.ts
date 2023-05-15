import { formatDistanceToNow, formatRFC7231 } from 'date-fns'

export const timestampAgo = (timestamp?: number) => {
  if (timestamp == null) return { distanceToNow: null, absoluteDate: null }
  if (timestamp < 100_000_000_000) timestamp *= 1000
  const distanceToNow = formatDistanceToNow(timestamp)
  const absoluteDate = formatRFC7231(timestamp)
  return { distanceToNow, absoluteDate }
}
