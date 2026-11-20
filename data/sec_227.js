window.__BOOK_REGISTER_SECTION__("sec_227", {
  "title": "极点与零点的重要性 (The Importance of Poles and Zeros)",
  "intuition": "系统在复频域（s平面）的全部性格，仅由几个零点与极点的坐标位置唯一决定；沿着虚轴切一刀，就能直接读出它的频率响应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "用几个坐标概括整个系统：零极点图与 s 平面地形",
      "paragraphs": [
        "在前面的电路分析中，如果我们为 RLC 陷波滤波器代入具体元件值：`R = 220 Ω`、`L = 54 μH`、`C = 470 pF`，就会算出一对**零点 (Zeros)** 和一对**极点 (Poles)**。零点位于虚轴上 `z₁,₂ = 0 ± j 6.277×10⁶`，对应约 1 MHz 的陷波中心频率；极点则位于左半平面 `p₁,₂ = -2.037×10⁶ ± j 5.937×10⁶`。",
        "在最常用的**极零点图 (Pole-Zero Diagram)** 中，每个零点用**圆圈 (○)** 表示，每个极点用**叉号 (×)** 表示。如果把 `|H(s)|` 的幅度画成三维地形图，零点就像深不见底的漏斗谷底（幅度为 0），极点则像高耸入云的尖峰（幅度趋于无穷）。虽然为了直观通常只画幅度，但别忘了 s 平面上每一点也对应着相应的相位。",
        "与自然界的山峰峡谷不同，**s 平面上每一个极点的形状和大小都完全相同，每一个零点也彼此完全一致**，它们唯一的区别就在于**位置**。因此，极零点提供了一种极其紧凑的系统描述方式：要完整刻画这个 RLC 陷波滤波器，我们根本不需要记录成千上万个频率点，只需指定 `z₁, z₂, p₁, p₂` 这四个复数坐标就够了。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "s 平面上的“蚂蚁漫游”与距离乘积法则",
      "paragraphs": [
        "为了直觉理解极零点如何支配整个 s 平面，不妨想象一只**蚂蚁**在 s 平面上随意爬行。蚂蚁停在任意坐标 `s` 处时，传递函数 `H(s)` 都会给出一个对应的复数值（可用幅度与相位表示，也可用实部与虚部表示）。",
        "当蚂蚁爬到某个**零点** `zₙ` 时，公式 32-3 分子中的 `(s - zₙ)` 变成 0，整个 `H(s)` 瞬间归零；当蚂蚁逼近某个**极点** `pₘ` 时，分母中的 `(s - pₘ)` 趋近于 0，除以零使 `H(s)` 急剧冲向无穷大（英文 pole 即“撑起帐篷的柱子”之意）。而在其它任何位置，Terrain 的高度完全由极点与零点的排布决定——靠极点近就大，靠零点近就小。",
        "记住复数减法的几何意义：`s - zₙ` 的模就是复平面上 `s` 到 `zₙ` 的直线距离。因此，蚂蚁所在位置 `s` 处的传递函数幅度，等于**蚂蚁到所有零点的距离之积，除以到所有极点的距离之积**。"
      ],
      "formula": {
        "expr": "|H(s)| = (|s - z₁| · |s - z₂|) / (|s - p₁| · |s - p₂|)",
        "explain": "s 为蚂蚁在复平面的当前坐标 (σ + jω)；|s - zₙ| 是蚂蚁到第 n 个零点的几何距离，决定分子大小；|s - pₘ| 是蚂蚁到第 m 个极点的几何距离，决定分母大小。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：s 平面蚂蚁漫游与“距离乘积法则”实时测绘",
      "instruction": "拖动“蚂蚁位置 σ / ω”滑块（或取消勾选“锁定在虚轴”）观察蚂蚁到零点（绿虚线）与极点（粉虚线）的距离变化，对比右侧频率响应曲线的实时高度。",
      "controls": [
        {
          "type": "toggle",
          "id": "onImagAxis",
          "label": "锁定在虚轴 (σ = 0)",
          "value": false
        },
        {
          "type": "slider",
          "id": "sigma",
          "label": "实部坐标 σ (×10⁶)",
          "min": -5,
          "max": 3,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "虚部坐标 ω (×10⁶)",
          "min": 0,
          "max": 10,
          "step": 0.1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showVectors",
          "label": "显示距离连线",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar z1 = { x: 0, y: 6.277 }, z2 = { x: 0, y: -6.277 };\nvar p1 = { x: -2.037, y: 5.937 }, p2 = { x: -2.037, y: -5.937 };\n\nfunction dist(ax, ay, bx, by) {\n  return Math.hypot(ax - bx, ay - by);\n}\n\nfunction calcMag(sx, sy) {\n  var dz1 = dist(sx, sy, z1.x, z1.y);\n  var dz2 = dist(sx, sy, z2.x, z2.y);\n  var dp1 = dist(sx, sy, p1.x, p1.y);\n  var dp2 = dist(sx, sy, p2.x, p2.y);\n  var den = dp1 * dp2;\n  var mag = den < 1e-6 ? 999 : (dz1 * dz2) / den;\n  return { mag: mag, dz1: dz1, dz2: dz2, dp1: dp1, dp2: dp2 };\n}\n\nfunction draw() {\n  var v = lab.values;\n  var sx = v.onImagAxis ? 0 : v.sigma;\n  var sy = v.omega;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var scale = 12.5;\n  var ox = 45 + 8 * scale;\n  var oy = 120;\n  var plotL = 45, plotR = 220, plotT = 20, plotB = 220;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = -8; g <= 6; g += 2) {\n    var gx = ox + g * scale;\n    ctx.beginPath(); ctx.moveTo(gx, plotT); ctx.lineTo(gx, plotB); ctx.stroke();\n  }\n  for (var g2 = -8; g2 <= 8; g2 += 2) {\n    var gy = oy - g2 * scale;\n    ctx.beginPath(); ctx.moveTo(plotL, gy); ctx.lineTo(plotR, gy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.beginPath(); ctx.moveTo(plotL, oy); ctx.lineTo(plotR, oy); ctx.stroke();\n  ctx.strokeStyle = v.onImagAxis ? '#38bdf8' : 'rgba(56,189,248,0.55)';\n  ctx.lineWidth = v.onImagAxis ? 2 : 1.5;\n  ctx.beginPath(); ctx.moveTo(ox, plotT); ctx.lineTo(ox, plotB); ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('s 平面 (×10⁶ rad/s)', 48, 14);\n  ctx.fillText('σ', plotR - 10, oy - 5);\n  ctx.fillText('jω', ox + 4, plotT + 10);\n\n  var ax = ox + sx * scale, ay = oy - sy * scale;\n  if (v.showVectors) {\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1.3;\n    ctx.strokeStyle = '#10b981';\n    [z1, z2].forEach(function(z) {\n      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ox + z.x * scale, oy - z.y * scale); ctx.stroke();\n    });\n    ctx.strokeStyle = '#ec4899';\n    [p1, p2].forEach(function(p) {\n      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ox + p.x * scale, oy - p.y * scale); ctx.stroke();\n    });\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  [z1, z2].forEach(function(z) {\n    ctx.beginPath();\n    ctx.arc(ox + z.x * scale, oy - z.y * scale, 5.5, 0, Math.PI * 2);\n    ctx.stroke();\n  });\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  [p1, p2].forEach(function(p) {\n    var px = ox + p.x * scale, py = oy - p.y * scale;\n    ctx.beginPath();\n    ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5);\n    ctx.moveTo(px + 5, py - 5); ctx.lineTo(px - 5, py + 5);\n    ctx.stroke();\n  });\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(ax, ay, 5.5, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  var res = calcMag(sx, sy);\n\n  var mX = 250, mW = 22, mT = 30, mH = 180;\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(mX, mT, mW, mH);\n  var clampedMag = Math.min(res.mag, 4.0);\n  var fillH = (clampedMag / 4.0) * mH;\n  ctx.fillStyle = res.mag > 1.2 ? '#ec4899' : (res.mag < 0.3 ? '#10b981' : '#f59e0b');\n  ctx.fillRect(mX, mT + mH - fillH, mW, fillH);\n  var y1 = mT + mH - (1.0 / 4.0) * mH;\n  ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(mX - 4, y1); ctx.lineTo(mX + mW + 4, y1); ctx.stroke();\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('|H(s)|', mX - 3, 20);\n  ctx.fillText('1.0', mX + mW + 5, y1 + 3);\n  ctx.fillText(res.mag > 50 ? '∞' : res.mag.toFixed(2), mX - 2, 224);\n\n  var fL = 335, fR = 695, fT = 30, fB = 206, fW = fR - fL, fH = fB - fT;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var fw = 0; fw <= 10; fw += 2) {\n    var fx = fL + (fw / 10) * fW;\n    ctx.beginPath(); ctx.moveTo(fx, fT); ctx.lineTo(fx, fB); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.fillText(fw, fx - 4, fB + 13);\n  }\n  for (var fa = 0; fa <= 1.2; fa += 0.3) {\n    var fy = fB - (fa / 1.2) * fH;\n    ctx.beginPath(); ctx.moveTo(fL, fy); ctx.lineTo(fR, fy); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.fillText(fa.toFixed(1), fL - 24, fy + 3);\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= 200; i++) {\n    var w = (i / 200) * 10;\n    var hVal = calcMag(0, w).mag;\n    var cx = fL + (w / 10) * fW;\n    var cy = fB - (Math.min(hVal, 1.2) / 1.2) * fH;\n    if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);\n  }\n  ctx.stroke();\n\n  if (sy >= 0 && sy <= 10) {\n    var curX = fL + (sy / 10) * fW;\n    ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath(); ctx.moveTo(curX, fT); ctx.lineTo(curX, fB); ctx.stroke();\n    ctx.setLineDash([]);\n    if (Math.abs(sx) < 0.05) {\n      var curY = fB - (Math.min(res.mag, 1.2) / 1.2) * fH;\n      ctx.fillStyle = '#f59e0b';\n      ctx.beginPath(); ctx.arc(curX, curY, 5, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('虚轴频率响应 |H(jω)| (σ = 0)', fL, 18);\n  ctx.fillText('频率 ω (×10⁶ rad/s)', fL + fW * 0.36, fB + 26);\n\n  var magStr = res.mag > 99 ? '∞ (贴近极点!)' : res.mag.toFixed(3);\n  lab.setReadout(\n    '蚂蚁坐标 s = ' + sx.toFixed(2) + (sy >= 0 ? ' + j' : ' - j') + Math.abs(sy).toFixed(2) + ' (×10⁶) | ' +\n    '零点距积=' + (res.dz1 * res.dz2).toFixed(1) + ' / 极点距积=' + (res.dp1 * res.dp2).toFixed(1) +\n    ' ⇒ |H(s)| = ' + magStr\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "沿虚轴切一刀：为什么极零点位置决定了频率响应？",
      "paragraphs": [
        "这正是本章的核心洞见：**系统的频率响应，就是传递函数 `H(s)` 沿着虚轴（即实部 `σ = 0`，`s = jω`）的截面切片**。让蚂蚁从原点 `(0, 0)` 出发，沿着虚轴向上爬行，就能直观解释整条陷波曲线的形成过程：",
        "在原点附近（低频段），蚂蚁到零点 `z₁,₂` 的距离几乎等于到极点 `p₁,₂` 的距离，分子分母正好相互抵消，于是低频响应平稳保持在 `1`（单位增益）。当蚂蚁继续上爬并逼近零点 `z₁` 时，到零点的距离骤降为 0，`H(jω)` 突然跌落谷底，踩上零点时彻底归零。越过这对极零点继续往高频爬行，蚂蚁到零点与极点的距离再次趋于相等，响应又重新回到 `1`。",
        "用这种几何视角一眼就能看穿：**陷波凹槽的宽度，完全取决于极点与零点之间的距离**——极点贴得越近，只有在极窄的一段频带内极点距离才无法抵消零点距离，凹槽就越尖锐；极点退入左半平面越远，凹槽就越宽平。",
        "对比第 30 章直接用相量法 (`R, jωL, -j/ωC`) 算出的结果，拉普拉斯变换多绕了“极零点图”这一步，却让工程师看清了**为什么**频率响应长成这样，以及**如何通过移动极零点去改造它**。"
      ],
      "formula": {
        "expr": "H(jω) = H(s)|_{s = jω}  (即令 σ = 0)",
        "explain": "把 s 平面传递函数中的所有 s 替换为纯虚数 jω，即在三维地形图上沿虚轴纵切一刀，得到的曲线就是系统的频率响应。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：调校极零点位置与实时音频陷波听感对比",
      "instruction": "点击“播放测试音”，分别拖动“陷波中心频率”和“极点距虚轴深度”，观察陷波宽度如何随极零点间距变化，并实时耳听频段被挖除的尖锐度差异。",
      "controls": [
        {
          "type": "slider",
          "id": "notchHz",
          "label": "陷波中心频率 f₀",
          "min": 300,
          "max": 2400,
          "step": 20,
          "value": 1000,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "poleDepth",
          "label": "极点距虚轴深度 |σₚ|",
          "min": 30,
          "max": 750,
          "step": 10,
          "value": 320,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "旁路对比 (听原始声音)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audio = null;\nvar scanPhase = 0;\n\nfunction ensureAudio() {\n  if (audio) return audio;\n  var ac = lab.getAudioContext();\n  var osc1 = ac.createOscillator();\n  osc1.type = 'sawtooth';\n  osc1.frequency.value = 110;\n\n  var osc2 = ac.createOscillator();\n  osc2.type = 'triangle';\n  osc2.frequency.value = 220;\n\n  var bufSize = ac.sampleRate * 2;\n  var noiseBuf = ac.createBuffer(1, bufSize, ac.sampleRate);\n  var data = noiseBuf.getChannelData(0);\n  var lastOut = 0;\n  for (var i = 0; i < bufSize; i++) {\n    var white = Math.random() * 2 - 1;\n    lastOut = (lastOut + 0.04 * white) / 1.04;\n    data[i] = lastOut * 2.2;\n  }\n  var noiseSrc = ac.createBufferSource();\n  noiseSrc.buffer = noiseBuf;\n  noiseSrc.loop = true;\n\n  var oscGain = ac.createGain();\n  oscGain.gain.value = 0.24;\n  var noiseGain = ac.createGain();\n  noiseGain.gain.value = 0.25;\n\n  var preLP = ac.createBiquadFilter();\n  preLP.type = 'lowpass';\n  preLP.frequency.value = 3200;\n\n  var notch = ac.createBiquadFilter();\n  notch.type = 'notch';\n  notch.frequency.value = 1000;\n  notch.Q.value = 1.5;\n\n  var wetGain = ac.createGain();\n  var dryGain = ac.createGain();\n  var master = ac.createGain();\n  master.gain.value = 0;\n\n  osc1.connect(oscGain);\n  osc2.connect(oscGain);\n  oscGain.connect(preLP);\n  noiseSrc.connect(noiseGain);\n  noiseGain.connect(preLP);\n\n  preLP.connect(notch);\n  notch.connect(wetGain);\n  preLP.connect(dryGain);\n\n  wetGain.connect(master);\n  dryGain.connect(master);\n  master.connect(ac.destination);\n\n  osc1.start();\n  osc2.start();\n  noiseSrc.start();\n\n  audio = { ac: ac, notch: notch, wet: wetGain, dry: dryGain, master: master };\n  return audio;\n}\n\nfunction updateAudio() {\n  var v = lab.values;\n  if (!v.play && !audio) return;\n  var a = ensureAudio();\n  if (v.play && a.ac.state === 'suspended') {\n    a.ac.resume();\n  }\n  var now = a.ac.currentTime;\n  var f0 = v.notchHz;\n  var sigmaF = Math.min(v.poleDepth, f0 * 0.95);\n  var Q = Math.max(0.5, f0 / (2 * sigmaF));\n  a.notch.frequency.setTargetAtTime(f0, now, 0.02);\n  a.notch.Q.setTargetAtTime(Q, now, 0.02);\n  a.wet.gain.setTargetAtTime(v.bypass ? 0 : 1, now, 0.02);\n  a.dry.gain.setTargetAtTime(v.bypass ? 1 : 0, now, 0.02);\n  a.master.gain.setTargetAtTime(v.play ? 0.22 : 0, now, 0.03);\n}\n\nfunction calcNotch(f, f0, sigmaF) {\n  var wp = Math.sqrt(Math.max(1, f0 * f0 - sigmaF * sigmaF));\n  var dz1 = Math.hypot(0, f - f0);\n  var dz2 = Math.hypot(0, f + f0);\n  var dp1 = Math.hypot(sigmaF, f - wp);\n  var dp2 = Math.hypot(sigmaF, f + wp);\n  return (dz1 * dz2) / (dp1 * dp2);\n}\n\nfunction draw() {\n  var v = lab.values;\n  var f0 = v.notchHz;\n  var sigmaF = Math.min(v.poleDepth, f0 * 0.95);\n  var wp = Math.sqrt(Math.max(1, f0 * f0 - sigmaF * sigmaF));\n  var Q = f0 / (2 * sigmaF);\n  var bw3db = 2 * sigmaF;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  // Left: s-plane Pole-Zero Diagram (in kHz, uniform scale = 38 px/kHz)\n  var scale = 38;\n  var ox = 165, oy = 120;\n  var pL = 30, pR = 215, pT = 20, pB = 220;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = -3; gx <= 1; gx += 1) {\n    var xx = ox + gx * scale;\n    ctx.beginPath(); ctx.moveTo(xx, pT); ctx.lineTo(xx, pB); ctx.stroke();\n  }\n  for (var gy = -2.5; gy <= 2.5; gy += 0.5) {\n    var yy = oy - gy * scale;\n    ctx.beginPath(); ctx.moveTo(pL, yy); ctx.lineTo(pR, yy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(pL, oy); ctx.lineTo(pR, oy); ctx.stroke();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath(); ctx.moveTo(ox, pT); ctx.lineTo(ox, pB); ctx.stroke();\n\n  // Constant radius circle in LHP showing pole trajectory\n  var rPx = (f0 / 1000) * scale;\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.setLineDash([3, 3]);\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.arc(ox, oy, rPx, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Distance line between pole and imaginary axis\n  var px1 = ox - (sigmaF / 1000) * scale;\n  var py1 = oy - (wp / 1000) * scale;\n  var py2 = oy + (wp / 1000) * scale;\n  var zy1 = oy - (f0 / 1000) * scale;\n  var zy2 = oy + (f0 / 1000) * scale;\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(ox, py1); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(ox, zy1); ctx.stroke();\n\n  // Zeros\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  [zy1, zy2].forEach(function(zy) {\n    ctx.beginPath(); ctx.arc(ox, zy, 5.5, 0, Math.PI * 2); ctx.stroke();\n  });\n\n  // Poles\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  [py1, py2].forEach(function(py) {\n    ctx.beginPath();\n    ctx.moveTo(px1 - 5, py - 5); ctx.lineTo(px1 + 5, py + 5);\n    ctx.moveTo(px1 + 5, py - 5); ctx.lineTo(px1 - 5, py + 5);\n    ctx.stroke();\n  });\n\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('s 平面极零点 (kHz)', 32, 14);\n  ctx.fillText('jω', ox + 4, pT + 10);\n\n  // Right: Frequency Response (0 .. 3000 Hz)\n  var fL = 265, fR = 695, fT = 30, fB = 206, fW = fR - fL, fH = fB - fT;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var fh = 0; fh <= 3000; fh += 500) {\n    var fx = fL + (fh / 3000) * fW;\n    ctx.beginPath(); ctx.moveTo(fx, fT); ctx.lineTo(fx, fB); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.fillText(fh, fx - 10, fB + 14);\n  }\n  for (var fa = 0; fa <= 1.2; fa += 0.3) {\n    var fy = fB - (fa / 1.2) * fH;\n    ctx.beginPath(); ctx.moveTo(fL, fy); ctx.lineTo(fR, fy); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.fillText(fa.toFixed(1), fL - 24, fy + 3);\n  }\n\n  // -3dB bandwidth shading\n  var y3db = fB - (0.707 / 1.2) * fH;\n  var fLow = Math.max(0, -sigmaF + Math.sqrt(sigmaF * sigmaF + f0 * f0));\n  var fHigh = sigmaF + Math.sqrt(sigmaF * sigmaF + f0 * f0);\n  var xLow = fL + (Math.min(3000, fLow) / 3000) * fW;\n  var xHigh = fL + (Math.min(3000, fHigh) / 3000) * fW;\n  ctx.fillStyle = 'rgba(245,158,11,0.14)';\n  ctx.fillRect(xLow, fT, Math.max(2, xHigh - xLow), fH);\n  ctx.strokeStyle = 'rgba(245,158,11,0.6)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(xLow, y3db); ctx.lineTo(xHigh, y3db); ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Notch Curve\n  ctx.strokeStyle = v.bypass ? 'rgba(56,189,248,0.35)' : '#38bdf8';\n  ctx.lineWidth = v.bypass ? 1.5 : 2.5;\n  if (v.bypass) ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (var i = 0; i <= 240; i++) {\n    var freq = (i / 240) * 3000;\n    var mag = calcNotch(freq, f0, sigmaF);\n    var cx = fL + (freq / 3000) * fW;\n    var cy = fB - (Math.min(mag, 1.2) / 1.2) * fH;\n    if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  if (v.bypass) {\n    var flatY = fB - (1.0 / 1.2) * fH;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.moveTo(fL, flatY); ctx.lineTo(fR, flatY); ctx.stroke();\n  }\n\n  // Animated ant scanner along frequency response\n  var scanFreq = scanPhase * 3000;\n  var scanMag = v.bypass ? 1.0 : calcNotch(scanFreq, f0, sigmaF);\n  var sxPos = fL + scanPhase * fW;\n  var syPos = fB - (Math.min(scanMag, 1.2) / 1.2) * fH;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(sxPos, syPos, 4, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.82)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('音频频率响应 |H(jf)|  (黄色区域 = -3dB 陷波带宽 2|σₚ|)', fL, 18);\n  ctx.fillText('频率 f (Hz)', fL + fW * 0.44, fB + 26);\n\n  lab.setReadout(\n    '陷波中心 f₀=' + f0 + ' Hz | 极点深度 |σₚ|=' + Math.round(sigmaF) + ' Hz | ' +\n    '-3dB 宽度=2|σₚ|=' + Math.round(bw3db) + ' Hz (Q=' + Q.toFixed(2) + ') | ' +\n    (v.bypass ? '当前: 旁路直通' : '当前: 陷波滤波生效')\n  );\n}\n\nlab.onUpdate(function() {\n  updateAudio();\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  scanPhase = (scanPhase + dt * 0.28) % 1;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "极零点就是系统的“基因编码”：无论系统多复杂，所有极点形状相同、所有零点形状相同，真正决定特性的是它们在 s 平面上的几何坐标。",
        "幅度按“距离乘积比”计算：某点 s 处的增益等于到所有零点距离的乘积除以到所有极点距离的乘积；零点处必为 0，极点处趋于无穷。",
        "频率响应 = 虚轴切片：令 s = jω（即 σ = 0）沿虚轴读取 H(s)，即可得到频响曲线；要让陷波变窄、选频更锐利，工程上只需把极点往虚轴上零点的方向靠拢即可（但千万别跨过虚轴进入右半平面，否则系统会振荡失稳）。",
        "设计思维升级：相量法只能“算”出频率响应，而 s 平面极零点图不仅能得出同样结果，还能一眼看透系统“为什么”这样响应以及“怎么改”参数。"
      ]
    }
  ]
});
