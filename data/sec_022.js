window.__BOOK_REGISTER_SECTION__("sec_022", {
  "title": "雷达测距与脉冲压缩的物理悖论 (Radar)",
  "intuition": "雷达靠发射无线电波并监听微弱回波来测距，而数字信号处理（DSP）用脉冲压缩与数字滤波，巧妙破解了『既要探测远（长脉冲高能量）、又要测得准（短脉冲高精度）』的物理死结。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 雷达的本质：用光速回声丈量天空",
      "paragraphs": [
        "**雷达（Radar）** 是 **RA**dio **D**etection **A**nd **R**anging（无线电探测与测距）的缩写。它就像在黑暗山谷里大喊一声并掐表听回音，只不过雷达喊出的不是声音，而是由无线电发射机产生的、持续时间仅几微秒（`μs`）的射频能量脉冲。",
        "这个脉冲被送入高度定向的天线，随后以 **光速**（`c ≈ 3 × 10^8 m/s`）向指定方向传播。如果飞行路径上刚好有一架飞机，机身会像镜子一样把极小一部分电磁波能量反射回来，被发射站附近的接收天线捕获。",
        "测定目标位置需要两个维度：**方向** 非常简单，回波到达时定向天线指着哪儿，目标就在哪儿；而 **距离** 则需要精确测量发射脉冲与接收回波之间的时间差 `Δt`。因为电波飞过去再飞回来走了两倍路程，所以最终距离必须除以 2。"
      ],
      "formula": {
        "expr": "R = (c · Δt) / 2",
        "explain": "R 为雷达与目标之间的距离（米）；c 为光速（约 3×10⁸ 米/秒）；Δt 为从发射脉冲到收到回波所经历的时间差（秒）。除以 2 是因为电波走了往返双程。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 鱼与熊掌不可兼得：远距探测 vs 精准测距",
      "paragraphs": [
        "一台雷达能看多远（最大作用距离），主要由两个物理参数决定：**发射脉冲里包含的总能量**，以及 **无线电接收机自身的噪声水平**。飞机反射回来的能量极其微弱，如果脉冲能量太小，回波就会彻底淹没在接收机的热噪声里，雷达直接变成『睁眼瞎』。",
        "按照直觉，要想探测更远的目标，只要加大初始脉冲的能量就行了。但受限于发射机硬件的峰值功率上限，**想要增加脉冲总能量，通常只能把脉冲时间拉长**（就像手电筒亮度不变时，想多照出光子就得按久一点）。",
        "问题恰恰出在这里：脉冲变长之后，整个回波在时间轴上被拉成了一个宽阔的『胖包』，你根本说不清回波究竟是哪一微秒到达的，**时间测量的准确度与精度会急剧恶化**；如果有两架靠得很近的飞机，宽脉冲回波还会直接糊成一团。这就引发了传统雷达最核心的矛盾：**测得远（要长脉冲）与测得准（要短脉冲）天生冲突**。"
      ],
      "formula": {
        "expr": "E = P_peak · τ  ,   ΔR = (c · τ) / 2",
        "explain": "E 为脉冲总能量，P_peak 为发射机峰值功率，τ 为脉冲持续宽度。τ 越大，能量 E 越高（探测越远），但距离分辨精度 ΔR 也变得越差（两个间距小于 ΔR 的目标无法分辨）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：亲手体验『脉宽悖论』——能量与精度的拉锯战",
      "instruction": "拖动「脉冲宽度」与「接收机噪声」滑块，开启双机编队测试，观察脉冲变窄时回波如何被噪声吞没，以及脉冲变宽时双目标如何糊成一团。",
      "controls": [
        {
          "type": "slider",
          "id": "pulseWidth",
          "label": "发射脉冲宽度 τ",
          "min": 4,
          "max": 60,
          "step": 1,
          "value": 24,
          "unit": " μs"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "接收机噪声强度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 30,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "twoTargets",
          "label": "开启双机编队测试 (检验距离分辨力)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction hashNoise(idx) {\n  const x = Math.sin(idx * 12.9898 + 78.233) * 43758.5453;\n  return (x - Math.floor(x)) * 2 - 1;\n}\n\nfunction drawScene(timeSec) {\n  const pw = lab.values.pulseWidth;\n  const noisePct = lab.values.noise;\n  const twoT = lab.values.twoTargets;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 40; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('物理空间电波往返模拟 (光速 c)', 16, 18);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.arc(46, 54, 18, -0.9, 0.9);\n  ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(46, 54); ctx.lineTo(66, 54); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('雷达站', 26, 86);\n\n  const t1X = 485;\n  const t2X = 550;\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.moveTo(t1X, 42); ctx.lineTo(t1X + 16, 48); ctx.lineTo(t1X + 16, 36); ctx.closePath(); ctx.fill();\n  ctx.fillText('目标 A', t1X - 10, 28);\n\n  if (twoT) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.moveTo(t2X, 62); ctx.lineTo(t2X + 16, 68); ctx.lineTo(t2X + 16, 56); ctx.closePath(); ctx.fill();\n    ctx.fillText('目标 B', t2X - 10, 84);\n  }\n\n  const cycle = 2.6;\n  const p = (timeSec % cycle) / cycle;\n  const packetW = Math.max(8, pw * 1.45);\n  if (p < 0.45) {\n    const u = p / 0.45;\n    const px = 66 + u * (t2X - 66);\n    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';\n    ctx.fillRect(px - packetW * 0.5, 38, packetW, 30);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.strokeRect(px - packetW * 0.5, 38, packetW, 30);\n  } else if (p < 0.9) {\n    const u = (p - 0.45) / 0.45;\n    const rx1 = t1X - u * (t1X - 66);\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';\n    ctx.fillRect(rx1 - packetW * 0.5, 36, packetW, 18);\n    if (twoT) {\n      const rx2 = t2X - u * (t2X - 66);\n      ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';\n      ctx.fillRect(rx2 - packetW * 0.5, 56, packetW, 18);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(0, 98); ctx.lineTo(W, 98); ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('接收机时域波形 (横轴对应往返时间 Δt / 目标距离)', 16, 116);\n\n  const baseY = 216;\n  const xStart = 35;\n  const xEnd = 690;\n  const c1 = 445;\n  const c2 = 510;\n  const sigma = pw * 0.78;\n  const amp = 14 + pw * 1.15;\n  const nAmp = (noisePct / 100) * 38;\n\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(c1, 122); ctx.lineTo(c1, baseY); ctx.stroke();\n  if (twoT) {\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';\n    ctx.beginPath(); ctx.moveTo(c2, 122); ctx.lineTo(c2, baseY); ctx.stroke();\n  }\n\n  const threshY = baseY - 36;\n  ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';\n  ctx.beginPath(); ctx.moveTo(xStart, threshY); ctx.lineTo(xEnd, threshY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('最小可检测门限', xStart + 4, threshY - 5);\n\n  const tick = Math.floor(timeSec * 14);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let x = xStart; x <= xEnd; x += 2) {\n    const d1 = (x - c1) / sigma;\n    let sig = amp * Math.exp(-0.5 * d1 * d1);\n    if (twoT) {\n      const d2 = (x - c2) / sigma;\n      sig += amp * 0.9 * Math.exp(-0.5 * d2 * d2);\n    }\n    const n = hashNoise(x * 3 + tick * 19) * nAmp;\n    const y = Math.min(baseY + 12, Math.max(115, baseY - Math.abs(sig + n)));\n    if (x === xStart) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  const snr = (amp / (nAmp + 5)).toFixed(1);\n  let resState = '单目标测距';\n  if (twoT) {\n    if (pw <= 18) resState = '双峰锐利，清晰分辨';\n    else if (pw <= 34) resState = '波峰开始混叠，精度下降';\n    else resState = '彻底糊成单峰，无法分辨双机';\n  } else {\n    resState = pw <= 18 ? '测距峰值锐利精准' : '峰值平缓，时间定位误差大';\n  }\n  const detectOk = amp > nAmp * 1.1 + 18 ? '回波高于门限 (可探测)' : '能量过弱，易被噪声淹没!';\n  lab.setReadout('脉宽 τ=' + pw + 'μs | 等效信噪比≈' + snr + ' | ' + detectOk + ' | ' + resState);\n}\n\nlab.onUpdate(() => drawScene(0));\nlab.onLoop((dt, t) => drawScene(t));"
    },
    {
      "type": "concept",
      "heading": "3. DSP 拯救雷达的三大绝招与百兆赫兹挑战",
      "paragraphs": [
        "数字信号处理（DSP）的引入，从根本上改写了雷达的物理游戏规则。围绕着『作用距离 vs 测距精度』这一核心矛盾，DSP 在三个关键领域引发了革命：",
        "**绝招一：脉冲压缩（Pulse Compression）**。发射时照样发射一个 **持续时间很长、内部频率连续变化（如线性调频 Chirp）** 的高能量脉冲，确保电波能打得足够远；等到微弱的回波被接收后，DSP 算法（本质上是匹配滤波）在数字域里把这段长脉冲的所有能量 **全部挤压折叠到一瞬间**。于是你同时拥有了长脉冲的超高能量，以及短脉冲的极致测距精度！",
        "**绝招二：数字降噪滤波（Noise Filtering）**。接收机传来的信号混杂着大量宽带背景噪声，DSP 可以通过精准的数字滤波器滤除目标信号频带之外的噪声。这相当于把『噪声海平面』压低，让原本看不见的超远程微弱回波重新浮出水面，在不牺牲任何测距精度的前提下大幅延长探测距离。",
        "**绝招三：波形快速生成与敏捷切换**。DSP 可以根据当前追踪目标的大小、速度和环境杂波特征，在极短时间内动态生成并切换不同形状、不同长度的发射脉冲，让每一发脉冲都为当前探测任务量身定制。",
        "**硬核代价：算力与高速硬件的极限考验**。最令人震撼的是，上述所有复杂的压缩、滤波与波形生成，必须在 **高达数百兆赫兹（MHz）的采样率** 下实时完成（与雷达使用的射频频率处于同一量级）！因此，在雷达工程中，DSP 既是一场数学算法革命，更是一场高速 ADC、FPGA 与硬件架构设计的巅峰较量。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "实验二：DSP 魔法现场——脉冲压缩与降噪滤波（支持实时听觉对比）",
      "instruction": "把噪声拉高到 60% 以上，分别开启「数字降噪滤波」与「脉冲压缩」，不仅能亲眼看到长脉冲瞬间压缩成刺破噪声的尖峰，点击播放还能用耳朵直接听出区别！",
      "controls": [
        {
          "type": "slider",
          "id": "noiseLevel",
          "label": "接收机背景噪声",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 55,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "useFilter",
          "label": "开启 DSP 降噪滤波",
          "value": false
        },
        {
          "type": "toggle",
          "id": "useCompress",
          "label": "开启 DSP 脉冲压缩",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放雷达回波声学模拟",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet masterGain = null;\nlet noiseBuf = null;\nlet nextPing = 0;\n\nfunction hashN(i) {\n  const x = Math.sin(i * 91.3458 + 17.13) * 47453.5453;\n  return (x - Math.floor(x)) * 2 - 1;\n}\n\nfunction ensureAudio() {\n  const ac = lab.getAudioContext();\n  if (!ac) return null;\n  if (ac.state === 'suspended') ac.resume();\n  if (!masterGain) {\n    masterGain = ac.createGain();\n    masterGain.gain.value = 0;\n    masterGain.connect(ac.destination);\n  }\n  if (!noiseBuf) {\n    const len = ac.sampleRate;\n    noiseBuf = ac.createBuffer(1, len, ac.sampleRate);\n    const ch = noiseBuf.getChannelData(0);\n    for (let i = 0; i < len; i++) ch[i] = Math.random() * 2 - 1;\n  }\n  return ac;\n}\n\nfunction schedulePing(ac) {\n  const now = ac.currentTime;\n  const nLvl = lab.values.noiseLevel / 100;\n  const flt = lab.values.useFilter;\n  const cmp = lab.values.useCompress;\n\n  const nSrc = ac.createBufferSource();\n  nSrc.buffer = noiseBuf;\n  nSrc.loop = true;\n  const nGain = ac.createGain();\n  const nScale = flt ? 0.22 : 1.0;\n  nGain.gain.setValueAtTime(nLvl * 0.28 * nScale, now);\n  nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);\n\n  if (flt) {\n    const bp = ac.createBiquadFilter();\n    bp.type = 'bandpass';\n    bp.frequency.value = 950;\n    bp.Q.value = 3.5;\n    nSrc.connect(bp);\n    bp.connect(nGain);\n  } else {\n    nSrc.connect(nGain);\n  }\n  nGain.connect(masterGain);\n  nSrc.start(now);\n  nSrc.stop(now + 0.76);\n\n  const osc = ac.createOscillator();\n  const sGain = ac.createGain();\n  if (!cmp) {\n    osc.type = 'sine';\n    osc.frequency.setValueAtTime(340, now + 0.08);\n    osc.frequency.linearRampToValueAtTime(1450, now + 0.56);\n    sGain.gain.setValueAtTime(0.001, now + 0.08);\n    sGain.gain.linearRampToValueAtTime(0.24, now + 0.16);\n    sGain.gain.linearRampToValueAtTime(0.24, now + 0.48);\n    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);\n    osc.connect(sGain);\n    sGain.connect(masterGain);\n    osc.start(now + 0.08);\n    osc.stop(now + 0.6);\n  } else {\n    osc.type = 'triangle';\n    osc.frequency.setValueAtTime(1050, now + 0.30);\n    sGain.gain.setValueAtTime(0.001, now + 0.30);\n    sGain.gain.linearRampToValueAtTime(0.62, now + 0.306);\n    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);\n    osc.connect(sGain);\n    sGain.connect(masterGain);\n    osc.start(now + 0.30);\n    osc.stop(now + 0.37);\n  }\n}\n\nfunction drawFrame(timeSec) {\n  const nLvl = lab.values.noiseLevel / 100;\n  const flt = lab.values.useFilter;\n  const cmp = lab.values.useCompress;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 40; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  const x0 = 30;\n  const x1 = 695;\n  const center = 370;\n  const halfW = 120;\n  const tick = Math.floor(timeSec * 15);\n\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(center, 14); ctx.lineTo(center, H - 10); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('真实目标位置', center + 6, 20);\n\n  const topY = 62;\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('接收机原始输入 (宽长调频 Chirp 脉冲 + 背景噪声)', 16, 20);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let x = x0; x <= x1; x += 2) {\n    const dx = x - center;\n    let sig = 0;\n    if (Math.abs(dx) < halfW) {\n      const env = 0.5 * (1 + Math.cos(Math.PI * dx / halfW));\n      sig = 24 * env * Math.sin(0.14 * dx + 0.0042 * dx * dx);\n    }\n    const nz = hashN(x * 5 + tick * 23) * nLvl * 30;\n    const y = topY - (sig + nz);\n    if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(0, 114); ctx.lineTo(W, 114); ctx.stroke();\n\n  const botY = 178;\n  ctx.fillStyle = '#10b981';\n  const modeLabel = (flt ? '滤波降噪 ON' : '滤波 OFF') + ' + ' + (cmp ? '脉冲压缩 ON' : '脉冲压缩 OFF');\n  ctx.fillText('DSP 处理后输出 (' + modeLabel + ')', 16, 132);\n\n  const noiseFactor = flt ? 0.18 : 1.0;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let x = x0; x <= x1; x += 2) {\n    const dx = x - center;\n    let sig = 0;\n    if (!cmp) {\n      if (Math.abs(dx) < halfW) {\n        const env = 0.5 * (1 + Math.cos(Math.PI * dx / halfW));\n        sig = 24 * env * Math.sin(0.14 * dx + 0.0042 * dx * dx);\n      }\n    } else {\n      const u = dx / 5.2;\n      const sinc = Math.abs(u) < 0.001 ? 1 : Math.sin(u) / u;\n      sig = 54 * sinc * Math.cos(0.38 * dx);\n    }\n    const nz = hashN(x * 7 + tick * 31) * nLvl * 30 * noiseFactor;\n    const y = Math.min(234, Math.max(120, botY - (sig + nz)));\n    if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  const rawSnr = 24 / (nLvl * 30 + 2);\n  const gain = (cmp ? 2.25 : 1) * (flt ? 5.5 : 1);\n  const outSnr = (rawSnr * gain).toFixed(1);\n  const widthText = cmp ? '极窄尖峰 (高精度)' : '宽包络 (时间模糊)';\n  lab.setReadout('输入噪声=' + Math.round(nLvl * 100) + '% | 输出等效信噪比≈' + outSnr + ' | 脉冲形态: ' + widthText);\n}\n\nlab.onUpdate(() => {\n  if (!lab.values.play && masterGain) {\n    const ac = lab.getAudioContext();\n    if (ac) masterGain.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n    nextPing = 0;\n  }\n  drawFrame(0);\n});\n\nlab.onLoop((dt, t) => {\n  drawFrame(t);\n  if (lab.values.play) {\n    const ac = ensureAudio();\n    if (ac) {\n      masterGain.gain.setTargetAtTime(0.45, ac.currentTime, 0.02);\n      if (ac.currentTime >= nextPing) {\n        nextPing = ac.currentTime + 1.15;\n        schedulePing(ac);\n      }\n    }\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "测距公式别忘除以 2：无线电波走的是『雷达→目标→雷达』往返双程，工程写代码计算 R = c * Δt / 2 时最容易漏掉系数 2 导致测距翻倍。",
        "不要用肉眼直觉去硬刚脉冲宽度：物理上并非只能靠缩短发射脉宽来提高测距精度，通过『发射宽调频脉冲（Chirp）+ 接收端 DSP 脉冲压缩』可以兼顾超远射程与厘米/米级精度。",
        "算法再强也怕前端采样率掉链子：雷达信号处于射频/中频段，DSP 处理需要高达数百 MHz 的采样率与极低延迟的硬件流水线，写雷达 DSP 不能只看公式，必须同步评估 ADC 带宽与 FPGA/DSP 芯片吞吐量。"
      ]
    }
  ]
});
