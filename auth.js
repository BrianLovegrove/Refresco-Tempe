(function(){
  const USERNAME = "MECH";
  const PASSWORD = "1234";

  function unlock(){
    if (document.body) {
      document.body.classList.remove('lock');
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body && document.body.classList.remove('lock');
      });
    }
  }

  // If already authorized in this session, just reveal and exit
  if (sessionStorage.getItem('auth_ok') === '1') {
    unlock();
    return;
  }

  // Prompt up to 3 times
  let ok = false;
  for (let i = 0; i < 3; i++) {
    const u = prompt("Username:");
    const p = prompt("Password:");
    if (u === USERNAME && p === PASSWORD) { ok = true; break; }
    alert("Incorrect credentials. Try again.");
  }

  if (ok) {
    sessionStorage.setItem('auth_ok', '1');
    unlock();
  } else {
    // Deny access and stop rendering
    document.open();
    document.write('<div class="auth-denied"><h2>Access Denied</h2><p>Incorrect username or password.</p></div>');
    document.close();
    throw new Error("Unauthorized");
  }
})();