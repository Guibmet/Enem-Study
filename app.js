(function(){
'use strict';
const Q=window.QUESTIONS,G=window.Grading,KEY='enemstudy.v1',L='ABCDE';
const byId=Object.fromEntries(Q.map(q=>[q.id,q]));
const AREAS=[...new Set(Q.map(q=>q.area))];
const questionIdentity=q=>q.source&&q.sourcePdf&&q.sourceQuestion!=null?`${q.source}|${q.sourcePdf}|${q.sourceQuestion}`:`id:${q.id}`;
const UNIQUE_Q_COUNT=new Set(Q.map(questionIdentity)).size;
let S={cur:null,attempts:[],review:{},theme:'',prefs:{shuffleQ:false,shuffleA:false,timer:true}};
let mem=false,view='home',att=null,onlyWrong=false,rvFilter='all',rv={},warn='';
const $=s=>document.querySelector(s),app=$('#app');
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function load(){try{const r=localStorage.getItem(KEY);if(r)S=Object.assign(S,JSON.parse(r));}catch(e){mem=true;}}
function save(){if(S.cur){S.cur.acc=elapsed();S.cur.t0=Date.now();}try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){mem=true;}}
function elapsed(){return S.cur?(S.cur.acc||0)+(Date.now()-S.cur.t0):0}
const fmt=ms=>{const s=Math.floor(ms/1000);return[Math.floor(s/3600),Math.floor(s/60)%60,s%60].map((n,i)=>i?String(n).padStart(2,'0'):n).join(':')};
const last=()=>S.attempts[S.attempts.length-1];
const wrongIds=a=>a?a.ids.filter(i=>a.results[i]!=='correct'):[];
function freshIds(count){return G.selectFresh(Q,S.attempts.flatMap(a=>a.ids||[]),count)}
function correctEver(){const keys=new Set();S.attempts.forEach(a=>a.ids.forEach(i=>{if(a.results[i]==='correct'&&byId[i])keys.add(questionIdentity(byId[i]))}));Object.keys(S.review).forEach(i=>{if(S.review[i].ok&&byId[+i])keys.add(questionIdentity(byId[+i]))});return new Set(Q.filter(q=>keys.has(questionIdentity(q))).map(q=>q.id))}
function uniqueIds(ids){const used=new Set();return ids.filter(i=>{const key=questionIdentity(byId[i]);if(used.has(key))return false;used.add(key);return true})}
function start(ids,mode){
  if(!ids.length){warn='Não há questões para este modo ainda.';return go('home')}
  const p=S.prefs;if(p.shuffleQ)ids=G.shuffle(ids);
  const perm={};ids.forEach(i=>perm[i]=p.shuffleA?G.shuffle(L.split('')):L.split(''));
  S.cur={ids,perm,answers:{},flags:{},idx:0,acc:0,t0:Date.now(),mode,timerOn:p.timer};save();go('quiz');
}
function go(v,opt){view=v;warn=v==='home'?warn:'';if(opt!==undefined)att=opt;render();window.scrollTo(0,0)}
function altsHtml(q,perm,sel,mode,pick){ // mode: play | show
  return perm.map((k,pos)=>{const l=L[pos];let c='',tag='';
    if(mode==='show'){if(k===q.correctAnswer){c='ok';tag='Correta'}else if(k===sel){c='bad';tag='Sua resposta (incorreta)'}
      if(k===q.correctAnswer&&k===sel)tag='Sua resposta (correta)'}
    const chk=mode==='play'?` role="radio" aria-checked="${sel===k}" data-k="${k}"`:` disabled`;
    return`<button class="alt ${c}"${chk} aria-label="Alternativa ${l}: ${esc(q.alternatives[k])}"><b>${l})</b><span>${esc(q.alternatives[k])}</span><span class="tag">${tag}</span></button>`}).join('')}
function render(){
  $('#timer').textContent='';
  ({home,quiz,results,answers,review})[view]();
}
function home(){
  const a=last(),c=S.cur,w=wrongIds(a),pend=Q.length-correctEver().size,areaOpts=AREAS.map(x=>`<option>${esc(x)}</option>`).join('');
  const countOpts=[10,20,30,50,90,120,150,180,200,240,300,350,400].filter(n=>n<UNIQUE_Q_COUNT).map(n=>`<option value="${n}" ${n===50?'selected':''}>${n}</option>`).join('')+`<option value="${UNIQUE_Q_COUNT}">Todas as inéditas (${UNIQUE_Q_COUNT})</option>`;
  const seen=new Set(S.attempts.flatMap(x=>x.ids||[])).size;
  app.innerHTML=`<h1>ENEM Study</h1><p>Banco com ${Q.length} entradas em ${AREAS.length} áreas: 50 questões autorais, 137 questões textuais do ENEM 2020 e 130 questões textuais do ENEM 2021. Há ${UNIQUE_Q_COUNT} questões de origem distintas, contando versões em inglês e espanhol como a mesma questão para evitar duplicatas no sorteio.</p>
  <p class="meta">Aqui é um ambiente exclusivamente focado para o ENEM.</p>
  ${warn?`<p class="card" role="alert">${esc(warn)}</p>`:''}${mem?'<p class="card" role="alert">O armazenamento local está indisponível: seu progresso não será salvo ao fechar a página.</p>':''}
  <div class="card"><div class="row">
   <button class="btn" id="b-new">Começar simulado</button>
   <button class="btn ghost" id="b-cont" ${c?'':'disabled'}>Continuar de onde parei${c?` (${Object.keys(c.answers).length}/${c.ids.length})`:''}</button>
   <button class="btn ghost" id="b-rev" ${w.length?'':'disabled'}>Revisar questões erradas</button></div>
   <h2>Opções da nova tentativa</h2>
   <label>Modo: <select id="mode"><option value="random">Simulado aleatório (quantidade escolhida)</option><option value="all">Banco completo (${Q.length} questões)</option><option value="wrong">Só os erros da última tentativa (${w.length})</option><option value="pend">Ainda não acertadas (${pend})</option><option value="area">Por área do conhecimento</option></select></label>
   <label id="countw">Quantidade de questões: <select id="count">${countOpts}</select></label>
   <label id="areaw" hidden>Área: <select id="area">${areaOpts}</select></label>
   <div><label><input type="checkbox" id="sq" ${S.prefs.shuffleQ?'checked':''}> Embaralhar questões</label></div>
   <div><label><input type="checkbox" id="sa" ${S.prefs.shuffleA?'checked':''}> Embaralhar alternativas</label></div>
   <div><label><input type="checkbox" id="tm" ${S.prefs.timer?'checked':''}> Usar cronômetro</label></div>
   <p class="meta">O sistema evita repetir questões de simulados anteriores enquanto houver questões inéditas suficientes. Depois que todo o banco for utilizado, as questões menos recentes voltam a poder aparecer. As alternativas são corrigidas pela letra original, mesmo quando embaralhadas.</p>
   <h2>Cadernos oficiais do ENEM 2021</h2><p class="meta">As 130 questões restantes do ENEM 2021</p><ul><li><a href="assets/originals/2021_PV_impresso_D1_CD1.pdf" target="_blank" rel="noopener">Prova 2021 — 1º dia</a> · <a href="assets/originals/2021_GB_impresso_D1_CD1.pdf" target="_blank" rel="noopener">Gabarito 1º dia</a></li><li><a href="assets/originals/2021_PV_impresso_D2_CD5.pdf" target="_blank" rel="noopener">Prova 2021 — 2º dia</a> · <a href="assets/originals/2021_GB_impresso_D2_CD5.pdf" target="_blank" rel="noopener">Gabarito 2º dia</a></li></ul>
   <p class="meta">Você já praticou ${seen} questões diferentes em tentativas concluídas.</p></div>
  ${a?`<div class="card"><h2>Última tentativa</h2><p>${a.correct} acertos, ${a.wrong} erros, ${a.blank} em branco: <b>${a.percent}%</b> (${new Date(a.date).toLocaleString('pt-BR')}). Total de tentativas: ${S.attempts.length}.</p><button class="btn ghost" id="b-last">Ver resultado</button></div>`:''}
  <div class="card"><h2>Dados</h2><p class="meta">Tudo é salvo no localStorage deste navegador e deste aparelho; não há sincronização automática. Use exportar/importar para levar o histórico a outro dispositivo.</p>
  <div class="row"><button class="btn ghost" id="b-exp">Exportar histórico (JSON)</button><label class="btn ghost">Importar<input type="file" id="b-imp" accept="application/json" class="sr"></label><button class="btn ghost" id="b-del">Apagar histórico</button></div></div>`;
  const pr=()=>{S.prefs={shuffleQ:$('#sq').checked,shuffleA:$('#sa').checked,timer:$('#tm').checked};save()};
  ['#sq','#sa','#tm'].forEach(s=>$(s).onchange=pr);
  const updateMode=()=>{const m=$('#mode').value;$('#areaw').hidden=m!=='area';$('#countw').hidden=m!=='random'};
  $('#mode').onchange=updateMode;updateMode();
  $('#b-new').onclick=()=>{const m=$('#mode').value;pr();
    if(S.cur&&!confirm('Há um simulado em andamento. Descartá-lo e começar um novo?'))return;
    if(m==='random'){start(freshIds(Number($('#count').value)),'random');return}
    const all=Q.map(q=>q.id);
    start(m==='all'?all:m==='wrong'?wrongIds(a):m==='pend'?uniqueIds(all.filter(i=>!correctEver().has(i))):uniqueIds(all.filter(i=>byId[i].area===$('#area').value)),m)};
  $('#b-cont').onclick=()=>{S.cur.t0=Date.now();go('quiz')};
  $('#b-rev').onclick=()=>go('review');
  if($('#b-last'))$('#b-last').onclick=()=>go('results',S.attempts.length-1);
  $('#b-exp').onclick=()=>{const u=URL.createObjectURL(new Blob([JSON.stringify(S,null,1)],{type:'application/json'}));const l=document.createElement('a');l.href=u;l.download='enem-study-historico.json';l.click();URL.revokeObjectURL(u)};
  $('#b-imp').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(t=>{const d=JSON.parse(t);if(!Array.isArray(d.attempts))throw 0;S=Object.assign(S,d);save();warn='Histórico importado.';go('home')}).catch(()=>{warn='Arquivo inválido.';go('home')})};
  $('#b-del').onclick=()=>modal('<h2>Apagar histórico?</h2><p>Todas as tentativas, revisões e o simulado em andamento serão removidos deste navegador. Isso não pode ser desfeito.</p>','Apagar tudo',()=>{S.cur=null;S.attempts=[];S.review={};save();go('home')});
}
function modal(html,okText,ok){const m=$('#modal');m.innerHTML=`<div>${html}<div class="row"><button class="btn" id="m-ok">${okText}</button><button class="btn ghost" id="m-no">Cancelar</button></div></div>`;m.hidden=false;$('#m-no').focus();
  $('#m-no').onclick=()=>m.hidden=true;$('#m-ok').onclick=()=>{m.hidden=true;ok()}}
