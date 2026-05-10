/**
 * 加解密模块 — 移植自 Rust 实现
 * 43 字符编码表，encode/decode 试剂编号与批号
 */

const TABLE = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-+/$.% ';

export function encode(id: number, lot: number): string {
  let val = ((lot & 0xff) << 8) | (id & 0xff);
  val ^= 0xe19a;
  let out = '';
  for (let i = 0; i < 3; i++) {
    out += TABLE[val % 43];
    val = Math.floor(val / 43);
  }
  return out;
}

export function decode(chars: string): [number, number] | null {
  if (chars.length < 3) return null;
  const indices: number[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = TABLE.indexOf(chars[i].toUpperCase());
    if (idx === -1) return null;
    indices.push(idx);
  }
  const val = (indices[0] + indices[1] * 43 + indices[2] * 43 * 43) ^ 0xe19a;
  return [val & 0xff, (val >> 8) & 0xff];
}
