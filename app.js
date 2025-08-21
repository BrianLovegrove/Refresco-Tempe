// Refresco Tempe - full login gate + auto file listing
const OWNER='brianlovegrove';
const REPO='Refresco-Tempe';
const BRANCH='main';

const USERNAME='MECH';
const PASSWORD='1234';
const SESSION_KEY='refresco_auth_ok';

let tree=null;
const stack=[];
const $overlay=document.getElementById('loginOverlay');
const $loginBtn=document.getElementById('loginBtn');
const $u=document.getElementById('u');
const $p=document.getElementById('p');
const $err=document.getElementById('err');
const $header=document.getElementById('appHeader');
const $main=document.getElementById('appMain');
const $c=document.getElementById('content');
const $bc=document.getElementById('breadcrumbs');
const $back=document.getElementById('backBtn');

function authed(){ return sessionStorage.getItem(SESSION_KEY)==='1'; }
function showApp(){ $overlay.style.display='none'; $header.style.display='block'; $main.style.display='block'; initApp(); }
function requireLogin(){ $overlay.style.display='flex'; $header.style.display='none'; $main.style.display='none'; }
$loginBtn.onclick=()=>{ const uu=($u.value||'').trim(); const pp=($p.value||'').trim();
  if(uu===USERNAME && pp===PASSWORD){ sessionStorage.setItem(SESSION_KEY,'1'); showApp(); } else { $err.textContent='Invalid credentials'; } };
window.addEventListener('DOMContentLoaded', ()=>{ if(authed()) showApp(); else requireLogin(); });

async function initApp(){
  try{
    const res=await fetch('data/tree.json?v='+(Date.now()%1e7));
    if(!res.ok) throw new Error('tree.json missing');
    tree=await res.json(); render();
  }catch(e){ console.error(e); $c.innerHTML='<p class="empty">Failed to load folder tree (data/tree.json).</p>'; }
}
function current(){ let n=tree; for(const i of stack){ n=(n.children||[])[i]; } return n; }
function pathBreadcrumbs(){ const names=[]; let n=tree; stack.forEach(i=>{ n=n.children[i]; names.push(n.name); }); return names; }
function slugify(label){ return label.toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'_').replace(/_+/g,'_').replace(/^_+|_+$/g,''); }
function nodeRepoPath(){ const names=pathBreadcrumbs(); if(names.length===0) return null; const slugs=names.map(slugify); return 'docs/'+slugs.join('/')+'/'; }

function render(){
  renderBack(); renderCrumbs();
  const n=current(); $c.innerHTML='';

  if(n.children && n.children.length){
    const list=document.createElement('div'); list.className='list';
    n.children.forEach((ch,i)=>{ const b=document.createElement('button'); b.className='item'; b.textContent=ch.name; b.onclick=()=>{ stack.push(i); render(); }; list.appendChild(b); });
    $c.appendChild(list);
  }

  const repoPath=nodeRepoPath();
  if(repoPath){
    const title=document.createElement('div'); title.className='sectionTitle'; title.textContent='Files'; $c.appendChild(title);
    const list=document.createElement('div'); list.className='list'; $c.appendChild(list);
    listFiles(repoPath).then(items=>{
      if(!items.length){ const p=document.createElement('p'); p.className='empty'; p.textContent='No files yet. Upload to '+repoPath+' in GitHub.'; $c.appendChild(p); return; }
      items.forEach(it=>{ if(it.type==='file'){ const a=document.createElement('a'); a.className='item'; a.target='_blank'; a.rel='noopener'; a.href=rawUrl(repoPath+it.name); a.textContent=prettyName(it.name); list.appendChild(a); } });
    }).catch(err=>{ const p=document.createElement('p'); p.className='empty'; p.textContent='Folder not found yet: '+repoPath; $c.appendChild(p); console.error(err); });
  }
}
function renderCrumbs(){ const parts=['<a href="#" data-i="-1">Home</a>']; let n=tree;
  stack.forEach((idx,d)=>{ n=n.children[idx]; if(d<stack.length-1) parts.push(`<a href="#" data-i="${d}">${n.name}</a>`); else parts.push(`<span>${n.name}</span>`); });
  $bc.innerHTML=parts.join(' / ');
  $bc.querySelectorAll('a[data-i]').forEach(a=>{ a.onclick=e=>{ e.preventDefault(); const i=parseInt(a.getAttribute('data-i'),10); if(i===-1) stack.length=0; else stack.length=i+1; render(); }; });
}
function renderBack(){ if(stack.length===0){ $back.style.display='none'; return; } $back.style.display='inline-block'; $back.onclick=()=>{ stack.pop(); render(); }; }

function apiUrl(path){ const clean=path.replace(/^\/+|\/+$/g,''); return `https://api.github.com/repos/${OWNER}/${REPO}/contents/${encodeURIComponent(clean)}?ref=${encodeURIComponent(BRANCH)}`; }
function rawUrl(path){ const clean=path.replace(/^\/+/, ''); return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${encodeURIComponent(BRANCH)}/${clean}`; }
async function listFiles(path){ const res=await fetch(apiUrl(path), { headers:{ 'Accept':'application/vnd.github+json' } }); if(!res.ok) throw new Error('GitHub API '+res.status); const items=await res.json(); return Array.isArray(items)?items:[]; }
function prettyName(filename){ const noExt=filename.replace(/\.[^.]+$/,''); return noExt.replace(/[_-]+/g,' ').replace(/\s+/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); }
