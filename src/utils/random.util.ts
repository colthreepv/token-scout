export const getRandomElement = <T>(array: readonly T[]): T | undefined => {
  if (array.length === 0) {
    return undefined // Returns undefined if the array is empty
  }

  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
}
