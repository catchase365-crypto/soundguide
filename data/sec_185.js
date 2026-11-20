window.__BOOK_REGISTER_SECTION__("sec_185", {
  "title": "计算机断层扫描成像 (Computed Tomography, CT)",
  "intuition": "通过绕人体旋转拍摄数百个角度的一维 X 射线投影，并利用滤波反投影或傅里叶切片定理，在数学上精确反演出互不重叠的二维身体切片。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从传统 X 光、经典断层到 CT 的革命",
      "paragraphs": [
        "传统 X 射线摄影面临一个根本困境：它把三维人体结构**压缩成一张二维投影图像**。处于同一条射线路径上的骨骼、内脏和软组织会相互重叠，医生很难看清被遮挡的病灶。",
        "早在 20 世纪 30 年代，人们发明了**经典断层扫描（Classical Tomography）**，在曝光时让 X 光源和探测器做协调运动，利用几何关系使体内某一个平面保持清晰，而该平面之外的组织则发生**运动模糊**（类似相机对焦在 5 米处，1 米和 50 米处变虚）。但它的致命缺陷是：**干扰结构并没有从图像中被移除，只是被模糊掉了**，画质依然太差。",
        "直到 1970 年代初，**计算机断层扫描（CT，早期称 CAT 扫描）**彻底解决了这个问题。CT 通过旋转机架（Gantry）发射窄束 X 射线，**只穿过待测的那一个二维切片**，每隔 `0.3° ~ 1.0°` 采集一个角度的**视图（View）**，完整扫描共采集 `300 ~ 1000` 个视图。由于切片之外的器官根本不会进入射线路径，无关结构的干扰被从物理源头上彻底隔绝。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "物理预处理：为什么必须先对 X 射线测量值取对数？",
      "paragraphs": [
        "在正式运行图像重建算法之前，CT 原始测量数据必须经过预处理，其中最核心的一步是**取对数**（此外还需对多能量 X 光束和多元探测器阵列的非线性进行校正）。",
        "这是因为 X 射线穿过物质时，其强度呈**指数级衰减**（比尔-朗伯定律）：穿过密度越高的骨骼或牙齿，信号衰减越剧烈；穿过脂肪和软组织则衰减较少。直接测得的射线强度与路径上的物质吸收系数呈指数乘积关系，而重建算法需要的是**线性叠加关系**。对测量值取负对数后，指数衰减就转化为了沿射线路径上各像素吸收系数的**线性求和（线积分）**。"
      ],
      "formula": {
        "expr": "p(s, θ) = -ln(I / I_0) = ∫ μ(x, y) dl",
        "explain": "I_0 为入射 X 射线初始强度，I 为穿过人体后到达探测器的强度；取负对数得到投影采样值 p(s, θ)，它等于射线路径 l 上所有组织衰减系数 μ(x, y) 的线性积分（即该条射线上所有像素值之和）。"
      }
    },
    {
      "type": "concept",
      "heading": "早期重建思路：联立方程组与迭代重建（ART / SIRT / ILST）",
      "paragraphs": [
        "已知所有角度的一维投影视图后，如何反推出二维切片图像？书中总结了四类主流 **CT 重建算法**。前两类虽然在现代商用设备中已被数学解析法取代，但最有助于建立直觉：",
        "**方法一：求解联立线性方程组。** 如果切片图像有 `N × N` 个像素（`N²` 个未知数），每次射线测量都能列出一个“某些像素之和等于该采样值”的线性方程，因此至少需要 `N²` 个独立方程。实际 CT 扫描通常会多采约 `50%` 的样本（例如重建 `512 × 512` 图像需 `262,144` 个未知数，系统常采集 `700` 个视角 × 每视角 `600` 点 = `420,000` 个方程），使方程组**超定（Overdetermined）**以抑制噪声和伪影。但直接求解数十万个联立方程的计算量是天文数字，完全不实用。",
        "**方法二：迭代重建技术（Iterative Techniques）。** 先给图像所有像素赋初值，再反复循环比对“当前图像沿某射线的像素和”与“实测采样值”的误差，逐步修正像素值直至收敛。常见变体有：**ART（代数重建技术，逐射线修正）**、**SIRT（同步迭代重建，逐像素修正）**和 **ILST（迭代最小二乘法，整体同步修正）**。1972 年全球首台商用医疗 CT（EMI Mark I）正是使用 ART 算法，但迭代法在修正一条射线时会破坏之前其他射线的平衡，收敛速度慢。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "核心工业主力：简单反投影 vs 滤波反投影（Filtered Backprojection）",
      "paragraphs": [
        "**方法三：滤波反投影（FBP）**是商用 CT 系统最常用的算法，它由早期的**简单反投影（Simple Backprojection）**改进而来。",
        "**简单反投影**的思路非常朴素：把每个视角采到的一维投影值，沿着当初采集它的射线方向“均匀涂抹（Smear）”回二维图像中，最后把所有角度涂抹的结果叠加起来。但它有一个严重缺陷——**图像非常模糊**！图像中的单个亮点在简单反投影后会变成一个随半径倒数 `1/r` 衰减的圆晕（其点扩散函数 PSF 呈圆对称且正比于 `1/r`）。",
        "**滤波反投影（FBP）**在涂抹之前多做了一步关键的 DSP 操作：先把每个一维视图与一个特定的一维滤波器核（如 Ram-Lak 斜坡滤波器）做**卷积**，然后再反投影叠加。对圆形目标（Pillbox）而言，这个一维滤波会做两件神奇的事：**第一，把原本弧形隆起的脉冲顶部压平**，使重建出的圆盘内部亮度均匀；**第二，在脉冲两侧产生负向尖峰（Negative Spikes）**，当这些带负值的边缘被反投影涂抹时，恰好精准抵消掉简单反投影产生的 `1/r` 模糊光晕！当视角数与采样点趋于无穷时，FBP 可实现数学上的精确重建。"
      ],
      "formula": {
        "expr": "h[0] = 1/4,  h[k] = -1/(π² k²) (k 为奇数),  h[k] = 0 (k 为非零偶数)",
        "explain": "离散斜坡滤波器（Ram-Lak）的空域卷积核 h[k]：中心为正权重 1/4，奇数位置为负权重（形成脉冲两侧的负向尖峰），与一维投影视图卷积后再反投影即可消除 1/r 模糊。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：简单反投影的 1/r 模糊与滤波反投影（FBP）的锐化奇迹",
      "instruction": "先关闭 FBP 开关观察简单反投影的星状条纹与 1/r 模糊光晕；再开启“滤波反投影 (FBP)”并拖动视角数滑块，观察中间绿色滤波波形两侧的负向尖峰如何完美抵消模糊。",
      "controls": [
        {
          "type": "slider",
          "id": "views",
          "label": "投影视角数 (Views)",
          "min": 2,
          "max": 60,
          "step": 1,
          "value": 6,
          "unit": " 个"
        },
        {
          "type": "slider",
          "id": "objRadius",
          "label": "圆形目标半径",
          "min": 4,
          "max": 12,
          "step": 1,
          "value": 6,
          "unit": " px"
        },
        {
          "type": "toggle",
          "id": "filtered",
          "label": "开启滤波反投影 (FBP)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "offcenter",
          "label": "偏心目标 (如原书图 25-15)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 64, M = 96, halfM = M >> 1;\nconst offTrue = document.createElement('canvas');\noffTrue.width = N; offTrue.height = N;\nconst offTrueCtx = offTrue.getContext('2d');\nconst imgTrue = offTrueCtx.createImageData(N, N);\nconst offRec = document.createElement('canvas');\noffRec.width = N; offRec.height = N;\nconst offRecCtx = offRec.getContext('2d');\nconst imgRec = offRecCtx.createImageData(N, N);\nconst K = 31;\nconst h = new Float32Array(2 * K + 1);\nfor (let k = -K; k <= K; k++) {\n  if (k === 0) h[k + K] = 0.25;\n  else if (Math.abs(k) % 2 === 1) h[k + K] = -1 / (Math.PI * Math.PI * k * k);\n  else h[k + K] = 0;\n}\nconst rawProj = new Float32Array(M);\nconst filtProj = new Float32Array(M);\nconst recon = new Float32Array(N * N);\nfunction render() {\n  const V = Math.round(lab.values.views);\n  const R = lab.values.objRadius;\n  const useFBP = !!lab.values.filtered;\n  const offCenter = !!lab.values.offcenter;\n  const cx = offCenter ? 10 : 0;\n  const cy = offCenter ? 6 : 0;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n  for (let y = 0; y < N; y++) {\n    const dy = (y - N / 2) - cy;\n    for (let x = 0; x < N; x++) {\n      const dx = (x - N / 2) - cx;\n      const g = (dx * dx + dy * dy) <= R * R ? 245 : 70;\n      const idx = (y * N + x) * 4;\n      imgTrue.data[idx] = g; imgTrue.data[idx + 1] = g; imgTrue.data[idx + 2] = g; imgTrue.data[idx + 3] = 255;\n    }\n  }\n  offTrueCtx.putImageData(imgTrue, 0, 0);\n  recon.fill(0);\n  let sampleView0 = null, sampleFilt0 = null;\n  for (let v = 0; v < V; v++) {\n    const theta = (v / V) * Math.PI;\n    const cosT = Math.cos(theta), sinT = Math.sin(theta);\n    const s0 = cx * cosT + cy * sinT;\n    for (let i = 0; i < M; i++) {\n      const d = Math.abs((i - halfM) - s0);\n      rawProj[i] = d < R ? 2 * Math.sqrt(R * R - d * d) : 0;\n    }\n    let activeProj = rawProj;\n    if (useFBP) {\n      for (let i = 0; i < M; i++) {\n        let sum = 0;\n        for (let k = -K; k <= K; k++) {\n          const j = i - k;\n          if (j >= 0 && j < M) sum += rawProj[j] * h[k + K];\n        }\n        filtProj[i] = sum;\n      }\n      activeProj = filtProj;\n    }\n    if (v === 0) {\n      sampleView0 = new Float32Array(rawProj);\n      sampleFilt0 = useFBP ? new Float32Array(filtProj) : null;\n    }\n    const scale = useFBP ? (Math.PI / V) : (1 / (V * 2 * R));\n    for (let y = 0; y < N; y++) {\n      const py = y - N / 2, rowOff = y * N;\n      for (let x = 0; x < N; x++) {\n        const px = x - N / 2;\n        const s = px * cosT + py * sinT + halfM;\n        const idx0 = Math.floor(s);\n        if (idx0 >= 0 && idx0 < M - 1) {\n          const frac = s - idx0;\n          recon[rowOff + x] += (activeProj[idx0] * (1 - frac) + activeProj[idx0 + 1] * frac) * scale;\n        }\n      }\n    }\n  }\n  for (let i = 0; i < N * N; i++) {\n    const val = recon[i];\n    let g = val >= 0 ? (70 + val * 175) : (70 + val * 140);\n    if (g < 0) g = 0; if (g > 255) g = 255;\n    const idx = i * 4;\n    imgRec.data[idx] = g; imgRec.data[idx + 1] = g; imgRec.data[idx + 2] = g; imgRec.data[idx + 3] = 255;\n  }\n  offRecCtx.putImageData(imgRec, 0, 0);\n  const xL = 24, yP = 36, sizeP = 160;\n  ctx.drawImage(offTrue, xL, yP, sizeP, sizeP);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(xL, yP, sizeP, sizeP);\n  const cxD = xL + sizeP / 2, cyD = yP + sizeP / 2;\n  for (let v = 0; v < Math.min(V, 16); v++) {\n    const theta = (v / V) * Math.PI;\n    const dx = -Math.sin(theta) * (sizeP * 0.46), dy = Math.cos(theta) * (sizeP * 0.46);\n    ctx.strokeStyle = v === 0 ? '#10b981' : 'rgba(56, 189, 248, 0.22)';\n    ctx.beginPath(); ctx.moveTo(cxD - dx, cyD - dy); ctx.lineTo(cxD + dx, cyD + dy); ctx.stroke();\n  }\n  const xM = 216, wM = 288, hM = 160;\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(xM, yP, wM, hM);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (let gx = 0; gx <= 4; gx++) {\n    const px = xM + (gx / 4) * wM;\n    ctx.beginPath(); ctx.moveTo(px, yP); ctx.lineTo(px, yP + hM); ctx.stroke();\n  }\n  const zeroY = yP + hM * 0.52;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(xM, zeroY); ctx.lineTo(xM + wM, zeroY); ctx.stroke();\n  ctx.strokeRect(xM, yP, wM, hM);\n  const rawMax = 2 * R;\n  ctx.strokeStyle = useFBP ? 'rgba(56, 189, 248, 0.4)' : '#38bdf8';\n  ctx.lineWidth = useFBP ? 1.5 : 2.2;\n  ctx.beginPath();\n  for (let i = 0; i < M; i++) {\n    const px = xM + (i / (M - 1)) * wM;\n    const py = zeroY - (sampleView0[i] / rawMax) * 62;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  if (useFBP && sampleFilt0) {\n    const fScale = 45 * Math.PI;\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i < M; i++) {\n      const px = xM + (i / (M - 1)) * wM;\n      let py = zeroY - sampleFilt0[i] * fScale;\n      if (py < yP + 2) py = yP + 2; if (py > yP + hM - 2) py = yP + hM - 2;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n  const xR = 536;\n  ctx.drawImage(offRec, xR, yP, sizeP, sizeP);\n  ctx.strokeStyle = useFBP ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(xR, yP, sizeP, sizeP);\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('真实切片 (True Slice)', xL + sizeP / 2, 22);\n  ctx.fillText(useFBP ? '视角 0 剖面: 原始(蓝) vs 滤波(绿)' : '视角 0 剖面: 原始投影 (未滤波)', xM + wM / 2, 22);\n  ctx.fillStyle = useFBP ? '#10b981' : '#f59e0b';\n  ctx.fillText(useFBP ? '滤波反投影重建 (FBP)' : '简单反投影重建 (模糊)', xR + sizeP / 2, 22);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText(offCenter ? '偏心圆盘 (Pillbox)' : '中心圆盘', xL + sizeP / 2, yP + hM + 16);\n  ctx.fillText('零基线 (开启 FBP 可见顶部变平与负尖峰)', xM + wM / 2, yP + hM + 16);\n  ctx.fillText('视角数 N = ' + V, xR + sizeP / 2, yP + hM + 16);\n  lab.setReadout('视角数: ' + V + ' | 模式: ' + (useFBP ? '滤波反投影 (消除 1/r 模糊)' : '简单反投影 (存在 1/r 光晕模糊)') + ' | 半径: ' + R + ' px');\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "傅里叶切片定理与频域重建（Fourier Slice Theorem）",
      "paragraphs": [
        "**方法四：傅里叶重建**将整个问题从空域搬到了频域。在空域中，二维图像与一维投影视图的关系需要复杂的线积分；而在频域中，两者的关系简洁得令人惊叹——这就是 CT 技术的里程碑定理：**傅里叶切片定理（Fourier Slice Theorem）**。",
        "该定理指出：**在角度 `θ` 处测得的一维投影视图，其一维傅里叶变换的频谱，完全等于原二维图像二维傅里叶频谱中穿过原点（直流中心）、同方向 `θ` 的那一条一维“切片”上的数值！** 请注意空域与频域的尺度反比直觉：在体模较宽的方向上投影剖面更宽，对应到频域该方向上的频谱反而更窄。",
        "基于该定理，**傅里叶重建**只需三步即可完成：**第一步**，对每个角度的一维视图做一维 FFT；**第二步**，把所有视角的一维频谱按各自采集角度“放射状（Radially）”填入二维频谱平面，由于图像二维频谱需要规则的直角网格（Rectangularly），必须通过**二维插值算法**将极坐标采样点转换到直角坐标网格；**第三步**，对插值填满后的二维频谱做二维逆 FFT，直接得到重建图像。"
      ],
      "formula": {
        "expr": "P_θ(ω) = F_1D{ p_θ(s) } = F(ω cos θ, ω sin θ)",
        "explain": "P_θ(ω) 是角度 θ 下投影视图 p_θ(s) 的一维傅里叶变换；F(u, v) 是原二维图像的二维傅里叶频谱。该式表明一维投影频谱就是二维频谱沿 (cos θ, sin θ) 方向穿过原点的径向切片。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：傅里叶切片定理与径向频谱采样可视化",
      "instruction": "拖动“切片角度 θ”或开启“自动扫描旋转”，观察中间绿色（1D 投影 FFT）与橙色虚线（直接从右侧 2D 频谱截取的切片）如何严丝合缝地重合；增加“已采集视角数”，观察极坐标射线在高频边缘留下的稀疏缝隙。",
      "controls": [
        {
          "type": "slider",
          "id": "angle",
          "label": "当前切片角度 θ",
          "min": 0,
          "max": 175,
          "step": 5,
          "value": 30,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "numViews",
          "label": "已采集视角数",
          "min": 1,
          "max": 36,
          "step": 1,
          "value": 5,
          "unit": " 个"
        },
        {
          "type": "toggle",
          "id": "ellipseObj",
          "label": "椭圆体模 (观察频谱各向异性)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "autoRotate",
          "label": "自动旋转扫描演示",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 64, halfN = N >> 1;\nconst offSp = document.createElement('canvas');\noffSp.width = N; offSp.height = N;\nconst offSpCtx = offSp.getContext('2d');\nconst imgSp = offSpCtx.createImageData(N, N);\nconst offFr = document.createElement('canvas');\noffFr.width = N; offFr.height = N;\nconst offFrCtx = offFr.getContext('2d');\nconst imgFr = offFrCtx.createImageData(N, N);\nfunction fft1d(re, im) {\n  const n = re.length;\n  for (let i = 1, j = 0; i < n; i++) {\n    let bit = n >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      let t = re[i]; re[i] = re[j]; re[j] = t;\n      t = im[i]; im[i] = im[j]; im[j] = t;\n    }\n  }\n  for (let len = 2; len <= n; len <<= 1) {\n    const ang = -2 * Math.PI / len;\n    const wRe = Math.cos(ang), wIm = Math.sin(ang);\n    for (let i = 0; i < n; i += len) {\n      let cRe = 1, cIm = 0;\n      for (let j = 0; j < len / 2; j++) {\n        const a = i + j, b = a + len / 2;\n        const vRe = re[b] * cRe - im[b] * cIm;\n        const vIm = re[b] * cIm + im[b] * cRe;\n        re[b] = re[a] - vRe; im[b] = im[a] - vIm;\n        re[a] += vRe; im[a] += vIm;\n        const nRe = cRe * wRe - cIm * wIm;\n        cIm = cRe * wIm + cIm * wRe; cRe = nRe;\n      }\n    }\n  }\n}\nconst spatial = new Float32Array(N * N);\nconst spec2D = new Float32Array(N * N);\nconst re2 = new Float32Array(N * N), im2 = new Float32Array(N * N);\nconst rowRe = new Float32Array(N), rowIm = new Float32Array(N);\nlet lastMode = null, maxSpec = 1;\nfunction buildPhantom(isEllipse) {\n  for (let y = 0; y < N; y++) {\n    const dy = y - halfN;\n    for (let x = 0; x < N; x++) {\n      const dx = x - halfN;\n      let val = 0;\n      if (isEllipse) {\n        const r2 = (dx * dx) / (15 * 15) + (dy * dy) / (5 * 5);\n        val = r2 <= 1 ? Math.exp(-0.4 * r2) : 0;\n      } else {\n        const inSq = Math.abs(dx) <= 9 && Math.abs(dy) <= 9;\n        const inDot = ((dx - 11) * (dx - 11) + (dy - 6) * (dy - 6)) <= 9;\n        val = inSq ? 0.85 : (inDot ? 1.0 : 0);\n      }\n      spatial[y * N + x] = val;\n      const g = Math.round(30 + val * 215);\n      const idx = (y * N + x) * 4;\n      imgSp.data[idx] = g; imgSp.data[idx + 1] = g; imgSp.data[idx + 2] = g; imgSp.data[idx + 3] = 255;\n    }\n  }\n  offSpCtx.putImageData(imgSp, 0, 0);\n  re2.set(spatial); im2.fill(0);\n  for (let y = 0; y < N; y++) {\n    const off = y * N;\n    for (let x = 0; x < N; x++) { rowRe[x] = re2[off + x]; rowIm[x] = 0; }\n    fft1d(rowRe, rowIm);\n    for (let x = 0; x < N; x++) { re2[off + x] = rowRe[x]; im2[off + x] = rowIm[x]; }\n  }\n  for (let x = 0; x < N; x++) {\n    for (let y = 0; y < N; y++) { rowRe[y] = re2[y * N + x]; rowIm[y] = im2[y * N + x]; }\n    fft1d(rowRe, rowIm);\n    for (let y = 0; y < N; y++) { re2[y * N + x] = rowRe[y]; im2[y * N + x] = rowIm[y]; }\n  }\n  maxSpec = 1e-6;\n  for (let v = 0; v < N; v++) {\n    const sy = (v + halfN) % N;\n    for (let u = 0; u < N; u++) {\n      const sx = (u + halfN) % N;\n      const mag = Math.hypot(re2[sy * N + sx], im2[sy * N + sx]);\n      spec2D[v * N + u] = mag;\n      if (mag > maxSpec) maxSpec = mag;\n    }\n  }\n  const logDen = Math.log(1 + maxSpec * 0.4);\n  for (let i = 0; i < N * N; i++) {\n    const b = Math.min(1, Math.log(1 + spec2D[i] * 0.4) / logDen);\n    const idx = i * 4;\n    imgFr.data[idx] = Math.round(12 + b * 230);\n    imgFr.data[idx + 1] = Math.round(18 + b * 235);\n    imgFr.data[idx + 2] = Math.round(32 + b * 223);\n    imgFr.data[idx + 3] = 255;\n  }\n  offFrCtx.putImageData(imgFr, 0, 0);\n}\nlet animAngle = lab.values.angle;\nconst proj = new Float32Array(N);\nconst pRe = new Float32Array(N), pIm = new Float32Array(N);\nconst mag1D = new Float32Array(N), slice2D = new Float32Array(N);\nfunction sampleBilinear(arr, x, y) {\n  if (x < 0 || x >= N - 1 || y < 0 || y >= N - 1) return 0;\n  const x0 = Math.floor(x), y0 = Math.floor(y);\n  const fx = x - x0, fy = y - y0;\n  const i00 = arr[y0 * N + x0], i10 = arr[y0 * N + x0 + 1];\n  const i01 = arr[(y0 + 1) * N + x0], i11 = arr[(y0 + 1) * N + x0 + 1];\n  return (i00 * (1 - fx) + i10 * fx) * (1 - fy) + (i01 * (1 - fx) + i11 * fx) * fy;\n}\nfunction render(thetaDeg) {\n  const isEllipse = !!lab.values.ellipseObj;\n  if (lastMode !== isEllipse) { buildPhantom(isEllipse); lastMode = isEllipse; }\n  const numV = Math.round(lab.values.numViews);\n  const theta = (thetaDeg * Math.PI) / 180;\n  const cosT = Math.cos(theta), sinT = Math.sin(theta);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n  let pMax = 1e-6;\n  for (let sIdx = 0; sIdx < N; sIdx++) {\n    const s = sIdx - halfN;\n    let sum = 0;\n    for (let t = -halfN; t < halfN; t += 0.5) {\n      const x = s * cosT - t * sinT + halfN;\n      const y = s * sinT + t * cosT + halfN;\n      sum += sampleBilinear(spatial, x, y) * 0.5;\n    }\n    proj[sIdx] = sum;\n    if (sum > pMax) pMax = sum;\n  }\n  pRe.set(proj); pIm.fill(0);\n  fft1d(pRe, pIm);\n  for (let k = 0; k < N; k++) {\n    const sk = (k + halfN) % N;\n    mag1D[k] = Math.hypot(pRe[sk], pIm[sk]);\n    const freqK = k - halfN;\n    const u = freqK * cosT + halfN, v = freqK * sinT + halfN;\n    slice2D[k] = sampleBilinear(spec2D, u, v);\n  }\n  const xL = 20, yP = 34, sizeP = 160;\n  ctx.drawImage(offSp, xL, yP, sizeP, sizeP);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(xL, yP, sizeP, sizeP);\n  const cxL = xL + sizeP / 2, cyL = yP + sizeP / 2;\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  for (let s = -2; s <= 2; s++) {\n    const ox = s * 14 * cosT, oy = s * 14 * sinT;\n    const rx = -sinT * 68, ry = cosT * 68;\n    ctx.beginPath(); ctx.moveTo(cxL + ox - rx, cyL + oy - ry); ctx.lineTo(cxL + ox + rx, cyL + oy + ry); ctx.stroke();\n  }\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(cxL - cosT * 70, cyL - sinT * 70); ctx.lineTo(cxL + cosT * 70, cyL + sinT * 70); ctx.stroke();\n  const xM = 206, wM = 296, hTop = 72, yBot = 122;\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(xM, yP, wM, hTop); ctx.fillRect(xM, yBot, wM, hTop);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;\n  ctx.strokeRect(xM, yP, wM, hTop); ctx.strokeRect(xM, yBot, wM, hTop);\n  ctx.beginPath(); ctx.moveTo(xM + wM / 2, yP); ctx.lineTo(xM + wM / 2, yP + hTop); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(xM + wM / 2, yBot); ctx.lineTo(xM + wM / 2, yBot + hTop); ctx.stroke();\n  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const px = xM + (i / (N - 1)) * wM;\n    const py = yP + hTop - 6 - (proj[i] / pMax) * (hTop - 16);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const px = xM + (i / (N - 1)) * wM;\n    const py = yBot + hTop - 6 - Math.min(1, mag1D[i] / maxSpec) * (hTop - 14);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const px = xM + (i / (N - 1)) * wM;\n    const py = yBot + hTop - 6 - Math.min(1, slice2D[i] / maxSpec) * (hTop - 14);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke(); ctx.setLineDash([]);\n  const xR = 528;\n  ctx.drawImage(offFr, xR, yP, sizeP, sizeP);\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;\n  ctx.strokeRect(xR, yP, sizeP, sizeP);\n  const cxR = xR + sizeP / 2, cyR = yP + sizeP / 2;\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';\n  for (let v = 0; v < numV; v++) {\n    const a = (v / numV) * Math.PI;\n    const dx = Math.cos(a) * (sizeP * 0.49), dy = Math.sin(a) * (sizeP * 0.49);\n    ctx.beginPath(); ctx.moveTo(cxR - dx, cyR - dy); ctx.lineTo(cxR + dx, cyR + dy); ctx.stroke();\n  }\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  ctx.moveTo(cxR - cosT * (sizeP * 0.49), cyR - sinT * (sizeP * 0.49));\n  ctx.lineTo(cxR + cosT * (sizeP * 0.49), cyR + sinT * (sizeP * 0.49));\n  ctx.stroke();\n  ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#f8fafc';\n  ctx.fillText('空域体模 & 射线角度 θ=' + Math.round(thetaDeg) + '°', xL + sizeP / 2, 22);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('1D 投影剖面 p(s)', xM + wM / 2, 22);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('1D FFT(绿) vs 2D 频谱切片(橙虚线)', xM + wM / 2, 117);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('2D 频谱网格 & 径向切片', xR + sizeP / 2, 22);\n  ctx.font = '11px sans-serif'; ctx.fillStyle = '#94a3b8';\n  ctx.fillText('绿线为投影轴 s 方向', xL + sizeP / 2, yP + sizeP + 16);\n  ctx.fillText('已采视角: ' + numV + ' (高频角落变稀疏)', xR + sizeP / 2, yP + sizeP + 16);\n  lab.setReadout('当前切片角度 θ = ' + Math.round(thetaDeg) + '° | 1D 投影 FFT 与 2D 频谱同角度径向切片完全重合 | 径向视角数 = ' + numV);\n}\nlab.onUpdate(() => { animAngle = lab.values.angle; render(animAngle); });\nlab.onLoop((dt) => { if (lab.values.autoRotate) { animAngle = (animAngle + dt * 32) % 180; render(animAngle); } });"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "物理前提不能省：X 光衰减呈指数规律，必须先对原始探测器读数取负对数，才能转化为沿射线像素累加的线性反演问题。",
        "超定采样抑噪：重建 N × N 图像时，商用 CT 通常采集多出约 50% 的测量样本（超定系统），以大幅削弱随机噪声和条纹伪影。",
        "为什么 FBP 称霸工业界：简单反投影会产生无法接受的 1/r 模糊，迭代法（ART）太慢；滤波反投影先用一维斜坡核卷积引入负向尖峰再反投影，既抵消了模糊，计算复杂度又极低。",
        "傅里叶重建的瓶颈在插值：傅里叶切片定理在数学上极其优美，但采集到的频谱是按极坐标放射状分布的（高频外围采样稀疏），转换到 2D IFFT 所需的直角网格时，插值精度直接决定最终画质。"
      ]
    }
  ]
});
