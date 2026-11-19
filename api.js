// api.js - jembatan GitHub Pages -> Google Apps Script
// Meniru google.script.run supaya kode di index.html & admin.html tidak perlu ditulis ulang.
(function () {
  // GANTI dengan URL Web App (berakhiran /exec) dari Deploy -> Manage deployments
  var API_URL = "https://script.google.com/macros/s/AKfycbycDqUFFLZt1QRXAm4MTnl3euHQTYxka1j9SPr2dSoexxsBRudHPn-XS79O_C_8ia2w/exec";

  var token = ""; // diisi otomatis setelah loginAdmin sukses

  function runner(ok, fail) {
    return new Proxy({}, {
      get: function (_, name) {
        if (name === "withSuccessHandler") return function (f) { return runner(f, fail); };
        if (name === "withFailureHandler") return function (f) { return runner(ok, f); };
        if (typeof name !== "string") return undefined;
        return function () {
          var args = Array.prototype.slice.call(arguments);
          fetch(API_URL, {
            method: "POST",
            // text/plain = "simple request", jadi tidak kena preflight CORS
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ fn: name, args: args, token: token })
          })
            .then(function (r) { return r.json(); })
            .then(function (j) {
              if (!j.ok) throw new Error(j.error || "Request gagal");
              if (name === "loginAdmin" && j.data && j.data.token) token = j.data.token;
              return j.data;
            })
            .then(
              function (d) { if (ok) ok(d); },
              function (e) { if (fail) fail(e); else console.error(e); }
            );
        };
      }
    });
  }

  window.google = { script: { get run() { return runner(null, null); } } };
})();
