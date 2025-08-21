// Three-level navigator: Top (Lines & Systems) -> Machines (if any) -> Documents
const state = { view: 'top', topIndex: null, machineIndex: null, data: null };

const $content = document.getElementById('content');
const $crumbs  = document.getElementById('breadcrumbs');
const $back    = document.getElementById('backBtn');

fetch('data/structure.json')
  .then(r => r.json())
  .then(json => { state.data = json; render(); })
  .catch(err => { $content.textContent = 'Failed to load data/structure.json'; console.error(err); });

function render() {
  renderBack();
  renderBreadcrumbs();
  if (state.view === 'top') renderTop();
  else if (state.view === 'machines') renderMachines();
  else if (state.view === 'docs') renderDocs();
}

function renderBack() {
  if (state.view === 'top') {
    $back.style.display = 'none';
    $back.onclick = null;
  } else if (state.view === 'machines') {
    $back.style.display = 'inline-block';
    $back.onclick = () => { state.view = 'top'; state.topIndex = null; render(); };
  } else if (state.view === 'docs') {
    $back.style.display = 'inline-block';
    $back.onclick = () => { state.view = 'machines'; state.machineIndex = null; render(); };
  }
}

function renderBreadcrumbs() {
  const parts = [];
  parts.push(`<a href="#" data-nav="top">Home</a>`);
  if (state.view !== 'top' && state.data) {
    const top = state.data.top[state.topIndex];
    if (top) parts.push(`<a href="#" data-nav="machines">${top.name}</a>`);
    if (state.view === 'docs') {
      const mach = top.machines[state.machineIndex];
      if (mach) parts.push(`<span>${mach.name}</span>`);
    }
  }
  $crumbs.innerHTML = parts.join(' / ');
  $crumbs.querySelectorAll('a[data-nav]').forEach(a => {
    a.onclick = (e) => {
      e.preventDefault();
      const dest = a.getAttribute('data-nav');
      if (dest === 'top') state.view = 'top';
      if (dest === 'machines') state.view = 'machines';
      render();
    };
  });
}

function renderTop() {
  $content.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'grid';
  state.data.top.forEach((item, i) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.textContent = item.name;
    card.onclick = () => {
      // If item has no machines but has docs, jump straight to docs
      if ((!item.machines || item.machines.length === 0) && item.docs && item.docs.length > 0) {
        state.view = 'docs'; state.topIndex = i; state.machineIndex = -1; // -1 == direct docs
      } else {
        state.view = 'machines'; state.topIndex = i;
      }
      render();
    };
    grid.appendChild(card);
  });
  $content.appendChild(grid);
}

function renderMachines() {
  $content.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'grid';
  const top = state.data.top[state.topIndex];
  if (!top.machines || top.machines.length === 0) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No subfolders yet. Add machines under this section in data/structure.json or add docs directly to this section.';
    $content.appendChild(p);
    return;
  }
  top.machines.forEach((m, i) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.textContent = m.name;
    card.onclick = () => { state.view = 'docs'; state.machineIndex = i; render(); };
    grid.appendChild(card);
  });
  $content.appendChild(grid);
}

function renderDocs() {
  $content.innerHTML = '';
  const top = state.data.top[state.topIndex];
  let docs = [];
  let path = '';
  if (state.machineIndex === -1) {
    // docs directly on top-level section
    docs = top.docs || [];
    path = top.path || '';
  } else {
    const mach = top.machines[state.machineIndex];
    docs = mach.docs || [];
    path = mach.path || '';
  }

  if (!docs.length) {
    const p = document.createElement('p');
    p.className = 'empty';
    p.textContent = 'No documents yet. Upload PDFs to ' + (path||'/docs/...') + ' and add entries in data/structure.json.';
    $content.appendChild(p);
    return;
  }

  const list = document.createElement('ul');
  list.className = 'doclist';
  docs.forEach(d => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = (path || '') + d.file; // e.g. /docs/line2/seamer/Seamer_1st_Ops.pdf
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = d.title;
    li.appendChild(a);
    list.appendChild(li);
  });
  $content.appendChild(list);
}
