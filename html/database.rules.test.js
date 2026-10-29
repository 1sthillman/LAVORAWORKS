import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';

const PROJECT_ID = 'lavora-rules-tests';
const ORG = 'org_test';
// This sentinel is intentionally the same value as the placeholder in rules.
// Production deployment MUST replace it with the real, verified Firebase Auth UID.
const ADMIN = process.env.LAVORA_ADMIN_UID || 'REPLACE_WITH_REAL_ADMIN_UID';
const PARTNER = 'partner_uid';
const EMPLOYEE = 'employee_uid';
const CUSTOMER = 'customer_uid';
const CUSTOMER_TWO = 'customer_two_uid';
const DISABLED_CUSTOMER = 'disabled_customer_uid';

let env;
const rules = readFileSync(new URL('./database.rules.json', import.meta.url), 'utf8');

function dbFor(uid) {
  return env.authenticatedContext(uid).database();
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    database: { host: '127.0.0.1', port: 9000, rules }
  });
  await env.clearDatabase();
  const now = Date.now();

  await env.withSecurityRulesDisabled(async (context) => {
    await context.database().ref().set({
      orgs: {
        [ORG]: {
          members: {
            [ADMIN]: { role: 'admin', status: 'active', assignedAt: now },
            [PARTNER]: { role: 'partner', status: 'active', assignedAt: now },
            [EMPLOYEE]: { role: 'employee', status: 'active', assignedAt: now },
            [CUSTOMER]: { role: 'customer', status: 'active', assignedAt: now },
            [CUSTOMER_TWO]: { role: 'customer', status: 'active', assignedAt: now },
            [DISABLED_CUSTOMER]: { role: 'customer', status: 'disabled', assignedAt: now }
          },
          projectIndex: {
            P1: { id: 'P1', name: 'Project One', workflowStatus: 'production', updatedAt: now, schemaVersion: 1 },
            P2: { id: 'P2', name: 'Project Two', workflowStatus: 'quote', updatedAt: now, schemaVersion: 1 }
          },
          projectPublic: { P1: { id: 'P1', name: 'Project One', description: 'Safe data only' } },
          projectFinancials: { P1: { kdv: 20, quoteTotals: { grand: 12500 }, rows: { R1: { itemName: 'Cabinet', unitPrice: 10000 } } } },
          workflowStaff: { P1: { dueDate: '2026-12-01', items: { W1: { name: 'Cut', status: 'in_progress' } } } },
          customerProjectIndex: {
            [CUSTOMER]: { P1: { projectId: 'P1', inviteHash: 'SEED_HASH' } }
          },
          customerViews: {
            [CUSTOMER]: { P1: { title: 'My project', customerStatus: 'In production', updates: { U1: { text: 'Work started', createdAt: now, createdBy: EMPLOYEE } } } },
            [CUSTOMER_TWO]: { P2: { title: 'Other customer project', customerStatus: 'Quote' } }
          },
          ledger: { L1: { amount: 5000, note: 'Private finance', date: '2026-10-01' } },
          receipts: { R1: { amount: 5000, mediaId: 'F1' } },
          mediaMetadata: {
            finance: { F1: { mimeType: 'image/jpeg', byteLength: 4, checksum: 'sum', createdBy: ADMIN, createdAt: now, visibility: 'finance' } },
            staff: { P1: { WIMG1: { mimeType: 'image/jpeg', byteLength: 4, checksum: 'sum', createdBy: EMPLOYEE, createdAt: now, projectId: 'P1', visibility: 'staff' }, WIMG2: { mimeType: 'image/jpeg', byteLength: 4, checksum: 'sum', createdBy: PARTNER, createdAt: now, projectId: 'P1', visibility: 'staff' } } },
            customer: { [CUSTOMER]: { P1: { CIMG1: { mimeType: 'image/jpeg', byteLength: 4, checksum: 'sum', createdBy: EMPLOYEE, createdAt: now, projectId: 'P1', visibility: 'customer' } } } }
          },
          mediaThumbnails: { staff: { P1: { WIMG1: { dataBase64: 'AAAA', byteLength: 4, checksum: 'sum' }, WIMG2: { dataBase64: 'AAAA', byteLength: 4, checksum: 'sum' } } } },
          mediaPayloads: {
            finance: { F1: { dataBase64: 'AAAA', byteLength: 4, checksum: 'sum' } },
            staff: { P1: { WIMG1: { dataBase64: 'AAAA', byteLength: 4, checksum: 'sum' }, WIMG2: { dataBase64: 'AAAA', byteLength: 4, checksum: 'sum' } } },
            customer: { [CUSTOMER]: { P1: { CIMG1: { dataBase64: 'AAAA', byteLength: 4, checksum: 'sum' } } } }
          },
          customerIntakes: { [CUSTOMER]: { IN1: { title: 'My request', description: 'Please quote', status: 'submitted', createdAt: now } } },
          customerIntakeIndex: { IN1: { requestId: 'IN1', uid: CUSTOMER, title: 'My request', status: 'submitted', createdAt: now } },
          projectInvites: {
            HASH_RACE: { projectId: 'P1', createdBy: ADMIN, createdAt: now, expiresAt: now + 60 * 60 * 1000 },
            HASH_UNUSED: { projectId: 'P2', createdBy: ADMIN, createdAt: now, expiresAt: now + 60 * 60 * 1000 },
            HASH_DISABLED: { projectId: 'P1', createdBy: ADMIN, createdAt: now, expiresAt: now + 60 * 60 * 1000 },
            HASH_SEED: { projectId: 'P1', createdBy: ADMIN, createdAt: now, expiresAt: now + 60 * 60 * 1000, usedBy: CUSTOMER, usedAt: now }
          }
        }
      }
    });
  });
});

