const SAMPLE=`RECIFE LEGENDS 02/08/2026

INSCRIÇÕES
1- Vanderson Ribeiro + dobra
2-Douglas Henrique Marques + dobra
3-Izabel Marques Belarmino (1 ingresso plateia)
4-Clayton De lima (Rino) + 2 dobras
5- Romualdo Aragão da Silva Júnior + dobra
6- Karla Oliveira + 2 dobras
7- Édson Soares Ferreira + dobra
8-REBECA MOREIRA DA SILVA TORRES + dobra
9-Gleyce Kerolin + dobra
10- Gutemberg de Moura + dobra
11- Gabriel Araujo Lima + 2 dobras
12- Erisson Jean Pereira da Silva + dobra
13-Leandro Nascimento da Silva + 3 dobras
14-Vinicius Nascimento + 2 dobras
15- Tiago Neri + dobra
16-Wermerson Galdino Pacheco Silva + dobra
17-Dreiton Silva + dobra
18-Armando Patrício Gomes Neto + dobra
19-Danyllo Acioli + dobra
20-Victor Gabriel Santos + dobra
21-Filipe Cândido + dobra

PINTURA
1-Vanderson Ribeiro
2-Izabel Marques Belarmino
3-Clayton De lima (Rino)
4-Romualdo Aragão da Silva Júnior
5-Édson Soares Ferreira
6-REBECA MOREIRA DA SILVA TORRES
7-Karla Oliveira
8-Wermerson Galdino Pacheco Silva
9-Gleyce Kerolin
10-Gabriel Araujo Lima
11-Erisson Jean Pereira da Silva
12-Leandro Nascimento da Silva
13-Tiago Neri
14-Dreiton Silva
15-Armando Patrício Gomes Neto
16-Danyllo Acioli
17-Victor Gabriel Santos
18-Filipe Cândido

FOTOGRAFIA
1-Vanderson Ribeiro
2-Izabel Marques Belarmino
3-Clayton De lima (Rino) + dobra foto
4-Romualdo Aragão da Silva Júnior
5-Édson Soares Ferreira
6-REBECA MOREIRA DA SILVA TORRES
7-Karla Oliveira
8-Gleyce Kerolin
9-Erisson Jean Pereira da Silva
10-Leandro Nascimento da Silva
11-Vinicius Nascimento
12-Tiago Neri + dobra
13-Wesley Tavares
14-Wermerson Galdino Pacheco Silva
15-Dreiton Silva
16-Armando Patrício Gomes Neto
17-Danyllo Acioli
18-Victor Gabriel Santos
19-Filipe Cândido

INGRESSO BACKSTAGE
Elias Lucena
Atleta Vanderson Ribeiro (2 pulseiras) + 7 pulseiras Plateia
Atleta Clayton De lima (Rino) (+ 3 plateias)
Atleta Karla Oliveira + 1 plateia
Atleta Wesley Tavares (tem uma dobra de categoria no pix também)
Atleta Gleyce Kerolin
Atleta Gabriel Araujo Lima
Atleta Erisson Jean Pereira da Silva
Atleta Leandro Nascimento da Silva
Atleta Vinicius Nascimento
Atleta Tiago Neri
Atleta Wermerson Galdino Pacheco Silva
Atleta Dreiton Silva
Atleta Armando Patrício Gomes Neto
Atleta Danyllo Acioli
Atleta Victor Gabriel Santos
Atleta Filipe Cândido`;

