window.__BOOK_REGISTER_SECTION__("sec_244", {
  "title": "1 缩放检验：如何识破伪装的本福特定律（The Ones Scaling Test）",
  "intuition": "仅仅统计首位数字为 1 的比例等于 30.1% 并不能证明数据服从本福特定律；只有把所有数据不断乘以 1.01 放大三个数量级，首位为 1 的比例依然稳如泰山地贴近 30.1%，才算通过了真正的“尺度不变性”大考。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么只看 30.1% 会被骗？——尺度不变性与 1 缩放检验",
      "paragraphs": [
        "给定一组数字，验证它是否服从本福特定律（Benford’s Law）最直观的做法是统计**首位数字（Leading Digit）为 1** 的数据占比。如果数据服从本福特定律，这个比例应该在 **0.301（30.1%）** 左右。",
        "但作者犀利地指出：**光凭 0.301 这个数值本身，远远不足以得出结论。** 举个极端的反例：假设一个数据集里只有两种数字——30.1% 的数字恰好是 `1.00`，另外 69.9% 的数字恰好是 `2.00`。如果你只做一次静态统计，首位为 1 的比例分毫不差地等于 `30.1%`，但它显然跟本福特定律毫无关系！",
        "破解之道在于引入**尺度不变性（Scale Invariance）**检验：把数据集里的每一个数都乘上同一个常数，再重新统计首位为 1 的占比。真正服从本福特定律的数据，无论你怎么缩放，首位为 1 的比例都应该始终维持在 `30.1%` 附近。",
        "为了系统化完成这项检验，作者在表 34-1 中设计了**1 缩放检验（The Ones Scaling Test, OST）**程序：设置一个循环 `696` 次的迭代过程，每一次循环都把数据集里的全部数字乘以微小的步长 `1.01`。第 80 次循环相当于乘以 `1.01^80 ≈ 2.217`；当 696 次循环全部跑完时，累计放大倍数达到 `1.01^696 ≈ 1000`——整整跨越了**三个数量级**！把每一步算出的“首位为 1 的比例”存进数组 `OST(K)`，就得到了一张揭示数据本质的体检心电图。"
      ],
      "formula": {
        "expr": "OST(k) = (1 / N) * Σ I( LD(x_i * 1.01^k) == 1 ),  k = 0, 1, ..., 696",
        "explain": "N 是测试样本总数（原书程序取 10,000）；x_i 是第 i 个原始数据；1.01^k 是第 k 步的累计缩放因子（当 k=696 时约为 1000）；LD(·) 提取数值的首位有效数字；指示函数 I(·) 在首位为 1 时计 1，否则计 0。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：三类数据集的 1 缩放检验（OST）实时对比",
      "instruction": "拖动“数据集类型”滑块切换均匀随机数、伪装集与本福特分布，拖动步数 K 或开启自动推进，观察 OST(K) 曲线如何暴露数据的真实面目。",
      "controls": [
        {
          "type": "slider",
          "id": "mode",
          "label": "数据集 (1=均匀随机 2=伪装集 3=本福特分布)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "kStep",
          "label": "缩放步数 K (累计乘数 1.01^K)",
          "min": 0,
          "max": 696,
          "step": 1,
          "value": 0,
          "unit": " 步"
        },
        {
          "type": "toggle",
          "id": "autoPlay",
          "label": "自动推进缩放步数 K",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 1500;\nconst KMAX = 696;\n\nfunction computeOST(mode) {\n  let seed = 987654321;\n  const rand = () => {\n    seed = (seed * 1664525 + 1013904223) >>> 0;\n    return seed / 4294967296;\n  };\n  const x = new Float64Array(N);\n  for (let i = 0; i < N; i++) {\n    let v = 1;\n    if (mode === 1) {\n      v = 0.0001 + 0.9998 * rand();\n    } else if (mode === 2) {\n      v = (i / N) < 0.301 ? 1.0 : 2.0;\n    } else {\n      v = Math.pow(10, rand() * 3);\n    }\n    while (v < 1) v *= 10;\n    while (v >= 10) v /= 10;\n    x[i] = v;\n  }\n  const ost = new Float32Array(KMAX + 1);\n  for (let k = 0; k <= KMAX; k++) {\n    let ones = 0;\n    for (let i = 0; i < N; i++) {\n      if (x[i] < 2) ones++;\n      x[i] *= 1.01;\n      if (x[i] >= 10) x[i] /= 10;\n    }\n    ost[k] = ones / N;\n  }\n  return ost;\n}\n\nconst curves = {\n  1: computeOST(1),\n  2: computeOST(2),\n  3: computeOST(3)\n};\n\nlet animK = null;\n\nfunction draw() {\n  const mode = lab.values.mode;\n  const autoPlay = lab.values.autoPlay;\n  const curK = (autoPlay && animK !== null) ? Math.floor(animK) : lab.values.kStep;\n  const ost = curves[mode];\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 56;\n  const padR = 24;\n  const padT = 24;\n  const padB = 34;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const maxY = 0.75;\n\n  const toX = (k) => padL + (k / KMAX) * plotW;\n  const toY = (v) => padT + (1 - v / maxY) * plotH;\n\n  // Grid lines\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  for (let v = 0; v <= 0.7; v += 0.1) {\n    const y = toY(v);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(W - padR, y);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.fillText(v.toFixed(1), padL - 8, y);\n  }\n\n  // Period vertical grid lines at 0, 232, 464, 696\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  [0, 232, 464, 696].forEach((kTick) => {\n    const x = toX(kTick);\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.beginPath();\n    ctx.moveTo(x, padT);\n    ctx.lineTo(x, padT + plotH);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.fillText('K=' + kTick, x, padT + plotH + 6);\n  });\n\n  // Benford 0.301 reference line\n  const y301 = toY(0.301);\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(padL, y301);\n  ctx.lineTo(W - padR, y301);\n  ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'bottom';\n  ctx.fillText('Benford 0.301', padL + 6, y301 - 3);\n\n  // Plot OST curve\n  const lineColor = mode === 1 ? '#38bdf8' : (mode === 2 ? '#ec4899' : '#10b981');\n  ctx.strokeStyle = lineColor;\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let k = 0; k <= KMAX; k++) {\n    const x = toX(k);\n    const y = toY(ost[k]);\n    if (k === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Current step marker\n  const cx = toX(curK);\n  const cy = toY(ost[curK]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx, padT);\n  ctx.lineTo(cx, padT + plotH);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath();\n  ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = lineColor;\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  // Title badge inside plot\n  const names = {\n    1: '均匀随机数 U(0,1)：在 11%~52% 间剧烈周期震荡',\n    2: '伪装集 (30.1%为1, 69.9%为2)：初始刚好0.301，一缩放立刻穿帮 (0 ~ 0.699)',\n    3: '对数均匀分布 (类税表数据)：全程稳定贴合 0.301 基准线'\n  };\n  ctx.fillStyle = lineColor;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.fillText(names[mode], padL + 6, 4);\n\n  const mult = Math.pow(1.01, curK);\n  const pct = (ost[curK] * 100).toFixed(1);\n  const modeTag = mode === 1 ? 'U(0,1)随机数' : (mode === 2 ? '1&2伪装集' : '本福特数据');\n  lab.setReadout('[' + modeTag + '] K=' + curK + ' | 累计乘数 1.01^K = ' + mult.toFixed(2) + 'x | 首位为1比例 OST(K) = ' + ost[curK].toFixed(3) + ' (' + pct + '%)');\n}\n\nlab.onUpdate(() => {\n  if (!lab.values.autoPlay) animK = null;\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.autoPlay) {\n    if (animK === null) animK = lab.values.kStep;\n    animK = (animK + dt * 55) % (KMAX + 1);\n    draw();\n  }\n});\n\ndraw();"
    },
    {
      "type": "concept",
      "heading": "十倍周期律与“首位数字提取器”的底层代码",
      "paragraphs": [
        "观察图 34-3（以及上面实验 1 中的均匀随机数曲线），你会发现一个非常奇妙的现象：**1 缩放检验曲线是严格周期性的！** 每当累计乘数达到 `10` 倍时，整个曲线的波形就会分毫不差地重演一次。在这个例子中，`1.01^232 ≈ 10`，所以周期恰好是 `232` 个数组元素（696 步正好包含 3 个完整周期）。",
        "原因非常简单：取一个数 `3.12345`，把它乘以 `10` 得到 `31.2345`。只要你只关心首位数字，这两个数在算法眼里**没有任何区别**，因此整个统计模式必然以 `10` 倍为周期循环往复。",
        "理解本福特定律物理机制的另一把钥匙，藏在表 34-1 的第 `400` 至 `430` 行——程序究竟是如何把任意一个数 `TESTX` 的首位数字 `LD` 抠出来的？它分四步走：",
        "1. **去符号（第 400 行）**：`TESTX = ABS(TESTX)`，先取绝对值消灭正负号。<br>2. **小于 1 就放大（第 410 行）**：`IF TESTX < 1 THEN TESTX = TESTX * 10: GOTO 410`，不断乘以 10 直到数值大于等于 1。<br>3. **大于等于 10 就缩小（第 420 行）**：`IF TESTX >= 10 THEN TESTX = TESTX / 10: GOTO 420`，不断除以 10 直到数值落入 `[1, 10)` 区间（即 `1` 到 `9.999999` 之间）。<br>4. **取整定音（第 430 行）**：`LD = INT(TESTX)`，直接截断小数部分，剩下的整数部分就是首位数字！凡是落入 `[1, 2)` 区间的数，其 `LD` 就等于 `1`。"
      ],
      "formula": {
        "expr": "P = log_1.01(10) = ln(10) / ln(1.01) ≈ 231.4 ≈ 232",
        "explain": "P 为 1 缩放检验的周期（以步数/数组下标计）。每当步长因子 1.01 连续自乘约 232 次，累计缩放倍数达到 10 倍，所有数字的归一化尾数完全复原。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：表 34-1 首位数字提取与“十倍周期”显微镜",
      "instruction": "调整初始数值 x₀ 与缩放步数 k，观察程序第 410–430 行如何将数值折叠进 [1, 10) 对数标尺，并验证每隔 232 步（10 倍）首位数字状态完全重演。",
      "controls": [
        {
          "type": "slider",
          "id": "x0",
          "label": "初始数值 x₀",
          "min": 1,
          "max": 9.9,
          "step": 0.1,
          "value": 3.1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "k",
          "label": "缩放步数 k (乘数 1.01^k)",
          "min": 0,
          "max": 464,
          "step": 1,
          "value": 0,
          "unit": " 步"
        },
        {
          "type": "toggle",
          "id": "showZone",
          "label": "高亮首位 LD=1 捕获区 [1, 2)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction normalize(val) {\n  let v = Math.abs(val);\n  let mulCount = 0;\n  let divCount = 0;\n  while (v < 1) { v *= 10; mulCount++; }\n  while (v >= 10) { v /= 10; divCount++; }\n  return { norm: v, ld: Math.floor(v), mulCount, divCount };\n}\n\nfunction draw() {\n  const x0 = lab.values.x0;\n  const k = lab.values.k;\n  const showZone = lab.values.showZone;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const raw = x0 * Math.pow(1.01, k);\n  const info = normalize(raw);\n  const isOne = info.ld === 1;\n\n  // Top section: Log-scale normalization ruler [1, 10)\n  const padL = 44;\n  const padR = 44;\n  const rulerW = W - padL - padR;\n  const rulerY = 66;\n  const rulerH = 30;\n\n  const logToX = (v) => padL + Math.log10(v) * rulerW;\n\n  ctx.fillStyle = 'rgba(248,250,252,0.85)';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.fillText('表 34-1 归一化标尺 [1, 10)（对数刻度：注意 [1, 2) 恰好占全长的 30.1%）', padL, 14);\n\n  // Ruler background\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(padL, rulerY, rulerW, rulerH);\n\n  // Highlight [1, 2) zone\n  if (showZone) {\n    const x1 = logToX(1);\n    const x2 = logToX(2);\n    ctx.fillStyle = isOne ? 'rgba(16,185,129,0.38)' : 'rgba(16,185,129,0.20)';\n    ctx.fillRect(x1, rulerY, x2 - x1, rulerH);\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 1.5;\n    ctx.strokeRect(x1, rulerY, x2 - x1, rulerH);\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'bottom';\n    ctx.fillText('LD=1 区间 (30.1%)', (x1 + x2) / 2, rulerY - 4);\n  }\n\n  // Ticks 1..10\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  for (let d = 1; d <= 10; d++) {\n    const tx = logToX(d);\n    ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(tx, rulerY);\n    ctx.lineTo(tx, rulerY + rulerH);\n    ctx.stroke();\n    ctx.fillStyle = d === 1 || d === 2 ? '#10b981' : 'rgba(248,250,252,0.7)';\n    ctx.fillText(String(d), tx, rulerY + rulerH + 5);\n  }\n\n  // Current normalized pointer\n  const px = logToX(info.norm);\n  ctx.strokeStyle = isOne ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(px, rulerY - 10);\n  ctx.lineTo(px, rulerY + rulerH + 2);\n  ctx.stroke();\n\n  ctx.fillStyle = isOne ? '#10b981' : '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(px, rulerY + rulerH / 2, 5, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.font = 'bold 12px monospace';\n  ctx.textAlign = px > W - 120 ? 'right' : 'left';\n  ctx.textBaseline = 'bottom';\n  ctx.fillText('TESTX=' + info.norm.toFixed(3) + ' (LD=' + info.ld + ')', px + (px > W - 120 ? -8 : 8), rulerY - 2);\n\n  // Bottom section: Periodicity timeline k = 0..464\n  const tTop = 148;\n  const tH = 52;\n  const tW = rulerW;\n  const kToX = (kk) => padL + (kk / 464) * tW;\n\n  ctx.fillStyle = 'rgba(248,250,252,0.85)';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'bottom';\n  ctx.fillText('2 个十倍周期内 (k = 0 ~ 464) 该数字首位是否为 1 的脉冲序列 (LD == 1)', padL, tTop - 6);\n\n  // Grid for k=0, 232, 464\n  [0, 232, 464].forEach((kt) => {\n    const gx = kToX(kt);\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(gx, tTop);\n    ctx.lineTo(gx, tTop + tH);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'top';\n    const label = kt === 0 ? 'k=0 (1x)' : (kt === 232 ? 'k=232 (~10x)' : 'k=464 (~100x)');\n    ctx.fillText(label, gx, tTop + tH + 5);\n  });\n\n  // Square wave of LD == 1\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let kk = 0; kk <= 464; kk++) {\n    const st = normalize(x0 * Math.pow(1.01, kk));\n    const yVal = st.ld === 1 ? tTop + 6 : tTop + tH - 6;\n    const xVal = kToX(kk);\n    if (kk === 0) ctx.moveTo(xVal, yVal);\n    else ctx.lineTo(xVal, yVal);\n  }\n  ctx.stroke();\n\n  // Cursor at k and twin cursor at k +- 232\n  const cx = kToX(k);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(cx, tTop - 2);\n  ctx.lineTo(cx, tTop + tH + 2);\n  ctx.stroke();\n\n  const twinK = k >= 232 ? k - 232 : k + 232;\n  const tx = kToX(twinK);\n  ctx.save();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(tx, tTop - 2);\n  ctx.lineTo(tx, tTop + tH + 2);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'bottom';\n  ctx.fillText('相差1周期 k=' + twinK, tx, tTop + tH / 2);\n\n  lab.setReadout('原始缩放值 = ' + raw.toFixed(3) + ' | 经 ' + info.divCount + ' 次 ÷10 归一化后 TESTX = ' + info.norm.toFixed(4) + ' | 首位 LD = ' + info.ld + (isOne ? ' [命中 LD=1]' : ' [未命中]'));\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（死循环陷阱）：表 34-1 第 410 行 `IF TESTX < 1 THEN TESTX = TESTX * 10: GOTO 410` 在输入数据恰好包含 `0` 时会陷入死循环！工程实现必须先剔除或单独处理零值。",
        "避坑 2（单点统计假象）：只检测一次“首位为 1 占比等于 30.1%”很容易被人为构造的数据欺骗，必须配合乘法缩放（尺度不变性检验）才能验明正身。",
        "直觉 3（十倍周期律）：当缩放步长为 `1.01` 时，由于 `1.01^232 ≈ 10`，且乘以 `10` 不改变首位数字，因此 `OST(K)` 必然呈现周期为 `232` 的循环。迭代 `696` 步相当于跨越 `1000` 倍（3 个周期），足以看清全貌。",
        "直觉 4（对数标尺的伏笔）：第 410–420 行的乘/除 `10` 操作本质上是把数字折叠到 `[1, 10)` 区间并取对数尾数，这也是下一节将本福特定律转化为**卷积**与**傅里叶变换**的核心突破口。"
      ]
    }
  ]
});
