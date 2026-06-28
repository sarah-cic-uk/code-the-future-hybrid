#!/usr/bin/env node

/**
 * Set role flags on an existing User (after they've registered/verified).
 * Works against the backend public/amplify_outputs.json points at.
 *
 * Run from the repo root:
 *   node scripts/set-user-role.mjs <email> [--admin] [--tutor] [--teacher <schoolPrefix>] [--cohort <code>]
 *
 * Examples:
 *   node scripts/set-user-role.mjs owner@codethefuture.uk --admin --tutor
 *   node scripts/set-user-role.mjs teacher@school.org --teacher peverill
 *   node scripts/set-user-role.mjs student@x.com --cohort peverillAug26
 *
 * Flags are additive — only the ones you pass are changed.
 */

import { readFileSync } from 'fs';

const args = process.argv.slice(2);
const email = args[0];
if (!email || email.startsWith('--')) {
  console.error('Usage: node scripts/set-user-role.mjs <email> [--admin] [--tutor] [--teacher <prefix>] [--cohort <code>]');
  process.exit(1);
}

function flagValue(name) {
  const i = args.indexOf(name);
  return i !== -1 ? (args[i + 1] || '') : null;
}

const input = {};
if (args.includes('--admin')) input.isAdmin = true;
if (args.includes('--tutor')) input.isTutor = true;
if (args.includes('--teacher')) {
  input.isTeacher = true;
  const prefix = flagValue('--teacher');
  if (prefix) input.schoolPrefix = prefix.toLowerCase();
}
const cohort = flagValue('--cohort');
if (cohort) input.cohortId = cohort;

if (Object.keys(input).length === 0) {
  console.error('Nothing to set. Pass at least one of --admin --tutor --teacher <prefix> --cohort <code>.');
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
  const data = await gql(
    `query($e:String!){ listUsers(filter:{email:{eq:$e}}){ items { id email } } }`,
    { e: email }
  );
  const user = data.listUsers.items[0];
  if (!user) {
    console.error(`No user found with email ${email}. They must register and verify first.`);
    process.exit(1);
  }

  await gql(
    `mutation($input: UpdateUserInput!){ updateUser(input:$input){ id email isAdmin isTutor isTeacher schoolPrefix cohortId } }`,
    { input: { id: user.id, ...input } }
  );

  console.log(`\n✅ Updated ${email}:`, JSON.stringify(input));
  console.log('   They should log out and back in to refresh their menu.\n');
}

run().catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });
