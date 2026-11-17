import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { ModuleKind, ScriptTarget, transpileModule } from "typescript";
import { z } from "zod";
import * as schemas from "../src/schemas/battle-pass/battle-pass.schema";
import * as progress from "../src/logic/battle-pass-progress";

type AdminActions = typeof import("../src/actions/battle-pass/admin-battle-pass.action");
type PlayerActions = typeof import("../src/actions/battle-pass/player-battle-pass.action");
const USER = "111111111111111111111111";
const PASS = "222222222222222222222222";
const LEVEL = "333333333333333333333333";
const LOCKED = "444444444444444444444444";

const compiled = transpileModule(
  readFileSync(resolve(__dirname, "../src/actions/battle-pass/admin-battle-pass.action.ts"), "utf8"),
  { compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2017 } },
).outputText;
const playerCompiled = transpileModule(
  readFileSync(resolve(__dirname, "../src/actions/battle-pass/player-battle-pass.action.ts"), "utf8"),
  { compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2017 } },
).outputText;

// Ejecuta las acciones reales con infraestructura aislada: nunca conecta a MongoDB.
const fixture = () => {
  const user = { id: USER, nickname: "Jugador", name: "Nombre", lastname: "Apellido", email: "jugador@example.com", victoryPoints: 100 };
  const level = { id: LEVEL, levelNumber: 15, title: "Premio", imageUrl: null, manualRewardLabel: "Sobre", rewardType: "MANUAL", rewardAvatar: null, victoryPointsReward: 5 };
  const pass = {
    id: PASS, title: "Temporada", seasonNumber: 1, status: "ACTIVE",
    startsAt: new Date("2026-01-01"), endsAt: new Date("2026-12-31"),
    levels: [level, { ...level, id: LOCKED, levelNumber: 16 }],
  };
  type Claim = {
    id: string; userId: string; battlePassId: string; battlePassLevelId: string;
    rewardType: string; status: string; claimedAt: Date; fulfilledAt: Date | null;
  };
  let claims: Claim[] = [];
  const state = { role: "admin", offset: 0, conflicts: 0, reads: 0, writes: 0 };
  const record = (claim: Claim) => ({
    ...claim, user, battlePass: pass, battlePassLevel: pass.levels.find((item) => item.id === claim.battlePassLevelId),
    rewardAvatar: null, victoryPointsAwarded: null,
  });
  const matchesUser = (where?: { id?: { in: string[] }; OR?: Array<Record<string, { contains: string }>> }) =>
    (!where?.id || where.id.in.includes(USER)) && (!where?.OR || where.OR.some((filter) =>
      Object.entries(filter).some(([key, value]) => String(user[key as keyof typeof user]).toLowerCase().includes(value.contains.toLowerCase())),
    ));
  const db = {
    user: {
      findUnique: async ({ where }: { where: { id?: string; email?: string } }) => where.id === USER || where.email === user.email ? user : null,
      update: async ({ data }: { data: { victoryPoints: { increment: number } } }) => {
        user.victoryPoints += data.victoryPoints.increment;
        return user;
      },
      count: async ({ where }: { where: Parameters<typeof matchesUser>[0] }) => matchesUser(where) ? 1 : 0,
      findMany: async ({ where }: { where: Parameters<typeof matchesUser>[0] }) => matchesUser(where) ? [user] : [],
    },
    battlePass: {
      findFirst: async () => pass,
      findUnique: async () => pass,
      findMany: async ({ where }: { where: { status?: { in: string[] } } }) =>
        !where.status || where.status.in.includes(pass.status) ? [pass] : [],
    },
    tournament: { count: async () => 15, findMany: async () => {
      state.reads += 1;
      return Array.from({ length: 15 }, () => ({ tournamentPlayers: [{ userId: USER }, { userId: USER }] }));
    } },
    battlePassUserProgress: {
      findUnique: async () => ({ manualOffset: state.offset }),
      findMany: async () => [{ userId: USER, manualOffset: state.offset }],
    },
    battlePassProgressAdjustment: { findMany: async () => [] },
    battlePassClaim: {
      create: async ({ data }: { data: Omit<Claim, "id" | "claimedAt" | "fulfilledAt"> }) => {
        state.writes += 1;
        const claim = { ...data, id: "555555555555555555555555", claimedAt: new Date(), fulfilledAt: null };
        claims.push(claim);
        return record(claim);
      },
      findMany: async () => claims,
      findUnique: async ({ where }: { where: { id: string } }) => claims.find((item) => item.id === where.id) ?? null,
      upsert: async ({ create, update }: { create: Omit<Claim, "id" | "claimedAt">; update: Partial<Claim> }) => {
        state.writes += 1;
        const existing = claims.find((item) => item.userId === create.userId && item.battlePassLevelId === create.battlePassLevelId);
        if (existing) {
          Object.assign(existing, update);
          return record(existing);
        }
        const claim = { ...create, id: "555555555555555555555555", claimedAt: new Date() };
        claims.push(claim);
        return record(claim);
      },
    },
    $transaction: async <T>(action: (tx: unknown) => Promise<T>): Promise<T> => {
      if (state.conflicts > 0) {
        state.conflicts -= 1;
        throw { code: "P2034" };
      }
      const previous = claims.map((item) => ({ ...item }));
      try { return await action(db); }
      catch (error) { claims = previous; throw error; }
    },
  };
  const exports = {};
  const dependencies: Record<string, unknown> = {
    "@/auth": { auth: async () => ({ user: { idd: USER, email: user.email, role: state.role } }) },
    "@/lib/prisma": { prisma: db },
    "@/lib/assets-storage": {},
    "@/models/media.models": {},
    "@/schemas/battle-pass/battle-pass.schema": schemas,
    "@/logic/battle-pass-progress": progress,
    sharp: {}, zod: { z },
  };
  const sandbox = {
    exports,
    require: (id: string) => {
      assert.ok(id in dependencies, `Unexpected infrastructure import: ${id}`);
      return dependencies[id];
    },
  };
  runInNewContext(compiled, sandbox);
  const playerExports = {};
  runInNewContext(playerCompiled, { ...sandbox, exports: playerExports });
  return {
    actions: exports as AdminActions, state, pass,
    playerActions: playerExports as PlayerActions,
    claims: () => claims,
    addPending: () => claims.push({
      id: "555555555555555555555555", userId: USER, battlePassId: PASS, battlePassLevelId: LEVEL,
      rewardType: "MANUAL", status: "PENDING_FULFILLMENT", claimedAt: new Date("2026-06-01"), fulfilledAt: null,
    }),
  };
};

