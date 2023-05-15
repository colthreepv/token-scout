import { formatDistanceToNow, formatRFC7231 } from 'date-fns'

export const timestampAgo = (timestamp?: number) => {
  if (timestamp == null) return { distanceToNow: null, absoluteDate: null }
  const distanceToNow = formatDistanceToNow(timestamp)
  const absoluteDate = formatRFC7231(timestamp)
  return { distanceToNow, absoluteDate }
}
