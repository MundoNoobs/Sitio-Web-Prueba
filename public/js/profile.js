document.addEventListener('DOMContentLoaded', ()=>{
  const info = document.getElementById('profileInfo');
  const raw = localStorage.getItem('zofri_user');
  if(!raw){
    // no user in localStorage, redirect to login
    location.href = '/login.html';
    return;
  }
  const user = JSON.parse(raw);
  info.innerHTML = `
    <p><strong>Nombre:</strong> ${user.firstName || ''} ${user.lastName || ''}</p>
    <p><strong>Email:</strong> ${user.email || ''}</p>
  `;

  const logoutBtn = document.getElementById('logoutBtnLocal');
  if(logoutBtn){
    logoutBtn.onclick = (e)=>{ e.preventDefault(); localStorage.removeItem('zofri_user'); localStorage.removeItem('zofri_vendor'); location.href='/'; };
  }
  // cart and orders
  const cartItemsEl = document.getElementById('cartItems');
  const ordersListEl = document.getElementById('ordersList');
  const cartTotalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function formatCurrencyFallback(n){
    if(window.zofriAccessibility && typeof window.zofriAccessibility.formatCurrency === 'function') return window.zofriAccessibility.formatCurrency(n);
    if (n == null || isNaN(Number(n))) return '$0';
    const v = Math.round(Number(n));
    return '$' + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  async function loadCart(){
    try{
      const res = await fetch(`/api/cart?userId=${user.id}`);
      if(!res.ok) { cartItemsEl.innerHTML = 'Error cargando carrito'; return; }
      const data = await res.json();
      const cart = data.cart || [];
      if(cart.length === 0) { cartItemsEl.innerHTML = '<p>Carrito vacío</p>'; if(cartTotalEl) cartTotalEl.textContent = ''; return; }
      let total = 0;
      cartItemsEl.innerHTML = cart.map(c=>{
        const price = Number(c.price) || 0;
        const qty = Number(c.quantity) || 0;
        const itemTotal = price * qty;
        total += itemTotal;
        return `<div class="cart-item"><strong>${c.name}</strong> - <span class="item-price">${formatCurrencyFallback(price)}</span> x ${qty} = <span class="item-total">${formatCurrencyFallback(itemTotal)}</span> <button data-id="${c.productId}" class="removeCart">Eliminar</button></div>`;
      }).join('');
      if(cartTotalEl) cartTotalEl.textContent = 'Total: ' + formatCurrencyFallback(total);
      document.querySelectorAll('.removeCart').forEach(b=>b.onclick=async e=>{
        const pid = e.target.dataset.id;
        await fetch('/api/cart/remove',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: user.id, productId: pid }) });
        loadCart();
        loadOrders();
      });
    }catch(e){ cartItemsEl.innerHTML = 'Error cargando carrito'; }
  }

  async function loadOrders(){
    try{
      const res = await fetch(`/api/sales/user/${user.id}`);
      if(!res.ok) { ordersListEl.innerHTML = 'Error cargando pedidos'; return; }
      const data = await res.json();
      if(data.length===0) { ordersListEl.innerHTML = '<p>No hay pedidos</p>'; return; }
      ordersListEl.innerHTML = data.map(s=>{
        const price = Number(s.price) || 0;
        const qty = Number(s.quantity) || 0;
        return `<div class="order"><strong>${s.saleId}</strong> - ${s.productName} x ${qty} - ${formatCurrencyFallback(price)} - <em>${s.status}</em></div>`;
      }).join('');
    }catch(e){ ordersListEl.innerHTML = 'Error cargando pedidos'; }
  }

  if(checkoutBtn){
    checkoutBtn.onclick = async ()=>{
      try{
        // compute cart total client-side for confirmation
        const r = await fetch(`/api/cart?userId=${user.id}`);
        if(!r.ok){ alert('Error al obtener carrito'); return; }
        const d = await r.json(); const cart = d.cart || [];
        if(cart.length===0){ alert('Carrito vacío'); return; }
        const total = cart.reduce((s,c)=> s + (Number(c.price)||0) * (Number(c.quantity)||0), 0);
        const totalFmt = formatCurrencyFallback(total);
        const addr = prompt('Dirección de envío (opcional, se usará tu dirección si está registrada)');
        if(!confirm(`Total a pagar: ${totalFmt}. ¿Confirmar compra simulada?`)) return;
        const body = { userId: user.id, address: addr || '', total };
        const res = await fetch('/api/cart/checkout',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
        if(res.ok){ const resp = await res.json(); alert('Compra simulada creada. Total: ' + (resp.total ? formatCurrencyFallback(resp.total) : totalFmt)); loadCart(); loadOrders(); } else { const t = await res.json(); alert(t.msg||'Error'); }
      }catch(e){ alert('Error al procesar checkout'); }
    };
  }

  loadCart();
  loadOrders();
});
