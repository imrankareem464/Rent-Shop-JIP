// reports.js — Shop Rent Manager

function historyView(id) {
  view = 'history';
  historyShopId = id;
  updateNavigation();

  $('heading').textContent = 'وصولیوں اور رسیدوں کی تاریخ';

  $('thead').innerHTML = `
    <tr>
      <th>رسید</th>
      <th>دوکاندار / دکان</th>
      <th>مہینہ / تاریخ</th>
      <th>رقم</th>
      <th>جمع کروانے والا</th>
      <th>رسید</th>
    </tr>
  `;

  const list = data.payments.filter(p =>
    p.month === $('month').value &&
    (!id || p.shopId === id)
  );

  $('rows').innerHTML = list
    .slice()
    .reverse()
    .map(p => `
      <tr>
        <td>${esc(p.receipt)}</td>

        <td>
          ${esc(p.snapshot.tenant)}<br>
          ${esc(p.snapshot.name)} / ${esc(p.snapshot.no)}
        </td>

        <td>
          ${esc(p.month)}<br>
          ${esc(p.date)}
        </td>

        <td>${money(p.amount)}</td>
        <td>${esc(p.payer)}</td>

        <td>
          <button
            data-receipt-id="${esc(p.id)}"
            onclick="receipt(this.dataset.receiptId)">
            پرنٹ
          </button>
        </td>
      </tr>
    `)
    .join('');

  $('empty').textContent =
    list.length ? '' : 'اس مہینے کوئی رسید نہیں۔';
}


function csv() {
  const m = $('month').value;

  if (!m) {
    alert('پہلے رپورٹ کا مہینہ منتخب کریں۔');
    return;
  }

  let rows;

  if (view === 'history') {
    // رسیدوں کی تاریخ
    rows = [[
      'رسید نمبر',
      'دکان نمبر',
      'دکان',
      'دوکاندار',
      'مہینہ',
      'تاریخ',
      'وصول شدہ رقم',
      'جمع کروانے والا',
      'ادائیگی کا طریقہ'
    ]];

    data.payments
      .filter(p =>
        p.month === m &&
        (!historyShopId || p.shopId === historyShopId)
      )
      .slice()
      .reverse()
      .forEach(p => {
        rows.push([
          p.receipt,
          p.snapshot.no,
          p.snapshot.name,
          p.snapshot.tenant,
          p.month,
          p.date,
          p.amount,
          p.payer,
          p.method
        ]);
      });

  } else {
    // معاہدے کی تاریخیں صرف تمام دکانوں میں دکھائیں
    const showAgreement = view === 'all';

    const headings = [
      'دکان نمبر',
      'دکان',
      'دوکاندار',
      'کاروبار'
    ];

    if (showAgreement) {
      headings.push(
        'معاہدے کی ابتدا',
        'معاہدے کا اختتام'
      );
    }

    headings.push(
      'کرایہ کا مہینہ',
      'ماہانہ کرایہ — فی دکان',
      'کل وصولی — فی دکان',
      'باقی رقم — فی دکان',
      'سٹیٹس',
      'رسید نمبر',
      'رسید کی تاریخ',
      'اس رسید کی رقم',
      'جمع کروانے والا',
      'ادائیگی کا طریقہ'
    );

    rows = [headings];

    const query = $('search').value.trim().toLowerCase();

    const shops = data.shops.filter(s => {
      const matchesSearch = [
        s.name,
        s.no,
        s.tenant,
        s.type
      ].join(' ').toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (view === 'all') return true;

      if (!active(s, m)) return false;

      return view === 'received'
        ? balance(s, m) === 0
        : balance(s, m) > 0;
    });

    shops.forEach(s => {
      const isActive = active(s, m);

      const payments = data.payments.filter(p =>
        p.shopId === s.id && p.month === m
      );

      const status = isActive
        ? (balance(s, m) > 0 ? 'Pending' : 'Received')
        : 'غیر فعال';

      const shopDetails = [
        s.no,
        s.name,
        s.tenant,
        s.type
      ];

      if (showAgreement) {
        shopDetails.push(s.start, s.end);
      }

      shopDetails.push(m);

      const totals = [
        isActive ? s.rent : '',
        isActive ? paid(s, m) : '',
        isActive ? balance(s, m) : ''
      ];

      if (payments.length === 0) {
        rows.push([
          ...shopDetails,
          ...totals,
          status,
          'کوئی رسید نہیں',
          '',
          '',
          '',
          ''
        ]);

        return;
      }

      payments.forEach((p, index) => {
        rows.push([
          ...shopDetails,

          // مجموعی رقم صرف پہلی رسید کی قطار میں
          ...(index === 0 ? totals : ['', '', '']),

          status,
          p.receipt,
          p.date,
          p.amount,
          p.payer,
          p.method
        ]);
      });
    });
  }

  const csvText = '\uFEFF' + rows
    .map(row =>
      row.map(value => {
        const text = String(value ?? '')
          .replace(/^[=+@-]/, "'$&")
          .replace(/"/g, '""');

        return '"' + text + '"';
      }).join(',')
    )
    .join('\r\n');

  download(
    csvText,
    'rent-report-' + view + '-' + m + '.csv',
    'text/csv;charset=utf-8'
  );
}