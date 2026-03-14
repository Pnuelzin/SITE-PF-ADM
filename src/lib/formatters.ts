export const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 11) {
    return digits
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d)(\d{4})$/, "$1-$2");
  }
  return digits.slice(0, 11)
    .replace(/^(\d{2})(\d)/g, "($1) $2")
    .replace(/(\d)(\d{4})$/, "$1-$2");
};

export const maskCurrency = (value: string) => {
  let digits = value.replace(/\D/g, "");
  
  // Pad with zeros to ensure at least 3 digits (0,00)
  while (digits.length < 3) {
    digits = "0" + digits;
  }
  
  const integerPart = digits.slice(0, -2);
  const decimalPart = digits.slice(-2);
  
  // Remove leading zeros from integer part
  const formattedInteger = parseInt(integerPart, 10).toString();
  
  // Format with thousand separator if needed (optional based on user request "00,00")
  // The user specifically asked for "00,00" style.
  return `${formattedInteger},${decimalPart}`;
};

export const currencyToNumber = (value: string) => {
  return parseFloat(value.replace(/\./g, "").replace(",", ".")) || 0;
};
