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
  const api = { grade, shuffle };
  if (typeof module !== 'undefined') module.exports = api; else root.Grading = api;
})(typeof window !== 'undefined' ? window : globalThis);
