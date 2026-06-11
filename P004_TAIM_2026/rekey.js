#!/usr/bin/env node
'use strict';
/**
 * rekey.js — encrypts correct answers in all test HTML files.
 * Removes "correct" field from questions JSON.
 * Adds "_k" field: base64-encoded encrypted answer array.
 * Encryption: byte[i] = (correct + 65) XOR KEY[i%8] XOR (i & 0xFF)
 */
const fs = require('fs');
const path = require('path');

const KEY = [0x4A, 0x1F, 0x63, 0x2B, 0x77, 0x0E, 0x55, 0x3C];

function encodeAnswers(questions) {
  const bytes = questions.map(function(q, i) {
    var c = (q.correct !== undefined && q.correct !== null) ? q.correct : 0;
    return (c + 65) ^ KEY[i % KEY.length] ^ (i & 0xFF);
  });
  return Buffer.from(bytes).toString('base64');
}

/* Bracket-matching extractor for var CONFIG = {...} */
function extractConfigBlock(html) {
  var pat = /var\s+CONFIG\s*=\s*/;
  var startIdx = html.search(pat);
  if (startIdx === -1) return null;

  var eqIdx = html.indexOf('=', startIdx) + 1;
  var i = eqIdx;
  while (i < html.length && (html[i] === ' ' || html[i] === '\n' || html[i] === '\r')) i++;
  if (html[i] !== '{') return null;

  var depth = 0, inStr = false, strCh = '', j = i;
  while (j < html.length) {
    var ch = html[j];
    if (inStr) {
      if (ch === '\\') { j += 2; continue; }
      if (ch === strCh) inStr = false;
    } else {
      if (ch === '"' || ch === "'") { inStr = true; strCh = ch; }
      else if (ch === '{') depth++;
      else if (ch === '}') { depth--; if (depth === 0) break; }
    }
    j++;
  }
  return { start: i, end: j + 1 };
}

const DIR = __dirname;
const files = fs.readdirSync(DIR).filter(function(f) {
  return /^test-.*\.html$/.test(f);
}).sort();

var ok = 0, skip = 0, fail = 0;

for (var fi = 0; fi < files.length; fi++) {
  var file = files[fi];
  var filepath = path.join(DIR, file);
  var html = fs.readFileSync(filepath, 'utf8');

  var block = extractConfigBlock(html);
  if (!block) { console.log('SKIP  ' + file + ' (no CONFIG found)'); skip++; continue; }

  var configCode = html.slice(block.start, block.end);
  var config;
  try {
    config = (new Function('return ' + configCode))();
  } catch(e) {
    console.error('FAIL  ' + file + ': ' + e.message);
    fail++;
    continue;
  }

  if (!config.questions || !config.questions.length) {
    console.log('SKIP  ' + file + ' (no questions)');
    skip++;
    continue;
  }

  /* Already re-keyed? (no correct field + has _k) */
  var alreadyKeyed = config._k && !config.questions[0].hasOwnProperty('correct');
  if (alreadyKeyed) {
    console.log('SKIP  ' + file + ' (already keyed)');
    skip++;
    continue;
  }

  /* Encode answers */
  var _k = encodeAnswers(config.questions);

  /* Strip correct from each question */
  config.questions.forEach(function(q) {
    delete q.correct;
  });
  config._k = _k;

  /* Re-serialize and write back */
  var newCfg = JSON.stringify(config, null, 2);
  var newHtml = html.slice(0, block.start) + newCfg + html.slice(block.end);
  fs.writeFileSync(filepath, newHtml, 'utf8');
  console.log('OK    ' + file + '  (key=' + _k.slice(0, 12) + '...)');
  ok++;
}

console.log('\nDone: ' + ok + ' keyed, ' + skip + ' skipped, ' + fail + ' failed');
