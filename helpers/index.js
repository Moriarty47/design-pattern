import { Worker, MessageChannel, receiveMessageOnPort, isMainThread } from 'worker_threads';

/**
 * @param {string} workerPath
 * @return {(...args: any) => any}
 */
export default function build(workerPath) {
  workerPath = workerPath.endsWith('.js') ? workerPath : `${workerPath}.js`;
  const taskPath = new URL('./task.js', import.meta.url);
  const worker = new Worker(taskPath, { workerData: workerPath });
  worker.unref();
  let activeCount = 0;

  return (...args) => {
    if (activeCount === 0) {
      worker.ref();
      activeCount++;
    }

    try {
      const shared = new SharedArrayBuffer(4);
      const int32 = new Int32Array(shared);

      const { port1: localPort, port2: workerPort } = new MessageChannel();
      worker.postMessage({ port: workerPort, shared, args }, [workerPort]);
      Atomics.wait(int32, 0, 0);
      /** @type {{ message: { result?: any, error?: any } } | undefined } */
      const m = receiveMessageOnPort(localPort);
      if (m === undefined) {
        throw new Error(`Can not get async response.`);
      }

      const { message } = m;
      if ('result' in message) {
        return message.result;
      }
      throw message.error;

    } finally {
      activeCount--;
      if (activeCount === 0) {
        worker.unref();
      }
    }
  };
}