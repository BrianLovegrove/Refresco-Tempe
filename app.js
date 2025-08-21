// Generic tree navigation with breadcrumbs and back button
let tree=null;const stack=[];
const $c=document.getElementById('content'),$bc=document.getElementById('breadcrumbs'),$back=document.getElementById('backBtn');

fetch('data/tree.json').then(r=>r.json()).then(j=>{tree=j;render();})
.catch(e=>{$c.textContent='Failed to load data/tree.json';console.error(e);});

function current(){let n=tree;for(const i of stack){n=n.children[i];}return n;}

function render(){
  renderBack(); renderCrumbs();
  const n=current(); $c.innerHTML='';
  if(n.children && n.children.length){
    const list=document.createElement('div'); list.className='list';
    n.children.forEach((ch,i)=>{
      const btn=document.createElement('button');
      btn.className='item'; btn.textContent=ch.name;
      btn.onclick=()=>{ stack.push(i); render(); };
      list.appendChild(btn);
    });
    $c.appendChild(list);
  }
  if(n.docs && n.docs.length){
    const t=document.createElement('div'); t.className='sectionTitle'; t.textContent='Documents'; $c.appendChild(t);
    const list=document.createElement('div'); list.className='list';
    n.docs.forEach(d=>{
      const a=document.createElement('a'); a.className='item'; a.target='_blank'; a.rel='noopener';
      a.href=(n.path||'')+d.file; a.textContent=d.title; list.appendChild(a);
    });
    $c.appendChild(list);
  }
  if((!n.children||!n.children.length)&&(!n.docs||!n.docs.length)){
    const p=document.createElement('p'); p.className='empty'; p.textContent='No content yet. Add PDFs to the folder path and list them in data/tree.json.'; $c.appendChild(p);
  }
}

function renderCrumbs(){
  const parts=['<a href="#" data-i="-1">Home</a>']; let n=tree;
  stack.forEach((idx,d)=>{ n=n.children[idx];
    if(d<stack.length-1) parts.push(`<a href="#" data-i="${d}">${n.name}</a>`);
    else parts.push(`<span>${n.name}</span>`);
  });
  $bc.innerHTML=parts.join(' / ');
  $bc.querySelectorAll('a[data-i]').forEach(a=>{
    a.onclick=e=>{ e.preventDefault(); const i=parseInt(a.getAttribute('data-i'),10);
      if(i===-1) stack.length=0; else stack.length=i+1; render();
    };
  });
}

function renderBack(){
  if(stack.length===0){ $back.style.display='none'; return; }
  $back.style.display='inline-block';
  $back.onclick=()=>{ stack.pop(); render(); };
}