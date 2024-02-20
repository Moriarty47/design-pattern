import { workerData, parentPort } from 'worker_threads';

if (!workerData || !parentPort) {
  throw new Error(`expected path/port`);
}

const workerPath = /** @type {string} */ (workerData);
const importPromise = import(workerPath);

parentPort.on('message',
  /** @param {{port: MessagePort, shared: SharedArrayBuffer, args: any[]}}message */
  (message) => {
    (async () => {
      const { port, shared, args } = message;
      try {
        const { default: asyncFunc } = await importPromise;
        const result = await Promise.resolve(asyncFunc(...args));
        port.postMessage({ result });
      } catch (error) {
        port.postMessage({ error });
      } finally {
        const int32 = new Int32Array(shared);
        Atomics.notify(int32, 0);
      }
    })();
  });