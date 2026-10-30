export type SchedulerPort = (callback: () => void, delayMs: number) => () => void;

/** Schedules a callback with a delay, returning a cancel function. */
export const defaultScheduler: SchedulerPort = (
  callback: () => void,
  delayMs: number,
): (() => void) => {
  const timer = setTimeout(callback, delayMs);
  return () => {
    clearTimeout(timer);
  };
};
