const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

beforeAll(async () => {
  let mongoUri;
  try {
    if (!global.__MONGOINSTANCE__) {
      global.__MONGOINSTANCE__ = await MongoMemoryServer.create();
    }
    mongoUri = global.__MONGOINSTANCE__.getUri();
  } catch (err) {
    console.warn('MongoMemoryServer startup failed, falling back to local test database connection:', err.message);
    mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://127.0.0.1:27017/skillswap_test';
  }

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri);
  }
}, 180000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (global.__MONGOINSTANCE__) {
    try {
      await global.__MONGOINSTANCE__.stop();
    } catch (e) {
      // ignore cleanup error
    }
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});
