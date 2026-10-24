import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compute, variantMatrix } from '../site/js/calc.js';

function close(a, b, tol = 1e-9) {
  assert.ok(Math.abs(a - b) <= tol, `expected ${a} to be within ${tol} of ${b}`);
}

// The page-default inputs, written inline so this suite does not import data.js
// (data.js loads model.js, which is rewritten in later plans of phase 03.1).
const inputs = (over = {}) => ({
  campaigns_per_year: 40,
  markets_per_campaign: 5,
  concepts_per_campaign: 25,
  formats_per_market: 8,
  reviewer_fte: 12,
  marketing_budget: 78000000,
  multiplier: 2,
  ...over,
});
// The page-default assumptions, written inline for the same reason. The growth
// route (campaign_growth_share) is set per case; 0.5 is the page default (both).
const PAGE_ASSUMPTIONS = {
  campaign_growth_share: 0.5,
  tier_mix: { baseline: [0.4, 0.35, 0.2, 0.05], scaled: [0.55, 0.3, 0.12, 0.03] },
  approval_yield: 0.95,
  auto_approval_share: { baseline: 0.2, scaled: 0.6 },
  sampling_rate: 0.05,
  escalation_rate: 0.05,
  review_minutes_per_variant: 12,
  rework_rate: 0.15,
  reviewer_hours_per_fte_year: 1200,
  reviewer_rate_per_hour: 100,
  master_concept_cost: 1200,
  variant_cost: { baseline: 4, scaled: 0.8 },
  rights_cost_per_concept: 250,
  storage_cost_per_variant: 0.02,
  tooling_cost_annual: { baseline: 150000, scaled: 600000 },
  ai_share_of_variant_cost: { baseline: 0.05, scaled: 0.6 },
  ai_share_of_tooling: { baseline: 0.2, scaled: 0.5 },
  build_days: { baseline: 8, scaled: 3 },
  review_service_days: 1.5,
  target_utilisation: 0.85,
};
const assumptions = PAGE_ASSUMPTIONS;
const withShare = (share) => ({ ...PAGE_ASSUMPTIONS, campaign_growth_share: share });

test('headline identity: campaign-markets double exactly for every growth route', () => {
  for (const share of [0, 0.5, 1]) {
    const r = compute(inputs(), withShare(share));
    assert.equal(r.ok, true);
    close(r.ratios.campaign_markets, 2);
    close(r.scenario.campaign_markets_per_quarter, 2 * r.baseline.campaign_markets_per_quarter);
  }
  close(compute(inputs({ multiplier: 3 }), withShare(0.3)).ratios.campaign_markets, 3);
});

test('markets_per_campaign 0 returns a validation error, not NaN', () => {
  const r = compute(inputs({ markets_per_campaign: 0 }), assumptions);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.field === 'markets_per_campaign'));
});

// ---- Plan 01-04: output half of the model ----

const GOLDEN_ASSUMPTIONS = {
  campaign_growth_share: 0,
  approval_yield: 0.8,
  tier_mix: { baseline: [0.5, 0.5, 0, 0], scaled: [0.5, 0.5, 0, 0] },
  auto_approval_share: { baseline: 0.2, scaled: 0.5 },
  sampling_rate: 0.05,
  escalation_rate: 0.05,
  review_minutes_per_variant: 12,
  rework_rate: 0.1,
  reviewer_hours_per_fte_year: 1000,
  reviewer_rate_per_hour: 100,
  master_concept_cost: 1000,
  variant_cost: { baseline: 5, scaled: 1 },
  rights_cost_per_concept: 100,
  storage_cost_per_variant: 0.1,
  tooling_cost_annual: { baseline: 10000, scaled: 30000 },
  ai_share_of_variant_cost: { baseline: 0.05, scaled: 0.6 },
  ai_share_of_tooling: { baseline: 0.2, scaled: 0.5 },
  build_days: { baseline: 8, scaled: 3 },
  review_service_days: 1.5,
  target_utilisation: 0.85,
};
const goldenInputs = (over = {}) => ({
  campaigns_per_year: 10,
  markets_per_campaign: 2,
  concepts_per_campaign: 10,
  formats_per_market: 5,
  reviewer_fte: 2,
  marketing_budget: 1000000,
  multiplier: 2,
  ...over,
});

function walkNumbers(obj, fn, path = '') {
  if (typeof obj === 'number') return fn(obj, path);
  if (Array.isArray(obj)) return obj.forEach((v, i) => walkNumbers(v, fn, `${path}[${i}]`));
  if (obj && typeof obj === 'object') for (const [k, v] of Object.entries(obj)) walkNumbers(v, fn, `${path}.${k}`);
}

