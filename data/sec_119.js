window.__BOOK_REGISTER_SECTION__("sec_119", {
  "title": "用复数 DFT 计算实数 DFT (Real DFT Using the Complex DFT)",
  "intuition": "标准 FFT 天生处理“复数”格式，只要在时域把虚部全填 0 即可直接算出实数频谱；而做逆变换时，则必须按“实偶虚奇”的镜像规则补全负频率，否则时域虚部就会漏出错误波形。",
  "blocks": [
    {
      "type": "concept",
      "heading": "破除“复数”恐惧：FFT 到底在算什么？",
      "paragraphs": [
        "1965 年，Cooley 和 Tukey 凭借一篇里程碑论文将快速傅里叶变换（FFT）带给了世界（实际上数学大师高斯早在百年前就发明过类似方法，只是当时还没有数字计算机）。**FFT 并不是一种新的变换，它只是计算离散傅里叶变换（DFT）的超高速算法**——把计算耗时压缩成百上千倍，好比从步行直接升级成坐喷气式飞机。",
        "不过，工业界通用的 FFT 算法底层计算的是**复数 DFT（Complex DFT）**，而不是我们前面章节学的**实数 DFT（Real DFT）**。很多人听到“复数”就头大，其实这里的“复数”指的是一种数学工具，而不是“复杂难懂”。在代码数组里，**所有的数值全都是普通的实数**，虚数单位 `j` 根本不会存进数组里——它只存在于算法的内部运算逻辑中。",
        "两者的**数据打包格式**区别非常直观：实数 DFT 输入 **1 组**长度为 `N` 的时域信号，输出 **2 组**长度为 `N/2 + 1` 的频域数组（实部存余弦振幅，虚部存正弦振幅）；而复数 DFT 需要输入 **2 组**长度为 `N` 的时域数组（时域实部 `ReX` 和时域虚部 `ImX`），并输出 **2 组**长度为 `N` 的频域数组（`REX` 和 `IMX`）。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "正向实数 DFT：时域补零，频域切片",
      "paragraphs": [
        "既然我们手头只有一段长度为 `N` 的真实物理信号，怎么借用现成的复数 FFT 库来算它的实数频谱呢？操作只需两步，极其简单：",
        "第一步，**装箱**：把这 `N` 个时域采样点放进复数 DFT 的**时域实部** `ReX[0 .. N-1]` 中，然后把**时域虚部** `ImX[0 .. N-1]` 全部设为 `0`。",
        "第二步，**切片**：运行复数 FFT 后，你会得到长度为 `N` 的频域实部 `REX` 和虚部 `IMX`。由于 DFT 频谱具有周期性，复数 DFT 把一个完整周期（0 到 1.0 倍采样率）按 `0` 到 `N-1` 排列。其中**前一半采样点 `0` 到 `N/2`** 对应 0 到 0.5 倍采样率的正频率，**与实数 DFT 的结果完全一致**；而后面的 **`N/2 + 1` 到 `N - 1`** 存放的是负频率镜像，正变换时通常直接忽略即可。"
      ],
      "formula": {
        "expr": "ReX[0..N-1] = x[n],   ImX[0..N-1] = 0   ==>   取频域 [0 .. N/2]",
        "explain": "x[n] 为待分析的 N 点实数信号；ImX 为全零占位数组；输出只需读取索引 0 到 N/2 的正频率部分"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：正变换装箱与正/负频率全景透视",
      "instruction": "拖动“信号频率索引”和“初相位”滑块，观察时域全零虚部如何映射到频域的 0..N/2 正频率区与 N/2+1..N-1 负频率镜像区。",
      "controls": [
        {
          "type": "slider",
          "id": "freqBin",
          "label": "信号频率索引 k",
          "min": 1,
          "max": 7,
          "step": 1,
          "value": 3,
          "unit": " (bin)"
        },
        {
          "type": "slider",
          "id": "phaseDeg",
          "label": "初相位 φ (0°纯余弦 / 90°正弦)",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showNeg",
          "label": "高亮 N/2+1 ~ N-1 负频率区",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听当前时域信号",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const N = 16;\nconst ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet osc = null;\nlet gainNode = null;\n\nfunction drawGrid(x0, y0, w, h, title, color) {\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.fillRect(x0, y0, w, h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, h);\n  const midY = y0 + h / 2;\n  ctx.beginPath();\n  ctx.moveTo(x0, midY);\n  ctx.lineTo(x0 + w, midY);\n  ctx.stroke();\n  ctx.fillStyle = color;\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(title, x0 + 6, y0 + 13);\n}\n\nfunction drawStems(arr, x0, y0, w, h, maxVal, colorFn, dimAfter) {\n  const midY = y0 + h / 2;\n  const scaleY = (h * 0.36) / maxVal;\n  const stepX = w / (N + 1);\n  for (let i = 0; i < N; i++) {\n    const px = x0 + (i + 1) * stepX;\n    const py = midY - arr[i] * scaleY;\n    const c = colorFn(i);\n    ctx.globalAlpha = (dimAfter !== null && i > dimAfter) ? 0.28 : 1.0;\n    ctx.strokeStyle = c;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = c;\n    ctx.beginPath();\n    ctx.arc(px, py, 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.globalAlpha = 1.0;\n}\n\nfunction updateAudio(k) {\n  if (lab.values.play) {\n    const actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    if (!osc) {\n      osc = actx.createOscillator();\n      gainNode = actx.createGain();\n      osc.type = 'sine';\n      gainNode.gain.value = 0;\n      osc.connect(gainNode);\n      gainNode.connect(actx.destination);\n      osc.start();\n    }\n    osc.frequency.setTargetAtTime(110 * k, actx.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(0.12, actx.currentTime, 0.02);\n  } else if (gainNode) {\n    const actx = lab.getAudioContext();\n    gainNode.gain.setTargetAtTime(0, actx.currentTime, 0.02);\n  }\n}\n\nlab.onUpdate(() => {\n  const k = lab.values.freqBin;\n  const phi = (lab.values.phaseDeg * Math.PI) / 180;\n  const showNeg = lab.values.showNeg;\n\n  const reT = new Array(N);\n  const imT = new Array(N).fill(0);\n  for (let n = 0; n < N; n++) {\n    reT[n] = Math.cos((2 * Math.PI * k * n) / N + phi);\n  }\n\n  const reF = new Array(N).fill(0);\n  const imF = new Array(N).fill(0);\n  for (let m = 0; m < N; m++) {\n    let sr = 0;\n    let si = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = (2 * Math.PI * m * n) / N;\n      sr += reT[n] * Math.cos(ang);\n      si -= reT[n] * Math.sin(ang);\n    }\n    reF[m] = sr / N;\n    imF[m] = si / N;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 14, lw = 316;\n  drawGrid(lx, 12, lw, 98, '时域实部 ReX[0..15] (输入信号)', '#38bdf8');\n  drawStems(reT, lx, 12, lw, 98, 1.1, () => '#38bdf8', null);\n\n  drawGrid(lx, 124, lw, 98, '时域虚部 ImX[0..15] = 0 (手动补零)', '#10b981');\n  drawStems(imT, lx, 124, lw, 98, 1.1, () => '#10b981', null);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('FFT', 342, 114);\n  ctx.fillText('==>', 342, 130);\n\n  const rx = 380, rw = 326;\n  const splitX = rx + ((9.5) / (N + 1)) * rw;\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';\n  ctx.fillRect(rx, 12, splitX - rx, 210);\n  if (showNeg) {\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';\n    ctx.fillRect(splitX, 12, rx + rw - splitX, 210);\n  }\n\n  drawGrid(rx, 12, rw, 98, '频域实部 REX[0..15] (正频率 0..8 | 镜像 9..15)', '#f8fafc');\n  drawStems(reF, rx, 12, rw, 98, 0.6, (i) => (i <= N / 2 ? '#10b981' : '#f59e0b'), showNeg ? null : N / 2);\n\n  drawGrid(rx, 124, rw, 98, '频域虚部 IMX[0..15] (正频率 0..8 | 反号镜像 9..15)', '#f8fafc');\n  drawStems(imF, rx, 124, rw, 98, 0.6, (i) => (i <= N / 2 ? '#38bdf8' : '#ec4899'), showNeg ? null : N / 2);\n\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(splitX, 12);\n  ctx.lineTo(splitX, 222);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0', rx + 14, 234);\n  ctx.fillText('N/2 (8)', splitX - 38, 234);\n  ctx.fillText('N-1 (15)', rx + rw - 42, 234);\n\n  lab.setReadout(\n    'N=16 | 正频率 bin k=' + k + ': REX[' + k + ']=' + reF[k].toFixed(2) + ', IMX[' + k + ']=' + imF[k].toFixed(2) +\n    '  <-->  负频率镜像 (N-k=' + (N - k) + '): REX[' + (N - k) + ']=' + reF[N - k].toFixed(2) + ', IMX[' + (N - k) + ']=' + imF[N - k].toFixed(2) +\n    ' | 音频: ' + (110 * k) + ' Hz'\n  );\n  updateAudio(k);\n});"
    },
    {
      "type": "concept",
      "heading": "逆向实数 DFT：用共轭对称补全负频率，并用“零虚部”自检",
      "paragraphs": [
        "如果你想反向操作——已知一段实数信号的频谱（只有 `0` 到 `N/2` 共 `N/2 + 1` 个点），想用**复数逆 FFT** 把它还原成时域实数信号，事情就稍微讲究一点了。",
        "因为复数逆 FFT 需要吃进完整的 `0` 到 `N-1` 频谱，**你绝不能把 `N/2 + 1` 到 `N - 1` 的空位留成 0**！必须严格按照周期对称性（即共轭对称）把负频率填回去：",
        "1. **实部偶对称**：`REX[N/2 + 1]` 等于 `REX[N/2 - 1]`，`REX[N/2 + 2]` 等于 `REX[N/2 - 2]`……一直到 `REX[N - 1] = REX[1]`。",
        "2. **虚部奇对称（加负号）**：`IMX[N/2 + 1]` 等于 `-IMX[N/2 - 1]`……一直到 `IMX[N - 1] = -IMX[1]`。",
        "3. **孤立点注意**：索引 **`0`**（直流分量）和 **`N/2`**（奈奎斯特频率）在这套镜像复制规则里**没有配对点**，千万不要越界重复赋值！",
        "写完对称补全并执行完复数逆 FFT 后，书中给出了一个极其好用的**工程排雷自检法**：立刻检查时域输出结果的**虚部数组 `ImX[]`**。如果对称格式完全正确，时域虚部应当**全为 0**（单精度浮点运算下最多只有百万分之几的舍入微噪）；只要虚部出现明显数值，说明负频率一定写错了！"
      ],
      "formula": {
        "expr": "REX[k] = REX[N - k],   IMX[k] = -IMX[N - k]   (k = N/2 + 1 ... N - 1)",
        "explain": "N 为总点数；k 遍历负频率区索引；实部直接对称复制，虚部对称复制并取负号；0 和 N/2 点不参与复制"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：逆 FFT 负频率对称性“排雷”实验室",
      "instruction": "试着关闭下方任意一个对称性开关（模拟写错代码或忘记虚部取反），观察右下角时域虚部如何瞬间“爆出”错误波形，并听听看声音里的异常漏音！",
      "controls": [
        {
          "type": "slider",
          "id": "bin",
          "label": "频谱分量位置 k",
          "min": 1,
          "max": 7,
          "step": 1,
          "value": 2,
          "unit": " (bin)"
        },
        {
          "type": "slider",
          "id": "imAmp",
          "label": "正弦分量 IMX[k] 幅度",
          "min": -1,
          "max": 1,
          "step": 0.2,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "fixRealSym",
          "label": "开启实部偶对称 REX[N-k] = REX[k]",
          "value": true
        },
        {
          "type": "toggle",
          "id": "fixImagSym",
          "label": "开启虚部奇对称 IMX[N-k] = -IMX[k]",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听重建信号与虚部漏音",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const N = 16;\nconst ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet oscMain = null;\nlet oscErr = null;\nlet gainMain = null;\nlet gainErr = null;\n\nfunction drawPanel(x0, y0, w, h, title, color) {\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.fillRect(x0, y0, w, h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, h);\n  const midY = y0 + h / 2;\n  ctx.beginPath();\n  ctx.moveTo(x0, midY);\n  ctx.lineTo(x0 + w, midY);\n  ctx.stroke();\n  ctx.fillStyle = color;\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(title, x0 + 6, y0 + 13);\n}\n\nfunction drawBars(arr, x0, y0, w, h, maxVal, colorFn) {\n  const midY = y0 + h / 2;\n  const scaleY = (h * 0.36) / maxVal;\n  const stepX = w / (N + 1);\n  for (let i = 0; i < N; i++) {\n    const px = x0 + (i + 1) * stepX;\n    const py = midY - arr[i] * scaleY;\n    const c = colorFn(i);\n    ctx.strokeStyle = c;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = c;\n    ctx.beginPath();\n    ctx.arc(px, py, 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n}\n\nfunction updateAudio(k, maxIm) {\n  if (lab.values.play) {\n    const actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    if (!oscMain) {\n      oscMain = actx.createOscillator();\n      oscErr = actx.createOscillator();\n      gainMain = actx.createGain();\n      gainErr = actx.createGain();\n      oscMain.type = 'sine';\n      oscErr.type = 'sawtooth';\n      gainMain.gain.value = 0;\n      gainErr.gain.value = 0;\n      oscMain.connect(gainMain);\n      oscErr.connect(gainErr);\n      gainMain.connect(actx.destination);\n      gainErr.connect(actx.destination);\n      oscMain.start();\n      oscErr.start();\n    }\n    const baseFreq = 110 * k;\n    oscMain.frequency.setTargetAtTime(baseFreq, actx.currentTime, 0.02);\n    oscErr.frequency.setTargetAtTime(baseFreq * 1.414, actx.currentTime, 0.02);\n    gainMain.gain.setTargetAtTime(0.11, actx.currentTime, 0.02);\n    const errLevel = maxIm > 0.001 ? Math.min(0.09, maxIm * 0.1) : 0;\n    gainErr.gain.setTargetAtTime(errLevel, actx.currentTime, 0.02);\n  } else if (gainMain && gainErr) {\n    const actx = lab.getAudioContext();\n    gainMain.gain.setTargetAtTime(0, actx.currentTime, 0.02);\n    gainErr.gain.setTargetAtTime(0, actx.currentTime, 0.02);\n  }\n}\n\nlab.onUpdate(() => {\n  const k = lab.values.bin;\n  const imAmp = lab.values.imAmp;\n  const fixReal = lab.values.fixRealSym;\n  const fixImag = lab.values.fixImagSym;\n\n  const reF = new Array(N).fill(0);\n  const imF = new Array(N).fill(0);\n  reF[k] = 1.0;\n  imF[k] = imAmp;\n  reF[N - k] = fixReal ? reF[k] : 0;\n  imF[N - k] = fixImag ? -imF[k] : imF[k];\n\n  const reT = new Array(N).fill(0);\n  const imT = new Array(N).fill(0);\n  for (let n = 0; n < N; n++) {\n    let sr = 0;\n    let si = 0;\n    for (let m = 0; m < N; m++) {\n      const ang = (2 * Math.PI * m * n) / N;\n      sr += reF[m] * Math.cos(ang) - imF[m] * Math.sin(ang);\n      si += reF[m] * Math.sin(ang) + imF[m] * Math.cos(ang);\n    }\n    reT[n] = sr / 2;\n    imT[n] = si / 2;\n  }\n\n  let maxIm = 0;\n  for (let n = 0; n < N; n++) {\n    if (Math.abs(imT[n]) > maxIm) maxIm = Math.abs(imT[n]);\n  }\n  const isClean = maxIm < 1e-6;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 14, lw = 316;\n  drawPanel(lx, 12, lw, 98, '频域实部 REX[0..15] (填入 k 与镜像 N-k)', '#f8fafc');\n  drawBars(reF, lx, 12, lw, 98, 1.2, (i) => {\n    if (i === k) return '#38bdf8';\n    if (i === N - k) return fixReal ? '#10b981' : '#ec4899';\n    return 'rgba(255,255,255,0.25)';\n  });\n\n  drawPanel(lx, 124, lw, 98, '频域虚部 IMX[0..15] (填入 k 与镜像 N-k)', '#f8fafc');\n  drawBars(imF, lx, 124, lw, 98, 1.2, (i) => {\n    if (i === k) return '#38bdf8';\n    if (i === N - k) return fixImag ? '#10b981' : '#ec4899';\n    return 'rgba(255,255,255,0.25)';\n  });\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('IFFT', 340, 114);\n  ctx.fillText('==>', 342, 130);\n\n  const rx = 380, rw = 326;\n  drawPanel(rx, 12, rw, 98, '重建时域实部 Re x[n] (目标输出波形)', '#38bdf8');\n  drawBars(reT, rx, 12, rw, 98, 1.5, () => '#38bdf8');\n\n  const imTitle = isClean\n    ? '时域虚部自检 Im x[n] = 0 (对称性完美通过!)'\n    : '警告：时域虚部 Im x[n] 非零 (负频率对称破坏!)';\n  drawPanel(rx, 124, rw, 98, imTitle, isClean ? '#10b981' : '#ec4899');\n  drawBars(imT, rx, 124, rw, 98, 1.5, () => (isClean ? '#10b981' : '#ec4899'));\n\n  lab.setReadout(\n    'REX[' + (N - k) + ']=' + reF[N - k].toFixed(1) + ', IMX[' + (N - k) + ']=' + imF[N - k].toFixed(1) +\n    ' | 时域虚部最大残留 max|Im(x)| = ' + maxIm.toFixed(6) +\n    (isClean ? '  [自检通过：全零无漏音]' : '  [自检失败：虚部泄漏错误!]')\n  );\n  updateAudio(k, maxIm);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数组中没有 j：复数 FFT 的输入输出数组 `REX[]` 和 `IMX[]` 存的都是普通实数，“复数”只发生在算法内部的乘加公式里。",
        "正变换口诀“时域虚部补零，频域只取前一半”：把实信号放入 `ReX[0..N-1]`，必须显式把 `ImX[0..N-1]` 全部清零；算完后只取 `0` 到 `N/2`，直接丢弃 `N/2+1` 到 `N-1`。",
        "逆变换最易踩的坑“忘记负频率或漏了负号”：把 `0..N/2` 填进数组后，必须用循环生成 `N/2+1..N-1`——实部直接照抄 `REX[N-k]`，虚部必须取反 `-IMX[N-k]`，同时切记 `0` 和 `N/2` 两点不参与镜像复制。",
        "黄金自检法则：每次执行完逆 FFT，养成习惯看一眼时域虚部 `ImX[]`。它必须全为 0（允许单精度浮点带来百万分之几的微噪）；只要虚部数值显著大于 0，说明你的负频率对称逻辑写错了。"
      ]
    }
  ]
});
