const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Smart Matching Engine - Section 37 Exact Example', () => {
  let tokenA;
  let tokenB;

  beforeEach(async () => {
    // 1. Register Student A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'Student A',
      email: 'studenta@campus.edu',
      password: 'Password123!',
      department: 'Computer Science',
      year: '3rd Year',
      campus: 'Main Campus'
    });
    tokenA = resA.body.data.token;

    // 2. Register Student B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'Student B',
      email: 'studentb@campus.edu',
      password: 'Password123!',
      department: 'Design',
      year: '2nd Year',
      campus: 'Main Campus'
    });
    tokenB = resB.body.data.token;

    // 3. Student A: Teach Python, Learn UI/UX
    await request(app)
      .post('/api/users/me/skills/teach')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ skillName: 'Python', skillLevel: 'Advanced' });

    await request(app)
      .post('/api/users/me/skills/learn')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ skillName: 'UI/UX', desiredLevel: 'Beginner' });

    // 4. Student A Availability: Saturday 4-6 PM (16:00-18:00)
    await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ dayOfWeek: 'Saturday', startTime: '16:00', endTime: '18:00' });

    // 5. Student B: Teach UI/UX, Learn Python
    await request(app)
      .post('/api/users/me/skills/teach')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ skillName: 'UI/UX', skillLevel: 'Advanced' });

    await request(app)
      .post('/api/users/me/skills/learn')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ skillName: 'Python', desiredLevel: 'Beginner' });

    // 6. Student B Availability: Saturday 4-5 PM (16:00-17:00)
    await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ dayOfWeek: 'Saturday', startTime: '16:00', endTime: '17:00' });
  });

  it('should calculate high match score and identify common Saturday 4-5 PM slot for Student A searching matches', async () => {
    const res = await request(app)
      .get('/api/matches')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMatches).toBeGreaterThanOrEqual(1);

    const match = res.body.data.matches[0];
    expect(match.candidate.email).toBe('studentb@campus.edu');
    expect(match.matchScore).toBeGreaterThanOrEqual(80); // High match score!

    // Verify common availability calculation
    expect(match.commonAvailability.length).toBe(1);
    expect(match.commonAvailability[0].dayOfWeek).toBe('Saturday');
    expect(match.commonAvailability[0].startTime).toBe('16:00');
    expect(match.commonAvailability[0].endTime).toBe('17:00');
  });
});
