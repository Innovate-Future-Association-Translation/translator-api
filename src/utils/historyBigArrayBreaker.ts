//because azure translator only allow maximum 100 string per call
//we need to use this function to break large history into smaller chunk

//data  structure  of result [[speech1....speech100],[speech101...speech200],[...],[...]]

export const ArrayBreaker = (largeArray: string[]): string[][] => {
  const chunkSize = 100;
  const totalChunk = Math.ceil(largeArray.length / chunkSize);

  const result: string[][] = [];

  for (let i = 0; i < totalChunk; i++) {
    const start = i * chunkSize;
    const end = start + chunkSize;
    const chunk = largeArray.slice(start, end);
    result.push(chunk);
  }

  return result;
};
