window.__BOOK_REGISTER_SECTION__("sec_037", {
  "title": "数模转换原理：从数字样本到模拟信号 (Digital-to-Analog Conversion)",
  "intuition": "DAC 先把内存里的数字变成一串高高低低的脉冲，再用模拟低通滤波器把脉冲之间的空隙“抹平”，还原出丝滑的连续信号。",
  "blocks": [
    {
      "type": "concept",
      "heading": "理论起点：把数字样本变成脉冲序列 (Impulse Train)",
      "paragraphs": [
        "当信号经过处理并存储在计算机内存中后，它只是一串离散的数字。要让扬声器发声或驱动模拟电路，就必须执行**数模转换（Digital-to-Analog Conversion，简称 DAC）**。",
        "从信号处理的理论角度看，最直观、最简单的 DAC 方案只有两步：首先按照设定的采样率 `f_s`，依次从内存中取出每个数字样本 `x[n]`，并将它们转换成时间轴上等间隔排列的**脉冲序列（Impulse Train）**——每个脉冲的位置在 `t = n / f_s`，脉冲幅度与数字样本值成正比。",
        "神奇的是，这个脉冲序列在频域中已经完整包含了原始模拟信号的全部频率成分（基带），只是在 `f_s, 2f_s, 3f_s ...` 等采样率整数倍处附带了多余的镜像频谱。因此，只要在后端接上一个截止频率为 `0.5 · f_s` 的**模拟低通滤波器**，把高于一半采样率的镜像频率全部切掉，脉冲序列就会在时域里自然“摊平”并精准还原为连续的模拟信号。"
      ],
      "formula": {
        "expr": "x_impulse(t) = Σ x[n] · δ(t - n / f_s)",
        "explain": "x[n] 是从内存读取的第 n 个数字样本，f_s 是 DAC 输出的采样率，δ(t - n/f_s) 表示在时刻 n/f_s 处触发的单位脉冲，x_impulse(t) 即生成的连续时间脉冲序列。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：脉冲序列生成与理想低通重构",
      "instruction": "拖动“原始信号频率”和“DAC 采样率”滑块，开关“理想模拟低通滤波”，同时观察时域脉冲如何还原成正弦波、频域镜像如何被切除。",
      "controls": [
        {
          "type": "slider",
          "id": "sigFreq",
          "label": "原始信号频率",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 2,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "sampleRate",
          "label": "DAC 采样率 fs",
          "min": 6,
          "max": 32,
          "step": 1,
          "value": 12,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "reconstruct",
          "label": "开启理想模拟低通滤波 (0.5·fs)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showRef",
          "label": "显示原始连续轮廓",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction sinc(x) {\n  if (Math.abs(x) < 1e-6) return 1;\n  const px = Math.PI * x;\n  return Math.sin(px) / px;\n}\n\nfunction draw() {\n  const f = lab.values.sigFreq;\n  const fs = lab.values.sampleRate;\n  const recon = !!lab.values.reconstruct;\n  const showRef = !!lab.values.showRef;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const tx0 = 28, tx1 = 428, tw = tx1 - tx0;\n  const tyMid = 128, tyAmp = 68;\n  const fx0 = 468, fx1 = 702, fw = fx1 - fx0;\n  const fyBase = 194, fyH = 124;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = tyMid - tyAmp + (i * tyAmp * 2) / 4;\n    ctx.beginPath(); ctx.moveTo(tx0, y); ctx.lineTo(tx1, y); ctx.stroke();\n  }\n  for (let i = 0; i <= 5; i++) {\n    const x = tx0 + (i * tw) / 5;\n    ctx.beginPath(); ctx.moveTo(x, tyMid - tyAmp - 8); ctx.lineTo(x, tyMid + tyAmp + 8); ctx.stroke();\n  }\n  for (let i = 0; i <= 3; i++) {\n    const y = fyBase - (i * fyH) / 3;\n    ctx.beginPath(); ctx.moveTo(fx0, y); ctx.lineTo(fx1, y); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域：脉冲序列与低通重构 (0 ~ 1s)', tx0, 24);\n  ctx.fillText('频域：基带与镜像边带 (0 ~ 40 Hz)', fx0, 24);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.beginPath(); ctx.moveTo(448, 14); ctx.lineTo(448, H - 14); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(tx0, tyMid); ctx.lineTo(tx1, tyMid); ctx.stroke();\n\n  if (showRef) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.42)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let px = 0; px <= tw; px += 2) {\n      const t = px / tw;\n      const y = tyMid - Math.sin(2 * Math.PI * f * t) * tyAmp;\n      if (px === 0) ctx.moveTo(tx0 + px, y);\n      else ctx.lineTo(tx0 + px, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  const Ts = 1 / fs;\n  const nMax = Math.floor(fs);\n  for (let n = 0; n <= nMax; n++) {\n    const t = n * Ts;\n    if (t > 1.0001) break;\n    const x = tx0 + t * tw;\n    const val = Math.sin(2 * Math.PI * f * t);\n    const y = tyMid - val * tyAmp;\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(x, tyMid);\n    ctx.lineTo(x, y);\n    ctx.stroke();\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(x, y, 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  if (recon) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let px = 0; px <= tw; px += 2) {\n      const t = px / tw;\n      let sum = 0;\n      for (let n = -24; n <= fs + 24; n++) {\n        const tn = n * Ts;\n        const d = Math.abs(fs * (t - tn));\n        if (d < 24) {\n          const w = d <= 12 ? 1 : 0.5 * (1 + Math.cos(Math.PI * (d - 12) / 12));\n          const xn = Math.sin(2 * Math.PI * f * tn);\n          sum += xn * sinc(fs * (t - tn)) * w;\n        }\n      }\n      const y = tyMid - sum * tyAmp;\n      if (px === 0) ctx.moveTo(tx0 + px, y);\n      else ctx.lineTo(tx0 + px, y);\n    }\n    ctx.stroke();\n  }\n\n  const fMaxAxis = 40;\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(fx0, fyBase); ctx.lineTo(fx1, fyBase); ctx.stroke();\n\n  const cutoff = 0.5 * fs;\n  const cx = fx0 + (Math.min(cutoff, fMaxAxis) / fMaxAxis) * fw;\n  if (recon) {\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n    ctx.fillRect(fx0, fyBase - fyH, cx - fx0, fyH);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.6;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    ctx.moveTo(cx, fyBase - fyH - 6);\n    ctx.lineTo(cx, fyBase);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('0.5fs=' + cutoff.toFixed(1) + 'Hz', Math.min(cx + 4, fx1 - 74), fyBase - fyH + 10);\n  }\n\n  function drawSpike(freqVal, color, faded) {\n    if (freqVal < 0 || freqVal > fMaxAxis) return;\n    const x = fx0 + (freqVal / fMaxAxis) * fw;\n    ctx.strokeStyle = faded ? 'rgba(245, 158, 11, 0.20)' : color;\n    ctx.lineWidth = faded ? 1.5 : 2.5;\n    ctx.beginPath();\n    ctx.moveTo(x, fyBase);\n    ctx.lineTo(x, fyBase - fyH * 0.78);\n    ctx.stroke();\n    ctx.fillStyle = faded ? 'rgba(245, 158, 11, 0.24)' : color;\n    ctx.beginPath();\n    ctx.arc(x, fyBase - fyH * 0.78, 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  drawSpike(f, '#10b981', recon && f > cutoff);\n  for (let k = 1; k <= 6; k++) {\n    const lower = k * fs - f;\n    const upper = k * fs + f;\n    drawSpike(lower, '#f59e0b', recon && lower > cutoff);\n    drawSpike(upper, '#f59e0b', recon && upper > cutoff);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '10px sans-serif';\n  for (let hz = 0; hz <= 40; hz += 10) {\n    const x = fx0 + (hz / fMaxAxis) * fw;\n    ctx.fillText(hz + '', x - 6, fyBase + 13);\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('● 脉冲序列', tx0, H - 10);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('━ 低通重构波形', tx0 + 95, H - 10);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('● 镜像高频边带', fx0, H - 10);\n\n  const status = f < cutoff ? '可无损重构 (f < 0.5·fs)' : '警告：采样率不足，基带与镜像混叠';\n  lab.setReadout('信号 f=' + f + ' Hz | DAC采样率 fs=' + fs + ' Hz | 截止频率 0.5·fs=' + cutoff.toFixed(1) + ' Hz | ' + status);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "从理想脉冲到现实电路：阶梯波与模拟重构滤波",
      "paragraphs": [
        "脉冲序列在数学上极其优美，但现实电子电路无法凭空造出宽度无限窄、能量却有限的理想脉冲。因此，工程中的硬件 DAC 芯片通常采用**零阶保持（Zero-Order Hold）**：在收到一个数字样本后，把对应的电压一直保持到下一个样本到来为止，从而输出一道道**阶梯状波形**。",
        "这些直角台阶虽然比脉冲容易产生得多，但台阶上的尖锐拐角会在频域里残留大量位于 `f_s ± f`、`2f_s ± f` 附近的高频镜像噪声。如果直接把未滤波的 DAC 阶梯波送进耳机或功放，耳朵会明显听到刺耳的金属高频杂音。",
        "因此，无论是理论上的“脉冲序列”，还是现实芯片输出的“阶梯波”，最后都离不开**模拟低通重构滤波器（Reconstruction Filter）**。它的作用就像砂纸一样，把离散输出中高于 `0.5 · f_s` 的高频毛刺彻底磨平，只留下原本的平滑模拟信号。"
      ],
      "formula": {
        "expr": "x_analog(t) = Σ x[n] · sinc(f_s · t - n)",
        "explain": "理想低通滤波在时域等效于用 sinc 函数为每个离散样本“铺平并叠加”：x[n] 为第 n 个样本，f_s 为采样率，所有 sinc 曲线叠加后即可精确穿插出原模拟波形 x_analog(t)。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：DAC 阶梯输出 vs 模拟滤波平滑听感对比",
      "instruction": "点击“播放测试音”，切换“开启模拟低通平滑滤波”并调节音调与 DAC 采样率，亲耳听出阶梯波高频毛刺与平滑模拟正弦波的巨大差异。",
      "controls": [
        {
          "type": "slider",
          "id": "toneFreq",
          "label": "基波音调频率",
          "min": 150,
          "max": 500,
          "step": 10,
          "value": 260,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "dacRate",
          "label": "模拟 DAC 采样率",
          "min": 1400,
          "max": 4800,
          "step": 200,
          "value": 1800,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "lpfOn",
          "label": "开启模拟低通平滑滤波",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet sourceNode = null;\nlet filter1 = null;\nlet filter2 = null;\nlet gainNode = null;\nlet isPlaying = false;\nlet lastTone = -1;\nlet lastDac = -1;\nlet animPhase = 0;\n\nfunction buildBuffer(actx, toneFreq, dacRate) {\n  const dur = 0.5;\n  const len = Math.round(actx.sampleRate * dur);\n  const buf = actx.createBuffer(1, len, actx.sampleRate);\n  const data = buf.getChannelData(0);\n  for (let i = 0; i < len; i++) {\n    const t = i / actx.sampleRate;\n    const n = Math.floor(t * dacRate);\n    const ts = n / dacRate;\n    data[i] = Math.sin(2 * Math.PI * toneFreq * ts);\n  }\n  return buf;\n}\n\nfunction syncAudio() {\n  const wantPlay = !!lab.values.play;\n  const tone = lab.values.toneFreq;\n  const dac = lab.values.dacRate;\n  const lpf = !!lab.values.lpfOn;\n\n  if (!wantPlay) {\n    if (sourceNode) {\n      try { sourceNode.stop(); sourceNode.disconnect(); } catch (e) {}\n      sourceNode = null;\n    }\n    isPlaying = false;\n    return;\n  }\n\n  const actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') actx.resume();\n\n  if (!gainNode) {\n    filter1 = actx.createBiquadFilter();\n    filter1.type = 'lowpass';\n    filter1.Q.value = 0.707;\n    filter2 = actx.createBiquadFilter();\n    filter2.type = 'lowpass';\n    filter2.Q.value = 0.707;\n    gainNode = actx.createGain();\n    gainNode.gain.value = 0.16;\n    filter1.connect(filter2);\n    filter2.connect(gainNode);\n    gainNode.connect(actx.destination);\n  }\n\n  const cutoff = lpf ? Math.min(dac * 0.45, 18000) : 18000;\n  filter1.frequency.setTargetAtTime(cutoff, actx.currentTime, 0.015);\n  filter2.frequency.setTargetAtTime(cutoff, actx.currentTime, 0.015);\n\n  if (!isPlaying || tone !== lastTone || dac !== lastDac) {\n    if (sourceNode) {\n      try { sourceNode.stop(); sourceNode.disconnect(); } catch (e) {}\n    }\n    const src = actx.createBufferSource();\n    src.buffer = buildBuffer(actx, tone, dac);\n    src.loop = true;\n    src.connect(filter1);\n    src.start();\n    sourceNode = src;\n    isPlaying = true;\n    lastTone = tone;\n    lastDac = dac;\n  }\n}\n\nfunction draw() {\n  const tone = lab.values.toneFreq;\n  const dac = lab.values.dacRate;\n  const lpf = !!lab.values.lpfOn;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const padL = 34, padR = 24;\n  const gw = W - padL - padR;\n  const midY = 122, amp = 74;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = midY - amp + (i * amp * 2) / 4;\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + gw, y); ctx.stroke();\n  }\n  for (let i = 0; i <= 6; i++) {\n    const x = padL + (i * gw) / 6;\n    ctx.beginPath(); ctx.moveTo(x, midY - amp - 10); ctx.lineTo(x, midY + amp + 10); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padL + gw, midY); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('DAC 输出时域波形（显示 3 个基波周期）', padL, 24);\n\n  const winDur = 3 / tone;\n  const tStart = animPhase / tone;\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let px = 0; px <= gw; px += 2) {\n    const t = tStart + (px / gw) * winDur;\n    const y = midY - Math.sin(2 * Math.PI * tone * t) * amp;\n    if (px === 0) ctx.moveTo(padL + px, y);\n    else ctx.lineTo(padL + px, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = lpf ? 'rgba(245, 158, 11, 0.45)' : '#f59e0b';\n  ctx.lineWidth = lpf ? 1.6 : 2.4;\n  ctx.beginPath();\n  for (let px = 0; px <= gw; px++) {\n    const t = tStart + (px / gw) * winDur;\n    const n = Math.floor(t * dac);\n    const val = Math.sin(2 * Math.PI * tone * (n / dac));\n    const y = midY - val * amp;\n    if (px === 0) ctx.moveTo(padL + px, y);\n    else ctx.lineTo(padL + px, y);\n  }\n  ctx.stroke();\n\n  const nStart = Math.ceil(tStart * dac);\n  const nEnd = Math.floor((tStart + winDur) * dac);\n  ctx.fillStyle = '#38bdf8';\n  for (let n = nStart; n <= nEnd; n++) {\n    const ts = n / dac;\n    const px = ((ts - tStart) / winDur) * gw;\n    const val = Math.sin(2 * Math.PI * tone * ts);\n    const y = midY - val * amp;\n    ctx.beginPath();\n    ctx.arc(padL + px, y, 2.8, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  if (lpf) {\n    const preDur = 1.5 / tone;\n    const simStart = tStart - preDur;\n    const totalSim = preDur + winDur;\n    const steps = 420;\n    const dtSim = totalSim / steps;\n    const rc = 1 / (2 * Math.PI * dac * 0.45);\n    const alpha = dtSim / (rc + dtSim);\n    let y1 = 0;\n    let y2 = 0;\n\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.6;\n    ctx.beginPath();\n    let started = false;\n    for (let i = 0; i <= steps; i++) {\n      const t = simStart + i * dtSim;\n      const n = Math.floor(t * dac);\n      const zoh = Math.sin(2 * Math.PI * tone * (n / dac));\n      y1 += alpha * (zoh - y1);\n      y2 += alpha * (y1 - y2);\n      if (t >= tStart) {\n        const px = ((t - tStart) / winDur) * gw;\n        const py = midY - y2 * amp;\n        if (!started) {\n          ctx.moveTo(padL + px, py);\n          started = true;\n        } else {\n          ctx.lineTo(padL + px, py);\n        }\n      }\n    }\n    ctx.stroke();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('● 数字样本点', padL, H - 12);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('━ 原始阶梯输出 (含高频镜像)', padL + 100, H - 12);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('━ 模拟低通滤波后波形', padL + 295, H - 12);\n\n  const ratio = (dac / tone).toFixed(1);\n  const modeText = lpf ? '低通滤波已开启：台阶毛刺被抹平，听感纯净' : '直接输出阶梯波：含大量高频镜像，带金属蜂鸣感';\n  lab.setReadout('基波 ' + tone + ' Hz | DAC采样率 ' + dac + ' Hz (' + ratio + 'x 采样) | ' + modeText);\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    animPhase = (animPhase + dt * 0.8) % 100;\n    draw();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数模转换的物理本质是“离散转连续 + 频域去镜像”：理论模型把样本变成脉冲序列，现实芯片把样本变成阶梯波，但两者的核心收尾工作都是同一件事——用模拟低通滤波器切掉 0.5·fs 以上的高频镜像。",
        "不要忽略 DAC 后端的模拟低通滤波器：未经过重构滤波的阶梯波虽然在示波器上看似“大概对了”，但在音频或射频系统中会向后级注入大量高频谐波失真。",
        "提高 DAC 采样率能大幅降低模拟硬件难度：采样率 fs 越高，基带信号与第一个镜像边带之间的间隔就越宽，廉价的简单 RC 低通电路就能把阶梯磨平。"
      ]
    }
  ]
});
