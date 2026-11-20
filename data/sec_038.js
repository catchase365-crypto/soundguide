window.__BOOK_REGISTER_SECTION__("sec_038", {
  "title": "时域与频域视角下的采样与重建 (Time Domain & Frequency Domain)",
  "intuition": "采样在时域上是“把连续波形切成冲激串”，在频域上却等价于“把原始频谱像复印机一样无限平移复制”——不混叠、不失真的秘密全藏在这两条规则的对偶关系里。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 时域采样与频域复制：为什么会出现“边带重叠”？",
      "paragraphs": [
        "从**时域 (Time Domain)** 看，理想模数转换（ADC）把连续的模拟信号乘以一个周期为 `1/fs` 的窄脉冲串（impulse train），得到一串离散的采样点（如图 3-5c）。",
        "但如果你戴上**频域 (Frequency Domain)** 的眼镜，奇迹发生了：时域上的“乘以冲激串”，在频域上等价于**把原始信号的基带频谱（图 3-5b）以采样频率 `fs` 为步长，向高频无限平移复制**，在 `fs, 2fs, 3fs...` 的两侧生成无穷多个**上边带 (upper sideband)** 与**下边带 (lower sideband)**（如图 3-5d）。",
        "只要原始信号的最高频率 `f_max` 小于采样率的一半（即 **奈奎斯特极限 `fs / 2`**，如图 3-5c 中以 3 倍最高频率采样，即 `f_max = 0.33 fs`），基带频谱与复制出来的第一个下边带之间就留有安全空隙，原始频率成分在低频区完好无损。",
        "一旦贪心让 `f_max > fs / 2`（如图 3-5e 以 1.5 倍最高频率采样，即 `f_max = 0.66 fs`），原点处的上边带与 `fs` 处的下边带就会互相踩脚、发生**频谱重叠（图 3-5f）**。这种高频伪装成低频的现象就是**混叠 (Aliasing)**——一旦发生，神仙也分不清混进基带里的频率原本是谁。"
      ],
      "formula": {
        "expr": "f_alias = |f - round(f / fs) * fs|",
        "explain": "f 为真实输入频率，fs 为采样率，round 为四舍五入取整；当 f > fs/2 时，高频成分会折叠成低频假信号 f_alias 出现在 [0, fs/2] 区间内。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：时域冲激采样、频谱边带复制与混叠听觉对比",
      "instruction": "拖动“原始信号频率 f”或降低“采样频率 fs”，观察右侧频域边带何时相撞，并点击播放按钮亲耳听出频率超过 fs/2 后音调“不升反降”的混叠折返！",
      "controls": [
        {
          "type": "slider",
          "id": "sigFreq",
          "label": "原始信号频率 f",
          "min": 100,
          "max": 1200,
          "step": 20,
          "value": 300,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "fs",
          "label": "采样频率 fs",
          "min": 600,
          "max": 2400,
          "step": 50,
          "value": 1200,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "showAliasOnly",
          "label": "突出显示重建波形",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放采样重建音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet audioCtx = null;\nlet osc = null;\nlet gain = null;\n\nfunction getAliasInfo(f, fs) {\n  const k = Math.round(f / fs);\n  const fDiff = f - k * fs;\n  const fAlias = Math.abs(fDiff);\n  const aliased = f > fs / 2;\n  return { k: k, fDiff: fDiff, fAlias: fAlias, aliased: aliased };\n}\n\nfunction updateAudio() {\n  const play = lab.values.play;\n  const f = lab.values.sigFreq;\n  const fs = lab.values.fs;\n  const info = getAliasInfo(f, fs);\n  if (play) {\n    if (!audioCtx) {\n      audioCtx = lab.getAudioContext();\n    }\n    if (audioCtx.state === 'suspended') {\n      audioCtx.resume();\n    }\n    if (!osc) {\n      osc = audioCtx.createOscillator();\n      gain = audioCtx.createGain();\n      osc.type = 'sine';\n      gain.gain.value = 0;\n      osc.connect(gain);\n      gain.connect(audioCtx.destination);\n      osc.start();\n    }\n    const now = audioCtx.currentTime;\n    const targetFreq = Math.max(20, info.fAlias);\n    const targetGain = info.fAlias < 15 ? 0 : 0.14;\n    osc.frequency.setTargetAtTime(targetFreq, now, 0.02);\n    gain.gain.setTargetAtTime(targetGain, now, 0.03);\n  } else if (gain && audioCtx) {\n    const now = audioCtx.currentTime;\n    gain.gain.setTargetAtTime(0, now, 0.03);\n  }\n}\n\nfunction draw() {\n  const f = lab.values.sigFreq;\n  const fs = lab.values.fs;\n  const showAliasOnly = lab.values.showAliasOnly;\n  const info = getAliasInfo(f, fs);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(10, 10, 342, 220);\n  ctx.fillRect(368, 10, 342, 220);\n\n  const lx = 20, lw = 322, ly0 = 122, amp = 58;\n  const tWin = 0.005;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(lx, ly0); ctx.lineTo(lx + lw, ly0);\n  ctx.moveTo(lx, ly0 - amp); ctx.lineTo(lx + lw, ly0 - amp);\n  ctx.moveTo(lx, ly0 + amp); ctx.lineTo(lx + lw, ly0 + amp);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域 (Time Domain, 0~5 ms)', lx, 28);\n\n  ctx.save();\n  ctx.strokeStyle = (info.aliased || showAliasOnly) ? 'rgba(56,189,248,0.45)' : '#38bdf8';\n  ctx.lineWidth = (info.aliased || showAliasOnly) ? 1.5 : 2.2;\n  if (info.aliased || showAliasOnly) ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const t = (i / 200) * tWin;\n    const y = ly0 - amp * Math.sin(2 * Math.PI * f * t);\n    const px = lx + (i / 200) * lw;\n    if (i === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  if (info.aliased || showAliasOnly) {\n    ctx.strokeStyle = info.aliased ? '#ec4899' : '#10b981';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i <= 200; i++) {\n      const t = (i / 200) * tWin;\n      const y = ly0 - amp * Math.sin(2 * Math.PI * info.fDiff * t);\n      const px = lx + (i / 200) * lw;\n      if (i === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n    }\n    ctx.stroke();\n  }\n\n  const dt = 1 / fs;\n  const maxN = Math.floor(tWin / dt);\n  for (let n = 0; n <= maxN; n++) {\n    const t = n * dt;\n    const px = lx + (t / tWin) * lw;\n    const py = ly0 - amp * Math.sin(2 * Math.PI * f * t);\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath(); ctx.moveTo(px, ly0); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 原始波', lx, 220);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('● 采样点', lx + 68, 220);\n  if (info.aliased) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('— 混叠假波 (' + Math.round(info.fAlias) + ' Hz)', lx + 140, 220);\n  }\n\n  const rx = 380, rw = 318, ry0 = 195;\n  const fMaxAxis = 3600;\n  const f2x = function(freq) { return rx + (freq / fMaxAxis) * rw; };\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('频域 (Frequency Domain, 0~3600 Hz)', rx, 28);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(rx, ry0); ctx.lineTo(rx + rw, ry0);\n  ctx.moveTo(rx, 45); ctx.lineTo(rx, ry0);\n  ctx.stroke();\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(rx, 42, rw, ry0 - 42);\n  ctx.clip();\n\n  for (let k = 0; k <= 6; k++) {\n    const fc = k * fs;\n    if (fc - f > fMaxAxis) break;\n    ctx.fillStyle = k === 0 ? 'rgba(56,189,248,0.22)' : 'rgba(16,185,129,0.16)';\n    ctx.beginPath();\n    ctx.moveTo(f2x(fc - f), ry0);\n    ctx.lineTo(f2x(fc), ry0 - 90);\n    ctx.lineTo(f2x(fc + f), ry0);\n    ctx.closePath();\n    ctx.fill();\n\n    if (fc - f > 0 && fc - f <= fMaxAxis) {\n      const sx = f2x(fc - f);\n      ctx.strokeStyle = (info.aliased && fc - f < fs / 2) ? '#ec4899' : '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(sx, ry0); ctx.lineTo(sx, ry0 - 95); ctx.stroke();\n    }\n    if (fc + f > 0 && fc + f <= fMaxAxis) {\n      const sx = f2x(fc + f);\n      ctx.strokeStyle = k === 0 ? '#38bdf8' : '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(sx, ry0); ctx.lineTo(sx, ry0 - 95); ctx.stroke();\n    }\n  }\n\n  if (info.aliased) {\n    const ovL = Math.max(0, fs - f);\n    const ovR = Math.min(fMaxAxis, f);\n    if (ovR > ovL) {\n      ctx.fillStyle = 'rgba(236,72,153,0.32)';\n      ctx.fillRect(f2x(ovL), ry0 - 90, f2x(ovR) - f2x(ovL), 90);\n    }\n  }\n  ctx.restore();\n\n  const nyqX = f2x(fs / 2);\n  if (nyqX <= rx + rw) {\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath(); ctx.moveTo(nyqX, 42); ctx.lineTo(nyqX, ry0); ctx.stroke();\n    ctx.restore();\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('fs/2', nyqX - 10, 39);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0', rx - 3, ry0 + 13);\n  for (let m = 1; m <= 5; m++) {\n    const mf = m * fs;\n    if (mf <= fMaxAxis) {\n      const mx = f2x(mf);\n      ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n      ctx.beginPath(); ctx.moveTo(mx, 48); ctx.lineTo(mx, ry0); ctx.stroke();\n      ctx.fillText(m === 1 ? 'fs' : m + 'fs', mx - 8, ry0 + 13);\n    }\n  }\n\n  const nyq = fs / 2;\n  if (info.aliased) {\n    lab.setReadout('采样率 fs=' + fs + ' Hz | 奈奎斯特极限=' + nyq + ' Hz | 输入 f=' + f + ' Hz > fs/2 → 发生混叠！虚假重建频率=' + Math.round(info.fAlias) + ' Hz');\n  } else {\n    lab.setReadout('采样率 fs=' + fs + ' Hz | 奈奎斯特极限=' + nyq + ' Hz | 输入 f=' + f + ' Hz ≤ fs/2 → 边带分离，无混叠完美重建');\n  }\n}\n\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "2. DAC 重建的物理现实：零阶保持 (Zeroth-Order Hold) 与 sinc 滚降",
      "paragraphs": [
        "理论上，把数字变成模拟只需两步：先把数字序列变成**冲激串**（图 3-6a），再用截止频率为 `fs / 2` 的**低通滤波器**切掉所有复制出来的高频边带，就能把原始模拟波形一模一样地还原出来（图 3-6f）。",
        "但现实电路很难造出能量集中、宽度趋近于零的窄脉冲。因此几乎所有 DAC 芯片都采取“偷懒”策略：在下一个采样点到来前，**一直保持当前电压不变**。这叫**零阶保持 (Zeroth-Order Hold, ZOH)**，它会在时域上画出一个“阶梯状”波形（图 3-6c）。（注：若用直线连点叫一阶保持，用抛物线叫二阶保持。）",
        "时域变成阶梯，等价于“理想冲激串”与一个宽度为采样周期 `Ts` 的矩形脉冲做了**卷积**。反映到频域里，就是原本平坦完美的冲激串频谱，被迫乘上了矩形脉冲的傅里叶变换——大名鼎鼎的 **`sinc` 函数**（图 3-6d）。",
        "后果很明显：越靠近奈奎斯特极限 `fs / 2`，信号幅度被 `sinc` 压得越惨，在 `fs / 2` 处幅度会跌落约 **36.3%**（即衰减至 `2/π ≈ 0.637`，约 `-3.92 dB`）。因此，实际的重建滤波器不仅要砍掉 `fs / 2` 以上的所有镜像频率，还得在通带内提供 `1 / sinc(x)` 的**高频翘起补偿**（图 3-6e）。工程上对这个高频跌落有 4 种处理策略：(1) 直接忽略；(2) 在模拟滤波器里做出 `1/sinc(x)` 抬升；(3) 使用本章后面介绍的多速率过采样技术；(4) 在送进 DAC 之前，先在数字软件里做反失真预补偿（第 24 章详解）。"
      ],
      "formula": {
        "expr": "H(f) = | sin(πf / fs) / (πf / fs) |",
        "explain": "公式 3-1：零阶保持导致的频率幅度衰减曲线。f=0 时 H(0)=1；当 f 升至 fs/2 时，H(fs/2) = 2/π ≈ 0.637，需乘以倒数 1/H(f) ≈ 1.571（提升约 57% 增益，补偿那 36% 的幅度损失）才能拉平频响。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：零阶保持 (ZOH) 阶梯失真与 1/sinc(x) 补偿滤波器",
      "instruction": "把频率推向 0.49 fs 靠近奈奎斯特极限，开关“零阶保持”与“1/sinc(x) 补偿”，观察时域幅度跌落与频域补偿曲线如何拉平信号。",
      "controls": [
        {
          "type": "slider",
          "id": "sigFreq",
          "label": "输入信号频率 f/fs",
          "min": 0.05,
          "max": 0.49,
          "step": 0.01,
          "value": 0.35,
          "unit": " fs"
        },
        {
          "type": "toggle",
          "id": "zoh",
          "label": "启用零阶保持 (阶梯波)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "comp",
          "label": "开启 1/sinc(x) 高频补偿",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction sinc(x) {\n  if (Math.abs(x) < 1e-6) return 1;\n  const px = Math.PI * x;\n  return Math.abs(Math.sin(px) / px);\n}\n\nfunction draw() {\n  const fn = lab.values.sigFreq;\n  const zoh = lab.values.zoh;\n  const comp = lab.values.comp;\n  const sVal = sinc(fn);\n  const invVal = 1 / sVal;\n  const outAmp = zoh ? (comp ? 1.0 : sVal) : 1.0;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(10, 10, 342, 220);\n  ctx.fillRect(368, 10, 342, 220);\n\n  const lx = 20, lw = 322, ly0 = 122, amp = 58;\n  const nMax = 8;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(lx, ly0); ctx.lineTo(lx + lw, ly0);\n  ctx.moveTo(lx, ly0 - amp); ctx.lineTo(lx + lw, ly0 - amp);\n  ctx.moveTo(lx, ly0 + amp); ctx.lineTo(lx + lw, ly0 + amp);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域 (DAC 输出与滤后重建对比)', lx, 28);\n\n  ctx.save();\n  ctx.strokeStyle = 'rgba(56,189,248,0.65)';\n  ctx.lineWidth = 1.6;\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const t = (i / 200) * nMax;\n    const px = lx + (t / nMax) * lw;\n    const py = ly0 - amp * Math.sin(2 * Math.PI * fn * t);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  if (zoh) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let n = 0; n < nMax; n++) {\n      const x1 = lx + (n / nMax) * lw;\n      const x2 = lx + ((n + 1) / nMax) * lw;\n      const py = ly0 - amp * Math.sin(2 * Math.PI * fn * n);\n      if (n === 0) ctx.moveTo(x1, py); else ctx.lineTo(x1, py);\n      ctx.lineTo(x2, py);\n    }\n    ctx.stroke();\n  } else {\n    for (let n = 0; n <= nMax; n++) {\n      const px = lx + (n / nMax) * lw;\n      const py = ly0 - amp * Math.sin(2 * Math.PI * fn * n);\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(px, ly0); ctx.lineTo(px, py); ctx.stroke();\n      ctx.fillStyle = '#f59e0b';\n      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  ctx.strokeStyle = (zoh && !comp) ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const t = (i / 200) * nMax;\n    const px = lx + (t / nMax) * lw;\n    const py = ly0 - amp * outAmp * Math.sin(2 * Math.PI * fn * t);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('-- 目标理想波', lx, 220);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText(zoh ? '— 零阶保持阶梯' : '● 理想冲激串', lx + 88, 220);\n  ctx.fillStyle = (zoh && !comp) ? '#ec4899' : '#10b981';\n  ctx.fillText((zoh && !comp) ? '— 衰减后基波' : '— 完美重建波', lx + 190, 220);\n\n  const rx = 390, rw = 308, ry0 = 195, unitH = 90;\n  const fMax = 2.5;\n  const f2x = function(r) { return rx + (r / fMax) * rw; };\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('频域 (sinc 滚降与 1/sinc 补偿)', rx, 28);\n\n  ctx.fillStyle = 'rgba(16,185,129,0.09)';\n  ctx.fillRect(rx, 42, f2x(0.5) - rx, ry0 - 42);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(rx, ry0); ctx.lineTo(rx + rw, ry0);\n  ctx.moveTo(rx, 40); ctx.lineTo(rx, ry0);\n  ctx.moveTo(rx, ry0 - unitH); ctx.lineTo(rx + rw, ry0 - unitH);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('1.0', rx - 18, ry0 - unitH + 4);\n  ctx.fillText('0', rx - 9, ry0 + 4);\n  const ticks = [0.5, 1.0, 1.5, 2.0];\n  const tickLabels = ['0.5fs', 'fs', '1.5fs', '2fs'];\n  for (let i = 0; i < ticks.length; i++) {\n    const tx = f2x(ticks[i]);\n    ctx.strokeStyle = ticks[i] === 0.5 ? '#f59e0b' : 'rgba(255,255,255,0.1)';\n    ctx.beginPath(); ctx.moveTo(tx, 42); ctx.lineTo(tx, ry0); ctx.stroke();\n    ctx.fillStyle = ticks[i] === 0.5 ? '#f59e0b' : 'rgba(248,250,252,0.65)';\n    ctx.fillText(tickLabels[i], tx - 10, ry0 + 13);\n  }\n\n  ctx.save();\n  ctx.strokeStyle = zoh ? '#f59e0b' : 'rgba(245,158,11,0.35)';\n  ctx.lineWidth = zoh ? 2 : 1.2;\n  if (!zoh) ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const r = (i / 200) * fMax;\n    const px = f2x(r);\n    const py = ry0 - unitH * sinc(r);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  if (comp) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let i = 0; i <= 60; i++) {\n      const r = (i / 60) * 0.5;\n      const px = f2x(r);\n      const py = ry0 - unitH * (1 / sinc(r));\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.lineTo(f2x(0.5), ry0);\n    ctx.lineTo(f2x(fMax), ry0);\n    ctx.stroke();\n  }\n\n  const mx = f2x(fn);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(mx, ry0); ctx.lineTo(mx, ry0 - unitH * outAmp); ctx.stroke();\n\n  ctx.fillStyle = (zoh && !comp) ? '#ec4899' : '#10b981';\n  ctx.beginPath(); ctx.arc(mx, ry0 - unitH * outAmp, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  if (zoh) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.arc(mx, ry0 - unitH * sVal, 3, 0, Math.PI * 2); ctx.fill();\n  }\n\n  const lossPct = ((1 - sVal) * 100).toFixed(1);\n  const boostPct = ((invVal - 1) * 100).toFixed(1);\n  const db = (20 * Math.log10(sVal)).toFixed(2);\n  lab.setReadout('频比 f/fs=' + fn.toFixed(2) + ' | sinc衰减=' + sVal.toFixed(3) + ' (' + db + ' dB, 跌落 ' + lossPct + '%) | 1/sinc补偿需增益=' + invVal.toFixed(3) + ' (+' + boostPct + '%) | 实际重建幅度=' + (outAmp * 100).toFixed(1) + '%');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. 戳破经典迷思：“模拟信号真的比数字信号分辨率无限高吗？”",
      "paragraphs": [
        "很多人坚信一个直觉：**“模拟信号在时间和幅度上都是连续的，所以它的分辨率无限高；数字信号被采样和量化割裂了，所以天然低人一等。”**",
        "这是一个彻头彻尾的**错误迷思**！数字信号确实受限于两个维度：采样位数（bit 数）限制了**因变量（幅度）**的分辨率（微小变化会被量化噪声淹没）；采样率限制了**自变量（时间）**的分辨率（落在两个采样点之间的紧邻脉冲会丢失，即高于 `fs / 2` 的频率无法表示）。",
        "但模拟信号也逃不出完全相同的两座物理大山：**热噪声 (Noise)** 与 **带宽 (Bandwidth)**。模拟电路里的本底噪声同样限制了幅度的测量精度，就像量化噪声一样；而信号允许通过的最高频率（带宽），决定了时间上靠得很近的两个脉冲能否被分辨出来——一旦经过低通滤波器削去高频，两个紧挨的窄脉冲就会糊成一团分不开。",
        "根据采样定理，**一个带宽限制在 DC 到 10 kHz 之间的模拟信号，与一个以 20 kHz 采样的数字信号，包含着完全一模一样的信息量，时间分辨率也分毫不差**。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "时域采样 = 频域周期延拓：工程中只要看到采样，脑海里必须立刻浮现出以 fs、2fs、3fs 为中心的无穷多对上下边带；保证不混叠的底线是信号最高频率严格低于 fs/2。",
        "零阶保持不是免费的午餐：DAC 吐出的阶梯波自带 sinc(f/fs) 低通滤镜效果，在奈奎斯特边界会平白损失约 36%（-3.9 dB）的幅度；高保真音频或精密仪器系统必须做 1/sinc 补偿（硬件模拟抬升、多速率过采样或数字域预加重）。",
        "模拟与数字的信息量天花板等价：别迷信“纯模拟无限精细”，带宽限制了模拟信号的时间分辨力，本底噪声限制了它的幅度分辨力，二者与采样率、量化位数一一对应。"
      ]
    }
  ]
});
