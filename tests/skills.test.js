const request = require('supertest');
const app = require('../src/app');
require('./setup');

describe('Skills & User Skill Management Endpoints', () => {
  let token;

  beforeEach(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Skill Tester',
      email: 'skilltester@campus.edu',
      password: 'Password123!',
      department: 'Engineering',
      year: '2nd Year'
    });
    token = res.body.data.token;
  });

  it('should add a skill to teach with automatic normalization (JS -> JavaScript)', async () => {
    const res = await request(app)
      .post('/api/users/me/skills/teach')
      .set('Authorization', `Bearer ${token}`)
      .send({
        skillName: 'JS',
        skillLevel: 'Advanced',
        experience: '2 years'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skillsToTeach[0].skill.name).toBe('JavaScript');
  });

  it('should add a skill to learn with desired level', async () => {
    const res = await request(app)
      .post('/api/users/me/skills/learn')
      .set('Authorization', `Bearer ${token}`)
      .send({
        skillName: 'ReactJS',
        desiredLevel: 'Beginner',
        priority: 'High'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.skillsToLearn[0].skill.name).toBe('React');
  });
});
