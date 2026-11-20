window.__BOOK_REGISTER_SECTION__("sec_249", {
  "title": "深入剖析本福特定律的适用边界 (More on Following Benford’s Law)",
  "intuition": "本福特定律的神秘感本质上只是“对数尺度上的分布宽度”：只要数据集跨越了足够多的数量级（在频域中 PDF(f) 在 f=1 之前衰减到零），或者切换到一个更小的进制，数据就会自动显露出 k/n 的对数分布特征。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心揭秘：分布宽度决定一切",
      "paragraphs": [
        "上一节的“本福特定律合规性定理”得出了一个出人意料的结论：看似神秘的本福特定律，本质上竟然只与**分布宽度（distribution width）**有关。如图 34-7 所示，我们将“个人所得税数据”与“随机数生成器（RNG）数据”画在对数数轴上得到概率密度 `pdf(g)`，再分别对它们做傅里叶变换得到频域函数 `PDF(f)`。",
        "对比两者的傅里叶变换可以立刻看出命运的分水岭：税务数据的 `pdf(g)` 在对数轴上非常**宽广**，根据傅里叶变换“时域/空域越宽，频域越窄”的对偶性质，它的 `PDF(f)` 在 `f = 1` 之前就迅速衰减到了接近零，因此极好地遵循本福特定律；相反，RNG 数据的 `pdf(g)` 非常**狭窄**，导致其 `PDF(f)` 衰减缓慢，在 `f = 1` 处依然保有显著幅值，因此严重违背本福特定律。",
        "从“提取首位数字”的魔术视角来看，这个宽窄差异的物理直觉也非常直观：在以 10 为底的对数数轴上，1 个单位长度代表数值相差 10 倍。如果分布很宽，意味着数据跨越了远超 10 倍的量级（例如税务数据中最大数值约是最小数值的 100 万倍）。当我们把所有数乘除 10 的幂次缩放进 `[1, 9.99999]` 区间时，大数 `543,923,100` 要除以 `100,000,000`，而小数 `1,221` 只需除以 `1,000`。**不同量级的数经历了截然不同的缩放待遇**，这种差异化处理正好把“反对数规律”烙印进了数据里。",
        "反之，RNG 数据从 `-σ` 到 `+σ` 之间的最大数大约只有最小数的 4 倍，它们在数值上抱团取暖。提取首位数字时，绝大多数数被施以完全相同的操作（例如 `7.844026` 和 `1.230605` 都除以 `1`；聚在 `5,000` 附近的数全都除以 `1,000`）。由于几乎所有数受到同等对待，数据无法产生对数畸变，魔术自然就失灵了。"
      ],
      "formula": {
        "expr": "PDF(f) ≈ 0  (当 f = 1, 2, 3, ...)",
        "explain": "对于平滑单峰的对数分布 pdf(g)，其傅里叶变换 PDF(f) 必须在基频 f = 1 之前衰减到接近零，这等价于要求 pdf(g) 的宽度 σ_g 远大于对数坐标上的 1 个单位长度。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：对数分布宽度与频域合规性（复现图 34-7）",
      "instruction": "拖动“对数标准差 σ_g”滑块，观察左图分布跨越的数量级（-σ 到 +σ 跨度）如何实时控制右图频域 PDF(1) 的衰减。",
      "controls": [
        {
          "type": "slider",
          "id": "sigma",
          "label": "对数标准差 σ_g",
          "min": 0.1,
          "max": 1.5,
          "step": 0.05,
          "value": 0.25,
          "unit": " dec"
        },
        {
          "type": "slider",
          "id": "mu",
          "label": "对数中心位置 μ_g (10^μ)",
          "min": 0,
          "max": 6,
          "step": 0.5,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showGrid",
          "label": "显示数量级网格与 f=1,2,3 合规参考线",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const sigma = lab.values.sigma;\n  const mu = lab.values.mu;\n  const showGrid = lab.values.showGrid;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx0 = 28, lx1 = 345, lW = lx1 - lx0;\n  const rx0 = 395, rx1 = 695, rW = rx1 - rx0;\n  const yBase = 192;\n  const yTop = 48;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(370, 20); ctx.lineTo(370, H - 15);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('对数数轴 pdf(g)  [g = log10(x)]', lx0, 22);\n  ctx.fillText('频域变换 PDF(f) = |FT{pdf(g)}|', rx0, 22);\n\n  const gMin = -2, gMax = 8;\n  const gToX = (g) => lx0 + ((g - gMin) / (gMax - gMin)) * lW;\n\n  if (showGrid) {\n    ctx.font = '10px monospace';\n    for (let g = gMin; g <= gMax; g++) {\n      const x = gToX(g);\n      ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n      ctx.setLineDash([3, 3]);\n      ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBase); ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.fillText(String(g), x - 4, yBase + 14);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath(); ctx.moveTo(lx0, yBase); ctx.lineTo(lx1, yBase); ctx.stroke();\n\n  const rawPeak = 1 / (Math.sqrt(2 * Math.PI) * sigma);\n  const drawPeak = Math.min(132, Math.max(38, rawPeak * 85));\n\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const g = gMin + (i / 200) * (gMax - gMin);\n    const z = (g - mu) / sigma;\n    const val = Math.exp(-0.5 * z * z);\n    const x = gToX(g);\n    const y = yBase - val * drawPeak;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.stroke();\n\n  ctx.lineTo(lx1, yBase);\n  ctx.lineTo(lx0, yBase);\n  ctx.closePath();\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';\n  ctx.fill();\n\n  const xSigL = Math.max(lx0, gToX(mu - sigma));\n  const xSigR = Math.min(lx1, gToX(mu + sigma));\n  const ySpan = yBase - drawPeak * 0.606;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(xSigL, ySpan); ctx.lineTo(xSigR, ySpan);\n  ctx.moveTo(xSigL, ySpan - 4); ctx.lineTo(xSigL, ySpan + 4);\n  ctx.moveTo(xSigR, ySpan - 4); ctx.lineTo(xSigR, ySpan + 4);\n  ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('2σ_g 跨度', Math.min(lx1 - 60, Math.max(lx0, (xSigL + xSigR) / 2 - 24)), ySpan - 8);\n\n  const fMax = 3.2;\n  const fToX = (f) => rx0 + (f / fMax) * rW;\n  const pToY = (p) => yBase - p * 128;\n\n  if (showGrid) {\n    ctx.font = '10px monospace';\n    for (let f = 1; f <= 3; f++) {\n      const x = fToX(f);\n      ctx.strokeStyle = f === 1 ? 'rgba(245, 158, 11, 0.45)' : 'rgba(255,255,255,0.08)';\n      ctx.setLineDash([4, 3]);\n      ctx.beginPath(); ctx.moveTo(x, yTop); ctx.lineTo(x, yBase); ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = f === 1 ? '#f59e0b' : 'rgba(248,250,252,0.55)';\n      ctx.fillText('f=' + f, x - 9, yBase + 14);\n    }\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n  ctx.fillText('0', rx0 - 3, yBase + 14);\n  ctx.fillText('1.0', rx0 - 22, pToY(1) + 4);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath(); ctx.moveTo(rx0, yBase); ctx.lineTo(rx1, yBase); ctx.moveTo(rx0, yTop); ctx.lineTo(rx0, yBase); ctx.stroke();\n\n  const pdf1 = Math.exp(-2 * Math.PI * Math.PI * sigma * sigma);\n  const compliant = pdf1 < 0.05;\n  const curveColor = compliant ? '#10b981' : '#ec4899';\n\n  ctx.beginPath();\n  for (let i = 0; i <= 180; i++) {\n    const f = (i / 180) * fMax;\n    const val = Math.exp(-2 * Math.PI * Math.PI * sigma * sigma * f * f);\n    const x = fToX(f);\n    const y = pToY(val);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.strokeStyle = curveColor;\n  ctx.lineWidth = 2.5;\n  ctx.stroke();\n\n  ctx.lineTo(rx1, yBase);\n  ctx.lineTo(rx0, yBase);\n  ctx.closePath();\n  ctx.fillStyle = compliant ? 'rgba(16, 185, 129, 0.16)' : 'rgba(236, 72, 153, 0.16)';\n  ctx.fill();\n\n  const xF1 = fToX(1);\n  const yF1 = pToY(pdf1);\n  ctx.fillStyle = curveColor;\n  ctx.beginPath(); ctx.arc(xF1, yF1, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('PDF(1) = ' + pdf1.toFixed(3), xF1 + 8, Math.max(yTop + 12, yF1 - 6));\n\n  const spanRatio = Math.pow(10, 2 * sigma);\n  const ratioStr = spanRatio >= 1000 ? spanRatio.toExponential(1) : spanRatio.toFixed(1);\n  const status = pdf1 < 0.02 ? '高度遵循本福特定律 (类似税务数据)' : (pdf1 < 0.1 ? '处于临界过渡区' : '违背本福特定律 (类似RNG窄分布)');\n  lab.setReadout('σ_g = ' + sigma.toFixed(2) + ' dec | -σ到+σ跨度 = ' + ratioStr + '× | PDF(1) = ' + pdf1.toFixed(4) + ' → ' + status);\n});"
    },
    {
      "type": "concept",
      "heading": "换个进制看世界：为什么降低进制能“拯救”失败的数据？",
      "paragraphs": [
        "如果我们不在十进制（Base 10）下观察数据，而是切换到四进制（Base 4），会发生什么？四进制的对数数轴同样适用“本福特定律合规性定理”，唯一的变化在于**单位距离的长度**。",
        "在十进制对数坐标上，四进制的 1 个单位距离长度只有 `log10(4) = 0.602`；而在二进制下更是缩短到了 `log10(2) = 0.301`。这意味着分布不需要跨越 10 倍，只需远大于 4 倍（甚至 2 倍）就足够“宽”了！",
        "因此，对于 `PDF(f)` 平滑单调递减的常见分布而言，一条铁律成立：**转换成更低的进制，本福特定律总是遵循得更好；转换成更高的进制，则会遵循得更差。** 举例来说，原本表现完美的税务数据如果强行用 10,000 进制（或更高进制）来表示，单位距离瞬间放大 4 倍，它就不再遵循本福特定律；相反，在十进制下表现糟糕的 RNG 数据，只要转换到**二进制（Base 2）**，就会乖乖遵循本福特定律。"
      ],
      "formula": {
        "expr": "σ_B = σ_10 / log10(B),   PDF_B(1) = PDF_10(1 / log10(B))",
        "explain": "把分布转换到 B 进制后，等效标准差 σ_B 按 1/log10(B) 倍缩放。当 B 减小时（如 B=2），log10(B) 变小，等效分布被拉宽，等效评估频率 1/log10(B) 增大，PDF 更容易掉到零附近。"
      }
    },
    {
      "type": "concept",
      "heading": "进阶视角与 k/n 形式：破解二进制的“首位永远是 1”悖论",
      "paragraphs": [
        "看到“RNG 数据在二进制下遵循本福特定律”，敏锐的读者可能会立刻发现一个矛盾：**在二进制中，任何非零数字的首位数字永远都是 `1`**（例如 `1011`、`1.01`），那还谈什么“首位数字概率分布”呢？",
        "为了消除这类只盯着整数首位造成的死角，本福特定律有一个更高级、更本质的定义。平时我们求十进制首位数字分为两步：先反复乘除 `10`，把数字缩放到 `[1, 9.99999]` 区间；再取整数部分。高级定义**在第一步之后就停下来**，直接研究这些落在 `[1, 9.99999]` 之间的**修正数（modified numbers）**的概率密度函数 `a(n)`。",
        "在线性尺度上，只要数据遵循本福特定律，修正数 `n` 的概率密度函数必定严格等于 `a(n) = k / n`（其中 `k` 是保证曲线下面积为 1 的归一化常数，在十进制中 `k = 1 / ln(10)`）。想要计算修正数落在任意区间 `[p, q]` 内的比例，只需对 `a(n)` 求积分，结果恰好等于 `log(q) - log(p)`。比如十进制下首位数字为 `1`（即 `n ∈ [1, 2)`）的比例就是 `log10(2) - log10(1) = 0.301`，这就无缝退化回了传统的首位数字定理；而在二进制下，虽然整数首位全是 1，但修正数 `n ∈ [1, 2)` 的分布曲线依然完美贴合 `a(n) = k / n`！"
      ],
      "formula": {
        "expr": "a(n) = k / n,   ∫[p → q] a(n) dn = log_B(q) - log_B(p)",
        "explain": "a(n) 是修正数（缩放到 [1, B) 之间的数）在线性坐标上的概率密度函数。将其从 p 积分到 q，即可得到数值落在 [p, q] 区间的概率，且该比例在尺度缩放测试下保持不变。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：进制变换与修正数密度 a(n) = k/n 实时验证",
      "instruction": "保持十进制宽度 σ_10 = 0.25（RNG 违背状态），将“目标进制 B”从 10 逐步降到 2，观察左图实际分布如何贴合 k/n 曲线、右图 PDF_B(1) 如何归零。",
      "controls": [
        {
          "type": "slider",
          "id": "base",
          "label": "目标进制 B",
          "min": 2,
          "max": 16,
          "step": 1,
          "value": 10,
          "unit": " 进制"
        },
        {
          "type": "slider",
          "id": "sigma10",
          "label": "原始十进制宽度 σ_10",
          "min": 0.15,
          "max": 1.2,
          "step": 0.05,
          "value": 0.25,
          "unit": " dec"
        },
        {
          "type": "toggle",
          "id": "showIdeal",
          "label": "叠加理想本福特定律 a(n) = k/n",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const B = lab.values.base;\n  const sigma10 = lab.values.sigma10;\n  const showIdeal = lab.values.showIdeal;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const L = Math.log10(B);\n  const sigmaB = sigma10 / L;\n  const muB = 0.35 / L;\n  const lnB = Math.log(B);\n\n  function wrappedNormal(u, mu, sig) {\n    let sum = 0;\n    const invNorm = 1 / (Math.sqrt(2 * Math.PI) * sig);\n    const twoSig2 = 2 * sig * sig;\n    const center = Math.round(mu - u);\n    for (let m = center - 20; m <= center + 20; m++) {\n      const d = u + m - mu;\n      sum += Math.exp(-(d * d) / twoSig2);\n    }\n    return sum * invNorm;\n  }\n\n  const lx0 = 46, lx1 = 455, lW = lx1 - lx0;\n  const rx0 = 505, rx1 = 695, rW = rx1 - rx0;\n  const yBase = 192, yTop = 44, plotH = yBase - yTop;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(478, 20); ctx.lineTo(478, H - 15); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('线性尺度修正数密度 a(n)  [n ∈ 1 ~ ' + B + ']', lx0, 22);\n  ctx.fillText(B + '进制频域 PDF_B(f)', rx0, 22);\n\n  const Npts = 140;\n  const actualArr = [];\n  const idealArr = [];\n  let yMax = (1 / lnB) * 1.15;\n\n  for (let i = 0; i <= Npts; i++) {\n    const n = 1 + (i / Npts) * (B - 1);\n    const u = Math.log(n) / lnB;\n    const ideal = 1 / (n * lnB);\n    const actual = wrappedNormal(u, muB, sigmaB) * ideal;\n    actualArr.push({ n, val: actual });\n    idealArr.push({ n, val: ideal });\n    if (actual > yMax) yMax = actual * 1.08;\n  }\n\n  const nToX = (n) => lx0 + ((n - 1) / (B - 1)) * lW;\n  const aToY = (a) => yBase - (a / yMax) * plotH;\n\n  const nBins = Math.min(24, Math.max(10, B * 2));\n  for (let b = 0; b < nBins; b++) {\n    const nL = 1 + (b / nBins) * (B - 1);\n    const nR = 1 + ((b + 1) / nBins) * (B - 1);\n    const nMid = 0.5 * (nL + nR);\n    const uMid = Math.log(nMid) / lnB;\n    const aMid = wrappedNormal(uMid, muB, sigmaB) / (nMid * lnB);\n    const xL = nToX(nL) + 1;\n    const xR = nToX(nR) - 1;\n    const yV = aToY(aMid);\n    ctx.fillStyle = 'rgba(56, 189, 248, 0.24)';\n    ctx.fillRect(xL, yV, Math.max(1, xR - xL), yBase - yV);\n  }\n\n  if (B > 2) {\n    const x2 = nToX(2);\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath(); ctx.moveTo(x2, yTop); ctx.lineTo(x2, yBase); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('首位=1区间 [1,2)', lx0 + 4, yTop + 12);\n  } else {\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('二进制首位恒为1，看 [1, 2) 内部密度曲线!', lx0 + 8, yTop + 14);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath(); ctx.moveTo(lx0, yBase); ctx.lineTo(lx1, yBase); ctx.moveTo(lx0, yTop); ctx.lineTo(lx0, yBase); ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n  const tickStep = B <= 6 ? 1 : (B <= 12 ? 2 : 3);\n  for (let t = 1; t <= B; t += tickStep) {\n    const tx = nToX(t);\n    ctx.fillText(String(t), tx - 4, yBase + 14);\n  }\n  if ((B - 1) % tickStep !== 0) {\n    ctx.fillText(String(B), lx1 - 6, yBase + 14);\n  }\n\n  ctx.beginPath();\n  for (let i = 0; i <= Npts; i++) {\n    const x = nToX(actualArr[i].n);\n    const y = aToY(actualArr[i].val);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.stroke();\n\n  if (showIdeal) {\n    ctx.beginPath();\n    for (let i = 0; i <= Npts; i++) {\n      const x = nToX(idealArr[i].n);\n      const y = aToY(idealArr[i].val);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([6, 4]);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  const fMax = 2.2;\n  const fToX = (f) => rx0 + (f / fMax) * rW;\n  const pToY = (p) => yBase - p * 128;\n\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(fToX(1), yTop); ctx.lineTo(fToX(1), yBase); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px monospace';\n  ctx.fillText('f=1', fToX(1) - 9, yBase + 14);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('0', rx0 - 3, yBase + 14);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath(); ctx.moveTo(rx0, yBase); ctx.lineTo(rx1, yBase); ctx.moveTo(rx0, yTop); ctx.lineTo(rx0, yBase); ctx.stroke();\n\n  const pdfB1 = Math.exp(-2 * Math.PI * Math.PI * sigmaB * sigmaB);\n  const ok = pdfB1 < 0.05;\n  const col = ok ? '#10b981' : '#ec4899';\n\n  ctx.beginPath();\n  for (let i = 0; i <= 120; i++) {\n    const f = (i / 120) * fMax;\n    const val = Math.exp(-2 * Math.PI * Math.PI * sigmaB * sigmaB * f * f);\n    const x = fToX(f);\n    const y = pToY(val);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.strokeStyle = col;\n  ctx.lineWidth = 2.5;\n  ctx.stroke();\n\n  const x1 = fToX(1), y1 = pToY(pdfB1);\n  ctx.fillStyle = col;\n  ctx.beginPath(); ctx.arc(x1, y1, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 10px monospace';\n  ctx.fillText('PDF_B(1)=' + pdfB1.toFixed(3), x1 + 6, Math.max(yTop + 12, y1 - 6));\n\n  const pLead1 = (Math.log(2) / lnB).toFixed(3);\n  lab.setReadout('B=' + B + ' 进制 | 等效宽度 σ_B=' + sigmaB.toFixed(2) + ' | PDF_B(1)=' + pdfB1.toFixed(4) + ' | 理想[1,2)占比=' + pLead1 + ' → ' + (ok ? '贴合 k/n 曲线!' : '偏离 k/n'));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "本福特定律不是玄学，本质是“分布宽度 vs 对数单位距离”的比值：数据必须跨越足够多数量级，才能让不同量级的数受到差异化的缩放处理，从而印出反对数规律。",
        "用算法检验一段实测数据是否适用本福特定律时，不能只看数据量多少（哪怕一万个随机数，只要集中在一个窄区间内依然不遵循），必须检查其对数直方图的跨度或频域 `PDF(1)` 是否趋近于零。",
        "进制切换是一把双刃剑：把数据转换到更低的进制（如 Base 2 或 Base 4）更容易遵循本福特定律；转换到极高的进制（如 Base 10,000）则会破坏合规性。",
        "遇到二进制（首位永远是 1）或其他非整数基数问题时，请抛弃“取整数首位”的初级做法，改用缩放到 `[1, B)` 的**修正数概率密度 `a(n) = k / n`** 来进行通用验证。"
      ]
    }
  ]
});
