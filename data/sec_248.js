window.__BOOK_REGISTER_SECTION__("sec_248", {
  "title": "破解谜团二：为何有些数据服从本福特定律，而另一些不服从？(Solving Mystery #2)",
  "intuition": "能否服从本福特定律，完全取决于对数域概率密度分布的“胖瘦”：只要它在对数轴上足够宽（远超 1 个数量级跨度），其频谱在整数频率 f=1 之前就会归零，从而消除首位数字概率的周期性振荡。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把“是否服从定律”翻译成“波形是否平坦”",
      "paragraphs": [
        "在上一节中我们已经知道，在对数坐标轴上，首位数字为 1 的概率曲线 `ost(g)` 可以表示为矩形脉冲串 `sf(g)` 与反向概率密度 `pdf(-g)` 的卷积：`ost(g) = sf(g) * pdf(-g)`。而且无论数据本身是否服从本福特定律，`ost(g)` 的平均值永远严格等于 `0.301`（即 `log10(2)`）。",
        "因此，**判断一组数字是否服从本福特定律，等价于判断 `ost(g)` 是一条 0.301 的水平直线，还是带有周期性起伏的振荡波**。为了在数学上彻底看清这一点，我们把卷积搬到频域，它就变成了极其简单的乘法运算：`OST(f) = SF(f) × PDF*(f)`。",
        "`ost(g)` 要想成为一条绝对平坦的直线，它就不能包含任何正弦振荡分量，也就是说在所有大于 0 的频率上 `OST(f)` 必须全为 0。由于 `sf(g)` 是周期为 1 的周期脉冲串，它的频谱 `SF(f)` **只在整数频率 `f = 0, 1, 2, 3, ...` 上才有非零脉冲**。这意味着，`SF(f)` 就像一把只卡在整数频率上的“筛子”，只要 `PDF(f)` 在这些整数频率处恰好全等于 0，乘积 `OST(f)` 的交流分量就会彻底消失。"
      ],
      "formula": {
        "expr": "OST(f) = SF(f) × PDF*(f)",
        "explain": "OST(f) 为首位数字概率曲线的频谱；SF(f) 是仅在整数频率 f=0,1,2,3... 处非零的脉冲频谱；PDF*(f) 是对数域概率密度函数 pdf(g) 傅里叶变换的共轭。当且仅当在 f=1,2,3... 处 PDF(f)=0 时，OST(f) 无交流分量，ost(g) 退化为 0.301 的平线。"
      }
    },
    {
      "type": "concept",
      "heading": "本福特定律合规定理与正反实例拆解",
      "paragraphs": [
        "基于上述频域乘积特性，本书给出了严谨的**本福特定律合规定理（Benford's Law Compliance Theorem）**：设 `P` 是在 B 进制线性数轴上生成数字的随机过程，`pdf(g)` 是其在 B 进制对数数轴上的概率密度函数，`PDF(f)` 是 `pdf(g)` 的傅里叶变换。则 `P` 生成的数字服从本福特定律，**当且仅当在所有非零整数频率（f = 1, 2, 3, ...）上均有 `PDF(f) = 0`**。",
        "我们来看图 34-5 给出的反例：一个对数域标准差 `σg = 0.25` 的窄正态分布，它的频域标准差高达 `σf = 1/(2π·σg) = 0.637`，衰减得非常慢。在 `f = 1` 处 `PDF(1)` 依然有不可忽视的能量（原书示例中 `PDF(1) = 0.349`），乘以采样脉冲 `SF(1) = 0.516` 后，就会在 `OST(1)` 处产生 `0.18` 的能量，最终导致 `ost(g)` 出现周期为 1、振幅为 0.18 的剧烈正弦波纹，严重偏离本福特定律。"
      ],
      "formula": {
        "expr": "σf = 1 / (2π · σg)",
        "explain": "高斯分布的傅里叶变换对偶公式：σg 是对数域概率密度的标准差（分布宽度），σf 是频域频谱的标准差。两者成反比，对数域越宽，频域越窄，在 f=1 处衰减越彻底。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验室 1：对数域展宽 vs 频域收缩“跷跷板”（含声学映射）",
      "instruction": "向右拖动“对数域标准差 σg”滑块，观察左下方 ost(g) 如何从剧烈振荡变为 0.301 平线，右侧 PDF(1) 如何归零；开启声音可将偏离振荡能量实时听出来。",
      "controls": [
        {
          "type": "slider",
          "id": "sigmaG",
          "label": "对数域标准差 σg",
          "min": 0.1,
          "max": 0.8,
          "step": 0.01,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showSF",
          "label": "叠加显示整数采样频谱 SF(f)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听振荡误差音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioCtx = null;\nlet osc1 = null;\nlet osc2 = null;\nlet gain1 = null;\nlet gain2 = null;\n\nfunction stopAudio() {\n  if (gain1 && audioCtx) gain1.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);\n  if (gain2 && audioCtx) gain2.gain.setTargetAtTime(0, audioCtx.currentTime, 0.03);\n}\n\nfunction updateAudio(ost1, ost2) {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  if (!audioCtx) audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n  if (!osc1) {\n    osc1 = audioCtx.createOscillator();\n    osc2 = audioCtx.createOscillator();\n    gain1 = audioCtx.createGain();\n    gain2 = audioCtx.createGain();\n    osc1.type = 'sine';\n    osc2.type = 'sine';\n    osc1.frequency.value = 261.63;\n    osc2.frequency.value = 523.25;\n    gain1.gain.value = 0;\n    gain2.gain.value = 0;\n    osc1.connect(gain1);\n    osc2.connect(gain2);\n    gain1.connect(audioCtx.destination);\n    gain2.connect(audioCtx.destination);\n    osc1.start();\n    osc2.start();\n  }\n  const g1 = Math.min(0.18, ost1 * 0.45);\n  const g2 = Math.min(0.08, ost2 * 0.35);\n  gain1.gain.setTargetAtTime(g1, audioCtx.currentTime, 0.04);\n  gain2.gain.setTargetAtTime(g2, audioCtx.currentTime, 0.04);\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const sg = lab.values.sigmaG;\n  const showSF = lab.values.showSF;\n  const sf = 1 / (2 * Math.PI * sg);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx0 = 24, lw = 320;\n  const rx0 = 388, rw = 308;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = -2; i <= 2; i++) {\n    const x = lx0 + ((i + 2) / 4) * lw;\n    ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, 218); ctx.stroke();\n  }\n  for (let f = 0; f <= 3; f++) {\n    const x = rx0 + (f / 3.3) * rw;\n    ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, 212); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('对数数轴 g (pdf(g) 与 ost(g))', lx0, 15);\n  ctx.fillText('频域 f (PDF(f) 与 OST(f)=SF×PDF*)', rx0, 15);\n\n  const pdfBaseY = 104;\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(lx0, pdfBaseY); ctx.lineTo(lx0 + lw, pdfBaseY); ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let px = 0; px <= lw; px += 2) {\n    const g = -2 + (px / lw) * 4;\n    const val = (1 / (sg * Math.sqrt(2 * Math.PI))) * Math.exp(-(g * g) / (2 * sg * sg));\n    const y = pdfBaseY - Math.min(78, val * 20);\n    if (px === 0) ctx.moveTo(lx0 + px, y);\n    else ctx.lineTo(lx0 + px, y);\n  }\n  ctx.stroke();\n\n  const sx1 = lx0 + ((-sg + 2) / 4) * lw;\n  const sx2 = lx0 + ((sg + 2) / 4) * lw;\n  ctx.strokeStyle = 'rgba(56,189,248,0.5)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(sx1, pdfBaseY); ctx.lineTo(sx1, pdfBaseY - 38); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(sx2, pdfBaseY); ctx.lineTo(sx2, pdfBaseY - 38); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('pdf(g)', lx0 + 4, 34);\n\n  const ostZeroY = 212;\n  const ostScale = 110;\n  const y301 = ostZeroY - 0.30103 * ostScale;\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(lx0, ostZeroY); ctx.lineTo(lx0 + lw, ostZeroY); ctx.stroke();\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(lx0, y301); ctx.lineTo(lx0 + lw, y301); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('0.301', lx0 + 4, y301 - 4);\n\n  const w0 = 0.30103;\n  const sfCoeffs = [w0];\n  const pdfInts = [1];\n  for (let k = 1; k <= 10; k++) {\n    sfCoeffs.push(2 * Math.sin(Math.PI * k * w0) / (Math.PI * k));\n    pdfInts.push(Math.exp(-2 * Math.PI * Math.PI * sg * sg * k * k));\n  }\n  const ost1 = Math.abs(sfCoeffs[1]) * pdfInts[1];\n  const ost2 = Math.abs(sfCoeffs[2]) * pdfInts[2];\n\n  const ostColor = ost1 < 0.02 ? '#10b981' : (ost1 < 0.08 ? '#f59e0b' : '#ec4899');\n  ctx.strokeStyle = ostColor;\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let px = 0; px <= lw; px += 2) {\n    const g = -2 + (px / lw) * 4;\n    let sum = w0;\n    for (let k = 1; k <= 10; k++) {\n      sum += sfCoeffs[k] * pdfInts[k] * Math.cos(2 * Math.PI * k * (g - 0.150515));\n    }\n    const y = ostZeroY - sum * ostScale;\n    if (px === 0) ctx.moveTo(lx0 + px, y);\n    else ctx.lineTo(lx0 + px, y);\n  }\n  ctx.stroke();\n  ctx.fillStyle = ostColor;\n  ctx.fillText('ost(g)', lx0 + 4, 134);\n\n  ctx.fillStyle = '#94a3b8';\n  for (let i = -2; i <= 2; i++) {\n    const x = lx0 + ((i + 2) / 4) * lw;\n    ctx.fillText(String(i), x - 4, 228);\n  }\n\n  const freqZeroY = 204;\n  const freqH = 152;\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(rx0, freqZeroY); ctx.lineTo(rx0 + rw, freqZeroY); ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let px = 0; px <= rw; px += 2) {\n    const f = (px / rw) * 3.3;\n    const val = Math.exp(-2 * Math.PI * Math.PI * sg * sg * f * f);\n    const y = freqZeroY - val * freqH;\n    if (px === 0) ctx.moveTo(rx0 + px, y);\n    else ctx.lineTo(rx0 + px, y);\n  }\n  ctx.stroke();\n\n  for (let k = 0; k <= 3; k++) {\n    const x = rx0 + (k / 3.3) * rw;\n    const sfMag = Math.abs(sfCoeffs[k]);\n    const ostMag = sfMag * pdfInts[k];\n    if (showSF) {\n      ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n      ctx.lineWidth = 2;\n      ctx.setLineDash([3, 3]);\n      ctx.beginPath(); ctx.moveTo(x, freqZeroY); ctx.lineTo(x, freqZeroY - sfMag * freqH); ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = '#f59e0b';\n      ctx.fillRect(x - 2.5, freqZeroY - sfMag * freqH - 2.5, 5, 5);\n    }\n    ctx.strokeStyle = k === 0 ? '#94a3b8' : ostColor;\n    ctx.lineWidth = 4;\n    ctx.beginPath(); ctx.moveTo(x, freqZeroY); ctx.lineTo(x, freqZeroY - ostMag * freqH); ctx.stroke();\n\n    const pyPdf = freqZeroY - pdfInts[k] * freqH;\n    ctx.fillStyle = k === 0 ? '#38bdf8' : ostColor;\n    ctx.beginPath(); ctx.arc(x, pyPdf, 4, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  for (let f = 0; f <= 3; f++) {\n    const x = rx0 + (f / 3.3) * rw;\n    ctx.fillText('f=' + f, x - 8, 222);\n  }\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('PDF(f)  σf=' + sf.toFixed(3), rx0 + rw - 110, 40);\n  if (showSF) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('虚线: SF(f)', rx0 + rw - 110, 56);\n  }\n  ctx.fillStyle = ostColor;\n  ctx.fillText('粗柱: OST(f)', rx0 + rw - 110, 72);\n\n  const status = ost1 < 0.02 ? '极佳（几乎无振荡，严格服从本福特定律）' : (ost1 < 0.08 ? '过渡态（存在轻微正弦波纹）' : '不服从（f=1 处存在显著能量泄露）');\n  lab.setReadout('σg = ' + sg.toFixed(2) + ' | σf = ' + sf.toFixed(3) + ' | PDF(1) = ' + pdfInts[1].toFixed(3) + ' | OST(1)振幅 = ' + ost1.toFixed(3) + ' → ' + status);\n  updateAudio(ost1, ost2);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "达标的两种截然不同机制：振荡过零 vs 平滑归零",
      "paragraphs": [
        "既然 `PDF(f)` 在 `f = 1, 2, 3, ...` 处全为 0 就能通过检验，那么什么样的 `pdf(g)` 才能做到这一点呢？原书在图 34-6 中指出了两条完全不同的路径：",
        "**路径一：振荡穿零型（图 34-6a/b，人造特例）**。如果 `pdf(g)` 在对数轴上存在间距恰好为整数的突变边缘或斜率不连续点（例如区间 `[-1, 1]`、总宽为 `2` 的矩形脉冲），它的傅里叶变换 `PDF(f)` 就是正弦震荡衰减函数（`sinc` 类函数），会周期性地穿过零点。只要边缘间距挑得准，零点就能精准落到 `f = 1, 2, 3, ...` 上。但这在自然界极少自发出现，多半是人为构造的数字游戏。",
        "**路径二：平滑衰减型（图 34-6c/d，自然界主旋律）**。绝大多数真实数据集的 `PDF(f)` 都是单调平滑下降的。关键只在于它**降到零的速度有多快**。正如我们在实验室 1 中看到的，当对数域宽度翻倍（`σg` 从 `0.25` 增大到 `0.50`），频域宽度立刻减半（`σf` 从 `0.637` 缩小到 `0.318`），使得 `PDF(f)` 在到达临界频率 `f = 1` 之前就已经几乎归零。",
        "由于频域临界点 `f = 1` 对应对数数轴上**周期为 1 的正弦波**，这就把神秘的本福特定律还原成了一句大白话结论（除少数非平滑或振荡型特例外）：**凡是在对数数轴上相对于“单位距离 1”足够宽的分布，都会服从本福特定律；而相对于单位距离太窄的分布，则不服从。**"
      ],
      "formula": {
        "expr": "Rect(g / W)  <--FT-->  sinc(π · f · W) = sin(π·f·W) / (π·f·W)",
        "explain": "宽度为 W 的矩形分布对应的频谱为 sinc 函数，其零点出现在 f = n / W（n=1,2,3...）。只有当 W 为正整数（如 W=1 或 W=2）时，零点才会覆盖所有非零整数频率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验室 2：两种“达标”路径对决（平滑高斯宽分布 vs 矩形脉冲 Sinc）",
      "instruction": "切换“矩形脉冲模式”与“平滑高斯模式”，拖动宽度滑块，观察矩形脉冲如何仅在整数宽度（1.00 或 2.00）时踩中全部整数零点，而高斯分布只要足够宽便稳定达标。",
      "controls": [
        {
          "type": "toggle",
          "id": "rectMode",
          "label": "切换为矩形脉冲模式 (Fig. 34-6a/b)",
          "value": false
        },
        {
          "type": "slider",
          "id": "width",
          "label": "对数域特征宽度 (高斯为 2σg / 矩形为全宽 W)",
          "min": 0.3,
          "max": 2.4,
          "step": 0.05,
          "value": 1,
          "unit": ""
        }
      ],
      "jsCode": "function draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const rectMode = lab.values.rectMode;\n  const span = lab.values.width;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx0 = 24, lw = 316;\n  const rx0 = 386, rw = 310;\n  const lBaseY = 202;\n  const rZeroY = 166;\n  const rScale = 126;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = -2; i <= 2; i++) {\n    const x = lx0 + ((i + 2) / 4) * lw;\n    ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, lBaseY); ctx.stroke();\n  }\n  for (let f = 0; f <= 3; f++) {\n    const x = rx0 + (f / 3.3) * rw;\n    ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, 210); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(rectMode ? '对数域 pdf(g)：矩形脉冲 (带宽 W=' + span.toFixed(2) + ')' : '对数域 pdf(g)：平滑高斯 (2σg=' + span.toFixed(2) + ')', lx0, 16);\n  ctx.fillText('频域 PDF(f)：检验 f=1, 2, 3 是否归零', rx0, 16);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(lx0, lBaseY); ctx.lineTo(lx0 + lw, lBaseY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(rx0, rZeroY); ctx.lineTo(rx0 + rw, rZeroY); ctx.stroke();\n\n  if (!rectMode) {\n    const sg = span / 2;\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let px = 0; px <= lw; px += 2) {\n      const g = -2 + (px / lw) * 4;\n      const val = (1 / (sg * Math.sqrt(2 * Math.PI))) * Math.exp(-(g * g) / (2 * sg * sg));\n      const y = lBaseY - Math.min(155, val * 56);\n      if (px === 0) ctx.moveTo(lx0 + px, y);\n      else ctx.lineTo(lx0 + px, y);\n    }\n    ctx.stroke();\n\n    const xL = lx0 + ((-sg + 2) / 4) * lw;\n    const xR = lx0 + ((sg + 2) / 4) * lw;\n    ctx.strokeStyle = 'rgba(245,158,11,0.7)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath(); ctx.moveTo(xL, lBaseY); ctx.lineTo(xL, lBaseY - 90); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(xR, lBaseY); ctx.lineTo(xR, lBaseY - 90); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('2σg = ' + span.toFixed(2), (xL + xR) / 2 - 26, lBaseY - 96);\n  } else {\n    const halfW = span / 2;\n    const rectH = Math.min(155, (1 / span) * 75);\n    const xL = lx0 + ((-halfW + 2) / 4) * lw;\n    const xR = lx0 + ((halfW + 2) / 4) * lw;\n    const topY = lBaseY - rectH;\n\n    ctx.fillStyle = 'rgba(56,189,248,0.16)';\n    ctx.fillRect(xL, topY, xR - xL, rectH);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    ctx.moveTo(lx0, lBaseY);\n    ctx.lineTo(xL, lBaseY);\n    ctx.lineTo(xL, topY);\n    ctx.lineTo(xR, topY);\n    ctx.lineTo(xR, lBaseY);\n    ctx.lineTo(lx0 + lw, lBaseY);\n    ctx.stroke();\n\n    const isIntSpan = Math.abs(span - Math.round(span)) < 0.03;\n    const edgeColor = isIntSpan ? '#10b981' : '#ec4899';\n    ctx.fillStyle = edgeColor;\n    ctx.beginPath(); ctx.arc(xL, topY, 4, 0, Math.PI * 2); ctx.fill();\n    ctx.beginPath(); ctx.arc(xR, topY, 4, 0, Math.PI * 2); ctx.fill();\n    ctx.fillText('边缘间距 W=' + span.toFixed(2), lx0 + lw / 2 - 38, Math.max(36, topY - 8));\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  for (let i = -2; i <= 2; i++) {\n    const x = lx0 + ((i + 2) / 4) * lw;\n    ctx.fillText(String(i), x - 4, 220);\n  }\n\n  function calcPDF(f) {\n    if (!rectMode) {\n      const sg = span / 2;\n      return Math.exp(-2 * Math.PI * Math.PI * sg * sg * f * f);\n    } else {\n      if (f < 1e-4) return 1;\n      return Math.sin(Math.PI * f * span) / (Math.PI * f * span);\n    }\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let px = 0; px <= rw; px += 2) {\n    const f = (px / rw) * 3.3;\n    const y = rZeroY - calcPDF(f) * rScale;\n    if (px === 0) ctx.moveTo(rx0 + px, y);\n    else ctx.lineTo(rx0 + px, y);\n  }\n  ctx.stroke();\n\n  const vals = [calcPDF(1), calcPDF(2), calcPDF(3)];\n  for (let k = 1; k <= 3; k++) {\n    const x = rx0 + (k / 3.3) * rw;\n    const v = vals[k - 1];\n    const y = rZeroY - v * rScale;\n    const pass = Math.abs(v) < 0.035;\n    ctx.fillStyle = pass ? '#10b981' : '#ec4899';\n    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();\n    ctx.fillText(v.toFixed(2), x - 11, v >= 0 ? y - 10 : y + 16);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  for (let f = 0; f <= 3; f++) {\n    const x = rx0 + (f / 3.3) * rw;\n    ctx.fillText('f=' + f, x - 8, 220);\n  }\n\n  const err = Math.sqrt(vals[0] * vals[0] + vals[1] * vals[1] + vals[2] * vals[2]);\n  let msg = '';\n  if (!rectMode) {\n    msg = err < 0.03 ? '宽分布平滑归零 → 稳定服从本福特定律' : '分布过窄，f=1 处仍残留能量 → 偏离本福特定律';\n  } else {\n    msg = err < 0.03 ? '精准命中全部整数零点！利用不连续边缘达标' : 'sinc 零点错开整数频率 → 偏离本福特定律';\n  }\n  lab.setReadout('PDF(1)=' + vals[0].toFixed(3) + ' | PDF(2)=' + vals[1].toFixed(3) + ' | PDF(3)=' + vals[2].toFixed(3) + ' → ' + msg);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "本福特定律充要条件在频域：当且仅当对数域概率密度 `pdf(g)` 的傅里叶变换 `PDF(f)` 在所有非零整数频率（f = 1, 2, 3, ...）处为 0 时，数字才严格服从本福特定律。",
        "记死核心尺度比：临界点 `f = 1` 对应对数轴上的单位距离 `1`。一般而言，对数域分布“宽”于单位距离 1 的数据集服从本福特定律，“窄”于单位距离 1 的则不服从。",
        "工程避坑（别拿窄动态范围数据做审计）：如果数据仅集中在同一数量级内（例如高斯分布 `σg = 0.25`），`PDF(1)` 会泄漏出高达 `0.349` 的频谱分量，导致首位数字出现明显周期性偏斜，此时用本福特定律去抓假账必然误报。",
        "小心人造特例的脆弱性：矩形脉冲等带整数间距尖锐边缘的分布虽能靠 `sinc` 振荡踩中整数零点，但只要宽度稍微偏离整数（如 W=1.1），全盘皆输；真实自然界的数据几乎全靠“宽且平滑衰减”来满足定理。"
      ]
    }
  ]
});
