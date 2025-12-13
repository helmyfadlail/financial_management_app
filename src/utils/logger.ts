/* eslint-disable  @typescript-eslint/no-explicit-any */

const originalLog = console.log;

console.log = (...args: any[]) => {
  const time = new Date().toISOString();
  originalLog(`[${time}]`, ...args);
};
