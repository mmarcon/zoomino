const noop = () => {};
const noopLogger = { info: noop, error: noop, debug: noop };

export { noopLogger };
