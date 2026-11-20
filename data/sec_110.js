window.__BOOK_REGISTER_SECTION__("sec_110", {
  "title": "信号相乘与振幅调制 (Multiplying Signals / Amplitude Modulation)",
  "intuition": "时域相乘等于频域卷积：把缓慢的语音信号乘上高频正弦载波，就像让声音坐上高速电磁波火箭，把原本藏在数学里的“负频率幽灵”也一并搬移到现实的高频空中。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么必须“相乘”而不是“相加”？——包络与直流偏置",
      "paragraphs": [
        "人耳能听到的语音信号（约 `300 Hz ~ 3 kHz`）在房间里传播很棒，但在电磁波世界里却是“短腿选手”，几乎无法从天线有效辐射出去。相反，高频无线电波（例如 `1 MHz` 的正弦波）能轻松跨越城市、大洲甚至行星。**调制（Modulation）**的核心任务，就是把“携带着信息的低频声音”与“善于长途奔袭的高频载波”合二为一。",
        "初学者最容易犯的直觉错误是：**能不能直接把声音和载波相加？** 答案是绝对不行！相加只是线性叠加，两个信号在频谱上依然各过各的，低频语音在天线端依然辐射不出去。必须使用**乘法**这种非线性操作，让低频信号去实时控制高频载波的振幅，这种最经典的方案就叫**振幅调制（AM）**。",
        "注意原书图 10-14(a) 中的一个关键细节：音频信号在相乘前先加上了一个**直流偏置（DC Bias）**，保证它的电压永远大于零。这样一来，相乘后得到的高频振荡波形，其上下边界的轮廓——行话叫**包络（Envelope）**——就完完全全等于原始音频信号。接收机里的检波器（Detector）只需要沿着包络描边，就能轻松把声音还原出来。"
      ],
      "formula": {
        "expr": "y(t) = [ A_dc + x(t) ] · cos(2π · f_c · t)",
        "explain": "x(t) 是原始低频音频信号，A_dc 是保证波形恒正的直流偏置，cos(2π·f_c·t) 是高频载波，y(t) 是最终送往天线的已调波。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：AM 时域相乘、包络成型与实时听感",
      "instruction": "拖动“音频直流偏置”滑块观察包络形态：当偏置低于 0.6 时会出现过调制反相；点击播放可实时对比正常包络脉冲与过调制倍频失真（声音已映射至可听载波频段）。",
      "controls": [
        {
          "type": "slider",
          "id": "modFreq",
          "label": "音频调制频率",
          "min": 2,
          "max": 10,
          "step": 1,
          "value": 3,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "carrierFreq",
          "label": "载波频率 (视觉)",
          "min": 25,
          "max": 80,
          "step": 5,
          "value": 45,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "dcBias",
          "label": "音频直流偏置",
          "min": 0,
          "max": 1.5,
          "step": 0.1,
          "value": 1,
          "unit": " V"
        },
        {
          "type": "toggle",
          "id": "showEnvelope",
          "label": "显示原信号包络与过调制警示",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 监听调制波形 (10倍载波音高)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet phaseShift = 0;\nlet audioNodes = null;\n\nfunction ensureAudio() {\n  if (audioNodes) return audioNodes;\n  const ac = lab.getAudioContext();\n  if (!ac) return null;\n  const carrier = ac.createOscillator();\n  const mod = ac.createOscillator();\n  const modGain = ac.createGain();\n  const amGain = ac.createGain();\n  const master = ac.createGain();\n  carrier.type = 'sine';\n  mod.type = 'sine';\n  modGain.gain.value = 0.35;\n  master.gain.value = 0;\n  mod.connect(modGain);\n  modGain.connect(amGain.gain);\n  carrier.connect(amGain);\n  amGain.connect(master);\n  master.connect(ac.destination);\n  carrier.start();\n  mod.start();\n  audioNodes = { ac, carrier, mod, modGain, amGain, master };\n  return audioNodes;\n}\n\nfunction syncAudio() {\n  const { modFreq, carrierFreq, dcBias, play } = lab.values;\n  if (play) {\n    const a = ensureAudio();\n    if (a) {\n      if (a.ac.state === 'suspended') a.ac.resume();\n      const now = a.ac.currentTime;\n      a.carrier.frequency.setTargetAtTime(carrierFreq * 10, now, 0.02);\n      a.mod.frequency.setTargetAtTime(modFreq, now, 0.02);\n      a.amGain.gain.setTargetAtTime(dcBias * 0.35 / 0.6, now, 0.02);\n      a.master.gain.setTargetAtTime(0.28, now, 0.03);\n    }\n  } else if (audioNodes) {\n    const now = audioNodes.ac.currentTime;\n    audioNodes.master.gain.setTargetAtTime(0, now, 0.03);\n  }\n}\n\nfunction draw() {\n  const { modFreq, carrierFreq, dcBias, showEnvelope } = lab.values;\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 46, padR = 20, padT = 20, padB = 26;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const cy = padT + plotH / 2;\n  const maxAmp = 2.2;\n  const scaleY = (plotH / 2) / maxAmp;\n  const T = 0.5;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 5; i++) {\n    const x = padL + (i / 5) * plotW;\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();\n  }\n  for (let v = -2; v <= 2; v++) {\n    const y = cy - v * scaleY;\n    ctx.beginPath();\n    ctx.strokeStyle = v === 0 ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)';\n    ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  for (let v = -2; v <= 2; v += 1) {\n    ctx.fillText(v + 'V', padL - 6, cy - v * scaleY + 4);\n  }\n  ctx.textAlign = 'center';\n  for (let i = 0; i <= 5; i++) {\n    ctx.fillText((i * 100) + ' ms', padL + (i / 5) * plotW, H - 7);\n  }\n\n  const modAmp = 0.6;\n  const samples = 1200;\n\n  if (showEnvelope) {\n    ctx.save();\n    for (let i = 0; i < samples; i++) {\n      const t = (i / samples) * T;\n      const m = dcBias + modAmp * Math.sin(2 * Math.PI * modFreq * (t + phaseShift));\n      if (m < 0) {\n        const x = padL + (i / samples) * plotW;\n        ctx.fillStyle = 'rgba(236,72,153,0.16)';\n        ctx.fillRect(x, padT, plotW / samples + 1, plotH);\n      }\n    }\n    ctx.restore();\n  }\n\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.5;\n  for (let i = 0; i <= samples; i++) {\n    const t = (i / samples) * T;\n    const m = dcBias + modAmp * Math.sin(2 * Math.PI * modFreq * (t + phaseShift));\n    const yVal = m * Math.sin(2 * Math.PI * carrierFreq * (t + phaseShift));\n    const x = padL + (i / samples) * plotW;\n    const y = cy - Math.max(-maxAmp, Math.min(maxAmp, yVal)) * scaleY;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (showEnvelope) {\n    ctx.setLineDash([5, 4]);\n    ctx.lineWidth = 2;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.beginPath();\n    for (let i = 0; i <= 300; i++) {\n      const t = (i / 300) * T;\n      const m = dcBias + modAmp * Math.sin(2 * Math.PI * modFreq * (t + phaseShift));\n      const x = padL + (i / 300) * plotW;\n      const y = cy - Math.max(-maxAmp, Math.min(maxAmp, m)) * scaleY;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (let i = 0; i <= 300; i++) {\n      const t = (i / 300) * T;\n      const m = -(dcBias + modAmp * Math.sin(2 * Math.PI * modFreq * (t + phaseShift)));\n      const x = padL + (i / 300) * plotW;\n      const y = cy - Math.max(-maxAmp, Math.min(maxAmp, m)) * scaleY;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.textAlign = 'left';\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('━ 已调波形 y(t)', padL + 10, padT + 14);\n  if (showEnvelope) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('┅ 带偏置音频 m(t)', padL + 135, padT + 14);\n    if (dcBias < modAmp) {\n      ctx.fillStyle = '#ec4899';\n      ctx.fillText('■ 过调制/反相区 (包络失真)', padL + 275, padT + 14);\n    }\n  }\n\n  const modIndex = dcBias > 0.001 ? (modAmp / dcBias).toFixed(2) : '∞';\n  let status = '✅ 正常包络 (m(t)恒正，可直接检波)';\n  if (dcBias === 0) status = '🔇 抑制载波 DSB-SC (包络频率翻倍且载波反相)';\n  else if (dcBias < modAmp) status = '⚠️ 过调制 (m(t)穿零反相，普通检波会失真)';\n  lab.setReadout(`调制深度 μ = ${modIndex} | 音频 ${modFreq} Hz | 监听载波 ${carrierFreq * 10} Hz | ${status}`);\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    phaseShift += dt * 0.15;\n    draw();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "2. 频域卷积与“幽灵的现身”——负频率如何变成真实边带",
      "paragraphs": [
        "傅里叶变换有一条黄金对称律：**在一个域里做卷积，等于在另一个域里做乘法。** 上一章我们用频谱相乘实现了时域卷积；而振幅调制恰好反过来——**时域相乘，对应频域卷积**。",
        "纯正弦载波在频域里只是一根孤零零的脉冲（移位后的 Delta 函数 $\\delta(f - f_c)$）。任何频谱与移位 Delta 函数做卷积，物理效果只有一个：**把整个频谱原封不动地搬移到载波频率 $f_c$ 的位置上**！",
        "于是，原书图 10-14(f) 揭示了一个极其迷人的物理真相——搬移后的已调信号频谱分裂成了三部分：\n1. **载波峰（Carrier）**：由原本在 `0 Hz` 的直流偏置搬移到 $f_c$ 形成；\n2. **上边带（Upper Sideband, USB）**：由原音频的**正频率**（`+0.3 ~ +3 kHz`）搬移到 $f_c + 0.3 \\sim f_c + 3\\text{ kHz}$ 形成；\n3. **下边带（Lower Sideband, LSB）**：由原音频的**负频率**（`-0.3 ~ -3 kHz`）搬移到 $f_c - 3 \\sim f_c - 0.3\\text{ kHz}$ 形成！",
        "平时在傅里叶分析里，**负频率**总是显得抽象又虚幻，像是数学公式凑出来的“幽灵”。但在无线电频谱仪上，下边带实实在在存在于 $f_c$ 左侧，用天线和滤波器就能真实捕获——正如作者所感叹的：**“幽灵现出了人形！”**",
        "通信工程师正是靠这种**频谱搬移**技术玩转**频分复用（Frequency Domain Multiplexing, FDM）**的。例如传统模拟电视信号，每路视频基带占用 `0 ~ 6 MHz` 带宽；通过乘以不同的载波，广播系统能把 82 个频道首尾相接地堆叠在空中（比如 3 频道占 `60~66 MHz`，4 频道占 `66~72 MHz`，83 频道占 `884~890 MHz`），互不干扰；电视机调台时，再把选中的那个频道搬移回 `0 ~ 6 MHz` 显示在屏幕上。"
      ],
      "formula": {
        "expr": "Y(f) = X(f) * [ 0.5·δ(f - f_c) + 0.5·δ(f + f_c) ] = 0.5·X(f - f_c) + 0.5·X(f + f_c)",
        "explain": "X(f) 是带负频率的基带音频频谱，* 表示频域卷积；与载波频谱卷积后，X(f) 被整体搬移到 +f_c（同时在 -f_c 也有对称镜像），原本在 0 Hz 左侧的负频率部分顺理成章变成了 f_c 左侧的下边带。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：频谱搬移实验室——观察负频率化为下边带与 FDM 频道串扰",
      "instruction": "拖动“载波频率 fc”观察虚线处的基带频谱（含左侧粉色负频率）如何整体平移到 fc 形成上下边带；开启“频分复用”开关，测试频道间距过近时发生的串台混叠。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "载波频率 fc",
          "min": 0,
          "max": 38,
          "step": 1,
          "value": 28,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "bw",
          "label": "基带信号最高频率 B",
          "min": 1.5,
          "max": 6,
          "step": 0.5,
          "value": 3,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "dcAmp",
          "label": "直流载波分量强度",
          "min": 0,
          "max": 1.5,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showFDM",
          "label": "开启频分复用 (对比 15 kHz 固定频道)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction drawSideband(xInner, xOuter, yBase, hInner, hOuter, fill, stroke, dashed) {\n  ctx.save();\n  if (dashed) ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(xInner, yBase);\n  ctx.lineTo(xInner, yBase - hInner);\n  ctx.lineTo(xOuter, yBase - hOuter);\n  ctx.lineTo(xOuter, yBase);\n  ctx.closePath();\n  ctx.fillStyle = fill;\n  ctx.fill();\n  ctx.strokeStyle = stroke;\n  ctx.lineWidth = dashed ? 1.4 : 2;\n  ctx.stroke();\n  ctx.restore();\n}\n\nfunction draw() {\n  const { fc, bw, dcAmp, showFDM } = lab.values;\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 36, padR = 20, padT = 36, padB = 34;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const yBase = padT + plotH;\n  const fMin = -8, fMax = 46;\n  const fx = (f) => padL + ((f - fMin) / (fMax - fMin)) * plotW;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let f = -5; f <= 45; f += 5) {\n    const x = fx(f);\n    ctx.beginPath();\n    ctx.strokeStyle = f === 0 ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.08)';\n    ctx.moveTo(x, padT - 8); ctx.lineTo(x, yBase);\n    ctx.stroke();\n    ctx.fillStyle = f === 0 ? '#f8fafc' : 'rgba(248,250,252,0.55)';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(f === 0 ? '0(DC)' : f + 'k', x, yBase + 15);\n  }\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.moveTo(padL, yBase); ctx.lineTo(padL + plotW, yBase);\n  ctx.stroke();\n\n  const hIn = plotH * 0.62;\n  const hOut = plotH * 0.50;\n  const hCarrier = plotH * (dcAmp * 0.58);\n  const gap = 0.3;\n\n  drawSideband(fx(-gap), fx(-bw), yBase, hIn * 0.85, hOut * 0.85, 'rgba(236,72,153,0.12)', 'rgba(236,72,153,0.65)', true);\n  drawSideband(fx(gap), fx(bw), yBase, hIn * 0.85, hOut * 0.85, 'rgba(56,189,248,0.12)', 'rgba(56,189,248,0.65)', true);\n  if (dcAmp > 0) {\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.55)';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(fx(0), yBase); ctx.lineTo(fx(0), yBase - hCarrier * 0.85); ctx.stroke();\n    ctx.restore();\n  }\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = 'rgba(236,72,153,0.85)';\n  ctx.textAlign = 'right';\n  ctx.fillText('负频率幽灵', fx(-0.6), yBase - hIn * 0.88 - 4);\n  ctx.fillStyle = 'rgba(56,189,248,0.85)';\n  ctx.textAlign = 'left';\n  ctx.fillText('正基带', fx(0.6), yBase - hIn * 0.88 - 4);\n\n  let fdmOverlap = false;\n  if (showFDM) {\n    const fc2 = 15;\n    const bw2 = 3.0;\n    drawSideband(fx(fc2 - gap), fx(fc2 - bw2), yBase, hIn * 0.9, hOut * 0.9, 'rgba(245,158,11,0.22)', '#f59e0b', false);\n    drawSideband(fx(fc2 + gap), fx(fc2 + bw2), yBase, hIn * 0.9, hOut * 0.9, 'rgba(245,158,11,0.22)', '#f59e0b', false);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(fx(fc2), yBase); ctx.lineTo(fx(fc2), yBase - plotH * 0.65); ctx.stroke();\n    ctx.fillStyle = '#f59e0b';\n    ctx.textAlign = 'center';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('固定电台2 (15k)', fx(fc2), yBase - plotH * 0.68);\n\n    const oMin = Math.max(fc - bw, fc2 - bw2);\n    const oMax = Math.min(fc + bw, fc2 + bw2);\n    if (oMin < oMax) {\n      fdmOverlap = true;\n      ctx.fillStyle = 'rgba(239,68,68,0.32)';\n      ctx.fillRect(fx(oMin), padT + 14, fx(oMax) - fx(oMin), plotH - 14);\n      ctx.fillStyle = '#f87171';\n      ctx.font = 'bold 12px sans-serif';\n      ctx.fillText('⚠️ 串台混叠!', fx((oMin + oMax) / 2), padT + 28);\n    }\n  }\n\n  if (fc > 0) {\n    drawSideband(fx(fc - gap), fx(fc - bw), yBase, hIn, hOut, 'rgba(236,72,153,0.32)', '#ec4899', false);\n    drawSideband(fx(fc + gap), fx(fc + bw), yBase, hIn, hOut, 'rgba(56,189,248,0.32)', '#38bdf8', false);\n    if (dcAmp > 0) {\n      ctx.strokeStyle = '#f8fafc';\n      ctx.lineWidth = 2.6;\n      ctx.beginPath(); ctx.moveTo(fx(fc), yBase); ctx.lineTo(fx(fc), yBase - hCarrier); ctx.stroke();\n      ctx.fillStyle = '#f8fafc';\n      ctx.beginPath(); ctx.arc(fx(fc), yBase - hCarrier, 3.5, 0, Math.PI * 2); ctx.fill();\n    }\n\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('下边带 LSB', fx(fc - bw * 0.65), yBase - hIn - 6);\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('上边带 USB', fx(fc + bw * 0.65), yBase - hIn - 6);\n    if (dcAmp > 0) {\n      ctx.fillStyle = '#f8fafc';\n      ctx.fillText('载波', fx(fc), yBase - hCarrier - 8);\n    }\n\n    if (fc >= 5) {\n      ctx.strokeStyle = 'rgba(16,185,129,0.75)';\n      ctx.lineWidth = 1.5;\n      const x0 = fx(0), x1 = fx(fc);\n      ctx.beginPath();\n      ctx.moveTo(x0, 18); ctx.quadraticCurveTo((x0 + x1) / 2, 4, x1, 18);\n      ctx.stroke();\n      ctx.beginPath();\n      ctx.moveTo(x1 - 7, 13); ctx.lineTo(x1, 18); ctx.lineTo(x1 - 5, 22);\n      ctx.stroke();\n      ctx.fillStyle = '#10b981';\n      ctx.fillText('频谱搬移 +' + fc + ' kHz', (x0 + x1) / 2, 14);\n    }\n  }\n\n  const lsbLow = (fc - bw).toFixed(1);\n  const lsbHigh = (fc - gap).toFixed(1);\n  const usbLow = (fc + gap).toFixed(1);\n  const usbHigh = (fc + bw).toFixed(1);\n  let msg = `下边带: [${lsbLow}, ${lsbHigh}] kHz | 载波: ${fc} kHz | 上边带: [${usbLow}, ${usbHigh}] kHz | 总带宽: ${(2 * bw).toFixed(1)} kHz`;\n  if (fc - bw < 0) msg += ' | ⚠️ 载波过低，下边带跨过0Hz发生自混叠!';\n  else if (fdmOverlap) msg += ' | ⚠️ 频道间距过窄，与15kHz电台发生串扰!';\n  lab.setReadout(msg);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "加直流偏置才好解调：如果直接把交流语音乘以载波（偏置为 0，即抑制载波调制 DSB-SC），虽然省电且没有载波浪费，但包络会在过零点反相并使包络频率翻倍，普通包络检波器会彻底失真，必须使用与发射端同频同相的“相干解调”。",
        "带宽直接翻倍：振幅调制会把原本只占 B 赫兹的基带信号变成上下两个对称边带，总占用带宽变为 2B。因为负频率在实信号调制中真实转化为下边带。",
        "频分复用 (FDM) 必须留护城河：多个电台或电视频道共用一根电缆或同一片天空时，相邻载波频率差必须大于两路信号的带宽之和（再额外留出滤波器过渡的保护带 Guard Band），否则边带交叉就会严重串台。",
        "线性加法做不到搬移：频谱搬移的数学本质是频域卷积，对应时域只能用乘法器或开关混频器等非线性器件，简单求和永远无法改变信号所处的频段。"
      ]
    }
  ]
});
