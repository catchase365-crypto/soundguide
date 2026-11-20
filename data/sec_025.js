window.__BOOK_REGISTER_SECTION__("sec_025", {
  "title": "医学影像中的 DSP：从 X 光阴影到 CT 与核磁共振 (Medical Imaging)",
  "intuition": "传统 X 光只是把三维人体拍扁成一张“影子画”，而数字信号处理（DSP）借助多角度投影计算与量子共振信号解码，让我们无创看清人体切片的精细结构乃至血流生理活动。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 革命与困境：传统医学 X 光的四大瓶颈",
      "paragraphs": [
        "1895 年，威廉·康拉德·伦琴（Wilhelm Conrad Röntgen）发现 X 射线能够穿透相当厚度的物质。能够直接透视活体内部彻底革新了医学，短短几年内，医用 X 光系统就普及到了全世界。",
        "尽管取得了巨大成功，但直到 20 世纪 70 年代数字信号处理（DSP）及相关技术出现之前，传统医学 X 光成像一直受困于**四个致命局限**：",
        "1. **结构重叠遮挡**：人体内部的三维器官会前后叠在一起，后方的组织会被前方隐藏。例如，**肋骨后方的部分心脏在平面 X 光片上根本看不清楚**。",
        "2. **相似组织难分辨**：X 光擅长区分密度差异极悬殊的组织（如骨骼与软组织），但很难区分密度相近的软组织——比如**无法清晰地把肝脏中的肿瘤从正常肝组织中分辨出来**。",
        "3. **只见解剖（结构），不见生理（功能）**：X 光片只反映静态的身体结构（Anatomy），而无法体现器官的动态运作（Physiology）。正如原书中的经典调侃：**一个活人的 X 光片，看起来和一个死人的 X 光片一模一样！**",
        "4. **致癌辐射风险**：X 射线属于电离辐射，过量照射可能诱发癌症，因此临床上必须谨慎节制使用，仅在有充分医疗指征时才能拍摄。"
      ],
      "formula": {
        "expr": null,
        "explain": "传统 X 光片本质上是三维人体对射线衰减的二维累加投影，信息在沿射线方向上发生了不可逆的混叠，因此必须引入多角度采样或全新的物理探测机制。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：单一角度遮挡 vs. CT 多角度“切片”重建",
      "instruction": "将“扫描视角数量”保持在 1 个，拖动“当前 X 光照射角”观察 0° 时肋骨如何把心脏遮住、90° 时如何分离；再增加视角数量并切换“DSP 滤波锐化”，见证 CT 如何算出清晰的身体横截面切片！",
      "controls": [
        {
          "type": "slider",
          "id": "numAngles",
          "label": "CT 扫描视角数量",
          "min": 1,
          "max": 36,
          "step": 1,
          "value": 1,
          "unit": " 个视角"
        },
        {
          "type": "slider",
          "id": "scanAngle",
          "label": "当前 X 光照射角",
          "min": 0,
          "max": 175,
          "step": 5,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "sharpFilter",
          "label": "开启 DSP 滤波锐化 (Ram-Lak)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst objs = [\n  { x: 0, y: 0, rx: 0.86, ry: 0.86, d: 0.14 },\n  { x: 0, y: 0.54, rx: 0.17, ry: 0.12, d: 0.94 },\n  { x: -0.46, y: -0.32, rx: 0.13, ry: 0.13, d: 0.90 },\n  { x: 0.46, y: -0.32, rx: 0.13, ry: 0.13, d: 0.90 },\n  { x: 0, y: -0.32, rx: 0.21, ry: 0.21, d: 0.46 }\n];\n\nfunction sampleTrue(x, y) {\n  let v = 0;\n  for (let i = 0; i < objs.length; i++) {\n    const o = objs[i];\n    const dx = (x - o.x) / o.rx;\n    const dy = (y - o.y) / o.ry;\n    if (dx * dx + dy * dy <= 1) {\n      if (o.d > v) v = o.d;\n    }\n  }\n  return v;\n}\n\nconst BINS = 65;\nfunction computeProj(theta) {\n  const c = Math.cos(theta);\n  const s = Math.sin(theta);\n  const p = new Float32Array(BINS);\n  const steps = 44;\n  const du = 2 / steps;\n  for (let b = 0; b < BINS; b++) {\n    const offset = -1 + (2 * b) / (BINS - 1);\n    let sum = 0;\n    for (let k = 0; k <= steps; k++) {\n      const u = -1 + k * du;\n      const px = u * c - offset * s;\n      const py = u * s + offset * c;\n      sum += sampleTrue(px, py);\n    }\n    p[b] = sum * du;\n  }\n  return p;\n}\n\nfunction filterProj(p, useFilter) {\n  if (!useFilter) return p;\n  const out = new Float32Array(BINS);\n  for (let i = 0; i < BINS; i++) {\n    let v = 0.30 * p[i];\n    for (let k = 1; k <= 7; k += 2) {\n      const w = -1 / (Math.PI * Math.PI * k * k);\n      const l = i - k >= 0 ? p[i - k] : 0;\n      const r = i + k < BINS ? p[i + k] : 0;\n      v += w * (l + r);\n    }\n    out[i] = v;\n  }\n  return out;\n}\n\nfunction draw() {\n  const numAngles = lab.values.numAngles;\n  const curAngleDeg = lab.values.scanAngle;\n  const useFilter = lab.values.sharpFilter;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 40; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  const cx1 = 110, cy1 = 126, r1 = 80;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('真实人体横截面 + X光射线束', cx1, 22);\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.arc(cx1, cy1, r1 * 0.86, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.55)';\n  ctx.strokeStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(cx1, cy1 - 0.32 * r1, 0.21 * r1, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.ellipse(cx1, cy1 + 0.54 * r1, 0.17 * r1, 0.12 * r1, 0, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(cx1 - 0.46 * r1, cy1 - 0.32 * r1, 0.13 * r1, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(cx1 + 0.46 * r1, cy1 - 0.32 * r1, 0.13 * r1, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('肋骨', cx1 - 0.46 * r1, cy1 - 0.50 * r1);\n  ctx.fillText('肋骨', cx1 + 0.46 * r1, cy1 - 0.50 * r1);\n  ctx.fillStyle = '#fbcfe8';\n  ctx.fillText('心脏', cx1, cy1 - 0.28 * r1);\n\n  const curRad = (curAngleDeg * Math.PI) / 180;\n  const rc = Math.cos(curRad), rs = Math.sin(curRad);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';\n  ctx.lineWidth = 1;\n  for (let k = -4; k <= 4; k++) {\n    const off = k * 18;\n    const xA = cx1 - 88 * rc - off * rs;\n    const yA = cy1 - 88 * rs + off * rc;\n    const xB = cx1 + 88 * rc - off * rs;\n    const yB = cy1 + 88 * rs + off * rc;\n    ctx.beginPath(); ctx.moveTo(xA, yA); ctx.lineTo(xB, yB); ctx.stroke();\n  }\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(cx1 - 90 * rc, cy1 - 90 * rs, 4, 0, Math.PI * 2);\n  ctx.fill();\n\n  const cx2 = 345, cy2 = 126, size2 = 162;\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('CT 数字切片重建 (' + numAngles + '视角)', cx2, 22);\n\n  const angles = [];\n  if (numAngles === 1) {\n    angles.push(curRad);\n  } else {\n    for (let a = 0; a < numAngles; a++) {\n      angles.push((a * Math.PI) / numAngles);\n    }\n  }\n\n  const filteredProjs = [];\n  const cosA = [], sinA = [];\n  for (let a = 0; a < angles.length; a++) {\n    cosA.push(Math.cos(angles[a]));\n    sinA.push(Math.sin(angles[a]));\n    filteredProjs.push(filterProj(computeProj(angles[a]), useFilter));\n  }\n\n  const GRID = 54;\n  const recon = new Float32Array(GRID * GRID);\n  let maxVal = 0.001;\n  for (let gy = 0; gy < GRID; gy++) {\n    const y = -1 + (2 * gy) / (GRID - 1);\n    for (let gx = 0; gx < GRID; gx++) {\n      const x = -1 + (2 * gx) / (GRID - 1);\n      if (x * x + y * y > 1.02) continue;\n      let sum = 0;\n      for (let a = 0; a < angles.length; a++) {\n        const s = -x * sinA[a] + y * cosA[a];\n        const fb = ((s + 1) * 0.5) * (BINS - 1);\n        const idx = Math.floor(fb);\n        if (idx >= 0 && idx < BINS - 1) {\n          const frac = fb - idx;\n          sum += filteredProjs[a][idx] * (1 - frac) + filteredProjs[a][idx + 1] * frac;\n        }\n      }\n      const val = Math.max(0, sum / angles.length);\n      recon[gy * GRID + gx] = val;\n      if (val > maxVal) maxVal = val;\n    }\n  }\n\n  const cell = size2 / GRID;\n  const x0 = cx2 - size2 / 2, y0 = cy2 - size2 / 2;\n  for (let gy = 0; gy < GRID; gy++) {\n    for (let gx = 0; gx < GRID; gx++) {\n      const norm = Math.min(1, recon[gy * GRID + gx] / maxVal);\n      if (norm > 0.04) {\n        const b = Math.floor(norm * 245);\n        const g = Math.floor(norm * 255);\n        const r = norm > 0.65 ? Math.floor(norm * 255) : Math.floor(norm * 110);\n        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';\n        ctx.fillRect(x0 + gx * cell, y0 + gy * cell, cell + 0.6, cell + 0.6);\n      }\n    }\n  }\n  ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.arc(cx2, cy2, size2 * 0.49, 0, Math.PI * 2); ctx.stroke();\n\n  const px0 = 470, py0 = 46, pw = 225, ph = 155;\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('当前角度(' + curAngleDeg + '°)单次 X 光阴影', px0 + pw / 2, 22);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(px0, py0, pw, ph);\n\n  const curP = computeProj(curRad);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i < BINS; i++) {\n    const x = px0 + (i / (BINS - 1)) * pw;\n    const y = py0 + ph - 12 - (curP[i] / 1.45) * (ph - 26);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  if (curAngleDeg <= 15 || curAngleDeg >= 165) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('⚠ 心脏阴影被两根肋骨完全重叠遮挡！', px0 + pw / 2, py0 + ph + 20);\n  } else if (curAngleDeg >= 70 && curAngleDeg <= 110) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('✓ 绕开肋骨后，中间心脏衰减峰清晰可见', px0 + pw / 2, py0 + ph + 20);\n  } else {\n    ctx.fillText('探测器接收到的 1D 射线衰减分布', px0 + pw / 2, py0 + ph + 20);\n  }\n\n  const status = numAngles === 1\n    ? '单视角透视：无法还原纵深切片，仅呈现一维重叠阴影'\n    : 'CT 模式：融合 ' + numAngles + ' 个方向数据 | DSP 滤波：' + (useFilter ? '开启（边缘锐利）' : '关闭（存在 1/r 模糊光晕）');\n  lab.setReadout(status);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "2. CT 断层扫描：用“多角度投影 + DSP 算力”切开三维重叠",
      "paragraphs": [
        "1971 年，第一台**计算机断层扫描仪**（Computed Tomography，早期称为 CAT 扫描仪）问世，彻底解决了传统 X 光“结构重叠”的第一大难题。CT 是数字信号处理在医学领域最经典的里程碑之一。",
        "它的核心思想非常巧妙：不再像传统 X 光那样只从单一方向拍一张静态胶片，而是让 X 射线从**许多不同的方向**穿过待检部位。更关键的是，系统不再直接把探测到的射线拿去显影，而是先把模拟信号**数字化并存入计算机**。",
        "随后，计算机利用 DSP 重建算法（如滤波反投影），把各个角度的一维投影数据逆向“算”出一张张仿佛**把人体切开来看的二维横截面切片（Slices）**。这些切片的细节清晰度远超传统技术，大幅提升了疾病诊断与治疗的准确率。",
        "CT 的影响力几乎可以与 X 射线本身的发现相提并论。短短几年内，全球各大医院都配备了 CT 扫描仪。1979 年，CT 技术的两位核心贡献者——**戈弗雷·豪斯菲尔德（Godfrey N. Hounsfield）**与**艾伦·科马克（Allan M. Cormack）**共同荣获了诺贝尔生理学或医学奖。这就是 DSP 的威力！"
      ],
      "formula": {
        "expr": "I(x, y) ≈ Σ_θ  Filter{ P_θ( -x·sinθ + y·cosθ ) }",
        "explain": "I(x, y) 是计算机算出的二维人体切片像素值；P_θ 是射线在 θ 角度下穿过人体后测得的数字化一维衰减信号；Filter{} 代表 DSP 滤波锐化（消除反投影自带的模糊光晕），最后把所有角度 θ 的计算结果叠加，就能还原出清晰的内部切片。"
      }
    },
    {
      "type": "concept",
      "heading": "3. 跳出 X 光：MRI 如何用磁场、无线电波与 DSP 破解后三大难题？",
      "paragraphs": [
        "虽然 CT 解决了重叠问题，但它依然依赖 X 射线，仍未彻底解决后三个问题（软组织分辨力有限、无法观察生理运作、存在致癌辐射）。为此，工程师们改用了**X 射线以外的穿透性能量**——例如**无线电波**和**声波（超声）**，而 DSP 在所有这些新技术中都扮演着核心角色。",
        "以**磁共振成像（Magnetic Resonance Imaging, MRI）**为例，它巧妙地联合使用**强磁场**与**无线电波**来探测人体内部：",
        "1. **量子共振激发**：通过精确调节外部磁场的强度与射频场的频率，使人体内某个局部区域的**原子核在量子能级之间发生共振**。",
        "2. **天线捕捉次级信号**：这种共振会激发原子核发射出**次级无线电波（Secondary Radio Wave）**，放置在人体附近的接收天线会捕捉到这段微弱的电磁信号。信号的强度与衰减特性直接反映了该局部组织的物理化学性质。",
        "3. **扫描成像与生理监测**：通过改变磁场梯度，系统可以让共振区域在全身逐点扫描，像 CT 一样生成横截面切片图像。由于完全不依赖电离辐射（解决了第 4 个问题），MRI 不仅能以极高对比度**区分不同的软组织**（如分辨肿瘤与正常肝脏，解决了第 2 个问题），还能直接捕捉**生理运作信息**——例如实时追踪**动脉中的血液流动**（解决了第 3 个问题）。正如原书所强调的：**MRI 完全依赖数字信号处理技术，没有 DSP 就根本无法实现。**"
      ],
      "formula": {
        "expr": "ω_0 = γ · B(x)  ⇒  s(t) = A_tissue(x) · M_flow(t) · e^(-t/τ) · cos(ω_0 · t)",
        "explain": "ω_0 是原子核的共振角频率，由磁场强度 B(x) 决定（调磁场就能扫描不同空间位置 x）；接收天线测得的次级无线电信号 s(t) 中，振幅 A_tissue 区分不同软组织，调制项 M_flow(t) 反映血流等动态生理活动，衰减常数 τ 与相位信息则完全由 DSP 解码提取。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：MRI 磁场共振调谐、软组织分辨与动脉血流听觉解码",
      "instruction": "拖动“共振调谐位置”依次扫过正常肝脏(28 MHz)、隐蔽肿瘤(48 MHz)和动脉血管(72 MHz)，点击“▶ 监听天线共振信号”倾听共振与脉搏节律，再切换“传统 X 光对比模式”看为什么 X 光会彻底漏掉肿瘤与血流！",
      "controls": [
        {
          "type": "slider",
          "id": "tuneFreq",
          "label": "磁场/射频共振调谐位置",
          "min": 10,
          "max": 90,
          "step": 1,
          "value": 48,
          "unit": " MHz"
        },
        {
          "type": "slider",
          "id": "bloodFlow",
          "label": "动脉血流生理活动强度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 75,
          "unit": " %"
        },
        {
          "type": "toggle",
          "id": "xrayCompare",
          "label": "切换为传统 X 光对比模式",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 监听天线共振信号",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet osc = null;\nlet gainNode = null;\nlet lastTime = 0;\n\nfunction gaussian(x, mu, sig) {\n  const d = (x - mu) / sig;\n  return Math.exp(-0.5 * d * d);\n}\n\nfunction getTissueResponse(f, flowPct, isXray, tSec) {\n  const pulse = 0.55 + 0.45 * Math.pow(Math.max(0, Math.sin(tSec * 4.2)), 4);\n  if (isXray) {\n    const bone = 0.92 * gaussian(f, 16, 4);\n    const soft = 0.24 * (gaussian(f, 32, 11) + 0.85 * gaussian(f, 48, 5) + 0.9 * gaussian(f, 72, 5));\n    return { val: Math.min(1, bone + soft * 0.4), label: 'X光仅能看清左侧骨骼，软组织与血流混成一片' };\n  }\n  const liver = 0.38 * gaussian(f, 30, 9);\n  const tumor = 0.88 * gaussian(f, 48, 4.5);\n  const flowAmp = (0.30 + 0.70 * (flowPct / 100) * pulse);\n  const artery = flowAmp * gaussian(f, 72, 4.5);\n  const val = Math.min(1, liver + tumor + artery);\n  let label = '背景软组织';\n  if (f < 21) label = '骨骼边缘（低氢核密度）';\n  else if (f >= 42 && f <= 54) label = '肝脏内肿瘤病灶（共振信号显著增强）';\n  else if (f >= 66 && f <= 78) label = '搏动动脉血管（血流速度 ' + flowPct + '%）';\n  else if (f >= 21 && f < 42) label = '正常肝脏软组织';\n  return { val: val, label: label, pulse: pulse };\n}\n\nfunction draw(tSec) {\n  const f = lab.values.tuneFreq;\n  const flow = lab.values.bloodFlow;\n  const isXray = lab.values.xrayCompare;\n  const res = getTissueResponse(f, flow, isXray, tSec);\n\n  if (lab.values.play) {\n    const ac = lab.getAudioContext();\n    if (ac) {\n      if (ac.state === 'suspended') ac.resume();\n      if (!osc) {\n        osc = ac.createOscillator();\n        gainNode = ac.createGain();\n        osc.type = 'sine';\n        gainNode.gain.value = 0;\n        osc.connect(gainNode);\n        gainNode.connect(ac.destination);\n        osc.start();\n      }\n      const pitch = isXray ? 150 : 180 + f * 4.8;\n      osc.frequency.setTargetAtTime(pitch, ac.currentTime, 0.02);\n      const targetGain = isXray ? 0.04 : Math.max(0.015, res.val * 0.22);\n      gainNode.gain.setTargetAtTime(targetGain, ac.currentTime, 0.03);\n    }\n  } else if (gainNode) {\n    const ac = lab.getAudioContext();\n    if (ac) gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.03);\n  }\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 40; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  const lx = 20, ly = 34, lw = 280, lh = 175;\n  ctx.fillStyle = isXray ? '#94a3b8' : '#38bdf8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(isXray ? '传统 X 光成像视角（软组织难区分）' : 'MRI 局部共振扫描空间 (10~90 MHz)', lx + lw / 2, 22);\n\n  ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.fillRect(lx, ly, lw, lh);\n  ctx.strokeRect(lx, ly, lw, lh);\n\n  const fToX = function(freq) { return lx + ((freq - 10) / 80) * lw; };\n\n  ctx.fillStyle = isXray ? 'rgba(248, 250, 252, 0.88)' : 'rgba(148, 163, 184, 0.35)';\n  ctx.beginPath(); ctx.ellipse(fToX(16), ly + lh * 0.5, 14, 52, 0, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = isXray ? 'rgba(148, 163, 184, 0.25)' : 'rgba(56, 189, 248, 0.35)';\n  ctx.strokeStyle = isXray ? 'rgba(148, 163, 184, 0.35)' : '#38bdf8';\n  ctx.beginPath(); ctx.ellipse(fToX(35), ly + lh * 0.52, 68, 56, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n\n  ctx.fillStyle = isXray ? 'rgba(148, 163, 184, 0.28)' : 'rgba(236, 72, 153, 0.72)';\n  ctx.strokeStyle = isXray ? 'rgba(148, 163, 184, 0.3)' : '#ec4899';\n  ctx.beginPath(); ctx.arc(fToX(48), ly + lh * 0.52, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n\n  const artR = isXray ? 16 : 15 + 7 * (flow / 100) * res.pulse;\n  ctx.fillStyle = isXray ? 'rgba(148, 163, 184, 0.24)' : 'rgba(16, 185, 129, 0.65)';\n  ctx.strokeStyle = isXray ? 'rgba(148, 163, 184, 0.3)' : '#10b981';\n  ctx.beginPath(); ctx.arc(fToX(72), ly + lh * 0.52, artR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('骨', fToX(16), ly + lh - 10);\n  ctx.fillStyle = isXray ? '#94a3b8' : '#bae6fd';\n  ctx.fillText('正常肝', fToX(30), ly + 22);\n  ctx.fillStyle = isXray ? '#64748b' : '#fbcfe8';\n  ctx.fillText('肿瘤', fToX(48), ly + lh - 10);\n  ctx.fillStyle = isXray ? '#64748b' : '#a7f3d0';\n  ctx.fillText('动脉血流', fToX(72), ly + 22);\n\n  const curX = fToX(f);\n  if (!isXray) {\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';\n    ctx.fillRect(curX - 10, ly, 20, lh);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(curX, ly); ctx.lineTo(curX, ly + lh); ctx.stroke();\n\n    for (let s = 0; s < 3; s++) {\n      const sy = ly + 42 + s * 44;\n      const ang = tSec * (2 + f * 0.12) + s * 2;\n      ctx.strokeStyle = '#f59e0b';\n      ctx.beginPath(); ctx.arc(curX, sy, 6, 0, Math.PI * 2); ctx.stroke();\n      ctx.beginPath(); ctx.moveTo(curX, sy); ctx.lineTo(curX + 9 * Math.cos(ang), sy + 9 * Math.sin(ang)); ctx.stroke();\n    }\n  }\n\n  const rx = 325, rw = 375;\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('天线接收的次级无线电波 (时域共振衰减信号)', rx + rw / 2, 22);\n\n  const wy = 34, wh = 78;\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.strokeRect(rx, wy, rw, wh);\n  ctx.strokeStyle = isXray ? '#64748b' : '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let i = 0; i <= 120; i++) {\n    const u = i / 120;\n    const env = Math.exp(-2.2 * u);\n    const sig = res.val * env * Math.cos(u * (12 + f * 0.45) * Math.PI - tSec * 8);\n    const px = rx + u * rw;\n    const py = wy + wh / 2 - sig * (wh * 0.42);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const sy0 = 132, sh = 77;\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('DSP 解码空间对比度曲线 (解剖 + 血流生理)', rx + rw / 2, 125);\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.strokeRect(rx, sy0, rw, sh);\n\n  ctx.strokeStyle = isXray ? '#94a3b8' : '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 80; i++) {\n    const fi = 10 + i;\n    const ri = getTissueResponse(fi, flow, isXray, tSec).val;\n    const px = rx + (i / 80) * rw;\n    const py = sy0 + sh - 6 - ri * (sh - 14);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const dotX = rx + ((f - 10) / 80) * rw;\n  const dotY = sy0 + sh - 6 - res.val * (sh - 14);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  lab.setReadout('当前调谐: ' + f + ' MHz | 探测结果: ' + res.label + ' | 信号强度: ' + Math.round(res.val * 100) + '%');\n}\n\nlab.onUpdate(function() { draw(lastTime); });\nlab.onLoop(function(dt, tSec) { lastTime = tSec; draw(tSec); });"
    },
    {
      "type": "summary",
      "heading": "工程直觉与核心要点速记",
      "items": [
        "传统 X 光的四大瓶颈：三维结构重叠遮挡（如肋骨遮住心脏）、相似软组织对比度差（如肿瘤与肝脏难分）、只见静态解剖不见动态生理（活人与死人影像一致）、具有电离辐射致癌风险。",
        "CT 解决“第 1 个瓶颈”：1971 年问世的 CT 从多个角度发射 X 射线并转化为数字信号，用 DSP 算力反向重建出二维身体切片（获 1979 年诺贝尔医学奖）。",
        "MRI 解决“后 3 个瓶颈”：改用无电离辐射的磁场与无线电波，让局部原子核发生量子共振并向天线发射次级射频信号；依靠全套 DSP 技术，MRI 不仅能精准分辨不同软组织，还能直接观测动脉血流等动态生理活动。"
      ]
    }
  ]
});
