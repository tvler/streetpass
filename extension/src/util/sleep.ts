export function sleep(sleepMs: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res();
    }, sleepMs);
  });
}
