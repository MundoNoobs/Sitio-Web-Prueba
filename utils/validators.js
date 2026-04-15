function validarRut(rut) {
  if (!rut) return false;
  const original = String(rut).toUpperCase();
  const clean = original.replace(/\./g, '').replace(/-/g, '').trim();
  const body = clean.slice(0, -1);
  let dv = clean.slice(-1);
  if (!/^[0-9]+$/.test(body)) return false;
  let sum = 0;
  let multiplier = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body.charAt(i), 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  const res = 11 - (sum % 11);
  let dvExpected = res === 11 ? '0' : res === 10 ? 'K' : String(res);
  return dvExpected === dv;
}

function isValidEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return false;
  const domain = email.split('@')[1].toLowerCase();
  const common = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com', 'msn.com'];
  if (common.includes(domain)) return true;
  return domain.includes('.');
}

module.exports = { validarRut, isValidEmail };
