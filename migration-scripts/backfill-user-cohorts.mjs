#!/usr/bin/env node

/**
 * Backfill User -> Cohort links
 *
 * Sets the `cohortId` field (which stores the cohortCode) on existing User
 * records so they appear on the cohort page alongside their teammates.
 *
 * HOW IT DECIDES A USER'S COHORT:
 *   1. EMAIL_TO_COHORT below (exact, per-user) wins.
 *   2. Otherwise DEFAULT_COHORT is used (set to null to skip unmapped users).
 *
 * Cohort codes are validated against the Cohort table before assigning, so a
 * typo fails loudly instead of creating an orphan link.
 *
 * SAFETY: dry-run by default. It only writes when you pass --apply.
 *
 * No dependencies — uses the GraphQL API + API key from public/amplify_outputs.json,
 * exactly like the app does. Run with Node 18+ (built-in fetch).
 *
 * Usage (from repo root):
 *   node migration-scripts/backfill-user-cohorts.mjs            # preview
 *   node migration-scripts/backfill-user-cohorts.mjs --apply    # write changes
 *   node migration-scripts/backfill-user-cohorts.mjs --apply --overwrite
 *     (--overwrite also re-assigns users who ALREADY have a cohortId)
 */

import { readFileSync } from 'fs';

// ─── EDIT THIS ────────────────────────────────────────────────────────────
// Per-user overrides. Keys are emails, values are cohort codes.
const EMAIL_TO_COHORT = {
  // 'student@example.com': 'TEST2024',
};

// Applied to any user not listed above. Set to null to leave them untouched.
const DEFAULT_COHORT = 'TEST2024';
// ──────────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');
const OVERWRITE = process.argv.includes('--overwrite');

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

async function listAllCohortCodes() {
  const codes = new Set();
  let nextToken = null;
  do {
    const data = await gql(`
      query ListCohorts($nextToken: String) {
        listCohorts(nextToken: $nextToken) {
          items { cohortCode }
          nextToken
        }
      }
    `, { nextToken });
    data.listCohorts.items.forEach(c => codes.add(c.cohortCode));
    nextToken = data.listCohorts.nextToken;
  } while (nextToken);
  return codes;
}

async function listAllUsers() {
  const users = [];
  let nextToken = null;
  do {
    const data = await gql(`
      query ListUsers($nextToken: String) {
        listUsers(nextToken: $nextToken) {
          items { id email displayName cohortId }
          nextToken
        }
      }
    `, { nextToken });
    users.push(...data.listUsers.items);
    nextToken = data.listUsers.nextToken;
  } while (nextToken);
  return users;
}

async function updateUserCohort(id, cohortId) {
  await gql(`
    mutation UpdateUser($id: ID!, $cohortId: String!) {
      updateUser(input: { id: $id, cohortId: $cohortId }) { id cohortId }
    }
  `, { id, cohortId });
}

async function run() {
  console.log(`\n🔎 Backfill user cohorts (${APPLY ? 'APPLY' : 'DRY RUN'}${OVERWRITE ? ', OVERWRITE' : ''})\n`);

  const validCodes = await listAllCohortCodes();
  console.log(`Known cohort codes: ${[...validCodes].join(', ') || '(none)'}\n`);

  const users = await listAllUsers();
  console.log(`Found ${users.length} users.\n`);

  let updated = 0, skipped = 0, errors = 0;

  for (const user of users) {
    const target = EMAIL_TO_COHORT[user.email] || DEFAULT_COHORT;

    if (!target) {
      console.log(`  – ${user.email}: no target cohort, skipping`);
      skipped++;
      continue;
    }
    if (user.cohortId && !OVERWRITE) {
      console.log(`  – ${user.email}: already in '${user.cohortId}', skipping`);
      skipped++;
      continue;
    }
    if (!validCodes.has(target)) {
      console.error(`  ✗ ${user.email}: target cohort '${target}' not found in Cohort table`);
      errors++;
      continue;
    }
    if (user.cohortId === target) {
      console.log(`  – ${user.email}: already '${target}', skipping`);
      skipped++;
      continue;
    }

    console.log(`  → ${user.email}: ${user.cohortId || '(none)'} => ${target}`);

    if (APPLY) {
      try {
        await updateUserCohort(user.id, target);
      } catch (e) {
        console.error(`    ✗ update failed:`, e.message);
        errors++;
        continue;
      }
    }
    updated++;
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`${APPLY ? 'Updated' : 'Would update'}: ${updated}   Skipped: ${skipped}   Errors: ${errors}`);
  if (!APPLY && updated > 0) {
    console.log(`\nRun again with --apply to write these changes.`);
  }
  console.log('');
}

run().catch(err => {
  console.error('❌ Backfill failed:', err.message);
  process.exit(1);
});
