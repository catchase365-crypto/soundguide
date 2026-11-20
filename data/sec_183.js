window.__BOOK_REGISTER_SECTION__("sec_183", {
  "title": "图像信噪比与量子极限 (Signal-to-Noise Ratio)",
  "intuition": "能否在噪点中看清目标，不取决于噪声绝对有多大，而取决于信号对比度与噪声标准差的比值（SNR）、目标占据的像素面积，以及成像链路中最缺粒子的瓶颈环节（量子沉）。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、人眼极限 vs 数据极限：对比度与最小可检测 SNR",
      "paragraphs": [
        "图像中的物体之所以能被看见，是因为它与周围背景存在**亮度差异（对比度，Contrast）**。信号（物体的对比度）必须压过图像噪声才能被分辨。这一限制可分为两大类：**人眼的局限性**与**数据本身的局限性**。",
        "原书图 25-7 展示了人眼的检测极限：取决于环境光照、观察距离与显示介质（显示器、照片或半色调印刷），人眼最小只能察觉约 **0.5% 到 5%** 的对比度——换句话说，在纯黑（0%）到纯白（100%）之间，人类大约只能区分 **20 到 200 个灰阶**。",
        "如果目标对比度太低只是受限于人眼，我们可以用第 23 章学过的**灰度变换（Grayscale Transform）**拉伸特定亮度区间的对比度（以牺牲其他亮度区的对比度为代价）。但**如果对比度已经被淹没在随机图像噪声里**，任何灰度拉伸都无济于事——此时**数据本身不包含足够的信息**来揭示物体。",
        "如图 25-8 所示，当背景充满标准差为 `10%` 对比度的高斯随机噪声时，对比度分别为 `5%`、`10%`、`20%` 的三个方块对应的信噪比分别为 `0.5`、`1.0` 和 `2.0`。工程经验表明：**当 SNR 跌破约 1.0 时，目标检测就会陷入困境**。"
      ],
      "formula": {
        "expr": "SNR = C / σ_noise",
        "explain": "C 为目标相对背景的对比度（信号强度），σ_noise 为背景随机噪声的标准差。当 SNR ≥ 1.0 时目标通常开始变得可辨识。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：低信噪比目标探测、空间平滑与扫描线听觉化",
      "instruction": "把对比度调到 5%～10% 制造 SNR < 1.0 的困境，对比右侧 1D 扫描线与左侧 2D 图像，再增大「空间平滑核」或「目标尺寸」，或点击播放听听噪声中的脉冲信号如何浮现。",
      "controls": [
        {
          "type": "slider",
          "id": "contrast",
          "label": "目标对比度 (C)",
          "min": 2,
          "max": 30,
          "step": 1,
          "value": 10,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "noiseStd",
          "label": "噪声标准差 (σ)",
          "min": 2,
          "max": 25,
          "step": 1,
          "value": 10,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "objSize",
          "label": "目标边长",
          "min": 8,
          "max": 44,
          "step": 2,
          "value": 22,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "kernel",
          "label": "空间平滑核 (K×K)",
          "min": 1,
          "max": 7,
          "step": 2,
          "value": 1,
          "unit": " px"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 听扫描线噪声与脉冲",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst G = 64;\nlet seed = 202505;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return (seed + 0.5) / 4294967296;\n}\nconst noiseGrid = new Float32Array(G * G);\nfor (let i = 0; i < G * G; i += 2) {\n  const u1 = Math.max(1e-7, rand());\n  const u2 = rand();\n  const r = Math.sqrt(-2 * Math.log(u1));\n  noiseGrid[i] = r * Math.cos(2 * Math.PI * u2);\n  if (i + 1 < G * G) noiseGrid[i + 1] = r * Math.sin(2 * Math.PI * u2);\n}\nconst raw = new Float32Array(G * G);\nconst tmp = new Float32Array(G * G);\nconst out = new Float32Array(G * G);\nlet activeSource = null;\n\nfunction updateAudio(isPlaying, contrast, noiseStd, objSize, kernel) {\n  if (activeSource) {\n    try { activeSource.stop(); activeSource.disconnect(); } catch (e) {}\n    activeSource = null;\n  }\n  if (!isPlaying) return;\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  const sr = ac.sampleRate;\n  const buf = ac.createBuffer(1, sr, sr);\n  const ch = buf.getChannelData(0);\n  const period = 128;\n  const pulseW = Math.max(4, Math.round((objSize / G) * period));\n  const dc = pulseW / period;\n  const sigAmp = (contrast / 100) * 0.55;\n  const nStd = ((noiseStd / 100) / kernel) * 0.45;\n  for (let i = 0; i < sr; i++) {\n    const ph = i % period;\n    const inPulse = (ph < pulseW ? 1 : 0) - dc;\n    const u1 = Math.max(1e-7, Math.random());\n    const u2 = Math.random();\n    const gNoise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);\n    const sVal = (inPulse * sigAmp + gNoise * nStd) * 0.35;\n    ch[i] = Math.max(-0.85, Math.min(0.85, sVal));\n  }\n  const src = ac.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(ac.destination);\n  src.start();\n  activeSource = src;\n}\n\nfunction draw() {\n  const { contrast, noiseStd, objSize, kernel, play } = lab.values;\n  const half = objSize / 2;\n  const c0 = G / 2;\n  const bg = 0.42;\n  const sig = contrast / 100;\n  const nAmp = noiseStd / 100;\n  for (let y = 0; y < G; y++) {\n    for (let x = 0; x < G; x++) {\n      const inBox = Math.abs(x - c0 + 0.5) < half && Math.abs(y - c0 + 0.5) < half;\n      raw[y * G + x] = bg + (inBox ? sig : 0) + nAmp * noiseGrid[y * G + x];\n    }\n  }\n  const rad = (kernel - 1) >> 1;\n  if (rad === 0) {\n    out.set(raw);\n  } else {\n    for (let y = 0; y < G; y++) {\n      for (let x = 0; x < G; x++) {\n        let sum = 0;\n        for (let dx = -rad; dx <= rad; dx++) {\n          const xx = Math.max(0, Math.min(G - 1, x + dx));\n          sum += raw[y * G + xx];\n        }\n        tmp[y * G + x] = sum / kernel;\n      }\n    }\n    for (let y = 0; y < G; y++) {\n      for (let x = 0; x < G; x++) {\n        let sum = 0;\n        for (let dy = -rad; dy <= rad; dy++) {\n          const yy = Math.max(0, Math.min(G - 1, y + dy));\n          sum += tmp[yy * G + x];\n        }\n        out[y * G + x] = sum / kernel;\n      }\n    }\n  }\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const imgX = 18, imgY = 28, cell = 3;\n  for (let y = 0; y < G; y++) {\n    for (let x = 0; x < G; x++) {\n      const v = Math.max(0, Math.min(1, out[y * G + x]));\n      const g = Math.round(v * 255);\n      ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';\n      ctx.fillRect(imgX + x * cell, imgY + y * cell, cell, cell);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(imgX, imgY, G * cell, G * cell);\n\n  const scanY = imgY + (G / 2) * cell + 1.5;\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(imgX - 6, scanY);\n  ctx.lineTo(imgX + G * cell + 10, scanY);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const px = 238, py = 28, pw = 464, ph = 192;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(px, py, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gy = py + (ph * i) / 4;\n    ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n  }\n  for (let i = 0; i <= 8; i++) {\n    const gx = px + (pw * i) / 8;\n    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (let x = 0; x < G; x++) {\n    const inBox = Math.abs(x - c0 + 0.5) < half;\n    const v = bg + (inBox ? sig : 0);\n    const sx = px + (x + 0.5) * (pw / G);\n    const sy = py + ph - Math.max(0, Math.min(1, v)) * ph;\n    if (x === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  const pts = [];\n  for (let x = 0; x < G; x++) {\n    const v = Math.max(0, Math.min(1, out[(G / 2) * G + x]));\n    const sx = px + (x + 0.5) * (pw / G);\n    const sy = py + ph - v * ph;\n    pts.push([sx, sy]);\n    if (x === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  for (let i = 0; i < pts.length; i++) {\n    ctx.fillRect(pts[i][0] - 1.5, pts[i][1] - 1.5, 3, 3);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('2D 含噪图像 (' + G + '×' + G + ')', imgX, 18);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('中心行 1D 剖面 (蓝: 实际像素  橙虚线: 理想目标)', px, 18);\n\n  const rawSnr = contrast / noiseStd;\n  const effSnr = kernel <= objSize ? rawSnr * kernel : rawSnr * (objSize * objSize) / kernel;\n  const status = effSnr < 1.0 ? '⚠️ SNR < 1.0 (极难分辨)' : effSnr < 2.0 ? '⚡ 临界可辨' : '✅ 清晰可辨';\n  lab.setReadout('原始单像素 SNR = ' + rawSnr.toFixed(2) + '  |  ' + kernel + '×' + kernel + ' 平滑后有效 SNR ≈ ' + effSnr.toFixed(2) + '  |  目标等效 SNR ∝ 直径 (' + objSize + ' px)  |  ' + status);\n  updateAudio(play, contrast, noiseStd, objSize, kernel);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "二、为什么大目标更容易看见？空间平滑与大脑的秘密",
      "paragraphs": [
        "最小可检测 SNR 的精确阈值高度依赖**物体的尺寸**：物体越大，就越容易在噪声中被认出来。",
        "背后的数学非常直觉：想象对图 25-8 用一个 `3×3` 的方形均值滤波核做平滑处理。它不会改变平坦目标内部与背景之间的亮度对比度，却能把随机噪声的标准差压低 `√9 = 3` 倍，从而让 **SNR 整整翻 3 倍**。同理，`5×5` 的滤波核包含 25 个像素，能把 SNR 提升 `√25 = 5` 倍。",
        "这个策略可以一直放大，**直到滤波核尺寸等于待检测物体的尺寸为止**（再大就会把背景混入目标，反而稀释对比度）。因此，**人类或算法检测物体的能力与物体面积的平方根成正比——如果把物体的直径翻倍，它就能在两倍强的噪声中被认出来**。",
        "这也是为什么你在上一个实验的右侧 1D 扫描线里几乎找不到 SNR = 0.5 或 1.0 的方块，但在左侧 2D 图像里却能一眼看穿：大脑的视觉皮层天生就在用不同尺度的“二维滤波核”对视野进行并行平滑！想真正体会人类视觉系统有多强悍，不妨试着自己写几行代码去自动识别 SNR < 1.0 的目标——你会对大脑感到深深的敬畏。"
      ],
      "formula": {
        "expr": "SNR_out = √(K²) · SNR_in = K · SNR_in   (当 K ≤ 目标边长)",
        "explain": "K 为方形均值滤波核的边长（包含 K² 个像素），SNR_in 为单像素原始信噪比，SNR_out 为平滑后的有效信噪比。"
      }
    },
    {
      "type": "concept",
      "heading": "三、随机图像噪声的两种面孔：恒定电路噪声 vs 泊松计数噪声",
      "paragraphs": [
        "随机图像噪声通常有两种截然不同的形态（原书图 25-9）：",
        "1. **恒定幅度噪声（Constant Amplitude Noise）**：图像暗部和亮部一样吵。常见来源是**视频前置放大器（Video Preamplifier）**。所有模拟电路都会产生噪声，而在信号最微弱的传感器输出端（CCD 出口处）危害最大。它源于晶体管中电子的随机热运动，噪声大小只取决于电路设计，**与当前像素有多亮无关**。典型 CCD 相机的前放信噪比约为 **300 到 1000（40 到 60 dB）**，定义为满量程信号除以恒定噪声标准差。",
        "2. **随信号增大的噪声（泊松统计 / 计数统计噪声）**：亮部比暗部噪点更剧烈！这发生在图像由**有限数量的离散粒子**（如穿过病人的 X 射线光子、进入镜头的可见光光子、CCD 势阱中的电子）构成时。假设均匀光照下每个 CCD 像素势阱平均产生 10,000 个电子，纯粹出于随机涨落，有的阱多几个、有的阱少几个，服从**泊松统计（Poisson Statistics）**。",
        "**一个关键且反直觉的结论**：在泊松分布下，均值是 `N`，标准差是 `√N`，因此 `SNR = N / √N = √N`。当电子数从 1 万涨到 100 万时，绝对噪声 `σ` 从 100 **增大**到了 1,000（亮部看起来抖动更大）；但信号增长得比噪声更快，**SNR 反而从 100 提升到了 1,000**！千万不要误以为“调低信号强度能减少噪声从而得到更好图像”——我们的目标不是单纯减小噪声，而是从噪声中提取信号，**SNR 才是唯一核心指标**。"
      ],
      "formula": {
        "expr": "μ = N,   σ = √N,   SNR = N / √N = √N",
        "explain": "N 为单个像素捕获的平均粒子（光子/电子）数，μ 为信号均值，σ 为随机计数涨落的标准差。粒子越多，绝对噪声 √N 越大，但信噪比 √N 也越高。"
      }
    },
    {
      "type": "concept",
      "heading": "四、多级成像系统的瓶颈：“量子沉”（Quantum Sink）",
      "paragraphs": [
        "现实中的高端成像系统往往经历多次粒子转换。以医用 X 射线成像为例：X 射线管中的**电子**撞击金属靶产生 **X 射线** -> 穿过人体后打入影像增强器转换成**可见光光子** -> 再转为**电子** -> 又转为**可见光光子** -> 最终进入相机变成 CCD 势阱中的**电子**。",
        "在每一个中间形态，图像都只由有限数量的粒子携带，每一级都会依照泊松公式引入随机噪声。最终的整机信噪比由所有环节共同决定，但通常**某一个环节会起到决定性主导作用——这就是粒子数最少、SNR 最差的那一级，称为“量子沉”（Quantum Sink）**。",
        "在夜视仪中，量子沉就是镜头能捕获到的极少数可见光光子（夜越黑，图像越噪）；在医用 X 射线成像中，量子沉就是到达探测器的 X 射线光子数（提高辐射剂量可以得到更干净的图像，代价是病人承受更多辐射）。",
        "那么，泊松噪声与前放电路噪声谁占主导？拿前放 `SNR = 300`（噪声为满量程的 1/300）的典型 CCD 相机举例：当量子沉每个像素只有 `N = 300² = 90,000` 个粒子时，泊松噪声恰好等于前放噪声。**粒子数小于 90,000 时，泊松噪声主导；大于 90,000 时，前放电路噪声主导**。因此主流 CCD 的满阱容量通常设计在 **100,000 到 1,000,000 个电子**，正是为了把泊松噪声压到电路噪声以下。"
      ],
      "formula": {
        "expr": "N_cross = (SNR_preamp)²",
        "explain": "SNR_preamp 为前置放大器满量程信噪比，N_cross 为泊松量子噪声与电路恒定噪声打成平手时的临界粒子数。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：恒定电路噪声 vs 泊松粒子噪声与“量子沉”模拟",
      "instruction": "拖动「量子沉粒子数」滑块观察暗部与亮部噪点幅度的差异，对比每级阶梯上的实际 SNR，并切换「叠加前放电路噪声」体验 90,000 粒子交叉阈值。",
      "controls": [
        {
          "type": "slider",
          "id": "logN",
          "label": "量子沉满量程粒子数 (10^x)",
          "min": 1.5,
          "max": 5.5,
          "step": 0.1,
          "value": 3.3,
          "unit": " log10(N)"
        },
        {
          "type": "slider",
          "id": "preampSnr",
          "label": "前放电路 SNR (满量程/σ)",
          "min": 50,
          "max": 800,
          "step": 50,
          "value": 300,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showPreamp",
          "label": "叠加前放恒定电路噪声",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst GW = 64, GH = 48;\nlet seed = 98765;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return (seed + 0.5) / 4294967296;\n}\nconst noiseGrid = new Float32Array(GW * GH);\nfor (let i = 0; i < GW * GH; i += 2) {\n  const u1 = Math.max(1e-7, rand());\n  const u2 = rand();\n  const r = Math.sqrt(-2 * Math.log(u1));\n  noiseGrid[i] = r * Math.cos(2 * Math.PI * u2);\n  if (i + 1 < GW * GH) noiseGrid[i + 1] = r * Math.sin(2 * Math.PI * u2);\n}\nconst levels = [0.15, 0.40, 0.65, 0.90];\n\nfunction draw() {\n  const { logN, preampSnr, showPreamp } = lab.values;\n  const maxN = Math.pow(10, logN);\n  const preampStd = showPreamp ? (1 / preampSnr) : 0;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const imgX = 18, imgY = 30, cw = 3.5, ch = 3.75;\n  const rowTrace = new Float32Array(GW);\n  const midY = 24;\n\n  for (let y = 0; y < GH; y++) {\n    for (let x = 0; x < GW; x++) {\n      const b = Math.min(3, Math.floor((x / GW) * 4));\n      const lvl = levels[b];\n      const poissonStd = Math.sqrt(lvl / maxN);\n      const totStd = Math.sqrt(poissonStd * poissonStd + preampStd * preampStd);\n      const v = Math.max(0, Math.min(1, lvl + totStd * noiseGrid[y * GW + x]));\n      if (y === midY) rowTrace[x] = v;\n      const g = Math.round(v * 255);\n      ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';\n      ctx.fillRect(imgX + x * cw, imgY + y * ch, Math.ceil(cw), Math.ceil(ch));\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(imgX, imgY, GW * cw, GH * ch);\n\n  const scanY = imgY + midY * ch + ch * 0.5;\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.4;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(imgX - 6, scanY); ctx.lineTo(imgX + GW * cw + 8, scanY); ctx.stroke();\n  ctx.setLineDash([]);\n\n  const px = 266, py = 30, pw = 436, ph = 180;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(px, py, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (let i = 0; i <= 4; i++) {\n    const gy = py + (ph * i) / 4;\n    ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n    const gx = px + (pw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (let x = 0; x < GW; x++) {\n    const b = Math.min(3, Math.floor((x / GW) * 4));\n    const sx = px + (x + 0.5) * (pw / GW);\n    const sy = py + ph - levels[b] * ph;\n    if (x === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  const pts = [];\n  for (let x = 0; x < GW; x++) {\n    const sx = px + (x + 0.5) * (pw / GW);\n    const sy = py + ph - rowTrace[x] * ph;\n    pts.push([sx, sy]);\n    if (x === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  for (let i = 0; i < pts.length; i++) {\n    ctx.fillRect(pts[i][0] - 1.5, pts[i][1] - 1.5, 3, 3);\n  }\n\n  ctx.font = '11px sans-serif';\n  for (let b = 0; b < 4; b++) {\n    const lvl = levels[b];\n    const pStd = Math.sqrt(lvl / maxN);\n    const totStd = Math.sqrt(pStd * pStd + preampStd * preampStd);\n    const bSnr = lvl / totStd;\n    ctx.fillStyle = bSnr < 5 ? '#ec4899' : '#10b981';\n    const bx = px + (b + 0.08) * (pw / 4);\n    const by = py + ph - lvl * ph - 12;\n    ctx.fillText('SNR ' + (bSnr >= 100 ? Math.round(bSnr) : bSnr.toFixed(1)), bx, Math.max(py + 14, by));\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('四阶亮度条纹图像', imgX, 19);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('水平扫描线剖面 (注意亮部绝对噪声更大，但 SNR 更高)', px, 19);\n\n  const brightPoisson = Math.sqrt(0.9 / maxN);\n  const nCross = preampSnr * preampSnr;\n  const dom = !showPreamp ? '仅观察纯泊松统计噪声' : (brightPoisson > preampStd ? '泊松量子噪声主导 (亮部比暗部噪)' : '前放恒定电路噪声主导 (全图等幅噪声)');\n  lab.setReadout('满量程 N_max ≈ ' + Math.round(maxN).toLocaleString() + ' 粒子/像素  |  交叉阈值 N_cross = ' + nCross.toLocaleString() + '  |  ' + dom);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分眼限与数限：对比度不足若源于人眼（0.5%～5% 极限），可用灰度拉伸解决；若目标已淹没在随机噪声（SNR < 1.0）中，灰度拉伸彻底无效，必须提高采集信噪比或利用空间平滑。",
        "尺寸换信噪比：K×K 均值滤波可使 SNR 提升 K 倍（只要 K 不超过目标直径），检测能力正比于目标直径（√面积），这也是大脑视觉皮层擅长在 2D 低信噪比图像中捞出目标的物理原因。",
        "警惕泊松噪声直觉陷阱：粒子数 N 增大时，绝对噪声 √N 虽然变大，但信号增长更快，总信噪比 SNR = √N 实际上变好了。永远不要为了“减小噪点幅度”而主动压低曝光或信号强度。",
        "找准系统的量子沉：多级光电/X 射线转换链路的最终信噪比受限于粒子数最少的那一级。要让系统脱离量子噪声区，量子沉每像素粒子数必须大于 (SNR_preamp)²。"
      ]
    }
  ]
});
