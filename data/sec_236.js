window.__BOOK_REGISTER_SECTION__("sec_236", {
  "title": "在 s 平面计算极点位置 (Calculate Pole Locations in the s-Plane)",
  "intuition": "所有巴特沃斯与切比雪夫 IIR 滤波器的设计，都从把极点均匀摆放在 s 平面左半边单位圆上开始——这一步用极点数 NP 和级数 P% 算出每对共轭极点的直角坐标 (RP, IP)。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么从 s 平面单位圆上的巴特沃斯低通原型出发？",
      "paragraphs": [
        "无论最终要设计低通、高通，还是巴特沃斯（Butterworth）或切比雪夫（Chebyshev）滤波器，第 33 章的通用设计程序都先在连续时间域的 **s 平面** 中构造一个**归一化巴特沃斯低通滤波器**作为起点，其截止角频率固定为 `ω = 1`。",
        "在 s 平面中，横轴是实部 `σ`（控制指数衰减或发散速度），纵轴是虚部 `jω`（对应角频率）。低通巴特沃斯滤波器**只包含极点，没有任何零点**，且所有极点严格等间距地分布在半径为 **1** 的圆周上——半径为 1 正好对应归一化截止频率 `ω = 1`。",
        "为了保证系统因果且稳定（冲激响应随时间衰减而非爆炸），我们只取**左半平面（`σ < 0`）**上的 `NP` 个极点。随着极点数 `NP`（程序输入为偶数 `2, 4, ..., 20`）增大，圆周上的极点排布更密集，通带到阻带的过渡滚降也就越陡峭。"
      ],
      "formula": {
        "expr": "s = σ ± jω，其中 σ² + ω² = 1 (半径 r = ω_c = 1，且 σ < 0)",
        "explain": "s 为复频率平面坐标；σ（对应程序变量 RP）为极点实部，决定阻尼衰减；ω（对应程序变量 IP）为极点虚部，决定振荡角频率；约束 σ² + ω² = 1 表示所有极点严格落在截止频率为 1 的单位圆上。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：s 平面单位圆极点分布与幅频响应实时观察",
      "instruction": "拖动「总极点数 NP」和「当前级数 P%」滑块，观察左半单位圆上的共轭极点对 (RP, ±IP) 如何移动，以及右侧低通幅频响应如何变陡。",
      "controls": [
        {
          "type": "slider",
          "id": "np",
          "label": "总极点数 NP (偶数)",
          "min": 2,
          "max": 20,
          "step": 2,
          "value": 6,
          "unit": " 极"
        },
        {
          "type": "slider",
          "id": "stage",
          "label": "当前级数 P% (1 到 NP/2)",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showRight",
          "label": "显示右半平面镜像点 (理解圆周等分)",
          "value": false
        }
      ],
      "jsCode": "const draw = () => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const np = Math.round(lab.values.np);\n  const half = np / 2;\n  const p = Math.min(Math.round(lab.values.stage), half);\n\n  const cx = 178;\n  const cy = 122;\n  const R = 84;\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.06)';\n  ctx.fillRect(24, 18, cx - 24, H - 36);\n\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = cx - 84; gx <= cx + 84; gx += 42) {\n    ctx.beginPath(); ctx.moveTo(gx, 18); ctx.lineTo(gx, H - 18); ctx.stroke();\n  }\n  for (let gy = cy - 84; gy <= cy + 84; gy += 42) {\n    ctx.beginPath(); ctx.moveTo(24, gy); ctx.lineTo(332, gy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.3)';\n  ctx.beginPath();\n  ctx.moveTo(28, cy); ctx.lineTo(328, cy);\n  ctx.moveTo(cx, 20); ctx.lineTo(cx, H - 20);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('σ (RP)', 290, cy - 6);\n  ctx.fillText('jω (IP)', cx + 6, 30);\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';\n  ctx.fillText('稳定左半平面', 32, 32);\n\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('r=1', cx + R * 0.72, cy - R * 0.72);\n\n  const poles = [];\n  for (let k = 1; k <= half; k++) {\n    const ang = Math.PI / (2 * np) + (k - 1) * Math.PI / np;\n    poles.push({\n      k,\n      ang,\n      sigma: -Math.cos(ang),\n      omega: Math.sin(ang)\n    });\n  }\n\n  if (lab.values.showRight) {\n    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';\n    ctx.lineWidth = 1.5;\n    for (const pl of poles) {\n      const rx = cx - pl.sigma * R;\n      const y1 = cy - pl.omega * R;\n      const y2 = cy + pl.omega * R;\n      ctx.beginPath();\n      ctx.arc(rx, y1, 4, 0, Math.PI * 2);\n      ctx.stroke();\n      ctx.beginPath();\n      ctx.arc(rx, y2, 4, 0, Math.PI * 2);\n      ctx.stroke();\n    }\n  }\n\n  const drawCross = (x, y, sz, color, lw) => {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    ctx.beginPath();\n    ctx.moveTo(x - sz, y - sz); ctx.lineTo(x + sz, y + sz);\n    ctx.moveTo(x + sz, y - sz); ctx.lineTo(x - sz, y + sz);\n    ctx.stroke();\n  };\n\n  let selPole = poles[0];\n  for (const pl of poles) {\n    const px = cx + pl.sigma * R;\n    const y1 = cy - pl.omega * R;\n    const y2 = cy + pl.omega * R;\n    if (pl.k === p) {\n      selPole = pl;\n      ctx.save();\n      ctx.setLineDash([4, 4]);\n      ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';\n      ctx.lineWidth = 1.2;\n      ctx.beginPath();\n      ctx.moveTo(cx, cy); ctx.lineTo(px, y1);\n      ctx.moveTo(px, y1); ctx.lineTo(px, y2);\n      ctx.moveTo(px, y1); ctx.lineTo(cx, y1);\n      ctx.moveTo(px, y2); ctx.lineTo(cx, y2);\n      ctx.stroke();\n      ctx.restore();\n\n      ctx.fillStyle = '#f59e0b';\n      ctx.fillText('RP', px - 8, cy + 13);\n      ctx.fillText('+IP', cx + 4, y1 + 4);\n      ctx.fillText('-IP', cx + 4, y2 + 4);\n\n      ctx.beginPath();\n      ctx.arc(px, y1, 10, 0, Math.PI * 2);\n      ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';\n      ctx.fill();\n      ctx.beginPath();\n      ctx.arc(px, y2, 10, 0, Math.PI * 2);\n      ctx.fill();\n\n      drawCross(px, y1, 6, '#f59e0b', 2.4);\n      drawCross(px, y2, 6, '#f59e0b', 2.4);\n    } else {\n      drawCross(px, y1, 4.5, '#10b981', 1.8);\n      drawCross(px, y2, 4.5, '#10b981', 1.8);\n    }\n  }\n\n  const rx0 = 368, ry0 = 36, rw = 326, rh = 166;\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = ry0 + (rh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx0 + rw, yy); ctx.stroke();\n  }\n  for (let w = 0; w <= 2.5; w += 0.5) {\n    const xx = rx0 + (w / 2.5) * rw;\n    ctx.beginPath(); ctx.moveTo(xx, ry0); ctx.lineTo(xx, ry0 + rh); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n  ctx.beginPath();\n  ctx.moveTo(rx0, ry0); ctx.lineTo(rx0, ry0 + rh); ctx.lineTo(rx0 + rw, ry0 + rh);\n  ctx.stroke();\n\n  const xCut = rx0 + (1.0 / 2.5) * rw;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';\n  ctx.beginPath(); ctx.moveTo(xCut, ry0); ctx.lineTo(xCut, ry0 + rh); ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('归一化低通幅频响应 |H(jω)|', rx0 + 4, 24);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('ω=1 (-3dB)', xCut - 26, ry0 + rh + 16);\n  ctx.fillText('0', rx0 - 4, ry0 + rh + 16);\n  ctx.fillText('2.5', rx0 + rw - 18, ry0 + rh + 16);\n\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i <= 140; i++) {\n    const w = (i / 140) * 2.5;\n    const d1 = Math.hypot(selPole.sigma, w - selPole.omega);\n    const d2 = Math.hypot(selPole.sigma, w + selPole.omega);\n    const magStage = Math.min(2.2, 1.0 / (d1 * d2));\n    const px = rx0 + (w / 2.5) * rw;\n    const py = ry0 + rh - Math.min(1.15, magStage) * rh * 0.85;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 140; i++) {\n    const w = (i / 140) * 2.5;\n    let mag = 1.0;\n    for (const pl of poles) {\n      const d1 = Math.hypot(pl.sigma, w - pl.omega);\n      const d2 = Math.hypot(pl.sigma, w + pl.omega);\n      mag *= 1.0 / (d1 * d2);\n    }\n    const px = rx0 + (w / 2.5) * rw;\n    const py = ry0 + rh - mag * rh * 0.85;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const yCut = ry0 + rh - (1 / Math.SQRT2) * rh * 0.85;\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath();\n  ctx.arc(xCut, yCut, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 总响应 (NP=' + np + ')', rx0 + 175, 22);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('-- 第 P%=' + p + ' 级响应', rx0 + 175, 36);\n\n  const rad = Math.hypot(selPole.sigma, selPole.omega).toFixed(3);\n  lab.setReadout(\n    'NP = ' + np + ' | 当前级数 P% = ' + p + '/' + half +\n    ' | RP (σ) = ' + selPole.sigma.toFixed(4) +\n    ' | IP (ω) = ±' + selPole.omega.toFixed(4) +\n    ' | 极点半径 √(RP²+IP²) = ' + rad\n  );\n};\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "从极点数 NP 与级数 P% 计算共轭极点对坐标 (RP, IP)",
      "paragraphs": [
        "在图 33-7 的主程序框架中，滤波器按二阶级联的方式逐级构建：主循环执行 `FOR P% = 1 TO NP/2`，每次调用子程序 `SUB 1000` 计算**当前级 `P%` 对应的那一对共轭极点**。",
        "为什么极点总是成对出现？因为实系数物理滤波器在 s 平面上的复数极点必须**共轭对称**（即同时存在 `σ + jω` 与 `σ - jω`），这样将两个一阶因子相乘合并成一个二阶环节时，虚部才会完全抵消，得到纯实数的滤波器系数。",
        "在流程图的第 3 块（程序第 1080 与 1090 行）中，子程序直接利用总极点数 `NP` 与当前级索引 `P%`，在直角坐标系中算出这对极点的实部 `RP`（对应 `σ`）与虚部 `IP`（对应 `ω`）。当 `P%` 从 `1` 增加到 `NP/2` 时，极点沿着左半单位圆从负实轴附近逐步移向虚轴 `jω` 附近，阻尼变小、谐振峰更尖锐。"
      ],
      "formula": {
        "expr": "RP = σ = -cos(θ),   IP = ω = sin(θ),   θ = π/(2·NP) + (P% - 1)·π/NP",
        "explain": "NP 为偶数总极点数；P% 为当前计算的级号 (1 到 NP/2)；θ 为极点相对负实轴的夹角；RP 为实部 σ（恒为负值以保证稳定）；IP 为虚部 ω（共轭极点对位于 RP ± j·IP）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：极点坐标 (RP, IP) 的时域阻尼直觉与试听",
      "instruction": "调节 NP 与 P% 选中不同的极点位置，开启「试听该极点对冲激响应」，感受极点靠近虚轴（|RP| 变小、IP 变大）时声音从闷短敲击变成清脆长余振的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "np",
          "label": "总极点数 NP",
          "min": 2,
          "max": 16,
          "step": 2,
          "value": 8,
          "unit": " 极"
        },
        {
          "type": "slider",
          "id": "stage",
          "label": "选择极点级数 P%",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听该极点对冲激响应",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let nextPing = 0;\nlet lastPingTime = -1;\n\nconst getPole = () => {\n  const np = Math.round(lab.values.np);\n  const half = np / 2;\n  const p = Math.min(Math.round(lab.values.stage), half);\n  const ang = Math.PI / (2 * np) + (p - 1) * Math.PI / np;\n  return {\n    np,\n    half,\n    p,\n    sigma: -Math.cos(ang),\n    omega: Math.sin(ang)\n  };\n};\n\nconst draw = (pulsePos) => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const pl = getPole();\n  const cx = 115, cy = 122, R = 74;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(22, cy); ctx.lineTo(208, cy);\n  ctx.moveTo(cx, 30); ctx.lineTo(cx, 214);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();\n\n  const px = cx + pl.sigma * R;\n  const py = cy - pl.omega * R;\n  const py2 = cy + pl.omega * R;\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '11px monospace';\n  ctx.fillText('|RP|=' + Math.abs(pl.sigma).toFixed(2), (cx + px) / 2 - 28, py - 8);\n\n  const drawX = (x, y, col) => {\n    ctx.strokeStyle = col; ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);\n    ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);\n    ctx.stroke();\n  };\n  drawX(px, py, '#f59e0b');\n  drawX(px, py2, '#f59e0b');\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('左半平面极点位置', 56, 22);\n\n  const tx = 248, ty = 122, tw = 446, th = 78;\n  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gx = tx + (tw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(gx, ty - th); ctx.lineTo(gx, ty + th); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.3)';\n  ctx.beginPath();\n  ctx.moveTo(tx, ty); ctx.lineTo(tx + tw, ty);\n  ctx.moveTo(tx, ty - th - 6); ctx.lineTo(tx, ty + th + 6);\n  ctx.stroke();\n\n  const tMax = 21;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (let i = 0; i <= 220; i++) {\n    const t = (i / 220) * tMax;\n    const env = Math.exp(pl.sigma * t);\n    const x = tx + (i / 220) * tw;\n    const y = ty - env * th;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.beginPath();\n  for (let i = 0; i <= 220; i++) {\n    const t = (i / 220) * tMax;\n    const env = Math.exp(pl.sigma * t);\n    const x = tx + (i / 220) * tw;\n    const y = ty + env * th;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 320; i++) {\n    const t = (i / 320) * tMax;\n    const val = Math.exp(pl.sigma * t) * Math.sin(pl.omega * t * 2.2);\n    const x = tx + (i / 320) * tw;\n    const y = ty - val * th;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (pulsePos >= 0 && pulsePos <= 1) {\n    const pxAnim = tx + pulsePos * tw;\n    const tNow = pulsePos * tMax;\n    const valNow = Math.exp(pl.sigma * tNow) * Math.sin(pl.omega * tNow * 2.2);\n    const pyAnim = ty - valNow * th;\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath(); ctx.arc(pxAnim, pyAnim, 4.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('共轭极点对的时域响应 h(t) ~ e^(σt) sin(ωt)', tx, 22);\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '11px monospace';\n  ctx.fillText('-- 包络线 ±e^(RP·t)', tx + 310, 22);\n\n  const qVal = (1 / (2 * Math.abs(pl.sigma))).toFixed(2);\n  lab.setReadout(\n    'P% = ' + pl.p + '/' + pl.half +\n    ' | 衰减率 RP = ' + pl.sigma.toFixed(3) +\n    ' | 频率 IP = ' + pl.omega.toFixed(3) +\n    ' | 等效品质因数 Q = ' + qVal\n  );\n};\n\nlab.onUpdate(() => {\n  if (!lab.values.play) {\n    nextPing = 0;\n    lastPingTime = -1;\n  }\n  draw(-1);\n});\n\nlab.onLoop(() => {\n  if (!lab.values.play) return;\n  try {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    const now = ac.currentTime;\n    if (nextPing === 0 || now >= nextPing) {\n      const pl = getPole();\n      const osc = ac.createOscillator();\n      const gain = ac.createGain();\n      const freq = 180 + pl.omega * 640;\n      const tau = Math.min(0.55, 0.055 / Math.max(0.05, Math.abs(pl.sigma)));\n      const dur = tau * 4.5;\n      osc.type = 'sine';\n      osc.frequency.setValueAtTime(freq, now);\n      gain.gain.setValueAtTime(0.0005, now);\n      gain.gain.linearRampToValueAtTime(0.24, now + 0.006);\n      gain.gain.exponentialRampToValueAtTime(0.0005, now + dur);\n      osc.connect(gain);\n      gain.connect(ac.destination);\n      osc.start(now);\n      osc.stop(now + dur + 0.02);\n      lastPingTime = now;\n      nextPing = now + 0.9;\n    }\n    const elapsed = (now - lastPingTime) / 0.85;\n    draw(elapsed >= 0 && elapsed <= 1 ? elapsed : -1);\n  } catch (e) {}\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "极点数 NP 为偶数，程序循环 NP/2 次，每次通过 Block 3 算出第 P% 级的一对共轭极点直角坐标 (RP, ±IP)，对应 s = σ ± jω。",
        "左半平面是稳定生命线：RP（即 σ）必须严格小于 0；右半平面的圆周等分点仅用于理解对称几何，切勿写入滤波器。",
        "RP 越接近 0（极点贴近虚轴 jω），时域阻尼越弱、余振越长、频率选择性越尖锐；且所有极点均满足 RP² + IP² = 1，直接锁定归一化截止频率 ω = 1。"
      ]
    }
  ]
});
