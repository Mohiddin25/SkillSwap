const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Swap Request System Endpoints', () => {
  let tokenA, tokenB, userBId;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Req Student A',
      email: 'reqa@campus.edu',
      password: 'Password123!',
      department: 'CS',
      year: '3rd Year'
    });
    tokenA = resA.body.data.token;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'Req Student B',
      email: 'reqb@campus.edu',
      password: 'Password123!',
      department: 'Design',
      year: '2nd Year'
    });
    tokenB = resB.body.data.token;
    userBId = resB.body.data.user._id;
  });

  it('should send a swap request and prevent active duplicate request', async () => {
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({
        receiverId: userBId,
        message: 'Let us swap skills!'
      });

    expect(reqRes.statusCode).toBe(201);
    expect(reqRes.body.success).toBe(true);
    expect(reqRes.body.data.status).toBe('pending');

    // Attempt duplicate request
    const dupRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ receiverId: userBId });

    expect(dupRes.statusCode).toBe(409);
  });

  it('should allow receiver to accept swap request and create session for both users without duplication', async () => {
    const sendRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ receiverId: userBId });

    const requestId = sendRes.body.data._id;

    const acceptRes = await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(acceptRes.statusCode).toBe(200);
    expect(acceptRes.body.data.request.status).toBe('accepted');
    expect(acceptRes.body.data.session).toBeDefined();

    // Verify session appears in Upcoming Sessions for User A (sender)
    const sessionsA = await request(app)
      .get('/api/sessions/me')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(sessionsA.statusCode).toBe(200);
    expect(sessionsA.body.data.length).toBe(1);
    expect(sessionsA.body.data[0].status).toBe('scheduled');

    // Verify session appears in Upcoming Sessions for User B (receiver)
    const sessionsB = await request(app)
      .get('/api/sessions/me')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(sessionsB.statusCode).toBe(200);
    expect(sessionsB.body.data.length).toBe(1);
    expect(sessionsB.body.data[0].status).toBe('scheduled');

    // Duplicate protection: Accepting again should not duplicate sessions
    await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${tokenB}`);

    const sessionsDupCheck = await request(app)
      .get('/api/sessions/me')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(sessionsDupCheck.body.data.length).toBe(1);
  });
});

