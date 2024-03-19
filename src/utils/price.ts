export function formatBigAmountMoney(number: number, floatLength = 0) {
  if (number < 10000000) {
    return (number / 1000000).toFixed(floatLength) + '百万';
  }
  if (number < 100000000) {
    return (number / 10000000).toFixed(floatLength) + '千万';
  }
  return (number / 100000000).toFixed(floatLength) + '亿';
}
