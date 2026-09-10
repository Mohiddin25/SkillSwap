const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Authentication API Endpoints & Cookie Storage', () => {
  const testUser = {
    name: 'Test Student',
    email: 'teststudent@campus.edu',
    password: 'Password123!',
    department: 'Computer Science',
    year: '3rd Year',
    campus: 'Main Campus'
  };

  it('should register a new student user and set HTTP-Only token cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });

  it('should login an existing user and set HTTP-Only token cookie', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.headers['set-cookie']).toBeDefined();
    expect(res.headers['set-cookie'][0]).toContain('token=');
  });

  it('should authenticate protected routes using Cookie storage', async () => {
    const loginRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const cookies = loginRes.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', cookies);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe(testUser.email);
  });

  it('should authenticate protected routes using Authorization Bearer header', async () => {
    const regRes = await request(app).post('/api/auth/register').send(testUser);
    const token = regRes.body.data.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.statusCode).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.email).toBe(testUser.email);
  });

  it('should clear token cookie on logout', async () => {
    const loginRes = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookies);

    expect(logoutRes.statusCode).toBe(200);
    expect(logoutRes.headers['set-cookie'][0]).toContain('token=none');
  });
});
