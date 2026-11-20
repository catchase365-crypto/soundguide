window.__BOOK_REGISTER_SECTION__("sec_095", {
  "title": "直角坐标转极坐标的除零陷阱 (Nuisance 2: Divide by zero error)",
  "intuition": "频域实部为零代表信号正好处于 ±90° 的纯正弦状态，直接用 Im/Re 求反正切会触发“除以零”崩溃或算错，只需提前分支拦截或把零实部替换成极小正数 1E-20 即可化险为夷。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么实部为零会让程序“当场罢工”？",
      "paragraphs": [
        "在离散傅里叶变换（DFT）中，我们经常需要把直角坐标表示的频域数据 `Re X[k]`（实部）和 `Im X[k]`（虚部），转换为更容易理解的极坐标表示——即 **幅值（Magnitude）** 和 **相位（Phase）**。",
        "在真实的物理信号中，某几个频率点出现 **实部恰好为 0、虚部不为 0** 的情况非常普遍。从波形物理意义上看，这再正常不过了：它只是说明该频率分量是一个纯粹的正弦波，其相位精确地等于 **+90°（+π/2 弧度）** 或 **-90°（-π/2 弧度）**。",
        "然而，你的计算机并不懂这个几何直觉。当你直接套用公式 `arctan(Im X[k] / Re X[k])` 让程序去算相位时，`Re X[k] = 0` 会让分母变成零，瞬间触发 **除以零错误（Divide by zero error）**。即便某些编程语言或数学库没有当场闪退报错，算出来的这个频点的相位结果也往往是错乱或无意义的。"
      ],
      "formula": {
        "expr": "Phase X[k] = arctan( Im X[k] / Re X[k] )",
        "explain": "Phase X[k] 表示第 k 个频点的相位（弧度）；Im X[k] 是虚部（正弦分量权重）；Re X[k] 是实部（余弦分量权重），一旦 Re X[k] = 0 就会导致除法崩溃。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：复平面向量与除零崩溃现场模拟",
      "instruction": "将实部 Re X[k] 滑块拉到 0（或保持默认 0），对比关闭与开启“防除零保护”时计算流程与相位结果的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "re",
          "label": "实部 Re X[k]",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "im",
          "label": "虚部 Im X[k]",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "fixMode",
          "label": "开启防除零保护 (1E-20)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const re = lab.values.re;\n  const im = lab.values.im;\n  const fixMode = lab.values.fixMode;\n  const mag = Math.sqrt(re * re + im * im);\n  const isDivZero = (re === 0 && !fixMode);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const cx = 150;\n  const cy = 122;\n  const scale = 6.2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  [31, 62, 88].forEach(r => {\n    ctx.beginPath();\n    ctx.arc(cx, cy, r, 0, Math.PI * 2);\n    ctx.stroke();\n  });\n\n  ctx.beginPath();\n  ctx.moveTo(cx - 105, cy);\n  ctx.lineTo(cx + 105, cy);\n  ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = re === 0 ? 'rgba(245,158,11,0.75)' : 'rgba(255,255,255,0.16)';\n  ctx.beginPath();\n  ctx.moveTo(cx, cy - 98);\n  ctx.lineTo(cx, cy + 98);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px monospace';\n  ctx.fillText('+Re', cx + 88, cy - 5);\n  ctx.fillText('-Re', cx - 108, cy - 5);\n  ctx.fillText('+Im (90°)', cx + 6, cy - 92);\n  ctx.fillText('-Im (-90°)', cx + 6, cy + 100);\n\n  let phase = 0;\n  if (!isDivZero) {\n    const safeRe = (re === 0 && fixMode) ? 1e-20 : re;\n    phase = Math.atan(im / safeRe);\n    if (safeRe < 0 && im < 0) phase -= Math.PI;\n    if (safeRe < 0 && im >= 0) phase += Math.PI;\n  }\n\n  const vx = cx + re * scale;\n  const vy = cy - im * scale;\n\n  if (mag > 0 && !isDivZero) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    if (phase >= 0) {\n      ctx.arc(cx, cy, 24, -phase, 0, false);\n    } else {\n      ctx.arc(cx, cy, 24, 0, -phase, false);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = isDivZero ? '#ec4899' : '#38bdf8';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(vx, vy);\n  ctx.stroke();\n\n  ctx.fillStyle = isDivZero ? '#ec4899' : '#10b981';\n  ctx.beginPath();\n  ctx.arc(vx, vy, 5, 0, Math.PI * 2);\n  ctx.fill();\n\n  const px = 295;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(px, 16, 405, 208);\n  ctx.strokeRect(px, 16, 405, 208);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('矩形坐标 → 极坐标 计算流水线 (Table 8-3)', px + 16, 40);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '12px monospace';\n  ctx.fillText('1. MAG = SQR(Re² + Im²) = ' + mag.toFixed(3), px + 16, 70);\n\n  if (re === 0 && fixMode) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('2. Line 250 拦截: Re=0 → 替换为 1E-20', px + 16, 98);\n  } else if (re === 0 && !fixMode) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('2. Line 250 未启用: Re 仍为 0 (危险!)', px + 16, 98);\n  } else {\n    ctx.fillStyle = 'rgba(248,250,252,0.75)';\n    ctx.fillText('2. 检查 Re ≠ 0, 无需替换 (Re = ' + re + ')', px + 16, 98);\n  }\n\n  if (isDivZero) {\n    ctx.fillStyle = 'rgba(236,72,153,0.18)';\n    ctx.strokeStyle = '#ec4899';\n    ctx.fillRect(px + 16, 118, 373, 86);\n    ctx.strokeRect(px + 16, 118, 373, 86);\n\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 14px sans-serif';\n    const errTitle = im === 0 ? '💥 0 / 0 错误：结果为 NaN（无意义）' : '💥 Divide by Zero Error！除法崩溃';\n    ctx.fillText(errTitle, px + 30, 148);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '12px sans-serif';\n    const hint = im > 0 ? '物理真实相位应为 +90° (+π/2)，请开启保护开关！' : (im < 0 ? '物理真实相位应为 -90° (-π/2)，请开启保护开关！' : '零向量相位无定义，开启保护后可安全归零。');\n    ctx.fillText(hint, px + 30, 178);\n    lab.setReadout('状态: ❌ 触发除零错误 | Re = 0, Im = ' + im + ' | MAG = ' + mag.toFixed(2) + ' | PHASE = ERROR');\n  } else {\n    const usedRe = (re === 0 && fixMode) ? 1e-20 : re;\n    const ratio = im / usedRe;\n    const deg = phase * 180 / Math.PI;\n    ctx.fillStyle = 'rgba(16,185,129,0.12)';\n    ctx.strokeStyle = '#10b981';\n    ctx.fillRect(px + 16, 118, 373, 86);\n    ctx.strokeRect(px + 16, 118, 373, 86);\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '12px monospace';\n    const ratioStr = Math.abs(ratio) > 1e6 ? (ratio > 0 ? '+1e20 级别 (→ +∞)' : '-1e20 级别 (→ -∞)') : ratio.toFixed(3);\n    ctx.fillText('3. Im / Re = ' + ratioStr, px + 30, 146);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = 'bold 14px monospace';\n    ctx.fillText('4. PHASE = ' + deg.toFixed(1) + '° (' + phase.toFixed(4) + ' rad)', px + 30, 178);\n    lab.setReadout('状态: ✅ 计算安全 | Re = ' + (re === 0 ? '0 → 1E-20' : re) + ', Im = ' + im + ' | MAG = ' + mag.toFixed(2) + ' | PHASE = ' + deg.toFixed(1) + '°');\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "两种工程解法：老实分支判断 vs “1E-20” 极客技巧",
      "paragraphs": [
        "避开除零错误有两种经典写法。**第一种是显式分支判断**：在做除法前先检查 `Re X[k]` 是否等于 `0`。如果是 `0`，就继续判断 `Im X[k]` 是正还是负——虚部为正就把相位直接设为 `+π/2`（+90°），虚部为负就设为 `-π/2`（-90°），并 **彻底跳过** 后面的除法运算。步骤不难，但写起来有些繁琐。",
        "**第二种是原书 Table 8-3 第 250 行给出的极客技巧**：先用第 240 行把幅值 `MAG[K%]` 算好，紧接着在计算相位之前加一句 `IF REX[K%] = 0 THEN REX[K%] = 1E-20`。如果实部为零，就把它替换成一个极小但非零的正数 `10^-20`。",
        "为什么这招如此巧妙？首先，幅值已经提前算完了，修改 `REX` 不会污染幅值精度；其次，`Im / 1E-20` 会得到一个绝对值极其巨大的正数或负数（若虚部也为 0 则得 0），送入 `ATN()` 反正切函数后，计算机的数学处理器既不会遇到除零错误，又能精准吐出 `+π/2`、`-π/2` 或 `0`！"
      ],
      "formula": {
        "expr": "IF REX[K%] = 0 THEN REX[K%] = 1E-20",
        "explain": "当第 K% 个频点的实部 REX[K%] 精确等于 0 时，将其替换为一个极小的正数 10^-20，从而在不引入复杂分支跳转的前提下让数学处理器顺利完成反正切除法。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：时域波形重建与听感对比（Web Audio）",
      "instruction": "在 Re = 0（纯正弦分量）时，点击播放声音并切换“开启 1E-20 防除零补丁”，对比波形重建与听感的差异。",
      "controls": [
        {
          "type": "slider",
          "id": "re",
          "label": "实部 Re X[k]",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "im",
          "label": "虚部 Im X[k]",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "useFix",
          "label": "开启 1E-20 防除零补丁",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放重建信号",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet audioCtx = null;\nlet osc = null;\nlet gain = null;\nlet animPhase = 0;\n\nfunction syncAudio() {\n  const wantPlay = Boolean(lab.values.play);\n  if (!wantPlay) {\n    if (gain && audioCtx) {\n      gain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n    }\n    return;\n  }\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    if (!audioCtx) return;\n    osc = audioCtx.createOscillator();\n    gain = audioCtx.createGain();\n    gain.gain.value = 0;\n    osc.connect(gain);\n    gain.connect(audioCtx.destination);\n    osc.start();\n  }\n  if (audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n  const re = lab.values.re;\n  const im = lab.values.im;\n  const useFix = lab.values.useFix;\n  const mag = Math.sqrt(re * re + im * im);\n  const isErr = (re === 0 && !useFix);\n  if (isErr) {\n    osc.type = 'sawtooth';\n    osc.frequency.setTargetAtTime(95, audioCtx.currentTime, 0.02);\n    gain.gain.setTargetAtTime(0.06, audioCtx.currentTime, 0.02);\n  } else {\n    osc.type = 'sine';\n    osc.frequency.setTargetAtTime(220, audioCtx.currentTime, 0.02);\n    const amp = Math.min(0.24, (mag / 14.15) * 0.24);\n    gain.gain.setTargetAtTime(amp, audioCtx.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  const re = lab.values.re;\n  const im = lab.values.im;\n  const useFix = lab.values.useFix;\n  const mag = Math.sqrt(re * re + im * im);\n  const isErr = (re === 0 && !useFix);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const left = 46;\n  const right = 696;\n  const plotW = right - left;\n  const midY = 126;\n  const ampScale = 5.4;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let y = 45; y <= 207; y += 27) {\n    ctx.beginPath();\n    ctx.moveTo(left, y);\n    ctx.lineTo(right, y);\n    ctx.stroke();\n  }\n  for (let i = 0; i <= 8; i++) {\n    const x = left + (plotW * i) / 8;\n    ctx.beginPath();\n    ctx.moveTo(x, 38);\n    ctx.lineTo(x, 214);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.25)';\n  ctx.beginPath();\n  ctx.moveTo(left, midY);\n  ctx.lineTo(right, midY);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 5;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const t = (i / 200) * Math.PI * 4 + animPhase;\n    const val = re * Math.cos(t) + im * Math.sin(t);\n    const x = left + (i / 200) * plotW;\n    const y = midY - val * ampScale;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (isErr) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (let i = 0; i <= 120; i++) {\n      const x = left + (i / 120) * plotW;\n      const jitter = ((i % 2 === 0 ? 1 : -1) * 4);\n      const y = midY + jitter;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = 'rgba(236,72,153,0.22)';\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(190, 88, 340, 68);\n    ctx.strokeRect(190, 88, 340, 68);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillText('❌ 除零导致极坐标转换失败，逆变换波形丢失！', 212, 117);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('请开启“1E-20 防除零补丁”恢复纯正弦信号', 236, 141);\n  } else {\n    const safeRe = (re === 0) ? 1e-20 : re;\n    let phase = Math.atan(im / safeRe);\n    if (safeRe < 0 && im < 0) phase -= Math.PI;\n    if (safeRe < 0 && im >= 0) phase += Math.PI;\n    const reRec = mag * Math.cos(phase);\n    const imRec = mag * Math.sin(phase);\n\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i <= 200; i++) {\n      const t = (i / 200) * Math.PI * 4 + animPhase;\n      const val = reRec * Math.cos(t) + imRec * Math.sin(t);\n      const x = left + (i / 200) * plotW;\n      const y = midY - val * ampScale;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('━━ 原始直角坐标波形', 50, 24);\n  ctx.fillStyle = isErr ? '#ec4899' : '#10b981';\n  ctx.fillText(isErr ? '━━ 重建失败 (DIV/0 故障蜂鸣)' : '━━ 极坐标重建波形 (220 Hz 纯音)', 205, 24);\n\n  const statusText = isErr\n    ? '❌ Re=0 触发除零错误 | 原始信号存在但极坐标重建崩溃（播放时发出故障警告音）'\n    : '✅ 重建与原始波形完全重合 | Mag = ' + mag.toFixed(2) + ' | ' + (re === 0 ? '已用 1E-20 绕过除零' : 'Re ≠ 0 正常计算');\n  lab.setReadout(statusText);\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    animPhase += dt * 3.5;\n    draw();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "高频踩坑：实部 `Re X[k] = 0` 且虚部非零在 DFT 中极为常见（代表 ±90° 纯正弦分量），绝不能直接不加检查地执行 `Im / Re`。",
        "顺序铁律：如果采用 `REX[K%] = 1E-20` 替换法，必须先用原始 `REX` 计算完幅值 `MAG`，再修改 `REX` 计算相位 `PHASE`。",
        "分支等价：若不想使用 `1E-20` 技巧，也可以显式判断 `Re == 0`，根据 `Im` 的正负直接将相位设为 `+π/2` 或 `-π/2` 并跳过除法。"
      ]
    }
  ]
});
