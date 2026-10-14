const test = require('node:test'), assert = require('node:assert');
const Q = require('../questions.js'), G = require('../grading.js');
const ids = Q.map(q => q.id);
test('banco expandido: questões autorais e questões oficiais do ENEM 2020', () => {
  assert.equal(Q.length, 233);
  assert.equal(new Set(ids).size, Q.length);
  assert.equal(Q.filter(q => q.source === 'ENEM 2020 oficial').length, 183);
});
test('todas as questões têm cinco alternativas e gabarito válido', () => {
  Q.forEach(q => {
    assert.deepEqual(Object.keys(q.alternatives), ['A','B','C','D','E']);
    assert.ok('ABCDE'.includes(q.correctAnswer));
    assert.ok(q.statement.length > 10);
    assert.ok(q.explanation.length > 20);
  });
});
test('gabarito da base autoral original (amostra)', () => {
  const byId = Object.fromEntries(Q.map(q => [q.id, q]));
  const g = {1:'B',9:'C',13:'E',32:'C',36:'A',43:'E',50:'E'};
  for (const k in g) assert.equal(byId[k].correctAnswer, g[k]);
});
test('gabarito oficial ENEM 2020 (amostra dos cadernos anexados)', () => {
  const byId = Object.fromEntries(Q.map(q => [q.id, q]));
  const g = {1001:'A',1002:'A',1003:'E',1004:'D',1005:'C',1046:'D',1090:'D',
    3091:'C',3092:'E',3093:'D',3094:'B',3095:'D',3115:'A',3180:'C'};
  for (const k in g) assert.equal(byId[k].correctAnswer, g[k], `questão ${k}`);
});
test('tudo certo = 100%', () => {
  const a = {}; Q.forEach(q => a[q.id] = q.correctAnswer);
  const r = G.grade(Q, ids, a); assert.equal(r.correct, Q.length); assert.equal(r.percent, 100);
});
test('em branco não conta como acerto; percentual sobre o tamanho do simulado', () => {
  const subset = Q.slice(0, 50), chosen = subset.map(q => q.id), a = {};
  subset.slice(0, 35).forEach(q => a[q.id] = q.correctAnswer);
  subset.slice(35, 47).forEach(q => a[q.id] = q.correctAnswer === 'A' ? 'B' : 'A');
  const r = G.grade(subset, chosen, a);
  assert.deepEqual([r.correct, r.wrong, r.blank, r.percent], [35, 12, 3, 70]);
});
test('embaralhar a ordem não altera a correção', () => {
  const a = {}; Q.forEach(q => a[q.id] = q.correctAnswer);
  assert.equal(G.grade(Q, G.shuffle(ids), a).correct, Q.length);
});
test('novos simulados priorizam questões inéditas e não repetem questão dentro da sessão', () => {
  const seen = Q.slice(0, 80).map(q => q.id);
  const selected = G.selectFresh(Q, seen, 50);
  assert.equal(selected.length, 50);
  assert.equal(new Set(selected).size, 50);
  assert.equal(selected.filter(id => seen.includes(id)).length, 0);
});
test('se restarem menos inéditas que o tamanho solicitado, completa com questões anteriores sem duplicar', () => {
  const seen = Q.slice(0, Q.length - 5).map(q => q.id);
  const selected = G.selectFresh(Q, seen, 50);
  assert.equal(selected.length, 50);
  assert.equal(new Set(selected).size, 50);
  assert.equal(selected.filter(id => !seen.includes(id)).length, 5);
});
