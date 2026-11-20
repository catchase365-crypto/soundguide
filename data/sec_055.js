window.__BOOK_REGISTER_SECTION__("sec_055", {
  "title": "线性的特殊性质 (Special Properties of Linearity)",
  "intuition": "线性系统的级联可以任意交换顺序，多路输入互不干扰且直接叠加；但千万分清：信号乘常数是线性，信号乘信号是非线性。",
  "blocks": [
    {
      "type": "concept",
      "heading": "级联系统的交换律与现实电路的陷阱",
      "paragraphs": [
        "当多个系统串联成**级联（Cascade）**结构——即前一个系统的输出直接作为后一个系统的输入时，只要每一个子系统都是线性的，整体组合就依然是线性的。线性系统还具备**交换律（Commutative Property）**：你可以任意调换级联中各个系统的先后顺序，而不会改变整体系统的输入输出特性。",
        "在电子电路设计中，这个性质非常实用。假设你需要设计一个包含**放大器（Amplify）**和**滤波器（Filter）**的两级电路：到底应该“先放大再滤波”，还是“先滤波再放大”？在理想的线性世界里，这两种接法得到的结果一模一样。",
        "但真实硬件往往存在**非线性效应**（例如运放饱和削波、压摆率失真、内部噪声、直流偏置等），这些因素会悄悄打破交换律。比如当输入信号混有很强的高频干扰时，如果“先放大”，巨大的干扰峰谷会把放大器推入饱和削波区，产生不可逆的失真，后续再滤波也救不回来；而“先滤波”把干扰滤除后再放大，信号就能保持干净。"
      ],
      "formula": {
        "expr": "y[n] = B(A(x[n])) = A(B(x[n]))",
        "explain": "当子系统 A 与 B 均为线性系统时，先经过 A 再经过 B，与先经过 B 再经过 A，最终输出 y[n] 完全等价"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：先放大再滤波 vs 先滤波再放大",
      "instruction": "保持削波关闭，拖动增益与干扰滑块观察蓝绿两线是否永远完美重合；再打开「真实运放饱和削波」开关，看看交换律是如何瞬间失效的。",
      "controls": [
        {
          "type": "slider",
          "id": "gain",
          "label": "放大器增益",
          "min": 0.5,
          "max": 4,
          "step": 0.1,
          "value": 2.5,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "hfAmp",
          "label": "高频干扰幅度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "低通滤波截止系数",
          "min": 0.05,
          "max": 0.6,
          "step": 0.05,
          "value": 0.15,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "clipOn",
          "label": "开启真实运放饱和削波 (|v| > 1.4V)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const gain = lab.values.gain;\n  const hfAmp = lab.values.hfAmp;\n  const cutoff = lab.values.cutoff;\n  const clipOn = lab.values.clipOn;\n  const clipLimit = 1.4;\n\n  const N = 240;\n  const x = new Float32Array(N);\n  for (let i = 0; i < N; i++) {\n    const t = i / N;\n    x[i] = 0.6 * Math.sin(2 * Math.PI * 2 * t) + hfAmp * Math.sin(2 * Math.PI * 28 * t);\n  }\n\n  function applyGainAndClip(arr) {\n    const out = new Float32Array(N);\n    for (let i = 0; i < N; i++) {\n      let v = arr[i] * gain;\n      if (clipOn) {\n        if (v > clipLimit) v = clipLimit;\n        if (v < -clipLimit) v = -clipLimit;\n      }\n      out[i] = v;\n    }\n    return out;\n  }\n\n  function onePole(arr) {\n    const out = new Float32Array(N);\n    let prev = 0;\n    for (let i = 0; i < N; i++) {\n      prev = prev + cutoff * (arr[i] - prev);\n      out[i] = prev;\n    }\n    return out;\n  }\n\n  function applyLowpass(arr) {\n    return onePole(onePole(arr));\n  }\n\n  const y1 = applyLowpass(applyGainAndClip(x));\n  const y2 = applyGainAndClip(applyLowpass(x));\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= W; gx += 60) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 0; gy <= H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  const midY = H / 2 + 10;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();\n\n  const scaleY = 38;\n  if (clipOn) {\n    ctx.save();\n    ctx.setLineDash([5, 5]);\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.beginPath();\n    ctx.moveTo(0, midY - clipLimit * scaleY); ctx.lineTo(W, midY - clipLimit * scaleY);\n    ctx.moveTo(0, midY + clipLimit * scaleY); ctx.lineTo(W, midY + clipLimit * scaleY);\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  function plot(arr, color, width, dash) {\n    ctx.save();\n    if (dash) ctx.setLineDash(dash);\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const px = (i / (N - 1)) * (W - 40) + 20;\n      const py = midY - arr[i] * scaleY;\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  plot(x, 'rgba(248,250,252,0.24)', 1.2, null);\n  plot(y1, '#38bdf8', 3, null);\n  plot(y2, '#10b981', 2, [6, 4]);\n\n  let maxDiff = 0;\n  for (let i = 0; i < N; i++) {\n    const d = Math.abs(y1[i] - y2[i]);\n    if (d > maxDiff) maxDiff = d;\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('灰线: 含噪输入 x[n]', 20, 20);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('蓝实线: 先放大后滤波', 155, 20);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('绿虚线: 先滤波后放大', 310, 20);\n  if (clipOn) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('黄虚线: ±1.4V 削波门限', 470, 20);\n  }\n\n  const status = maxDiff < 1e-6\n    ? '两曲线完全重合 (理想线性满足交换律)'\n    : '非线性削波打破了交换律！两条路径最大偏差 = ' + maxDiff.toFixed(3);\n  lab.setReadout('增益: ' + gain.toFixed(1) + 'x | 高频干扰: ' + hfAmp.toFixed(2) + ' | ' + status);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "多输入多输出系统 (MIMO) 的线性判定法则",
      "paragraphs": [
        "现实中的信号处理系统往往不止一个输入和输出。如何判断一个复杂的**多输入多输出（Multiple Inputs / Multiple Outputs）**系统是不是线性的？规则异常简单：**只要系统内部只由线性子系统和“信号相加（Addition）”组成，无论内部拓扑有多复杂，整个系统就一定是线性的**；唯一禁忌是内部不能混入任何非线性环节。",
        "我们可以用一个简单的思想实验来理解 MIMO 系统的线性含义：先把其它所有输入端都设为 0，只在第 1 个输入端送入信号 `x₁[n]`，观察所有输出端出现的波形组合；接着把第 1 路也置零，只在第 2 个输入端送入信号 `x₂[n]`，记录另一组输出波形；最后让 `x₁[n]` 和 `x₂[n]` 同时输入，你会发现各个输出端的最终波形，正好等于前面两次单独实验结果的**直接相加（叠加）**。"
      ],
      "formula": {
        "expr": "yₖ[n] = Tₖ(x₁[n], 0) + Tₖ(0, x₂[n])",
        "explain": "第 k 个输出端在多路信号同时输入时的响应 yₖ[n]，等于各路输入单独作用（其余输入置零）时所产生输出的代数和"
      }
    },
    {
      "type": "concept",
      "heading": "乘法的真假线性，以及寄生信号的双重视角",
      "paragraphs": [
        "“乘法”在信号处理中是最容易被误解的操作，因为它既可能是线性的，也可能是非线性的，完全取决于**信号乘的是什么**：",
        "1. **信号乘以常数 `y[n] = c · x[n]` 是线性的**：当常数 `c > 1` 时它是放大器，`c < 1` 时它是衰减器，它严格满足正弦保真度（输入正弦波，输出依然是同频正弦波）。\n2. **信号乘以另一个信号 `y[n] = x₁[n] · x₂[n]` 是非线性的**：想象两个不同频率的正弦波相乘，根据三角函数积化和差公式，输出不再是单一正弦波，而是分裂成了和频 `f₁ + f₂` 与差频 `|f₁ - f₂|` 两个新频率！",
        "另一个经典迷惑场景是电路中的**寄生信号（如直流偏置 DC offset 和热噪声）**：往信号里加一个直流偏置或噪声，这算线性还是非线性？答案取决于你**从哪里界定系统的边界**：如果你认为这些干扰是从**系统内部**凭空冒出来的，那输入纯正弦波却输出了带偏置或带噪的波形，这就是**非线性**；但如果你换个视角，把直流偏置或热噪声看作从**外部另一个独立输入口**进入的多输入系统，那么系统内部只做了一次信号加法，整个过程就是完全**线性**的！"
      ],
      "formula": {
        "expr": "sin(2πf₁t) · sin(2πf₂t) = 0.5·[cos(2π(f₁-f₂)t) - cos(2π(f₁+f₂)t)]",
        "explain": "两信号相乘会消灭原有频率 f₁ 与 f₂，并凭空制造出差频 (f₁-f₂) 与和频 (f₁+f₂) 两个新频率，直接违背线性系统的正弦保真度"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：乘常数 vs 信号相乘的时频与听觉对比",
      "instruction": "点击播放声音，在「乘常数 c」与「乘以信号 x₂[n]」之间切换，观察左侧时域波形、右侧频谱图以及人耳听感的剧烈变化。",
      "controls": [
        {
          "type": "toggle",
          "id": "multiplySignal",
          "label": "非线性模式：乘以信号 x₂[n]（关闭为乘常数 c）",
          "value": false
        },
        {
          "type": "slider",
          "id": "f1",
          "label": "主正弦波频率 f₁",
          "min": 120,
          "max": 480,
          "step": 10,
          "value": 240,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "f2",
          "label": "调制信号频率 f₂",
          "min": 20,
          "max": 180,
          "step": 5,
          "value": 70,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "gain",
          "label": "常数乘数 c",
          "min": 0.2,
          "max": 1.8,
          "step": 0.1,
          "value": 1.2,
          "unit": "x"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放输出声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet audioNodes = null;\n\nfunction stopAudio() {\n  if (audioNodes) {\n    try {\n      audioNodes.master.gain.setValueAtTime(0, audioNodes.ac.currentTime);\n      audioNodes.osc1.stop();\n      audioNodes.osc2.stop();\n      audioNodes.osc1.disconnect();\n      audioNodes.osc2.disconnect();\n      audioNodes.modDepth.disconnect();\n      audioNodes.modGain.disconnect();\n      audioNodes.master.disconnect();\n    } catch (e) {}\n    audioNodes = null;\n  }\n}\n\nfunction syncAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!audioNodes) {\n    const osc1 = ac.createOscillator();\n    const osc2 = ac.createOscillator();\n    const modDepth = ac.createGain();\n    const modGain = ac.createGain();\n    const master = ac.createGain();\n    osc1.type = 'sine';\n    osc2.type = 'sine';\n    osc1.connect(modGain);\n    osc2.connect(modDepth);\n    modDepth.connect(modGain.gain);\n    modGain.connect(master);\n    master.connect(ac.destination);\n    osc1.start();\n    osc2.start();\n    audioNodes = { ac, osc1, osc2, modDepth, modGain, master };\n  }\n  const now = audioNodes.ac.currentTime;\n  audioNodes.osc1.frequency.setTargetAtTime(lab.values.f1, now, 0.02);\n  audioNodes.osc2.frequency.setTargetAtTime(lab.values.f2, now, 0.02);\n  if (lab.values.multiplySignal) {\n    audioNodes.modGain.gain.setTargetAtTime(0, now, 0.02);\n    audioNodes.modDepth.gain.setTargetAtTime(1.0, now, 0.02);\n    audioNodes.master.gain.setTargetAtTime(0.22, now, 0.02);\n  } else {\n    audioNodes.modDepth.gain.setTargetAtTime(0, now, 0.02);\n    audioNodes.modGain.gain.setTargetAtTime(lab.values.gain, now, 0.02);\n    audioNodes.master.gain.setTargetAtTime(0.14, now, 0.02);\n  }\n}\n\nfunction draw() {\n  syncAudio();\n  const multSig = lab.values.multiplySignal;\n  const f1 = lab.values.f1;\n  const f2 = lab.values.f2;\n  const c = lab.values.gain;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= W; gx += 60) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 0; gy <= H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  // Divider between time domain (left) and frequency spectrum (right)\n  const splitX = 435;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(splitX, 10); ctx.lineTo(splitX, H - 10); ctx.stroke();\n\n  // Time domain: 0 to 0.04s\n  const tLeft = 20;\n  const tWidth = splitX - 35;\n  const midY = H / 2 + 12;\n  const ampScale = 44;\n  const dur = 0.04;\n  const steps = 260;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(tLeft, midY); ctx.lineTo(tLeft + tWidth, midY); ctx.stroke();\n\n  // Plot x1(t) ghost\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * dur;\n    const val = Math.sin(2 * Math.PI * f1 * t);\n    const px = tLeft + (i / steps) * tWidth;\n    const py = midY - val * ampScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // If nonlinear, plot x2(t) dashed amber\n  if (multSig) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    for (let i = 0; i <= steps; i++) {\n      const t = (i / steps) * dur;\n      const val = Math.sin(2 * Math.PI * f2 * t);\n      const px = tLeft + (i / steps) * tWidth;\n      const py = midY - val * ampScale;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  // Plot y(t)\n  ctx.strokeStyle = multSig ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * dur;\n    const x1 = Math.sin(2 * Math.PI * f1 * t);\n    const val = multSig ? x1 * Math.sin(2 * Math.PI * f2 * t) : c * x1;\n    const px = tLeft + (i / steps) * tWidth;\n    const py = midY - val * ampScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Frequency spectrum (right panel: 0 to 720 Hz)\n  const fLeft = splitX + 25;\n  const fWidth = W - fLeft - 20;\n  const baseY = H - 30;\n  const maxF = 720;\n  const maxBarH = 120;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(fLeft, baseY); ctx.lineTo(fLeft + fWidth, baseY); ctx.stroke();\n\n  function drawStem(freq, heightRatio, color, label, dashed) {\n    if (freq < 0 || freq > maxF) return;\n    const px = fLeft + (freq / maxF) * fWidth;\n    const barH = Math.min(heightRatio, 1.8) * (maxBarH / 1.8);\n    ctx.save();\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = color;\n    ctx.lineWidth = dashed ? 1.5 : 4;\n    ctx.beginPath();\n    ctx.moveTo(px, baseY); ctx.lineTo(px, baseY - barH);\n    ctx.stroke();\n    ctx.restore();\n    if (!dashed) {\n      ctx.fillStyle = color;\n      ctx.beginPath(); ctx.arc(px, baseY - barH, 4, 0, Math.PI * 2); ctx.fill();\n    }\n    ctx.fillStyle = color;\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText(label, px, baseY - barH - 9);\n    ctx.fillText(freq + 'Hz', px, baseY + 14);\n    ctx.textAlign = 'left';\n  }\n\n  if (!multSig) {\n    drawStem(f1, c, '#10b981', 'f1', false);\n  } else {\n    drawStem(f1, 0.9, 'rgba(248,250,252,0.3)', '原f1消失', true);\n    drawStem(Math.abs(f1 - f2), 0.75, '#ec4899', 'f1-f2', false);\n    drawStem(f1 + f2, 0.75, '#ec4899', 'f1+f2', false);\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('时域波形 (40ms 窗口)', 20, 20);\n  ctx.fillText('频谱分布 (0~720 Hz)', fLeft, 20);\n  ctx.fillStyle = multSig ? '#ec4899' : '#10b981';\n  ctx.fillText(multSig ? '粉线: y = x1·x2 (非线性)' : '绿线: y = c·x1 (线性)', 185, 20);\n\n  if (multSig) {\n    lab.setReadout('非线性模式: y[n] = x1[n]·x2[n] | 原频率 ' + f1 + 'Hz 消失，产生新频率 ' + Math.abs(f1 - f2) + 'Hz 与 ' + (f1 + f2) + 'Hz');\n  } else {\n    lab.setReadout('线性模式: y[n] = ' + c.toFixed(1) + '·x1[n] | 正弦形状与频率 ' + f1 + 'Hz 完全保持不变');\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "级联顺序在理想线性系统中可以随意调换（A→B ≡ B→A），但真实电路遇到噪声、直流偏置或大信号削波时，必须先滤波剔除无用干扰，再进行高倍放大。",
        "多输入多输出系统的线性判定不看规模多复杂，只看内部组件：只要全由线性子系统与信号加法器构成，整个系统就是线性的。",
        "信号乘以常数是线性运算（单纯缩放幅度，不产生新频率）；两个信号相乘是非线性运算（会产生和频与差频，破坏正弦保真度）。",
        "电路里的热噪声和直流偏置，若视为系统内部自发产生则属于非线性；若在数学建模时将其看作独立外部输入端的附加信号，则可纳入线性系统框架轻松分析。"
      ]
    }
  ]
});
