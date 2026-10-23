const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

function startServer(root, port = 0) {
  const mime = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.json': 'application/json',
  };
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const fp = path.join(root, u === '/' ? 'index.html' : u);
    if (!fp.startsWith(root) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'application/octet-stream' });
    fs.createReadStream(fp).pipe(res);
  });
  return new Promise(resolve => srv.listen(port, '127.0.0.1', () => resolve(srv)));
}

(async () => {
  const root = process.cwd();
  const srv = await startServer(root);
  const port = srv.address().port;
  const url = `http://127.0.0.1:${port}/index.html`;
  console.log('Server started at', url);

  const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();

  const errors = [];
  const failedReqs = [];
  page.on('pageerror', err => errors.push(err.message));
  page.on('response', res => {
    if (res.status() >= 400) failedReqs.push(`${res.status()} ${res.url()}`);
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 15000 });

  // Dismiss title screen if active
  await page.evaluate(() => {
    if (window.SHELL && typeof SHELL.start === 'function' && document.body.classList.contains('titling')) {
      const btn = document.querySelector('#tContinue:not([hidden]), #tNew');
      if (btn) btn.click();
    }
    document.body.classList.remove('titling');
    const t = document.getElementById('title');
    if (t) t.style.display = 'none';
  });
  await page.waitForTimeout(300);

  // 1. Audit all DEF items & verify milk vs yuzu Lv1-Lv5 sprites are loaded and completely distinct
  const spriteAudit = await page.evaluate(() => {
    const { DEF, VAR, IMG } = window.__dbg;
    const imgMap = {};
    for (const [k, d] of Object.entries(DEF)) {
      if (d.img) {
        imgMap[d.img] = imgMap[d.img] || [];
        imgMap[d.img].push(k);
      }
    }
    const duplicateDefs = Object.entries(imgMap).filter(([, ks]) => ks.length > 1);

    const compareCanvases = (c1, c2) => {
      if (!c1 || !c2) return { ok: false, reason: 'missing canvas' };
      const w = 64, h = 64;
      const g1 = document.createElement('canvas'); g1.width = w; g1.height = h;
      const g2 = document.createElement('canvas'); g2.width = w; g2.height = h;
      g1.getContext('2d').drawImage(c1, 0, 0, w, h);
      g2.getContext('2d').drawImage(c2, 0, 0, w, h);
      const d1 = g1.getContext('2d').getImageData(0, 0, w, h).data;
      const d2 = g2.getContext('2d').getImageData(0, 0, w, h).data;
      let diffPixels = 0, nonZero = 0;
      for (let i = 0; i < w * h * 4; i += 4) {
        if (d1[i + 3] > 20 || d2[i + 3] > 20) {
          nonZero++;
          if (Math.abs(d1[i] - d2[i]) + Math.abs(d1[i + 1] - d2[i + 1]) + Math.abs(d1[i + 2] - d2[i + 2]) + Math.abs(d1[i + 3] - d2[i + 3]) > 30) {
            diffPixels++;
          }
        }
      }
      return {
        ok: true,
        size1: [c1.width, c1.height],
        size2: [c2.width, c2.height],
        diffRatio: +(diffPixels / Math.max(1, nonZero)).toFixed(3),
      };
    };

    const levels = {};
    for (let lv = 1; lv <= 5; lv++) {
      const m = VAR['milk_lv' + lv]?.base;
      const y = VAR['yuzu_lv' + lv]?.base;
      levels['lv' + lv] = compareCanvases(m, y);
    }
    return {
      milkImg: DEF.milk.img,
      milkFilter: DEF.milk.filter || null,
      yuzuImg: DEF.yuzu.img,
      duplicateDefs,
      levels,
      hasLights: [1, 2, 3, 4, 5].every(l => window.LIGHTS['milk_lv' + l] && window.LIGHTS['yuzu_lv' + l]),
    };
  });

  console.log('Sprite Audit:', JSON.stringify(spriteAudit, null, 2));
  assert.strictEqual(spriteAudit.milkImg, 'milk');
  assert.strictEqual(spriteAudit.milkFilter, null);
  assert.strictEqual(spriteAudit. duplicateDefs.length, 0, 'No two DEF items should share an img key');
  assert.strictEqual(spriteAudit.hasLights, true, 'All milk_lv1..5 and yuzu_lv1..5 light masks must exist');
  for (let lv = 1; lv <= 5; lv++) {
    assert(spriteAudit.levels['lv' + lv].ok, `Lv${lv} canvases must exist`);
    assert(spriteAudit.levels['lv' + lv].diffRatio > 0.55, `Lv${lv} milk vs yuzu diffRatio too low: ${spriteAudit.levels['lv' + lv].diffRatio}`);
  }

  // 2. Test R key rotation in ALL 4 scenarios with BOTH Korean IME ('ㄱ') and English ('r')
  console.log('Testing R key rotation across all 4 scenarios...');

  // Scenario 2A: Build preview mode (ghost active)
  await page.evaluate(() => {
    const D = window.__dbg;
    D.S.yen = 999999;
    D.setRot(0);
    D.setGhost('dango'); // 2x1 non-square stall
  });
  await page.mouse.move(720, 450);

  let rotState = await page.evaluate(() => ({ rot: window.__dbg.rot, ghost: window.__dbg.ghost }));
  assert.strictEqual(rotState.rot, 0);
  assert.strictEqual(rotState.ghost, 'dango');

  // Press physical R key while Korean IME produces e.key = 'ㄱ'
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ㄱ', code: 'KeyR', bubbles: true, cancelable: true }));
  });
  rotState = await page.evaluate(() => ({ rot: window.__dbg.rot }));
  assert.strictEqual(rotState.rot, 1, 'Build preview should rotate when pressing ㄱ (KeyR in Korean IME)');

  // Press 'r' in English mode
  await page.keyboard.press('KeyR');
  rotState = await page.evaluate(() => ({ rot: window.__dbg.rot }));
  assert.strictEqual(rotState.rot, 0, 'Build preview should rotate back to 0 when pressing KeyR');

  // Clear ghost
  await page.keyboard.press('Escape');

  // Prepare clean test objects on map for Scenarios 2B, 2C, 2D and pixel flip check
  const testSetup = await page.evaluate(() => {
    const D = window.__dbg;
    const S = D.S;
    S.yen = 999999;
    // Open central plots
    S.plots['1,1'] = 1;
    S.plots['1,2'] = 1;
    S.plots['2,1'] = 1;
    // Place a milk stall (2x2) at (20, 20) and a dango stall (2x1) at (24, 20)
    S.objs = S.objs.filter(o => o.k === 'gate');
    const milkObj = { k: 'milk', x: 20, y: 20, lv: 3, rot: 0, price: 250, uses: 0, earn: 0 };
    const dangoObj = { k: 'dango', x: 24, y: 20, lv: 2, rot: 0, price: 300, uses: 0, earn: 0 };
    S.objs.push(milkObj, dangoObj);
    D.refresh();
    D.focusXY(22, 21, 4.5);
    return { milkIdx: S.objs.indexOf(milkObj), dangoIdx: S.objs.indexOf(dangoObj) };
  });
  await page.waitForTimeout(200);

  // Verify actual rendered canvas pixels flip horizontally when milkObj.rot changes 0 -> 1!
  const pixelFlipCheck = await page.evaluate(async ({ milkIdx }) => {
    const D = window.__dbg;
    const o = D.S.objs[milkIdx];
    D.hideInfo();
    // Pause guests/particles and compare VAR[skey(o)].base rendering & screen canvas pixels
    const sk0 = D.skey(o);
    const sampleScreen = () => {
      const [sx, sy] = D.scr(o.x + 1, o.y + 1);
      const cv = document.getElementById('c');
      const dpr = window.devicePixelRatio || 1;
      const cx = cv.getContext('2d');
      const w = Math.round(80 * dpr), h = Math.round(90 * dpr);
      const x0 = Math.round(sx * dpr - w / 2), y0 = Math.round(sy * dpr - h * 0.85);
      return Array.from(cx.getImageData(x0, y0, w, h).data);
    };
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const px0 = sampleScreen();

    // Select milkObj and press Korean 'ㄱ' (KeyR)
    D.showInfo(o);
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ㄱ', code: 'KeyR', bubbles: true, cancelable: true }));
    const rotAfterKo = o.rot;
    const sk1 = D.skey(o);
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    const px1 = sampleScreen();

    let diffCount = 0;
    for (let i = 0; i < px0.length; i += 4) {
      if (Math.abs(px0[i] - px1[i]) + Math.abs(px0[i + 1] - px1[i + 1]) + Math.abs(px0[i + 2] - px1[i + 2]) > 25) {
        diffCount++;
      }
    }

    // Also test when #zs (zoom range slider) is focused!
    document.getElementById('zs').focus();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', code: 'KeyR', bubbles: true, cancelable: true }));
    const rotAfterZsFocus = o.rot;

    return {
      sk0,
      sk1,
      rotAfterKo,
      rotAfterZsFocus,
      diffPixels: diffCount,
      totalPixels: px0.length / 4,
    };
  }, testSetup);

  console.log('Scenario 2B (Selected building + pixel flip + range input focus):', pixelFlipCheck);
  assert.strictEqual(pixelFlipCheck.sk0, 'milk_lv3');
  assert.strictEqual(pixelFlipCheck.sk1, 'milk_lv3~m');
  assert.strictEqual(pixelFlipCheck.rotAfterKo, 1, 'Selected building must rotate on Korean ㄱ (KeyR)');
  assert.strictEqual(pixelFlipCheck.rotAfterZsFocus, 0, 'Selected building must rotate even when #zs range input is focused');
  assert(pixelFlipCheck.diffPixels > 500, `Canvas pixels must visibly flip when rotated (diffPixels=${pixelFlipCheck.diffPixels})`);

  // Scenario 2C: Double-click move mode (`moving` active)
  const moveRotCheck = await page.evaluate(({ dangoIdx }) => {
    const D = window.__dbg;
    const o = D.S.objs[dangoIdx];
    o.rot = 0;
    D.startMove(o);
    const inMove = D.moving === o;
    // Press Korean 'ㄱ' (KeyR) while moving
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ㄱ', code: 'KeyR', bubbles: true, cancelable: true }));
    const rotInMove1 = o.rot;
    // Press English 'r' while moving
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r', code: 'KeyR', bubbles: true, cancelable: true }));
    const rotInMove2 = o.rot;
    // Rotate once more to 1, then cancelMove and verify rot restores to original 0!
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ㄱ', code: 'KeyR', bubbles: true, cancelable: true }));
    const rotBeforeCancel = o.rot;
    D.cancelMove();
    const rotAfterCancel = o.rot;
    return { inMove, rotInMove1, rotInMove2, rotBeforeCancel, rotAfterCancel };
  }, testSetup);

  console.log('Scenario 2C (Double-click move mode):', moveRotCheck);
  assert.strictEqual(moveRotCheck.inMove, true);
  assert.strictEqual(moveRotCheck.rotInMove1, 1);
  assert.strictEqual(moveRotCheck.rotInMove2, 0);
  assert.strictEqual(moveRotCheck.rotBeforeCancel, 1);
  assert.strictEqual(moveRotCheck.rotAfterCancel, 0, 'cancelMove should restore original rotation');

  // Scenario 2D: Hover-over-building mode (no object selected, mouse hovering over building on map)
  const hoverCoords = await page.evaluate(({ milkIdx, dangoIdx }) => {
    const D = window.__dbg;
    D.hideInfo();
    const m = D.S.objs[milkIdx];
    const d = D.S.objs[dangoIdx];
    m.rot = 0;
    d.rot = 0;
    const [mx, my] = D.scr(m.x + 1, m.y + 1);
    const [dx, dy] = D.scr(d.x + 1, d.y + 0.5);
    return { mx, my: my - 20, dx, dy: dy - 15 };
  }, testSetup);

  // Move mouse over milkObj without clicking, then press 'ㄱ' (KeyR)
  await page.mouse.move(hoverCoords.mx, hoverCoords.my);
  const dbgHover = await page.evaluate(({ mx, my }) => {
    const el = document.elementFromPoint(mx, my);
    return {
      mx, my,
      elId: el ? (el.id || el.tagName + '.' + el.className) : null,
      HOVER: window.HOVER ? window.HOVER.k : null,
      picked: window.__dbg.pickObj(mx, my)?.k || null,
      infoO: window.__dbg.infoO ? window.__dbg.infoO.k : null,
    };
  }, hoverCoords);
  console.log('dbgHover:', dbgHover);
  await page.evaluate(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ㄱ', code: 'KeyR', bubbles: true, cancelable: true }));
  });
  let hoverRot1 = await page.evaluate(({ milkIdx }) => window.__dbg.S.objs[milkIdx].rot, testSetup);
  assert.strictEqual(hoverRot1, 1, 'Hovering over milk stall and pressing ㄱ (KeyR) without clicking must rotate it');

  // Move mouse over dangoObj (2x1 non-square stall) without clicking, then press 'r' (KeyR)
  await page.mouse.move(hoverCoords.dx, hoverCoords.dy);
  await page.keyboard.press('KeyR');
  let hoverRot2 = await page.evaluate(({ dangoIdx }) => window.__dbg.S.objs[dangoIdx].rot, testSetup);
  assert.strictEqual(hoverRot2, 1, 'Hovering over 2x1 dango stall and pressing KeyR without clicking must rotate it even without path connected');

  console.log('Scenario 2D (Hover-over-building mode): PASSED', { hoverRot1, hoverRot2 });

  // 3. Capture Screenshot 1: shots/r6/milk_vs_yuzu.png (Side-by-side Lv1-Lv5 comparison of 우유 매점 vs 유자차 매점)
  await page.evaluate(() => {
    const D = window.__dbg;
    const S = D.S;
    D.hideInfo();
    D.clearGhost();
    for (let px = 0; px < 3; px++) for (let py = 0; py < 3; py++) S.plots[px + ',' + py] = 1;
    S.objs = S.objs.filter(o => o.k === 'gate');
    D.guests().length = 0;
    // Place stone paths and Lv1..Lv5 of milk (top row) and yuzu (bottom row)
    for (let x = 15; x <= 32; x++) {
      for (let y = 17; y <= 25; y++) {
        S.objs.push({ k: 'path', x, y, lv: 1, price: 0, uses: 0, earn: 0 });
      }
    }
    for (let lv = 1; lv <= 5; lv++) {
      const x = 16 + (lv - 1) * 3;
      // Row 1: 우유 매점 Lv1..Lv5 at (x, 18)
      D.canPlace('milk', x, 18, 0);
      S.objs = S.objs.filter(o => !(D.DEF[o.k].isPath && o.x >= x && o.x < x + 2 && o.y >= 18 && o.y < 20));
      S.objs.push({ k: 'milk', x, y: 18, lv, rot: 0, price: 250, uses: 0, earn: 0 });

      // Row 2: 유자차 매점 Lv1..Lv5 at (x, 22)
      S.objs = S.objs.filter(o => !(D.DEF[o.k].isPath && o.x >= x && o.x < x + 2 && o.y >= 22 && o.y < 24));
      S.objs.push({ k: 'yuzu', x, y: 22, lv, rot: 0, price: 350, uses: 0, earn: 0 });
    }
    D.setHour(11.5);
    D.refresh();
    // Open 'shop' tab in build bar so both build cards (우유 매점 & 유자차 매점) are also visible at the bottom!
    const shopTab = document.querySelector('.tab[data-t="shop"]');
    if (shopTab) shopTab.click();
    D.focusXY(23, 21.5, 3.5);
    // Add clean floating labels for each stall on an overlay for crystal-clear inspection
    let ov = document.getElementById('r6-labels');
    if (ov) ov.remove();
    ov = document.createElement('div');
    ov.id = 'r6-labels';
    ov.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:999;font-family:Pretendard,sans-serif;';
    document.body.appendChild(ov);
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const D = window.__dbg;
    const ov = document.getElementById('r6-labels');
    ov.innerHTML = '';
    for (const o of D.S.objs) {
      if (o.k !== 'milk' && o.k !== 'yuzu') continue;
      const [sx, sy] = D.scr(o.x + 1, o.y + 2);
      const b = document.createElement('div');
      const isMilk = o.k === 'milk';
      b.style.cssText = `position:absolute;left:${sx}px;top:${sy + 6}px;transform:translate(-50%,0);padding:2px 7px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${isMilk ? 'rgba(36,98,168,0.88)' : 'rgba(186,112,20,0.90)'};border:1px solid rgba(255,255,255,0.7);white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.35);`;
      b.textContent = `${isMilk ? '🥛 우유 매점' : '🍋 유자차 매점'} Lv.${o.lv}`;
      ov.appendChild(b);
    }
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/r6/milk_vs_yuzu.png' });
  console.log('Saved shots/r6/milk_vs_yuzu.png');

  // 4. Capture Screenshot 2: shots/r6/rotation_fixed.png (Showing rot=0 vs rot=1 side-by-side for milk, yuzu, dango 2x1->1x2, torii 2x1->1x2, plus active ghost rotation)
  await page.evaluate(() => {
    const D = window.__dbg;
    const S = D.S;
    S.objs = S.objs.filter(o => o.k === 'gate');
    const items = [
      { k: 'milk', lv: 5, x0: 17, y0: 18, x1: 17, y1: 22, label: '우유 매점 Lv.5 (2×2)' },
      { k: 'yuzu', lv: 5, x0: 21, y0: 18, x1: 21, y1: 22, label: '유자차 매점 Lv.5 (2×2)' },
      { k: 'dango', lv: 4, x0: 25, y0: 18, x1: 25, y1: 22, label: '당고 노점 Lv.4 (2×1 ↔ 1×2)' },
      { k: 'shoot', lv: 4, x0: 28, y0: 18, x1: 28, y1: 22, label: '사격 노점 Lv.4 (2×1 ↔ 1×2)' },
    ];
    for (const it of items) {
      S.objs.push({ k: it.k, x: it.x0, y: it.y0, lv: it.lv, rot: 0, price: 300, uses: 0, earn: 0, _lbl: `${it.label} · 기본(rot=0)` });
      S.objs.push({ k: it.k, x: it.x1, y: it.y1, lv: it.lv, rot: 1, price: 300, uses: 0, earn: 0, _lbl: `${it.label} · R키 회전(rot=1)` });
    }
    D.refresh();
    D.focusXY(23.5, 21, 3.6);
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    const D = window.__dbg;
    const ov = document.getElementById('r6-labels');
    ov.innerHTML = '';
    for (const o of D.S.objs) {
      if (!o._lbl) continue;
      const [fw, fh] = o.rot ? [D.DEF[o.k].fph || D.DEF[o.k].fp, D.DEF[o.k].fp] : [D.DEF[o.k].fp, D.DEF[o.k].fph || D.DEF[o.k].fp];
      const [sx, sy] = D.scr(o.x + fw / 2, o.y + fh);
      const b = document.createElement('div');
      b.style.cssText = `position:absolute;left:${sx}px;top:${sy + 6}px;transform:translate(-50%,0);padding:2px 7px;border-radius:10px;font-size:11px;font-weight:700;color:#fff;background:${o.rot ? 'rgba(42,128,72,0.90)' : 'rgba(60,64,72,0.88)'};border:1px solid rgba(255,255,255,0.7);white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.35);`;
      b.textContent = o._lbl;
      ov.appendChild(b);
    }
  });
  await page.waitForTimeout(200);
  await page.screenshot({ path: 'shots/r6/rotation_fixed.png' });
  console.log('Saved shots/r6/rotation_fixed.png');

  assert.strictEqual(errors.length, 0, 'Page errors: ' + errors.join('; '));
  assert.strictEqual(failedReqs.length, 0, 'Failed network requests: ' + failedReqs.join('; '));

  await browser.close();
  srv.close();
  console.log('ALL TESTS PASSED!');
})().catch(e => {
  console.error(e);
  process.exit(1);
});