test('golden case, markets route (share 0): hand-calculated campaign-market half', () => {
  // C 10, M 2, 10 concepts per campaign, 5 formats per market, multiplier 2.
  // Baseline: 10 x 2 = 20 campaign-markets a year (5 a quarter); concepts 10 x 10 = 100;
  // variants per concept 5 x 2 = 10; variants 1,000; generated 1,000 / 0.8 = 1,250.
  // Markets route: campaigns stay 10, markets double to 4: 40 a year (10 a quarter);
  // concepts 100; variants per concept 5 x 4 = 20; variants 2,000; generated 2,500.
  const r = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  assert.equal(r.ok, true);
  close(r.baseline.campaigns, 10);
  close(r.baseline.markets, 2);
  close(r.baseline.campaign_markets_per_year, 20);
  close(r.baseline.campaign_markets_per_quarter, 5);
  close(r.baseline.concepts, 100);
  close(r.baseline.variants_per_concept, 10);
  close(r.baseline.variants_per_year, 1000);
  close(r.baseline.generated_variants_per_year, 1250);
  close(r.scenario.campaigns, 10);
  close(r.scenario.markets, 4);
  close(r.scenario.campaign_markets_per_year, 40);
  close(r.scenario.campaign_markets_per_quarter, 10);
  close(r.scenario.concepts, 100);
  close(r.scenario.variants_per_concept, 20);
  close(r.scenario.variants_per_year, 2000);
  close(r.scenario.generated_variants_per_year, 2500);
  close(r.ratios.campaign_markets, 2);
});

test('golden case, campaigns route (share 1): more concepts, same markets', () => {
  // Campaigns double to 20, markets stay 2: 40 campaign-markets; concepts 20 x 10 = 200;
  // variants per concept 5 x 2 = 10; variants 200 x 10 = 2,000; generated 2,500.
  const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, campaign_growth_share: 1 });
  assert.equal(r.ok, true);
  close(r.scenario.campaigns, 20);
  close(r.scenario.markets, 2);
  close(r.scenario.campaign_markets_per_year, 40);
  close(r.scenario.concepts, 200);
  close(r.scenario.variants_per_concept, 10);
  close(r.scenario.variants_per_year, 2000);
  close(r.scenario.generated_variants_per_year, 2500);
  // generation 200 x 1,000 + 2,500 x 1 = 202,500; rights 200 x 100 = 20,000;
  // review 275 h x 100 = 27,500; rework 0.1 x 2,500 x 1 + 0.1 x 2,500 x 0.55 x 0.2 x 100 = 3,000;
  // tooling 30,000; storage 2,000 x 0.1 = 200; total 283,200.
  close(r.scenario.cost.generation, 202500);
  close(r.scenario.cost.rights, 20000);
  close(r.scenario.cost.review, 27500);
  close(r.scenario.cost.rework, 3000);
  close(r.scenario.cost.total, 283200);
  close(r.scenario.cost_per_asset, 141.6);
  close(r.scenario.cost_per_campaign_market, 7080);
});

test('growth route golden: multiplier 4, share 0.5 doubles campaigns and markets each', () => {
  // m^0.5 = 2 for both: campaigns 20, markets 4, campaign-markets 80 vs 20 (x4), concepts 200,
  // variants per concept 5 x 4 = 20, variants 4,000.
  const r = compute(goldenInputs({ multiplier: 4 }), { ...GOLDEN_ASSUMPTIONS, campaign_growth_share: 0.5 });
  assert.equal(r.ok, true);
  close(r.scenario.campaigns, 2 * r.baseline.campaigns);
  close(r.scenario.markets, 2 * r.baseline.markets);
  close(r.scenario.concepts, 2 * r.baseline.concepts);
  close(r.scenario.variants_per_concept, 2 * r.baseline.variants_per_concept);
  close(r.scenario.variants_per_year, 4000);
  close(r.ratios.campaign_markets, 4);
  // generation 200 x 1,000 + 5,000 x 1 = 205,000; review 550 x 100 = 55,000; rework 0.1 x 5,000 + 0.1 x 5,000 x 0.55 x 0.2 x 100 = 6,000;
  // tooling 30,000; rights 20,000; storage 400; total 316,400; per asset 79.1; per campaign-market 316,400 / 80 = 3,955.
  close(r.scenario.cost.total, 316400);
  close(r.scenario.cost_per_asset, 79.1);
  close(r.scenario.cost_per_campaign_market, 3955);
});

test('variants per campaign-market is constant across sides and routes: extra variants never move the headline', () => {
  for (const share of [0, 0.3, 0.5, 1]) {
    for (const [inp, a] of [[inputs(), withShare(share)], [goldenInputs(), { ...GOLDEN_ASSUMPTIONS, campaign_growth_share: share }]]) {
      const r = compute(inp, a);
      const want = inp.concepts_per_campaign * inp.formats_per_market;
      close(r.baseline.variants_per_campaign_market, want);
      close(r.scenario.variants_per_campaign_market, want);
      close(r.baseline.variants_per_year / r.baseline.campaign_markets_per_year, want, 1e-6);
      close(r.scenario.variants_per_year / r.scenario.campaign_markets_per_year, want, 1e-6);
    }
  }
  // doubling the formats doubles derived variants but leaves campaign-markets alone
  const more = compute(inputs({ formats_per_market: 16 }), assumptions);
  const base = compute(inputs(), assumptions);
  close(more.scenario.variants_per_year, 2 * base.scenario.variants_per_year, 1e-6);
  close(more.scenario.campaign_markets_per_quarter, base.scenario.campaign_markets_per_quarter);
  close(more.ratios.campaign_markets, 2);
});

