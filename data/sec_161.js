window.__BOOK_REGISTER_SECTION__("sec_161", {
  "title": "人类听觉系统的工程密码 (Human Hearing)",
  "intuition": "人耳不是一台线性麦克风，而是一套自带「阻抗匹配器、机械频谱仪、立方根压缩器与微秒级双耳定位仪」的生物信号处理系统——所有音频算法都必须顺着它的脾气来设计。",
  "blocks": [
    {
      "type": "concept",
      "heading": "外耳、中耳与阻抗匹配：为什么鱼不需要耳膜？",
      "paragraphs": [
        "人类听觉系统分为外耳、中耳和内耳三部分。**外耳**由耳廓和一条直径约 `0.5 cm`、长约 `3 cm` 的耳道组成，负责收集环境声波并引导至耳道尽头的**鼓膜（Tympanic Membrane）**。声波撞击鼓膜引发振动，再经由**中耳**的三块听小骨（锤骨、砧骨、镫骨）传递到**内耳耳蜗（Cochlea）**。",
        "耳蜗是一根直径约 `2 mm`、长约 `3 cm`、盘绕成蜗牛壳状的充液管道。这里有一个致命的物理难题：**空气的声阻抗极低（密度低、可压缩性高），而耳蜗液体的声阻抗极高（像在水中挥手比在空气中费力得多）**。当声波直接从空气撞向液体界面时，绝大部分能量会被反射回来，只有极小部分能进入液体。",
        "中耳听小骨的本质就是一个**声阻抗匹配网络（Impedance Matching Network）**——它大幅提高了进入内耳液体的声能比例。鱼类生活在水中，声音直接在液体中传播，因此根本不需要鼓膜和中耳。中耳匹配的关键在于面积差：鼓膜面积约 `60 mm²`，而接收振动的卵圆窗（Oval Window）面积仅约 `4 mm²`。"
      ],
      "formula": {
        "expr": "P = F / A",
        "explain": "P 为声压，F 为传声力，A 为受力面积。鼓膜面积（约 60 mm²）与卵圆窗面积（约 4 mm²）之比为 15:1，中耳正是利用这一面积差将传入内耳液体的声压放大约 15 倍。"
      }
    },
    {
      "type": "concept",
      "heading": "耳蜗双编码机制：位置原理与神经齐射原理",
      "paragraphs": [
        "耳蜗内部有一条**基底膜（Basilar Membrane）**，上面排列着约 `12,000` 个构成听神经的感官细胞。基底膜的物理特性非常有意思：靠近卵圆窗一端最硬，越往远端越柔软。这种渐变刚度让它成了一台天然的**实时频率频谱分析仪**。",
        "高频声波进入耳蜗后，会在刚度大的卵圆窗附近引发共振并激发该处神经细胞；低频声波则能传播到柔软的远端引发共振。于是，听神经中不同位置的纤维就对应着不同的频率，这种机制称为**位置原理（Place Principle）**，并一路保留到大脑听觉通路中。",
        "除此之外，人耳还采用**齐射原理（Volley Principle）**来编码声音。神经细胞靠发放电脉冲（动作电位）传递信息，单个神经元可以「每振动一个周期就放一次电」，例如用每秒 200 次脉冲代表 `200 Hz` 声波。但单个神经元的生理极限只有约 `500 Hz`。为了突破极限，多组神经细胞会**轮班上岗**（例如 10 个细胞轮流以每秒 300 次的频率交替放电，就能合奏出 `3000 Hz` 的节奏）。齐射原理将时间编码的上限拓展到了约 `4 kHz`，超过 `4 kHz` 后则完全交由位置原理单独负责。"
      ],
      "formula": {
        "expr": "f_total = N_cells × f_neuron   (f_neuron ≤ 500 Hz, f_total ≤ 4 kHz)",
        "explain": "f_total 为能被时间脉冲编码的音频频率，N_cells 为协同轮班的神经细胞数目，f_neuron 为单个神经细胞的放电频率（生理极限约 500 Hz）。超过 4 kHz 后齐射同步失效，仅靠位置原理分辨频率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：基底膜共振位置与神经细胞轮班齐射实验",
      "instruction": "拖动「输入纯音频率」滑块观察基底膜共振峰值如何沿耳蜗移动；调节「轮班神经细胞数」观察下方 20 ms 窗口内多细胞如何接力突破 500 Hz 生理极限。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "输入纯音频率",
          "min": 100,
          "max": 6000,
          "step": 50,
          "value": 1500,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "cells",
          "label": "轮班神经细胞数",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 6,
          "unit": " 个"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nfunction draw(t) {\n  ctx.clearRect(0, 0, W, H);\n  var f = lab.values.freq;\n  var cells = Math.round(lab.values.cells);\n  var perCell = f / cells;\n  var statusText = '';\n  var statusColor = '#10b981';\n  if (f > 4000) {\n    statusText = '超过 4 kHz：齐射失效，完全依赖位置原理';\n    statusColor = '#ec4899';\n  } else if (perCell > 500) {\n    statusText = '单细胞超载 (>500 Hz)！需增加轮班细胞';\n    statusColor = '#f59e0b';\n  } else {\n    statusText = '齐射 + 位置双编码正常工作';\n    statusColor = '#10b981';\n  }\n  lab.setReadout('频率: ' + f + ' Hz | 轮班细胞: ' + cells + ' 个 | 单细胞放电率: ' + perCell.toFixed(0) + ' Hz (极限 500 Hz) | ' + statusText);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (var gy = 0; gy <= H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('1. 位置原理 (Place Principle) —— 基底膜频率共振分布', 20, 18);\n  var mx = 60, mw = 605, my = 62;\n  var logMin = Math.log10(20), logMax = Math.log10(20000);\n  var peakNorm = (logMax - Math.log10(f)) / (logMax - logMin);\n  var peakX = mx + peakNorm * mw;\n  ctx.fillStyle = 'rgba(56,189,248,0.12)';\n  ctx.beginPath();\n  ctx.moveTo(mx, my - 6);\n  ctx.lineTo(mx + mw, my - 21);\n  ctx.lineTo(mx + mw, my + 21);\n  ctx.lineTo(mx, my + 6);\n  ctx.closePath();\n  ctx.fill();\n  ctx.strokeStyle = 'rgba(148,163,184,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n  var marks = [10000, 4000, 1000, 300, 100];\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  for (var m = 0; m < marks.length; m++) {\n    var mf = marks[m];\n    var mp = mx + ((logMax - Math.log10(mf)) / (logMax - logMin)) * mw;\n    ctx.beginPath(); ctx.moveTo(mp, my - 24); ctx.lineTo(mp, my + 24); ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();\n    ctx.fillText(mf >= 1000 ? (mf / 1000) + 'k' : mf + 'Hz', mp - 10, my + 35);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= mw; i += 3) {\n    var x = mx + i;\n    var dist = (x - peakX) / 38;\n    var env = Math.exp(-dist * dist);\n    var wave = Math.sin(i * 0.14 - t * 12) * env * 20;\n    if (i === 0) ctx.moveTo(x, my + wave); else ctx.lineTo(x, my + wave);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(peakX, my, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('卵圆窗(硬/高频)', 12, my - 12);\n  ctx.fillText('耳蜗顶端(软/低频)', 612, my - 24);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('2. 齐射原理 (Volley Principle) —— 20 ms 窗口内多细胞轮班放电', 20, 122);\n  ctx.fillStyle = statusColor;\n  ctx.fillText(statusText, 450, 122);\n  var tx = 60, tw = 605, ty = 135, th = 84;\n  var winSec = 0.020;\n  var rowH = th / cells;\n  var numCycles = Math.floor(f * winSec);\n  for (var c = 0; c < cells; c++) {\n    var ry = ty + c * rowH + rowH * 0.5;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.moveTo(tx, ry); ctx.lineTo(tx + tw, ry); ctx.stroke();\n    if (cells <= 8 || c % 2 === 0) {\n      ctx.fillStyle = '#94a3b8';\n      ctx.font = '9px sans-serif';\n      ctx.fillText('N' + (c + 1), 28, ry + 3);\n    }\n  }\n  ctx.strokeStyle = statusColor;\n  ctx.lineWidth = cells > 8 ? 1.4 : 2;\n  var spikeH = Math.max(3, rowH * 0.38);\n  for (var k = 0; k < numCycles; k++) {\n    var cycTime = k / f;\n    var sx = tx + (cycTime / winSec) * tw;\n    var cellIdx = k % cells;\n    var sy = ty + cellIdx * rowH + rowH * 0.5;\n    ctx.beginPath();\n    ctx.moveTo(sx, sy + spikeH);\n    ctx.lineTo(sx, sy - spikeH);\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0 ms', tx, ty + th + 13);\n  ctx.fillText('20 ms (单细胞放电: ' + perCell.toFixed(0) + ' Hz / 上限 500 Hz)', tx + tw - 250, ty + th + 13);\n}\nlab.onUpdate(function() { draw(performance.now() * 0.001); });\nlab.onLoop(function(dt, t) { draw(t); });"
    },
    {
      "type": "concept",
      "heading": "分贝 SPL、对数响度与「立方根隔音悖论」",
      "paragraphs": [
        "人耳能承受的声强跨度极其惊人，从最微弱的耳语到最响亮的雷鸣，声强范围高达 `120 dB`（对应振幅跨度 `1,000,000` 倍，功率跨度 `10¹²` 倍）。工程上常用对数单位 **dB SPL（Sound Power Level）** 度量：`0 dB SPL` 对应 `10⁻¹⁶ watts/cm²`（人耳可闻下限，此时鼓膜振幅甚至小于单个分子直径！），正常交谈约 `60 dB SPL`，痛阈约 `140 dB SPL`。然而，人耳能察觉到的最小响度变化约为 `1 dB`（振幅变化 `12%`），这意味着从最轻到最响之间，人耳实际上只能分辨出大约 `120` 个响度等级。",
        "更反直觉的是，主观响度与声功率之间呈**立方根（1/3 次方）关系**。声功率增大 10 倍，听众只会觉得响度增大了约 2 倍（`10^(1/3) ≈ 2.15`）。这在建筑隔音中制造了著名的麻烦：假设隔壁音响太吵，你把自家墙面 `99%` 的面积都贴上了完美隔音材料，仅留下 `1%` 的门缝或通风口面积——虽然透射进来的**声功率**降到了原来的 `1%`（`-20 dB`），但人耳感知到的**响度**却只降到了 `0.01^(1/3) ≈ 0.215`（依然有原来的 `20%` 以上那么吵！）。",
        "在频率维度上，人耳理论听域为 `20 Hz ~ 20 kHz`，但对 `1 kHz ~ 4 kHz` 最为敏感：在 `3 kHz` 处低至 `0 dB SPL` 就能听见，而在 `100 Hz` 处则需要高达 `40 dB SPL`（振幅放大 100 倍）才能听见。频率分辨力同样如此：在 `3 kHz` 处能分辨 `0.3%` 的音高差异，在 `100 Hz` 处则退化到 `3%`（作为对比，钢琴相邻琴键的频率差约为 `6%`）。"
      ],
      "formula": {
        "expr": "Loudness ∝ (Sound Power)^(1/3)",
        "explain": "主观感知响度近似正比于物理声功率的 1/3 次方。因此要让主观响度减半，物理声功率必须削减到原来的 1/8（约 -9 dB）甚至 1/10（-10 dB）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：隔音墙的残酷现实——声功率与感知响度对比（含试听）",
      "instruction": "点击播放模拟隔壁低音炮声音，把「隔音覆盖率」拉到 99% 并切换「拆除隔音对比」开关，亲耳验证为什么物理功率降了 99%，听感响度却依然明显。",
      "controls": [
        {
          "type": "slider",
          "id": "coverage",
          "label": "墙面隔音覆盖率",
          "min": 0,
          "max": 99.9,
          "step": 0.1,
          "value": 99,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "临时拆除隔音（对比原声）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放邻居音响测试音",
          "activeLabel": "⏸ 暂停测试音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audio = null;\nfunction stopAudio() {\n  if (!audio) return;\n  try {\n    audio.gain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.02);\n    var old = audio;\n    setTimeout(function() {\n      try { old.osc1.stop(); old.osc2.stop(); old.osc1.disconnect(); old.osc2.disconnect(); old.gain.disconnect(); } catch(e) {}\n    }, 80);\n  } catch(e) {}\n  audio = null;\n}\nfunction syncAudio(powerFrac) {\n  if (!lab.values.play) { stopAudio(); return; }\n  try {\n    var ac = lab.getAudioContext();\n    if (!ac || ac.state === 'closed') return;\n    if (ac.state === 'suspended') ac.resume();\n    var targetGain = 0.22 * Math.sqrt(powerFrac);\n    if (!audio) {\n      var g = ac.createGain();\n      g.gain.setValueAtTime(0.0001, ac.currentTime);\n      g.gain.setTargetAtTime(targetGain, ac.currentTime, 0.03);\n      var f = ac.createBiquadFilter();\n      f.type = 'lowpass';\n      f.frequency.setValueAtTime(900, ac.currentTime);\n      var o1 = ac.createOscillator();\n      var o2 = ac.createOscillator();\n      o1.type = 'sawtooth'; o1.frequency.setValueAtTime(110, ac.currentTime);\n      o2.type = 'triangle'; o2.frequency.setValueAtTime(165, ac.currentTime);\n      o1.connect(f); o2.connect(f); f.connect(g); g.connect(ac.destination);\n      o1.start(); o2.start();\n      audio = { ctx: ac, osc1: o1, osc2: o2, gain: g };\n    } else {\n      audio.gain.gain.setTargetAtTime(targetGain, ac.currentTime, 0.03);\n    }\n  } catch(e) {}\n}\nfunction draw(t) {\n  ctx.clearRect(0, 0, W, H);\n  var effCov = lab.values.bypass ? 0 : lab.values.coverage;\n  var powerFrac = Math.max(0.0005, (100 - effCov) / 100);\n  var loudFrac = Math.pow(powerFrac, 1 / 3);\n  var dbDrop = 10 * Math.log10(powerFrac);\n  lab.setReadout('实际隔音覆盖: ' + effCov.toFixed(1) + '% | 透射声功率: ' + (powerFrac * 100).toFixed(2) + '% (' + dbDrop.toFixed(1) + ' dB) | 人耳感知响度: ' + (loudFrac * 100).toFixed(1) + '%');\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (var gy = 0; gy <= H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('1. 隔音墙与缝隙透射', 18, 22);\n  var wallX = 85, wallY = 38, wallW = 24, wallH = 176;\n  var gapH = Math.max(2, wallH * (100 - effCov) / 100);\n  var covH = wallH - gapH;\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(wallX, wallY, wallW, covH);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(wallX, wallY + covH, wallW, gapH);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  for (var w = 0; w < 4; w++) {\n    var phase = ((t * 45 + w * 14) % 56);\n    ctx.globalAlpha = 1 - phase / 56;\n    ctx.beginPath();\n    ctx.arc(wallX - 4, wallY + wallH / 2, 10 + phase, Math.PI * 0.65, Math.PI * 1.35);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = '#ec4899';\n  for (var w2 = 0; w2 < 4; w2++) {\n    var ph2 = ((t * 45 + w2 * 18) % 72);\n    ctx.globalAlpha = Math.max(0.15, (1 - ph2 / 72) * loudFrac);\n    ctx.beginPath();\n    ctx.arc(wallX + wallW + 2, wallY + covH + gapH / 2, 6 + ph2, -Math.PI * 0.4, Math.PI * 0.4);\n    ctx.stroke();\n  }\n  ctx.globalAlpha = 1;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('邻居音响', 16, 130);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('隔音材料 ' + effCov.toFixed(1) + '%', 118, 66);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('门缝/风口 ' + (100 - effCov).toFixed(1) + '%', 118, 206);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('2. 物理功率 vs 感知响度', 235, 22);\n  var barX = 240, barW = 185;\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('透射声功率 P: ' + (powerFrac * 100).toFixed(2) + '%', barX, 62);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(barX, 72, barW, 24);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(barX, 72, Math.max(2, barW * powerFrac), 24);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('感知响度 P^(1/3): ' + (loudFrac * 100).toFixed(1) + '%', barX, 132);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(barX, 142, barW, 24);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(barX, 142, Math.max(2, barW * loudFrac), 24);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('堵住99%面积，响度仍剩约21.5%！', barX, 198);\n  var px = 475, py = 42, pw = 215, ph = 165;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('3. 立方根响度定律曲线', px, 22);\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(px, py); ctx.lineTo(px, py + ph); ctx.lineTo(px + pw, py + ph);\n  ctx.stroke();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.beginPath();\n  ctx.moveTo(px, py + ph); ctx.lineTo(px + pw, py);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= 100; i++) {\n    var xf = i / 100;\n    var yf = Math.pow(xf, 1 / 3);\n    var cx = px + xf * pw, cy = py + ph - yf * ph;\n    if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);\n  }\n  ctx.stroke();\n  var dotX = px + powerFrac * pw;\n  var dotY = py + ph - loudFrac * ph;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('声功率 P (0 → 100%)', px + 55, py + ph + 16);\n}\nlab.onUpdate(function() {\n  var effCov = lab.values.bypass ? 0 : lab.values.coverage;\n  var powerFrac = Math.max(0.0005, (100 - effCov) / 100);\n  syncAudio(powerFrac);\n  draw(performance.now() * 0.001);\n});\nlab.onLoop(function(dt, t) {\n  draw(t);\n});"
    },
    {
      "type": "concept",
      "heading": "双耳定位与距离感：为什么人能听音辨位却测不准距离？",
      "paragraphs": [
        "人类长着**两只耳朵**的最大工程优势在于识别声源方向。人耳可以分辨小至 `3°` 的方位角差异（相当于在 `10 米` 外分辨一个人的宽度）。大脑通过两条完全独立的物理线索来计算方向：",
        "第一条线索是**头部声影（Head Shadowing，即双耳电平差）**：对于 `1 kHz` 以上的高频声波，人的头部会形成明显遮挡，导致靠近声源的一侧耳朵收到的声音显著强于背侧耳朵。第二条线索是**双耳时间差（Interaural Time Difference）**：远侧耳朵收到声波的时刻略晚于近侧耳朵。这条线索依赖神经齐射原理来记录相位与到达时刻，因此主要作用于 `1 kHz` 以下的低频声音。有趣的是，如果用耳机给两耳播放**完全相同的单声道信号**，大脑既找不到时间差也找不到声压差，就会得出一个诡异的结论：**声音是从自己脑袋正中央发出来的！**",
        "尽管人类辨别**方向**极准，判断声源**距离**的能力却很差，因为声波中携带的距离线索非常微弱。人耳只能模糊地觉得高频丰富代表声源较近、高频衰减（只剩低频）代表声源较远；此外还能靠回声间隔感知房间大小（大礼堂回声间隔约 `100 ms`，小办公室约 `10 ms`）。相比之下，蝙蝠和海豚通过主动发射咔哒声并测量回声延时（**主动声呐**），能实现约 `1 cm` 的空间定位精度；实验表明部分人类（尤其是盲人）也能在微弱程度上利用主动回声定位。"
      ],
      "formula": {
        "expr": "Δt ≈ (d · θ) / c",
        "explain": "Δt 为双耳到达时间差，d 为人头直径（约 22 cm = 0.22 m），θ 为声源偏角（弧度），c 为声速（约 340 m/s）。代入 3°（0.052 弧度）可得人耳捕捉方向变化的时间精度高达约 30 微秒！"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 3：双耳时间差 (ITD) 与头部声影 (ILD) 立体声定位",
      "instruction": "戴上耳机播放测试音，拖动「声源方位角」和「测试频率」滑块：观察低于 1 kHz 时时间差主导、高于 1 kHz 时头部声影加剧；把角度调回 0° 感受声音缩回大脑中央。",
      "controls": [
        {
          "type": "slider",
          "id": "angle",
          "label": "声源方位角 (左 -90° ~ 右 +90°)",
          "min": -90,
          "max": 90,
          "step": 1,
          "value": 35,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "测试音频率 (观察 1 kHz 分界)",
          "min": 200,
          "max": 4000,
          "step": 50,
          "value": 400,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 戴耳机试听双耳定位",
          "activeLabel": "⏸ 暂停定位音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audio = null;\nfunction calcParams() {\n  var ang = lab.values.angle;\n  var f = lab.values.freq;\n  var rad = Math.abs(ang) * Math.PI / 180;\n  var itdSec = (0.11 * (rad + Math.sin(rad))) / 340;\n  var freqFactor = 1 / (1 + Math.pow(1000 / f, 2));\n  var shadowDb = 15 * freqFactor * Math.sin(rad);\n  var farGain = Math.pow(10, -shadowDb / 20);\n  return { ang: ang, f: f, rad: rad, itdSec: itdSec, itdUs: itdSec * 1e6, shadowDb: shadowDb, farGain: farGain };\n}\nfunction stopAudio() {\n  if (!audio) return;\n  try {\n    var t = audio.ctx.currentTime;\n    audio.gl.gain.setTargetAtTime(0, t, 0.02);\n    audio.gr.gain.setTargetAtTime(0, t, 0.02);\n    var old = audio;\n    setTimeout(function() {\n      try { old.osc.stop(); old.osc.disconnect(); old.merger.disconnect(); } catch(e) {}\n    }, 80);\n  } catch(e) {}\n  audio = null;\n}\nfunction syncAudio(p) {\n  if (!lab.values.play) { stopAudio(); return; }\n  try {\n    var ac = lab.getAudioContext();\n    if (!ac || ac.state === 'closed') return;\n    if (ac.state === 'suspended') ac.resume();\n    var baseG = 0.14;\n    var lg = p.ang > 0 ? baseG * p.farGain : baseG;\n    var rg = p.ang < 0 ? baseG * p.farGain : baseG;\n    var ld = 0.002 + (p.ang > 0 ? p.itdSec : 0);\n    var rd = 0.002 + (p.ang < 0 ? p.itdSec : 0);\n    if (!audio) {\n      var osc = ac.createOscillator();\n      osc.type = 'sine';\n      osc.frequency.setValueAtTime(p.f, ac.currentTime);\n      var dl = ac.createDelay(0.05);\n      var dr = ac.createDelay(0.05);\n      dl.delayTime.setValueAtTime(ld, ac.currentTime);\n      dr.delayTime.setValueAtTime(rd, ac.currentTime);\n      var gl = ac.createGain();\n      var gr = ac.createGain();\n      gl.gain.setValueAtTime(0.0001, ac.currentTime);\n      gr.gain.setValueAtTime(0.0001, ac.currentTime);\n      gl.gain.setTargetAtTime(lg, ac.currentTime, 0.025);\n      gr.gain.setTargetAtTime(rg, ac.currentTime, 0.025);\n      var merger = ac.createChannelMerger(2);\n      osc.connect(dl); osc.connect(dr);\n      dl.connect(gl); dr.connect(gr);\n      gl.connect(merger, 0, 0);\n      gr.connect(merger, 0, 1);\n      merger.connect(ac.destination);\n      osc.start();\n      audio = { ctx: ac, osc: osc, dl: dl, dr: dr, gl: gl, gr: gr, merger: merger };\n    } else {\n      var t = ac.currentTime;\n      audio.osc.frequency.setTargetAtTime(p.f, t, 0.02);\n      audio.dl.delayTime.setTargetAtTime(ld, t, 0.02);\n      audio.dr.delayTime.setTargetAtTime(rd, t, 0.02);\n      audio.gl.gain.setTargetAtTime(lg, t, 0.02);\n      audio.gr.gain.setTargetAtTime(rg, t, 0.02);\n    }\n  } catch(e) {}\n}\nfunction draw(t) {\n  ctx.clearRect(0, 0, W, H);\n  var p = calcParams();\n  var dirLabel = p.ang === 0 ? '正前方 0° (脑中央)' : (p.ang > 0 ? '右偏 ' + p.ang + '°' : '左偏 ' + Math.abs(p.ang) + '°');\n  var cueLabel = Math.abs(p.ang) < 3 ? '双耳一致 (脑中成像)' : (p.f < 1000 ? '齐射时间差 (ITD) 主导' : '头部声影电平差 (ILD) 主导');\n  lab.setReadout('声源方位: ' + dirLabel + ' | 到达时间差 (ITD): ' + p.itdUs.toFixed(0) + ' μs | 头部声影衰减 (ILD): ' + p.shadowDb.toFixed(1) + ' dB | ' + cueLabel);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (var gy = 0; gy <= H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('1. 俯视声场与头部声影 (Head Shadow)', 18, 20);\n  var hx = 175, hy = 142, hr = 34;\n  var srcAngle = -Math.PI / 2 + p.ang * Math.PI / 180;\n  var sx = hx + 92 * Math.cos(srcAngle);\n  var sy = hy + 92 * Math.sin(srcAngle);\n  if (p.shadowDb > 1.2) {\n    var oppAngle = srcAngle + Math.PI;\n    ctx.fillStyle = 'rgba(236,72,153,' + Math.min(0.32, p.shadowDb / 40) + ')';\n    ctx.beginPath();\n    ctx.moveTo(hx, hy);\n    ctx.arc(hx, hy, 95, oppAngle - 0.35, oppAngle + 0.35);\n    ctx.closePath();\n    ctx.fill();\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  for (var w = 0; w < 4; w++) {\n    var r = ((t * 50 + w * 26) % 104);\n    ctx.globalAlpha = Math.max(0.1, 1 - r / 104);\n    ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke();\n  }\n  ctx.globalAlpha = 1;\n  ctx.fillStyle = '#1e293b';\n  ctx.strokeStyle = '#94a3b8';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.arc(hx, hy, hr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(hx - 6, hy - hr + 2); ctx.lineTo(hx, hy - hr - 8); ctx.lineTo(hx + 6, hy - hr + 2); ctx.stroke();\n  ctx.fillStyle = '#38bdf8'; ctx.fillRect(hx - hr - 5, hy - 7, 5, 14);\n  ctx.fillStyle = '#10b981'; ctx.fillRect(hx + hr, hy - 7, 5, 14);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc'; ctx.font = '10px sans-serif';\n  ctx.fillText('声源', sx - 10, sy - 11);\n  if (p.ang === 0) {\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(hx, hy, 6 + Math.sin(t * 6) * 2, 0, Math.PI * 2); ctx.fill();\n    ctx.fillText('脑中成像!', hx - 22, hy + 4);\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('2. 左右耳接收波形实时对比 (时差 Δt 与 声压衰减)', 355, 20);\n  var wx = 365, ww = 325, ly = 78, ry = 158;\n  var lgRatio = p.ang > 0 ? p.farGain : 1;\n  var rgRatio = p.ang < 0 ? p.farGain : 1;\n  var lShift = p.ang > 0 ? (p.itdUs / 850) * 55 : 0;\n  var rShift = p.ang < 0 ? (p.itdUs / 850) * 55 : 0;\n  ctx.fillStyle = '#38bdf8'; ctx.font = '11px sans-serif';\n  ctx.fillText('左耳 (L)  振幅: ' + (lgRatio * 100).toFixed(0) + '%  延迟: ' + (p.ang > 0 ? p.itdUs.toFixed(0) : '0') + ' μs', wx, ly - 32);\n  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i <= ww; i += 2) {\n    var phL = ((i - lShift) / ww) * Math.PI * 4 - t * 6;\n    var valL = Math.sin(phL) * 24 * lgRatio;\n    if (i === 0) ctx.moveTo(wx + i, ly + valL); else ctx.lineTo(wx + i, ly + valL);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('右耳 (R)  振幅: ' + (rgRatio * 100).toFixed(0) + '%  延迟: ' + (p.ang < 0 ? p.itdUs.toFixed(0) : '0') + ' μs', wx, ry - 32);\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var j = 0; j <= ww; j += 2) {\n    var phR = ((j - rShift) / ww) * Math.PI * 4 - t * 6;\n    var valR = Math.sin(phR) * 24 * rgRatio;\n    if (j === 0) ctx.moveTo(wx + j, ry + valR); else ctx.lineTo(wx + j, ry + valR);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('主导机制: ' + cueLabel, wx, 215);\n}\nlab.onUpdate(function() {\n  var p = calcParams();\n  syncAudio(p);\n  draw(performance.now() * 0.001);\n});\nlab.onLoop(function(dt, t) { draw(t); });"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【响度设计要用对数与幂律思维】：人耳只能分辨约 120 级响度（最小变化 1 dB），且响度正比于声功率的 1/3 次方。做音量调节滑块时千万别用线性增益，必须使用对数（dB）映射；做降噪或隔音工程时更不能漏掉 1% 的缝隙，因为漏出 1% 声功率依然会保留超过 20% 的主观响度。",
        "【语音编码重点保 1~4 kHz】：虽然人耳名义听域是 20 Hz~20 kHz，但对 1~4 kHz 最为敏感（0 dB 即可听清，频率分辨力达 0.3%）。电话或语音压缩系统优先保证这一频段的信噪比与精度，性价比最高。",
        "【立体声定位要分频段对待】：1 kHz 以下靠到达时间差（ITD，微秒级相位同步）辨位，1 kHz 以上靠头部声影造成的左右音量差（ILD）辨位。做 3D 音频或空间音效时，单纯调左右音量（Pan）对低音无效，必须配合微秒级延时；反之，让左右声道完全一致会把声像锁死在听者大脑正中。"
      ]
    }
  ]
});
