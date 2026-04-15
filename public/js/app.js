async function fetchJSON(url, opts){
  const res = await fetch(url, opts);
  return res.json();
}

function cardHTML(p){
  const price = Number(p.price) || 0;
  const fmt = (window.zofriAccessibility && typeof window.zofriAccessibility.formatCurrency === 'function') ? window.zofriAccessibility.formatCurrency(price) : ('$' + Math.round(price).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
  return `<div class="card"><img src="${p.photoUrl||'/css/placeholder.png'}" alt="${p.name}"><h4>${p.name}</h4><p>${fmt}</p><a href="/product.html?id=${p._id}">Ver</a></div>`;
}

async function loadProducts(q=''){
  const products = await fetchJSON(`/api/products?q=${encodeURIComponent(q)}`);
  const el = document.getElementById('products');
  if(!el) return;
  el.innerHTML = products.map(cardHTML).join('');
}

async function loadStores(){
  const stores = await fetchJSON('/api/stores');
  const el = document.getElementById('stores');
  if(!el) return;
  el.innerHTML = stores.map(s=>`<div class="store card"><img src="${s.iconUrl||'/css/placeholder.png'}" alt="${s.name}"><div>${s.name}</div><a href="/store.html?localId=${s.localId}">Ir</a></div>`).join('');
}

// product detail and store pages
async function loadProductDetail(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  if(!id) return;
  const data = await fetchJSON(`/api/products/${id}`);
  const pd = document.getElementById('productDetail');
  const ps = document.getElementById('productStores');
  // set title element and product details (avoid duplicate top-level headings)
  const titleEl = document.getElementById('productTitle');
  if(titleEl) titleEl.textContent = data.product.name;
  if(pd) {
    const pprice = Number(data.product.price) || 0;
    const pfmt = (window.zofriAccessibility && typeof window.zofriAccessibility.formatCurrency === 'function') ? window.zofriAccessibility.formatCurrency(pprice) : ('$' + Math.round(pprice).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.'));
    pd.innerHTML = `<img src="${data.product.photoUrl||''}" alt="${data.product.name}" style="max-width:240px"><p>${pfmt}</p><p><label>Cantidad: <input id="addQty" type="number" min="1" value="1" style="width:64px"></label> <button id="addToCartBtn">Añadir al carrito</button></p>`;
  }
  if(ps) ps.innerHTML = data.others.map(o=>{ const op = Number(o.price)||0; const ofmt = (window.zofriAccessibility && typeof window.zofriAccessibility.formatCurrency === 'function') ? window.zofriAccessibility.formatCurrency(op) : ('$' + Math.round(op).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')); return `<div class="card"><h4>${o.name}</h4><p>${o.storeName || 'Tienda'} - ${ofmt} <a href="/store.html?localId=${o.storeLocalId}">Ir</a></p></div>` }).join('');
  // add to cart handler
  const addBtn = document.getElementById('addToCartBtn');
  if(addBtn){
    addBtn.onclick = async ()=>{
      const rawUser = localStorage.getItem('zofri_user');
      if(!rawUser){ alert('Debes iniciar sesión para añadir al carrito'); location.href='/login.html'; return; }
      const user = JSON.parse(rawUser);
      const qty = Number(document.getElementById('addQty').value) || 1;
      const payload = { userId: user.id, productId: data.product._id, name: data.product.name, price: data.product.price, quantity: qty, storeLocalId: data.product.storeLocalId };
      try{
        const res = await fetch('/api/cart/add',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
        if(res.ok){ alert('Añadido al carrito'); } else { const t = await res.json(); alert(t.msg||'Error'); }
      }catch(e){ alert('Error al añadir al carrito'); }
    };
  }
}

async function loadStorePage(){
  const params = new URLSearchParams(location.search);
  const id = params.get('localId');
  if(!id) return;
  const data = await fetchJSON(`/api/stores/${id}`);
  const si = document.getElementById('storeInfo');
  const sp = document.getElementById('storeProducts');
  const storeTitleEl = document.getElementById('storeTitle');
  if(storeTitleEl) storeTitleEl.textContent = data.store.name;
  if(si) si.innerHTML = `<img src="${data.store.iconUrl||'/css/placeholder.png'}" alt="${data.store.name}" style="max-width:160px"><p>${data.store.description||''}</p>`;
  if(sp) sp.innerHTML = data.products.map(cardHTML).join('');
}

document.addEventListener('DOMContentLoaded', ()=>{
  const search = document.getElementById('search');
  if(search){ search.addEventListener('input', ()=> loadProducts(search.value)); }
  loadProducts();
  loadStores();
  loadProductDetail();
  loadStorePage();
  // Update header user menu if logged in
  try {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
      const u = localStorage.getItem('zofri_user');
      const v = localStorage.getItem('zofri_vendor');
      if (u) {
        const user = JSON.parse(u);
        userMenu.textContent = user.firstName || user.email || 'Usuario';
        userMenu.href = '/profile.html';
        const logout = document.createElement('a');
        logout.href = '#';
        logout.id = 'logoutBtn';
        logout.style.marginLeft = '8px';
        logout.textContent = 'Salir';
        logout.onclick = (e) => { e.preventDefault(); localStorage.removeItem('zofri_user'); localStorage.removeItem('zofri_vendor'); location.reload(); };
        userMenu.parentNode.appendChild(logout);
      } else if (v) {
        const vendor = JSON.parse(v);
        userMenu.textContent = vendor.storeName || vendor.email || 'Vendedor';
        userMenu.href = '/vendor.html?localId=' + (vendor.localId || '');
        const logout = document.createElement('a');
        logout.href = '#';
        logout.id = 'logoutBtn';
        logout.style.marginLeft = '8px';
        logout.textContent = 'Salir';
        logout.onclick = (e) => { e.preventDefault(); localStorage.removeItem('zofri_user'); localStorage.removeItem('zofri_vendor'); location.reload(); };
        userMenu.parentNode.appendChild(logout);
      }
    }
  } catch (e) { console.error('Header user update failed', e); }
});
