const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Availability = require('../models/Availability');
const SwapRequest = require('../models/SwapRequest');
const Session = require('../models/Session');
const Rating = require('../models/Rating');
const SkillCredit = require('../models/SkillCredit');
const Badge = require('../models/Badge');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Report = require('../models/Report');
const { normalizeSkillName } = require('../utils/skillNormalizer');
const { ensureDefaultBadgesExist } = require('../services/badgeService');

const SKILLS_DATA = [
  { name: 'Python', category: 'Programming', description: 'Data structures, scripting, web apps' },
  { name: 'JavaScript', category: 'Programming', description: 'Web development, ES6+, async JS' },
  { name: 'React', category: 'Programming', description: 'UI components, state management, hooks' },
  { name: 'Node.js', category: 'Programming', description: 'Backend servers, REST APIs, Express' },
  { name: 'Java', category: 'Programming', description: 'OOP, data structures, Android' },
  { name: 'C++', category: 'Programming', description: 'Competitive programming, pointers' },
  { name: 'UI/UX', category: 'Design', description: 'User interface & experience design' },
  { name: 'Figma', category: 'Design', description: 'Wireframing, prototyping, design systems' },
  { name: 'Graphic Design', category: 'Design', description: 'Photoshop, Illustrator, branding' },
  { name: 'Video Editing', category: 'Design', description: 'Premiere Pro, DaVinci Resolve' },
  { name: 'Data Analysis', category: 'Data', description: 'Pandas, NumPy, statistical modeling' },
  { name: 'Excel', category: 'Data', description: 'VLOOKUP, Pivot tables, financial modeling' },
  { name: 'Power BI', category: 'Data', description: 'Dashboards, DAX, data visualization' },
  { name: 'Tableau', category: 'Data', description: 'Business intelligence dashboards' },
  { name: 'Public Speaking', category: 'Communication', description: 'Stage presence, speech delivery' },
  { name: 'English Communication', category: 'Communication', description: 'Professional spoken & written English' },
  { name: 'Presentation Skills', category: 'Communication', description: 'Slide design, storytelling' }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB for seeding...');
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Availability.deleteMany({});
    await SwapRequest.deleteMany({});
    await Session.deleteMany({});
    await Rating.deleteMany({});
    await SkillCredit.deleteMany({});
    await Badge.deleteMany({});
    await Notification.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});
    await Report.deleteMany({});

    console.log('Seeding default badges...');
    await ensureDefaultBadgesExist();
    const badges = await Badge.find({});
    const badgeMap = new Map(badges.map((b) => [b.name, b._id]));

    console.log('Seeding skills...');
    const createdSkills = [];
    for (const s of SKILLS_DATA) {
      const normalized = normalizeSkillName(s.name);
      const doc = await Skill.create({
        name: normalized,
        normalizedName: normalized.toLowerCase(),
        category: s.category,
        description: s.description,
        popularity: Math.floor(Math.random() * 50) + 10
      });
      createdSkills.push(doc);
    }

    const skillMap = new Map(createdSkills.map((s) => [s.name, s._id]));

    console.log('Seeding users (including Section 37 Student A & Student B)...');
    const commonPasswordHash = await bcrypt.hash('Password123!', 10);
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);

    // Create Admin User
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@campus.edu',
      passwordHash: adminPasswordHash,
      department: 'Administration',
      year: 'Faculty',
      campus: 'Main Campus',
      role: 'admin',
      isVerified: true
    });

    // Create Student A (Python teacher, UI/UX learner)
    const studentA = await User.create({
      name: 'Student A (Alex)',
      email: 'studenta@campus.edu',
      passwordHash: commonPasswordHash,
      department: 'Computer Science',
      year: '3rd Year',
      campus: 'Main Campus',
      bio: 'Passionate Python developer looking to learn UI/UX design.',
      skillCredits: 8,
      rating: 4.8,
      totalRatings: 4,
      sessionsCompleted: 4,
      teachingSessionsCompleted: 3,
      learningSessionsCompleted: 1,
      skillsToTeach: [{
        skill: skillMap.get('Python'),
        skillLevel: 'Advanced',
        experience: '2 years building web scrapers and scripts',
        description: 'Happy to help beginners get started with Python fundamentals'
      }],
      skillsToLearn: [{
        skill: skillMap.get('UI/UX'),
        desiredLevel: 'Beginner',
        priority: 'High'
      }],
      badges: [badgeMap.get('First Session'), badgeMap.get('Helpful Mentor')]
    });

    // Create Student B (UI/UX teacher, Python learner)
    const studentB = await User.create({
      name: 'Student B (Bianca)',
      email: 'studentb@campus.edu',
      passwordHash: commonPasswordHash,
      department: 'Design',
      year: '2nd Year',
      campus: 'Main Campus',
      bio: 'UI/UX enthusiast wanting to learn Python for backend integration.',
      skillCredits: 10,
      rating: 4.9,
      totalRatings: 5,
      sessionsCompleted: 5,
      teachingSessionsCompleted: 4,
      learningSessionsCompleted: 1,
      skillsToTeach: [{
        skill: skillMap.get('UI/UX'),
        skillLevel: 'Advanced',
        experience: 'Designed 3 mobile apps in Figma',
        description: 'Can teach wireframing, color theory, and Figma components'
      }],
      skillsToLearn: [{
        skill: skillMap.get('Python'),
        desiredLevel: 'Beginner',
        priority: 'High'
      }],
      badges: [badgeMap.get('First Session'), badgeMap.get('Helpful Mentor'), badgeMap.get('5 Sessions Completed')]
    });

    // Seed Availability for Student A (Saturday 16:00 - 18:00)
    await Availability.create({
      userId: studentA._id,
      dayOfWeek: 'Saturday',
      startTime: '16:00',
      endTime: '18:00'
    });

    // Seed Availability for Student B (Saturday 16:00 - 17:00)
    await Availability.create({
      userId: studentB._id,
      dayOfWeek: 'Saturday',
      startTime: '16:00',
      endTime: '17:00'
    });

    // Generate 23 additional realistic student profiles
    const departments = ['Computer Science', 'Electrical Engineering', 'Business', 'Graphic Design', 'Data Science', 'Mechanical Engineering'];
    const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    const campuses = ['Main Campus', 'Main Campus', 'North Campus', 'South Campus'];

    const additionalStudents = [];
    for (let i = 1; i <= 23; i++) {
      const dept = departments[i % departments.length];
      const yr = years[i % years.length];
      const camp = campuses[i % campuses.length];

      const tSkill1 = createdSkills[i % createdSkills.length];
      const lSkill1 = createdSkills[(i + 5) % createdSkills.length];

      const s = await User.create({
        name: `Student Demo ${i}`,
        email: `student${i}@campus.edu`,
        passwordHash: commonPasswordHash,
        department: dept,
        year: yr,
        campus: camp,
        bio: `Hi, I study ${dept} and love sharing knowledge!`,
        skillCredits: Math.floor(Math.random() * 10) + 3,
        rating: parseFloat((4.0 + Math.random() * 1.0).toFixed(1)),
        totalRatings: Math.floor(Math.random() * 8),
        sessionsCompleted: Math.floor(Math.random() * 6),
        teachingSessionsCompleted: Math.floor(Math.random() * 4),
        learningSessionsCompleted: Math.floor(Math.random() * 3),
        skillsToTeach: [{
          skill: tSkill1._id,
          skillLevel: ['Beginner', 'Intermediate', 'Advanced', 'Expert'][i % 4],
          experience: '1 year course experience'
        }],
        skillsToLearn: [{
          skill: lSkill1._id,
          desiredLevel: 'Beginner',
          priority: 'Medium'
        }],
        badges: [badgeMap.get('First Session')]
      });

      // Add availability for demo student
      await Availability.create({
        userId: s._id,
        dayOfWeek: ['Monday', 'Wednesday', 'Friday', 'Saturday'][i % 4],
        startTime: '15:00',
        endTime: '18:00'
      });

      additionalStudents.push(s);
    }

    // Seed Completed Swap Request & Session between Student A and Student B
    const swapReq = await SwapRequest.create({
      sender: studentA._id,
      receiver: studentB._id,
      skillsOffered: [skillMap.get('Python')],
      skillsRequested: [skillMap.get('UI/UX')],
      matchScore: 95,
      message: 'Hey Bianca! Let us swap Python for UI/UX this Saturday 4-5 PM.',
      proposedTimeSlots: [{ dayOfWeek: 'Saturday', startTime: '16:00', endTime: '17:00' }],
      status: 'completed'
    });

    const completedSession = await Session.create({
      swapRequestId: swapReq._id,
      teacher: studentA._id,
      learner: studentB._id,
      skill: skillMap.get('Python'),
      scheduledStart: new Date(Date.now() - 86400000), // Yesterday
      scheduledEnd: new Date(Date.now() - 86400000 + 3600000), // 1 hour duration
      location: 'Main Campus Library - Room 204',
      status: 'completed',
      notes: 'Covered Python variables, loops, and list comprehensions'
    });

    // Seed Credit Transaction
    await SkillCredit.create({
      user: studentA._id,
      amount: 2,
      type: 'earned',
      reason: 'Taught 1-hour Python session',
      session: completedSession._id,
      balanceAfter: 8
    });

    // Seed Rating
    await Rating.create({
      session: completedSession._id,
      rater: studentB._id,
      ratee: studentA._id,
      score: 5,
      feedback: 'Alex was an amazing tutor! Explained Python lists very clearly.',
      communication: 5,
      teachingQuality: 5,
      punctuality: 5
    });

    // Seed Notification
    await Notification.create({
      recipient: studentA._id,
      type: 'rating_received',
      title: 'New Session Review ⭐',
      message: 'Bianca rated your Python session 5/5 stars!',
      data: { sessionId: completedSession._id }
    });

    console.log('✅ Seed completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Student A: studenta@campus.edu / Password123!');
    console.log('Student B: studentb@campus.edu / Password123!');
    console.log('Admin:     admin@campus.edu    / AdminPassword123!');
    console.log('----------------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
