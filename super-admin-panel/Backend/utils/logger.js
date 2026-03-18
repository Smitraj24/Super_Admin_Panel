const logger = {
  info: (message) => {
    console.log(`INFO: ${message}`);
  },

  error: (message) => {
    console.error(`ERROR: ${message}`);
  },

  warn: (message) => {
    console.warn(`WARNING: ${message}`);
  },
};

export default logger;
