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
  const checkoutBtn = document.getElementById('checkoutBtn');

  async function loadCart(){
    try{
      const res = await fetch(`/api/cart?userId=${user.id}`);
      if(!res.ok) { cartItemsEl.innerHTML = 'Error cargando carrito'; return; }
      const data = await res.json();
      const cart = data.cart || [];
      if(cart.length === 0) { cartItemsEl.innerHTML = '<p>Carrito vacío</p>'; return; }
      cartItemsEl.innerHTML = cart.map(c=>`<div class="cart-item"><strong>${c.name}</strong> - $${c.price} x ${c.quantity} <button data-id="${c.productId}" class="removeCart">Eliminar</button></div>`).join('');
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
      ordersListEl.innerHTML = data.map(s=>`<div class="order"><strong>${s.saleId}</strong> - ${s.productName} x ${s.quantity} - $${s.price} - <em>${s.status}</em></div>`).join('');
    }catch(e){ ordersListEl.innerHTML = 'Error cargando pedidos'; }
  }

  if(checkoutBtn){
    checkoutBtn.onclick = async ()=>{
      const addr = prompt('Dirección de envío (opcional, se usará tu dirección si está registrada)');
      const body = { userId: user.id, address: addr || '' };
      const res = await fetch('/api/cart/checkout',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if(res.ok){ alert('Compra simulada creada'); loadCart(); loadOrders(); } else { const t = await res.json(); alert(t.msg||'Error'); }
    };
  }

  loadCart();
  loadOrders();
});
