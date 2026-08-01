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
let activeListId=null,editingRecordIndex=null,confirmationResolver=null;
function saveState(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify({athletes,mode,logo,event:$('#event').value,date:$('#date').value,raw:$('#raw').value}))}catch(error){console.warn('Não foi possível salvar os dados localmente.',error)}}
function restoreState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');if(!saved)return false;athletes=Array.isArray(saved.athletes)?saved.athletes:[];mode=saved.mode||'services';logo=saved.logo||'assets/img/logo.png';$('#event').value=saved.event||'';$('#date').value=saved.date||'';$('#raw').value=saved.raw||'';$('#eventTitle').textContent=(saved.event||'Legends').toUpperCase();$$('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));renderRows();$('#quickPdf').disabled=!athletes.length;return true}catch(error){console.warn('Não foi possível restaurar os dados salvos.',error);return false}}
const key=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
const sortAthletes=()=>athletes.sort((a,b)=>key(a.name).localeCompare(key(b.name),'pt-BR',{numeric:true})||a.name.localeCompare(b.name,'pt-BR'));
function sectionOf(s){const k=key(s);if(/^inscricoes?$/.test(k))return"registered";if(k==="pintura")return"paint";if(k==="fotografia")return"photo";if(/^(ingresso )?backstage$/.test(k))return"backstage";return null}
function numberIn(s,re,fallback=1){const m=s.match(re);return m?Number(m[1]||fallback):0}
function parse(raw){const map=new Map();let section=null;raw.split(/\r?\n/).forEach(original=>{const line=original.trim();if(!line)return;const title=sectionOf(line);if(title){section=title;return}if(!section||/legends/i.test(line)&&/\d{2}\/\d{2}/.test(line))return;let cleaned=line.replace(/^\s*\d+\s*[-–.)]\s*/,"").trim(),hasAthletePrefix=section==="backstage"&&/^atleta\s+/i.test(cleaned);cleaned=cleaned.replace(/^atleta\s+/i,"").trim();if(!cleaned||/^\d+\s*[-–.)]?\s*$/.test(line))return;const noteStart=cleaned.search(/\s+(?:\+|\((?=\d|\+|tem)|-\s*dobra)/i),name=(noteStart>=0?cleaned.slice(0,noteStart):cleaned).trim(),note=noteStart>=0?cleaned.slice(noteStart):"";if(name.length<3)return;const id=key(name),a=map.get(id)||{id,name,registered:false,folds:0,paint:false,photo:false,photoFolds:0,backstage:0,audience:0,backstageLabel:false};if(section==="registered"){a.registered=true;a.folds=numberIn(note,/(\d+)\s*dobras?/i)||(/dobra/i.test(note)?1:0);a.audience=Math.max(a.audience,numberIn(note,/(\d+)\s*ingressos?\s*(?:de\s*)?plateia/i))}else if(section==="paint")a.paint=true;else if(section==="photo"){a.photo=true;a.photoFolds=numberIn(note,/(\d+)\s*dobras?/i)||(/dobra/i.test(note)?1:0)}else{a.backstageLabel=a.backstageLabel||hasAthletePrefix;a.backstage=numberIn(note,/(\d+)\s*pulseiras?(?!\s*plateia)/i)||1;a.audience=Math.max(a.audience,numberIn(note,/(\d+)\s*(?:pulseiras?\s*)?plateias?/i));if(/dobra de categoria/i.test(note)&&!a.folds)a.folds=1}map.set(id,a)});return[...map.values()].sort((a,b)=>a.name.localeCompare(b.name,"pt-BR",{sensitivity:"base"}))}
function show(id){$$('.page').forEach(x=>x.classList.toggle('active',x.id===id));$$('.tabs button').forEach(x=>x.classList.toggle('active',x.dataset.tab===id))}
function renderRows(){sortAthletes();const hasRows=athletes.length>0;$('#count').textContent=hasRows?`${athletes.length} pessoas identificadas · use “Editar” para alterar um registro`:'Nenhuma lista importada';$('#warning').hidden=true;$('#warning').textContent='';$('#emptyState').hidden=hasRows;$('#tableWrap').hidden=!hasRows;$('#listActions').hidden=!hasRows;$('#athleteRows').innerHTML=athletes.map((a,i)=>`<tr><td><strong>${esc(a.name)}</strong></td><td>${a.folds||'<span class="cell-empty">—</span>'}</td><td>${a.paint?'<span class="cell-check">✓</span>':'<span class="cell-empty">—</span>'}</td><td>${a.photo?'<span class="cell-check">✓</span>':'<span class="cell-empty">—</span>'}</td><td>${a.backstage||'<span class="cell-empty">—</span>'}</td><td>${a.audience||'<span class="cell-empty">—</span>'}</td><td><div class="record-actions"><button class="edit-record" data-edit-record="${i}" aria-label="Editar ${esc(a.name)}">Editar</button><button class="remove-record" data-remove-record="${i}" aria-label="Excluir ${esc(a.name)}">Excluir</button></div></td></tr>`).join('')}
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
function askConfirmation({title='Confirmar ação',message,confirmLabel='Confirmar'}){
  if(confirmationResolver)confirmationResolver(false);
  $('#confirmationTitle').textContent=title;
  $('#confirmationMessage').textContent=message;
  $('#confirmAction').textContent=confirmLabel;
  openModal('confirmationModal');
  window.setTimeout(()=>$('#cancelConfirmation').focus(),0);
  return new Promise(resolve=>{confirmationResolver=resolve});
}
function finishConfirmation(confirmed){
  if(!confirmationResolver)return;
  const resolve=confirmationResolver;
  confirmationResolver=null;
  closeModal('confirmationModal');
  resolve(confirmed);
}
function openNewRecord(){
  editingRecordIndex=null;
  $('#newRecordForm').reset();
  $('#recordFolds').value=$('#recordAudience').value=$('#recordBackstage').value=0;
  $('#newRecordError').hidden=true;
  $('#newRecordTitle').textContent='Novo registro';
  $('#recordFormHint').textContent='O registro será incluído nesta lista.';
  $('#saveRecord').textContent='Adicionar';
  openModal('newRecordModal');
  window.setTimeout(()=>$('#recordName').focus(),0);
}
function openEditRecord(index){
  const athlete=athletes[index];
  if(!athlete)return;
  editingRecordIndex=index;
  $('#recordName').value=athlete.name;
  $('#recordPaint').checked=Boolean(athlete.paint);
  $('#recordPhoto').checked=Boolean(athlete.photo);
  $('#recordFolds').value=athlete.folds||0;
  $('#recordAudience').value=athlete.audience||0;
  $('#recordBackstage').value=athlete.backstage||0;
  $('#newRecordError').hidden=true;
  $('#newRecordTitle').textContent='Editar registro';
  $('#recordFormHint').textContent='As alterações serão salvas nesta lista.';
  $('#saveRecord').textContent='Salvar alterações';
  openModal('newRecordModal');
  window.setTimeout(()=>$('#recordName').focus(),0);
}
function saveRecord(event){
  event.preventDefault();
  const name=$('#recordName').value.trim(),error=$('#newRecordError');
  if(!name){error.textContent='Informe o nome da pessoa.';error.hidden=false;$('#recordName').focus();return}
  if(athletes.some((a,index)=>index!==editingRecordIndex&&key(a.name)===key(name))){error.textContent='Já existe um registro com esse nome nesta lista.';error.hidden=false;$('#recordName').focus();return}
  const quantity=id=>Math.max(0,Math.floor(Number($('#'+id).value)||0));
  const previous=editingRecordIndex===null?null:athletes[editingRecordIndex];
  const record={id:key(name),name,registered:previous?.registered??true,folds:quantity('recordFolds'),paint:$('#recordPaint').checked,photo:$('#recordPhoto').checked,photoFolds:previous?.photoFolds||0,backstage:quantity('recordBackstage'),audience:quantity('recordAudience'),backstageLabel:previous?.backstageLabel??true};
  if(editingRecordIndex===null)athletes.push(record);else athletes[editingRecordIndex]=record;
  sortAthletes();
  renderRows();
  $('#quickPdf').disabled=false;
  saveState();
  closeModal('newRecordModal');
}
const currentState=()=>({athletes,mode,logo,event:$('#event').value,date:$('#date').value,raw:$('#raw').value});
function setMenu(open){$('#appMenu').classList.toggle('open',open);$('#appMenu').setAttribute('aria-hidden',String(!open));$('#menuToggle').setAttribute('aria-expanded',String(open));$('#menuScrim').hidden=!open}
function getLists(){try{return JSON.parse(localStorage.getItem(LISTS_KEY)||'[]')}catch{return[]}}
function saveLists(lists){localStorage.setItem(LISTS_KEY,JSON.stringify(lists))}
function applyState(saved){athletes=Array.isArray(saved.athletes)?saved.athletes:[];mode=saved.mode||'services';logo=saved.logo||'assets/img/logo.png';$('#event').value=saved.event||'';$('#date').value=saved.date||'';$('#raw').value=saved.raw||'';$('#eventTitle').textContent=(saved.event||'Legends').toUpperCase();$$('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===mode));renderRows();$('#quickPdf').disabled=!athletes.length;saveState()}
function saveNamedList(){if(!athletes.length&&!$('#raw').value.trim()){alert('Importe uma lista antes de salvar.');return}const lists=getLists(),existing=lists.find(x=>x.id===activeListId),suggested=existing?.name||$('#event').value||'Novo campeonato',name=prompt('Nome da lista:',suggested)?.trim();if(!name)return;const item={id:existing?.id||`${Date.now()}-${Math.random().toString(16).slice(2)}`,name,updatedAt:new Date().toISOString(),state:currentState()},index=lists.findIndex(x=>x.id===item.id);if(index>=0)lists[index]=item;else lists.unshift(item);saveLists(lists);activeListId=item.id;setMenu(false);alert(`Lista “${name}” salva com sucesso.`)}
function renderSavedLists(){const lists=getLists().sort((a,b)=>new Date(b.updatedAt)-new Date(a.updatedAt));$('#savedLists').innerHTML=lists.length?lists.map(x=>`<div class="saved-item"><button data-open-list="${esc(x.id)}"><strong>${esc(x.name)}</strong><time>Último salvamento: ${new Date(x.updatedAt).toLocaleString('pt-BR')}</time></button><button class="delete-saved" data-delete-list="${esc(x.id)}" aria-label="Excluir ${esc(x.name)}" title="Excluir">×</button></div>`).join(''):'<div class="saved-empty">Nenhuma lista salva ainda.</div>'}
async function newList(){setMenu(false);if(!await askConfirmation({title:'Criar nova lista?',message:'Todos os registros da lista atual serão limpos.',confirmLabel:'Criar nova lista'}))return;activeListId=null;applyState({athletes:[],mode:'services',logo:'assets/img/logo.png',event:'',date:'',raw:''})}
function exportAthletes(){const names=athletes.filter(a=>a.registered).map(a=>a.name.trim()).filter(Boolean).sort((a,b)=>a.localeCompare(b,'pt-BR',{sensitivity:'base'}));$('#exportNames').value=names.join('\n');$('#exportCount').textContent=names.length?`${names.length} ${names.length===1?'atleta':'atletas'}`:'Nenhum atleta em Inscrições + Dobras';$('#copyExport').disabled=!names.length;$('#copyStatus').textContent='';setMenu(false);openModal('exportModal')}
async function copyExportedAthletes(){const textarea=$('#exportNames');if(!textarea.value)return;let copied=false;try{await navigator.clipboard.writeText(textarea.value);copied=true}catch{textarea.focus();textarea.select();copied=document.execCommand('copy')}$('#copyStatus').textContent=copied?'Lista copiada!':'Não foi possível copiar';if(copied)window.setTimeout(()=>{$('#copyStatus').textContent=''},2200)}
function applyTheme(value){const resolved=value==='auto'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):value;document.documentElement.dataset.theme=resolved;$$('[data-theme-logo]').forEach(img=>img.src=resolved==='dark'?'assets/img/logo_dark.png':'assets/img/logo.png');$$('input[name="theme"]').forEach(x=>x.checked=x.value===value)}
$('#menuToggle').onclick=()=>setMenu(true);$('#menuClose').onclick=$('#menuScrim').onclick=()=>setMenu(false);
$$('[data-menu-action]').forEach(button=>button.onclick=()=>{const action=button.dataset.menuAction;if(action==='new')newList();if(action==='save')saveNamedList();if(action==='open'){setMenu(false);renderSavedLists();openModal('openListModal')}if(action==='import'){setMenu(false);openModal('importModal')}if(action==='export')exportAthletes();if(action==='settings'){setMenu(false);openModal('settingsModal')}if(action==='about'){setMenu(false);openModal('aboutModal')}});
$('#savedLists').addEventListener('click',async e=>{const open=e.target.closest('[data-open-list]'),del=e.target.closest('[data-delete-list]');if(open){const item=getLists().find(x=>x.id===open.dataset.openList);if(item){activeListId=item.id;applyState(item.state);closeModal('openListModal')}}if(del){const item=getLists().find(x=>x.id===del.dataset.deleteList);if(item&&await askConfirmation({title:'Excluir lista?',message:`A lista “${item.name}” será removida permanentemente.`,confirmLabel:'Excluir lista'})){saveLists(getLists().filter(x=>x.id!==item.id));if(activeListId===item.id)activeListId=null;renderSavedLists()}}});
$$('input[name="theme"]').forEach(input=>input.onchange=()=>{localStorage.setItem(THEME_KEY,input.value);applyTheme(input.value)});applyTheme(localStorage.getItem(THEME_KEY)||'auto');matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change',()=>{if((localStorage.getItem(THEME_KEY)||'auto')==='auto')applyTheme('auto')});
$('#raw').value='';
$('#event').addEventListener('input',e=>{$('#eventTitle').textContent=(e.target.value||'Legends').toUpperCase();saveState()});
$('#date').addEventListener('change',saveState);
$('#raw').addEventListener('input',saveState);
$('#logo').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader;r.onload=()=>{logo=r.result;saveState()};r.readAsDataURL(f)});
$('#openImport').onclick=()=>openModal('importModal');
$('#newRecord').onclick=openNewRecord;
$('#newRecordForm').addEventListener('submit',saveRecord);
$('#cancelConfirmation').onclick=$('#confirmationBackdrop').onclick=()=>finishConfirmation(false);
$('#confirmAction').onclick=()=>finishConfirmation(true);
$('#copyExport').onclick=copyExportedAthletes;
$('#clearList').onclick=async()=>{if(!await askConfirmation({title:'Limpar toda a lista?',message:'Todos os registros atuais serão removidos. Esta ação não pode ser desfeita.',confirmLabel:'Limpar lista'}))return;athletes=[];$('#raw').value='';renderRows();$('#quickPdf').disabled=true;closeModal('documentsModal');saveState()};
$$('[data-close]').forEach(b=>b.onclick=()=>closeModal(b.dataset.close));
$('#process').onclick=()=>{athletes=parse($('#raw').value);renderRows();$('#quickPdf').disabled=!athletes.length;saveState();if(athletes.length)closeModal('importModal')};
$('#athleteRows').addEventListener('click',async e=>{const edit=e.target.closest('[data-edit-record]'),remove=e.target.closest('[data-remove-record]');if(edit){openEditRecord(Number(edit.dataset.editRecord));return}if(remove){const index=Number(remove.dataset.removeRecord),athlete=athletes[index];if(athlete&&await askConfirmation({title:'Excluir registro?',message:`O registro de “${athlete.name}” será removido desta lista.`,confirmLabel:'Excluir registro'})){athletes.splice(index,1);renderRows();$('#quickPdf').disabled=!athletes.length;saveState()}}});
$('#quickPdf').onclick=()=>{preview();openModal('documentsModal')};
$$('[data-mode]').forEach(b=>b.onclick=()=>{$$('[data-mode]').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');mode=b.dataset.mode;preview();saveState()});
$('#print').onclick=()=>{preview();window.print()};
document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(!$('#confirmationModal').hidden){finishConfirmation(false);return}$$('.modal:not([hidden])').forEach(m=>m.hidden=true)});
restoreState();
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(error=>console.warn('Não foi possível ativar o modo offline.',error)));
