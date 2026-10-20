// payments.js — Shop Rent Manager
function paymentForm(id) {
  const s = data.shops.find(x => x.id === id);
  const m = $('month').value;
  const b = balance(s, m);
  let receiptIndex = data.payments.length + 1;
  let suggestedReceipt;
  do {
    suggestedReceipt = 'R-' + String(receiptIndex++).padStart(6, '0');
  } while (data.payments.some(p => String(p.receipt).trim().toLowerCase() === suggestedReceipt.toLowerCase()));

  $('formTitle').textContent = 'کرایہ وصولی — ' + s.name;
  $('fields').innerHTML =
    input('receipt', 'رسید نمبر', 'text', suggestedReceipt) +
    input('payer', 'پیسے جمع کروانے والے کا نام', 'text', s.tenant) +
    input('amount', 'وصول شدہ رقم', 'number', b) +
    input('date', 'جمع کروانے کی تاریخ', 'date', today()) +
    '<label>ادائیگی کا طریقہ<select name="method"><option>نقد</option><option>بینک</option><option>آن لائن</option></select></label>';
  $('error').textContent = '';

  $('editor').onsubmit = async e => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(e.target));
    v.receipt = v.receipt.trim();
    if (!v.receipt) {
      $('error').textContent = 'رسید نمبر درج کریں۔';
      return;
    }
    if (data.payments.some(p => String(p.receipt).trim().toLowerCase() === v.receipt.toLowerCase())) {
      $('error').textContent = 'یہ رسید نمبر پہلے موجود ہے۔ دوسرا نمبر درج کریں۔';
      return;
    }
    const amount = Number(v.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      $('error').textContent = 'درست وصول شدہ رقم درج کریں۔';
      return;
    }
    if (amount > balance(s, m)) {
      $('error').textContent = 'رقم باقی کرایے سے زیادہ ہے۔';
      return;
    }
    const p = {
      ...v,
      id: uid(),
      shopId: id,
      month: m,
      amount,
      snapshot: { ...s }
    };
    data.payments.push(p);
    if (!await save()) {
      data.payments.pop();
      return;
    }
    $('form').close();
    render();
    receipt(p.id);
  };
  $('form').showModal();
}