function quiz(){
  const c=S.cur;if(!c)return go('home');
  const id=c.ids[c.idx],q=byId[id],n=Object.keys(c.answers).length;
  const grid=c.ids.map((i,x)=>`<button data-i="${x}" class="${c.answers[i]?'done':''} ${c.flags[i]?'flag':''} ${x===c.idx?'cur':''}" aria-label="Questão ${x+1}${c.answers[i]?', respondida':', em branco'}${c.flags[i]?', marcada para revisão':''}">${x+1}</button>`).join('');
  app.innerHTML=`<p class="meta">Questão ${c.idx+1} de ${c.ids.length} · ${n} respondidas</p><div class="bar" aria-hidden="true"><i style="width:${n/c.ids.length*100}%"></i></div>
  <div class="card"><p class="meta">${esc(q.area)} · ${esc(q.subject)} ${q.source?`· ${esc(q.source)} · questão original ${q.sourceQuestion}${q.language?` (${q.language})`:``}`:`· Questão autoral`}</p><h2 id="st">${esc(q.statement)}</h2>
  ${q.sourcePdf?`<p class="meta"><a href="${esc(q.sourcePdf)}#page=${q.sourcePage}" target="_blank" rel="noopener">Abrir página original do caderno (PDF)</a></p>`:''}
  ${q.source==='ENEM 2021 oficial'?'<p class="meta">Transcrição por OCR: confira o PDF se houver dúvida, especialmente em gráficos, fórmulas e alternativas.</p>':''}
  ${q.ocrNeedsVisualReview?'<p class="meta">O enunciado não foi capturado integralmente pelo OCR; consulte o PDF antes de responder.</p>':''}
  <div role="radiogroup" aria-labelledby="st">${altsHtml(q,c.perm[id],c.answers[id],'play')}</div></div>
  <div class="row"><button class="btn ghost" id="prev" ${c.idx?'':'disabled'}>Anterior</button><button class="btn ghost" id="next" ${c.idx<c.ids.length-1?'':'disabled'}>Próxima</button>
  <button class="btn ghost" id="flag" aria-pressed="${!!c.flags[id]}">${c.flags[id]?'Desmarcar revisão':'Marcar para revisão'}</button><button class="btn" id="fin">Finalizar simulado</button></div>
  <div class="card"><h3>Painel de questões</h3><div class="grid">${grid}</div><p class="meta">Destacadas: respondidas. ⚑ marcadas para revisão.</p></div>`;
  app.querySelectorAll('.alt').forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(c.answers[id]===k)delete c.answers[id];else c.answers[id]=k;save();quiz();const f=app.querySelector(`.alt[data-k="${k}"]`);f&&f.focus()});
  app.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{c.idx=+b.dataset.i;save();quiz();window.scrollTo(0,0)});
  $('#prev').onclick=()=>{c.idx--;save();quiz();window.scrollTo(0,0)};$('#next').onclick=()=>{c.idx++;save();quiz();window.scrollTo(0,0)};
  $('#flag').onclick=()=>{c.flags[id]=!c.flags[id];if(!c.flags[id])delete c.flags[id];save();quiz()};
  $('#fin').onclick=()=>modal(`<h2>Finalizar simulado?</h2><p>Respondidas: <b>${n}</b>. Em branco: <b>${c.ids.length-n}</b>.</p><p>A correção só será exibida depois de finalizar.</p>`,'Finalizar',finish);
}
function finish(){
  const c=S.cur,r=G.grade(Q,c.ids,c.answers),secs=Math.round(elapsed()/1000);
  S.attempts.push(Object.assign({date:Date.now(),mode:c.mode,ids:c.ids,answers:c.answers,perm:c.perm,secs:c.timerOn?secs:null},r));S.cur=null;save();go('results',S.attempts.length-1);
}
function results(){
  const a=S.attempts[att];if(!a)return go('home');
  const ar=Object.entries(a.areas).map(([k,v])=>`<p>${esc(k)}: ${v.correct}/${v.total} (${Math.round(v.correct/v.total*100)}%)<span class="bar"><i style="width:${v.correct/v.total*100}%"></i></span></p>`).join('');
  const sub={};a.ids.forEach(i=>{const s=sub[byId[i].subject]=sub[byId[i].subject]||[0,0];s[1]++;if(a.results[i]==='correct')s[0]++});
  app.innerHTML=`<h1>Resultado</h1><div class="card"><div class="big">${a.percent}%</div><div class="bar" aria-hidden="true"><i style="width:${a.percent}%"></i></div>
  <p class="meta">Aproveitamento sobre ${a.total} questões; em branco não conta como acerto. Não é nota oficial do ENEM nem nota TRI.</p>
  <div class="stats"><div>Questões<br><b>${a.total}</b></div><div>Acertos<br><b>${a.correct}</b></div><div>Erros<br><b>${a.wrong}</b></div><div>Em branco<br><b>${a.blank}</b></div>${a.secs!=null?`<div>Tempo<br><b>${fmt(a.secs*1000)}</b></div>`:''}</div></div>
  <div class="card"><h2>Por área</h2>${ar}</div>
  <div class="card"><h2>Por assunto</h2><p class="meta">${Object.entries(sub).map(([k,v])=>`${esc(k)}: ${v[0]}/${v[1]}`).join(' · ')}</p></div>
  <div class="row"><button class="btn" id="ans">Ver respostas corretas</button><button class="btn ghost" id="rev">Revisar respostas</button><button class="btn ghost" id="again">Novo simulado aleatório (50 questões)</button><button class="btn ghost" id="redo" ${wrongIds(a).length?'':'disabled'}>Refazer somente as questões erradas</button><button class="btn ghost" id="hm">Voltar ao início</button></div>`;
  $('#ans').onclick=()=>go('answers',att);$('#rev').onclick=()=>go('review');$('#hm').onclick=()=>go('home');
  $('#again').onclick=()=>start(freshIds(50),'random');$('#redo').onclick=()=>start(wrongIds(a),'wrong');
}
function answers(){
  const a=S.attempts[att];if(!a)return go('home');
  const list=a.ids.filter(i=>!onlyWrong||a.results[i]!=='correct');
  const grid=a.ids.map((i,x)=>{const s=a.results[i];return`<button class="${s==='correct'?'ok':s==='wrong'?'bad':'blank'}" data-q="${i}" aria-label="Questão ${x+1}: ${s==='correct'?'certa':s==='wrong'?'errada':'em branco'}">${x+1}${s==='correct'?'✓':s==='wrong'?'✗':'–'}</button>`}).join('');
  const lbl=(q,k)=>`${L[a.perm[q.id].indexOf(k)]}) ${esc(q.alternatives[k])}`;
  app.innerHTML=`<h1>Respostas corretas</h1><div class="row"><button class="btn ghost" id="back">Voltar ao resultado</button><button class="btn ghost" id="flt" aria-pressed="${onlyWrong}">${onlyWrong?'Mostrar todas':'Mostrar só erradas e em branco'}</button></div>
  <div class="grid">${grid}</div>`+list.map(i=>{const q=byId[i],s=a.results[i],u=a.answers[i];
   const why=u&&s==='wrong'&&q.alternativeExplanations[u];
   return`<section class="card" id="q${i}"><p class="meta">Questão ${a.ids.indexOf(i)+1} · ${esc(q.subject)}</p><h2>${esc(q.statement)}</h2>${q.sourcePdf?`<p class="meta"><a href="${esc(q.sourcePdf)}#page=${q.sourcePage}" target="_blank" rel="noopener">Abrir página original do caderno (PDF)</a></p>`:''}
   <p><b>${s==='correct'?'✓ Você acertou.':s==='wrong'?'✗ Resposta incorreta.':'– Em branco.'}</b> Sua resposta: ${u?lbl(q,u):'nenhuma'}.<br>Resposta correta: ${lbl(q,q.correctAnswer)}.</p>
   <div role="group" aria-label="Alternativas">${altsHtml(q,a.perm[i],u,'show')}</div>
   <div class="exp"><b>Resolução:</b> ${esc(q.explanation)}</div>
   ${s==='wrong'?`<p><b>Por que sua alternativa está errada?</b> ${why?esc(why):'Ela não corresponde ao raciocínio da resolução acima: confira o enunciado e compare com a alternativa correta.'}</p>`:''}
   ${Object.entries(q.alternativeExplanations).filter(([k])=>k!==u).map(([k,t])=>`<p class="meta">Outra alternativa (${lbl(q,k)}): ${esc(t)}</p>`).join('')}</section>`}).join('');
  $('#back').onclick=()=>go('results',att);$('#flt').onclick=()=>{onlyWrong=!onlyWrong;answers()};
  app.querySelectorAll('.grid button').forEach(b=>b.onclick=()=>{const e=$('#q'+b.dataset.q);e?e.scrollIntoView():(onlyWrong=false,answers(),$('#q'+b.dataset.q).scrollIntoView())});
}
function review(){
  const a=last();if(!a)return go('home');
  let ids=wrongIds(a);if(rvFilter!=='all')ids=ids.filter(i=>a.results[i]===rvFilter);
  const fixed=wrongIds(a).filter(i=>S.review[i]&&S.review[i].ok).length;
  app.innerHTML=`<h1>Revisar erros</h1><p>Última tentativa: ${wrongIds(a).length} questões erradas ou em branco. Já corrigidas na revisão: <b>${fixed}</b>. O histórico original é mantido.</p>
  <div class="row"><button class="btn ghost" id="hm">Voltar</button><select id="f" aria-label="Filtro"><option value="all">Erradas e em branco</option><option value="wrong">Só erradas</option><option value="blank">Só em branco</option></select><button class="btn" id="all">Refazer todas as erradas</button></div>`+
  ids.map(i=>{const q=byId[i],u=a.answers[i],st=rv[i]||{},nm=k=>k?`${L[a.perm[i].indexOf(k)]}) ${esc(q.alternatives[k])}`:'nenhuma';
   const body=st.open?`<div role="radiogroup" aria-label="Escolha">${L.split('').map((k,p)=>`<button class="alt" role="radio" aria-checked="${st.pick===k}" data-i="${i}" data-k="${k}" ${st.checked?'disabled':''}><b>${L[p]})</b><span>${esc(q.alternatives[k])}</span></button>`).join('')}</div>
     ${st.checked?`<p><b>${st.pick===q.correctAnswer?'✓ Correto!':'✗ Incorreto.'}</b> Resposta correta: ${q.correctAnswer}) ${esc(q.alternatives[q.correctAnswer])}</p><div class="exp">${esc(q.explanation)}</div>`:`<button class="btn" data-chk="${i}" ${st.pick?'':'disabled'}>Conferir resposta</button>`}`
     :`<p>Sua resposta anterior: ${nm(u)}. Correta: ${nm(q.correctAnswer)}.</p><div class="exp">${esc(q.explanation)}</div><button class="btn ghost" data-try="${i}">Tentar novamente</button>`;
   return`<section class="card"><p class="meta">${esc(q.subject)} ${S.review[i]&&S.review[i].ok?'· ✓ já refeita corretamente':''}</p><h2>${esc(q.statement)}</h2>${q.sourcePdf?`<p class="meta"><a href="${esc(q.sourcePdf)}#page=${q.sourcePage}" target="_blank" rel="noopener">Abrir página original do caderno (PDF)</a></p>`:''}${body}</section>`}).join('');
  $('#hm').onclick=()=>go('home');$('#f').value=rvFilter;$('#f').onchange=e=>{rvFilter=e.target.value;review()};
  $('#all').onclick=()=>start(wrongIds(a),'wrong');
  app.querySelectorAll('[data-try]').forEach(b=>b.onclick=()=>{rv[b.dataset.try]={open:true};review()});
  app.querySelectorAll('.alt').forEach(b=>b.onclick=()=>{rv[b.dataset.i].pick=b.dataset.k;review()});
  app.querySelectorAll('[data-chk]').forEach(b=>b.onclick=()=>{const i=b.dataset.chk;rv[i].checked=true;S.review[i]={ok:rv[i].pick===byId[i].correctAnswer,date:Date.now()};save();review()});
}
setInterval(()=>{if(view==='quiz'&&S.cur&&S.cur.timerOn)$('#timer').textContent='⏱ '+fmt(elapsed())},1000);
$('#logo').onclick=e=>{e.preventDefault();go('home')};
$('#theme').onclick=()=>{S.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=S.theme;save()};
load();
if(S.theme)document.documentElement.dataset.theme=S.theme;else if(matchMedia('(prefers-color-scheme: dark)').matches)document.documentElement.dataset.theme='dark';
if(S.cur)S.cur.t0=Date.now();
render();
})();
