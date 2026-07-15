import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { notifyAdmin } from '../functions/notify-admin/resource';
import { bookingEmail } from '../functions/booking-email/resource';
import { feedbackEmail } from '../functions/feedback-email/resource';

/**
 * Define your data schema
 * @see https://docs.amplify.aws/gen2/build-a-backend/data
 */
const schema = a.schema({
  User: a
    .model({
      email: a.string().required(),
      displayName: a.string().required(),
      cohortId: a.string(),
      isTeacher: a.boolean(),
      isTutor: a.boolean(),
      isAdmin: a.boolean(),
      schoolPrefix: a.string(),
      progress: a.json(),
      profile: a.json(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  InterestRegistration: a
    .model({
      name: a.string().required(),
      email: a.string().required(),
      status: a.string(),
      registeredAt: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // Emails the site admin (via SES) when someone registers interest.
  notifyInterest: a
    .mutation()
    .arguments({
      name: a.string().required(),
      email: a.string().required(),
    })
    .returns(a.string())
    .handler(a.handler.function(notifyAdmin))
    .authorization((allow) => [allow.publicApiKey()]),

  // Emails tutor/student (via SES) for session events:
  // type = booked | cancelledBooked | cancelledRequest | requested
  sendBookingEmail: a
    .mutation()
    .arguments({
      type: a.string(),
      tutorEmail: a.string().required(),
      tutorName: a.string(),
      studentEmail: a.string().required(),
      studentName: a.string(),
      date: a.string(),
      time: a.string(),
      duration: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(bookingEmail))
    .authorization((allow) => [allow.publicApiKey()]),

  // Emails the team (via SES) when a student submits feedback.
  sendFeedback: a
    .mutation()
    .arguments({
      category: a.string(),
      lesson: a.string(),
      message: a.string().required(),
      userName: a.string(),
      userEmail: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(feedbackEmail))
    .authorization((allow) => [allow.publicApiKey()]),

  Cohort: a
    .model({
      cohortCode: a.string().required(),
      name: a.string().required(),
      teacherId: a.string(),
      teacherName: a.string(),
      sessionReleaseDates: a.json(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  TutorAvailability: a
    .model({
      tutorId: a.string().required(),
      slotId: a.string().required(),
      date: a.string().required(),
      time: a.string().required(),
      duration: a.string(),
      status: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  BookedSession: a
    .model({
      sessionId: a.string().required(),
      tutorId: a.string().required(),
      studentEmail: a.string().required(),
      studentName: a.string(),
      date: a.string().required(),
      time: a.string().required(),
      duration: a.string(),
      status: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  SessionRequest: a
    .model({
      requestId: a.string().required(),
      tutorId: a.string().required(),
      studentEmail: a.string().required(),
      studentName: a.string(),
      date: a.string().required(),
      time: a.string().required(),
      duration: a.string(),
      status: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  ForumPost: a
    .model({
      section: a.string().required(),
      title: a.string().required(),
      body: a.string().required(),
      authorName: a.string(),
      authorEmail: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  ForumAnswer: a
    .model({
      postId: a.string().required(),
      body: a.string().required(),
      authorName: a.string(),
      authorEmail: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 365,
    },
  },
});

// Made with Bob
