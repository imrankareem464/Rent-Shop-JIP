// core.js — مشترکہ functions اور آن لائن ڈیٹا

let data = { shops: [], payments: [] };
let view = 'all';
let onlineReady = false;

const $ = id => document.getElementById(id);

const esc = value => String(value ?? '').replace(
  /[&<>"']/g,
  character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character])
);

const money = amount =>
  Number(amount).toLocaleString('en-PK') + ' روپے';

const uid = () => crypto.randomUUID();

function today() {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(part => [part.type, part.value])
  );

  return `${values.year}-${values.month}-${values.day}`;
}

$('month').value = today().slice(0, 7);

function paid(shop, month) {
  return data.payments
    .filter(p => p.shopId === shop.id && p.month === month)
    .reduce((total, p) => total + p.amount, 0);
}

function active(shop, month) {
  return shop.start.slice(0, 7) <= month &&
         shop.end.slice(0, 7) >= month;
}

function balance(shop, month) {
  return Math.max(0, shop.rent - paid(shop, month));
}

async function loadOnlineData() {
  onlineReady = false;

  const { data: result, error } = await supabaseClient
    .from('app_data')
    .select('data')
    .eq('id', 1)
    .maybeSingle();

  if (error) throw error;

  const record = result
    ? result.data
    : { shops: [], payments: [] };

  if (
    !record ||
    !Array.isArray(record.shops) ||
    !Array.isArray(record.payments)
  ) {
    throw new Error('آن لائن ریکارڈ کا فارمیٹ درست نہیں۔');
  }

  data = record;
  render();
  onlineReady = true;
}

async function save() {
  if (!onlineReady) {
    alert('پہلے Login کریں اور ڈیٹا لوڈ ہونے دیں۔');
    return false;
  }

  try {
    const { error } = await supabaseClient
      .from('app_data')
      .upsert({
        id: 1,
        data: data,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error(error);
    alert('ڈیٹا آن لائن محفوظ نہیں ہو سکا۔');
    return false;
  }
}