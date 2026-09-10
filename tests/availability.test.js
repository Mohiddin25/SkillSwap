const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Availability Slot API Endpoints', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Avail Student',
      email: 'avail@campus.edu',
      password: 'Password123!',
      department: 'Math',
      year: '1st Year'
    });
    token = res.body.data.token;
  });

  it('should create a valid availability slot', async () => {
    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dayOfWeek: 'Saturday',
        startTime: '16:00',
        endTime: '18:00'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.dayOfWeek).toBe('Saturday');
  });

  it('should reject slot where startTime >= endTime', async () => {
    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({
        dayOfWeek: 'Saturday',
        startTime: '18:00',
        endTime: '16:00'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject overlapping slot on the same day for same user', async () => {
    await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ dayOfWeek: 'Saturday', startTime: '16:00', endTime: '18:00' });

    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${token}`)
      .send({ dayOfWeek: 'Saturday', startTime: '17:00', endTime: '19:00' });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });
});
