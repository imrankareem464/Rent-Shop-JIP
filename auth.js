// Admin login and logout; existing Supabase account.
const SUPABASE_URL='https://ymnxuxbecpnywdeyyluo.supabase.co'; const SUPABASE_PUBLISHABLE_KEY='sb_publishable_JbMRq7bpswSKN0LIuHiHww_qAcvBW0P'; const ADMIN_EMAIL='officeemailjip@gmail.com'; const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY); 
function showLogin() {
  onlineReady = false;
  $('appMain').hidden = true;
  $('loginScreen').style.display = 'flex';
  $('password').value = '';
  document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
  data = { shops: [], payments: [] };
  view = 'all';
  historyShopId = undefined;
  render();
}
function showApplication() {
  $('loginScreen').style.display = 'none';
  $('appMain').hidden = false;
  $('password').value = '';
}
$('loginForm').addEventListener('submit', async event => {
  event.preventDefault();
  $('loginError').textContent = '';
  if ($('username').value.trim() !== 'admin') {
    $('loginError').textContent = 'Username درست نہیں ہے۔';
    return;
  }
  const button = $('loginButton');
  button.disabled = true;
  button.textContent = 'انتظار کریں…';
  try {
    const { data: result, error } = await supabaseClient.auth.signInWithPassword({
      email: ADMIN_EMAIL, password: $('password').value
    });
    if (error || result.user?.email !== ADMIN_EMAIL) {
      throw new Error('Username یا Password درست نہیں۔');
    }
    await loadOnlineData();
    showApplication();
  } catch (error) {
    $('loginError').textContent = 'Login یا ڈیٹا لوڈ نہیں ہو سکا۔ معلومات اور انٹرنیٹ چیک کریں۔';
    console.error(error);
  } finally {
    button.disabled = false;
    button.textContent = 'Login';
  }
});
async function logoutAdmin() {
  try {
    const { error } = await supabaseClient.auth.signOut();
    if (error) throw error;
    showLogin();
    $('loginError').textContent = '';
  } catch (error) {
    alert('Logout نہیں ہو سکا۔ دوبارہ کوشش کریں۔');
  }
}
async function checkAdminSession() {
  try {
    const { data: result, error } = await supabaseClient.auth.getUser();
    if (error || result.user?.email !== ADMIN_EMAIL) {
      showLogin();
      return;
    }
    await loadOnlineData();
    showApplication();
  } catch (error) {
    showLogin();
    $('loginError').textContent = 'ڈیٹا لوڈ نہیں ہو سکا۔ دوبارہ Login کریں۔';
  }
}
supabaseClient.auth.onAuthStateChange(event => {
  if (event === 'SIGNED_OUT') showLogin();
});
