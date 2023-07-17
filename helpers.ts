export const parseData = (data: string): unknown => {
  return JSON.parse(data);
};

export const getRandom = (max: number): number => Math.floor(Math.random() * max);
