// Teste de fumaça com DOM simulado: percorre início → simulado → finalizar → resultados → respostas → revisão.
const test=require('node:test'),assert=require('node:assert'),fs=require('fs'),path=require('path');
test('fluxo completo renderiza sem exceções',()=>{
  const els={};const mk=()=>({dataset:{},style:{},hidden:false,value:'all',checked:false,focus(){},click(){},querySelectorAll:()=>[],set innerHTML(v){this._h=v},get innerHTML(){return this._h||''},onclick:null,onchange:null,textContent:''});
  const el=s=>els[s]=els[s]||mk();
  const store={};const Q=require('../questions.js');
  const ids=Q.map(q=>q.id),perm={};ids.forEach(i=>perm[i]='ABCDE'.split(''));
  const answers={};ids.slice(0,40).forEach(i=>answers[i]=i%5===0?(Q[i-1].correctAnswer==='A'?'B':'A'):Q[i-1].correctAnswer);
  store['enemstudy.v1']=JSON.stringify({cur:{ids,perm,answers,flags:{3:true},idx:2,acc:5000,t0:Date.now(),mode:'all',timerOn:true},attempts:[],review:{}});
  global.window={scrollTo(){},QUESTIONS:Q,Grading:require('../grading.js')};global.matchMedia=()=>({matches:false});
  global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
  global.document={documentElement:{dataset:{}},querySelector:el,querySelectorAll:()=>[],createElement:mk};
  global.confirm=()=>true;global.setInterval=()=>0;
  eval(fs.readFileSync(path.join(__dirname,'../app.js'),'utf8').replace(/window\.QUESTIONS/,'QUESTIONS_').replace("const Q=QUESTIONS_,G=window.Grading","const Q=window.QUESTIONS,G=window.Grading"));
  el('#b-cont').onclick();assert.match(el('#app').innerHTML,/Questão 3 de 50/);
  el('#fin').onclick();assert.match(el('#modal').innerHTML,/Respondidas: <b>40<\/b>/);
  el('#m-ok').onclick();assert.match(el('#app').innerHTML,/Resultado/);
  const a=JSON.parse(store['enemstudy.v1']).attempts[0];assert.deepEqual([a.correct,a.wrong,a.blank,a.percent],[32,8,10,64]);
  el('#ans').onclick();assert.match(el('#app').innerHTML,/Resolução/);
  el('#back').onclick();el('#rev').onclick();assert.match(el('#app').innerHTML,/Revisar erros/);
  assert.match(el('#app').innerHTML,/Tentar novamente/);
});
