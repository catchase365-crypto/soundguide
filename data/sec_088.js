window.__BOOK_REGISTER_SECTION__("sec_088", {
  "title": "DFT 基函数：离散信号的“正余弦积木” (DFT Basis Functions)",
  "intuition": "DFT 频域输出只是一组振幅数字，而基函数就是长度与信号完全相等、振幅恒为 1 的标准正余弦波形；将振幅分别乘回这些波形再全部相加，就能还原出原时域信号。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是 DFT 基函数？为什么它们必须和信号一样长？",
      "paragraphs": [
        "在离散傅里叶变换（DFT）中，频域结果 `ReX[k]` 和 `ImX[k]` 本质上只是一串代表**缩放倍数（振幅）**的纯数字。真正负责撑起波形骨架的，是一组被称为 **DFT 基函数（Basis Functions）** 的标准余弦波 `c_k[i]` 与正弦波 `s_k[i]`。",
        "这些基函数天生具有**单位振幅（Unity Amplitude，即峰值为 1）**。只要把频域里的每个振幅数字乘到对应的正弦或余弦基函数上，再把所有缩放后的波形逐点相加，就能严丝合缝地拼出完整的时域信号。正因为它们要逐点相加来还原长度为 `N` 的输入信号，**每一个基函数自身也必须恰好包含 `N` 个采样点**（索引 `i` 从 `0` 到 `N-1`）。",
        "理解基函数最关键的物理直觉在于频率参数 `k`：**`k` 恰好等于该基函数在总共 `N` 个采样点内完成的完整周期数**。例如，在 32 点 DFT 中，`c_1[]` 会在 32 个点内刚好走完 1 个完整周期，`c_5[]` 会走完 5 个完整周期，以此类推。因此对于 `N` 点 DFT，`k` 的取值范围是 `0` 到 `N/2`，共有 `N/2 + 1` 组余弦波和 `N/2 + 1` 组正弦波（例如 `N=32` 时共有 17 个余弦波与 17 个正弦波）。"
      ],
      "formula": {
        "expr": "c_k[i] = cos(2πki / N) ,   s_k[i] = sin(2πki / N)   (i = 0, 1, ..., N-1; k = 0, 1, ..., N/2)",
        "explain": "c_k[i] 对应频域实部 ReX[k] 所缩放的余弦基函数，s_k[i] 对应虚部 ImX[k] 所缩放的正弦基函数；N 是信号总点数，i 是时域采样点索引，k 是频率索引（表示在 N 个点内包含 k 个完整波形周期）。"
      }
    },
    {
      "type": "lab",
      "heading": "32 点 DFT 基函数显微镜（复现图 8-5 与高频视觉错觉）",
      "instruction": "拖动「频率参数 k」滑块观察 c_k[i] 与 s_k[i] 在 32 个样点中的波形变化；在 k=10 时关闭「辅助连续连线」体验高频离散样点的视觉错觉，并点击试听不同 k 对应的音高。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "频率参数 k (N=32 内的周期数)",
          "min": 0,
          "max": 16,
          "step": 1,
          "value": 2,
          "unit": " 周期"
        },
        {
          "type": "toggle",
          "id": "showCurve",
          "label": "显示辅助连续连线 (帮助眼睛跟踪波形)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听该频率基函数",
          "activeLabel": "⏸ 停止发声"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 32;\nlet osc = null;\nlet gainNode = null;\n\nfunction stopAudio() {\n  if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nfunction updateAudio(k, play) {\n  if (!play) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') { ac.resume(); }\n  const freq = k * 110;\n  const targetGain = (k === 0) ? 0.0 : 0.14;\n  if (!osc) {\n    osc = ac.createOscillator();\n    gainNode = ac.createGain();\n    osc.type = 'sine';\n    osc.frequency.setValueAtTime(Math.max(freq, 20), ac.currentTime);\n    gainNode.gain.setValueAtTime(targetGain, ac.currentTime);\n    osc.connect(gainNode);\n    gainNode.connect(ac.destination);\n    osc.start();\n  } else {\n    osc.frequency.setTargetAtTime(Math.max(freq, 20), ac.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(targetGain, ac.currentTime, 0.02);\n  }\n}\n\nfunction drawPanel(x0, y0, pw, ph, title, color, isSin, k, showCurve) {\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const gy = y0 + (ph * g) / 4;\n    ctx.beginPath();\n    ctx.moveTo(x0, gy);\n    ctx.lineTo(x0 + pw, gy);\n    ctx.stroke();\n  }\n  for (let s = 0; s <= N; s += 8) {\n    const gx = x0 + (pw * s) / N;\n    ctx.beginPath();\n    ctx.moveTo(gx, y0);\n    ctx.lineTo(gx, y0 + ph);\n    ctx.stroke();\n  }\n  const midY = y0 + ph / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(x0, midY);\n  ctx.lineTo(x0 + pw, midY);\n  ctx.stroke();\n\n  const ampPx = ph * 0.36;\n  if (showCurve) {\n    ctx.strokeStyle = isSin ? 'rgba(16,185,129,0.55)' : 'rgba(56,189,248,0.55)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    const steps = 200;\n    for (let m = 0; m <= steps; m++) {\n      const iFloat = (m / steps) * (N - 1);\n      const val = isSin ? Math.sin((2 * Math.PI * k * iFloat) / N) : Math.cos((2 * Math.PI * k * iFloat) / N);\n      const px = x0 + (iFloat / N) * pw;\n      const py = midY - val * ampPx;\n      if (m === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  for (let i = 0; i < N; i++) {\n    const raw = isSin ? Math.sin((2 * Math.PI * k * i) / N) : Math.cos((2 * Math.PI * k * i) / N);\n    const val = Math.abs(raw) < 1e-12 ? 0 : raw;\n    const px = x0 + (i / N) * pw;\n    const py = midY - val * ampPx;\n    ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.fillRect(px - 2.5, py - 2.5, 5, 5);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(title, x0 + 6, y0 + 14);\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.font = '10px monospace';\n  ctx.fillText('+1', x0 + 4, midY - ampPx + 3);\n  ctx.fillText('-1', x0 + 4, midY + ampPx + 3);\n  ctx.fillText('i=0', x0 + 2, y0 + ph - 4);\n  ctx.fillText('i=31', x0 + pw - 26, y0 + ph - 4);\n  ctx.restore();\n}\n\nfunction render() {\n  const k = lab.values.k;\n  const showCurve = !!lab.values.showCurve;\n  const play = !!lab.values.play;\n  updateAudio(k, play);\n\n  ctx.clearRect(0, 0, W, H);\n  drawPanel(16, 14, 330, 210, 'c_' + k + '[i] = cos(2π·' + k + '·i/32)', '#38bdf8', false, k, showCurve);\n  drawPanel(374, 14, 330, 210, 's_' + k + '[i] = sin(2π·' + k + '·i/32)', '#10b981', true, k, showCurve);\n\n  let note = '在 32 个点内完成 ' + k + ' 个完整周期';\n  if (k === 0) note = 'k=0 零频直流：c_0[i] 恒为 +1，s_0[i] 恒为 0（无振荡）';\n  else if (k === 10) note = 'k=10 高频：关掉辅助连线后样点看似凌乱，但数学上仍是严格离散正余弦';\n  else if (k === 16) note = 'k=N/2=16 最高频：c_16 在 +1/-1 交替，s_16 恰好全踩在过零点（全为 0）';\n\n  const audioInfo = play ? (' | 试听: ' + (k === 0 ? '0 Hz (直流静音)' : (k * 110) + ' Hz')) : '';\n  lab.setReadout('N = 32 | k = ' + k + ' | ' + note + audioInfo);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "极值频点的奥秘与“N 点进、N+2 点出”信息守恒之谜",
      "paragraphs": [
        "仔细观察基函数两端和中间的特殊频点，你会发现三个极具工程意义的规律：首先在零频处（`k = 0`），余弦波 `c_0[]` 是恒等于 1 的水平线，这意味着 **`ReX[0]` 专门用来保存整个时域信号所有采样点的平均值**（电子学中称为**直流偏置 DC Offset**）；而正弦波 `s_0[]` 则全部由 0 组成，完全无法影响任何信号合成，因此 `ImX[0]` 毫无意义，永远被设为 0。",
        "其次在中高频段（例如 `k = 10`），如果去掉辅助人类视觉的连续虚线，离散采样点 `c_10[]` 和 `s_10[]` 在图上看起来简直像杂乱无章的锯齿，肉眼根本看不出波浪形状。这可能会让你感到不安，但请放心：**从数学上讲，这些样点依然是严格完美的离散正余弦波**，只不过每周期仅有 3.2 个点，超出了人眼的脑补极限。",
        "最后来到最高频率处（`k = N/2`，即 32 点中的 `k = 16`）：`c_16[]` 在 `+1` 和 `-1` 之间来回跳变，相当于恰好在连续余弦波的**波峰与波谷**处采样；而 `s_16[]` 则相当于恰好在连续正弦波的**过零点（Zero Crossings）**处采样，于是再次得到全 0 序列！这直接解开了 DFT 的一个经典谜题：**为什么输入时域只有 `N` 个采样点，输出频域却有 `N + 2` 个数字（`ReX[0..N/2]` 与 `ImX[0..N/2]` 各 `N/2 + 1` 个）？**答案就是其中有两个输出点（`ImX[0]` 和 `ImX[N/2]`）永远为 0、不携带任何信息，真正独立的自由度依然恰好是 `N` 个。"
      ],
      "formula": {
        "expr": "s_0[i] = sin(0) = 0 ,   s_{N/2}[i] = sin(πi) = 0   ⇒   ImX[0] = ImX[N/2] ≡ 0",
        "explain": "无论 i 取任何整数，k=0 和 k=N/2 对应的正弦基函数序列恒等于 0，导致 ImX[0] 和 ImX[N/2] 失去任何信息承载能力，从而使 N+2 个输出数组元素中的有效独立信息量严格保持为 N。"
      }
    },
    {
      "type": "lab",
      "heading": "用基函数积木合成信号——亲手验证“无效虚部”",
      "instruction": "调节 ReX[0]、ReX[2]、ImX[2] 和 ReX[16] 观察白点合成的时域波形如何随基函数积木叠加变化；然后拖动「ImX[0] 与 ImX[16]」滑块，验证这两个频点无论设成多大都不会改变合成波形。",
      "controls": [
        {
          "type": "slider",
          "id": "re0",
          "label": "ReX[0] (直流偏置 c_0)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "re2",
          "label": "ReX[2] (2周期余弦 c_2)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "im2",
          "label": "ImX[2] (2周期正弦 s_2)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "re16",
          "label": "ReX[16] (最高频余弦 c_16)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "imNull",
          "label": "ImX[0] 与 ImX[16] (无效虚部)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showParts",
          "label": "透视内部叠加的基函数分量",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 32;\n\nfunction render() {\n  const re0 = lab.values.re0;\n  const re2 = lab.values.re2;\n  const im2 = lab.values.im2;\n  const re16 = lab.values.re16;\n  const imNull = lab.values.imNull;\n  const showParts = !!lab.values.showParts;\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 44, padR = 20, padT = 24, padB = 26;\n  const pw = W - padL - padR;\n  const ph = H - padT - padB;\n  const midY = padT + ph / 2;\n  const scaleY = ph / 4.4;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let v = -2; v <= 2; v++) {\n    const y = midY - v * scaleY;\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(padL + pw, y);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.45)';\n    ctx.font = '10px monospace';\n    ctx.fillText((v > 0 ? '+' : '') + v.toFixed(0), 14, y + 3);\n  }\n  for (let i = 0; i <= N; i += 4) {\n    const x = padL + (i / N) * pw;\n    ctx.beginPath();\n    ctx.moveTo(x, padT);\n    ctx.lineTo(x, padT + ph);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath();\n  ctx.moveTo(padL, midY);\n  ctx.lineTo(padL + pw, midY);\n  ctx.stroke();\n\n  function drawComponent(fn, color, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 1.4;\n    if (dashed) ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const x = padL + (i / N) * pw;\n      const y = midY - fn(i) * scaleY;\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  if (showParts) {\n    drawComponent(function(i) { return re0; }, 'rgba(245,158,11,0.65)', true);\n    drawComponent(function(i) { return re2 * Math.cos(2 * Math.PI * 2 * i / N); }, 'rgba(56,189,248,0.65)', false);\n    drawComponent(function(i) { return im2 * Math.sin(2 * Math.PI * 2 * i / N); }, 'rgba(16,185,129,0.65)', false);\n    drawComponent(function(i) { return re16 * Math.cos(2 * Math.PI * 16 * i / N); }, 'rgba(236,72,153,0.6)', false);\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  const vals = [];\n  for (let i = 0; i < N; i++) {\n    const c0 = re0;\n    const c2 = re2 * Math.cos(2 * Math.PI * 2 * i / N);\n    const s2 = im2 * Math.sin(2 * Math.PI * 2 * i / N);\n    const c16 = re16 * Math.cos(2 * Math.PI * 16 * i / N);\n    const dead = imNull * (Math.sin(0) + Math.sin(2 * Math.PI * 16 * i / N));\n    const total = c0 + c2 + s2 + c16 + (Math.abs(dead) < 1e-12 ? 0 : dead);\n    vals.push(total);\n    const x = padL + (i / N) * pw;\n    const y = midY - total * scaleY;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  for (let i = 0; i < N; i++) {\n    const x = padL + (i / N) * pw;\n    const y = midY - vals[i] * scaleY;\n    ctx.strokeStyle = 'rgba(248,250,252,0.22)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(x, midY);\n    ctx.lineTo(x, y);\n    ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(x, y, 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('● 合成信号 x[i]', padL + 4, 15);\n  if (showParts) {\n    ctx.fillStyle = '#f59e0b'; ctx.fillText('--- ReX[0]·c0', padL + 115, 15);\n    ctx.fillStyle = '#38bdf8'; ctx.fillText('— ReX[2]·c2', padL + 220, 15);\n    ctx.fillStyle = '#10b981'; ctx.fillText('— ImX[2]·s2', padL + 320, 15);\n    ctx.fillStyle = '#ec4899'; ctx.fillText('— ReX[16]·c16', padL + 420, 15);\n  }\n\n  const avg = vals.reduce(function(a, b) { return a + b; }, 0) / N;\n  lab.setReadout('合成信号均值 = ' + avg.toFixed(2) + ' (即 ReX[0]=' + re0.toFixed(1) + ') | ImX[0]=ImX[16]=' + imNull.toFixed(1) + ' 对 s_0/s_16 的实际贡献 ≡ 0.000');\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（数组长度与索引）：做 N 点实数 DFT 时，频域数组 ReX[] 和 ImX[] 的长度都是 N/2 + 1（下标 0 到 N/2），而不是 N/2；同时必须牢记 ImX[0] 和 ImX[N/2] 恒等于 0，不能在里面塞有效信息。",
        "避坑 2（不要用肉眼去数高频波形）：当 k 接近 N/2 时，离散正余弦样点在图上看起来会非常破碎，甚至出现类似拍频的视觉假象；只要满足公式 cos(2πki/N) 与 sin(2πki/N)，它们在数学上依然是严谨正交的单一频率基函数。",
        "核心口诀：频率索引 k 就是“N 个采样点里包含的完整周期数”；k=0 的余弦决定信号直流均值，k=N/2 的余弦在 +1 与 -1 间交替震荡。"
      ]
    }
  ]
});