test("both admin views expose 15/16 and physical rewards without creating claims", async () => {
  const f = fixture();
  const deliveries = await f.actions.getStoreBattlePassDeliveriesAction();
  assert.equal(deliveries.totalItems, 1);
  assert.equal(deliveries.items[0].progress, 15);
  assert.equal(deliveries.items[0].maxLevel, 16);
  assert.equal(deliveries.items[0].claimId, null);
  assert.equal(deliveries.items[0].claimedAt, null);
  const players = await f.actions.getAdminBattlePassPlayersAction({ battlePassId: PASS });
  assert.equal(players.items[0].pendingDeliveries.length, 1);
  assert.equal(players.items[0].effectiveProgress, 15);
  assert.equal(f.state.writes, 0);
});

test("player sees pending without a claim, locked after reduction, and delivered permanently", async () => {
  const f = fixture();
  let data = await f.playerActions.getActiveBattlePassAction();
  assert.equal(data?.levels[0].claimStatus, "PENDING_FULFILLMENT");
  assert.equal(data?.levels[0].claimed, false);
  assert.equal(data?.levels[1].claimStatus, null);
  f.addPending();
  f.state.offset = -1;
  data = await f.playerActions.getActiveBattlePassAction();
  assert.equal(data?.levels[0].claimStatus, null);
  assert.equal(data?.levels[0].unlocked, false);
  assert.equal(f.state.writes, 0);
  f.state.offset = 0;
  await f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL] });
  f.state.offset = -1;
  data = await f.playerActions.getActiveBattlePassAction();
  assert.equal(data?.levels[0].claimStatus, "FULFILLED");
  assert.equal(data?.levels[0].claimed, true);
});