test('route ordering at the page defaults: same campaign-markets, markets cheapest per asset, campaigns dearest', () => {
  const m = compute(inputs(), withShare(0));
  const b = compute(inputs(), withShare(0.5));
  const c = compute(inputs(), withShare(1));
  for (const r of [m, b, c]) close(r.scenario.campaign_markets_per_quarter, 100);
  assert.ok(m.scenario.cost_per_asset < b.scenario.cost_per_asset);
  assert.ok(b.scenario.cost_per_asset < c.scenario.cost_per_asset);
  // Hand figures (independent scratch calculation): 37.75, 45.26, 55.88 dollars per asset.
  close(m.scenario.cost_per_asset, 37.750263, 1e-4);
  close(b.scenario.cost_per_asset, 45.257884, 1e-4);
  close(c.scenario.cost_per_asset, 55.875263, 1e-4);
});

test('page defaults, both routes: hand-calculated baseline and 2x', () => {
  // Baseline: 40 x 5 = 200 campaign-markets a year, 50 a quarter; concepts 1,000; variants 1,000 x 8 x 5 = 40,000.
  // Total 2,588,589.47 -> per asset 64.7147, per campaign-market 12,942.95; brief-to-live 11.846 days.
  // 2x: campaigns 40 x sqrt 2 = 56.5685, markets 5 x sqrt 2 = 7.0711: 400 a year, 100 a quarter;
  // concepts 1,414.21; variants 80,000; total 3,620,630.72 -> per asset 45.2579, per campaign-market 9,051.58;
  // utilisation 0.61871; brief-to-live 7.524 days; AI spend 340,421.05.
  const r = compute(inputs(), assumptions);
  assert.equal(r.ok, true);
  close(r.baseline.campaign_markets_per_quarter, 50, 1e-9);
  close(r.baseline.variants_per_year, 40000, 1e-6);
  close(r.baseline.cost.total, 2588589.4736842, 1e-3);
  close(r.baseline.cost_per_asset, 64.714737, 1e-5);
  close(r.baseline.cost_per_campaign_market, 12942.947368, 1e-4);
  close(r.baseline.brief_to_live_days, 11.845828, 1e-5);
  close(r.scenario.campaign_markets_per_quarter, 100, 1e-9);
  close(r.scenario.concepts, 1414.2135624, 1e-6);
  close(r.scenario.variants_per_year, 80000, 1e-6);
  close(r.scenario.cost.total, 3620630.7180726, 1e-3);
  close(r.scenario.cost_per_asset, 45.257884, 1e-5);
  close(r.scenario.cost_per_campaign_market, 9051.576795, 1e-4);
  close(r.scenario.utilisation, 0.618713, 1e-6);
  close(r.scenario.brief_to_live_days, 7.524156, 1e-5);
  close(r.scenario.ai_spend, 340421.0526, 1e-3);
  close(r.ratios.cost_per_campaign_market, 9051.576795 / 12942.947368, 1e-6);
  close(r.ratios.cost_per_campaign_market_change, r.ratios.cost_per_campaign_market - 1);
  close(r.deltas.total_cost, 3620630.7180726 - 2588589.4736842, 1e-3);
});

test('identity: multiplier 1 with scaled values copied from baseline, for every growth route', () => {
  for (const share of [0, 0.5, 1]) identityAt(share);
});

function identityAt(share) {
  const a = withShare(share);
  const same = Object.fromEntries(Object.entries(a).map(([k, v]) => [
    k, v && typeof v === 'object' && 'baseline' in v ? { baseline: v.baseline, scaled: v.baseline } : v,
  ]));
  const r = compute(inputs({ multiplier: 1 }), same);
  assert.equal(r.ok, true);
  const flat = (o, out = {}, path = '') => {
    for (const [k, v] of Object.entries(o)) {
      if (v && typeof v === 'object') flat(v, out, `${path}${k}.`);
      else out[`${path}${k}`] = v;
    }
    return out;
  };
  const fb = flat(r.baseline);
  const fs = flat(r.scenario);
  for (const k of Object.keys(fb)) {
    if (fb[k] === null) assert.equal(fs[k], null, k);
    else close(fs[k], fb[k]);
  }
}

test('monotonicity: more volume gives more variants and more total cost on both sides', () => {
  for (const f of ['formats_per_market', 'markets_per_campaign', 'concepts_per_campaign', 'campaigns_per_year']) {
    let prev = -Infinity;
    let prevCost = { baseline: -Infinity, scenario: -Infinity };
    for (const v of [1, 2, 5, 10, 50]) {
      const r = compute(inputs({ [f]: v }), assumptions);
      assert.equal(r.ok, true, `${f}=${v}`);
      assert.ok(r.scenario.variants_per_year > prev, `${f}=${v} variants`);
      prev = r.scenario.variants_per_year;
      for (const which of ['baseline', 'scenario']) {
        assert.ok(r[which].cost.total > prevCost[which], `${f}=${v} ${which} cost`);
        prevCost = { ...prevCost, [which]: r[which].cost.total };
      }
    }
  }
});

