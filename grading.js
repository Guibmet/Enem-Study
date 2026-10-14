(function (root) {
  // answers: {id: letraOriginal}. Letras sempre se referem às alternativas originais (seguro com embaralhamento).
  function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  function grade(questions, ids, answers) {
    const byId = Object.fromEntries(questions.map(q => [q.id, q]));
    let correct = 0, wrong = 0, blank = 0; const areas = {}, results = {};
    ids.forEach(id => {
      const q = byId[id], a = answers[id];
      const st = !a ? 'blank' : a === q.correctAnswer ? 'correct' : 'wrong';
      results[id] = st; if (st === 'correct') correct++; else if (st === 'wrong') wrong++; else blank++;
      const s = areas[q.area] = areas[q.area] || { total: 0, correct: 0 }; s.total++; if (st === 'correct') s.correct++;
    });
    const total = ids.length;
    return { total, correct, wrong, blank, percent: total ? Math.round(correct / total * 1000) / 10 : 0, areas, results };
  }
  // Prioriza questões ainda não vistas em tentativas concluídas. Só reutiliza
  // questões anteriores quando o banco restante não é suficiente para o tamanho pedido.
  function selectFresh(questions, seenIds, count) {
    const byId = Object.fromEntries(questions.map(q => [Number(q.id), q]));
    const seen = new Set((seenIds || []).map(Number));
    // Idiomas alternativos da mesma questão oficial contam como uma única questão
    // para o sorteio, evitando colocar a versão inglesa e a espanhola no mesmo simulado.
    const identity = q => q && q.source && q.sourcePdf && q.sourceQuestion != null
      ? `${q.source}|${q.sourcePdf}|${q.sourceQuestion}` : `id:${q.id}`;
    const groups = new Map();
    questions.forEach(q => {
      const key = identity(q);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(q);
    });
    const seenKeys = new Set([...seen].map(id => byId[id]).filter(Boolean).map(identity));
    const freshGroups = shuffle([...groups.entries()].filter(([key]) => !seenKeys.has(key)));
    const repeatedGroups = shuffle([...groups.entries()].filter(([key]) => seenKeys.has(key)));
    const chooseOne = ([, variants]) => shuffle(variants)[0].id;
    const fresh = freshGroups.map(chooseOne);
    const repeated = repeatedGroups.map(chooseOne);
    const limit = Math.min(groups.size, Math.max(0, Number(count) || 0));
    return fresh.concat(repeated).slice(0, limit);
  }
  const api = { grade, shuffle, selectFresh };
  if (typeof module !== 'undefined') module.exports = api; else root.Grading = api;
})(typeof window !== 'undefined' ? window : globalThis);
