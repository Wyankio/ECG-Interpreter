import {LEADS} from '../algorithms/criteria.js';

const SAMPLE_RATE = 500;
const SAMPLES_PER_LEAD = 500;
const stages = [
  ['Irama','Median beat tidak memadai untuk menilai keteraturan R-R atau aritmia.'],
  ['Frekuensi','Median beat tidak boleh dipakai sebagai pengganti rhythm strip 10 detik untuk menghitung frekuensi secara klinis.'],
  ['Gelombang P','Nilai lead II dan V1: keberadaan, durasi, amplitudo, dan morfologi P.'],
  ['PR / AV block','Ukur awal P sampai awal QRS bila batas gelombang dapat diidentifikasi.'],
  ['QRS','Nilai morfologi QRS di 12 lead dan durasinya.'],
  ['Axis','Mulai dengan polaritas QRS pada lead I dan aVF; gunakan lead II untuk memperjelas kasus borderline.'],
  ['Q patologis','Cari Q yang memenuhi kriteria patologis pada lead yang relevan dan kontigu, sambil mempertimbangkan pengecualian fisiologis.'],
  ['Lebar QRS','QRS <120 ms dianggap narrow; ≥120 ms wide.'],
  ['Transition / BBB','Nilai progresi R V1-V6 dan pola RBBB/LBBB.'],
  ['LVH / RVH','Gunakan voltage bersama temuan morfologi pendukung, bukan voltage saja.'],
  ['Aritmia','Untuk PAC/PVC/AF/VT/VF diperlukan sinyal ritme penuh; median beat tidak cukup.']
];

let cases=[], idx=0, stage=0, leadData=[];
const $=id=>document.getElementById(id);

async function loadCases(){
  cases=await fetch('./data/cases.json').then(r=>r.json());
  populateSelect();
  await loadCase(0);
}
function populateSelect(){
  const s=$('caseSelect');
  s.innerHTML=cases.map((c,i)=>`<option value="${i}">${String(i+1).padStart(2,'0')} · ${c.ecg_med_record}</option>`).join('');
}
function sex(code){return code===1?'M':code===0?'F':'—'}
function labels(c){return ['STEMI','NSTEMI','OMI','UA','VF_VT','Paced','AMI'].filter(k=>c[k]===1)}
async function loadCase(i){
  idx=Number(i); stage=0; const c=cases[idx];
  $('caseTitle').textContent=c.ecg_med_record;
  $('caseMeta').textContent=`${c.Patient_id} · ${c.age ?? '—'} th · ${sex(c.gender)}`;
  $('record').innerHTML=`Record: ${c.ecg_med_record}<br>Patient: ${c.Patient_id}<br>Age: ${c.age ?? '—'}<br>Sex: ${sex(c.gender)}<br>Samples/lead: ${SAMPLES_PER_LEAD}<br>Sampling: ${SAMPLE_RATE} Hz`;
  leadData=await readMed(`./data/med/${c.ecg_med_record}`);
  drawAll(); renderWork();
}
async function readMed(url){
  const buf=await fetch(url).then(r=>{if(!r.ok)throw new Error('File ECG tidak ditemukan');return r.arrayBuffer()});
  const a=new Int16Array(buf);
  if(a.length!==LEADS.length*SAMPLES_PER_LEAD) throw new Error(`Format .med tidak sesuai: ${a.length} int16`);
  // File .med sample ini tersusun sample-major: I, II, III, aVR, aVL, aVF, V1-V6 berulang pada tiap titik waktu.
  const m=Array.from({length:12},()=>new Float32Array(SAMPLES_PER_LEAD));
  for(let t=0;t<SAMPLES_PER_LEAD;t++) for(let l=0;l<12;l++) m[l][t]=a[t*12+l];
  return m;
}
function drawAll(){
  const host=$('ecg'); host.innerHTML='';
  LEADS.forEach((name,i)=>{
    const d=document.createElement('div'); d.className='lead';
    d.innerHTML=`<div class="leadhead"><strong>${name}</strong><span>median · 500 Hz</span></div><canvas></canvas>`;
    host.appendChild(d); drawLead(d.querySelector('canvas'),leadData[i]);
  });
}
function drawLead(canvas,arr){
  const d=devicePixelRatio||1, w=Math.max(240,canvas.clientWidth)*d, h=118*d; canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext('2d'); ctx.clearRect(0,0,w,h);
  const small=4*d, big=20*d;
  ctx.strokeStyle='#f2ece4'; ctx.lineWidth=1;
  for(let x=0;x<=w;x+=small){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<=h;y+=small){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  ctx.strokeStyle='#eadfd5';
  for(let x=0;x<=w;x+=big){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke()}
  for(let y=0;y<=h;y+=big){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  const mean=arr.reduce((a,b)=>a+b,0)/arr.length;
  const max=Math.max(...arr.map(v=>Math.abs(v-mean)))||1;
  const scale=h*0.38/max;
  ctx.strokeStyle='#22231f'; ctx.lineWidth=1.25*d; ctx.beginPath();
  arr.forEach((v,i)=>{const x=i/(arr.length-1)*w,y=h/2-(v-mean)*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}); ctx.stroke();
}
function renderWork(){
  $('steps').innerHTML=stages.map((s,i)=>`<span class="step ${i===stage?'active':''}">${i+1}. ${s[0]}</span>`).join('');
  const [title,guide]=stages[stage];
  $('question').innerHTML=`<h2>${title}</h2><p>${guide}</p><button id="hint">Tampilkan petunjuk</button><div id="result"></div>`;
  $('hint').onclick=()=>showHint();
}
function showHint(){
  const c=cases[idx]; const [title,guide]=stages[stage]; let extra='';
  if(stage===0||stage===1) extra='<div class="small">Catatan data: file .med adalah median waveform, bukan rekaman 10 detik penuh. Karena itu modul rhythm dan rate ditahan sampai raw WFDB tersedia.</div>';
  $('result').innerHTML=`<div class="result"><strong>Petunjuk:</strong> ${guide}${extra}<br><br>${stage<stages.length-1?'<button id="next">Lanjut →</button>':'<button id="reveal">Tampilkan label dataset</button>'}</div>`;
  if(stage<stages.length-1) $('next').onclick=()=>{stage++;renderWork()};
  else $('reveal').onclick=()=>reveal(c);
}
function reveal(c){
  const ls=labels(c); $('result').innerHTML=`<div class="result"><strong>Label dataset</strong><br>${ls.length?ls.map(x=>`<span class="tag">${x}</span>`).join(''):'Tidak ada label utama pada sample ini.'}<p class="small">Label di atas adalah label klinis/dataset. Label tersebut tidak berarti seluruh diagnosis dapat diturunkan hanya dari median ECG ini.</p></div>`;
}
$('caseSelect').addEventListener('change',e=>loadCase(e.target.value));
$('random').onclick=()=>loadCase(Math.floor(Math.random()*cases.length));
loadCases().catch(err=>{console.error(err);$('question').innerHTML=`<h2>Gagal memuat ECG</h2><p>${err.message}</p>`});