test('validation of tier and yield assumptions', () => {
  const bad = (over, field) => {
    const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, ...over });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.field === field), field);
  };
  bad({ tier_mix: { baseline: [0.5, 0.4, 0, 0], scaled: [0.5, 0.5, 0, 0] } }, 'tier_mix');
  bad({ tier_mix: { baseline: [0.5, 0.5, 0, 0], scaled: [0.5, 0.5, 0] } }, 'tier_mix');
  bad({ approval_yield: 0 }, 'approval_yield');
  bad({ approval_yield: 1.2 }, 'approval_yield');
});

test('campaign_growth_share outside 0 to 1 or non-numeric names the field', () => {
  for (const bad of [-0.1, 1.1, NaN, Infinity, '0.5', undefined, null]) {
    const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, campaign_growth_share: bad });
    assert.equal(r.ok, false, String(bad));
    assert.ok(r.errors.some((e) => e.field === 'campaign_growth_share'), String(bad));
  }
  for (const ok of [0, 0.25, 1]) assert.equal(compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, campaign_growth_share: ok }).ok, true);
});

test('formats_per_market 0 returns a validation error, not NaN', () => {
  const r = compute(inputs({ formats_per_market: 0 }), assumptions);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.field === 'formats_per_market'));
});

test('removed outputs are gone: no per-head output, no weighted sensitivity, no old cycle-time name', () => {
  const r = compute(inputs(), assumptions);
  const keys = (o) => Object.keys(o);
  const gone = /per_head|weighted|^cycle_/;
  for (const k of [...keys(r.ratios), ...keys(r.baseline), ...keys(r.scenario)]) assert.ok(!gone.test(k), k);
  // fte and tier weights are no longer inputs or assumptions, so omitting them is valid
  assert.equal(r.ok, true);
});

test('bad inputs name the field and never produce NaN', () => {
  for (const bad of ['5', NaN, -1, '', undefined, Infinity]) {
    for (const f of ['campaigns_per_year', 'markets_per_campaign', 'concepts_per_campaign', 'formats_per_market', 'reviewer_fte', 'multiplier']) {
      const r = compute(goldenInputs({ [f]: bad }), GOLDEN_ASSUMPTIONS);
      assert.equal(r.ok, false);
      assert.ok(r.errors.some((e) => e.field === f), f);
    }
  }
});

test('every numeric leaf of a valid output is finite', () => {
  const r = compute(inputs(), assumptions);
  assert.equal(r.ok, true);
  let n = 0;
  walkNumbers(r, (v) => { n++; assert.ok(Number.isFinite(v)); });
  assert.ok(n > 10);
});

// ---- Plan 01-05: cost model, review capacity, AI spend, break-even ----

test('golden cost case at approval yield 0.8 (G = V / yield)', () => {
  const r = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  assert.equal(r.ok, true);
  const b = r.baseline;
  const s = r.scenario;
  close(b.generated_variants_per_year, 1250);
  close(b.review_hours, 205);
  close(b.utilisation, 0.11275);
  close(b.cost.generation, 106250);
  close(b.cost.review, 20500);
  close(b.cost.rework, 2675);
  close(b.cost.tooling, 10000);
  close(b.cost.rights, 10000);
  close(b.cost.storage, 100);
  close(b.cost.total, 149525);
  close(b.cost_per_asset, 149.525);
  close(b.cost_per_campaign_market, 7476.25); // 149,525 / 20
  close(s.review_hours, 275);
  close(s.utilisation, 0.15125);
  close(s.cost.generation, 102500);
  close(s.cost.review, 27500);
  close(s.cost.rework, 3000);
  close(s.cost.tooling, 30000);
  close(s.cost.rights, 10000);
  close(s.cost.storage, 200);
  close(s.cost.total, 173200);
  close(s.cost_per_asset, 86.6);
  close(s.cost_per_campaign_market, 4330); // 173,200 / 40
  close(r.ratios.cost_per_campaign_market, 4330 / 7476.25, 1e-9);
  close(b.brief_to_live_days, 9.859679, 1e-5); // 8 + 1.1 x (1.5 + 1.5 x 0.11275 / 0.88725)
  close(s.brief_to_live_days, 4.944035, 1e-5); // 3 + 1.1 x (1.5 + 1.5 x 0.15125 / 0.84875)
  close(r.ratios.cost_per_asset, 0.57917, 1e-4);
  close(b.production_share_of_budget, 0.149525);
  close(b.cost_per_asset_by_component.generation, 106.25);
  assert.equal(b.review_capacity_exceeded, false);
});

