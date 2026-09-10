const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Ratings & Reputation System', () => {
  let tokenA, tokenB, userAId, userBId, sessionId;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Rater Student A',
      email: 'raterA@campus.edu',
      password: 'Password123!',
      department: 'EE',
      year: '2nd Year'
    });
    tokenA = resA.body.data.token;
    userAId = resA.body.data.user._id;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'Rater Student B',
      email: 'raterB@campus.edu',
      password: 'Password123!',
      department: 'EE',
      year: '3rd Year'
    });
    tokenB = resB.body.data.token;
    userBId = resB.body.data.user._id;

    const skillRes = await request(app)
      .post('/api/users/me/skills/teach')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ skillName: 'Java', skillLevel: 'Intermediate' });

    const skillId = skillRes.body.data.skillsToTeach[0].skill._id;

    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ receiverId: userAId });

    await request(app)
      .patch(`/api/requests/${reqRes.body.data._id}/accept`)
      .set('Authorization', `Bearer ${tokenA}`);

    const sessRes = await request(app)
      .post('/api/sessions')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        swapRequestId: reqRes.body.data._id,
        teacherId: userAId,
        learnerId: userBId,
        skillId,
        scheduledStart: new Date(),
        scheduledEnd: new Date(Date.now() + 3600000)
      });

    sessionId = sessRes.body.data._id;

    // Complete session
    await request(app)
      .patch(`/api/sessions/${sessionId}/complete`)
      .set('Authorization', `Bearer ${tokenA}`);
  });

  it('should allow participant to submit rating for completed session', async () => {
    const ratingRes = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        sessionId,
        score: 5,
        feedback: 'Great session!',
        communication: 5,
        teachingQuality: 5,
        punctuality: 5
      });

    expect(ratingRes.statusCode).toBe(201);
    expect(ratingRes.body.success).toBe(true);

    // Prevent duplicate rating
    const dupRes = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({
        sessionId,
        score: 4
      });

    expect(dupRes.statusCode).toBe(409);
  });
});
