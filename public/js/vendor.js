async function fetchJSON(url, opts){ const res = await fetch(url, opts); if (!res.ok) throw new Error('Network error'); return res.json(); }
document.addEventListener('DOMContentLoaded', async ()=>{
  const params = new URLSearchParams(location.search);
  const localId = params.get('localId');
  if(!localId) return;
  const productsEl = document.getElementById('vendorProducts');

  // load store info
  async function loadStore(){
    try{
      const data = await fetchJSON(`/api/stores/${localId}`);
      const store = data.store || data;
      document.getElementById('storeName').value = store.name || '';
      document.getElementById('storeDescription').value = store.description || '';
      document.getElementById('storePhoto').value = store.iconUrl || '';
    }catch(e){ console.warn('No store data', e); }
  }

  const load = async ()=>{
    const products = await fetchJSON(`/api/vendors/${localId}/products`);
    if(productsEl) productsEl.innerHTML = products.map(p=>`<div class="card"><img src="${p.photoUrl||''}" style="height:120px"><h4>${p.name}</h4><p>$${p.price}</p><button data-id="${p._id}" class="edit">Editar</button><button data-id="${p._id}" class="del">Eliminar</button></div>`).join('');
    document.querySelectorAll('.del').forEach(b=>b.onclick=async e=>{ const id=e.target.dataset.id; await fetchJSON(`/api/vendors/${localId}/products/${id}`,{ method:'DELETE' }); load(); });
    document.querySelectorAll('.edit').forEach(b=>b.onclick=async e=>{
      const id = e.target.dataset.id;
      const name = prompt('Nuevo nombre');
      if(name===null) return;
      const priceRaw = prompt('Nuevo precio');
      if(priceRaw===null) return;
      const price = Number(priceRaw);
      const photoUrl = prompt('Nueva URL foto (vacío para mantener)');
      const body = { name, price };
      if(photoUrl !== null && photoUrl !== '') body.photoUrl = photoUrl;
      await fetch(`/api/vendors/${localId}/products/${id}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      load();
    });
  };

  document.getElementById('addProductBtn').onclick = async ()=>{
    const photoUrl = document.getElementById('addPhoto').value;
    const name = document.getElementById('addName').value;
    const price = Number(document.getElementById('addPrice').value);
    await fetch(`/api/vendors/${localId}/products`,{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ photoUrl,name,price }) });
    load();
  };

  document.getElementById('saveStoreBtn').onclick = async ()=>{
    const name = document.getElementById('storeName').value;
    const description = document.getElementById('storeDescription').value;
    const iconUrl = document.getElementById('storePhoto').value;
    const res = await fetch(`/api/stores/${localId}`,{ method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, description, iconUrl }) });
    if(res.ok) { alert('Tienda guardada'); loadStore(); } else { alert('Error al guardar tienda'); }
  };

  await loadStore();
  load();
});
