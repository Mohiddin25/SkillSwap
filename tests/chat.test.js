const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Chat System Endpoints', () => {
  let tokenA, tokenB, userAId, userBId, conversationId;

  beforeEach(async () => {
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Chat Student A',
      email: 'chata@campus.edu',
      password: 'Password123!',
      department: 'CS',
      year: '3rd Year'
    });
    tokenA = resA.body.data.token;
    userAId = resA.body.data.user._id;

    const resB = await request(app).post('/api/auth/register').send({
      name: 'Chat Student B',
      email: 'chatb@campus.edu',
      password: 'Password123!',
      department: 'EE',
      year: '4th Year'
    });
    tokenB = resB.body.data.token;
    userBId = resB.body.data.user._id;

    // Send swap request and accept it to create a conversation automatically
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ receiverId: userBId, message: 'Let us chat!' });

    const requestId = reqRes.body.data._id;

    await request(app)
      .patch(`/api/requests/${requestId}/accept`)
      .set('Authorization', `Bearer ${tokenB}`);

    const convsRes = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenA}`);

    conversationId = convsRes.body.data[0]._id;
  });


  it('should fetch conversations for participant', async () => {
    const res = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should send a message and retrieve message history', async () => {
    const sendRes = await request(app)
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text: 'Hello from student A!' });

    expect(sendRes.statusCode).toBe(201);
    expect(sendRes.body.data.text).toBe('Hello from student A!');

    const getRes = await request(app)
      .get(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.data.length).toBe(1);
    expect(getRes.body.data[0].text).toBe('Hello from student A!');
  });

  it('should allow user to delete individual message', async () => {
    const sendRes = await request(app)
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text: 'Message to delete' });

    const messageId = sendRes.body.data._id;

    const delRes = await request(app)
      .delete(`/api/chat/conversations/${conversationId}/messages/${messageId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(delRes.statusCode).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(getRes.body.data.length).toBe(0);
  });

  it('should allow user to delete entire conversation and its messages', async () => {
    await request(app)
      .post(`/api/chat/conversations/${conversationId}/messages`)
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ text: 'Message in doomed conv' });

    const delConvRes = await request(app)
      .delete(`/api/chat/conversations/${conversationId}`)
      .set('Authorization', `Bearer ${tokenA}`);

    expect(delConvRes.statusCode).toBe(200);
    expect(delConvRes.body.success).toBe(true);

    const getConvRes = await request(app)
      .get('/api/chat/conversations')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(getConvRes.body.data.some(c => c._id === conversationId)).toBe(false);
  });
});