after(async () => {
  if (env) await env.cleanup();
});

test('employee sees workflow/project summaries but not finance', async () => {
  const db = dbFor(EMPLOYEE);
  await assertSucceeds(db.ref(`orgs/${ORG}/projectIndex/P1`).once('value'));
  await assertSucceeds(db.ref(`orgs/${ORG}/workflowStaff/P1`).once('value'));
  await assertSucceeds(db.ref(`orgs/${ORG}/mediaPayloads/staff/P1/WIMG1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/mediaPayloads/staff/P1/WIMG2`).set({ dataBase64: 'BBBB', byteLength: 4, checksum: 'sum2' }));
  await assertFails(db.ref(`orgs/${ORG}/mediaThumbnails/staff/P1/WIMG2`).set({ dataBase64: 'BBBB', byteLength: 4, checksum: 'sum2' }));
  await assertFails(db.ref(`orgs/${ORG}/projectFinancials/P1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/customerProjectIndex/${CUSTOMER}/P2`).set({ projectId: 'P2', inviteHash: 'FORGED' }));
  await assertFails(db.ref(`orgs/${ORG}/ledger/L1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/receipts/R1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/mediaPayloads/finance/F1`).once('value'));
  await assertFails(dbFor(ADMIN).ref(`orgs/${ORG}/projectPublic/P1`).set({ id: 'P1', name: 'Project One', price: 999 }));
  await assertFails(dbFor(ADMIN).ref(`orgs/${ORG}/workflowStaff/P1/items/W2`).set({ name: 'Cut', status: 'todo', unitPrice: 99 }));
  await assertFails(dbFor(ADMIN).ref(`orgs/${ORG}/customerViews/${CUSTOMER}/P1`).update({ grandTotal: 999 }));
});

test('media metadata can be listed, but full Base64 payload collections cannot', async () => {
  const db = dbFor(EMPLOYEE);
  await assertSucceeds(db.ref(`orgs/${ORG}/mediaMetadata/staff/P1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/mediaPayloads/staff/P1`).once('value'));
});

test('profiles cannot be used to grant roles; internal notes remain private', async () => {
  const employeeDb = dbFor(EMPLOYEE);
  await assertSucceeds(employeeDb.ref(`userProfiles/${EMPLOYEE}`).set({ displayName: 'Worker', email: 'worker@example.test', createdAt: Date.now() }));
  await assertFails(employeeDb.ref(`userProfiles/${EMPLOYEE}`).set({ displayName: 'Worker', role: 'admin' }));
  await assertFails(employeeDb.ref(`orgs/${ORG}/internalNotes/P1/N1`).once('value'));
  await assertSucceeds(dbFor(PARTNER).ref(`orgs/${ORG}/internalNotes/P1/N1`).set({ text: 'Private note', createdBy: PARTNER, createdAt: Date.now() }));
});

