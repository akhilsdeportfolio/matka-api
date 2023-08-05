export function getAmount(lines) {  
    return lines.reduce((ac, el) => ac + Number(el.stake), 0);
  }