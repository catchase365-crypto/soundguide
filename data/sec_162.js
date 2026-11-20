window.__BOOK_REGISTER_SECTION__("sec_162", {
  "title": "音色、相位盲区与对数听觉 (Timbre)",
  "intuition": "人耳几乎不关心声波在时域里长什么样——只要各次谐波的频率与幅度不变，哪怕波形被相位拧成完全不同的形状，听起来也一模一样；而且我们对频率的感知遵循“倍频翻倍”的对数尺，而非线性尺。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、声音感知的三要素与谐波决定音色",
      "paragraphs": [
        "人类对连续声音（例如乐器奏出的一个音符）的感知，通常可以拆解为三个核心维度：**响度 (Loudness)**、**音高 (Pitch)** 和 **音色 (Timbre，发音同 \"timber\")**。其中，响度对应声波的物理强度；音高对应声音中**基频 (Fundamental)** 的频率，也就是波形自身不断重复的周期频率。这两者与物理量之间都有非常直接的对应关系。",
        "而**音色**则复杂得多，它由信号的**谐波成分 (Harmonic Content)** 决定。以小提琴为例：琴弓上涂有粘性的松香，拉弦时琴弦会反复经历“粘住琴弓—被拉弯—弹回挣脱”的循环，在示波器上呈现出一个典型的**锯齿波 (Sawtooth Waveform)**。",
        "如果小提琴拉出中央 C 下方的 A 音，人耳听到的其实不只是 `220 Hz` 的基频，还同时包含 `440 Hz`、`660 Hz`、`880 Hz` 等一系列整数倍的**谐波**。如果换用长笛或钢琴演奏同一个 A 音，它们的基频同样是 `220 Hz`（因此**音高相同**），但各次谐波的相对幅度比例不同，于是听起来具有截然不同的**音色**。",
        "人耳天生极其习惯“基频 + 整数倍谐波”的组合。实验表明，将 `1 kHz` 与 `3 kHz` 的正弦波叠加，听起来非常自然悦耳；但如果把后者微调成非整数倍的 `3.1 kHz`，两者的组合立刻会变得尖锐刺耳、令人不适。"
      ],
      "formula": {
        "expr": "x(t) = A_1 sin(2π f_0 t) + A_2 sin(2π·2f_0 t + φ_2) + A_3 sin(2π·3f_0 t + φ_3) + ...",
        "explain": "f_0 是决定音高的基频；n·f_0 (n=2,3,...) 是整数倍谐波；各次谐波的幅度组合 {A_1, A_2, A_3, ...} 决定了音色；而相位 {φ_2, φ_3, ...} 虽然会剧烈改变时域波形形状，人耳却几乎毫无察觉。"
      }
    },
    {
      "type": "concept",
      "heading": "二、人耳的“相位盲区”：波形变了，声音却一模一样",
      "paragraphs": [
        "把一个幅度为 `1` 的 `1 kHz` 正弦波，与一个幅度为 `0.5` 的 `3 kHz` 正弦波相加，可以得到一个双峰圆润的波形；如果将 `3 kHz` 分量反相（即**相移 180°**，变成相减），合成出的时域波形就会变成尖锐单峰的完全另一种形状。然而，这两个波形在人耳听来**没有任何区别**。",
        "为什么人耳进化出了对相位的“迟钝性”？从声学物理来看，当你在房间里听人说话时，声音会经过墙壁、天花板和地板的多次反射，不同频率的衰减和路径延时各不相同。只要你稍微移动位置，各频率到达耳朵的**相对相位就会被彻底随机化**。正是因为人耳自动忽略了这些毫无实用信息的相位抖动，你走动时才不会觉得对方的声音忽变。",
        "这就导致了一个非常反直觉的**单向映射规律**：教科书常说“音色由波形形状决定”，这其实有点误导人。准确的说法是：**一个特定的时域波形，唯一对应一种音色；但一种特定的音色，却对应着无穷多种不同的时域波形**（只需随意拨动各次谐波的相位即可）。在音频系统设计中，工程师通常无需保留时域波形的原始外观。",
        "当然，人耳也并非对相位“完全失聪”。如果相位变化剧烈到足以重排信号在时间轴上的先后顺序——例如本书第 11 章提到的**啁啾系统 (Chirp System)**，通过纯相位变换把一个瞬间脉冲拉长成持续很久的扫描音——人耳就能靠**持续时间**的差异把它们分辨出来，但这在日常听音环境中极少发生。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 1：相位盲区与谐波协和度实验室",
      "instruction": "点击“播放合成音”后拖动“3次谐波相位差”滑块：观察左侧绿色合成波形发生剧烈形变，但你的耳朵几乎听不出任何变化！接着微调“谐波频率倍率”（如调至 3.10×），感受非整数倍谐波带来的刺耳听感。",
      "controls": [
        {
          "type": "slider",
          "id": "phase",
          "label": "高次谐波相位差",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "ratio",
          "label": "谐波频率倍率",
          "min": 2,
          "max": 3.5,
          "step": 0.05,
          "value": 3,
          "unit": "×"
        },
        {
          "type": "slider",
          "id": "amp3",
          "label": "高次谐波幅度",
          "min": 0,
          "max": 1,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let osc1 = null, osc2 = null, gain1 = null, gain2 = null, delayNode = null, master = null;\n\nfunction syncAudio() {\n  const playing = !!lab.values.play;\n  if (playing) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!osc1) {\n      master = ac.createGain();\n      master.gain.setValueAtTime(0.055, ac.currentTime);\n      master.connect(ac.destination);\n      gain1 = ac.createGain();\n      gain2 = ac.createGain();\n      delayNode = ac.createDelay(0.05);\n      gain1.connect(master);\n      delayNode.connect(gain2);\n      gain2.connect(master);\n      osc1 = ac.createOscillator();\n      osc2 = ac.createOscillator();\n      osc1.type = 'sine';\n      osc2.type = 'sine';\n      osc1.connect(gain1);\n      osc2.connect(delayNode);\n      osc1.start();\n      osc2.start();\n    }\n    const now = ac.currentTime;\n    const f1 = 1000;\n    const f2 = 1000 * lab.values.ratio;\n    const delaySec = (lab.values.phase / 360) / f2;\n    osc1.frequency.setTargetAtTime(f1, now, 0.015);\n    osc2.frequency.setTargetAtTime(f2, now, 0.015);\n    delayNode.delayTime.setTargetAtTime(delaySec, now, 0.015);\n    gain1.gain.setTargetAtTime(1.0, now, 0.015);\n    gain2.gain.setTargetAtTime(lab.values.amp3, now, 0.015);\n  } else if (osc1) {\n    try {\n      osc1.stop();\n      osc2.stop();\n      master.disconnect();\n    } catch (e) {}\n    osc1 = null; osc2 = null; gain1 = null; gain2 = null; delayNode = null; master = null;\n  }\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const phaseRad = (lab.values.phase * Math.PI) / 180;\n  const ratio = lab.values.ratio;\n  const amp3 = lab.values.amp3;\n  const isHarmonic = Math.abs(ratio - Math.round(ratio)) < 0.02;\n\n  // Left box: Time Domain (0 to 5 ms)\n  const tx = 44, ty = 28, tw = 420, th = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 5; i++) {\n    const x = tx + (i / 5) * tw;\n    ctx.beginPath(); ctx.moveTo(x, ty); ctx.lineTo(x, ty + th); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '11px monospace';\n    ctx.fillText(i + 'ms', x - 10, ty + th + 15);\n  }\n  for (let a = -2; a <= 2; a++) {\n    const y = ty + th / 2 - (a / 2.2) * (th / 2);\n    ctx.beginPath(); ctx.moveTo(tx, y); ctx.lineTo(tx + tw, y); ctx.stroke();\n    if (a !== 0) {\n      ctx.fillStyle = 'rgba(248,250,252,0.45)';\n      ctx.fillText(a.toString(), tx - 20, y + 4);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(tx, ty + th / 2); ctx.lineTo(tx + tw, ty + th / 2); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域合成波形 (0 ~ 5 ms)', tx, 16);\n\n  // Fundamental faint\n  ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n  ctx.lineWidth = 1.2;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (let px = 0; px <= tw; px++) {\n    const tMs = (px / tw) * 5;\n    const yVal = Math.sin(2 * Math.PI * 1.0 * tMs);\n    const py = ty + th / 2 - (yVal / 2.2) * (th / 2);\n    if (px === 0) ctx.moveTo(tx + px, py); else ctx.lineTo(tx + px, py);\n  }\n  ctx.stroke();\n\n  // Harmonic faint\n  ctx.strokeStyle = isHarmonic ? 'rgba(245,158,11,0.38)' : 'rgba(236,72,153,0.45)';\n  ctx.beginPath();\n  for (let px = 0; px <= tw; px++) {\n    const tMs = (px / tw) * 5;\n    const yVal = amp3 * Math.sin(2 * Math.PI * ratio * tMs - phaseRad);\n    const py = ty + th / 2 - (yVal / 2.2) * (th / 2);\n    if (px === 0) ctx.moveTo(tx + px, py); else ctx.lineTo(tx + px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Summed waveform\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (let px = 0; px <= tw; px++) {\n    const tMs = (px / tw) * 5;\n    const yVal = Math.sin(2 * Math.PI * 1.0 * tMs) + amp3 * Math.sin(2 * Math.PI * ratio * tMs - phaseRad);\n    const py = ty + th / 2 - (yVal / 2.2) * (th / 2);\n    if (px === 0) ctx.moveTo(tx + px, py); else ctx.lineTo(tx + px, py);\n  }\n  ctx.stroke();\n\n  // Right box: Frequency Spectrum (0 to 4 kHz)\n  const sx = 505, sy = 28, sw = 190, sh = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let k = 0; k <= 4; k++) {\n    const x = sx + (k / 4) * sw;\n    ctx.beginPath(); ctx.moveTo(x, sy); ctx.lineTo(x, sy + sh); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '11px monospace';\n    ctx.fillText(k + 'k', x - 6, sy + sh + 15);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(sx, sy + sh); ctx.lineTo(sx + sw, sy + sh); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('频谱 (耳蜗真正“听见”的)', sx, 16);\n\n  // Bar 1 kHz\n  const x1 = sx + (1 / 4) * sw;\n  const h1 = (1.0 / 1.2) * sh;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 6;\n  ctx.beginPath(); ctx.moveTo(x1, sy + sh); ctx.lineTo(x1, sy + sh - h1); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px monospace';\n  ctx.fillText('1.0kHz', x1 - 18, sy + sh - h1 - 6);\n\n  // Bar 2 (ratio kHz)\n  const x2 = sx + (ratio / 4) * sw;\n  const h2 = (amp3 / 1.2) * sh;\n  const barCol = isHarmonic ? '#f59e0b' : '#ec4899';\n  ctx.strokeStyle = barCol;\n  ctx.lineWidth = 6;\n  ctx.beginPath(); ctx.moveTo(x2, sy + sh); ctx.lineTo(x2, sy + sh - h2); ctx.stroke();\n  ctx.fillStyle = barCol;\n  ctx.fillText(ratio.toFixed(2) + 'kHz', x2 - 20, sy + sh - h2 - 6);\n\n  // Status label inside right box\n  ctx.fillStyle = isHarmonic ? '#10b981' : '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(isHarmonic ? '● 整数倍谐波 (自然悦耳)' : '▲ 非整数倍 (不协和/刺耳)', sx + 6, sy + 18);\n\n  const phaseNote = lab.values.phase === 180 ? ' (完全反相 1 kHz - 3 kHz)' : '';\n  lab.setReadout('合成信号: 1 kHz (幅1.0) + ' + ratio.toFixed(2) + ' kHz (幅' + amp3.toFixed(1) + ', 相位 ' + lab.values.phase + '°' + phaseNote + ') | 频谱不变，耳朵听不出相位差');\n});"
    },
    {
      "type": "concept",
      "heading": "三、钢琴键盘、倍频程与听觉的对数分配",
      "paragraphs": [
        "谐波关系也是现代音乐音阶的基石。以标准钢琴键盘为例，敲击最左侧的琴键会产生 `27.5 Hz` 的基频，以及 `55, 110, 220, 440, 880 Hz...` 等一系列谐波。你会发现，这些谐波刚好对应键盘上**每隔 7 个白键**的琴键（即第 8 个键、第 15 个键……）。由于互为谐波，它们同时弹奏时极其和谐，因此全部被命名为音符 **A**；每个 A 右侧紧挨着的白键互为谐波，全部叫做 **B**，以此循环出 `A, B, C, D, E, F, G` 七个音名（中央 C 约为 `262 Hz`）。",
        "在音乐和声学中，频率翻倍被称为一个**倍频程 (Octave)**。因为每 8 个白键频率翻一倍，所以借用了拉丁语 *octo*（意为“八”）。整架钢琴跨越了 7 个多倍频程，本质上是一把**对数频率标尺**。",
        "这一对数特性对数字音频工程至关重要——**人耳获取的音频信息是按倍频程（对数）均匀分布的，而不是按赫兹数（线性）均匀分布的！** 也就是说，`50 Hz ~ 100 Hz` 这短短 50 Hz 区间所承载的听觉信息量，竟然与 `10 kHz ~ 20 kHz` 这整整 10,000 Hz 区间一样多！",
        "这就解释了两个令人惊叹的现象：第一，钢琴最高音只有约 `4 kHz`，在人类 `20 Hz ~ 20 kHz` 的听力范围内只占线性宽度的 **20%**，但它却涵盖了 10 个倍频程中的 7 个多，因此能奏出人类可感知音频信息的 **70% 以上**；第二，成年人一生中高频听力上限往往会从 `20 kHz` 退化到 `10 kHz`——线性来看似乎丢了一半频率，但实际上只丢掉了最后一个倍频程，仅仅相当于 **10% 左右**的听觉能力损失。"
      ],
      "formula": {
        "expr": "f_k = f_0 × 2^k",
        "explain": "f_0 为起始参考频率（如最左端 A 音 27.5 Hz 或人类听觉下限 20 Hz）；每增加 k=1 个倍频程，频率就乘以 2。人类 20 Hz ~ 20 kHz 恰好对应约 10 个倍频程 (2^10 = 1024)。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：线性频率尺 vs. 对数倍频程实验室",
      "instruction": "拖动“选择倍频程”滑块（从 20 Hz 到 20.48 kHz 共 10 个倍频程），对比同一段频带在上方“线性标尺”与下方“对数标尺”中截然不同的视觉宽度，并试听它的音高变化。",
      "controls": [
        {
          "type": "slider",
          "id": "octave",
          "label": "选择倍频程 (k)",
          "min": 0,
          "max": 9,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showPiano",
          "label": "高亮钢琴音域 (27.5Hz ~ 4.19kHz)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听该倍频程纯音",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "let osc = null, gainNode = null;\n\nfunction getFreqs(oct) {\n  const fLow = 20 * Math.pow(2, oct);\n  const fHigh = fLow * 2;\n  const fCenter = Math.round(20 * Math.pow(2, oct + 0.5));\n  return { fLow, fHigh, fCenter };\n}\n\nfunction syncAudio() {\n  const playing = !!lab.values.play;\n  if (playing) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!osc) {\n      gainNode = ac.createGain();\n      gainNode.connect(ac.destination);\n      osc = ac.createOscillator();\n      osc.type = 'sine';\n      osc.connect(gainNode);\n      osc.start();\n    }\n    const { fCenter } = getFreqs(lab.values.octave);\n    const vol = fCenter < 100 ? 0.12 : (fCenter > 4000 ? 0.025 : 0.06);\n    const now = ac.currentTime;\n    osc.frequency.setTargetAtTime(fCenter, now, 0.02);\n    gainNode.gain.setTargetAtTime(vol, now, 0.02);\n  } else if (osc) {\n    try { osc.stop(); gainNode.disconnect(); } catch (e) {}\n    osc = null; gainNode = null;\n  }\n}\n\nfunction fmtHz(f) {\n  return f >= 1000 ? (f / 1000).toFixed(f % 1000 === 0 ? 0 : 1) + 'k' : String(Math.round(f));\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const oct = lab.values.octave;\n  const showPiano = !!lab.values.showPiano;\n  const { fLow, fHigh, fCenter } = getFreqs(oct);\n\n  const ox = 40, axisW = 640;\n  const fMax = 20480;\n\n  // --- Top: Linear Scale (0 - 20.48 kHz) ---\n  const linY = 44, barH = 38;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('线性频率标尺 (0 ~ 20.48 kHz) — 高频占据绝大多数空间，低频被挤成一条缝', ox, 26);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(ox, linY, axisW, barH);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(ox, linY, axisW, barH);\n\n  if (showPiano) {\n    const px1 = ox + (27.5 / fMax) * axisW;\n    const px2 = ox + (4186 / fMax) * axisW;\n    ctx.fillStyle = 'rgba(56,189,248,0.28)';\n    ctx.fillRect(px1, linY, px2 - px1, barH);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.strokeRect(px1, linY, px2 - px1, barH);\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('钢琴仅占线性约20%', px1, linY - 5);\n  }\n\n  // Selected octave on Linear Scale\n  const lx1 = ox + (fLow / fMax) * axisW;\n  const lx2 = ox + (fHigh / fMax) * axisW;\n  const lw = Math.max(2, lx2 - lx1);\n  ctx.fillStyle = 'rgba(245,158,11,0.65)';\n  ctx.fillRect(lx1, linY, lw, barH);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(lx1, linY, lw, barH);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n  for (let k = 0; k <= 20; k += 5) {\n    const x = ox + ((k * 1000) / fMax) * axisW;\n    ctx.fillText(k + 'k', x - 6, linY + barH + 14);\n  }\n\n  // --- Bottom: Logarithmic Scale (10 Octaves) ---\n  const logY = 148;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('对数频率标尺 (10 个倍频程) — 每个倍频程等宽，人耳感知信息量完全相等 (各占10%)', ox, 130);\n\n  const blockW = axisW / 10;\n  for (let i = 0; i < 10; i++) {\n    const bx = ox + i * blockW;\n    ctx.fillStyle = i === oct ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.06)';\n    ctx.fillRect(bx, logY, blockW, barH);\n    ctx.strokeStyle = i === oct ? '#f59e0b' : 'rgba(255,255,255,0.22)';\n    ctx.lineWidth = i === oct ? 2 : 1;\n    ctx.strokeRect(bx, logY, blockW, barH);\n\n    const fTick = 20 * Math.pow(2, i);\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.font = '10px monospace';\n    ctx.fillText(fmtHz(fTick), bx - 8, logY + barH + 14);\n  }\n  ctx.fillText('20.5k', ox + axisW - 14, logY + barH + 14);\n\n  if (showPiano) {\n    const pStart = Math.log2(27.5 / 20);\n    const pEnd = Math.log2(4186 / 20);\n    const px1 = ox + (pStart / 10) * axisW;\n    const px2 = ox + (pEnd / 10) * axisW;\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.strokeRect(px1, logY - 3, px2 - px1, barH + 6);\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('钢琴覆盖 7.25 个倍频程 (超过 70% 听觉信息)', px1 + 8, logY + barH + 30);\n  }\n\n  // Connector lines between linear & log selected octave\n  ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n  ctx.lineWidth = 1.2;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(lx1, linY + barH); ctx.lineTo(ox + oct * blockW, logY);\n  ctx.moveTo(lx1 + lw, linY + barH); ctx.lineTo(ox + (oct + 1) * blockW, logY);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const linPct = (((fHigh - fLow) / fMax) * 100).toFixed(2);\n  lab.setReadout('第 ' + (oct + 1) + '/10 倍频程 (' + fmtHz(fLow) + ' ~ ' + fmtHz(fHigh) + ' Hz, 试听中心 ' + fCenter + ' Hz) | 线性宽度占比: ' + linPct + '% | 听觉信息占比: 10.0%');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要被示波器上的时域波形迷惑：在音频处理与音频压缩（如 MP3）中，人耳听的是各频段的幅度分布，对相对相位极其迟钝；改变谐波相位会让时域波形面目全非，但音色丝毫不变。",
        "做音频均衡器 (EQ) 或频谱分析时必须用对数横轴（倍频程）：`50~100 Hz` 与 `10~20 kHz` 对人耳而言信息量完全相等；线性频谱图会把最重要的低中频全挤在左侧角落里。",
        "保留极高频的代价高、收益小：钢琴最高音仅约 `4 kHz` 却能覆盖 `70%` 以上的听觉信息；同理，后面小节将看到的“电话仅保留 `3.2 kHz` 带宽却依然听感自然”，背后的根本原因正是这 `8/10` 个倍频程的对数信息定律。"
      ]
    }
  ]
});
