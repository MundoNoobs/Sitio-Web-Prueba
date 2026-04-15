function validarRutClient(rut){
  if(!rut) return false;
  const original = String(rut).toUpperCase();
  const clean = original.replace(/\./g,'').replace(/-/g,'').trim();
  const body = clean.slice(0,-1);
  const dv = clean.slice(-1);
  if(!/^[0-9]+$/.test(body)) return false;
  let sum=0;let mult=2;
  for(let i=body.length-1;i>=0;i--){ sum+=parseInt(body.charAt(i),10)*mult; mult=mult===7?2:mult+1; }
  const res = 11 - (sum%11);
  const dvExp = res===11? '0' : res===10? 'K' : String(res);
  return dvExp === dv;
}

async function postJSON(url, body){
  const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
  const ct = res.headers.get('content-type') || '';
  let data;
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }
  if (!res.ok) {
    const msg = (data && data.msg) ? data.msg : (typeof data === 'string' ? data : 'Error servidor');
    throw new Error(msg);
  }
  return data;
}

document.addEventListener('DOMContentLoaded', ()=>{
  const tabUser = document.getElementById('tabUser');
  const tabVendor = document.getElementById('tabVendor');
  if(tabUser && tabVendor){
    const userForm = document.getElementById('userLogin');
    const vendorForm = document.getElementById('vendorLogin');
    tabUser.onclick = ()=>{ userForm.style.display='block'; vendorForm.style.display='none'; };
    tabVendor.onclick = ()=>{ userForm.style.display='none'; vendorForm.style.display='block'; };
  }

  const loginUserBtn = document.getElementById('loginUserBtn');
  if(loginUserBtn){ loginUserBtn.onclick = async ()=>{
    try {
      const email = document.getElementById('userEmail').value;
      const password = document.getElementById('userPassword').value;
      const r = await postJSON('/api/auth/login',{ email, password });
      if(r.msg==='OK' && r.user) { localStorage.setItem('zofri_user', JSON.stringify(r.user)); location.href='/'; } else alert(r.msg||'Error');
    } catch (e) {
      alert(e.message || 'Fallo del servidor');
    }
  }}

  const loginVendorBtn = document.getElementById('loginVendorBtn');
  if(loginVendorBtn){ loginVendorBtn.onclick = async ()=>{
    try {
      const localIdRaw = document.getElementById('vendorId').value;
      const localId = Number(localIdRaw);
      const email = document.getElementById('vendorEmail').value;
      const password = document.getElementById('vendorPassword').value;
      const r = await postJSON('/api/vendors/login',{ localId, email, password });
      if(r.msg==='OK' && r.vendor) { localStorage.setItem('zofri_vendor', JSON.stringify(r.vendor)); location.href='/vendor.html?localId='+localId; } else alert(r.msg||'Error');
    } catch (e) {
      alert(e.message || 'Fallo del servidor');
    }
  }}

  const registerBtn = document.getElementById('registerBtn');
  if(registerBtn){ registerBtn.onclick = async ()=>{
    try {
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const rut = document.getElementById('rut').value;
      const address = document.getElementById('address').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      if(!validarRutClient(rut)){ alert('RUT inválido'); return; }
      const r = await postJSON('/api/auth/register',{ firstName,lastName,rut,address,email,password });
      if(r.userId) { alert('Registrado correctamente'); location.href='/login.html'; } else alert(r.msg||'Error');
    } catch (e) {
      alert(e.message || 'Fallo del servidor');
    }
  }}
});