test('golden cost case at approval yield 1 reproduces the research case', () => {
  const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, approval_yield: 1 });
  assert.equal(r.ok, true);
  close(r.baseline.cost.total, 143640);
  close(r.scenario.cost.total, 166600);
  close(r.baseline.cost_per_asset, 143.64);
  close(r.scenario.cost_per_asset, 83.3);
  close(r.baseline.cost_per_campaign_market, 7182); // 143,640 / 20
  close(r.scenario.cost_per_campaign_market, 4165); // 166,600 / 40
  close(r.ratios.cost_per_asset, 0.5799, 1e-4);
  close(r.ratios.cost_per_asset_change, r.ratios.cost_per_asset - 1);
});

test('cost per asset strictly decreases as the multiplier rises', () => {
  let prev = Infinity;
  for (const multiplier of [1, 1.5, 2, 3]) {
    const r = compute(inputs({ multiplier }), assumptions);
    assert.equal(r.ok, true);
    assert.ok(r.scenario.cost_per_asset < prev, `multiplier ${multiplier}`);
    prev = r.scenario.cost_per_asset;
    if (multiplier > 1) assert.ok(r.ratios.cost_per_asset < 1 && r.ratios.cost_per_campaign_market < 1, `ratios at ${multiplier}`);
  }
});

test('2x at baseline auto-approval exceeds review capacity and has no brief-to-live time', () => {
  const r = compute(inputs(), { ...assumptions, auto_approval_share: { baseline: 0.2, scaled: 0.2 } });
  assert.equal(r.ok, true);
  assert.equal(r.scenario.review_capacity_exceeded, true);
  assert.equal(r.scenario.brief_to_live_days, null);
  assert.ok(Number.isFinite(r.baseline.brief_to_live_days));
});

test('defaults: cheaper per asset and per campaign-market, under capacity, AI spend rises, break-even feasible', () => {
  const r = compute(inputs(), assumptions);
  assert.equal(r.ok, true);
  assert.ok(r.scenario.cost_per_asset < r.baseline.cost_per_asset);
  assert.ok(r.scenario.cost_per_campaign_market < r.baseline.cost_per_campaign_market);
  assert.ok(r.scenario.utilisation < 1);
  assert.ok(r.scenario.ai_spend > r.baseline.ai_spend);
  assert.equal(r.break_even_auto_approval.status, 'ok');
  assert.ok(r.scenario.brief_to_live_days > 0);
});

test('cost-half validation names the field', () => {
  const badA = (over, field) => {
    const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, ...over });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.field === field), field);
  };
  badA({ sampling_rate: 1.5 }, 'sampling_rate');
  badA({ sampling_rate: 0.6, escalation_rate: 0.5 }, 'sampling_rate');
  badA({ target_utilisation: 0 }, 'target_utilisation');
  badA({ reviewer_hours_per_fte_year: 0 }, 'reviewer_hours_per_fte_year');
  badA({ master_concept_cost: -1 }, 'master_concept_cost');
  badA({
    auto_approval_share: { baseline: 0.2, scaled: 0.9 },
    tier_mix: { baseline: [0.5, 0.5, 0, 0], scaled: [0.5, 0.35, 0.1, 0.05] },
  }, 'auto_approval_share');
  const r = compute(goldenInputs({ marketing_budget: 0 }), GOLDEN_ASSUMPTIONS);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.field === 'marketing_budget'));
});

test('tiny reviewer headcount is a result, not an error, and every leaf is finite or null', () => {
  const r = compute(inputs({ reviewer_fte: 0.1 }), assumptions);
  assert.equal(r.ok, true);
  assert.equal(r.scenario.review_capacity_exceeded, true);
  walkNumbers(r, (v) => assert.ok(Number.isFinite(v)));
  assert.equal(r.scenario.brief_to_live_days, null);
});

test('break-even auto-approval at flat reviewers (golden, yield 0.8)', () => {
  const r = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  // h* = 0.85 * 2000 / (2500 * 1.1 * 0.2) = 3.0909 -> a* <= 0
  assert.equal(r.break_even_auto_approval.status, 'not_needed');
  assert.equal(r.break_even_auto_approval.value, 0);
  const tight = compute(goldenInputs({ reviewer_fte: 0.05 }), GOLDEN_ASSUMPTIONS);
  assert.equal(tight.break_even_auto_approval.status, 'infeasible');
  assert.equal(tight.break_even_auto_approval.value, 1);
});

// ---- Code review CR-01: zero-denominator ratios are null, not an error ----

