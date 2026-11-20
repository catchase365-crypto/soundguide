window.__BOOK_REGISTER_SECTION__("sec_096", {
  "title": "麻烦 3：反正切象限丢失与相位错误 (Nuisance 3: Incorrect arctan)",
  "intuition": "单参数 arctan(Im/Re) 只看虚实部的比值而丢掉了各自的正负号，导致左半平面的向量全被错误折叠到右半平面，必须根据实部与虚部符号加减 π（180°）才能还原全圆 360° 相位。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么 (+1, +1) 和 (-1, -1) 算出的相位一模一样？",
      "paragraphs": [
        "在把离散傅里叶变换（DFT）的直角坐标样本 `(Re X[k], Im X[k])` 转换为极坐标（幅度和相位）时，标准公式要求对 `Im X[k] / Re X[k]` 求反正切（即程序里的 `ATN` 函数）。",
        "让我们看书中给出的两组经典对照样本：第一组样本 `Re X[k] = 1, Im X[k] = 1`，位于第一象限，幅度为 `1.414`，相位为 `45°`，结果完全正确。第二组样本 `Re X[k] = -1, Im X[k] = -1`，它明明位于第三象限，真实方向应该是 `-135°`（即 `-3π/4` 弧度）；但如果你直接套用公式，由于 `(-1) / (-1) = +1`，计算机同样会算出 `arctan(1) = +45°`——方向直接差了整整 `180°`！",
        "问题的根源在于**除法抹掉了分子和分母各自的正负号**。只要实部 `Re X[k] < 0`（向量落在复平面的左半边，即第二或第三象限），单参数反正切就无法区分 `(+Im)/(-Re)` 与 `(-Im)/(+Re)`，也无法区分 `(-Im)/(-Re)` 与 `(+Im)/(+Re)`，最终把整个左半平面的向量全部强行折叠进了 `(-π/2, +π/2)`（即 `-90°` 到 `+90°`）的右半平面内。"
      ],
      "formula": {
        "expr": "Phase X[k] = arctan( Im X[k] / Re X[k] )  ∈ (-π/2, +π/2)",
        "explain": "Im X[k] 为第 k 个频点的虚部，Re X[k] 为实部；单参数 arctan 仅依据比值的符号返回 (-90°, +90°) 区间内的角度，丢失了 Re < 0 时的半圆信息。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复平面象限折叠与 Table 8-3 修正对比",
      "instruction": "拖动 Re 与 Im 滑块把向量移动到左半平面（粉色危险区，例如默认的 Re=-1, Im=-1），观察粉色错误方向与蓝色真实方向差了 180°；再打开“象限修正”开关，验证输出相位还原到 [-180°, +180°]。",
      "controls": [
        {
          "type": "slider",
          "id": "re",
          "label": "实部 Re X[k]",
          "min": -5,
          "max": 5,
          "step": 0.2,
          "value": -1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "im",
          "label": "虚部 Im X[k]",
          "min": -5,
          "max": 5,
          "step": 0.2,
          "value": -1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "fix",
          "label": "开启 Table 8-3 象限修正",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const re = lab.values.re;\n  const im = lab.values.im;\n  const fix = lab.values.fix;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const cx = 175;\n  const cy = 120;\n  const scale = 17;\n\n  ctx.fillStyle = fix ? 'rgba(16, 185, 129, 0.07)' : 'rgba(236, 72, 153, 0.09)';\n  ctx.fillRect(cx - 95, cy - 95, 95, 190);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let r = 1; r <= 5; r++) {\n    ctx.beginPath();\n    ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(cx - 98, cy);\n  ctx.lineTo(cx + 98, cy);\n  ctx.moveTo(cx, cy - 98);\n  ctx.lineTo(cx, cy + 98);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('+Re', cx + 78, cy - 6);\n  ctx.fillText('-Re (左半平面)', cx - 94, cy - 6);\n  ctx.fillText('+Im', cx + 6, cy - 86);\n  ctx.fillText('-Im', cx + 6, cy + 94);\n\n  const mag = Math.sqrt(re * re + im * im);\n  const safeRe = (re === 0) ? 1e-20 : re;\n  const rawPhase = Math.atan(im / safeRe);\n  let fixedPhase = rawPhase;\n  if (re < 0 && im < 0) {\n    fixedPhase = rawPhase - Math.PI;\n  } else if (re < 0 && im >= 0) {\n    fixedPhase = rawPhase + Math.PI;\n  }\n  const activePhase = fix ? fixedPhase : rawPhase;\n\n  function drawArrow(x1, y1, x2, y2, color, dashed, lw) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.fillStyle = color;\n    ctx.lineWidth = lw;\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    ctx.moveTo(x1, y1);\n    ctx.lineTo(x2, y2);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    const ang = Math.atan2(y2 - y1, x2 - x1);\n    const hl = 8;\n    ctx.beginPath();\n    ctx.moveTo(x2, y2);\n    ctx.lineTo(x2 - hl * Math.cos(ang - 0.35), y2 - hl * Math.sin(ang - 0.35));\n    ctx.lineTo(x2 - hl * Math.cos(ang + 0.35), y2 - hl * Math.sin(ang + 0.35));\n    ctx.closePath();\n    ctx.fill();\n    ctx.restore();\n  }\n\n  if (mag > 0.05) {\n    const vx = cx + re * scale;\n    const vy = cy - im * scale;\n    drawArrow(cx, cy, vx, vy, '#38bdf8', false, 2.5);\n    if (!fix && re < 0) {\n      const fx = cx + mag * Math.cos(rawPhase) * scale;\n      const fy = cy - mag * Math.sin(rawPhase) * scale;\n      drawArrow(cx, cy, fx, fy, '#ec4899', true, 2.5);\n      ctx.fillStyle = '#ec4899';\n      ctx.fillText('ATN 误判方向', fx + (fx >= cx ? 6 : -76), fy + (fy >= cy ? 14 : -8));\n    }\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('真实向量', vx + (vx >= cx ? 6 : -52), vy + (vy >= cy ? 14 : -8));\n  }\n\n  const rx = 335;\n  const rw = 355;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('相位输出区间标尺 (-180° ~ +180°)', rx, 32);\n\n  const barY = 76;\n  const barH = 14;\n  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(rx, barY, rw, barH);\n\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';\n  ctx.fillRect(rx + rw * 0.25, barY, rw * 0.5, barH);\n\n  const ticks = [\n    { p: -Math.PI, t: '-π' },\n    { p: -Math.PI / 2, t: '-π/2' },\n    { p: 0, t: '0' },\n    { p: Math.PI / 2, t: '+π/2' },\n    { p: Math.PI, t: '+π' }\n  ];\n  ctx.font = '10px monospace';\n  ticks.forEach(tk => {\n    const tx = rx + ((tk.p + Math.PI) / (2 * Math.PI)) * rw;\n    ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n    ctx.beginPath();\n    ctx.moveTo(tx, barY - 6);\n    ctx.lineTo(tx, barY + barH + 6);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(tk.t, tx - 10, barY + barH + 20);\n  });\n\n  const rawX = rx + ((rawPhase + Math.PI) / (2 * Math.PI)) * rw;\n  const fixX = rx + ((fixedPhase + Math.PI) / (2 * Math.PI)) * rw;\n\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath();\n  ctx.arc(rawX, barY + barH / 2, 6, 0, Math.PI * 2);\n  ctx.fill();\n\n  if (fix) {\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath();\n    ctx.arc(fixX, barY + barH / 2, 7, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.font = '12px monospace';\n  const rawDeg = (rawPhase * 180 / Math.PI).toFixed(1);\n  const fixDeg = (fixedPhase * 180 / Math.PI).toFixed(1);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('未修正 ATN(Im/Re) = ' + rawPhase.toFixed(3) + ' rad (' + rawDeg + '°)', rx, 145);\n  ctx.fillStyle = fix ? '#10b981' : '#38bdf8';\n  ctx.fillText('真实全圆相位      = ' + fixedPhase.toFixed(3) + ' rad (' + fixDeg + '°)', rx, 170);\n\n  let ruleMsg = 'Re >= 0：位于右半平面，无需修正';\n  if (re < 0 && im < 0) ruleMsg = 'Re < 0 且 Im < 0：第三象限 -> PHASE = PHASE - π';\n  else if (re < 0 && im >= 0) ruleMsg = 'Re < 0 且 Im >= 0：第二象限 -> PHASE = PHASE + π';\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(ruleMsg, rx, 202);\n\n  lab.setReadout('Re=' + re.toFixed(1) + ' | Im=' + im.toFixed(1) + ' | Mag=' + mag.toFixed(2) + ' | 当前输出=' + (activePhase * 180 / Math.PI).toFixed(1) + '° (' + activePhase.toFixed(4) + ' rad)');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "Table 8-3 象限修补法则与“±1.5708 警报器”",
      "paragraphs": [
        "修复这一问题并不复杂：在用 `ATN(IMX[K%] / REX[K%])` 算出初步相位后，立即检查实部和虚部的正负号。正如原书 Table 8-3 的第 280 与 290 行所示，只需要两条判断语句即可把折叠的左半平面展开：",
        "1. 若 `REX[K%] < 0` 且 `IMX[K%] < 0`（第三象限），由于 `ATN` 错把结果算在了第一象限 `(0, +π/2)`，因此必须减去 `π`（或 `180°`）：`PHASE = PHASE - PI`，把它搬回 `(-π, -π/2)`；",
        "2. 若 `REX[K%] < 0` 且 `IMX[K%] >= 0`（第二象限），由于 `ATN` 错把结果算在了第四象限 `(-π/2, 0]`，因此必须加上 `π`（或 `180°`）：`PHASE = PHASE + PI`，把它搬回 `(+π/2, +π]`。",
        "原书作者特别强调了一句必须“刻进脑子里”的工程调试直觉：**如果你画出频谱的相位图，发现所有相位值都被死死限制在 `±1.5708`（即 `±π/2`）之间，而没有延伸到 `±3.1416`（`±π`），那百分之百是你忘记修正反正切的象限模糊性了！**（注：在现代 C、Python、JavaScript 等语言中，直接调用双参数函数 `atan2(im, re)` 即可一步完成全圆 `(-π, +π]` 象限判定，无需手写分支。）"
      ],
      "formula": {
        "expr": "Phase_fixed = Phase_raw - π (Re<0, Im<0)  |  Phase_raw + π (Re<0, Im≥0)",
        "explain": "Phase_raw = arctan(Im / Re)。通过根据 Re 与 Im 的符号加减 π（180°），相位值域从 (-1.5708, +1.5708) 正确扩展到全圆 (-3.1416, +3.1416]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：±1.5708 相位截断诊断与时域波形/音色失真",
      "instruction": "增大“相位斜率”，观察左侧频谱中未修正的相位如何被锁死在 ±1.5708 虚线内，以及右侧重建波形的脉冲尖峰如何被反相破坏；点击播放可对比修正前后的音色变化。",
      "controls": [
        {
          "type": "slider",
          "id": "delay",
          "label": "频域相位斜率 (延迟)",
          "min": 0,
          "max": 1.4,
          "step": 0.05,
          "value": 0.55,
          "unit": " rad/bin"
        },
        {
          "type": "toggle",
          "id": "fix",
          "label": "开启象限修正 (±π 全圆)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放重建音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet audioCtx = null;\nlet osc = null;\nlet gain = null;\n\nfunction stopAudio() {\n  if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null;\n  }\n  if (gain) {\n    try { gain.disconnect(); } catch (e) {}\n    gain = null;\n  }\n}\n\nfunction updateAudio(reArr, imArr) {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n  }\n  if (audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n  const N = reArr.length;\n  const real = new Float32Array(N);\n  const imag = new Float32Array(N);\n  for (let k = 1; k < N; k++) {\n    real[k] = reArr[k];\n    imag[k] = imArr[k];\n  }\n  const wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });\n  if (!osc) {\n    osc = audioCtx.createOscillator();\n    gain = audioCtx.createGain();\n    gain.gain.value = 0.16;\n    osc.frequency.value = 140;\n    osc.setPeriodicWave(wave);\n    osc.connect(gain);\n    gain.connect(audioCtx.destination);\n    osc.start();\n  } else {\n    osc.setPeriodicWave(wave);\n  }\n}\n\nfunction draw() {\n  const delay = lab.values.delay;\n  const fix = lab.values.fix;\n  ctx.clearRect(0, 0, W, H);\n\n  const K = 16;\n  const phases = [];\n  const trueRe = [0];\n  const trueIm = [0];\n  const recRe = [0];\n  const recIm = [0];\n  let wrongBins = 0;\n\n  for (let k = 0; k <= K; k++) {\n    const trueAng = -k * delay;\n    const re = Math.cos(trueAng);\n    const im = Math.sin(trueAng);\n    const safeRe = Math.abs(re) < 1e-12 ? 1e-12 : re;\n    let p = Math.atan(im / safeRe);\n    if (re < 0) {\n      if (fix) {\n        p = (im < 0) ? (p - Math.PI) : (p + Math.PI);\n      } else {\n        wrongBins++;\n      }\n    }\n    phases.push({ k: k, p: p, err: (!fix && re < 0) });\n    if (k >= 1 && k <= 12) {\n      const mag = 1 / Math.pow(k, 0.75);\n      trueRe.push(mag * re);\n      trueIm.push(mag * im);\n      recRe.push(mag * Math.cos(p));\n      recIm.push(mag * Math.sin(p));\n    }\n  }\n\n  // Left panel: Phase Spectrum\n  const lx = 46;\n  const lw = 300;\n  const lcy = 122;\n  const halfH = 78;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('频域相位谱 Phase X[k] (rad)', lx, 24);\n\n  // Grid & +/- pi, +/- pi/2 lines\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, lcy - halfH, lw, halfH * 2);\n\n  ctx.beginPath();\n  ctx.moveTo(lx, lcy); ctx.lineTo(lx + lw, lcy);\n  ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  const yPi2Up = lcy - halfH * 0.5;\n  const yPi2Dn = lcy + halfH * 0.5;\n  ctx.beginPath();\n  ctx.moveTo(lx, yPi2Up); ctx.lineTo(lx + lw, yPi2Up);\n  ctx.moveTo(lx, yPi2Dn); ctx.lineTo(lx + lw, yPi2Dn);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.fillText('+3.14', 8, lcy - halfH + 4);\n  ctx.fillText('-3.14', 8, lcy + halfH + 4);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('+1.57', 8, yPi2Up + 4);\n  ctx.fillText('-1.57', 8, yPi2Dn + 4);\n  ctx.fillText('0', 26, lcy + 4);\n\n  ctx.strokeStyle = fix ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  phases.forEach((pt, idx) => {\n    const px = lx + (pt.k / K) * lw;\n    const py = lcy - (pt.p / Math.PI) * halfH;\n    if (idx === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  });\n  ctx.stroke();\n\n  phases.forEach(pt => {\n    const px = lx + (pt.k / K) * lw;\n    const py = lcy - (pt.p / Math.PI) * halfH;\n    ctx.fillStyle = pt.err ? '#ec4899' : (fix ? '#10b981' : '#38bdf8');\n    ctx.beginPath();\n    ctx.arc(px, py, 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  });\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(fix ? '全圆 [-π, +π] 完整展开' : '被锁死在 ±1.5708 之间!', lx, 222);\n\n  // Right panel: Time-domain reconstructed waveform\n  const rx = 390;\n  const rw = 306;\n  const rcy = 122;\n  const ampScale = 18;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域重建波形 (1~12 次谐波叠加)', rx, 24);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(rx, rcy - halfH, rw, halfH * 2);\n  ctx.beginPath();\n  ctx.moveTo(rx, rcy); ctx.lineTo(rx + rw, rcy);\n  ctx.stroke();\n\n  // True reference waveform (dashed cyan)\n  ctx.save();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  const steps = 160;\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * Math.PI * 2;\n    let y = 0;\n    for (let k = 1; k <= 12; k++) {\n      y += trueRe[k] * Math.cos(k * t) - trueIm[k] * Math.sin(k * t);\n    }\n    const x = rx + (i / steps) * rw;\n    const py = rcy - y * ampScale;\n    if (i === 0) ctx.moveTo(x, py);\n    else ctx.lineTo(x, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  // Reconstructed waveform using current phases\n  ctx.strokeStyle = fix ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * Math.PI * 2;\n    let y = 0;\n    for (let k = 1; k <= 12; k++) {\n      y += recRe[k] * Math.cos(k * t) - recIm[k] * Math.sin(k * t);\n    }\n    const x = rx + (i / steps) * rw;\n    const py = rcy - y * ampScale;\n    if (i === 0) ctx.moveTo(x, py);\n    else ctx.lineTo(x, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = fix ? '#10b981' : '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(fix ? '重建波形与真实脉冲完全重合' : '有 ' + wrongBins + ' 个频点反相 180°，波形已严重畸变', rx, 222);\n\n  updateAudio(recRe, recIm);\n\n  const maxMagPhase = Math.max(...phases.map(pt => Math.abs(pt.p)));\n  lab.setReadout('相位斜率=' + delay.toFixed(2) + ' rad/bin | 相位最大绝对值=' + maxMagPhase.toFixed(4) + ' rad | 象限错误频点数=' + wrongBins + '/' + (K + 1));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看到相位谱最大值死死卡在 ±1.5708（即 ±π/2）却从不突破到 ±3.1416，立刻排查是不是误用了单参数 arctan(Im / Re) 而忘记做象限修正。",
        "自己手写直角坐标转极坐标时，必须在算出 atan(Im / Re) 后检测 Re < 0：当 Im < 0 时减 π，当 Im >= 0 时加 π。",
        "现代工程开发（C/C++/Python/JS/MATLAB）请直接使用双参数 atan2(Im, Re)，它会在底层同时处理除零保护与全圆 [-π, +π] 象限判断。"
      ]
    }
  ]
});
