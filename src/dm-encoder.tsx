/**
 * Data Matrix ECC200 编码器 — 纯 JS 实现
 * 支持 3 字符输入（试剂编码），输出 16×16 矩阵
 */

import React from 'react';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

// region GF(256) 算术 — 多项式 x^8 + x^5 + x^3 + x^2 + 1

const EXP = new Uint8Array(256);
const LOG = new Uint8Array(256);

function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    EXP[i] = x;
    LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x12d : 0);
  }
  EXP[255] = EXP[0];
}

initGF();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return EXP[(LOG[a] + LOG[b]) % 255];
}

// 预计算 RS(7,14) generator polynomial 系数
const RS_NSYM = 7;
const GEN_POLY = computeGenPoly();

function computeGenPoly(): number[] {
  let g = [1];
  for (let i = 0; i < RS_NSYM; i++) {
    const ng = new Array(g.length + 1).fill(0);
    for (let j = 0; j < g.length; j++) {
      ng[j] ^= g[j];
      ng[j + 1] ^= gfMul(g[j], EXP[i]);
    }
    g = ng;
  }
  return g;
}

function rsEncode(data: number[]): number[] {
  const res = new Array(RS_NSYM).fill(0);
  for (let i = 0; i < data.length; i++) {
    const feedback = data[i] ^ res[0];
    res.shift();
    res.push(0);
    if (feedback !== 0) {
      for (let j = 0; j < RS_NSYM; j++) {
        res[j] ^= gfMul(feedback, GEN_POLY[j + 1]);
      }
    }
  }
  return res;
}

// endregion

// region Data Matrix 矩阵生成

const MATRIX_SIZE = 18; // 16x16 data + 2 finder pattern
const DATA_REGION_SIZE = 16;

function encodeData(input: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < input.length; i++) {
    bytes.push(input.charCodeAt(i) & 0x7f);
  }
  // pad to 7 data codewords
  while (bytes.length < 7) {
    bytes.push(bytes.length === input.length ? 129 : 129 + ((bytes.length - input.length - 1) % 249) + 1);
  }
  return bytes.slice(0, 7);
}

function codewordsToBits(cws: number[]): boolean[] {
  const bits: boolean[] = [];
  for (const cw of cws) {
    for (let b = 7; b >= 0; b--) {
      bits.push(((cw >> b) & 1) === 1);
    }
  }
  return bits;
}

function createMatrix(bits: boolean[]): boolean[][] {
  const n = MATRIX_SIZE;
  const grid: boolean[][] = Array.from({ length: n }, () => Array(n).fill(false));

  // Finder pattern
  for (let i = 0; i < n; i++) {
    grid[n - 1][i] = i % 2 === 0; // bottom row
    grid[i][n - 1] = i % 2 === 0; // right col
  }
  for (let i = 0; i < n - 1; i += 2) {
    grid[n - 1][i] = true;
    grid[i][n - 1] = true;
  }
  for (let i = 1; i < n - 1; i += 2) {
    grid[n - 2][i] = true; // second-to-bottom row
    grid[i][n - 2] = true; // second-to-right col
  }

  // Place data bits using diagonal walk
  let biti = 0;
  let r = n - 1;
  let c = n - 1;
  while (r >= 0 && c >= 0) {
    if (r === n - 1 && c === n - 1 && biti === 0) {
      if (biti < bits.length) grid[r][c] = bits[biti++];
      r--;
      c--;
      continue;
    }
    if (r === -1 && c === n - 3) {
      r = 0;
      c = n - 3;
    } else if (r === -1 && c === n - 1) {
      r = 0;
      c = n - 1;
    }
    if (r === 0 && c === 0) break;
    if (r < 0 || c < 0) break;
    if (r < n && c < n && biti < bits.length) {
      grid[r][c] = bits[biti++];
    }
    r -= 2;
    c += 2;
    if (r < 0 || c >= n) {
      r += 3;
      c -= 1;
      while (r >= n || c < 0) {
        r -= 2;
        c += 2;
      }
    }
  }

  return grid;
}

export function encodeDM(input: string): boolean[][] {
  const data = encodeData(input);
  const ecc = rsEncode(data);
  const allCws = [...data, ...ecc];
  const bits = codewordsToBits(allCws);
  return createMatrix(bits);
}

// endregion

// region React Native 组件

interface DMCodeProps {
  data: string;
  size?: number;
  showLabel?: boolean;
  label?: string;
}

export function DataMatrixCode({ data, size = 200, showLabel = false, label = '' }: DMCodeProps) {
  const grid = encodeDM(data);
  const matrixSize = grid.length;
  const cellSize = size / matrixSize;

  const cells: React.ReactElement[] = [];
  for (let y = 0; y < matrixSize; y++) {
    for (let x = 0; x < matrixSize; x++) {
      if (grid[y][x]) {
        cells.push(
          <Rect
            key={`${y}-${x}`}
            x={x * cellSize}
            y={y * cellSize}
            width={cellSize}
            height={cellSize}
            fill="#000000"
          />
        );
      }
    }
  }

  const svgHeight = showLabel ? size + 24 : size;

  return (
    <Svg width={size} height={svgHeight} viewBox={`0 0 ${size} ${svgHeight}`}>
      <Rect x={0} y={0} width={size} height={size} fill="#ffffff" />
      {cells}
      {showLabel && label ? (
        <SvgText
          x={size / 2}
          y={size + 16}
          textAnchor="middle"
          fontSize={14}
          fill="#333333"
          fontWeight="600"
        >
          {label}
        </SvgText>
      ) : null}
    </Svg>
  );
}

// endregion
