var _translations = {
  en: {
    title: "WALink",
    subtitle: "Send a message without saving the number",
    countryLabel: "Country",
    countrySearch: "Search country or dial code...",
    phoneLabel: "Phone Number",
    phonePlaceholder: "e.g. 0812 3456 7890",
    messageLabel: "Message (optional)",
    messagePlaceholder: "Hi, I saw your listing...",
    chatButton: "Chat on WhatsApp",
    emptyPhone: "Please enter a phone number",
    footer: "Messages open directly in WhatsApp",
    seoTagline: "Chat instantly, no contact save needed",
  },
  id: {
    title: "WALink",
    subtitle: "Kirim pesan tanpa menyimpan nomor",
    countryLabel: "Negara",
    countrySearch: "Cari negara atau kode telepon...",
    phoneLabel: "Nomor Telepon",
    phonePlaceholder: "cth. 0812 3456 7890",
    messageLabel: "Pesan (opsional)",
    messagePlaceholder: "Halo, saya melihat iklan Anda...",
    chatButton: "Chat di WhatsApp",
    emptyPhone: "Silakan masukkan nomor telepon",
    footer: "Pesan dibuka langsung di WhatsApp",
    seoTagline: "Chat langsung, tanpa simpan kontak",
  },
};

var _currentLang = localStorage.getItem("lang") || "en";
var _langListeners = [];

function t(key) {
  var lang = _translations[_currentLang];
  if (lang && lang[key] != null) return lang[key];
  return _translations.en[key] || key;
}

function getLang() {
  return _currentLang;
}

function setLang(lang) {
  if (lang === _currentLang) return;
  _currentLang = lang;
  localStorage.setItem("lang", lang);
  _langListeners.forEach(function (fn) { fn(lang); });
}

function onLangChange(fn) {
  _langListeners.push(fn);
}
