// Currency & number formatting helpers
export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(val: number | undefined | null): string {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return new Intl.NumberFormat('vi-VN').format(val);
}

export function formatDateVN(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}

// Convert number to Vietnamese words for Payslip
export function numberToVietnameseWords(num: number): string {
  if (!num || isNaN(num) || num === 0) return 'Không đồng';
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readTriple(n: number, full: boolean): string {
    let h = Math.floor(n / 100);
    let t = Math.floor((n % 100) / 10);
    let o = n % 10;
    let res = '';

    if (h > 0 || full) {
      res += digits[h] + ' trăm ';
    }
    if (t > 1) {
      res += digits[t] + ' mươi ';
      if (o === 1) res += 'mốt ';
      else if (o === 5) res += 'lăm ';
      else if (o > 0) res += digits[o] + ' ';
    } else if (t === 1) {
      res += 'mười ';
      if (o === 5) res += 'lăm ';
      else if (o > 0) res += digits[o] + ' ';
    } else {
      if ((h > 0 || full) && o > 0) res += 'lẻ ' + digits[o] + ' ';
      else if (o > 0) res += digits[o] + ' ';
    }
    return res.trim();
  }

  let s = Math.round(Math.abs(num)).toString();
  let groups: string[] = [];
  while (s.length > 0) {
    groups.unshift(s.slice(Math.max(0, s.length - 3)));
    s = s.slice(0, Math.max(0, s.length - 3));
  }

  let words = '';
  for (let i = 0; i < groups.length; i++) {
    const val = parseInt(groups[i], 10);
    if (val > 0) {
      const unit = units[groups.length - 1 - i];
      const tripleStr = readTriple(val, i > 0);
      words += tripleStr + ' ' + unit + ' ';
    }
  }

  words = words.trim().replace(/\s+/g, ' ');
  if (!words) return 'Không đồng';
  words = words.charAt(0).toUpperCase() + words.slice(1) + ' đồng chẵn.';
  return words;
}
