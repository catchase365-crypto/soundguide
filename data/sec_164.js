window.__BOOK_REGISTER_SECTION__("sec_164", {
  "title": "高保真音频技术 (High Fidelity Audio)",
  "intuition": "高保真音频的设计哲学只有一个词——“性能过剩 (Overkill)”：通过超越人耳听觉极限的采样率、巧妙的光学坑点编码、多速率过采样滤波与心理声学延迟，把脆弱的数字比特流变成仿佛置身音乐厅现场的立体声体验。",
  "blocks": [
    {
      "type": "concept",
      "heading": "“性能过剩”的艺术：CD 如何重新定义高保真",
      "paragraphs": [
        "发烧友（Audiophiles）对音质的追求几乎不计成本——所有其他工程约束都得为音质让路。如果用一个词概括高保真音频系统的设计思路，那就是 **性能过剩（Overkill）**：它不是去“刚好匹配”人耳的听觉能力，而是刻意**超越**人耳极限（20 Hz ~ 20 kHz），以确保音乐回放毫无瑕疵。",
        "1980 年代诞生的**激光唱片（Compact Disc, CD）**将数字音频推向大众，音质远超黑胶唱片与磁带。CD 采用 **44.1 kHz** 采样率与 **16-bit** 量化精度，单声道数据率为 `44100 × 16 ≈ 706 kbits/sec`，双声道立体声有效音频数据率约为 `1.4 Mbits/sec`。数字信号处理（DSP）正是贯穿这一革命的核心引擎。"
      ],
      "formula": {
        "expr": "R_audio = f_s × B × N_ch ≈ 44.1 kHz × 16 bits × 2 ≈ 1.41 Mbits/sec",
        "explain": "f_s 为采样率（44.1 kHz），B 为每样本量化位数（16 bit），N_ch 为声道数（立体声为 2），决定原始未压缩音频流的数据率。"
      }
    },
    {
      "type": "concept",
      "heading": "显微镜下的 CD：物理极限、恒定线速度与 EFM 编码",
      "paragraphs": [
        "在显微镜下，CD 表面是一层高反射率铝膜，数字信息以激光烧蚀出的微米级“暗坑（Pits）”记录。与黑胶唱片由外向内不同，CD 轨道**由内向外螺旋延伸**。为了让激光头扫描过轨道的**线速度恒定在 1.2 m/s**，CD 电机必须根据读取半径动态变速——从最内圈的约 **480 rpm** 逐渐降速至最外圈的约 **210 rpm**。",
        "CD 的存储密度高达 `1 bit/μm²`（每平方毫米 100 万比特，整盘约 150 亿比特）。这几乎与同时代集成电路光刻的最小特征尺寸相同，背后的物理天花板是**光的衍射极限**：光束无法聚焦到小于约半个波长（`0.3 μm`）的尺度，再小就会因光学模糊而无法读写。CD 规范要求凹坑宽 `0.5 μm`、深 `0.16 μm`、道间距 `1.6 μm`。",
        "这里出现了一个棘手的工程矛盾：盘片上的原始总比特率高达 **4.3 Mbits/sec**，换算成轨道长度相当于每 **0.28 μm** 就对应 1 bit；但为了降低光学拾取的误码率，物理规范硬性规定每个凹坑或平地长度必须在 **0.8 μm 到 3.5 μm** 之间——也就是说，二进制序列必须聚集成 **3 到 13 个连续相同状态**！",
        "解决方案是 **8-to-14 调制（Eight-to-Fourteen Modulation, EFM）**：写入前，每 8 bit 字节通过查表映射成精心挑选的 14 bit 码字，确保满足游程长度约束；读取时再通过逆查表还原为 8 bit。此外，CD 还叠加了**两级里德-所罗门编码（Two-level Reed-Solomon Coding）**来检测和对抗划痕误码：轻微错误利用冗余数据直接**纠正（Corrected）**，较重错误通过相邻样本插值**掩盖（Concealed）**，严重损坏则置零**静音（Muted）**。EFM 与纠错编码合在一起，使盘片存储速率膨胀了 3 倍（从 1.4 Mbps 增至 4.3 Mbps）。"
      ],
      "formula": {
        "expr": "RPM(r) = (v_linear / (2π · r)) × 60,   v_linear = 1.2 m/s",
        "explain": "v_linear 为恒定扫描线速度（1.2 米/秒），r 为激光头当前读取半径（约 24 mm ~ 55 mm），因此转速需在约 480 rpm 到 210 rpm 之间连续调节。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：CD 恒定线速度 (CLV) 与 EFM 坑点几何仿真",
      "instruction": "拖动“激光读取半径”观察 CD 转速如何反向调节以保持 1.2 m/s 线速度；切换“EFM (8-to-14) 编码”对比原始字节与合法坑点长度（0.8~3.5 μm）的区别。",
      "controls": [
        {
          "type": "slider",
          "id": "radius",
          "label": "激光读取半径 r",
          "min": 24,
          "max": 55,
          "step": 1,
          "value": 24,
          "unit": " mm"
        },
        {
          "type": "slider",
          "id": "byteVal",
          "label": "原始 8-bit 字节数据",
          "min": 0,
          "max": 255,
          "step": 1,
          "value": 170,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "useEfm",
          "label": "启用 EFM (8-to-14) 游程编码",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet angle = 0;\n\nfunction getBitsAndRuns() {\n  const val = Math.round(lab.values.byteVal);\n  const rawBits = [];\n  for (let i = 7; i >= 0; i--) rawBits.push((val >> i) & 1);\n  if (!lab.values.useEfm) {\n    const runs = [];\n    let cur = rawBits[0], len = 1;\n    for (let i = 1; i < rawBits.length; i++) {\n      if (rawBits[i] === cur) len++;\n      else { runs.push({ bit: cur, len }); cur = rawBits[i]; len = 1; }\n    }\n    runs.push({ bit: cur, len });\n    return { bits: rawBits, runs };\n  }\n  const l1 = 3 + (val & 3);\n  const l2 = 3 + ((val >> 2) & 3);\n  const l3 = 3 + ((val >> 4) & 1);\n  const l4 = 14 - l1 - l2 - l3;\n  const lens = l4 >= 3 ? [l1, l2, l3, l4] : [3, 4, 3, 4];\n  const startBit = (val >> 7) & 1;\n  const efmBits = [];\n  const runs = [];\n  let b = startBit;\n  for (let k = 0; k < lens.length; k++) {\n    runs.push({ bit: b, len: lens[k] });\n    for (let j = 0; j < lens[k]; j++) efmBits.push(b);\n    b = 1 - b;\n  }\n  return { bits: efmBits, runs };\n}\n\nfunction drawScene() {\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  const rMm = lab.values.radius;\n  const rpm = (1.2 / (2 * Math.PI * (rMm / 1000))) * 60;\n  const cx = 122, cy = 120, outerR = 96, innerHole = 20;\n  const rPx = 38 + ((rMm - 24) / (55 - 24)) * (outerR - 42);\n\n  ctx.save();\n  ctx.translate(cx, cy);\n  ctx.rotate(angle);\n  const grad = ctx.createRadialGradient(0, 0, innerHole, 0, 0, outerR);\n  grad.addColorStop(0, '#1e293b');\n  grad.addColorStop(0.5, '#334155');\n  grad.addColorStop(1, '#0f172a');\n  ctx.fillStyle = grad;\n  ctx.beginPath(); ctx.arc(0, 0, outerR, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  for (let tr = 38; tr <= outerR - 4; tr += 8) {\n    ctx.beginPath();\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.arc(0, 0, tr, 0, Math.PI * 2);\n    ctx.stroke();\n  }\n  for (let s = 0; s < 3; s++) {\n    const a = (s * Math.PI * 2) / 3;\n    ctx.beginPath();\n    ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n    ctx.lineWidth = 2;\n    ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 26);\n    ctx.lineTo(Math.cos(a) * (outerR - 4), Math.sin(a) * (outerR - 4));\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#020617';\n  ctx.beginPath(); ctx.arc(0, 0, innerHole, 0, Math.PI * 2); ctx.fill();\n  ctx.restore();\n\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.arc(cx, cy, rPx, 0, Math.PI * 2);\n  ctx.stroke();\n\n  const lx = cx + rPx;\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(lx, cy, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('CLV 旋转盘面 (1.2 m/s)', 52, 16);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('转速: ' + rpm.toFixed(0) + ' rpm', 78, 232);\n\n  const rx = 258, rw = 444;\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.strokeRect(rx, 18, rw, 204);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  const modeTitle = lab.values.useEfm ? 'EFM 映射后 14-bit 轨道凹坑 (每 bit = 0.28 μm)' : '未编码原始 8-bit 轨道 (违反最小凹坑长度 0.8 μm！)';\n  ctx.fillText(modeTitle, rx + 14, 40);\n\n  const { bits, runs } = getBitsAndRuns();\n  const bitW = Math.min(28, (rw - 40) / bits.length);\n  const startX = rx + 20;\n  const trackY = 92;\n\n  ctx.fillStyle = 'rgba(148,163,184,0.18)';\n  ctx.fillRect(startX, trackY, bits.length * bitW, 38);\n\n  let curX = startX;\n  let validAll = true;\n  for (let i = 0; i < runs.length; i++) {\n    const run = runs[i];\n    const segW = run.len * bitW;\n    const um = run.len * 0.28;\n    const ok = um >= 0.8 && um <= 3.5;\n    if (!ok) validAll = false;\n    if (run.bit === 1) {\n      ctx.fillStyle = ok ? '#10b981' : '#ec4899';\n      ctx.beginPath();\n      ctx.roundRect(curX + 1, trackY + 7, segW - 2, 24, 6);\n      ctx.fill();\n    } else {\n      ctx.strokeStyle = ok ? '#38bdf8' : '#ec4899';\n      ctx.lineWidth = 1.5;\n      ctx.strokeRect(curX + 1, trackY + 7, segW - 2, 24);\n    }\n    ctx.fillStyle = ok ? '#f8fafc' : '#ec4899';\n    ctx.font = '11px monospace';\n    ctx.fillText(um.toFixed(2) + 'μm', curX + 2, trackY + 56);\n    curX += segW;\n  }\n\n  for (let i = 0; i < bits.length; i++) {\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '11px monospace';\n    ctx.fillText(String(bits[i]), startX + i * bitW + bitW * 0.35, trackY - 8);\n  }\n\n  ctx.fillStyle = validAll ? '#10b981' : '#ec4899';\n  ctx.font = '12px sans-serif';\n  const statusMsg = validAll\n    ? '✓ 所有坑/陆长度均满足 0.8 μm ~ 3.5 μm 光学规范 (3~12 bit 游程)'\n    : '✗ 警告：出现 < 0.8 μm 的过短特征，受 0.3 μm 衍射极限影响极易误码！';\n  ctx.fillText(statusMsg, rx + 14, 182);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('输入字节: 0x' + Math.round(lab.values.byteVal).toString(16).toUpperCase().padStart(2, '0') + ' (' + bits.join('') + ')', rx + 14, 206);\n\n  lab.setReadout('读取半径 r = ' + rMm + ' mm | 电机转速 = ' + rpm.toFixed(0) + ' rpm | 恒定线速度 = 1.20 m/s | 轨道序列: ' + bits.length + ' bits (' + (validAll ? '物理合法' : '物理越界') + ')');\n}\n\nlab.onUpdate(drawScene);\nlab.onLoop((dt) => {\n  const rMm = lab.values.radius;\n  const rpm = (1.2 / (2 * Math.PI * (rMm / 1000))) * 60;\n  angle += (rpm / 60) * Math.PI * 2 * 0.15 * dt;\n  drawScene();\n});"
    },
    {
      "type": "concept",
      "heading": "4 倍过采样插值与“性能过剩”的贝塞尔滤波器",
      "paragraphs": [
        "经过 EFM 解码和里德-所罗门纠错后，信号恢复为 **44.1 kHz / 16-bit** 的数字音频流。如果直接把它送入 16-bit DAC，后面的模拟低通滤波器将面临地狱级难度：必须在 **20 kHz** 以内几乎无衰减地通过所有音乐信号，同时在短短 2.05 kHz 的窄过渡带内彻底抑制 **22.05 kHz**（奈奎斯特频率 `f_s / 2`）以上的全部镜像频谱！这需要极高阶、极昂贵且易失真的模拟电路。",
        "现代 CD 播放机采用**多速率（Multirate）过采样插值**技术巧妙破局，通常先将采样率提升 **4 倍**，从 `44.1 kHz` 变为 **`176.4 kHz`**。原理上可分为两步（实际芯片常合并优化）：",
        "第一步是**插零升采样**：在每两个原始样本之间插入 3 个值为零的样本。在频域上，这相当于把原本 `0 ~ 22.05 kHz` 的音频频谱原封不动地复制了 3 份，分别出现在 `22.05 ~ 44.1 kHz`、`44.1 ~ 66.15 kHz` 和 `66.15 ~ 88.2 kHz`。第二步是用高效的**数字低通滤波器**干脆利落地切除这 3 份多余的频谱镜像，只保留 `0 ~ 20 kHz`。",
        "这一招带来了三大神级收益：① 采样间隔缩小为 1/4，DAC 输出的台阶波形变得平滑得多；② 奈奎斯特频率被推高了 4 倍，来到 **88.2 kHz**！模拟低通滤波器只需放行 `20 kHz` 以下并阻挡 `88.2 kHz` 以上，过渡带宽暴涨至 `68.2 kHz`，用极其简单的**三阶贝塞尔滤波器（3-pole Bessel Filter）**即可胜任（人耳其实对相位不敏感，选用相位线性的贝塞尔滤波器纯粹是为了“过剩”）；③ 采样点数翻了 4 倍，即使 DAC 精度从 **16-bit 降为 15-bit（或如图 22-6 中的 14-bit）** 也不会损失主观听感音质，且 DAC 零阶保持效应引起的 `sin(x)/x` 高频滚降补偿也可轻松融入数字或模拟滤波器中。"
      ],
      "formula": {
        "expr": "f_s' = 4 × 44.1 kHz = 176.4 kHz  ⇒  f_Nyquist' = 88.2 kHz",
        "explain": "通过 4 倍插值，奈奎斯特频率从 22.05 kHz 跃升至 88.2 kHz，将模拟抗镜像滤波器的过渡带从苛刻的 2.05 kHz 放宽到极其宽松的 68.2 kHz。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：4 倍过采样插值与频域镜像搬移实验室",
      "instruction": "调节信号频率并逐个切换开关，观察左图时域台阶如何变平滑，以及右图 3 份镜像频谱是如何先出现、再被数字滤波器切除，最后如何被平缓的 3 阶模拟贝塞尔滤波器收尾。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "音频信号频率",
          "min": 2,
          "max": 19,
          "step": 1,
          "value": 8,
          "unit": " kHz"
        },
        {
          "type": "toggle",
          "id": "oversample",
          "label": "1. 开启 4× 插零升采样 (176.4 kHz)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "digFilter",
          "label": "2. 开启数字低通滤波器 (滤除镜像)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "bessel",
          "label": "3. 显示 3 阶模拟贝塞尔滤波器曲线",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  const f = lab.values.freq;\n  const over = lab.values.oversample;\n  const digF = lab.values.digFilter;\n  const bessel = lab.values.bessel;\n\n  const tx = 18, ty = 32, tw = 322, th = 178;\n  const midY = ty + th / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(tx, ty, tw, th);\n  ctx.beginPath(); ctx.moveTo(tx, midY); ctx.lineTo(tx + tw, midY); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域波形 (0 ~ 0.25 ms)', tx + 4, 20);\n\n  const Tmax = 0.25;\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.lineWidth = 1.5;\n  for (let px = 0; px <= tw; px += 2) {\n    const tMs = (px / tw) * Tmax;\n    const y = midY - Math.sin(2 * Math.PI * f * tMs) * 68;\n    if (px === 0) ctx.moveTo(tx + px, y); else ctx.lineTo(tx + px, y);\n  }\n  ctx.stroke();\n\n  const fs = over ? 176.4 : 44.1;\n  const dtMs = 1000 / fs;\n  const nPts = Math.floor(Tmax / dtMs);\n\n  if (!over || digF) {\n    ctx.beginPath();\n    ctx.strokeStyle = over ? '#10b981' : '#f59e0b';\n    ctx.lineWidth = 2;\n    for (let i = 0; i <= nPts; i++) {\n      const tMs = i * dtMs;\n      const x = tx + (tMs / Tmax) * tw;\n      const nextX = Math.min(tx + tw, tx + ((tMs + dtMs) / Tmax) * tw);\n      const y = midY - Math.sin(2 * Math.PI * f * tMs) * 68;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n      ctx.lineTo(nextX, y);\n    }\n    ctx.stroke();\n  }\n\n  for (let i = 0; i <= nPts; i++) {\n    const tMs = i * dtMs;\n    const x = tx + (tMs / Tmax) * tw;\n    const isOrig = !over || (i % 4 === 0);\n    const val = (over && !digF && !isOrig) ? 0 : Math.sin(2 * Math.PI * f * tMs);\n    const y = midY - val * 68;\n    ctx.fillStyle = isOrig ? '#f59e0b' : (digF ? '#10b981' : '#38bdf8');\n    ctx.beginPath();\n    ctx.arc(x, y, isOrig ? 3.5 : 2.3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  const fx = 368, fy = 32, fw = 334, fh = 178;\n  const baseY = fy + fh - 12;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(fx, fy, fw, fh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('频域分布 (0 ~ 88.2 kHz)', fx + 4, 20);\n\n  const maxF = 88.2;\n  const marks = [22.05, 44.1, 66.15, 88.2];\n  ctx.font = '10px monospace';\n  for (let m = 0; m < marks.length; m++) {\n    const mx = fx + (marks[m] / maxF) * fw;\n    ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath(); ctx.moveTo(mx, fy); ctx.lineTo(mx, fy + fh); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(marks[m].toFixed(1), mx - 14, fy + fh + 13);\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('0 kHz', fx, fy + fh + 13);\n\n  const spikes = [{ freq: f, orig: true }];\n  if (over) {\n    spikes.push({ freq: 44.1 - f, orig: false });\n    spikes.push({ freq: 44.1 + f, orig: false });\n    spikes.push({ freq: 88.2 - f, orig: false });\n  } else {\n    spikes.push({ freq: 44.1 - f, orig: false });\n    spikes.push({ freq: 44.1 + f, orig: false });\n    spikes.push({ freq: 88.2 - f, orig: false });\n  }\n\n  for (let s = 0; s < spikes.length; s++) {\n    const sp = spikes[s];\n    const sx = fx + (sp.freq / maxF) * fw;\n    const suppressed = !sp.orig && over && digF;\n    const h = suppressed ? 18 : 130;\n    ctx.strokeStyle = sp.orig ? '#10b981' : (suppressed ? 'rgba(236,72,153,0.3)' : '#ec4899');\n    ctx.lineWidth = sp.orig ? 3.5 : 2.5;\n    if (suppressed) ctx.setLineDash([3, 3]);\n    ctx.beginPath(); ctx.moveTo(sx, baseY); ctx.lineTo(sx, baseY - h); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = sp.orig ? '#10b981' : (suppressed ? 'rgba(236,72,153,0.45)' : '#ec4899');\n    ctx.font = '10px sans-serif';\n    ctx.fillText(sp.freq.toFixed(1) + 'k', sx - 12, baseY - h - 5);\n  }\n\n  if (bessel) {\n    ctx.beginPath();\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    const fc = over ? 36 : 20.5;\n    const order = over ? 3 : 12;\n    for (let px = 0; px <= fw; px += 2) {\n      const fk = (px / fw) * maxF;\n      const mag = 1 / Math.sqrt(1 + Math.pow(fk / fc, 2 * order));\n      const y = baseY - mag * 145;\n      if (px === 0) ctx.moveTo(fx + px, y); else ctx.lineTo(fx + px, y);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(over ? '3阶贝塞尔模拟滤波器 (轻松滚降)' : '无过采样需极陡峭砖墙模拟滤波!', fx + 8, fy + 16);\n  }\n\n  const nyq = over ? '88.2 kHz' : '22.05 kHz';\n  const trans = over ? '68.2 kHz (极易实现)' : '2.05 kHz (极其苛刻)';\n  lab.setReadout('采样率: ' + fs + ' kHz | 奈奎斯特频率: ' + nyq + ' | 模拟过渡带: ' + trans + ' | 数字镜像抑制: ' + (over && digF ? '已清除 3 份镜像' : '存在高频镜像'));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "立体声混音与杜比环绕声（15~30 ms 延迟的心理声学魔术）",
      "paragraphs": [
        "多声道音频被称为**立体声（Stereo，源自希腊语“立体的、三维的”）**。相比单声道的平淡干瘪，双声道立体声能让人仿佛置身于距乐手几英尺之外。20 世纪 60 年代早期的立体声唱片常常简单粗暴地把某位歌手只塞进左或右声道，但很快发展成了精密的**混音（Mix-down）**艺术——将录音棚里几十支麦克风的声音精心合成到左右两个声道，塑造“身临其境”的空间感。",
        "电影院则进一步扩展到四声道：**杜比立体声（Dolby Stereo）**（家用版称为 **Dolby Surround Pro Logic**），包含左（L）、右（R）、中置（Center）和环绕（Surround）。聪明的是，这四个声道会被矩阵编码进标准双声道立体声轨中，由播放端的杜比解码器实时还原。",
        "其中最精妙的设计是**中置声道**与**环绕声道**的配合：中置音箱紧贴银幕上下方，专门负责对白与视觉绑定音效，保证无论观众坐在影厅哪个角落，声音都牢牢锚定在银幕人物嘴边；而分布在观众两侧的环绕音箱（大型影院可达 20 只），不仅只保留 **100 Hz ~ 7 kHz** 的中频段，还特意施加了 **15 ~ 30 毫秒的延迟**！",
        "为什么延迟 15 ~ 30 毫秒这么关键？因为人脑具备**哈斯效应（优先效应）**：当同一段语音先从前方中置音箱到达耳朵，15~30 ms 后再从侧面环绕音箱到达时，大脑会把迟到的侧面声音自动识别为“墙壁反射回声”并忽略其方向信息——既营造了宏大的影厅包裹感，又绝对不会把主角的说话声拉偏到侧面去。"
      ],
      "formula": {
        "expr": "15 ms ≤ Δt_surround ≤ 30 ms  (100 Hz ~ 7 kHz)",
        "explain": "Δt_surround 为环绕声道相对前方中置声道的时间延迟。在此窗口内，人脑将延迟声波归类为房间自然反射，确保语音声像牢牢锁定在银幕正前方。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 3：杜比环绕声 15~30 ms 延迟与哈斯效应听觉定位",
      "instruction": "戴上耳机或打开立体声扬声器点击“播放”，拖动环绕延迟滑块对比：0 ms 时声像会被拉偏/发散；调至 15~30 ms 黄金窗口，声像瞬间稳稳锁回前方银幕，同时保留空间包裹感！",
      "controls": [
        {
          "type": "slider",
          "id": "delayMs",
          "label": "环绕声道延迟 Δt",
          "min": 0,
          "max": 45,
          "step": 1,
          "value": 22,
          "unit": " ms"
        },
        {
          "type": "slider",
          "id": "surroundMix",
          "label": "环绕声道相对电平",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 75,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "bandLimit",
          "label": "环绕仅保留中频 (100 Hz~7 kHz)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对白脉冲定位对比",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet audioTimer = 0;\nlet wavePhase = 0;\nlet activeNodes = null;\n\nfunction ensureAudio() {\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!activeNodes) {\n    const master = ac.createGain();\n    master.gain.value = 0.45;\n    master.connect(ac.destination);\n    const merger = ac.createChannelMerger(2);\n    merger.connect(master);\n\n    const cGain = ac.createGain();\n    cGain.gain.value = 0.65;\n    cGain.connect(merger, 0, 0);\n    cGain.connect(merger, 0, 1);\n\n    const sFilter = ac.createBiquadFilter();\n    sFilter.type = 'bandpass';\n    sFilter.frequency.value = 1200;\n    sFilter.Q.value = 0.55;\n\n    const sDelay = ac.createDelay(0.1);\n    const sGainL = ac.createGain();\n    const sGainR = ac.createGain();\n    sFilter.connect(sDelay);\n    sDelay.connect(sGainL);\n    sDelay.connect(sGainR);\n    sGainL.connect(merger, 0, 0);\n    sGainR.connect(merger, 0, 1);\n\n    activeNodes = { ac, master, cGain, sFilter, sDelay, sGainL, sGainR };\n  }\n  return activeNodes;\n}\n\nfunction updateAudioParams() {\n  if (!activeNodes) return;\n  const { ac, sFilter, sDelay, sGainL, sGainR } = activeNodes;\n  const now = ac.currentTime;\n  sDelay.delayTime.setTargetAtTime(lab.values.delayMs / 1000, now, 0.015);\n  const g = (lab.values.surroundMix / 100) * 0.55;\n  sGainL.gain.setTargetAtTime(g, now, 0.015);\n  sGainR.gain.setTargetAtTime(-g, now, 0.015);\n  sFilter.type = lab.values.bandLimit ? 'bandpass' : 'allpass';\n}\n\nfunction triggerBurst() {\n  if (!lab.values.play) return;\n  const nodes = ensureAudio();\n  updateAudioParams();\n  const { ac, cGain, sFilter } = nodes;\n  const t0 = ac.currentTime + 0.01;\n\n  const osc1 = ac.createOscillator();\n  const osc2 = ac.createOscillator();\n  const env = ac.createGain();\n  osc1.type = 'triangle';\n  osc2.type = 'sine';\n  osc1.frequency.setValueAtTime(280, t0);\n  osc1.frequency.exponentialRampToValueAtTime(160, t0 + 0.14);\n  osc2.frequency.setValueAtTime(840, t0);\n  osc2.frequency.exponentialRampToValueAtTime(480, t0 + 0.14);\n\n  env.gain.setValueAtTime(0.0001, t0);\n  env.gain.linearRampToValueAtTime(0.85, t0 + 0.008);\n  env.gain.exponentialRampToValueAtTime(0.001, t0 + 0.16);\n\n  osc1.connect(env);\n  osc2.connect(env);\n  env.connect(cGain);\n  env.connect(sFilter);\n\n  osc1.start(t0);\n  osc2.start(t0);\n  osc1.stop(t0 + 0.18);\n  osc2.stop(t0 + 0.18);\n  wavePhase = 0.001;\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  const delay = lab.values.delayMs;\n  const mix = lab.values.surroundMix;\n  const inSweetSpot = delay >= 15 && delay <= 30;\n  const isEcho = delay > 30;\n  const isPulling = delay < 10 && mix > 20;\n\n  const rx = 20, ry = 18, rw = 280, rh = 204;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  const cx = rx + rw / 2, cy = ry + 115;\n  ctx.fillStyle = '#334155';\n  ctx.fillRect(cx - 70, ry + 10, 140, 8);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(cx - 18, ry + 20, 36, 12);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('中置 (Center 0ms)', cx - 44, ry + 45);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(rx + 10, cy - 16, 12, 32);\n  ctx.fillRect(rx + rw - 22, cy - 16, 12, 32);\n  ctx.fillText('环绕 L', rx + 8, cy + 30);\n  ctx.fillText('环绕 R', rx + rw - 42, cy + 30);\n\n  if (wavePhase > 0 && wavePhase < 1) {\n    const rFront = wavePhase * 115;\n    ctx.strokeStyle = 'rgba(16,185,129,' + (1 - wavePhase).toFixed(2) + ')';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.arc(cx, ry + 28, rFront, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();\n    const lag = delay / 60;\n    if (wavePhase > lag && mix > 0) {\n      const wp2 = (wavePhase - lag) / (1 - lag);\n      const rSide = wp2 * 125;\n      ctx.strokeStyle = 'rgba(56,189,248,' + ((1 - wp2) * (mix / 100)).toFixed(2) + ')';\n      ctx.beginPath(); ctx.arc(rx + 20, cy, rSide, -0.4 * Math.PI, 0.4 * Math.PI); ctx.stroke();\n      ctx.beginPath(); ctx.arc(rx + rw - 20, cy, rSide, 0.6 * Math.PI, 1.4 * Math.PI); ctx.stroke();\n    }\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(cx, cy + 12, 11, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#0f172a';\n  ctx.font = 'bold 10px sans-serif';\n  ctx.fillText('人耳', cx - 10, cy + 16);\n\n  const drift = isPulling ? ((10 - delay) / 10) * (mix / 100) * 65 : 0;\n  const imgY = ry + 62 + (isPulling ? 30 : 0);\n  const imgX = cx - drift;\n  ctx.fillStyle = inSweetSpot ? '#10b981' : (isEcho ? '#f59e0b' : (isPulling ? '#ec4899' : '#38bdf8'));\n  ctx.beginPath(); ctx.arc(imgX, imgY, 8, 0, Math.PI * 2); ctx.fill();\n  ctx.font = '11px sans-serif';\n  ctx.fillText('感知声像', imgX + 12, imgY + 4);\n\n  const tx = 324, ty = 18, tw = 376, th = 204;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(tx, ty, tw, th);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('声音到达人耳时间轴 (0 ~ 50 ms)', tx + 14, ty + 22);\n\n  const barX = tx + 24, barW = tw - 48, baseY = ty + 148;\n  const x15 = barX + (15 / 50) * barW;\n  const x30 = barX + (30 / 50) * barW;\n  ctx.fillStyle = 'rgba(16,185,129,0.16)';\n  ctx.fillRect(x15, ty + 42, x30 - x15, baseY - (ty + 42));\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('杜比黄金区 (15~30 ms)', x15 - 12, ty + 56);\n\n  ctx.strokeStyle = '#94a3b8';\n  ctx.beginPath(); ctx.moveTo(barX, baseY); ctx.lineTo(barX + barW, baseY); ctx.stroke();\n  for (let ms = 0; ms <= 50; ms += 10) {\n    const mx = barX + (ms / 50) * barW;\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.fillText(ms + 'ms', mx - 10, baseY + 14);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 4;\n  ctx.beginPath(); ctx.moveTo(barX, baseY); ctx.lineTo(barX, baseY - 82); ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('中置直达声', barX - 4, baseY - 88);\n\n  const sx = barX + (delay / 50) * barW;\n  const sh = Math.max(8, (mix / 100) * 68);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 4;\n  ctx.beginPath(); ctx.moveTo(sx, baseY); ctx.lineTo(sx, baseY - sh); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('环绕声 (' + delay + 'ms)', sx - 24, baseY - sh - 8);\n\n  let verdict = '正常过渡区';\n  if (inSweetSpot) verdict = '✓ 哈斯效应生效：人脑将环绕视为墙面反射，对白稳锁银幕！';\n  else if (isPulling) verdict = '✗ 延迟过短：环绕声抢走注意力，声像偏离银幕！';\n  else if (isEcho) verdict = '⚠ 延迟过长：超出融合窗，人耳开始听出分离的回声！';\n  ctx.fillStyle = inSweetSpot ? '#10b981' : (isPulling ? '#ec4899' : '#f59e0b');\n  ctx.font = '12px sans-serif';\n  ctx.fillText(verdict, tx + 16, ty + 190);\n\n  lab.setReadout('环绕延迟: ' + delay + ' ms | 环绕电平: ' + mix + '% | 频带: ' + (lab.values.bandLimit ? '100 Hz~7 kHz' : '全频带') + ' | ' + (lab.values.play ? '音频运行中' : '音频已暂停'));\n}\n\nlab.onUpdate(() => {\n  updateAudioParams();\n  if (lab.values.play && !activeNodes) triggerBurst();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    audioTimer += dt;\n    if (audioTimer >= 0.85) {\n      audioTimer = 0;\n      triggerBurst();\n    }\n  } else {\n    audioTimer = 0.7;\n  }\n  if (wavePhase > 0) {\n    wavePhase += dt * 1.4;\n    if (wavePhase >= 1) wavePhase = 0;\n  }\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "CD 系统的核心哲学是“超越极限”：44.1 kHz / 16-bit 覆盖全听觉带，物理坑点尺寸（0.8~3.5 μm）受限于 0.3 μm 光学衍射极限。",
        "不要被表面比特率迷惑：CD 盘片上读取的是 4.3 Mbits/sec，其中 2/3 是 EFM（8-to-14 调制）和两级里德-所罗门纠错编码带来的保护冗余，真正立体声音频只占 1.4 Mbits/sec。",
        "多速率 4× 过采样（176.4 kHz）的真正工程价值，是用廉价高效的数字滤波器取代昂贵陡峭的模拟“砖墙”滤波器——奈奎斯特频率翻 4 倍后，简单的 3 阶贝塞尔模拟滤波器就能搞定抗镜像。",
        "在多声道空间音频中，时间差比音量差更影响方位感：杜比环绕利用 15~30 ms 的延迟（哈斯效应）让大脑将其自动降级为环境反射声，从而把人物对白牢牢钉在银幕正中央。"
      ]
    }
  ]
});
