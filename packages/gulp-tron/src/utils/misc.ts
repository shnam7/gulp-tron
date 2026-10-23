export async function timer(msec: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