test('no AI spend today: ok, ai_spend ratio is null and flagged, other outputs intact', () => {
  const r = compute(inputs(), {
    ...assumptions,
    ai_share_of_variant_cost: { baseline: 0, scaled: 0.6 },
    ai_share_of_tooling: { baseline: 0, scaled: 0.5 },
  });
  assert.equal(r.ok, true);
  assert.equal(r.baseline.ai_spend, 0);
  assert.equal(r.ratios.ai_spend, null);
  assert.deepEqual(r.undefined_ratios, ['ai_spend']);
  assert.ok(Number.isFinite(r.ratios.cost_per_asset));
  assert.ok(Number.isFinite(r.scenario.cost_per_asset));
  walkNumbers(r, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('zero-cost baseline: cost ratios and their change are null, not NaN', () => {
  const zero = {
    ...GOLDEN_ASSUMPTIONS,
    review_minutes_per_variant: 0, master_concept_cost: 0, rights_cost_per_concept: 0, storage_cost_per_variant: 0,
    variant_cost: { baseline: 0, scaled: 1 }, tooling_cost_annual: { baseline: 0, scaled: 30000 },
  };
  const r = compute(goldenInputs(), zero);
  assert.equal(r.ok, true);
  assert.equal(r.baseline.cost.total, 0);
  for (const k of ['cost_per_asset', 'cost_per_asset_change', 'cost_per_campaign_market', 'cost_per_campaign_market_change', 'total_cost', 'total_cost_change', 'ai_spend']) assert.equal(r.ratios[k], null, k);
  assert.equal(r.ratios.campaign_markets, 2);
  assert.deepEqual([...r.undefined_ratios].sort(), ['ai_spend', 'cost_per_asset', 'cost_per_campaign_market', 'total_cost']);
  walkNumbers(r, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('defaults have no undefined ratios', () => {
  assert.deepEqual(compute(inputs(), assumptions).undefined_ratios, []);
});

test('overflow fallback blames no single field', () => {
  const r = compute(inputs({ campaigns_per_year: 1e200, concepts_per_campaign: 1e200, markets_per_campaign: 1e200 }), assumptions);
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 1);
  assert.equal(r.errors[0].field, null);
});

// ---- Code review WR-01: every assumption may be { baseline, scaled } ----

test('per-side values for every cost-half assumption are honoured, not read as scalars', () => {
  const perSide = ['sampling_rate', 'escalation_rate', 'rework_rate', 'review_minutes_per_variant', 'reviewer_rate_per_hour',
    'master_concept_cost', 'rights_cost_per_concept', 'storage_cost_per_variant', 'review_service_days'];
  // Same value on both sides must reproduce the scalar golden case exactly.
  const wrapped = { ...GOLDEN_ASSUMPTIONS };
  for (const f of perSide) wrapped[f] = { baseline: GOLDEN_ASSUMPTIONS[f], scaled: GOLDEN_ASSUMPTIONS[f] };
  const plain = compute(goldenInputs(), GOLDEN_ASSUMPTIONS);
  const r = compute(goldenInputs(), wrapped);
  assert.equal(r.ok, true);
  close(r.baseline.cost.total, plain.baseline.cost.total);
  close(r.scenario.cost.total, plain.scenario.cost.total);
  close(r.scenario.brief_to_live_days, plain.scenario.brief_to_live_days);
  // A lower rework rate at 2x changes only the scaled side.
  const lower = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, rework_rate: { baseline: 0.1, scaled: 0.05 } });
  assert.equal(lower.ok, true);
  close(lower.baseline.cost.rework, plain.baseline.cost.rework);
  assert.ok(lower.scenario.cost.rework < plain.scenario.cost.rework);
  walkNumbers(lower, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('sampling + escalation over 1 is caught per side, including object values', () => {
  for (const which of ['baseline', 'scaled']) {
    const over = { baseline: 0.05, scaled: 0.05, [which]: 0.6 };
    const r = compute(goldenInputs(), { ...GOLDEN_ASSUMPTIONS, sampling_rate: over, escalation_rate: over });
    assert.equal(r.ok, false, which);
    assert.ok(r.errors.some((e) => e.field === 'sampling_rate'), which);
  }
});

// ---- Code review WR-02: break-even respects the T0 + T1 cap ----

test('break-even between the T0+T1 cap and 1 is infeasible, not ok', () => {
  const r = compute(inputs({ reviewer_fte: 3 }), assumptions);
  assert.equal(r.ok, true);
  const mix = assumptions.tier_mix.scaled;
  const cap = mix[0] + mix[1];
  const be = r.break_even_auto_approval;
  assert.ok(be.value > cap && be.value <= 1, `value ${be.value} should sit between cap ${cap} and 1`);
  assert.equal(be.status, 'infeasible');
  close(be.cap, cap);
});

test('break-even below the cap stays ok at the defaults', () => {
  const be = compute(inputs(), assumptions).break_even_auto_approval;
  assert.equal(be.status, 'ok');
  assert.ok(be.value <= be.cap);
});

test('break-even with sampling + escalation = 1 is finite and infeasible when reviewers are short', () => {
  const r = compute(goldenInputs({ reviewer_fte: 0.05 }), { ...GOLDEN_ASSUMPTIONS, sampling_rate: 0.5, escalation_rate: 0.5 });
  assert.equal(r.ok, true);
  assert.equal(r.break_even_auto_approval.status, 'infeasible');
  walkNumbers(r, (v, path) => assert.ok(Number.isFinite(v), path));
});

test('deltas: production cost rise and budget-share points equal scenario minus baseline', () => {
  const r = compute(inputs(), assumptions);
  close(r.deltas.total_cost, r.scenario.cost.total - r.baseline.cost.total);
  close(r.deltas.production_share_of_budget, r.deltas.total_cost / 78000000);
  close(r.ratios.total_cost_change, r.ratios.total_cost - 1);
  assert.ok(r.deltas.total_cost > 0, 'at the defaults production cost rises, so the flat-budget claim needs a funded offset');
});

test('capacity auto-approval: utilisation is exactly 1 there and below the target break-even', () => {
  const r = compute(inputs(), assumptions);
  const capShare = r.capacity_auto_approval.value;
  assert.equal(r.capacity_auto_approval.status, 'ok');
  assert.ok(capShare < r.break_even_auto_approval.value);
  const at = (share) => compute(inputs(), { ...assumptions, auto_approval_share: { baseline: 0.2, scaled: share } });
  close(at(capShare).scenario.utilisation, 1, 1e-9);
  close(at(r.break_even_auto_approval.value).scenario.utilisation, assumptions.target_utilisation, 1e-9);
  assert.equal(at(capShare - 0.01).scenario.review_capacity_exceeded, true);
  assert.equal(at(capShare + 0.01).scenario.review_capacity_exceeded, false);
});

// ---- Plan 02-03: variantMatrix ----

const F = [
  { id: 'sizes', count: 10, applies: 1 },
  { id: 'channels', count: 5, applies: 0.75 },
  { id: 'locales', count: 6, applies: 0.4 },
  { id: 'audiences', count: 5, applies: 0.75 },
  { id: 'tests', count: 4, applies: 0.5 },
  { id: 'feeds', count: 4, applies: 0.5 },
];

// Real enumerator (code review IN-01): builds every variant as an explicit tuple.
// Each factor picks a stated share of the current variants (by the `pick` rule,
// not necessarily the first ones) and expands each picked variant into one
// tuple per level of the factor; unpicked variants keep the factor unset. It
// requires items x applies to be a whole number at every step, so it only runs
// on hand-built cases where the answer is an exact count, not an expectation.
function enumerateVariants(concepts, factors, pick = (i, n, k) => i < k) {
  let items = Array.from({ length: concepts }, (_, c) => ({ concept: c }));
  for (const f of factors) {
    const k = items.length * f.applies;
    assert.ok(Number.isInteger(Math.round(k * 1e9) / 1e9), `${f.id}: ${items.length} x ${f.applies} is not a whole number of items`);
    const kk = Math.round(k);
    const next = [];
    items.forEach((it, i) => {
      if (pick(i, items.length, kk)) for (let level = 0; level < f.count; level++) next.push({ ...it, [f.id]: level });
      else next.push({ ...it, [f.id]: null });
    });
    items = next;
  }
  return items;
}

function enumerate(concepts, factors, pick) {
  const items = enumerateVariants(concepts, factors, pick);
  const keys = new Set(items.map((x) => JSON.stringify(x)));
  assert.equal(keys.size, items.length, 'the enumeration produced a duplicate variant');
  return items.length;
}

test('variantMatrix golden: default set gives 12,000 over 4 concepts', () => {
  const r = variantMatrix(4, F);
  assert.equal(r.ok, true);
  assert.deepEqual(r.rows.map((x) => Math.round(x.variants)), [40, 160, 480, 1920, 4800, 12000]);
  close(r.total, 12000);
  close(r.per_concept, 3000);
  assert.equal(r.total, r.rows.at(-1).variants);
  assert.equal(r.concepts, 4);
});

test('variantMatrix equals a real enumeration of distinct variants', () => {
  // Hand-built case with non-trivial fractions: 4 concepts; a: half of 4 items
  // take 3 levels -> 2 x 3 + 2 = 8; b: a quarter of 8 items take 2 levels -> 2 x 2 + 6 = 10.
  const small = [{ id: 'a', count: 3, applies: 0.5 }, { id: 'b', count: 2, applies: 0.25 }];
  assert.equal(enumerate(4, small), 10);
  close(variantMatrix(4, small).total, 10);
  // which items are picked does not change the count (every other item, not the first k)
  const everyOther = (i, n, k) => i % 2 === 0 && i / 2 < k;
  assert.equal(enumerate(4, small, everyOther), 10);
  // the worked campaign: 12,000 explicit, pairwise distinct tuples
  assert.equal(enumerate(4, F), 12000);
  close(variantMatrix(4, F).total, 12000);
});

// The formula is a product, so this only guards the implementation against an
// order-dependent bug; the enumeration test above is the real check (IN-01).
test('variantMatrix is order independent', () => {
  const perms = [[...F].reverse(), [F[2], F[0], F[5], F[1], F[4], F[3]], [F[4], F[5], F[3], F[2], F[1], F[0]]];
  for (const p of perms) close(variantMatrix(4, p).total, 12000);
});

test('variantMatrix identity: count 1 or applies 0 changes nothing, applies 1 is the plain product', () => {
  const base = variantMatrix(4, F).total;
  close(variantMatrix(4, [...F, { id: 'x', count: 1, applies: 0.7 }]).total, base);
  close(variantMatrix(4, [...F, { id: 'y', count: 9, applies: 0 }]).total, base);
  close(variantMatrix(3, F.map((f) => ({ ...f, applies: 1 }))).total, 3 * 10 * 5 * 6 * 5 * 4 * 4);
});

test('variantMatrix is monotonic in count and applies', () => {
  const base = variantMatrix(4, F).total;
  for (let i = 0; i < F.length; i++) {
    const moreCount = F.map((f, j) => (j === i ? { ...f, count: f.count + 1 } : f));
    const moreApplies = F.map((f, j) => (j === i ? { ...f, applies: Math.min(1, f.applies + 0.1) } : f));
    assert.ok(variantMatrix(4, moreCount).total >= base);
    assert.ok(variantMatrix(4, moreApplies).total >= base);
  }
});

test('variantMatrix default set lands in [10000, 13000]', () => {
  const t = variantMatrix(4, F).total;
  assert.ok(t >= 10000 && t <= 13000);
});

test('variantMatrix validation names the field and never yields NaN', () => {
  const bad = [
    [0, F, 'concepts'], [1.5, F, 'concepts'], [-1, F, 'concepts'], [null, F, 'concepts'],
    [4, [], 'factors'], [4, null, 'factors'],
    [4, [{ id: 'a', count: 0, applies: 0.5 }], 'factors[0].count'],
    [4, [{ id: 'a', count: 2.5, applies: 0.5 }], 'factors[0].count'],
    [4, [{ id: 'a', count: 2, applies: 1.1 }], 'factors[0].applies'],
    [4, [{ id: 'a', count: 2, applies: -0.1 }], 'factors[0].applies'],
    [4, [{ id: 'a', count: 2, applies: NaN }], 'factors[0].applies'],
    [4, [{ count: 2, applies: 0.5 }], 'factors[0].id'],
  ];
  for (const [c, f, field] of bad) {
    const r = variantMatrix(c, f);
    assert.equal(r.ok, false, field);
    assert.ok(r.errors.some((e) => e.field === field), `expected error on ${field}`);
    assert.ok(!('total' in r));
  }
});

test('variantMatrix: every numeric leaf is finite', () => {
  const r = variantMatrix(4, F);
  const leaves = [r.concepts, r.total, r.per_concept, ...r.rows.flatMap((x) => [x.count, x.applies, x.multiplier, x.variants])];
  for (const v of leaves) assert.ok(Number.isFinite(v));
});

// ---- Code review CR-01: human-touch share ----

test('human_touch_share = 1 - auto x (1 - (sampling + escalation)) on each side', () => {
  const r = compute(inputs(), assumptions);
  for (const [side, which] of [['baseline', 'baseline'], ['scenario', 'scaled']]) {
    const pickA = (v) => (v && typeof v === 'object' ? v[which] : v);
    const want = 1 - pickA(assumptions.auto_approval_share) * (1 - (pickA(assumptions.sampling_rate) + pickA(assumptions.escalation_rate)));
    close(r[side].human_touch_share, want, 1e-12);
  }
  close(r.scenario.human_touch_share, 0.46, 1e-12);
  close(r.scenario.review_hours, r.scenario.generated_variants_per_year * r.scenario.human_touch_share * assumptions.review_minutes_per_variant / 60, 1e-6);
});

// ---- Code review WR-09: duplicate ids and sparse arrays are rejected ----

test('variantMatrix rejects duplicate factor ids and holes, naming the field', () => {
  const dup = variantMatrix(2, [{ id: 'a', count: 2, applies: 1 }, { id: 'a', count: 3, applies: 1 }]);
  assert.equal(dup.ok, false);
  assert.ok(dup.errors.some((e) => e.field === 'factors[1].id' && /unique/.test(e.message)), 'duplicate id names the second factor');
  assert.ok(!dup.errors.some((e) => e.field === 'factors[0].id'), 'the first use of an id is valid');
  // eslint-disable-next-line no-sparse-arrays
  const holey = variantMatrix(2, [, { id: 'b', count: 2, applies: 1 }]);
  assert.equal(holey.ok, false);
  for (const field of ['factors[0].id', 'factors[0].count', 'factors[0].applies']) {
    assert.ok(holey.errors.some((e) => e.field === field), `hole reported on ${field}`);
  }
  const trailing = new Array(2);
  trailing[0] = { id: 'c', count: 2, applies: 0.5 };
  const t = variantMatrix(2, trailing);
  assert.equal(t.ok, false);
  assert.ok(t.errors.some((e) => e.field === 'factors[1].id'));
  for (const r of [dup, holey, t]) assert.ok(!('total' in r) && !('rows' in r));
});

// ---- Code review IN-12: fractional shares give expected counts, unrounded ----

test('variantMatrix returns expected (unrounded) counts for fractional shares', () => {
  const r = variantMatrix(1, [{ id: 'a', count: 2, applies: 0.3 }]);
  assert.equal(r.ok, true);
  close(r.total, 1.3);
  close(r.rows[0].variants, 1.3);
  const r2 = variantMatrix(3, [{ id: 'a', count: 4, applies: 0.25 }, { id: 'b', count: 3, applies: 0.1 }]);
  close(r2.total, 3 * 1.75 * 1.2);
  assert.ok(!Number.isInteger(r2.total), 'not rounded inside the model');
});