test('employee can update a workflow item, not membership or finance', async () => {
  const db = dbFor(EMPLOYEE);
  await assertSucceeds(db.ref(`orgs/${ORG}/workflowStaff/P1/items/W1`).update({ status: 'done' }));
  await assertFails(db.ref(`orgs/${ORG}/members/${EMPLOYEE}/role`).set('admin'));
  await assertFails(db.ref(`orgs/${ORG}/projectFinancials/P1/quoteTotals/grand`).set(1));
  await assertSucceeds(db.ref(`orgs/${ORG}/customerViews/${CUSTOMER}/P1/updates/U2`).set({ text: 'Progress update', createdAt: Date.now(), createdBy: EMPLOYEE }));
  await assertFails(db.ref(`orgs/${ORG}/customerViews/${CUSTOMER_TWO}/P2/updates/U3`).set({ text: 'Unlinked update', createdAt: Date.now(), createdBy: EMPLOYEE }));
  await assertFails(db.ref(`orgs/${ORG}/mediaPayloads/customer/${CUSTOMER}/P1/UNAPPROVED`).set({ dataBase64: 'AAAA', byteLength: 4, checksum: 'sum' }));
});

test('customer reads only own project index, view and intake', async () => {
  const db = dbFor(CUSTOMER);
  await assertSucceeds(db.ref(`orgs/${ORG}/customerProjectIndex/${CUSTOMER}`).once('value'));
  await assertSucceeds(db.ref(`orgs/${ORG}/customerViews/${CUSTOMER}/P1`).once('value'));
  await assertSucceeds(db.ref(`orgs/${ORG}/customerIntakes/${CUSTOMER}/IN1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/customerViews/${CUSTOMER_TWO}/P2`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/projectIndex/P1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/projectFinancials/P1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/ledger/L1`).once('value'));
  await assertSucceeds(db.ref(`orgs/${ORG}/mediaPayloads/customer/${CUSTOMER}/P1/CIMG1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/mediaPayloads/customer/${CUSTOMER_TWO}/P2/OTHER`).once('value'));
});

test('admin uses the small intake index instead of reading the entire customer intake tree', async () => {
  const adminDb = dbFor(ADMIN);
  await assertSucceeds(adminDb.ref(`orgs/${ORG}/customerIntakeIndex`).once('value'));
  await assertFails(adminDb.ref(`orgs/${ORG}/customerIntakes`).once('value'));
  await assertSucceeds(adminDb.ref(`orgs/${ORG}/customerIntakes/${CUSTOMER}/IN1`).once('value'));
  await assertFails(dbFor(EMPLOYEE).ref(`orgs/${ORG}/customerIntakeIndex`).once('value'));
});

test('customer intake media must belong to an existing request and the customer UID', async () => {
  const db = dbFor(CUSTOMER);
  const meta = { mimeType: 'image/jpeg', byteLength: 4, checksum: 'imgsum', createdBy: CUSTOMER, createdAt: Date.now(), visibility: 'customer' };
  await assertFails(db.ref(`orgs/${ORG}/mediaMetadata/customerIntakes/${CUSTOMER}/NO_REQUEST/IMG_BAD`).set(meta));
  await assertSucceeds(db.ref(`orgs/${ORG}/mediaMetadata/customerIntakes/${CUSTOMER}/IN1/IMG1`).set(meta));
  await assertSucceeds(db.ref(`orgs/${ORG}/mediaThumbnails/customerIntakes/${CUSTOMER}/IN1/IMG1`).set({ dataBase64: 'AAAA', byteLength: 4, checksum: 'imgsum' }));
  await assertSucceeds(db.ref(`orgs/${ORG}/mediaPayloads/customerIntakes/${CUSTOMER}/IN1/IMG1`).set({ dataBase64: 'AAAA', byteLength: 4, checksum: 'imgsum' }));
  await assertFails(db.ref(`orgs/${ORG}/mediaPayloads/customerIntakes/${CUSTOMER}/NO_REQUEST/IMG_BAD`).set({ dataBase64: 'AAAA', byteLength: 4, checksum: 'imgsum' }));
});

test('customer can submit own intake but cannot accept it or create another user intake', async () => {
  const db = dbFor(CUSTOMER);
  await assertSucceeds(db.ref(`orgs/${ORG}/customerIntakes/${CUSTOMER}/IN2`).set({
    title: 'New order', description: 'A customer-created request', status: 'submitted', createdAt: Date.now()
  }));
  const intake = await db.ref(`orgs/${ORG}/customerIntakes/${CUSTOMER}/IN2`).once('value');
  await assertSucceeds(db.ref(`orgs/${ORG}/customerIntakeIndex/IN2`).set({ requestId: 'IN2', uid: CUSTOMER, title: 'New order', status: 'submitted', createdAt: intake.val().createdAt }));
  await assertFails(db.ref(`orgs/${ORG}/customerIntakeIndex/IN2`).update({ status: 'accepted' }));
  await assertFails(db.ref(`orgs/${ORG}/customerIntakes/${CUSTOMER}/IN3`).set({
    title: 'Forged accepted request', description: 'Should fail', status: 'accepted', createdAt: Date.now()
  }));
  await assertFails(db.ref(`orgs/${ORG}/customerIntakes/${CUSTOMER_TWO}/IN4`).set({
    title: 'Another user', description: 'Should fail', status: 'submitted', createdAt: Date.now()
  }));
});

test('partner can access finance but cannot assign another admin', async () => {
  const db = dbFor(PARTNER);
  await assertSucceeds(db.ref(`orgs/${ORG}/projectFinancials/P1`).once('value'));
  await assertSucceeds(db.ref(`orgs/${ORG}/ledger/L1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/members/new_uid`).set({ role: 'admin', status: 'active', assignedAt: Date.now() }));
});

test('only the pinned administrator can assign roles', async () => {
  const adminDb = dbFor(ADMIN);
  await assertSucceeds(adminDb.ref(`orgs/${ORG}/members/new_employee`).set({ role: 'employee', status: 'active', assignedAt: Date.now() }));
  await assertFails(adminDb.ref(`orgs/${ORG}/members/new_admin`).set({ role: 'admin', status: 'active', assignedAt: Date.now() }));
  await assertFails(adminDb.ref(`orgs/${ORG}/members/${ADMIN}`).remove());
  await assertFails(dbFor(EMPLOYEE).ref(`orgs/${ORG}/members/new_employee`).set({ role: 'partner', status: 'active', assignedAt: Date.now() }));
});

test('invite claim is single-use and scoped to the invited project', async () => {
  const db = dbFor(CUSTOMER_TWO);
  const invitePath = `orgs/${ORG}/projectInvites/HASH_UNUSED`;
  await assertSucceeds(db.ref(invitePath).update({ usedBy: CUSTOMER_TWO, usedAt: Date.now() }));
  await assertSucceeds(db.ref(`orgs/${ORG}/customerProjectIndex/${CUSTOMER_TWO}/P2`).set({ projectId: 'P2', inviteHash: 'HASH_UNUSED' }));
  await assertFails(db.ref(`orgs/${ORG}/customerProjectIndex/${CUSTOMER_TWO}/P1`).set({ projectId: 'P1', inviteHash: 'HASH_UNUSED' }));
  await assertFails(db.ref(invitePath).update({ usedBy: EMPLOYEE, usedAt: Date.now() }));
});

test('two concurrent claims cannot both consume the same invite', async () => {
  const refA = dbFor(CUSTOMER).ref(`orgs/${ORG}/projectInvites/HASH_RACE`);
  const refB = dbFor(CUSTOMER_TWO).ref(`orgs/${ORG}/projectInvites/HASH_RACE`);
  const outcomes = await Promise.allSettled([
    refA.update({ usedBy: CUSTOMER, usedAt: Date.now() }),
    refB.update({ usedBy: CUSTOMER_TWO, usedAt: Date.now() })
  ]);
  assert.equal(outcomes.filter((x) => x.status === 'fulfilled').length, 1);
  assert.equal(outcomes.filter((x) => x.status === 'rejected').length, 1);
});

test('disabled customer cannot read customer data or redeem project codes', async () => {
  const db = dbFor(DISABLED_CUSTOMER);
  await assertFails(db.ref(`orgs/${ORG}/customerProjectIndex/${DISABLED_CUSTOMER}`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/projectInvites/HASH_DISABLED`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/customerIntakes/${DISABLED_CUSTOMER}`).once('value'));
});

test('unauthenticated users have no database access', async () => {
  const db = env.unauthenticatedContext().database();
  await assertFails(db.ref(`orgs/${ORG}/projectIndex/P1`).once('value'));
  await assertFails(db.ref(`orgs/${ORG}/projectFinancials/P1`).once('value'));
});
