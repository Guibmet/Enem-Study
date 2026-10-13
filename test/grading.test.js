const test = require('node:test'), assert = require('node:assert');
const Q = require('../questions.js'), G = require('../grading.js');
const ids = Q.map(q => q.id);
test('50 questões, 5 alternativas, gabarito válido, explicação presente', () => {
  assert.equal(Q.length, 50);
  Q.forEach((q, i) => { assert.equal(q.id, i + 1); assert.deepEqual(Object.keys(q.alternatives), ['A','B','C','D','E']); assert.ok('ABCDE'.includes(q.correctAnswer)); assert.ok(q.explanation.length > 20); });
});
test('gabarito do PDF (amostra)', () => { const g = {1:'B',9:'C',13:'E',32:'C',36:'A',43:'E',50:'E'}; for (const k in g) assert.equal(Q[k-1].correctAnswer, g[k]); });
test('tudo certo = 100%', () => { const a = {}; Q.forEach(q => a[q.id] = q.correctAnswer); const r = G.grade(Q, ids, a); assert.equal(r.correct, 50); assert.equal(r.percent, 100); });
test('em branco não conta como acerto; percentual sobre 50', () => {
  const a = {}; Q.slice(0, 35).forEach(q => a[q.id] = q.correctAnswer); Q.slice(35, 47).forEach(q => a[q.id] = q.correctAnswer === 'A' ? 'B' : 'A');
  const r = G.grade(Q, ids, a); assert.deepEqual([r.correct, r.wrong, r.blank, r.percent], [35, 12, 3, 70]);
});
test('embaralhar a ordem não altera a correção', () => { const a = {}; Q.forEach(q => a[q.id] = q.correctAnswer); assert.equal(G.grade(Q, G.shuffle(ids), a).correct, 50); });
