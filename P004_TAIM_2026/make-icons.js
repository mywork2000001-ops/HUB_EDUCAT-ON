#!/usr/bin/env node
'use strict';
const zlib = require('zlib');
const fs   = require('fs');
const path = require('path');

// CRC32 table
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[i] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ CRC[(c ^ buf[i]) & 0xFF];
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const tb = Buffer.from(type, 'ascii');
  const lb = Buffer.alloc(4); lb.writeUInt32BE(data.length);
  const cb = Buffer.alloc(4); cb.writeUInt32BE(crc32(Buffer.concat([tb, data])));
  return Buffer.concat([lb, tb, data, cb]);
}

function makePNG(size) {
  const BLUE  = [30, 60, 114];     // #1e3c72
  const BLUE2 = [42, 82, 152];     // #2a5298
  const WHITE = [255, 255, 255];
  const BG    = [244, 246, 249];   // #f4f6f9

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const rowLen = 1 + size * 3;
  const raw = Buffer.alloc(size * rowLen);

  const cx = size / 2, cy = size / 2;
  const r  = size * 0.44; // outer circle radius
  const cr = size * 0.18; // corner rounding for square

  for (let y = 0; y < size; y++) {
    raw[y * rowLen] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      const dx = x - cx, dy = y - cy;

      // Rounded square mask (maskable icon safe zone = inner 80%)
      const ax = Math.abs(dx) - (size * 0.5 - cr);
      const ay = Math.abs(dy) - (size * 0.5 - cr);
      const inSquare = ax <= 0 || ay <= 0 || (ax * ax + ay * ay) <= cr * cr;

      let color;
      if (!inSquare) {
        color = BG;
      } else {
        // Gradient: top-left darker, bottom-right lighter
        const t = (dx + dy) / (size * 1.4) + 0.5;
        const br = Math.round(BLUE[0] + (BLUE2[0] - BLUE[0]) * t);
        const bg = Math.round(BLUE[1] + (BLUE2[1] - BLUE[1]) * t);
        const bb = Math.round(BLUE[2] + (BLUE2[2] - BLUE[2]) * t);

        // White "T" letter (TAİM) centered
        const rx = dx / size, ry = dy / size;
        const topBar = ry >= -0.27 && ry <= -0.08 && rx >= -0.30 && rx <= 0.30;
        const stem   = rx >= -0.07 && rx <= 0.07  && ry >= -0.08 && ry <= 0.30;

        color = (topBar || stem) ? WHITE : [br, bg, bb];
      }

      const off = y * rowLen + 1 + x * 3;
      raw[off] = color[0]; raw[off+1] = color[1]; raw[off+2] = color[2];
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

const dir = path.join(__dirname, 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

[192, 512].forEach(size => {
  const buf = makePNG(size);
  const fp  = path.join(dir, `icon-${size}.png`);
  fs.writeFileSync(fp, buf);
  console.log(`OK  icons/icon-${size}.png  (${buf.length} bytes)`);
});
