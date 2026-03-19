function normalizePhone(raw, dialCode) {
  var digits = raw.replace(/\D/g, "");

  if (!digits) return "";

  if (dialCode === "62") {
    if (digits.startsWith("0")) {
      digits = "62" + digits.slice(1);
    } else if (digits.startsWith("62")) {
      // already has country code
    } else if (/^[1-9]/.test(digits)) {
      digits = "62" + digits;
    }
  } else {
    if (!digits.startsWith(dialCode)) {
      if (digits.startsWith("0")) {
        digits = dialCode + digits.slice(1);
      } else {
        digits = dialCode + digits;
      }
    }
  }

  return digits;
}

function buildWhatsAppUrl(phone, message) {
  var url = "https://wa.me/" + phone;
  if (message && message.trim()) {
    url += "?text=" + encodeURIComponent(message.trim());
  }
  return url;
}
