window.__BOOK_REGISTER_SECTION__("sec_041", {
  "title": "如何选择抗混叠滤波器 (Selecting The Antialias Filter)",
  "intuition": "抗混叠滤波器的选型不靠盲目追求陡峭滚降，而取决于你的信号是用「频域正弦波」还是「时域波形形状」来编码信息。",
  "blocks": [
    {
      "type": "concept",
      "heading": "三大经典滤波器的宿命权衡：滚降、平坦度与阶跃响应",
      "paragraphs": [
        "在模数转换器（ADC）前端放置低通滤波器，目的是阻止高于奈奎斯特频率 `f_s / 2` 的信号发生混叠。然而物理世界没有免费的午餐，书中 **表 3-2** 总结了三种经典模拟滤波器各自牺牲其他指标、换取单项极致的性能取向：",
        "1. **切比雪夫滤波器 (Chebyshev)**：优化 **滚降陡峭度 (Roll-off)**。例如 8 极点切比雪夫仅需到达截止频率的 `1.34` 倍即可实现 100 倍衰减，代价是通带内存在 `6%` 的波纹，且阶跃响应过冲高达 `23.0%`、振铃稳定时间极长。",
        "2. **巴特沃斯滤波器 (Butterworth)**：优化 **通带平坦度 (Passband Flatness)**。通带波纹为 `0%`，滚降比切比雪夫缓一些（8 极点需 `1.78` 倍截止频率达到 100 倍衰减），阶跃过冲居中（`4.3% ~ 16.4%`）。",
        "3. **贝塞尔滤波器 (Bessel)**：优化 **阶跃响应 (Step Response)**。通带完全平坦（`0%` 波纹），阶跃过冲被压低到惊人的 `0.4% ~ 0.9%`，几乎没有振铃且上升/下降沿完全对称（即 **线性相位**），但代价是频域滚降最缓慢（4 极点需 `4.74` 倍截止频率才衰减 100 倍）。"
      ],
      "formula": {
        "expr": "f_alias = | f_in - k · f_s |  (当 f_in > f_s / 2 时发生混叠)",
        "explain": "f_in 是输入信号中的高频分量，f_s 是采样率，k 是使结果落入 [0, f_s/2] 的整数；任何未被抗混叠滤波器拦截的 f_in 都会伪装成低频假信号 f_alias 混入数字域。"
      }
    },
    {
      "type": "concept",
      "heading": "选型的第一性原理：频域编码 vs. 时域编码",
      "paragraphs": [
        "既然没有十全十美的滤波器，选型几乎完全取决于一个问题：**你的信息是如何编码在模拟波形里的？** 工程上绝大多数信号属于以下两种编码方式之一：",
        "**频域编码 (Frequency Domain Encoding)**：信息藏在组成信号的各个正弦波的 **频率与幅度** 中，典型代表是 **音频信号（语音、音乐）**。人耳听声音取决于有哪些频率成分，而不在乎波形长什么样。即使电路把各谐波的 **相位** 搅乱、让示波器上的波形面目全非，人耳听起来依然完全一样！但混叠会直接把高频分量错位折叠到低频区，彻底摧毁频域信息。因此，频域编码信号必须使用滚降极陡的 **切比雪夫、椭圆或巴特沃斯滤波器**，至于它们糟糕的阶跃过冲与相位失真？根本不用在乎！",
        "**时域编码 (Time Domain Encoding)**：信息直接保存在 **波形的几何形状** 里。例如心电图（EKG）通过波形凹凸起伏判断心室何时收缩，图像（如《蒙娜丽莎》）通过空间亮度和颜色的边缘轮廓传递信息——你绝不会看着《蒙娜丽莎》感叹「多美妙的一组正弦波啊」。对于这类信号，陡峭滤波器的相位失真与振铃会彻底毁掉波形原貌。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：频域编码听感与相位/混叠对比实验（支持实时发声）",
      "instruction": "点击「播放测试音」，拖动「非线性相移」滑块观察左侧波形剧烈变形但声音毫无变化；再打开「注入超奈奎斯特高频噪声」并切换「切比雪夫抗混叠滤波」，听出混叠产生的刺耳假频率。",
      "controls": [
        {
          "type": "slider",
          "id": "phaseShift",
          "label": "模拟非线性相移 (不改频谱)",
          "min": 0,
          "max": 180,
          "step": 5,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "highFreqNoise",
          "label": "注入 1650 Hz 高频噪声 (f_s=2000 Hz)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "antialias",
          "label": "开启陡峭抗混叠滤波 (截止 1000 Hz)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioState = null;\n\nfunction stopAudio() {\n  if (audioState) {\n    try {\n      audioState.masterGain.gain.setTargetAtTime(0, audioState.ctx.currentTime, 0.02);\n      setTimeout(() => {\n        if (audioState && !lab.values.play) {\n          try { audioState.oscMain.stop(); audioState.oscAlias.stop(); } catch (e) {}\n          audioState = null;\n        }\n      }, 60);\n    } catch (e) {\n      audioState = null;\n    }\n  }\n}\n\nfunction buildPeriodicWave(ctx, phaseDeg) {\n  const rad = phaseDeg * Math.PI / 180;\n  const real = new Float32Array(8);\n  const imag = new Float32Array(8);\n  const amps = { 1: 0.65, 3: 0.30, 5: 0.16 };\n  const phaseMult = { 1: 0, 3: 1.0, 5: 2.3 };\n  for (const k of [1, 3, 5]) {\n    const phi = phaseMult[k] * rad;\n    real[k] = amps[k] * Math.sin(phi);\n    imag[k] = amps[k] * Math.cos(phi);\n  }\n  return ctx.createPeriodicWave(real, imag, { disableNormalization: false });\n}\n\nfunction syncAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  try {\n    const ctx = lab.getAudioContext();\n    if (ctx.state === 'suspended') ctx.resume();\n    if (!audioState) {\n      const masterGain = ctx.createGain();\n      masterGain.gain.value = 0.22;\n      masterGain.connect(ctx.destination);\n\n      const oscMain = ctx.createOscillator();\n      oscMain.frequency.value = 220;\n      oscMain.connect(masterGain);\n      oscMain.start();\n\n      const aliasGain = ctx.createGain();\n      aliasGain.gain.value = 0;\n      aliasGain.connect(masterGain);\n\n      const oscAlias = ctx.createOscillator();\n      oscAlias.type = 'sine';\n      oscAlias.frequency.value = 350;\n      oscAlias.connect(aliasGain);\n      oscAlias.start();\n\n      audioState = { ctx, masterGain, oscMain, oscAlias, aliasGain };\n    }\n    const wave = buildPeriodicWave(audioState.ctx, lab.values.phaseShift);\n    audioState.oscMain.setPeriodicWave(wave);\n    const hasAlias = lab.values.highFreqNoise && !lab.values.antialias;\n    audioState.aliasGain.gain.setTargetAtTime(hasAlias ? 0.32 : 0.0, audioState.ctx.currentTime, 0.02);\n  } catch (e) {}\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const phaseRad = lab.values.phaseShift * Math.PI / 180;\n  const hasNoise = lab.values.highFreqNoise;\n  const filtered = lab.values.antialias;\n  const hasAlias = hasNoise && !filtered;\n\n  // Left box: Waveform (x: 16..420, y: 24..216)\n  const wx = 16, wy = 24, ww = 404, wh = 192;\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';\n  ctx.fillRect(wx, wy, ww, wh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = wy + (wh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(wx, yy); ctx.lineTo(wx + ww, yy); ctx.stroke();\n  }\n  for (let i = 0; i <= 8; i++) {\n    const xx = wx + (ww * i) / 8;\n    ctx.beginPath(); ctx.moveTo(xx, wy); ctx.lineTo(xx, wy + wh); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('示波器时域波形 (基频 220 Hz + 3/5次谐波)', wx + 8, wy + 16);\n\n  const cy = wy + wh / 2 + 6;\n  const ampScale = wh * 0.33;\n  const totalT = 2 / 220;\n\n  // Clean phase-shifted waveform\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  for (let px = 0; px <= ww; px++) {\n    const t = (px / ww) * totalT;\n    const w0 = 2 * Math.PI * 220 * t;\n    let y = 0.65 * Math.cos(w0 - Math.PI / 2) +\n            0.30 * Math.cos(3 * w0 - Math.PI / 2 + 1.0 * phaseRad) +\n            0.16 * Math.cos(5 * w0 - Math.PI / 2 + 2.3 * phaseRad);\n    const py = cy - y * ampScale;\n    if (px === 0) ctx.moveTo(wx + px, py); else ctx.lineTo(wx + px, py);\n  }\n  ctx.stroke();\n\n  // If aliased, overlay distorted waveform in pink\n  if (hasAlias) {\n    ctx.beginPath();\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.0;\n    for (let px = 0; px <= ww; px++) {\n      const t = (px / ww) * totalT;\n      const w0 = 2 * Math.PI * 220 * t;\n      let y = 0.65 * Math.cos(w0 - Math.PI / 2) +\n              0.30 * Math.cos(3 * w0 - Math.PI / 2 + 1.0 * phaseRad) +\n              0.16 * Math.cos(5 * w0 - Math.PI / 2 + 2.3 * phaseRad) +\n              0.32 * Math.sin(2 * Math.PI * 350 * t);\n      const py = cy - y * ampScale;\n      if (px === 0) ctx.moveTo(wx + px, py); else ctx.lineTo(wx + px, py);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('叠加 350 Hz 混叠假信号!', wx + ww - 148, wy + 16);\n  }\n\n  // Right box: Spectrum (x: 436..704, y: 24..216)\n  const sx = 436, sy = 24, sw = 268, sh = 192;\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';\n  ctx.fillRect(sx, sy, sw, sh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(sx, sy, sw, sh);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('频谱 (f_s = 2000 Hz)', sx + 8, sy + 16);\n\n  const maxF = 2000;\n  const nyqX = sx + (1000 / maxF) * (sw - 24) + 12;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(nyqX, sy + 24); ctx.lineTo(nyqX, sy + sh - 22); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('f_s/2 = 1000Hz', nyqX - 36, sy + 36);\n\n  const baseY = sy + sh - 24;\n  const maxBarH = sh - 66;\n  const bars = [\n    { f: 220, a: 0.65, c: '#10b981', label: '220' },\n    { f: 660, a: 0.30, c: '#10b981', label: '660' },\n    { f: 1100, a: filtered ? 0.02 : 0.16, c: filtered ? '#475569' : '#38bdf8', label: '1100' }\n  ];\n  if (hasNoise) {\n    bars.push({ f: 1650, a: filtered ? 0.03 : 0.32, c: filtered ? '#475569' : '#f59e0b', label: '1650' });\n  }\n  if (hasAlias) {\n    bars.push({ f: 350, a: 0.32, c: '#ec4899', label: '350混叠' });\n  }\n\n  for (const b of bars) {\n    const bx = sx + 12 + (b.f / maxF) * (sw - 24);\n    const bh = b.a * maxBarH;\n    ctx.fillStyle = b.c;\n    ctx.fillRect(bx - 5, baseY - bh, 10, bh);\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(b.label, bx - 10, baseY + 13);\n  }\n\n  let status = `相移: ${lab.values.phaseShift}° (波形已变，但谐波幅度谱不变，人耳听感一致)`;\n  if (hasAlias) status = `警告：1650 Hz 噪声未滤除，混叠为 350 Hz 假音调！| ` + status;\n  else if (hasNoise && filtered) status = `成功：抗混叠滤波已拦截 1650 Hz 噪声，零混叠！| ` + status;\n  lab.setReadout(status);\n}\n\nlab.onUpdate(() => {\n  draw();\n  syncAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "时域编码的数字化困境：三种抗混叠方案的正面交锋",
      "paragraphs": [
        "为什么采样定理在 **时域编码信号** 上帮不上太大忙？因为矩形脉冲或陡峭边缘在数学上天然包含高于 `f_s / 2` 的无穷高频分量。无论你怎么选滤波器，**没有任何方案能从采样数据中完美重建原始模拟脉冲**。这些超限高频来自两个源头：（1）你想消除的宽带噪声与干扰；（2）你想保留的信号陡峭边缘信息。书中的 **图 3-15** 对比了三种选择：",
        "1. **切比雪夫滤波器（千万别用！）**：它暴力砍掉所有高频，虽然滤波后的信号能被完美重建，但那重建的是「已被严重振铃扭曲的信号」，而非原信号——**「治病比病本身更可怕！别这么做！(The cure is worse than the disease! Don't do it!)」**",
        "2. **贝塞尔滤波器（最佳推荐）**：它温柔地圆滑边缘且无过冲，并通过截止频率在「边缘平滑度」与「抗高频噪声」之间做精细权衡。**通用工程经验法则是将贝塞尔滤波器的截止频率设为采样率的约四分之一（`f_c ≈ f_s / 4`）**，这样每个上升/下降沿上大约会落入 **2 个采样点**，同时彻底滤除了高频干扰。",
        "3. **完全不使用滤波器**：优点是每个采样点绝对忠实于原始瞬时值，边缘跳变在下一个采样点立刻显现，具有极限的边沿锐度。但它有两个隐患：第一，高频噪声会直接混叠成数字域的无意义杂波（作者指出消除噪声本质上是上游模拟电路的职责，而非 ADC 本身的责任）；第二，当边缘发生在 **两个采样点之间** 时，数字样本里完全丢失了这段亚采样时间的位置信息。相比之下，使用贝塞尔滤波器后，把边沿上的采样点用直线连起来，观察连线穿过半高处的时间点，就能高精度反推出 **亚采样边缘位置 (Subsample Estimate)**！"
      ],
      "formula": {
        "expr": "f_c ≈ f_s / 4",
        "explain": "时域信号贝塞尔抗混叠滤波器的黄金经验公式：f_c 为滤波器截止频率，f_s 为 ADC 采样率；该配置下每个阶跃边缘约包含 2 个采样点，既抑制高频噪声，又支持直线插值提取亚采样边缘时间。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：时域脉冲采样与「亚采样边缘位置」反演实验",
      "instruction": "拖动「真实边缘亚采样偏移」滑块，对比「0: 无滤波器」与「1: 贝塞尔 (fc=fs/4)」。观察无滤波时采样点连线测出的边缘位置完全卡死在 4.50 T，而贝塞尔滤波能精准还原亚采样偏移；再切换到「2: 切比雪夫」体验振铃灾难。",
      "controls": [
        {
          "type": "slider",
          "id": "filterMode",
          "label": "抗混叠方案 (0:无滤波 1:贝塞尔 2:切比雪夫)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "edgeOffset",
          "label": "真实边缘亚采样偏移 (采样周期 T)",
          "min": 0.1,
          "max": 0.9,
          "step": 0.05,
          "value": 0.25,
          "unit": " T"
        },
        {
          "type": "toggle",
          "id": "addNoise",
          "label": "叠加高频突发干扰",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showSubsample",
          "label": "显示样本连线与 50% 亚采样估计",
          "value": true
        }
      ],
      "jsCode": "function stepNone(tau) {\n  return tau >= 0 ? 1 : 0;\n}\n\nfunction stepBessel(tau) {\n  const d = 1.35;\n  return 0.5 * (1 + Math.tanh((tau - d) / 0.62));\n}\n\nfunction stepCheb(tau) {\n  if (tau <= 0) return 0;\n  const zeta = 0.47;\n  const wn = 2.55;\n  const wd = wn * Math.sqrt(1 - zeta * zeta);\n  return 1 - Math.exp(-zeta * wn * tau) * (Math.cos(wd * tau) + (zeta * wn / wd) * Math.sin(wd * tau));\n}\n\nfunction evalSignal(t, mode, edgeOffset, addNoise) {\n  const tRise = 4.0 + edgeOffset;\n  const tFall = 11.0 + edgeOffset;\n  let s = 0;\n  if (mode === 0) s = stepNone(t - tRise) - stepNone(t - tFall);\n  else if (mode === 1) s = stepBessel(t - tRise) - stepBessel(t - tFall);\n  else s = stepCheb(t - tRise) - stepCheb(t - tFall);\n\n  if (addNoise && t >= 1.2 && t <= 3.1) {\n    const env = Math.sin(Math.PI * (t - 1.2) / 1.9);\n    const atten = mode === 0 ? 0.30 : 0.008;\n    s += atten * env * Math.sin(2 * Math.PI * 2.35 * t);\n  }\n  return s;\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const mode = lab.values.filterMode;\n  const edgeOffset = lab.values.edgeOffset;\n  const addNoise = lab.values.addNoise;\n  const showSub = lab.values.showSubsample;\n\n  const padL = 44, padR = 20, padT = 26, padB = 34;\n  const pw = W - padL - padR;\n  const ph = H - padT - padB;\n  const maxT = 16;\n  const yMin = -0.35, yMax = 1.35;\n\n  const toX = (t) => padL + (t / maxT) * pw;\n  const toY = (v) => padT + ((yMax - v) / (yMax - yMin)) * ph;\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let v of [0, 0.5, 1.0]) {\n    const yy = toY(v);\n    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + pw, yy); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(v.toFixed(1), 10, yy + 4);\n  }\n  for (let n = 0; n <= maxT; n++) {\n    const xx = toX(n);\n    ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + ph); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(n + '', xx - 4, padT + ph + 16);\n  }\n\n  // Original analog pulse (dashed white)\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let px = 0; px <= pw; px++) {\n    const t = (px / pw) * maxT;\n    const val = evalSignal(t, 0, edgeOffset, addNoise);\n    const x = padL + px, y = toY(val);\n    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  // Filtered analog signal\n  const modeColors = ['#f59e0b', '#10b981', '#ec4899'];\n  const modeNames = ['无滤波器 (直接采样)', '4阶贝塞尔 (fc = fs/4)', '4阶切比雪夫 (振铃失真)'];\n  ctx.beginPath();\n  ctx.strokeStyle = modeColors[mode];\n  ctx.lineWidth = 2;\n  for (let px = 0; px <= pw; px++) {\n    const t = (px / pw) * maxT;\n    const val = evalSignal(t, mode, edgeOffset, addNoise);\n    const x = padL + px, y = toY(val);\n    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Discrete samples\n  const samples = [];\n  for (let n = 0; n <= maxT; n++) {\n    samples.push({ t: n, v: evalSignal(n, mode, edgeOffset, addNoise) });\n  }\n\n  // Linear interpolation lines\n  if (showSub) {\n    ctx.beginPath();\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    samples.forEach((s, idx) => {\n      const x = toX(s.t), y = toY(s.v);\n      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    });\n    ctx.stroke();\n  }\n\n  // Draw sample dots\n  for (const s of samples) {\n    ctx.beginPath();\n    ctx.arc(toX(s.t), toY(s.v), 4, 0, Math.PI * 2);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fill();\n    ctx.strokeStyle = '#0f172a';\n    ctx.lineWidth = 1.2;\n    ctx.stroke();\n  }\n\n  // Find 0.5 crossing on rising edge (between n=3 and n=8)\n  let estCross = null;\n  for (let n = 3; n < 8; n++) {\n    const s0 = samples[n], s1 = samples[n + 1];\n    if (s0.v < 0.5 && s1.v >= 0.5) {\n      const frac = (0.5 - s0.v) / (s1.v - s0.v);\n      estCross = s0.t + frac;\n      break;\n    }\n  }\n\n  const groupDelay = mode === 1 ? 1.35 : (mode === 2 ? 0.62 : 0.0);\n  let estOffsetStr = 'N/A';\n  let errStr = '';\n  if (estCross !== null) {\n    if (showSub) {\n      ctx.beginPath();\n      ctx.arc(toX(estCross), toY(0.5), 6, 0, Math.PI * 2);\n      ctx.fillStyle = '#38bdf8';\n      ctx.fill();\n      ctx.strokeStyle = '#f8fafc';\n      ctx.stroke();\n    }\n    const estRise = estCross - groupDelay;\n    const estOffset = estRise - 4.0;\n    estOffsetStr = estOffset.toFixed(2) + ' T';\n    const err = Math.abs(estOffset - edgeOffset);\n    errStr = ` (误差 ${err.toFixed(2)} T)`;\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(`当前方案: ${modeNames[mode]}`, padL + 6, 16);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.fillText('虚线=原始含噪脉冲  白点=ADC采样值  蓝线=样本直线插值', padL + 260, 16);\n\n  let note = '';\n  if (mode === 0) note = '无滤波导致高频噪声混叠，且 0.5 过零点卡死在 4.50 T，亚采样位置信息完全丢失！';\n  else if (mode === 1) note = '贝塞尔平滑去噪，线性插值精准反演亚采样边缘位置！';\n  else note = '切比雪夫虽去除了噪声，但产生约 18% 剧烈过冲与振铃，波形严重失真！';\n\n  lab.setReadout(`真实边缘偏移: ${edgeOffset.toFixed(2)} T | 线性插值反演偏移(扣群延迟): ${estOffsetStr}${errStr} | ${note}`);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【先问编码方式，再挑滤波器】：音频、通信等「频域编码」信号选切比雪夫/巴特沃斯（保频谱防混叠，无视相位与过冲）；心电图、视频、脉冲雷达等「时域编码」信号必须选贝塞尔滤波器（保波形对称与无过冲）。",
        "【切比雪夫+时域信号=工程灾难】：永远不要在关注波形形状或边缘过冲的系统里使用切比雪夫抗混叠滤波器，它的剧烈振铃会彻底毁掉时域特征。",
        "【贝塞尔黄金参数 `f_c ≈ f_s / 4`】：将贝塞尔滤波器截止频率设为采样率的四分之一，既能滤除高频干扰，又能在上升沿保留约 2 个样本，从而通过线性插值实现远超采样周期精度的「亚采样边缘定位」。",
        "【慎用「无抗混叠滤波器」方案】：虽然直接采样能保留极限的单样本锐度，但它会放任高频噪声混叠并彻底丢失两个采样点之间的亚采样时间信息。"
      ]
    }
  ]
});
