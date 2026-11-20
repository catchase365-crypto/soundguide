window.__BOOK_REGISTER_SECTION__("sec_071", {
  "title": "低通与高通滤波器 (Low-pass and High-pass Filters)",
  "intuition": "低通滤波器用“成片正样本”做局部加权平均以抹平高频毛刺；而用脉冲函数减去低通核，就能瞬间将其翻转为“一柱擎天、周围凹陷”的高通滤波器，专挑锐利边缘与高频细节。",
  "blocks": [
    {
      "type": "concept",
      "heading": "低通滤波器核（Filter Kernel）的物理本质与三大经典形态",
      "paragraphs": [
        "在数字信号处理中，**滤波器核（Filter Kernel）**就是系统**脉冲响应（Impulse Response）**的另一种叫法。决定一个线性系统是留住平滑轮廓还是提取尖锐细节的密码，全都写在这个核的形状里。",
        "观察绝大多数**低通滤波器（Low-pass Filter）**的核，你会发现一个共同特征：它们主要由**一组相邻的正数值采样点**组成。当它与输入信号做卷积时，相当于把输出端的每一个采样点，都变成了输入端周围许多相邻点的**加权平均**。这种“平均化”效应会天然地抹平剧烈跳变（平滑信号），从而滤除高频噪声与高频分量。正如图 7-4 所示，工程中最常见的三种低通核各有所长：",
        "1. **指数衰减核（Exponential）**：结构最简单的递归（IIR）滤波器核，从样本 0 开始呈指数规律单调衰减，非常适合用极少的代码在单片机中实现实时平滑。",
        "2. **矩形脉冲核（Square Pulse / Moving Average）**：由一段等高的正数构成（即滑动平均）。它在**压制随机噪声的同时，最擅长保持阶跃边缘的锐度**，在图像和时域信号去噪中极为常用。",
        "3. **辛克核（Sinc, `sin(x)/x`）**：它的主瓣是正数，但两侧尾巴上包含少量正负交替的负值采样点。虽然时域上稍微复杂，但它在频域上像一把手术刀，最适合将**一个频带与另一个频带彻底分离**。"
      ],
      "formula": {
        "expr": "∑ h_LP[k] = 1   (DC 直流增益 = 1)",
        "explain": "h_LP[k] 为低通滤波器核第 k 个采样点的权重。所有点权重之和必须等于 1，才能保证直流分量（0 Hz，即信号的平均基准高度）在滤波前后既不被放大也不被衰减。"
      }
    },
    {
      "type": "concept",
      "heading": "核宽度、截止频率与“无限长尾巴”的工程截断",
      "paragraphs": [
        "在设计低通滤波器时，如何调节它的**截止频率（Cutoff Frequency）**？答案非常直观：**改变滤波器核的胖瘦（宽度）**。核越宽，参与平均的邻近点越多，信号被抹得越平，截止频率就越低；核越窄，只有紧挨着的几个点参与平均，更多高频细节得以保留，截止频率就越高。",
        "从理论上讲，像**指数核**和 **Sinc 核**的尾巴会一直延伸到无穷远而永远不会真正降为零。但在实际写代码时，计算机内存是有限的，我们必须在尾巴衰减到足够小之后将其**截断（Truncate）**，只保留有限个采样点，并重新归一化使所有点之和仍为 `1`。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "实验一：低通核形态、宽度调节与真实听感对比",
      "instruction": "拖动“核形状”和“滤波核宽度”观察时域核形态与信号平滑效果；点击“播放滤波听感”可实时对比高频噪声被滤除的声音变化。",
      "controls": [
        {
          "type": "slider",
          "id": "kernelType",
          "label": "核形状 (0矩形 / 1指数 / 2Sinc)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 0
        },
        {
          "type": "slider",
          "id": "width",
          "label": "滤波核宽度 (点数)",
          "min": 3,
          "max": 25,
          "step": 2,
          "value": 9
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "高频噪声强度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 60,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "直通原信号对比 (Bypass)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波听感",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var activeSrc = null;\n\nfunction buildLP(type, width) {\n  var len = 41;\n  var center = 20;\n  var h = new Array(len).fill(0);\n  if (type === 0) {\n    var half = Math.floor(width / 2);\n    for (var k = -half; k <= half; k++) {\n      if (center + k >= 0 && center + k < len) h[center + k] = 1;\n    }\n  } else if (type === 1) {\n    var tau = Math.max(0.8, width / 3.2);\n    for (var k = 0; k <= 20; k++) {\n      h[center + k] = Math.exp(-k / tau);\n    }\n  } else {\n    var fc = Math.min(0.45, 1.0 / width);\n    for (var k = -20; k <= 20; k++) {\n      var win = 0.54 + 0.46 * Math.cos(Math.PI * k / 20);\n      if (k === 0) {\n        h[center + k] = 2 * fc * win;\n      } else {\n        h[center + k] = (Math.sin(2 * Math.PI * fc * k) / (Math.PI * k)) * win;\n      }\n    }\n  }\n  var sum = 0;\n  for (var i = 0; i < len; i++) sum += h[i];\n  for (var i = 0; i < len; i++) h[i] /= (sum || 1);\n  return h;\n}\n\nfunction updateAudio(h, noisePct, bypass) {\n  if (activeSrc) {\n    try { activeSrc.stop(); activeSrc.disconnect(); } catch (e) {}\n    activeSrc = null;\n  }\n  if (!lab.values.play) return;\n  var ctx = lab.getAudioContext();\n  if (ctx.state === 'suspended') ctx.resume();\n  var sr = ctx.sampleRate;\n  var buf = ctx.createBuffer(1, sr, sr);\n  var out = buf.getChannelData(0);\n  var raw = new Float32Array(sr);\n  var nAmp = noisePct / 100;\n  for (var i = 0; i < sr; i++) {\n    var t = i / sr;\n    var low = 0.35 * Math.sin(2 * Math.PI * 165 * t) + 0.12 * Math.sin(2 * Math.PI * 330 * t);\n    var high = nAmp * (0.25 * Math.sin(2 * Math.PI * 2400 * t) + 0.25 * (Math.random() * 2 - 1));\n    raw[i] = low + high;\n  }\n  if (bypass) {\n    for (var i = 0; i < sr; i++) out[i] = raw[i] * 0.45;\n  } else {\n    var taps = [];\n    for (var k = 0; k < h.length; k++) {\n      if (Math.abs(h[k]) > 1e-6) taps.push({ off: (k - 20) * 2, w: h[k] });\n    }\n    for (var i = 0; i < sr; i++) {\n      var acc = 0;\n      for (var j = 0; j < taps.length; j++) {\n        var idx = i - taps[j].off;\n        if (idx < 0) idx += sr;\n        else if (idx >= sr) idx -= sr;\n        acc += raw[idx] * taps[j].w;\n      }\n      out[i] = acc * 0.45;\n    }\n  }\n  var src = ctx.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(ctx.destination);\n  src.start();\n  activeSrc = src;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var type = Math.round(lab.values.kernelType);\n  var width = Math.round(lab.values.width);\n  var noisePct = lab.values.noise;\n  var bypass = lab.values.bypass;\n  var h = buildLP(type, width);\n  updateAudio(h, noisePct, bypass);\n\n  ctx.clearRect(0, 0, W, H);\n\n  var kLeft = 36, kTop = 28, kW = 220, kH = 182;\n  var sLeft = 296, sTop = 28, sW = 404, sH = 182;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = kTop + (kH * g) / 4;\n    ctx.beginPath(); ctx.moveTo(kLeft, gy); ctx.lineTo(kLeft + kW, gy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(sLeft, gy); ctx.lineTo(sLeft + sW, gy); ctx.stroke();\n  }\n  for (var g = 0; g <= 4; g++) {\n    var gx = kLeft + (kW * g) / 4;\n    ctx.beginPath(); ctx.moveTo(gx, kTop); ctx.lineTo(gx, kTop + kH); ctx.stroke();\n  }\n\n  var kZeroY = kTop + kH * 0.8;\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(kLeft, kZeroY); ctx.lineTo(kLeft + kW, kZeroY); ctx.stroke();\n\n  var maxH = 0.4;\n  for (var i = 0; i < h.length; i++) {\n    if (h[i] > maxH) maxH = h[i] * 1.15;\n  }\n  var kScale = (kH * 0.72) / maxH;\n  for (var i = 0; i < h.length; i++) {\n    var x = kLeft + (i / 40) * kW;\n    var y = kZeroY - h[i] * kScale;\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(x, kZeroY); ctx.lineTo(x, y); ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(x - 2, y - 2, 4, 4);\n  }\n\n  var sigLen = 180;\n  var rawSig = new Array(sigLen);\n  var nAmp = noisePct / 100;\n  for (var i = 0; i < sigLen; i++) {\n    var base = (i >= 55 && i <= 115) ? 0.55 : -0.35;\n    base += 0.25 * Math.sin(2 * Math.PI * i / 70);\n    var pseudo = ((Math.sin(i * 12.9898) * 43758.5453) % 1);\n    if (pseudo < 0) pseudo += 1;\n    var hf = nAmp * (0.28 * Math.sin(2 * Math.PI * i * 0.34) + 0.28 * (pseudo - 0.5));\n    rawSig[i] = base + hf;\n  }\n  var outSig = new Array(sigLen).fill(0);\n  for (var i = 20; i < sigLen - 20; i++) {\n    var acc = 0;\n    for (var k = 0; k < 41; k++) {\n      acc += rawSig[i - (k - 20)] * h[k];\n    }\n    outSig[i] = acc;\n  }\n\n  var sZeroY = sTop + sH * 0.52;\n  var sScale = sH * 0.38;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(sLeft, sZeroY); ctx.lineTo(sLeft + sW, sZeroY); ctx.stroke();\n\n  ctx.strokeStyle = bypass ? '#f59e0b' : 'rgba(245,158,11,0.42)';\n  ctx.lineWidth = bypass ? 2.2 : 1.2;\n  ctx.beginPath();\n  for (var i = 30; i < 150; i++) {\n    var px = sLeft + ((i - 30) / 119) * sW;\n    var py = sZeroY - rawSig[i] * sScale;\n    if (i === 30) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (!bypass) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (var i = 30; i < 150; i++) {\n      var px = sLeft + ((i - 30) / 119) * sW;\n      var py = sZeroY - outSig[i] * sScale;\n      if (i === 30) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  var names = ['矩形脉冲 (Square Pulse)', '指数衰减 (Exponential)', '辛克函数 (Sinc)'];\n  ctx.fillText('低通核 h[n]: ' + names[type], kLeft, 18);\n  ctx.fillText(bypass ? '信号波形：当前直通未滤波原信号 (琥珀色)' : '信号波形：原含噪信号(琥珀) vs 低通平滑输出(青绿)', sLeft, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('-20', kLeft - 6, kTop + kH + 14);\n  ctx.fillText('0', kLeft + kW / 2 - 3, kTop + kH + 14);\n  ctx.fillText('+20', kLeft + kW - 14, kTop + kH + 14);\n\n  var sumCheck = 0;\n  for (var i = 0; i < h.length; i++) sumCheck += h[i];\n  lab.setReadout('核形状: ' + names[type] + ' | 核宽度: ' + width + ' | DC 直流增益 (∑h) = ' + sumCheck.toFixed(3) + ' | 状态: ' + (bypass ? '已直通对比' : '低通滤波中'));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "从低通到高通：神奇的“脉冲减法”（谱反转变换）",
      "paragraphs": [
        "在数字滤波器设计中，工程师很少从零开始苦思冥想一个高通滤波器，而是采用一种极其聪明的套路：**先设计一个低通滤波器，再通过数学变换把它“翻”成高通滤波器**。",
        "这个变换的原理可以用“整体减去部分”来理解：已知**单位脉冲函数（Delta Function, `δ[n]`）**作为核时，会让整个信号原封不动地通过（全通）；而**低通核（`h_LP[n]`）**只让低频分量通过。根据线性系统的**叠加原理**，只要用脉冲核减去低通核，新得到的核就会放行“整个信号减去低频分量”——剩下的恰好就全是高频分量！一个高通滤波器就此诞生。",
        "正如原书图 7-5 所示，所有高通滤波器核都长着一副极具辨识度的模样：**正中间孤零零地竖起一根极高的正尖峰，紧挨着它的周围则是一片深陷到零轴以下的负值采样点**。由于单位脉冲函数 `δ[n]` 的加权和是 `1`，低通核之和也是 `1`，两者相减后，高通核的所有采样点之和严格等于 `0`，这意味着它在直流（0 Hz）处的增益完全为零。"
      ],
      "formula": {
        "expr": "h_HP[n] = δ[n - n₀] - h_LP[n]",
        "explain": "δ[n - n₀] 表示位于 n₀ 处的单位脉冲（仅在 n = n₀ 时取 1，其余全为 0）。对于对称的低通核（如矩形核、Sinc 核），n₀ 取对称中心；对于不对称的因果核（如指数核），n₀ 通常取样本 0 处。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：脉冲减法实时变形器——把低通核变成高通核",
      "instruction": "拖动“脉冲减法进度”滑块从 0% 拉到 100%，亲眼观察中心脉冲如何窜起、两侧正样本如何翻转成负谷，以及输出信号中直流偏置与慢波是如何被彻底抹除的。",
      "controls": [
        {
          "type": "slider",
          "id": "kernelType",
          "label": "基础核形状 (0矩形 / 1指数 / 2Sinc)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 0
        },
        {
          "type": "slider",
          "id": "width",
          "label": "滤波核宽度 (点数)",
          "min": 5,
          "max": 21,
          "step": 2,
          "value": 9
        },
        {
          "type": "slider",
          "id": "transform",
          "label": "脉冲减法进度 (0%低通 → 100%高通)",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 100,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "stepMode",
          "label": "切换为阶跃边缘测试信号",
          "value": false
        }
      ],
      "jsCode": "function buildKernel(type, width, t) {\n  var len = 41;\n  var center = 20;\n  var lp = new Array(len).fill(0);\n  if (type === 0) {\n    var half = Math.floor(width / 2);\n    for (var k = -half; k <= half; k++) lp[center + k] = 1;\n  } else if (type === 1) {\n    var tau = Math.max(0.8, width / 3.2);\n    for (var k = 0; k <= 20; k++) lp[center + k] = Math.exp(-k / tau);\n  } else {\n    var fc = Math.min(0.45, 1.0 / width);\n    for (var k = -20; k <= 20; k++) {\n      var win = 0.54 + 0.46 * Math.cos(Math.PI * k / 20);\n      lp[center + k] = (k === 0) ? (2 * fc * win) : ((Math.sin(2 * Math.PI * fc * k) / (Math.PI * k)) * win);\n    }\n  }\n  var sumLP = 0;\n  for (var i = 0; i < len; i++) sumLP += lp[i];\n  for (var i = 0; i < len; i++) lp[i] /= (sumLP || 1);\n\n  var h = new Array(len).fill(0);\n  for (var i = 0; i < len; i++) {\n    var delta = (i === center) ? 1 : 0;\n    h[i] = t * delta + (1 - 2 * t) * lp[i];\n  }\n  return h;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var type = Math.round(lab.values.kernelType);\n  var width = Math.round(lab.values.width);\n  var t = lab.values.transform / 100;\n  var stepMode = lab.values.stepMode;\n  var h = buildKernel(type, width, t);\n\n  ctx.clearRect(0, 0, W, H);\n\n  var kLeft = 36, kTop = 28, kW = 220, kH = 182;\n  var sLeft = 296, sTop = 28, sW = 404, sH = 182;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = kTop + (kH * g) / 4;\n    ctx.beginPath(); ctx.moveTo(kLeft, gy); ctx.lineTo(kLeft + kW, gy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(sLeft, gy); ctx.lineTo(sLeft + sW, gy); ctx.stroke();\n  }\n\n  var kZeroY = kTop + kH * 0.68;\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.beginPath(); ctx.moveTo(kLeft, kZeroY); ctx.lineTo(kLeft + kW, kZeroY); ctx.stroke();\n\n  var kScale = kH * 0.56;\n  for (var i = 0; i < h.length; i++) {\n    var x = kLeft + (i / 40) * kW;\n    var y = kZeroY - h[i] * kScale;\n    var col = h[i] >= 0 ? '#38bdf8' : '#ec4899';\n    ctx.strokeStyle = col;\n    ctx.lineWidth = (i === 20) ? 2.2 : 1.5;\n    ctx.beginPath(); ctx.moveTo(x, kZeroY); ctx.lineTo(x, y); ctx.stroke();\n    ctx.fillStyle = col;\n    ctx.fillRect(x - 2, y - 2, 4, 4);\n  }\n\n  var sigLen = 180;\n  var rawSig = new Array(sigLen);\n  for (var i = 0; i < sigLen; i++) {\n    if (stepMode) {\n      var st = (i >= 65 && i <= 115) ? 0.65 : -0.25;\n      var spike = (i === 44) ? 0.45 : 0;\n      rawSig[i] = st + spike;\n    } else {\n      var dcAndSlow = 0.42 + 0.32 * Math.sin(2 * Math.PI * i / 75);\n      var env = Math.exp(-Math.pow((i - 90) / 14, 2));\n      var burst = 0.36 * env * Math.sin(2 * Math.PI * i / 4.2);\n      rawSig[i] = dcAndSlow + burst;\n    }\n  }\n  var outSig = new Array(sigLen).fill(0);\n  for (var i = 20; i < sigLen - 20; i++) {\n    var acc = 0;\n    for (var k = 0; k < 41; k++) {\n      acc += rawSig[i - (k - 20)] * h[k];\n    }\n    outSig[i] = acc;\n  }\n\n  var sZeroY = sTop + sH * 0.58;\n  var sScale = sH * 0.42;\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(sLeft, sZeroY); ctx.lineTo(sLeft + sW, sZeroY); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (var i = 30; i < 150; i++) {\n    var px = sLeft + ((i - 30) / 119) * sW;\n    var py = sZeroY - rawSig[i] * sScale;\n    if (i === 30) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var outColor = t > 0.6 ? '#ec4899' : (t < 0.4 ? '#10b981' : '#38bdf8');\n  ctx.strokeStyle = outColor;\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var i = 30; i < 150; i++) {\n    var px = sLeft + ((i - 30) / 119) * sW;\n    var py = sZeroY - outSig[i] * sScale;\n    if (i === 30) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var sumH = 0;\n  for (var i = 0; i < h.length; i++) sumH += h[i];\n  var names = ['矩形脉冲', '指数衰减', 'Sinc 窗函数'];\n  var modeText = t === 0 ? '纯低通 (保留直流与慢波)' : (t === 1 ? '纯高通 (直流归零，只留高频/边缘)' : (t === 0.5 ? '半幅度脉冲 (全通状态)' : '低通↔高通混合过渡中'));\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('滤波器核 h[n] (正值蓝 / 负值粉)', kLeft, 18);\n  ctx.fillText('输入含偏置信号(琥珀) vs 滤波输出(实线)', sLeft, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('δ 叠加点: 样本 0', kLeft + kW / 2 - 38, kTop + kH + 14);\n\n  lab.setReadout('基础核: ' + names[type] + ' | DC 增益 (∑h) = ' + sumH.toFixed(3) + ' | 中心 h[0] = ' + h[20].toFixed(3) + ' | ' + modeText);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "直流增益快速自检法：写完低通滤波器核代码后，第一时间检查 `sum(h)` 是否严格等于 `1`；写完高通核后检查 `sum(h)` 是否严格等于 `0`。这是排查滤波器放大失真或直流漂移最快的方法。",
        "核宽度的取舍陷阱：低通核越宽，截止频率越低、去噪越干净，但信号的边沿也会变钝，同时卷积计算量和首尾边界延迟都会线性增加。",
        "无穷长尾巴必须截断：指数核和 Sinc 核在数学上无限延伸，工程落地时必须截断为有限长度，并在截断后重新对系数做归一化，防止截断误差破坏直流增益。",
        "脉冲减法别加错位置：做 `δ[n] - h_LP[n]` 变换时，如果低通核是对称的（如奇数点矩形核、Sinc 核），`δ` 必须加在正中间的对称中心；若是不对称的因果核（如指数核），则加在样本 0 处，否则会产生意外的波形错位。"
      ]
    }
  ]
});