let athletes=[],mode="services",logo="assets/img/logo.png";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const STORAGE_KEY='checkin-legends-state-v1',LISTS_KEY='checkin-legends-lists-v1',THEME_KEY='checkin-legends-theme';
let activeListId=null;
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({athletes,mode,logo,event:$('#event').value,date:$('#date').value,raw:$('#raw').value}))}catch(error){console.warn('Não foi possível salvar os dados localmente.',error)}}
function restoreState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(!saved)return false;athletes=Array.isArray(saved.athletes)?saved.athletes:[];mode=saved.mode||'services';logo=saved.logo||'assets/img/logo.png';$('#event').value=saved.event||'';$('#date').value=saved.date||'';$('#raw').value=saved.raw||'';$('#eventTitle').textContent=(saved.event||'Legends').toUpperCase();$$('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));renderRows();$('#quickPdf').disabled=!athletes.length;return true}catch(error){console.warn('Não foi possível restaurar os dados salvos.',error);return false}}
const key=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
function sectionOf(s){const k=key(s);if(/^inscricoes?$/.test(k))return"registered";if(k==="pintura")return"paint";if(k==="fotografia")return"photo";if(/^(ingresso )?backstage$/.test(k))return"backstage";return null}
function numberIn(s,re,fallback=1){const m=s.match(re);return m?Number(m[1]||fallback):0}
function parse(raw){const map=new Map();let section=null;raw.split(/\r?\n/).forEach(original=>{const line=original.trim();if(!line)return;const title=sectionOf(line);if(title){section=title;return}if(!section||/legends/i.test(line)&&/\d{2}\/\d{2}/.test(line))return;let cleaned=line.replace(/^\s*\d+\s*[-–.)]\s*/,"").trim(),hasAthletePrefix=section==="backstage"&&/^atleta\s+/i.test(cleaned);cleaned=cleaned.replace(/^atleta\s+/i,"").trim();if(!cleaned||/^\d+\s*[-–.)]?\s*$/.test(line))return;const noteStart=cleaned.search(/\s+(?:\+|\((?=\d|\+|tem)|-\s*dobra)/i),name=(noteStart>=0?cleaned.slice(0,noteStart):cleaned).trim(),note=noteStart>=0?cleaned.slice(noteStart):"";if(name.length<3)return;const id=key(name),a=map.get(id)||{id,name,registered:false,folds:0,paint:false,photo:false,photoFolds:0,backstage:0,audience:0,backstageLabel:false};if(section==="registered"){a.registered=true;a.folds=numberIn(note,/(\d+)\s*dobras?/i)||(/dobra/i.test(note)?1:0);a.audience=Math.max(a.audience,numberIn(note,/(\d+)\s*ingressos?\s*(?:de\s*)?plateia/i))}else if(section==="paint")a.paint=true;else if(section==="photo"){a.photo=true;a.photoFolds=numberIn(note,/(\d+)\s*dobras?/i)||(/dobra/i.test(note)?1:0)}else{a.backstageLabel=a.backstageLabel||hasAthletePrefix;a.backstage=numberIn(note,/(\d+)\s*pulseiras?(?!\s*plateia)/i)||1;a.audience=Math.max(a.audience,numberIn(note,/(\d+)\s*(?:pulseiras?\s*)?plateias?/i));if(/dobra de categoria/i.test(note)&&!a.folds)a.folds=1}map.set(id,a)});return[...map.values()].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR",{sensitivity:"base"}))}
function show(id){$$('.page').forEach(x=>x.classList.toggle('active',x.id===id));$$('.tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab===id))}
function renderRows(){const hasRows=athletes.length>0;$('#count').textContent=hasRows?`${athletes.length} pessoas identificadas · todos os campos podem ser alterados`:'Nenhuma lista importada';$('#warning').hidden=true;$('#warning').textContent='';$('#emptyState').hidden=hasRows;$('#tableWrap').hidden=!hasRows;$('#listActions').hidden=!hasRows;$('#athleteRows').innerHTML=athletes.map((a,i)=>`<tr><td><input class="name" data-i="${i}" data-f="name" value="${esc(a.name)}"></td><td><input class="num" type="number" min="0" data-i="${i}" data-f="folds" value="${a.folds}"></td><td><input type="checkbox" data-i="${i}" data-f="paint" ${a.paint?'checked':''}></td><td><input type="checkbox" data-i="${i}" data-f="photo" ${a.photo?'checked':''}></td><td><input class="num" type="number" min="0" data-i="${i}" data-f="backstage" value="${a.backstage}"></td><td><input class="num" type="number" min="0" data-i="${i}" data-f="audience" value="${a.audience}"></td></tr>`).join('')}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function head(){const event=esc($('#event').value.toUpperCase()),date=$('#date').value?new Date($('#date').value+'T12:00').toLocaleDateString('pt-BR'):'';return`<header class="print-head">${logo?`<img src="${logo}" alt="Logo">`:'<div class="print-brand"><b>NORDESTE</b><i>Legends</i></div>'}<h2>${event}</h2><p>${date}</p></header>`}
function documentHtml(){
  if(mode==='services'){
    const groups=[['INSCRIÇÕES + DOBRAS',a=>a.registered,a=>a.folds?` + ${a.folds===1?'dobra':a.folds+' dobras'}`:''],['PINTURA',a=>a.paint,()=> ''],['FOTOGRAFIA',a=>a.photo,a=>a.photoFolds?` + ${a.photoFolds} ${a.photoFolds===1?'dobra':'dobras'} de fotografia`:'' ],['INGRESSO BACKSTAGE',a=>a.backstage>0||a.audience>0,a=>[a.backstage>1&&`${a.backstage} pulseiras`,a.audience&&`${a.audience} plateia`].filter(Boolean).join(' + ')]];
    return groups.map(([title,filter,detail])=>`<article class="print-doc service-page">${head()}<section class="service-section"><h3>${title}</h3><div class="simple-list">${athletes.filter(filter).map(a=>`<div>${title==='INGRESSO BACKSTAGE'&&a.backstageLabel?'Atleta ':''}${esc(a.name)}${detail(a)?' '+detail(a):''}</div>`).join('')}</div></section></article>`).join('');
  }
  return`<article class="print-doc athlete-pages">${head()}${athletes.filter(a=>a.registered).map(a=>`<section class="athlete-card"><div class="athlete-name"><span>Atleta:</span><b>${esc(a.name)}</b></div><div class="card-row"><span>DOBRA</span><b>${a.folds?'SIM':''}</b><span>FOTOGRAFIA</span><b>${a.photo?'SIM':''}</b></div><div class="card-row"><span>PINTURA</span><b>${a.paint?'SIM':''}</b><span>INGRESSO BACKSTAGE</span><b>${a.backstage?'SIM':''}</b></div></section>`).join('')}</article>`;
}
function preview(){const html=documentHtml();$('#previewPaper').className='preview-paper';$('#previewPaper').innerHTML=html;$('#printArea').innerHTML=`<img class="print-watermark" src="assets/img/logo.png" alt="">${html}`;$('#previewLabel').textContent=`PRÉVIA · ${mode==='services'?'LISTAS POR SERVIÇO':'FICHAS DOS ATLETAS'}`}
const openModal=id=>{$('#'+id).hidden=false},closeModal=id=>{$('#'+id).hidden=true};
const currentState=()=>({athletes,mode,logo,event:$('#event').value,date:$('#date').value,raw:$('#raw').value});
function setMenu(open){$('#appMenu').classList.toggle('open',open);$('#appMenu').setAttribute('aria-hidden',String(!open));$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuScrim').hidden=!open}
function getLists(){try{return JSON.parse(localStorage.getItem(LISTS_KEY)||'[]')}catch{return[]}}
function saveLists(lists){localStorage.setItem(LISTS_KEY,JSON.stringify(lists))}
function applyState(saved){athletes=Array.isArray(saved.athletes)?saved.athletes:[];mode=saved.mode||'services';logo=saved.logo||'assets/img/logo.png';$('#event').value=saved.event||'';$('#date').value=saved.date||'';$('#raw').value=saved.raw||'';$('#eventTitle').textContent=(saved.event||'Legends').toUpperCase();$$('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));renderRows();$('#quickPdf').disabled=!athletes.length;saveState()}
function saveNamedList(){if(!athletes.length&&!$('#raw').value.trim()){alert('Importe uma lista antes de salvar.');return}const lists=getLists(),existing=lists.find(x=>x.id===activeListId),suggested=existing?.name||$('#event').value||'Novo campeonato',name=prompt('Nome da lista:',suggested)?.trim();if(!name)return;const item={id:existing?.id||`${Date.now()}-${Math.random().toString(16).slice(2)}`,name,updatedAt:new Date().toISOString(),state:currentState()},index=lists.findIndex(x=>x.id===item.id);if(index>=0)lists[index]=item;else lists.unshift(item);saveLists(lists);activeListId=item.id;setMenu(false);alert(`Lista “${name}” salva com sucesso.`)}
function renderSavedLists(){const lists=getLists().sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));$('#savedLists').innerHTML=lists.length?lists.map(x=>`<div class="saved-item"><button data-open-list="${esc(x.id)}"><strong>${esc(x.name)}</strong><time>Último salvamento: ${new Date(x.updatedAt).toLocaleString('pt-BR')}</time></button><button class="delete-saved" data-delete-list="${esc(x.id)}" aria-label="Excluir ${esc(x.name)}" title="Excluir">×</button></div>`).join(''):'<div class="saved-empty">Nenhuma lista salva ainda.</div>'}
function newList(){if((athletes.length||$('#raw').value.trim())&&!confirm('Criar uma nova lista? O rascunho atual será limpo.'))return;activeListId=null;applyState({athletes:[],mode:'services',logo:'assets/img/logo.png',event:'',date:'',raw:''});setMenu(false);openModal('importModal')}
function applyTheme(value){const resolved=value==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):value;document.documentElement.dataset.theme=resolved;$$('[data-theme-logo]').forEach(img=>img.src=resolved==='dark'?'assets/img/logo_dark.png':'assets/img/logo.png');$$('input[name="theme"]').forEach(x=>x.checked=x.value===value)}
$('#menuToggle').onclick=()=>setMenu(true);$('#menuClose').onclick=$('#menuScrim').onclick=()=>setMenu(false);
$$('[data-menu-action]').forEach(button=>button.onclick=()=>{const action=button.dataset.menuAction;if(action==='new')newList();if(action==='save')saveNamedList();if(action==='open'){setMenu(false);renderSavedLists();openModal('openListModal')}if(action==='settings'){setMenu(false);openModal('settingsModal')}if(action==='about'){setMenu(false);openModal('aboutModal')}});
$('#savedLists').addEventListener('click',e=>{const open=e.target.closest('[data-open-list]'),del=e.target.closest('[data-delete-list]');if(open){const item=getLists().find(x=>x.id===open.dataset.openList);if(item){activeListId=item.id;applyState(item.state);closeModal('openListModal')}}if(del){const item=getLists().find(x=>x.id===del.dataset.deleteList);if(item&&confirm(`Excluir a lista “${item.name}”?`)){saveLists(getLists().filter(x=>x.id!==item.id));if(activeListId===item.id)activeListId=null;renderSavedLists()}}});
$$('input[name="theme"]').forEach(input=>input.onchange=()=>{localStorage.setItem(THEME_KEY,input.value);applyTheme(input.value)});applyTheme(localStorage.getItem(THEME_KEY)||'auto');matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if((localStorage.getItem(THEME_KEY)||'auto')==='auto')applyTheme('auto')});
$('#raw').value='';
$('#event').addEventListener('input',e=>{$('#eventTitle').textContent=(e.target.value||'Legends').toUpperCase();saveState()});
$('#date').addEventListener('change',saveState);
$('#raw').addEventListener('input',saveState);
$('#logo').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader;r.onload=()=>{logo=r.result;saveState()};r.readAsDataURL(f)});
$('#openImport').onclick=()=>openModal('importModal');
$('#clearList').onclick=()=>{if(!confirm('Limpar toda a lista importada? Esta ação não pode ser desfeita.'))return;athletes=[];$('#raw').value='';renderRows();$('#quickPdf').disabled=true;closeModal('documentsModal');saveState()};
$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
$('#process').onclick=()=>{athletes=parse($('#raw').value);renderRows();$('#quickPdf').disabled=!athletes.length;saveState();if(athletes.length)closeModal('importModal')};
$('#athleteRows').addEventListener('change',e=>{const i=+e.target.dataset.i,f=e.target.dataset.f;if(!f)return;athletes[i][f]=e.target.type==='checkbox'?e.target.checked:e.target.type==='number'?+e.target.value:e.target.value;saveState()});
$('#quickPdf').onclick=()=>{preview();openModal('documentsModal')};
$$('[data-mode]').forEach(b=>b.onclick=()=>{$$('[data-mode]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');mode=b.dataset.mode;preview();saveState()});
$('#print').onclick=()=>{preview();window.print()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')$$('.modal:not([hidden])').forEach(m=>m.hidden=true)});
restoreState();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(error=>console.warn('Não foi possível ativar o modo offline.',error)));