test("claim-all and ended-pass sync skip physical rewards while preserving digital PV awards", async () => {
  for (const sync of [false, true]) {
    const f = fixture();
    f.pass.levels[1].levelNumber = 14;
    f.pass.levels[1].rewardType = "PV";
    const result = sync
      ? await f.playerActions.syncEndedBattlePassRewardsAction()
      : await f.playerActions.claimAllBattlePassRewardsAction();
    assert.equal(result.rewards.length, 1);
    assert.equal(result.rewards[0].rewardType, "PV");
    assert.equal(f.claims().length, 1);
    assert.equal(f.claims()[0].battlePassLevelId, LOCKED);
    assert.equal((await f.playerActions.getActiveBattlePassAction())?.victoryPoints, 105);
  }
});

test("search filters all eligible players and adjusts pagination", async () => {
  const f = fixture();
  assert.equal((await f.actions.getStoreBattlePassDeliveriesAction({ query: "APELLIDO", page: 8 })).currentPage, 1);
  assert.equal((await f.actions.getStoreBattlePassDeliveriesAction({ query: "APELLIDO" })).totalCount, 1);
  const missing = await f.actions.getStoreBattlePassDeliveriesAction({ query: "other" });
  assert.equal(missing.totalCount, 0);
  assert.equal(missing.items.length, 0);
});

test("lowered progress hides legacy claims and blocks both delivery endpoints", async () => {
  const f = fixture();
  f.addPending();
  f.state.offset = -1;
  assert.equal((await f.actions.getStoreBattlePassDeliveriesAction()).totalItems, 0);
  assert.equal((await f.actions.getAdminBattlePassPlayersAction({ battlePassId: PASS })).items[0].pendingDeliveries.length, 0);
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL] }), /progreso actual/);
  await assert.rejects(f.actions.fulfillBattlePassClaimAction({ claimId: f.claims()[0].id }), /progreso actual/);
  assert.equal(f.claims()[0].status, "PENDING_FULFILLMENT");
  f.state.offset = 0;
  assert.equal((await f.actions.getStoreBattlePassDeliveriesAction()).totalItems, 1);
});

test("delivery creates a claim, retries conflicts and preserves delivery dates on repeated requests", async () => {
  const f = fixture();
  f.state.conflicts = 1;
  const first = await f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL, LEVEL] });
  assert.equal(first.items.length, 1);
  assert.equal(first.newlyClaimedLevelIds.length, 1);
  assert.equal(first.items[0].status, "FULFILLED");
  assert.equal((await f.actions.getStoreBattlePassDeliveriesAction()).totalItems, 0);
  f.state.offset = -10;
  const second = await f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL] });
  assert.equal(second.items[0].fulfilledAt, first.items[0].fulfilledAt);
  assert.equal(second.newlyClaimedLevelIds.length, 0);
  assert.equal(second.newlyFulfilledLevelIds.length, 0);
  assert.equal(f.claims().length, 1);
});

test("legacy pending claims are fulfilled in place", async () => {
  const f = fixture();
  f.addPending();
  const result = await f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL] });
  assert.equal(result.newlyClaimedLevelIds.length, 0);
  assert.equal(result.items[0].claimedAt, "2026-06-01T00:00:00.000Z");
  assert.equal(f.claims().length, 1);
});

test("a locked item rolls back a batch; invalid users, levels, and digital rewards are rejected", async () => {
  const f = fixture();
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL, LOCKED] }), /progreso actual/);
  assert.equal(f.claims().length, 0);
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: PASS, levelIds: [LEVEL] }), /jugador no existe/);
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [PASS] }), /existentes/);
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: "invalid", levelIds: [LEVEL] }));
  f.pass.levels[0].rewardType = "PV";
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL] }), /físicas/);
});

test("archived passes remain deliverable, drafts and non-admin sessions are excluded", async () => {
  const f = fixture();
  f.pass.status = "ARCHIVED";
  assert.equal((await f.actions.getStoreBattlePassDeliveriesAction()).totalItems, 1);
  f.pass.status = "DRAFT";
  assert.equal((await f.actions.getStoreBattlePassDeliveriesAction()).totalItems, 0);
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL] }), /progreso actual/);
  f.state.role = "player";
  await assert.rejects(f.actions.getStoreBattlePassDeliveriesAction(), /permisos/);
  await assert.rejects(f.actions.fulfillStoreBattlePassDeliveriesAction({ userId: USER, levelIds: [LEVEL] }), /permisos/);
  assert.equal(f.state.writes, 0);
});
