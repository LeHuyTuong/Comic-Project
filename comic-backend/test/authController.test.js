const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

let createdData;
const mockUser = {
  create: async data => {
    createdData = data;
    return { ...data, _doc: data, getSignedJwtToken: () => 'token' };
  }
};

// Replace the real User model with the mock
const userPath = path.join(__dirname, '..', 'models', 'User.js');
const resolved = require.resolve(userPath);
const originalUserModule = require.cache[resolved];
require.cache[resolved] = { id: resolved, filename: resolved, loaded: true, exports: mockUser };

const { register } = require('../controllers/authController');

test('register defaults to user role when role is arbitrary', async () => {
  const req = { body: { username: 'bob', email: 'bob@example.com', password: 'pass', role: 'admin' } };
  const res = { status(code){ this.statusCode = code; return this; }, json(data){ this.data = data; return this; } };
  await register(req, res);
  assert.strictEqual(createdData.role, 'user');
  assert.strictEqual(res.statusCode, 201);
  assert.ok(res.data.success);
});

// Restore original module
require.cache[resolved] = originalUserModule;
