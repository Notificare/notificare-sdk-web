export function isAppleDevice(): boolean {
  const expression = /Mac|iPhone|iPod|iPad/i;
  return expression.test(navigator.userAgent);
}

export function isChromeBrowser(): boolean {
  const expression = /Chrome/i;
  return expression.test(navigator.userAgent);
}

export function isSafariBrowser(): boolean {
  const expression = /Safari/i;
  return expression.test(navigator.userAgent) && !isChromeBrowser();
}
