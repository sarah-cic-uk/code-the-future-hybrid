#!/usr/bin/env node

/**
 * Promote a user to teacher
 *
 * Sets isTeacher=true and schoolPrefix on an existing User record, so they get
 * the "My Cohorts" dashboard scoped to all cohorts starting with that prefix.
 *
 * No dependencies — uses the GraphQL API + API key from public/amplify_outputs.json.
 * Requires the schoolPrefix field to be deployed to the backend first.
 *
 * Usage (from repo root):
 *   node migration-scripts/make-teacher.mjs <email> <schoolPrefix>
 *   node migration-scripts/make-teacher.mjs teacher@school.org peverill
 */

import { readFileSync } from 'fs';

const [, , email, schoolPrefixRaw] = process.argv;

if (!email || !schoolPrefixRaw) {
  console.error('Usage: node migration-scripts/make-teacher.mjs <email> <schoolPrefix>');
  process.exit(1);
}
const schoolPrefix = schoolPrefixRaw.toLowerCase();

const config = JSON.parse(readFileSync('./public/amplify_outputs.json', 'utf8'));
const ENDPOINT = config.data.url;
const API_KEY = config.data.api_key;

async function gql(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ query, variables })
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

async function run() {
  const data = await gql(`
    query ListUsers($email: String!) {
      listUsers(filter: { email: { eq: $email } }) {
        items { id email isTeacher schoolPrefix }
      }
    }
  `, { email });

  const user = data.listUsers.items[0];
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  // Sanity check: warn if no cohort matches the prefix
  const cohortData = await gql(`query { listCohorts { items { cohortCode } } }`);
  const matches = cohortData.listCohorts.items.filter(c =>
    (c.cohortCode || '').toLowerCase().startsWith(schoolPrefix)
  );
  if (matches.length === 0) {
    console.warn(`⚠️  No existing cohorts start with '${schoolPrefix}'. The teacher will see an empty dashboard until one exists.`);
  } else {
    console.log(`Cohorts matching '${schoolPrefix}': ${matches.map(c => c.cohortCode).join(', ')}`);
  }

  await gql(`
    mutation UpdateUser($id: ID!, $isTeacher: Boolean!, $schoolPrefix: String!) {
      updateUser(input: { id: $id, isTeacher: $isTeacher, schoolPrefix: $schoolPrefix }) {
        id email isTeacher schoolPrefix
      }
    }
  `, { id: user.id, isTeacher: true, schoolPrefix });

  console.log(`\n✅ ${email} is now a teacher for school prefix '${schoolPrefix}'.`);
  console.log('   Log out and back in to refresh the menu.\n');
}

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
