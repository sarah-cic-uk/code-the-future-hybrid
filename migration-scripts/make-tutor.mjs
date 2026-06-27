#!/usr/bin/env node

/**
 * Promote a user to tutor (course owner / admin)
 *
 * Sets isTutor=true on an existing User record, granting access to
 * adminCohortView.html (all cohorts, every school, ever run).
 *
 * No dependencies — uses the GraphQL API + API key from public/amplify_outputs.json.
 *
 * Usage (from repo root):
 *   node migration-scripts/make-tutor.mjs <email>
 *   node migration-scripts/make-tutor.mjs owner@codethefuture.org
 */

import { readFileSync } from 'fs';

const [, , email] = process.argv;

if (!email) {
  console.error('Usage: node migration-scripts/make-tutor.mjs <email>');
  process.exit(1);
}

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
        items { id email isTutor }
      }
    }
  `, { email });

  const user = data.listUsers.items[0];
  if (!user) {
    console.error(`No user found with email ${email}`);
    process.exit(1);
  }

  await gql(`
    mutation UpdateUser($id: ID!, $isTutor: Boolean!) {
      updateUser(input: { id: $id, isTutor: $isTutor }) { id email isTutor }
    }
  `, { id: user.id, isTutor: true });

  console.log(`\n✅ ${email} is now a tutor (course owner / admin).`);
  console.log('   Log out and back in to refresh the menu.\n');
}

run().catch(err => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
