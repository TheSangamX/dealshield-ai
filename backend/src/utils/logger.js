const write = (level, message, meta) => {
  const line = `${new Date().toISOString()} ${level.toUpperCase()} ${message}`;
  const out = level === 'error' ? console.error : console.log;
  meta === undefined ? out(line) : out(line, meta);
};

export const logger = {
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
};
