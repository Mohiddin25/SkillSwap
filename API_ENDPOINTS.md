# Skill Swap API Endpoints

Base URL: `http://localhost:5000/api`

Unless marked **Public**, endpoints require:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

All responses use this shape:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {}
}
```

## Authentication

### Register

`POST /auth/register` - Public

```json
{
  "name": "Aisha Khan",
  "email": "aisha@college.edu",
  "password": "StrongPassword123!",
  "department": "Computer Science",
  "year": 2,
  "campus": "North Campus",
  "bio": "I enjoy teaching programming and learning design."
}
```

### Login

`POST /auth/login` - Public

```json
{
  "email": "aisha@college.edu",
  "password": "StrongPassword123!"
}
```

### Current authenticated user

`GET /auth/me` - Protected

### Logout

`POST /auth/logout` - Protected

No request body is required. With stateless JWTs, the client removes the token after this request.

## Users and Profiles

### Get my profile

`GET /users/me` - Protected

### Update my profile

`PUT /users/me` - Protected

```json
{
  "name": "Aisha Khan",
  "department": "Computer Science",
  "year": 3,
  "campus": "North Campus",
  "bio": "Python mentor and UI/UX learner.",
  "profileImage": "https://example.com/profiles/aisha.jpg"
}
```

### Get public profile

`GET /users/:id` - Protected

### Block a user

`POST /users/:id/block` - Protected

No request body is required.

### Unblock a user

`DELETE /users/:id/block` - Protected

### Add a teaching skill

`POST /users/me/skills/teach` - Protected

```json
{
  "skillId": "665f1e2a9f1a2c0012345678",
  "level": "Advanced",
  "experience": "3 years of Python projects and tutoring",
  "description": "Can help with Python fundamentals, APIs, and testing.",
  "verificationStatus": "self-declared"
}
```

Allowed levels: `Beginner`, `Intermediate`, `Advanced`, `Expert`.

### Remove a teaching skill

`DELETE /users/me/skills/teach/:skillId` - Protected

### Add a learning skill

`POST /users/me/skills/learn` - Protected

```json
{
  "skillId": "665f1e2a9f1a2c0098765432",
  "desiredLevel": "Intermediate",
  "priority": "high"
}
```

Allowed priorities: `low`, `medium`, `high`.

### Remove a learning skill

`DELETE /users/me/skills/learn/:skillId` - Protected

## Skills

### List skills

`GET /skills` - Public

Optional query parameters: `category`, `search`, `page`, `limit`.

Example: `/skills?search=javascript&category=Programming&page=1&limit=20`

### Get one skill

`GET /skills/:id` - Public

### Create a skill

`POST /skills` - Admin

```json
{
  "name": "Java Script",
  "category": "Programming",
  "description": "Browser and server-side JavaScript development"
}
```

The API stores a normalized name, so aliases such as `JS`, `Javascript`, and `Java Script` resolve to `JavaScript`.

### Update a skill

`PUT /skills/:id` - Admin

```json
{
  "name": "JavaScript",
  "category": "Programming",
  "description": "Updated skill description",
  "isActive": true
}
```

### Delete/deactivate a skill

`DELETE /skills/:id` - Admin

## Availability

### Get my availability

`GET /availability/me` - Protected

### Create an availability slot

`POST /availability` - Protected

```json
{
  "dayOfWeek": "Saturday",
  "startTime": "16:00",
  "endTime": "18:00",
  "timezone": "America/New_York"
}
```

The API rejects invalid days, `startTime >= endTime`, and overlapping slots for the same user.

### Update an availability slot

`PUT /availability/:id` - Protected

```json
{
  "dayOfWeek": "Saturday",
  "startTime": "17:00",
  "endTime": "19:00",
  "timezone": "America/New_York"
}
```

### Delete an availability slot

`DELETE /availability/:id` - Protected

## Matching

### Find compatible students

`GET /matches` - Protected

Optional query parameters:

- `page=1`
- `limit=10`
- `minScore=70`
- `skill=Python`
- `department=Computer Science`
- `year=2`
- `skillLevel=Advanced`
- `campus=North Campus`
- `availabilityDay=Saturday`

Example: `/matches?page=1&limit=10&skill=Python&minScore=70`

Example match item:

```json
{
  "user": {
    "id": "665f1e2a9f1a2c0012345678",
    "name": "Daniel Lee",
    "department": "Design",
    "campus": "North Campus",
    "rating": 4.8
  },
  "matchScore": 95,
  "skillScore": 50,
  "availabilityScore": 25,
  "levelScore": 15,
  "locationScore": 5,
  "matchedSkills": [
    {
      "skill": "Python",
      "iCanLearn": true,
      "theyCanTeach": true
    },
    {
      "skill": "UI/UX",
      "iCanTeach": true,
      "theyCanLearn": true
    }
  ],
  "commonAvailability": [
    {
      "dayOfWeek": "Saturday",
      "startTime": "16:00",
      "endTime": "17:00",
      "durationMinutes": 60
    }
  ]
}
```

Default score weights are skill compatibility `50%`, availability overlap `25%`, skill level `15%`, and location `10%`.

## Swap Requests

### Send a swap request

`POST /requests` - Protected

```json
{
  "receiverId": "665f1e2a9f1a2c0098765432",
  "skillsOffered": ["665f1e2a9f1a2c0012345678"],
  "skillsRequested": ["665f1e2a9f1a2c0098765432"],
  "matchScore": 95,
  "message": "I can help with Python if you can help me with UI/UX.",
  "proposedTimeSlots": [
    {
      "dayOfWeek": "Saturday",
      "startTime": "16:00",
      "endTime": "17:00",
      "timezone": "America/New_York"
    }
  ]
}
```

### Sent requests

`GET /requests/sent` - Protected

### Received requests

`GET /requests/received` - Protected

### Get one request

`GET /requests/:id` - Protected

### Accept a request

`PATCH /requests/:id/accept` - Protected

```json
{
  "message": "That time works for me."
}
```

### Reject a request

`PATCH /requests/:id/reject` - Protected

```json
{
  "reason": "My schedule changed."
}
```

### Cancel a request

`PATCH /requests/:id/cancel` - Protected

No request body is required.

## Sessions

### Create a session

`POST /sessions` - Protected; accepted request participants only

```json
{
  "swapRequestId": "665f1e2a9f1a2c0011223344",
  "teacherId": "665f1e2a9f1a2c0012345678",
  "learnerId": "665f1e2a9f1a2c0098765432",
  "skillId": "665f1e2a9f1a2c0012345678",
  "scheduledStart": "2026-10-03T16:00:00.000Z",
  "scheduledEnd": "2026-10-03T17:00:00.000Z",
  "location": "North Campus Library, Room 204",
  "meetingLink": "https://meet.example.com/skillswap-python",
  "notes": "Bring questions about Python testing."
}
```

### List my sessions

`GET /sessions/me` - Protected

Optional query parameters: `status`, `from`, `to`, `page`, `limit`.

### Get one session

`GET /sessions/:id` - Protected; participants only

### Complete a session

`PATCH /sessions/:id/complete` - Protected; participants only

```json
{
  "notes": "Covered pytest fixtures and API testing."
}
```

### Cancel a session

`PATCH /sessions/:id/cancel` - Protected; participants only

```json
{
  "reason": "Unable to attend due to illness."
}
```

## Skill Credits

Credits are contribution points, not money. Users cannot directly modify their balance.

### Get credit balance

`GET /credits/balance` - Protected

### Get credit history

`GET /credits/history` - Protected

Optional query parameters: `type`, `page`, `limit`.

Example transaction:

```json
{
  "amount": 1,
  "type": "earned",
  "reason": "Completed a 30-minute teaching session",
  "session": "665f1e2a9f1a2c0011223344",
  "balanceAfter": 8
}
```

Transaction types: `earned`, `spent`, `bonus`, `refund`, `penalty`.

## Ratings and Reputation

### Rate a completed session participant

`POST /ratings` - Protected

```json
{
  "sessionId": "665f1e2a9f1a2c0011223344",
  "ratedUserId": "665f1e2a9f1a2c0098765432",
  "score": 5,
  "feedback": "Clear explanations and very helpful examples.",
  "communication": 5,
  "teachingQuality": 5,
  "punctuality": 4
}
```

### Get a user's ratings

`GET /users/:id/ratings` - Public

## Badges

### List available badges

`GET /badges` - Public

### Get my earned badges

`GET /users/me/badges` - Protected

## Analytics

### Get trending and high-demand skills

`GET /analytics/trending-skills` - Protected

Optional query parameters: `campus`, `department`, `limit`.

Example response item:

```json
{
  "skill": "React",
  "learners": 120,
  "teachers": 35,
  "unmetDemand": 85,
  "successfulSessions": 42,
  "demandScore": 85
}
```

## Notifications

### List my notifications

`GET /notifications` - Protected

Optional query parameters: `unreadOnly`, `page`, `limit`.

### Mark one notification as read

`PATCH /notifications/:id/read` - Protected

No request body is required.

### Mark all notifications as read

`PATCH /notifications/read-all` - Protected

No request body is required.

## Chat

Chat is available only between participants of an accepted request.

### List conversations

`GET /chat/conversations` - Protected

### List conversation messages

`GET /chat/conversations/:id/messages` - Protected; participants only

Optional query parameters: `page`, `limit`, `before`.

### Send a message

`POST /chat/conversations/:id/messages` - Protected; participants only

```json
{
  "text": "Are we still on for Saturday at 4 PM?"
}
```

Socket.io events:

- Client emits `message:send`; server emits `message:receive`.
- Client emits `message:read` to mark messages read.
- Client emits `typing:start` and `typing:stop`.

## Reports and Trust & Safety

### Report a user

`POST /reports` - Protected

```json
{
  "reportedUserId": "665f1e2a9f1a2c0098765432",
  "reason": "harassment",
  "description": "The user sent repeated unwanted messages."
}
```

Allowed reasons: `inappropriate behavior`, `fake skill`, `harassment`, `spam`, `other`.

## Admin

All admin endpoints require a JWT belonging to a user with role `admin`.

### List users

`GET /admin/users` - Admin

Optional query parameters: `search`, `department`, `campus`, `isActive`, `page`, `limit`.

### List reports

`GET /admin/reports` - Admin

Optional query parameters: `status`, `reason`, `page`, `limit`.

### Update a report

`PATCH /admin/reports/:id` - Admin

```json
{
  "status": "resolved",
  "adminNotes": "Reviewed messages and contacted both users."
}
```

### Suspend or restore a user

`PATCH /admin/users/:id/suspend` - Admin

```json
{
  "isActive": false,
  "reason": "Repeated spam reports"
}
```

### Verify a user

`PATCH /admin/users/:id/verify` - Admin

```json
{
  "isVerified": true
}
```

### Verify a user's skill

`PATCH /admin/users/:userId/skills/:skillId/verify` - Admin

```json
{
  "verificationStatus": "verified",
  "evidenceNotes": "Reviewed portfolio and faculty confirmation."
}
```

### Platform analytics

`GET /admin/analytics` - Admin

## Dashboard

### Get dashboard data

`GET /dashboard` - Protected

Example response data:

```json
{
  "userSummary": {
    "name": "Aisha Khan",
    "rating": 4.7,
    "skillCredits": 8,
    "contributorLevel": 3
  },
  "newMatches": 5,
  "pendingRequests": 2,
  "upcomingSessions": [],
  "trendingSkills": [],
  "recentNotifications": [],
  "earnedBadges": []
}
```

## Search

### Search students and skills

`GET /search` - Protected

Query parameters:

- `q=python` - name or skill text
- `department=Computer Science`
- `campus=North Campus`
- `page=1`
- `limit=20`

Example: `/search?q=python&campus=North%20Campus&page=1&limit=20`

Private fields such as password hashes, private notifications, and private conversations are never returned.

## Common Errors

### Validation error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Enter a valid college email address"
    }
  ]
}
```

### Unauthorized request

```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Duplicate active request

```json
{
  "success": false,
  "message": "An active request already exists between these users"
}
```

## Swagger Documentation

When the server is running, interactive OpenAPI documentation is available at:

`http://localhost:5000/api-docs`
