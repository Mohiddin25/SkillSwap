const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Session Management & Completion Flow', () => {
  let tokenA, tokenB, userAId, userBId, requestId, skillId;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Session Teacher',
      email: 'teacher@campus.edu',
      password: 'Password123!',
      department: 'CS',
      year: '4th Year'
    });
    tokenA = resA.body.data.token;
    userAId = resA.body.data.user._id;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'Session Learner',
      email: 'learner@campus.edu',
      password: 'Password123!',
      department: 'CS',
      year: '1st Year'
    });
    tokenB = resB.body.data.token;
    userBId = resB.body.data.user._id;

    // Add teach skill
    const skillRes = await request(app)
      .post('/api/users/me/skills/teach')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ skillName: 'Python', skillLevel: 'Expert' });

    skillId = skillRes.body.data.skillsToTeach[0].skill._id;

    // Send and accept request
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ receiverId: userAId });

    requestId = reqRes.body.data._id;

    await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${tokenA}`);
  });

  it('should create and complete a session, awarding Skill Credits', async () => {
    const startTime = new Date();
    const endTime = new Date(Date.now() + 3600000); // 1 hour later

    const sessionRes = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        swapRequestId: requestId,
        teacherId: userAId,
        learnerId: userBId,
        skillId,
        scheduledStart: startTime,
        scheduledEnd: endTime
      });

    expect(sessionRes.statusCode).toBe(201);
    const sessionId = sessionRes.body.data._id;

    // Complete Session
    const completeRes = await request(app)
      .patch(`/api/sessions/${sessionId}/complete`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(completeRes.statusCode).toBe(200);
    expect(completeRes.body.data.session.status).toBe('completed');
    expect(completeRes.body.data.creditEarned).toBeGreaterThanOrEqual(1);

    // Verify teacher credit balance increased
    const balRes = await request(app)
      .get('/api/credits/balance')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(balRes.statusCode).toBe(200);
    expect(balRes.body.data.balance).toBeGreaterThan(5); // Started with 5 welcome credits
  });
});
