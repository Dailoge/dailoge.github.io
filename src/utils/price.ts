export function formatFDE(number: number) {
  if (number < 10000000) {
    return (number / 1000000).toFixed(1) + '百万';
  }
  if (number < 100000000) {
    return (number / 10000000).toFixed(1) + '千万';
  }
  return (number / 100000000).toFixed(1) + '亿';
}
