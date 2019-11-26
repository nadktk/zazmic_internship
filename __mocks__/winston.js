const winston = {
  format: {
    combine: jest.fn(),
    timestamp: jest.fn(),
    printf: jest.fn(),
    colorize: jest.fn(),
  },
  transports: jest.fn(),
  createLogger: jest.fn(() => ({
    end: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  })),
  addColors: jest.fn(),
};

winston.transports.Console = jest.fn();
winston.transports.MongoDB = jest.fn();

module.exports = winston;
