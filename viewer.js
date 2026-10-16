const MAIN_APP='https://gugi321.github.io/gugugug/';
const CONFIG_URL=MAIN_APP+'share-config.json';
const params=new URLSearchParams(location.search);
const shareId=params.get('share')||'';
const frame=document.getElementById('viewer');
const cover=document.getElementById('cover');
const title=document.getElementById('coverTitle');
const text=document.getElementById('coverText');
const state=document.getElementById('state');
let backend='';
let sent=false;

function fail(message){cover.hidden=false;cover.classList.add('error');title.textContent='Não foi possível abrir o projeto';text.textContent=message;state.textContent='Erro';}
function loading(message){cover.hidden=false;cover.classList.remove('error');text.textContent=message;state.textContent='Carregando…';}
function sendLoad(){if(sent||!backend||!frame.contentWindow)return;sent=true;frame.contentWindow.postMessage({type:'GG_PUBLIC_SHARE_LOAD',id:shareId,backend},location.origin);}

if(!/^[a-f0-9]{32}$/i.test(shareId)){
  fail('O endereço de compartilhamento é inválido ou incompleto.');
}else{
  try{
    loading('Conectando ao armazenamento do projeto…');
    const response=await fetch(CONFIG_URL,{cache:'no-store'});
    if(!response.ok)throw new Error('Configuração do compartilhamento indisponível.');
    const cfg=await response.json();
    backend=String(cfg.backend||'').trim().replace(/\/+$/,'');
    if(!/^https:\/\//i.test(backend))throw new Error('O armazenamento público ainda não foi conectado.');
    frame.src=MAIN_APP+'?public-share=1&v=r9';
    frame.addEventListener('load',()=>{sent=false;loading('Carregando o IFC compartilhado…');setTimeout(sendLoad,300);});
  }catch(error){fail(error.message||String(error));}
}

window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  const data=event.data||{};
  if(data.type==='GG_PUBLIC_SHARE_READY'){
    cover.hidden=true;state.textContent='Somente leitura';document.title='Projeto compartilhado · Eng. Gustavo Gil';
  }
  if(data.type==='GG_PUBLIC_SHARE_ERROR')fail(data.message||'Falha ao carregar o projeto compartilhado.');
});

setTimeout(()=>{if(!cover.hidden&&!cover.classList.contains('error'))sendLoad();},2500);
