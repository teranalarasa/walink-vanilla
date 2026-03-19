(function () {
  "use strict";

  /* ─── State ───────────────────────────────────────────── */

  var savedIso2 = (function () {
    try {
      var raw = localStorage.getItem("selectedCountry");
      return raw ? JSON.parse(raw) : DEFAULT_COUNTRY_ISO2;
    } catch (e) {
      return DEFAULT_COUNTRY_ISO2;
    }
  })();

  var country =
    findCountryByIso2(savedIso2) ||
    countries.find(function (c) { return c.iso2 === DEFAULT_COUNTRY_ISO2; });
  var phone = "";
  var message = "";
  var dropdownOpen = false;
  var searchQuery = "";

  /* ─── DOM refs ────────────────────────────────────────── */

  function $(sel) { return document.querySelector(sel); }

  var phoneInput = $("#phone-input");
  var phonePrefix = $("#phone-prefix");
  var messageInput = $("#message-input");
  var phoneWrap = $("#phone-shake-wrap");
  var countryBtn = $("#country-btn");
  var countryDropdown = $("#country-dropdown");
  var countrySearch = $("#country-search");
  var countryList = $("#country-list");
  var countryPicker = $("#country-picker");
  var actionBtn = $("#action-btn");
  var langEn = $("#lang-en");
  var langId = $("#lang-id");
  var langToggle = $("#lang-toggle");

  function syncButtonState() {
    actionBtn.disabled = !phone.trim();
  }

  /* ─── Render helpers ──────────────────────────────────── */

  function isId() {
    return getLang() === "id";
  }

  function renderCountryButton() {
    var flag = countryBtn.querySelector(".country-flag");
    var name = countryBtn.querySelector(".country-name");
    var dial = countryBtn.querySelector(".country-dial");
    flag.textContent = countryFlag(country.iso2);
    name.textContent = isId() ? country.nameId : country.name;
    dial.textContent = "+" + country.dialCode;
  }

  function renderPhonePrefix() {
    phonePrefix.textContent = "+" + country.dialCode;
  }

  function renderCountryList() {
    var query = searchQuery.toLowerCase();
    var useId = isId();
    var filtered = countries.filter(function (c) {
      var name = useId ? c.nameId : c.name;
      return (
        name.toLowerCase().indexOf(query) !== -1 ||
        c.dialCode.indexOf(query) !== -1 ||
        c.iso2.toLowerCase().indexOf(query) !== -1
      );
    });

    if (filtered.length === 0) {
      countryList.innerHTML = '<li class="country-list-empty">&mdash;</li>';
      return;
    }

    countryList.innerHTML = filtered
      .map(function (c) {
        var sel = c.iso2 === country.iso2 ? " selected" : "";
        return (
          '<li>' +
            '<button type="button" class="country-list-item' + sel + '" data-iso2="' + c.iso2 + '">' +
              '<span class="flag">' + countryFlag(c.iso2) + '</span>' +
              '<span class="name">' + (useId ? c.nameId : c.name) + '</span>' +
              '<span class="dial">+' + c.dialCode + '</span>' +
            '</button>' +
          '</li>'
        );
      })
      .join("");
  }

  function openDropdown() {
    dropdownOpen = true;
    searchQuery = "";
    countryDropdown.classList.remove("hidden");
    countryBtn.querySelector(".country-chevron").classList.add("open");
    renderCountryList();
    requestAnimationFrame(function () { countrySearch.focus(); });
  }

  function closeDropdown() {
    dropdownOpen = false;
    searchQuery = "";
    countrySearch.value = "";
    countryDropdown.classList.add("hidden");
    countryBtn.querySelector(".country-chevron").classList.remove("open");
  }

  function selectCountry(iso2) {
    var found = findCountryByIso2(iso2);
    if (!found) return;
    country = found;
    localStorage.setItem("selectedCountry", JSON.stringify(iso2));
    renderCountryButton();
    renderPhonePrefix();
    closeDropdown();
  }

  /* ─── i18n re-render ──────────────────────────────────── */

  function renderAllText() {
    $("#card-title").textContent = t("title");
    $("#card-subtitle").textContent = t("subtitle");
    $("#country-label").textContent = t("countryLabel");
    countrySearch.placeholder = t("countrySearch");
    $("#phone-label").textContent = t("phoneLabel");
    phoneInput.placeholder = t("phonePlaceholder");
    $("#message-label").textContent = t("messageLabel");
    messageInput.placeholder = t("messagePlaceholder");
    $("#action-text").textContent = t("chatButton");
    $("#card-footer").textContent = t("footer");
    $("#seo-tagline").textContent = t("seoTagline");
    renderCountryButton();
    if (dropdownOpen) renderCountryList();
  }

  function updateLangToggle() {
    var isEn = getLang() === "en";
    langEn.classList.toggle("active", isEn);
    langId.classList.toggle("active", !isEn);
  }

  /* ─── Event listeners ─────────────────────────────────── */

  countryBtn.addEventListener("click", function () {
    dropdownOpen ? closeDropdown() : openDropdown();
  });

  countrySearch.addEventListener("input", function (e) {
    searchQuery = e.target.value;
    renderCountryList();
  });

  countryList.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-iso2]");
    if (btn) selectCountry(btn.dataset.iso2);
  });

  document.addEventListener("mousedown", function (e) {
    if (dropdownOpen && !countryPicker.contains(e.target)) {
      closeDropdown();
    }
  });

  phoneInput.addEventListener("input", function (e) {
    phone = e.target.value.replace(/[^0-9+]/g, "");
    phoneInput.value = phone;
    syncButtonState();
  });

  phoneInput.addEventListener("paste", function (e) {
    e.preventDefault();
    var raw = e.clipboardData.getData("text/plain");
    var normalized = normalizePhone(raw, country.dialCode);
    if (normalized.indexOf(country.dialCode) === 0) {
      phone = normalized.slice(country.dialCode.length);
    } else {
      phone = normalized;
    }
    phoneInput.value = phone;
    syncButtonState();
  });

  phoneInput.addEventListener("blur", function () {
    if (!phone.trim()) return;
    var normalized = normalizePhone(phone, country.dialCode);
    if (normalized.indexOf(country.dialCode) === 0) {
      phone = normalized.slice(country.dialCode.length);
    } else {
      phone = normalized;
    }
    phoneInput.value = phone;
    syncButtonState();
  });

  messageInput.addEventListener("input", function (e) {
    message = e.target.value;
  });

  actionBtn.addEventListener("click", function () {
    var raw = phone.trim();
    if (!raw) {
      phoneWrap.classList.add("shake");
      phoneWrap.addEventListener("animationend", function handler() {
        phoneWrap.removeEventListener("animationend", handler);
        phoneWrap.classList.remove("shake");
      });
      phoneInput.focus();
      return;
    }

    var normalized = normalizePhone(raw, country.dialCode);
    var url = buildWhatsAppUrl(normalized, message);
    window.open(url, "_blank", "noopener,noreferrer");
  });

  langToggle.addEventListener("click", function () {
    setLang(getLang() === "en" ? "id" : "en");
  });

  onLangChange(function () {
    updateLangToggle();
    renderAllText();
  });

  /* ─── Init ────────────────────────────────────────────── */

  renderCountryButton();
  renderPhonePrefix();
  renderAllText();
  updateLangToggle();
  syncButtonState();
  phoneInput.focus();
})();
