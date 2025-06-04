const request = require('supertest');
process.env.NODE_ENV = 'test';

// Mock database connection
jest.mock('../config/db', () => jest.fn());

// Prepare mock user model
const mockUser = {
  _id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  getSignedJwtToken: jest.fn(() => 'testtoken'),
  matchPassword: jest.fn(() => true),
  _doc: {
    _id: '1',
    username: 'testuser',
    email: 'test@example.com',
    role: 'user'
  }
};

jest.mock('../models/User', () => ({
  create: jest.fn().mockResolvedValue(mockUser),
  findOne: jest.fn().mockReturnValue({
    select: () => Promise.resolve(mockUser)
  })
}));

const app = require('../server');

describe('Auth API', () => {
  it('registers a user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', email: 'test@example.com', password: 'pass' });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe('testtoken');
  });

  it('logs in a user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'pass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe('testtoken');
  });
});
