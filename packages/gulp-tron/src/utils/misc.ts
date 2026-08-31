export async function timer(msec: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}
