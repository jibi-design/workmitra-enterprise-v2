// App name: Job Mitra
// Per-post async lock for confirm / direct-invite vacancy integrity (Wave 1 SC-1/SC-2)

const tails = new Map<string, Promise<unknown>>();

export async function withShiftConfirmLock<T>(postId: string, fn: () => Promise<T>): Promise<T> {
  const key = postId.trim() || "_";
  const prev = tails.get(key) ?? Promise.resolve();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const chained = prev.then(() => gate);
  tails.set(
    key,
    chained.then(
      () => undefined,
      () => undefined,
    ),
  );

  await prev;
  try {
    return await fn();
  } finally {
    release();
  }
}
