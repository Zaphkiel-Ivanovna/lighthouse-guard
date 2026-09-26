export type SerialQueue = {
  /** Runs `task` after every previously queued task settled (success or failure). */
  run<T>(task: () => Promise<T>): Promise<T>;
};

/**
 * One GATT session at a time. Lighthouses accept a single connection and
 * Android's GATT stack misbehaves with concurrent connects, so every
 * connect → read/write → disconnect sequence goes through this queue.
 */
export function createSerialQueue(): SerialQueue {
  let tail: Promise<unknown> = Promise.resolve();

  return {
    run(task) {
      const result = tail.then(task);
      tail = result.catch(() => undefined);
      return result;
    },
  };
}
