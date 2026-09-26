import { createSerialQueue } from '../queue';

describe('createSerialQueue', () => {
  it('runs tasks one at a time, in order', async () => {
    const queue = createSerialQueue();
    const events: string[] = [];
    const task = (name: string) => async () => {
      events.push(`${name}:start`);
      await Promise.resolve();
      events.push(`${name}:end`);
      return name;
    };

    const results = await Promise.all([queue.run(task('a')), queue.run(task('b'))]);

    expect(results).toEqual(['a', 'b']);
    expect(events).toEqual(['a:start', 'a:end', 'b:start', 'b:end']);
  });

  it('keeps processing after a task fails', async () => {
    const queue = createSerialQueue();

    const failing = queue.run(() => Promise.reject(new Error('boom')));
    const next = queue.run(() => Promise.resolve('ok'));

    await expect(failing).rejects.toThrow('boom');
    await expect(next).resolves.toBe('ok');
  });
});
