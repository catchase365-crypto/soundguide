window.__BOOK_REGISTER_SECTION__("sec_165", {
  "title": "压扩技术：用非均匀量化省下 1/3 的比特率 (Companding)",
  "intuition": "利用人耳“对微弱声音敏感、对响亮声音迟钝”的对数听觉特性，把量化台阶改成“小信号密、大信号疏”，从而只用 8 比特就能达到 12 比特均匀量化的电话音质。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么通信要拼命省比特？人耳听觉的对数秘密",
      "paragraphs": [
        "在电信传输中，数据速率（Data Rate）直接决定了传输成本——**省下比特就等于省下真金白银**。**压扩（Companding）**（即先压缩 Compressing、接收端再扩展 Expanding）是一种通过让**量化台阶（Quantization Levels）不等距**来大幅压缩音频数据率的经典技术。",
        "它的物理根基来自人类听觉的奇妙特性：人耳能忍受的最响声音（120 dB SPL）与刚好能听见的最弱声音（0 dB SPL），两者在声波**振幅上相差整整 100 万倍**。然而，人耳无法分辨差距小于约 1 dB（即振幅变化约 12%）的两个声音。换句话说，在这跨越 100 万倍的巨大振幅范围内，人耳真正能区分的响度等级其实**只有约 120 个**，且它们是**按对数规律间隔**分布的。",
        "这对音频数字化至关重要：如果用传统的**均匀量化**（等距台阶）来满足小声音不失真且大声音不削波，至少需要 **12 比特**（4096 个台阶）才能达到电话级清晰度；但如果把量化台阶改成**小信号处极密、大信号处较疏**来匹配人耳特性，只需要 **8 比特**（256 个台阶）就能获得同等的听感质量，数据率直接砍掉 1/3！",
        "工程上有三种等效方法可以实现这种非线性压扩：（1）让模拟信号先经过一个非线性放大电路，再送入普通的线性 8 位 ADC；（2）直接使用内部步长不等距的专用 8 位 ADC；（3）先用线性 12 位 ADC 采样，再通过数字**查找表（LUT，12 位输入映射为 8 位输出）**完成压缩。三种方案本质完全相同，只是把非线性放到了模拟端、ADC 内部或数字端。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：均匀量化 vs μ-255 压扩（含实时听感对比）",
      "instruction": "把「信号幅度」调低（如 0.08），切换「开启 μ-255 压扩」，观察量化台阶密度变化并点击播放听取小信号底噪差异。",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "信号幅度 (满量程=1.0)",
          "min": 0.02,
          "max": 1,
          "step": 0.02,
          "value": 0.1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "量化位数",
          "min": 4,
          "max": 8,
          "step": 1,
          "value": 6,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "compand",
          "label": "开启 μ-255 压扩",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const MU = 255;\nfunction muCompress(x) {\n  const s = x < 0 ? -1 : 1;\n  return s * Math.log(1 + MU * Math.abs(x)) / Math.log(1 + MU);\n}\nfunction muExpand(y) {\n  const s = y < 0 ? -1 : 1;\n  return s * (Math.pow(1 + MU, Math.abs(y)) - 1) / MU;\n}\nfunction quantizeVal(val, bits) {\n  const levels = Math.pow(2, bits);\n  const step = 2 / levels;\n  let idx = Math.floor((val + 1) / step);\n  if (idx >= levels) idx = levels - 1;\n  if (idx < 0) idx = 0;\n  return -1 + (idx + 0.5) * step;\n}\nfunction processSample(x, bits, useCompand) {\n  if (useCompand) {\n    const c = muCompress(x);\n    const q = quantizeVal(c, bits);\n    return muExpand(q);\n  }\n  return quantizeVal(x, bits);\n}\n\nlet activeSource = null;\nfunction stopAudio() {\n  if (activeSource) {\n    try { activeSource.stop(); } catch (e) {}\n    activeSource = null;\n  }\n}\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const amp = lab.values.amp;\n  const bits = lab.values.bits;\n  const useCompand = lab.values.compand;\n  const levels = Math.pow(2, bits);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 48, padR = 16, padT = 24, padB = 22;\n  const waveW = 420;\n  const errX = 500;\n  const errW = W - errX - padR;\n  const plotH = H - padT - padB;\n  const midY = padT + plotH / 2;\n  const viewRange = Math.max(0.06, amp * 1.35);\n\n  function toY(v) {\n    return midY - (v / viewRange) * (plotH / 2);\n  }\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(padL, padT, waveW, plotH);\n  ctx.clip();\n\n  const step = 2 / levels;\n  for (let i = 0; i < levels; i++) {\n    const qLevel = -1 + (i + 0.5) * step;\n    const realLevel = useCompand ? muExpand(qLevel) : qLevel;\n    if (Math.abs(realLevel) <= viewRange * 1.05) {\n      const ly = toY(realLevel);\n      ctx.strokeStyle = useCompand ? 'rgba(16, 185, 129, 0.22)' : 'rgba(245, 158, 11, 0.25)';\n      ctx.lineWidth = 1;\n      ctx.beginPath();\n      ctx.moveTo(padL, ly);\n      ctx.lineTo(padL + waveW, ly);\n      ctx.stroke();\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath();\n  ctx.moveTo(padL, midY);\n  ctx.lineTo(padL + waveW, midY);\n  ctx.stroke();\n\n  const N = 320;\n  let sigPow = 0;\n  let errPow = 0;\n  const origPts = [];\n  const recPts = [];\n  const errPts = [];\n\n  for (let i = 0; i <= N; i++) {\n    const t = i / N;\n    const x = amp * Math.sin(2 * Math.PI * 2.5 * t);\n    const y = processSample(x, bits, useCompand);\n    const e = y - x;\n    sigPow += x * x;\n    errPow += e * e;\n    origPts.push([padL + t * waveW, toY(x)]);\n    recPts.push([padL + t * waveW, toY(y)]);\n    errPts.push(e);\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    if (i === 0) ctx.moveTo(origPts[i][0], origPts[i][1]);\n    else ctx.lineTo(origPts[i][0], origPts[i][1]);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = useCompand ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    if (i === 0) ctx.moveTo(recPts[i][0], recPts[i][1]);\n    else ctx.lineTo(recPts[i][0], recPts[i][1]);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.strokeRect(padL, padT, waveW, plotH);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillText('+' + viewRange.toFixed(2), padL - 5, padT + 9);\n  ctx.fillText('0', padL - 5, midY + 4);\n  ctx.fillText('-' + viewRange.toFixed(2), padL - 5, padT + plotH);\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('重建波形对比（横线 = 实际可用量化电平）', padL, 15);\n\n  const maxErr = Math.max(1e-5, ...errPts.map(Math.abs));\n  const errScale = Math.max(0.01, maxErr * 1.3);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath();\n  ctx.moveTo(errX, midY);\n  ctx.lineTo(errX + errW, midY);\n  ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.strokeRect(errX, padT, errW, plotH);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const px = errX + (i / N) * errW;\n    const py = midY - (errPts[i] / errScale) * (plotH / 2);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('量化误差波形 (最大 ±' + maxErr.toFixed(4) + ')', errX, 15);\n\n  const snr = errPow > 1e-12 ? 10 * Math.log10(sigPow / errPow) : 99;\n  const usedSet = new Set();\n  for (let i = 0; i <= N; i++) {\n    const x = amp * Math.sin(2 * Math.PI * 2.5 * (i / N));\n    usedSet.add(processSample(x, bits, useCompand).toFixed(6));\n  }\n  lab.setReadout(\n    (useCompand ? 'μ-255 压扩' : '均匀线性量化') +\n    ' | ' + bits + ' bit (总' + levels + '阶) | 信号占用台阶数: ' + usedSet.size +\n    ' | 信噪比 SNR: ' + snr.toFixed(1) + ' dB' +\n    (lab.values.play ? ' | 🔊 自动增益放大以凸显底噪' : '')\n  );\n\n  stopAudio();\n  if (lab.values.play) {\n    const actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    const sr = actx.sampleRate;\n    const len = Math.floor(sr * 1.0);\n    const buf = actx.createBuffer(1, len, sr);\n    const data = buf.getChannelData(0);\n    const agc = Math.min(10, 0.22 / Math.max(0.02, amp));\n    for (let i = 0; i < len; i++) {\n      const t = i / sr;\n      const raw = amp * Math.sin(2 * Math.PI * 330 * t);\n      const rec = processSample(raw, bits, useCompand);\n      data[i] = Math.max(-0.95, Math.min(0.95, rec * agc));\n    }\n    const src = actx.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    src.connect(actx.destination);\n    src.start();\n    activeSource = src;\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "两大工业标准：μ-255 律与 A 律曲线",
      "paragraphs": [
        "全球数字通信界形成过两大几乎等价的对数压扩标准：北美和日本采用 **μ-255 律（Mu-law）**，而欧洲及国际主流采用 **A 律（A-law）**。两者都使用对数非线性函数，因为对数运算恰好能把人耳的“等比响度间隔”映射成数字电路里的“等距量化间隔”。",
        "需要注意的是，两个公式在书面上只定义了非负输入 $0 \\le x \\le 1$ 的部分；当输入信号为负值（$-1 \\le x < 0$）时，曲线关于原点呈**奇对称**（即输出取负号，绝对值按正半轴计算）。从波形特性上看，压扩曲线的本质是：**小信号输入时斜率极大（先放大再量化），大信号输入时斜率变平（先压缩再量化）**。",
        "把两条曲线叠放在一起时，它们在整个动态范围内几乎完全重合；唯一肉眼可见的差异藏在**原点（零交叉点）附近**：μ 律全程保持光滑的对数过渡，而 A 律在 $|x| < 1/A$ 的极微弱信号区段切换为一条过原点的**直线**（避免对数曲线在零点附近增益过高而放大热噪声）。"
      ],
      "formula": {
        "expr": "μ-law: y = sgn(x) * ln(1 + μ|x|) / ln(1 + μ)   (μ = 255)\nA-law: y = sgn(x) * A|x| / (1 + ln(A))         (|x| ≤ 1/A, A = 87.6)\n       y = sgn(x) * (1 + ln(A|x|)) / (1 + ln(A)) (1/A < |x| ≤ 1)",
        "explain": "x 为归一化后的输入音频振幅（范围 [-1, 1]）；y 为压缩后的输出振幅（范围 [-1, 1]）；sgn(x) 为符号函数（保证正负对称）；常数 μ=255 和 A=87.6 决定了小信号被放大的陡峭程度。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：μ 律与 A 律曲线、零点放大镜及 16 折线逼近",
      "instruction": "打开「零点放大 20×」观察 μ 律与 A 律在原点的分歧，拖动「测试输入 x」查看小信号被放大的倍率与 8 比特编码字。",
      "controls": [
        {
          "type": "slider",
          "id": "xVal",
          "label": "测试输入 x",
          "min": -1,
          "max": 1,
          "step": 0.01,
          "value": 0.05,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "mu",
          "label": "μ 参数",
          "min": 1,
          "max": 255,
          "step": 1,
          "value": 255,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "zoom",
          "label": "零点放大 20× (对比 A/μ 律)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "cords",
          "label": "叠加 16 折线逼近 (Cords)",
          "value": false
        }
      ],
      "jsCode": "const A_CONST = 87.6;\nfunction muLaw(x, mu) {\n  if (mu <= 0.001) return x;\n  const s = x < 0 ? -1 : 1;\n  return s * Math.log(1 + mu * Math.abs(x)) / Math.log(1 + mu);\n}\nfunction aLaw(x) {\n  const s = x < 0 ? -1 : 1;\n  const ax = Math.abs(x);\n  const denom = 1 + Math.log(A_CONST);\n  if (ax < 1 / A_CONST) return s * (A_CONST * ax) / denom;\n  return s * (1 + Math.log(A_CONST * ax)) / denom;\n}\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const xVal = lab.values.xVal;\n  const mu = lab.values.mu;\n  const zoom = lab.values.zoom;\n  const showCords = lab.values.cords;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const xLim = zoom ? 0.05 : 1.0;\n  const yLim = zoom ? 0.5 : 1.0;\n  const plotX = 64, plotY = 20, plotW = 360, plotH = 196;\n  const cx = plotX + plotW / 2;\n  const cy = plotY + plotH / 2;\n\n  function mapX(x) { return cx + (x / xLim) * (plotW / 2); }\n  function mapY(y) { return cy - (y / yLim) * (plotH / 2); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = -4; i <= 4; i++) {\n    const gx = plotX + ((i + 4) / 8) * plotW;\n    const gy = plotY + ((i + 4) / 8) * plotH;\n    ctx.beginPath(); ctx.moveTo(gx, plotY); ctx.lineTo(gx, plotY + plotH); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(plotX, gy); ctx.lineTo(plotX + plotW, gy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath();\n  ctx.moveTo(plotX, cy); ctx.lineTo(plotX + plotW, cy);\n  ctx.moveTo(cx, plotY); ctx.lineTo(cx, plotY + plotH);\n  ctx.stroke();\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(plotX, plotY, plotW, plotH);\n  ctx.clip();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(mapX(-xLim), mapY(-xLim));\n  ctx.lineTo(mapX(xLim), mapY(xLim));\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const steps = 260;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const x = -xLim + (2 * xLim * i) / steps;\n    const px = mapX(x);\n    const py = mapY(aLaw(x));\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const x = -xLim + (2 * xLim * i) / steps;\n    const px = mapX(x);\n    const py = mapY(muLaw(x, mu));\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const bps = [0, 1/255, 3/255, 7/255, 15/255, 31/255, 63/255, 127/255, 1];\n  if (showCords) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.6;\n    for (const sign of [-1, 1]) {\n      ctx.beginPath();\n      for (let k = 0; k < bps.length; k++) {\n        const px = mapX(sign * bps[k]);\n        const py = mapY(sign * (k / 8));\n        if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n      }\n      ctx.stroke();\n      ctx.fillStyle = '#f59e0b';\n      for (let k = 1; k < bps.length; k++) {\n        ctx.beginPath();\n        ctx.arc(mapX(sign * bps[k]), mapY(sign * (k / 8)), 3, 0, Math.PI * 2);\n        ctx.fill();\n      }\n    }\n  }\n\n  const clampedX = Math.max(-xLim, Math.min(xLim, xVal));\n  const yMu = muLaw(xVal, mu);\n  const yA = aLaw(xVal);\n  if (Math.abs(xVal) <= xLim) {\n    const ptX = mapX(clampedX);\n    const ptY = mapY(yMu);\n    ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(ptX, cy); ctx.lineTo(ptX, ptY); ctx.lineTo(cx, ptY);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath();\n    ctx.arc(ptX, ptY, 5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(plotX, plotY, plotW, plotH);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillText('+' + yLim.toFixed(1), plotX - 6, plotY + 10);\n  ctx.fillText('0.0', plotX - 6, cy + 4);\n  ctx.fillText('-' + yLim.toFixed(1), plotX - 6, plotY + plotH);\n  ctx.textAlign = 'center';\n  ctx.fillText('-' + xLim.toFixed(2), plotX, plotY + plotH + 14);\n  ctx.fillText('输入 x', cx, plotY + plotH + 14);\n  ctx.fillText('+' + xLim.toFixed(2), plotX + plotW, plotY + plotH + 14);\n\n  const rx = 448;\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('实时压扩探测与 8-bit 编码', rx, 30);\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('■ μ 律 (μ=' + mu + '): y = ' + yMu.toFixed(3), rx, 56);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('■ A 律 (A=87.6): y = ' + yA.toFixed(3), rx, 76);\n  if (showCords) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('● 16 折线逼近 (8正 + 8负)', rx, 96);\n  }\n\n  const gain = Math.abs(xVal) > 1e-4 ? Math.abs(yMu / xVal) : (mu / Math.log(1 + mu));\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('当前小信号瞬时增益: ' + gain.toFixed(2) + '×', rx, 122);\n\n  const ax = Math.min(1, Math.abs(xVal));\n  let cordIdx = 0;\n  for (let k = 0; k < 8; k++) {\n    if (ax >= bps[k] && ax <= bps[k + 1]) { cordIdx = k; break; }\n  }\n  const span = bps[cordIdx + 1] - bps[cordIdx];\n  const stepIdx = Math.min(15, Math.floor(16 * (ax - bps[cordIdx]) / span));\n  const signBit = xVal >= 0 ? '1' : '0';\n  const cordBits = cordIdx.toString(2).padStart(3, '0');\n  const stepBits = stepIdx.toString(2).padStart(4, '0');\n\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(rx, 138, 252, 74);\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.strokeRect(rx, 138, 252, 74);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('μ-255 折线量化 8 位输出结构:', rx + 10, 158);\n  ctx.font = 'bold 16px monospace';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(signBit + '  ' + cordBits + '  ' + stepBits, rx + 10, 184);\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('符号(1b)  折线号(3b)  段内步长(4b)', rx + 10, 202);\n\n  lab.setReadout(\n    (zoom ? '零点放大视图 [-0.05, +0.05]' : '全局视图 [-1, +1]') +\n    ' | x = ' + xVal.toFixed(2) + ' → μ律 y = ' + yMu.toFixed(3) +\n    ' | 命中第 ' + cordIdx + ' 号折线, 步长 #' + stepIdx\n  );\n});"
    },
    {
      "type": "concept",
      "heading": "硬件落地的智慧：16 折线逼近（Cords）与 8 比特编码结构",
      "paragraphs": [
        "在数字计算还不便宜的年代，要在模拟电路里做出精确稳定的对数曲线非常困难。早期工程师曾尝试利用半导体 **pn 结二极管电压与电流的对数关系** 来构造压扩器，但二极管的特性受温度影响极大，不得不外加极其复杂的温漂补偿电路，得不偿失。",
        "因此，绝大多数实用压扩芯片采取了更聪明的**分段线性逼近**策略：用 **16 条首尾相连的直线段** 去近似光滑的对数曲线，这些直线段在工程上被称为 **折线（Cords / Chords）**（正半轴 8 段、负半轴 8 段）。",
        "这种 16 折线方案恰好完美映射到一个标准的 **8 比特输出字节**：\n- **第 1 比特（最高位）**：符号位，指示输入信号是正还是负；\n- **第 2~4 比特（中间 3 位）**：折线索引，用于从正半轴或负半轴的 **8 条折线** 中指明当前落在了哪一段（越靠近零点折线越短、斜率越陡）；\n- **第 5~8 比特（最低 4 位）**：段内精细刻度，把选中的那条折线再等分为 **16 个均匀小步长**。",
        "实际硬件中，集成压扩芯片内部往往采用专有精密电路或电容阵列来实现这种分段量化，工程师在设计电路时通常无需深究芯片内部晶体管拓扑，只需重点关注引脚定义与数据手册指标即可。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "核心收益：压扩利用人耳对数听觉特性，让小信号用密台阶、大信号用疏台阶，用 8 bit 实现了约 12 bit 均匀量化的语音信噪比（省下 33% 通信带宽）。",
        "标准兼容大坑：北美/日本用 μ-255 律，欧洲/中国国内电信干线用 A 律；跨国互通或解析语音流（如 G.711）时若搞混 μ-law 与 A-law，小信号段会出现明显的非线性失真。",
        "数字实现最简法：如果在现代 MCU/DSP 里做软件压扩，不必实时调用耗时的 `Math.log()` / `Math.exp()`，直接按 1+3+4 比特的折线规则做位运算，或建一个 4096 项的 12-to-8 位查找表（LUT）即可零开销完成。",
        "适用边界：压扩专为语音/音频的动态范围优化而设计，切勿直接对需要严格保持线性幅度的传感器测量信号或控制回路信号做压扩。"
      ]
    }
  ]
});
