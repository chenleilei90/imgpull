export function formatPoints(value: number) {
  return `${value > 0 ? "+" : ""}${value} 积分`;
}

export function formatMoney(amountCents: number) {
  return `￥${(amountCents / 100).toFixed(2)}`;
}

export function maskEmail(email: string) {
  const [name, domain] = email.split("@");
  if (!domain) return email;
  return `${name.slice(0, 2)}***@${domain}`;
}
