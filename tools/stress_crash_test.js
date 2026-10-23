const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.json': 'application/json'
};

function startServer() {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      const rel = u === '/' ? '/index.html' : u;
      const fp = path.join(ROOT, rel);
      if (!fp.startsWith(ROOT) || !fs.existsSync(fp) || fs.statSync(fp).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      const ext = path.extname(fp).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(fp).pipe(res);
    });
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

(async () => {
  const { srv, port } = await startServer();
  const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/google-chrome", args: ["--enable-precise-memory-info", "--no-sandbox"] });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2
  });
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('CONSOLE_ERROR: ' + m.text());
  });

  await page.addInitScript(() => {
    window.__canvases = [];
    window.__images = [];
    const origCE = Document.prototype.createElement;
    Document.prototype.createElement = function (tag, opts) {
      const el = origCE.call(this, tag, opts);
      if (String(tag).toLowerCase() === 'canvas') {
        const stack = (new Error().stack || '').split('\n').slice(1, 5).map(s => s.trim()).join(' <- ');
        window.__canvases.push({ el, stack });
      }
      return el;
    };
    if (typeof OffscreenCanvas !== 'undefined') {
      const OrigOC = OffscreenCanvas;
      window.OffscreenCanvas = function (w, h) {
        const oc = new OrigOC(w, h);
        const stack = (new Error().stack || '').split('\n').slice(1, 5).map(s => s.trim()).join(' <- ');
        window.__canvases.push({ el: oc, stack });
        return oc;
      };
    }
    const OrigImg = window.Image;
    window.Image = function (w, h) {
      const im = new OrigImg(w, h);
      window.__images.push(im);
      return im;
    };
    window.__measureMem = () => {
      const domCanvases = Array.from(document.querySelectorAll('canvas'));
      const seen = new Set();
      let activeCount = 0;
      let totalCanvasBytes = 0;
      const bySource = {};
      for (const c of domCanvases) {
        seen.add(c);
        const b = (c.width || 0) * (c.height || 0) * 4;
        if (b > 0) activeCount++;
        totalCanvasBytes += b;
        const k = 'DOM#' + (c.id || c.className || 'anon') + `(${c.width}x${c.height})`;
        bySource[k] = (bySource[k] || 0) + b;
      }
      for (const item of window.__canvases) {
        if (seen.has(item.el)) continue;
        seen.add(item.el);
        const w = item.el.width || 0;
        const h = item.el.height || 0;
        const b = w * h * 4;
        if (b <= 0) continue;
        activeCount++;
        totalCanvasBytes += b;
        const k = item.stack.slice(0, 120);
        bySource[k] = (bySource[k] || 0) + b;
      }
      let imgCount = 0;
      let totalImgBytes = 0;
      for (const im of window.__images) {
        const w = im.naturalWidth || im.width || 0;
        const h = im.naturalHeight || im.height || 0;
        if (w > 0 && h > 0) {
          imgCount++;
          totalImgBytes += w * h * 4;
        }
      }
      const topSources = Object.entries(bySource)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([k, v]) => ({ source: k, mb: +(v / (1024 * 1024)).toFixed(2) }));
      const jsHeapMB = performance.memory ? +(performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2) : null;
      return {
        activeCanvases: activeCount,
        totalAllocatedEver: window.__canvases.length,
        canvasMB: +(totalCanvasBytes / (1024 * 1024)).toFixed(2),
        imgCount,
        imgMB: +(totalImgBytes / (1024 * 1024)).toFixed(2),
        jsHeapMB,
        topSources
      };
    };
  });

  console.log('1. Loading game...');
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const bootMem = await page.evaluate(() => window.__measureMem());
  console.log('[Stage 1: Boot (Title Screen)]', JSON.stringify(bootMem));

  // Start new game or continue into gameplay
  await page.evaluate(() => {
    if (window.SHELL) SHELL.start();
    const skip = document.querySelector('#tutSkip');
    if (skip) skip.click();
  });
  await page.waitForTimeout(400);

  // Stage 2: Build ALL 65+ item types & rotate 50 times
  console.log('2. Building all 65+ item types & rotating 50 times...');
  const buildMem = await page.evaluate(() => {
    // Unlock several plots so there is space for all 65+ item types
    for (let py = 0; py < 6; py++) {
      for (let px = 0; px < 6; px++) {
        S.plots[px + ',' + py] = 1;
      }
    }
    S.money = 999999999;
    const keys = Object.keys(DEF);
    let gx = 4, gy = 4, rowH = 1;
    let placed = 0;
    for (const k of keys) {
      const d = DEF[k];
      const [szx, szy] = d.sz || [1, 1];
      if (gx + szx > 34) {
        gx = 4;
        gy += rowH + 1;
        rowH = 1;
      }
      if (gy + szy < 34) {
        S.objs.push({ id: S.nid++, k, x: gx, y: gy, rot: 0, lv: d.maxLv || 1 });
        placed++;
        gx += szx + 1;
        if (szy > rowH) rowH = szy;
      }
    }
    OCC = occ();
    groundDirty = true;
    // Force a render frame at day
    S.min = 720;
    // Rotate 50 times across all placed buildings
    for (let r = 0; r < 50; r++) {
      for (let i = 0; i < S.objs.length; i++) {
        S.objs[i].rot = (S.objs[i].rot + 1) & 3;
      }
      OCC = occ();
    }
    return { placed, totalDef: keys.length };
  });
  await page.waitForTimeout(500);
  const afterBuildRotateMem = await page.evaluate(() => window.__measureMem());
  console.log('[Stage 2: Built ' + buildMem.placed + '/' + buildMem.totalDef + ' items & rotated 50x]', JSON.stringify(afterBuildRotateMem));

  // Stage 3: Dusk / Night (S.min = 1260) and 3 full day/night cycles
  console.log('3. Sweeping through Dusk/Night (S.min=1260) and 3 full days/nights...');
  await page.evaluate(async () => {
    S.min = 1260;
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
  const duskMem = await page.evaluate(() => window.__measureMem());
  console.log('[Stage 3a: Dusk/Night S.min=1260]', JSON.stringify(duskMem));

  await page.evaluate(async () => {
    for (let day = 0; day < 3; day++) {
      for (let m = 0; m < 1440; m += 45) {
        S.min = m;
        await new Promise(r => requestAnimationFrame(r));
      }
    }
  });
  const after3DaysMem = await page.evaluate(() => window.__measureMem());
  console.log('[Stage 3b: After 3 Full Day/Night Cycles]', JSON.stringify(after3DaysMem));

  // Stage 4: Zoom in/out 100 times (cam.z from 0.6 to 3.5) & pan around
  console.log('4. Zooming in/out 100 times & panning around...');
  await page.evaluate(async () => {
    for (let i = 0; i < 100; i++) {
      const frac = (i % 25) / 24;
      cam.z = 0.6 + frac * (3.5 - 0.6);
      cam.x = 700 + Math.sin(i * 0.3) * 180;
      cam.y = 260 + Math.cos(i * 0.3) * 120;
      if (i % 4 === 0) {
        await new Promise(r => requestAnimationFrame(r));
      }
    }
    cam.z = 1.15;
  });
  const afterZoomMem = await page.evaluate(() => window.__measureMem());
  console.log('[Stage 4: After 100 Zooms (0.6..3.5) & Pans]', JSON.stringify(afterZoomMem));

  // Stage 5: Open & close all modals (초대 · 방문, 도감, 료칸 등급, 설정, 저장 슬롯)
  console.log('5. Opening and closing all modals...');
  await page.evaluate(async () => {
    const wait = (ms) => new Promise(r => setTimeout(r, ms));
    if (window.SHELL) {
      await SHELL.share();
      await wait(120);
      document.querySelector('#ovShare [data-x]')?.click();
      await wait(80);

      SHELL.settings();
      await wait(80);
      document.querySelector('#ovSet [data-x]')?.click();
      await wait(80);

      SHELL.slots();
      await wait(80);
      document.querySelector('#ovSlots [data-x]')?.click();
      await wait(80);
    }
    document.getElementById('tBook')?.click();
    await wait(100);
    document.querySelector('#modal .close')?.click();
    await wait(80);

    document.getElementById('bRank')?.click();
    await wait(100);
    document.querySelector('#modal .close')?.click();
    await wait(300);
  });
  const afterModalsMem = await page.evaluate(() => window.__measureMem());
  console.log('[Stage 5: After Opening/Closing All Modals]', JSON.stringify(afterModalsMem));

  // Stage 6: Visit all 3 neighbor ryokans & return home
  console.log('6. Visiting all 3 neighbor ryokans and returning home...');
  for (const id of ['moonlight', 'forest', 'neon']) {
    await page.evaluate(async (nid) => {
      await SHELL.share();
      await new Promise(r => setTimeout(r, 80));
      const btn = document.querySelector(`[data-nb="${nid}"]`);
      if (btn) btn.click();
    }, id);
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      document.getElementById('vHome')?.click();
    });
    await page.waitForTimeout(200);
  }
  const afterVisitsMem = await page.evaluate(() => window.__measureMem());
  console.log('[Stage 6: After Visiting All 3 Neighbor Ryokans]', JSON.stringify(afterVisitsMem));

  // Stage 7: Measure frame pacing across 120 frames with 25 active guests pathfinding
  console.log('7. Measuring 120 frames of active gameplay with guests pathfinding...');
  const frameStats = await page.evaluate(async () => {
    // Spawn guests if needed
    while (guests.length < 20 && typeof spawn === 'function') {
      spawn();
    }
    // Warm up 5 frames so any one-time lazy build completes
    for (let i = 0; i < 5; i++) {
      await new Promise(r => requestAnimationFrame(r));
    }
    const deltas = [];
    for (let i = 0; i < 120; i++) {
      const t0 = performance.now();
      step(0.016);
      BUS.emit('frame', 0.016, t0);
      render(t0);
      hud();
      if (i % 90 === 0) checkReach();
      const t1 = performance.now();
      deltas.push(t1 - t0);
    }
    const maxDelta = Math.max(...deltas);
    const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    const stallsOver50ms = deltas.filter(d => d > 50).length;
    return {
      frames: deltas.length,
      avgMs: +avgDelta.toFixed(2),
      maxMs: +maxDelta.toFixed(2),
      stallsOver50ms
    };
  });
  console.log('[Stage 7: Frame Pacing (120 frames)]', JSON.stringify(frameStats));

  const finalMem = await page.evaluate(() => window.__measureMem());
  console.log('[Final Summary]', JSON.stringify({
    bootCanvasMB: bootMem.canvasMB,
    peakCanvasMB: Math.max(
      bootMem.canvasMB,
      afterBuildRotateMem.canvasMB,
      duskMem.canvasMB,
      after3DaysMem.canvasMB,
      afterZoomMem.canvasMB,
      afterModalsMem.canvasMB,
      afterVisitsMem.canvasMB,
      finalMem.canvasMB
    ),
    finalCanvasMB: finalMem.canvasMB,
    finalActiveCanvases: finalMem.activeCanvases,
    finalImgMB: finalMem.imgMB,
    bootJsHeapMB: bootMem.jsHeapMB,
    finalJsHeapMB: finalMem.jsHeapMB,
    frameStats,
    errorsCount: errors.length,
    errors
  }, null, 2));

  await browser.close();
  srv.close();

  const peakMB = Math.max(
    bootMem.canvasMB,
    afterBuildRotateMem.canvasMB,
    duskMem.canvasMB,
    after3DaysMem.canvasMB,
    afterZoomMem.canvasMB,
    afterModalsMem.canvasMB,
    afterVisitsMem.canvasMB,
    finalMem.canvasMB
  );
  if (peakMB >= 65 || errors.length > 0 || frameStats.stallsOver50ms > 0) {
    console.error(`FAIL: peakMB=${peakMB} (limit 65), errors=${errors.length}, stallsOver50ms=${frameStats.stallsOver50ms}`);
    process.exit(1);
  }
  console.log('PASS: All memory, stability, and frame-time assertions succeeded!');
})();
