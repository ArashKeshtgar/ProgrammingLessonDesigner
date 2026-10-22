import { setTimeout as sleep } from 'node:timers/promises';

// #region worker
export async function runWorker(
  dispatch: () => Promise<void>,
  pollSeconds: number,
  signal: AbortSignal,
  logger: { error(msg: string, err: unknown): void } = console,
): Promise<void> {
  while (!signal.aborted && pollSeconds > 0) {
    try {
      await dispatch();
    } catch (err) {
      logger.error('The outbox pass failed; trying again on the next one.', err);
    }
    // sleep rejects with AbortError when the signal fires; swallow it and let the loop end
    await sleep(pollSeconds * 1000, undefined, { signal }).catch(() => undefined);
  }
}
// #endregion
