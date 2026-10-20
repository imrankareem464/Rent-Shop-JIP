// views.js — Shop Rent Manager
let historyShopId;

function updateNavigation() {
  const buttons = document.querySelectorAll(
    'nav button[data-view]'
  );

  buttons.forEach(button => {
    const selected = button.dataset.view === view;

    button.classList.toggle('secondary', !selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
function render(){
  updateNavigation();

  if (view === 'history') {
    historyView(historyShopId);
    return;
  }const m=$('month').value;if(!m)return;const all=data.shops.filter(s=>active(s,m));const due=all.reduce((a,s)=>a+s.rent,0),got=all.reduce((a,s)=>a+paid(s,m),0),pending=all.filter(s=>balance(s,m)>0);$('cards').innerHTML=[['فعال دکانیں',all.length],['کل ماہانہ کرایہ',money(due)],['وصول شدہ',money(got)],['باقی رقم',money(due-got)]].map(x=>`<div class="card"><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('');$('heading').textContent= view==='all'?'دکانیں اور ماہانہ کرایہ':view==='received'?'وصول شدہ کرایوں کی رپورٹ':'باقی کرایوں کی رپورٹ';$('thead').innerHTML='<tr><th>دکان / نمبر</th><th>دوکاندار / کاروبار</th><th>معاہدہ</th><th>کرایہ / باقی</th><th>سٹیٹس</th><th>کارروائی</th></tr>';const q=$('search').value.trim().toLowerCase();const list=data.shops.filter(s=>[s.name,s.no,s.tenant,s.type].join(' ').toLowerCase().includes(q)).filter(s=>view==='all'||active(s,m)&&(view==='received'?balance(s,m)===0:balance(s,m)>0));$('rows').innerHTML=list.map(s=>{let a=active(s,m),b=balance(s,m);return `<tr><td><b>${esc(s.name)}</b><br>نمبر ${esc(s.no)}</td><td>${esc(s.tenant)}<br><small>${esc(s.type)}</small></td><td dir="ltr">${esc(s.start)}<br>${esc(s.end)}</td><td>${money(s.rent)}<br><small>${a?'باقی: '+money(b):'اس مہینے غیر فعال'}</small></td><td><span class="badge ${a&&!b?'received':''}">${a?(b?'Pending':'Received'):'غیر فعال'}</span></td><td><button class="secondary" onclick="shopForm('${s.id}')">ترمیم</button> ${a&&b?`<button onclick="paymentForm('${s.id}')">وصولی</button> <button class="secondary" onclick="notice('${s.id}')">خط</button>`:''} ${a&&paid(s,m)>0?`<button class="secondary" onclick="historyView('${s.id}')">رسیدیں</button>`:''}</td></tr>`}).join('');$('empty').textContent=list.length?'':'کوئی ریکارڈ نہیں۔ نئی دکان شامل کریں یا رپورٹ کا مہینہ تبدیل کریں۔'}
