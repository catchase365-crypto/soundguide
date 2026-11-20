window.__BOOK_REGISTER_SECTION__("sec_139", {
  "title": "加窗 Sinc 滤波器的核心策略 (Strategy of the Windowed-Sinc)",
  "intuition": "理想低通滤波器的时域核是一条无限延伸的 sinc 曲线，直接一刀截断会引发严重的吉布斯振铃；给它乘上一件平滑的「窗函数」外衣让两端温柔归零，就能以极小代价换取极其平坦的通带与深不见底的阻带衰减。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、理想很丰满，计算机很骨感：无限长的 Sinc 函数",
      "paragraphs": [
        "**加窗 Sinc 滤波器（Windowed-Sinc Filter）** 专门用于把一个频段的信号从另一个频段中彻底分离出来。它在**频域**几乎无敌——极其稳定、性能可推向极致；但代价是**时域**性能较差（阶跃响应会有过冲和振铃）。用标准卷积实现时代码极简但运算较慢（第 18 章会用 FFT 提速）。",
        "让我们先看「理想低通滤波器」的模样：在频域里，它像一堵垂直的砖墙——低于截止频率 `fc` 的信号增益严格为 `1`，高于 `fc` 的信号衰减为无穷大，过渡带宽度为零。",
        "对这个理想频域矩形做**逆傅里叶变换（Inverse Fourier Transform）**，就能得到它对应的时域冲激响应（滤波器核），也就是大名鼎鼎的 **sinc 函数**。用它对输入信号做卷积，就能实现完美的低通滤波。但致命问题在于：sinc 函数的波形向正负无穷远处永无止境地延伸，振幅永远不会彻底归零。数学家不在乎无限长，但计算机内存和算力却会瞬间被卡死。"
      ],
      "formula": {
        "expr": "h[i] = sin(2π * fc * i) / (i * π)   (注：当 i = 0 时取极限，h[0] = 2 * fc)",
        "explain": "h[i] 是理想滤波器核在第 i 个采样点的值；fc 是归一化截止频率（范围 0 ~ 0.5，即采样率的一半）；i 为采样点索引（从 -∞ 到 +∞）。"
      }
    },
    {
      "type": "concept",
      "heading": "二、两步妥协与「吉布斯效应」灾难",
      "paragraphs": [
        "为了让计算机能算出结果，必须对无限长的 sinc 函数动两次手术：",
        "1. **对称截断（Truncation）**：以主瓣中心为对称轴，只保留 `M + 1` 个采样点（`M` 取偶数），其余点全部丢弃或置零。",
        "2. **整体右移（Shift）**：把序列整体向右平移 `M / 2` 个点，使数组下标从 `0` 跑到 `M`。虽然部分编程语言支持负数下标，但写起来非常别扭；统一用正下标编程最省心，而这样做的**唯一副作用仅仅是输出信号整体延迟了 M / 2 个采样点**。",
        "然而，当我们对截断后的 sinc 核做傅里叶变换查看频响时，结果简直是一场灾难：**通带内出现剧烈波纹，阻带衰减也差得离谱（仅约 -21 dB，即漏过高达 8.9% 的干扰信号）**——这就是第 11 章讨论过的**吉布斯效应（Gibbs Effect）**。",
        "更反直觉的是：**把滤波器长度 M 加大十倍也救不了它！** 因为问题的根源在于两端「突兀的断崖式截断」，只要末端不是平滑归零，不管 M 取多大，频域里的剧烈振铃都会顽固存在。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：亲手截断 Sinc —— 见证吉布斯振铃与 Blackman 窗的救赎",
      "instruction": "先关闭「Blackman 窗」，拖动 M 观察无论核多长阻带依然停留在 -21 dB；再开启窗函数与 dB 视图，亲眼看两端被抚平后阻带暴跌至 -74 dB。",
      "controls": [
        {
          "type": "slider",
          "id": "M",
          "label": "核长度 M (共 M+1 点)",
          "min": 10,
          "max": 80,
          "step": 2,
          "value": 30,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "fc",
          "label": "归一化截止频率 fc",
          "min": 0.08,
          "max": 0.4,
          "step": 0.02,
          "value": 0.2,
          "unit": " fs"
        },
        {
          "type": "toggle",
          "id": "useWindow",
          "label": "乘以 Blackman 窗 (关闭=矩形截断)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "dbMode",
          "label": "切换对数 dB 视图 (看清阻带衰减)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const M = Math.round(lab.values.M);\n  const fc = lab.values.fc;\n  const useWin = lab.values.useWindow;\n  const dbMode = lab.values.dbMode;\n\n  const sinc = [];\n  const win = [];\n  const kern = [];\n  let sum = 0;\n  let sumSinc = 0;\n  for (let i = 0; i <= M; i++) {\n    const k = i - M / 2;\n    const s = (k === 0) ? (2 * fc) : (Math.sin(2 * Math.PI * fc * k) / (k * Math.PI));\n    const w = useWin ? (0.42 - 0.5 * Math.cos(2 * Math.PI * i / M) + 0.08 * Math.cos(4 * Math.PI * i / M)) : 1;\n    sinc.push(s);\n    win.push(w);\n    const val = s * w;\n    kern.push(val);\n    sum += val;\n    sumSinc += s;\n  }\n  const safeSum = Math.abs(sum) > 1e-6 ? sum : 1;\n  const safeSincSum = Math.abs(sumSinc) > 1e-6 ? sumSinc : 1;\n  for (let i = 0; i <= M; i++) kern[i] /= safeSum;\n  const sincNorm = sinc.map(v => v / safeSincSum);\n\n  const N = 260;\n  const mag = [];\n  const db = [];\n  for (let n = 0; n < N; n++) {\n    const f = 0.5 * n / (N - 1);\n    let re = 0, im = 0;\n    for (let i = 0; i <= M; i++) {\n      const ang = 2 * Math.PI * f * i;\n      re += kern[i] * Math.cos(ang);\n      im -= kern[i] * Math.sin(ang);\n    }\n    const m = Math.sqrt(re * re + im * im);\n    mag.push(m);\n    db.push(20 * Math.log10(Math.max(m, 1e-6)));\n  }\n\n  const bw = Math.max(0.04, 2.2 / M);\n  const passEnd = Math.max(fc * 0.4, fc - bw);\n  const stopStart = Math.min(0.46, fc + bw);\n  let maxPassErr = 0;\n  let maxStop = 0;\n  for (let n = 0; n < N; n++) {\n    const f = 0.5 * n / (N - 1);\n    if (f <= passEnd) {\n      maxPassErr = Math.max(maxPassErr, Math.abs(mag[n] - 1));\n    } else if (f >= stopStart) {\n      maxStop = Math.max(maxStop, mag[n]);\n    }\n  }\n  const stopDb = maxStop > 1e-5 ? (20 * Math.log10(maxStop)).toFixed(1) : '-100.0';\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const L = { x: 38, y: 28, w: 304, h: 180 };\n  const R = { x: 396, y: 28, w: 304, h: 180 };\n\n  function drawPanel(box, title) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(box.x, box.y, box.w, box.h);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(title, box.x, box.y - 9);\n  }\n\n  drawPanel(L, '时域滤波器核 h[i] (右移至 0..M)');\n  drawPanel(R, dbMode ? '频域响应 |H(f)| (对数 dB)' : '频域响应 |H(f)| (线性幅度)');\n\n  const maxPeak = Math.max(kern[M / 2], sincNorm[M / 2], 0.05);\n  const yMinT = -0.35 * maxPeak;\n  const yMaxT = 1.18 * maxPeak;\n  const mapYT = v => L.y + L.h - ((v - yMinT) / (yMaxT - yMinT)) * L.h;\n  const mapXT = i => L.x + (i / M) * L.w;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(L.x, mapYT(0));\n  ctx.lineTo(L.x + L.w, mapYT(0));\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(mapXT(M / 2), L.y);\n  ctx.lineTo(mapXT(M / 2), L.y + L.h);\n  ctx.stroke();\n\n  if (useWin) {\n    ctx.strokeStyle = 'rgba(56,189,248,0.32)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (let i = 0; i <= M; i++) {\n      const x = mapXT(i), y = mapYT(sincNorm[i]);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= M; i++) {\n      const x = mapXT(i), y = mapYT(win[i] * maxPeak);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = useWin ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= M; i++) {\n    const x = mapXT(i), y = mapYT(kern[i]);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = useWin ? '#10b981' : '#ec4899';\n  for (let i = 0; i <= M; i++) {\n    ctx.beginPath();\n    ctx.arc(mapXT(i), mapYT(kern[i]), M > 50 ? 1.7 : 2.4, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  if (!useWin) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    [0, M].forEach(idx => {\n      ctx.beginPath();\n      ctx.arc(mapXT(idx), mapYT(kern[idx]), 6, 0, Math.PI * 2);\n      ctx.stroke();\n    });\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('突兀截断端点!', L.x + 8, mapYT(0) - 12);\n  } else {\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('橙虚线: Blackman 窗包络', L.x + 6, L.y + 14);\n    ctx.fillStyle = 'rgba(56,189,248,0.8)';\n    ctx.fillText('蓝细线: 截断前原 Sinc', L.x + 6, L.y + 28);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('0', L.x, L.y + L.h + 13);\n  ctx.fillText('M/2', mapXT(M / 2), L.y + L.h + 13);\n  ctx.fillText('M=' + M, L.x + L.w, L.y + L.h + 13);\n\n  const mapXF = f => R.x + (f / 0.5) * R.w;\n  let mapYF;\n  if (dbMode) {\n    mapYF = valDb => R.y + R.h - ((Math.max(-100, Math.min(10, valDb)) + 100) / 110) * R.h;\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'right';\n    [0, -20, -40, -60, -80].forEach(g => {\n      const y = mapYF(g);\n      ctx.strokeStyle = g === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';\n      ctx.beginPath();\n      ctx.moveTo(R.x, y);\n      ctx.lineTo(R.x + R.w, y);\n      ctx.stroke();\n      ctx.fillStyle = '#94a3b8';\n      ctx.fillText(g + 'dB', R.x - 4, y + 3);\n    });\n  } else {\n    mapYF = v => R.y + R.h - ((Math.max(-0.15, Math.min(1.25, v)) + 0.15) / 1.4) * R.h;\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'right';\n    [0, 0.5, 1.0].forEach(g => {\n      const y = mapYF(g);\n      ctx.strokeStyle = g === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';\n      ctx.beginPath();\n      ctx.moveTo(R.x, y);\n      ctx.lineTo(R.x + R.w, y);\n      ctx.stroke();\n      ctx.fillStyle = '#94a3b8';\n      ctx.fillText(g.toFixed(1), R.x - 4, y + 3);\n    });\n  }\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.5)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(mapXF(fc), R.y);\n  ctx.lineTo(mapXF(fc), R.y + R.h);\n  ctx.stroke();\n  if (!dbMode) {\n    ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n    ctx.beginPath();\n    ctx.moveTo(mapXF(0), mapYF(1));\n    ctx.lineTo(mapXF(fc), mapYF(1));\n    ctx.lineTo(mapXF(fc), mapYF(0));\n    ctx.lineTo(mapXF(0.5), mapYF(0));\n    ctx.stroke();\n  }\n  ctx.restore();\n\n  ctx.strokeStyle = useWin ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const f = 0.5 * n / (N - 1);\n    const x = mapXF(f);\n    const y = dbMode ? mapYF(db[n]) : mapYF(mag[n]);\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('0', R.x, R.y + R.h + 13);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('fc=' + fc.toFixed(2), mapXF(fc), R.y + R.h + 13);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('0.5 fs', R.x + R.w, R.y + R.h + 13);\n\n  const modeName = useWin ? 'Blackman 加窗' : '无窗矩形截断';\n  lab.setReadout(`${modeName} | M=${M} (${M + 1}点) | fc=${fc.toFixed(2)}fs | 通带最大波纹: ${(maxPassErr * 100).toFixed(2)}% | 阻带泄漏峰值: ${stopDb} dB`);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、绝配的窗函数家族：Hamming 窗 vs Blackman 窗",
      "paragraphs": [
        "解决吉布斯振铃的方法既优雅又简单：在截断后的 sinc 核上，再逐点乘以一条两端平滑收窄到零的钟形曲线——**窗函数（Window）**。两端的悬崖被温柔地削平后，频域上的通带立刻变得平滑如镜，阻带衰减也瞬间暴增。",
        "上世纪 50 年代以来科学家发明了许多以人名命名的窗函数，但真正值得在工程中使用的只有两个：**Hamming 窗（汉明窗）** 和 **Blackman 窗（布莱克曼窗）**。至于常见的其他窗函数均逊色不少：比如 **Bartlett 窗**（三角形直线收尾，阻带仅 `-25 dB` / `5.6%`）、**Hanning 窗**（又叫升余弦窗 `w[i] = 0.5 - 0.5 cos(2πi/M)`，阻带 `-44 dB` / `0.63%`），以及**矩形窗**（等同于不加窗，滚降速度虽比 Blackman 快约 2.5 倍，但阻带只有可怜的 `-21 dB` / `8.9%`）。",
        "那么 Hamming 与 Blackman 该选谁？这是一个经典的工程权衡：",
        "- **Hamming 窗**：过渡带**滚降速度快约 20%**，但阻带衰减只有 `-53 dB`（约漏过 `0.2%`），通带波纹约 `0.2%`。",
        "- **Blackman 窗**：滚降慢 20%，但阻带衰减深达 **`-74 dB`（仅漏过 `0.02%`，比 Hamming 强 10 倍）**，通带波纹也极小（仅 `0.02%`）。",
        "作者给出了黄金法则：**绝大多数情况下把 Blackman 窗作为首选**。因为在实际工程中，过渡带稍微缓一点很容易靠增加 `M` 来弥补，但阻带泄漏太严重往往是致命的。"
      ],
      "formula": {
        "expr": "Hamming: w[i] = 0.54 - 0.46 cos(2πi / M)   |   Blackman: w[i] = 0.42 - 0.5 cos(2πi / M) + 0.08 cos(4πi / M)",
        "explain": "两条窗函数均定义在 i = 0 到 M（共 M + 1 个点）上，乘以移位后的截断 sinc 函数即可得到最终的加窗 Sinc 滤波器核。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：Hamming vs Blackman 实战权衡与实时听感对比",
      "instruction": "点击播放按钮，对比混合了刺耳高频干扰（2200Hz/3200Hz）的音频：先切换「直通原音」感受噪音，再分别切换「矩形截断」「Hamming」「Blackman」，用耳朵验证 -21dB 与 -74dB 的震撼差距！",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "低通截止频率 fc (采样率 8000 Hz)",
          "min": 400,
          "max": 2600,
          "step": 100,
          "value": 900,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "M",
          "label": "滤波器阶数 M (图16-2 默认 50)",
          "min": 16,
          "max": 96,
          "step": 4,
          "value": 50,
          "unit": " 阶"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "跳过滤波 (直通原始含噪信号)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "noWindow",
          "label": "退化为无窗矩形截断 (-21 dB 漏音)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "useBlackman",
          "label": "Blackman 窗 (关闭=Hamming 窗)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波听感对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst simRate = 8000;\nconst len = 12000;\n\nconst inBuf = new Float32Array(len);\nfor (let n = 0; n < len; n++) {\n  const t = n / simRate;\n  const low = 0.34 * Math.sin(2 * Math.PI * 240 * t) + 0.14 * Math.sin(2 * Math.PI * 480 * t);\n  const high = 0.22 * Math.sin(2 * Math.PI * 2200 * t) + 0.16 * Math.sin(2 * Math.PI * 3200 * t);\n  const hiss = 0.05 * Math.sin(2 * Math.PI * 2650 * t) + 0.05 * Math.sin(2 * Math.PI * 3550 * t);\n  inBuf[n] = low + high + hiss;\n}\nconst outBuf = new Float32Array(len);\n\nlet specHam = [];\nlet specBlk = [];\nlet specAct = [];\nlet activeSource = null;\nlet gainNode = null;\nlet animOffset = 0;\n\nfunction buildKernel(M, fcNorm, mode) {\n  const k = new Float32Array(M + 1);\n  let sum = 0;\n  for (let i = 0; i <= M; i++) {\n    const x = i - M / 2;\n    const s = (x === 0) ? (2 * fcNorm) : (Math.sin(2 * Math.PI * fcNorm * x) / (x * Math.PI));\n    let w = 1;\n    if (mode === 'hamming') {\n      w = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / M);\n    } else if (mode === 'blackman') {\n      w = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / M) + 0.08 * Math.cos(4 * Math.PI * i / M);\n    }\n    k[i] = s * w;\n    sum += k[i];\n  }\n  const inv = Math.abs(sum) > 1e-6 ? (1 / sum) : 1;\n  for (let i = 0; i <= M; i++) k[i] *= inv;\n  return k;\n}\n\nfunction computeDbSpec(kern, M, N) {\n  const db = new Float32Array(N);\n  for (let n = 0; n < N; n++) {\n    const f = 0.5 * n / (N - 1);\n    let re = 0, im = 0;\n    for (let i = 0; i <= M; i++) {\n      const ang = 2 * Math.PI * f * i;\n      re += kern[i] * Math.cos(ang);\n      im -= kern[i] * Math.sin(ang);\n    }\n    const m = Math.sqrt(re * re + im * im);\n    db[n] = 20 * Math.log10(Math.max(m, 1e-6));\n  }\n  return db;\n}\n\nfunction stopAudio() {\n  if (activeSource) {\n    try { activeSource.stop(); } catch (e) {}\n    try { activeSource.disconnect(); } catch (e) {}\n    activeSource = null;\n  }\n}\n\nfunction syncAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  const audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n  if (!gainNode) {\n    gainNode = audioCtx.createGain();\n    gainNode.gain.value = 0.42;\n    gainNode.connect(audioCtx.destination);\n  }\n  const buf = audioCtx.createBuffer(1, len, simRate);\n  const ch = buf.getChannelData(0);\n  const src = lab.values.bypass ? inBuf : outBuf;\n  for (let i = 0; i < len; i++) ch[i] = src[i];\n\n  const node = audioCtx.createBufferSource();\n  node.buffer = buf;\n  node.loop = true;\n  node.connect(gainNode);\n  stopAudio();\n  node.start();\n  activeSource = node;\n}\n\nfunction recompute() {\n  const M = Math.round(lab.values.M);\n  const fcHz = lab.values.fc;\n  const fcNorm = fcHz / simRate;\n  const bypass = lab.values.bypass;\n  const noWin = lab.values.noWindow;\n  const useBlk = lab.values.useBlackman;\n\n  const mode = noWin ? 'rect' : (useBlk ? 'blackman' : 'hamming');\n  const kHam = buildKernel(M, fcNorm, 'hamming');\n  const kBlk = buildKernel(M, fcNorm, 'blackman');\n  const kAct = bypass ? null : (mode === 'hamming' ? kHam : (mode === 'blackman' ? kBlk : buildKernel(M, fcNorm, 'rect')));\n\n  const N = 220;\n  specHam = computeDbSpec(kHam, M, N);\n  specBlk = computeDbSpec(kBlk, M, N);\n  specAct = bypass ? new Float32Array(N).fill(0) : (mode === 'hamming' ? specHam : (mode === 'blackman' ? specBlk : computeDbSpec(kAct, M, N)));\n\n  if (!bypass) {\n    for (let n = 0; n < len; n++) {\n      let acc = 0;\n      for (let i = 0; i <= M; i++) {\n        let idx = n - i;\n        if (idx < 0) idx += len;\n        acc += inBuf[idx] * kAct[i];\n      }\n      outBuf[n] = acc;\n    }\n  } else {\n    for (let n = 0; n < len; n++) outBuf[n] = inBuf[n];\n  }\n\n  const idx2200 = Math.round((2200 / 4000) * (N - 1));\n  const atten2200 = specAct[idx2200].toFixed(1);\n  let modeText = '';\n  if (bypass) modeText = '直通原音 (未滤波)';\n  else if (noWin) modeText = '无窗矩形截断 (~ -21dB)';\n  else if (useBlk) modeText = 'Blackman 窗 (-74dB)';\n  else modeText = 'Hamming 窗 (-53dB)';\n\n  lab.setReadout(`当前: ${modeText} | fc=${fcHz}Hz, M=${M} | 对 2200Hz 干扰的实测衰减: ${atten2200} dB`);\n  syncAudio();\n  draw();\n}\n\nfunction draw() {\n  const M = Math.round(lab.values.M);\n  const fcHz = lab.values.fc;\n  const bypass = lab.values.bypass;\n  const noWin = lab.values.noWindow;\n  const useBlk = lab.values.useBlackman;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const L = { x: 42, y: 28, w: 306, h: 180 };\n  const R = { x: 392, y: 28, w: 310, h: 180 };\n\n  [L, R].forEach((b, idx) => {\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(b.x, b.y, b.w, b.h);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(idx === 0 ? '频响 dB 对比 (图 16-2c)' : '时域波形对比 (浅=原声 / 亮=滤波后)', b.x, b.y - 9);\n  });\n\n  const mapXF = hz => L.x + (hz / 4000) * L.w;\n  const mapYD = d => L.y + L.h - ((Math.max(-100, Math.min(10, d)) + 100) / 110) * L.h;\n\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'right';\n  [0, -20, -40, -60, -80].forEach(g => {\n    const y = mapYD(g);\n    ctx.strokeStyle = g === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(L.x, y);\n    ctx.lineTo(L.x + L.w, y);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(g + '', L.x - 4, y + 3);\n  });\n\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (let n = 0; n < specHam.length; n++) {\n    const x = mapXF(4000 * n / (specHam.length - 1));\n    const y = mapYD(specHam[n]);\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(16,185,129,0.45)';\n  ctx.beginPath();\n  for (let n = 0; n < specBlk.length; n++) {\n    const x = mapXF(4000 * n / (specBlk.length - 1));\n    const y = mapYD(specBlk[n]);\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  const activeColor = bypass ? '#f8fafc' : (noWin ? '#ec4899' : (useBlk ? '#10b981' : '#38bdf8'));\n  ctx.strokeStyle = activeColor;\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let n = 0; n < specAct.length; n++) {\n    const x = mapXF(4000 * n / (specAct.length - 1));\n    const y = mapYD(specAct[n]);\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Signal markers\n  [[240, '#10b981', '基音'], [2200, '#f59e0b', '2.2k干扰']].forEach(([hz, col, lbl]) => {\n    const mx = mapXF(hz);\n    ctx.strokeStyle = col;\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(mx, L.y + L.h - 14);\n    ctx.lineTo(mx, L.y + L.h);\n    ctx.stroke();\n    ctx.fillStyle = col;\n    ctx.font = '9px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText(lbl, mx, L.y + L.h - 17);\n  });\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('0', L.x, L.y + L.h + 13);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('fc=' + fcHz + 'Hz', mapXF(fcHz), L.y + L.h + 13);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('4000Hz', L.x + L.w, L.y + L.h + 13);\n\n  // Right Panel: 20 ms waveform (160 samples)\n  const mapYW = v => R.y + R.h / 2 - (v / 1.0) * (R.h * 0.45);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath();\n  ctx.moveTo(R.x, mapYW(0));\n  ctx.lineTo(R.x + R.w, mapYW(0));\n  ctx.stroke();\n\n  const winSamps = 160;\n  const delay = bypass ? 0 : Math.round(M / 2);\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (let i = 0; i < winSamps; i++) {\n    const x = R.x + (i / (winSamps - 1)) * R.w;\n    const y = mapYW(inBuf[(animOffset + i) % len]);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = activeColor;\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i < winSamps; i++) {\n    const x = R.x + (i / (winSamps - 1)) * R.w;\n    const y = mapYW(outBuf[(animOffset + i + delay) % len]);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('窗口: 20 ms (已对齐 M/2 延迟)', R.x + 6, R.y + 14);\n  ctx.fillStyle = activeColor;\n  ctx.fillText(bypass ? '直通输出' : (noWin ? '矩形截断 (高频锯齿仍存)' : '平滑滤波输出'), R.x + 6, R.y + R.h - 8);\n}\n\nlab.onUpdate(recompute);\nlab.onLoop((dt, t) => {\n  if (lab.values.play) {\n    animOffset = Math.floor(t * 240) % len;\n    draw();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要试图通过「加大核长度 M」来消除矩形截断的吉布斯振铃——断崖式截断引起的通带波纹和 -21 dB 阻带泄漏与 M 无关，必须靠窗函数把两端平滑压零。",
        "实际工程编写滤波器核数组时，把下标从 [-M/2, M/2] 整体右移成 [0, M] 即可告别负数下标烦恼，代价仅仅是输出信号整体延迟 M/2 个采样点。",
        "绝大多数场景请优先选用 Blackman 窗（-74 dB 阻带衰减、0.02% 通带波纹）；虽然滚降比 Hamming 窗慢 20%，但把阻带关死比滚降快一点重要得多，滚降慢只需稍微增大 M 即可轻松解决。"
      ]
    }
  ]
});
