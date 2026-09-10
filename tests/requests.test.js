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

  it('should allow receiver to accept swap request', async () => {
    const sendRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ receiverId: userBId });

    const requestId = sendRes.body.data._id;

    const acceptRes = await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(acceptRes.statusCode).toBe(200);
    expect(acceptRes.body.data.status).toBe('accepted');
  });
});
