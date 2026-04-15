// Accessibility helpers: font-size controls and persistence
const FontSizes = { small: '14px', medium: '16px', large: '18px' };
function applyFontSize(key){
  const v = FontSizes[key] || FontSizes.medium;
  document.documentElement.style.setProperty('--base-font-size', v);
  localStorage.setItem('zofri_font_size', key);
  const btns = document.querySelectorAll('.font-controls button');
  btns.forEach(b=> b.setAttribute('aria-pressed', b.dataset.size===key ? 'true' : 'false'));
}

document.addEventListener('DOMContentLoaded', ()=>{
  // Wire buttons
  const dec = document.getElementById('decreaseFont');
  const res = document.getElementById('resetFont');
  const inc = document.getElementById('increaseFont');
  if(dec && res && inc){
    dec.onclick = ()=> applyFontSize('small');
    res.onclick = ()=> applyFontSize('medium');
    inc.onclick = ()=> applyFontSize('large');
    // set data-size attributes for styling
    dec.dataset.size='small'; res.dataset.size='medium'; inc.dataset.size='large';
  }
  // Apply stored preference
  const pref = localStorage.getItem('zofri_font_size') || 'medium';
  applyFontSize(pref);
});

// Expose API
window.zofriAccessibility = { applyFontSize, FontSizes };
