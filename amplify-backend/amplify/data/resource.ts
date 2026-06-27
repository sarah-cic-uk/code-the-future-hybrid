import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

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
      schoolPrefix: a.string(),
      progress: a.json(),
      profile: a.json(),
    })
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
