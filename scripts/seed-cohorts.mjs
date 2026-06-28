#!/usr/bin/env node

/**
 * Seed cohorts into the current backend (the one public/amplify_outputs.json points at).
 * Idempotent: skips a cohort that already exists (matched by cohortCode).
 *
 * Use this to repopulate a fresh production backend after cutover.
 *
 * Edit the COHORTS list below, then run from the repo root:
 *   node scripts/seed-cohorts.mjs            # preview (dry run)
 *   node scripts/seed-cohorts.mjs --apply    # create the cohorts
 */

import { readFileSync } from 'fs';

// ─── EDIT THIS ──────────────────────────────────────────────────────────────
// Tutors register with a cohort's `cohortCode`. Teacher codes are `<prefix>Tutor`,
// e.g. a "peverill" teacher (peverillTutor) sees every cohort starting with "peverill".
const COHORTS = [
  { cohortCode: 'TEST2024', name: 'Test Cohort 2024' },
  { cohortCode: 'shePlusTechJuly26', name: 'ShePlusTech — July 2026' },
  // Shared cohort for tutors (auto-assigned when registering with the tutor code)
  { cohortCode: 'tutors', name: 'Code the Future Tutors' },
];
// ─────────────────────────────────────────────────────────────────────────────

const APPLY = process.argv.includes('--apply');
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

async function cohortExists(code) {
  const data = await gql(
    `query($c:String!){ listCohorts(filter:{cohortCode:{eq:$c}}){ items { id } } }`,
    { c: code }
  );
  return data.listCohorts.items.length > 0;
}

async function run() {
  console.log(`\n🌱 Seeding cohorts into ${ENDPOINT} (${APPLY ? 'APPLY' : 'DRY RUN'})\n`);
  const sessionReleaseDates = JSON.stringify({
    session1: 0, session2: 0, session3: 0, session4: 0, session5: 0, session6: 0, session7: 0
  });

  let created = 0, skipped = 0;
  for (const c of COHORTS) {
    if (await cohortExists(c.cohortCode)) {
      console.log(`  – ${c.cohortCode}: already exists, skipping`);
      skipped++;
      continue;
    }
    console.log(`  → ${c.cohortCode}: ${APPLY ? 'creating' : 'would create'} ("${c.name}")`);
    if (APPLY) {
      await gql(
        `mutation($input: CreateCohortInput!){ createCohort(input:$input){ id cohortCode } }`,
        { input: { cohortCode: c.cohortCode, name: c.name, sessionReleaseDates } }
      );
    }
    created++;
  }

  console.log(`\n${APPLY ? 'Created' : 'Would create'}: ${created}   Skipped: ${skipped}`);
  if (!APPLY && created > 0) console.log(`\nRun again with --apply to create them.`);
  console.log('');
}

run().catch(err => { console.error('❌ Seed failed:', err.message); process.exit(1); });
