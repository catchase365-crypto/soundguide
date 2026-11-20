window.__BOOK_REGISTER_SECTION__("sec_056", {
  "title": "叠加原理：数字信号处理的基石 (Superposition: the Foundation of DSP)",
  "intuition": "面对复杂的信号与线性系统，与其硬着头皮整体求解，不如把输入信号拆成几个简单分量的和——分别算出每个分量的输出后再直接相加，得到的结果与直接处理原信号完全一模一样。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 合成与分解：线性世界里的“唯一组合法则”",
      "paragraphs": [
        "在**线性系统（Linear Systems）**的领地里，信号之间并不是想怎么组合就能怎么组合的。**唯一合法的信号组合方式只有两步：先“缩放”（Scaling，即给信号乘以一个常数权重），再“相加”（Addition）**。例如，在纯粹的线性组合中，你绝不能把一个信号直接乘以另一个信号。",
        "将多个分量信号通过缩放和相加合并成一个新信号的过程，称为**合成（Synthesis）**。如原书图 5-10 所示，把三个形状各异的分量信号 `x0[n]`、`x1[n]` 和 `x2[n]` 逐点相加，就能合成出第四个更复杂的信号 `x[n]`。",
        "反过来，把一个复杂信号拆解成两个或更多可相加的成分，就叫做**分解（Decomposition）**。合成非常简单且结果唯一，但分解却大有讲究——因为**任何一个信号都有无穷多种分解方式**。打个比方：数字 15 和 25 只能合成为 40；但反过来分解数字 40，你可以拆成 `1 + 39`、`2 + 38`，甚至 `-30.5 + 60 + 10.5`。"
      ],
      "formula": {
        "expr": "x[n] = c₀·x₀[n] + c₁·x₁[n] + c₂·x₂[n]",
        "explain": "x[n] 是合成后的总信号；x₀[n]、x₁[n]、x₂[n] 是各个分量信号；c₀、c₁、c₂ 是每个分量对应的常数缩放系数（权重，可以为正、为负或为零）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：信号合成画板与实时听觉体验",
      "instruction": "拖动下方三个滑块改变分量权重（支持负权重反相），观察右侧合成波形的变化，并点击播放按钮用耳朵听出不同分量叠加后的音色差异。",
      "controls": [
        {
          "type": "slider",
          "id": "c0",
          "label": "x₀[n] 权重 (220Hz 基波)",
          "min": 0,
          "max": 1.2,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "c1",
          "label": "x₁[n] 权重 (440Hz 二次谐波)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "c2",
          "label": "x₂[n] 权重 (660Hz 三次谐波)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.3,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听合成音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar N = 36;\nvar audioCtx = null;\nvar osc0 = null, osc1 = null, osc2 = null;\nvar gain0 = null, gain1 = null, gain2 = null, masterGain = null;\n\nfunction drawGrid(x, y, w, h, zeroY) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(x, zeroY);\n  ctx.lineTo(x + w, zeroY);\n  for (var i = 1; i < 4; i++) {\n    var gx = x + (w * i) / 4;\n    ctx.moveTo(gx, y);\n    ctx.lineTo(gx, y + h);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.strokeRect(x, y, w, h);\n}\n\nfunction drawStemWave(arr, x, y, w, h, maxAmp, color, title) {\n  var zeroY = y + h / 2;\n  drawGrid(x, y, w, h, zeroY);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText(title, x + 6, y + 14);\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = x + 10 + ((w - 20) * i) / (N - 1);\n    var py = zeroY - (arr[i] / maxAmp) * (h * 0.4);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  for (var j = 0; j < N; j++) {\n    var sx = x + 10 + ((w - 20) * j) / (N - 1);\n    var sy = zeroY - (arr[j] / maxAmp) * (h * 0.4);\n    ctx.beginPath();\n    ctx.moveTo(sx, zeroY);\n    ctx.lineTo(sx, sy);\n    ctx.strokeStyle = color;\n    ctx.globalAlpha = 0.35;\n    ctx.stroke();\n    ctx.globalAlpha = 1;\n    ctx.beginPath();\n    ctx.arc(sx, sy, 2.3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n}\n\nfunction updateAudio(c0, c1, c2, isPlay) {\n  try {\n    if (isPlay) {\n      if (!audioCtx) {\n        audioCtx = lab.getAudioContext();\n        if (!audioCtx) return;\n        masterGain = audioCtx.createGain();\n        masterGain.gain.value = 0.14;\n        masterGain.connect(audioCtx.destination);\n        gain0 = audioCtx.createGain();\n        gain1 = audioCtx.createGain();\n        gain2 = audioCtx.createGain();\n        gain0.connect(masterGain);\n        gain1.connect(masterGain);\n        gain2.connect(masterGain);\n        osc0 = audioCtx.createOscillator();\n        osc1 = audioCtx.createOscillator();\n        osc2 = audioCtx.createOscillator();\n        osc0.frequency.value = 220;\n        osc1.frequency.value = 440;\n        osc2.frequency.value = 660;\n        osc0.start();\n        osc1.start();\n        osc2.start();\n      }\n      if (audioCtx.state === 'suspended') audioCtx.resume();\n      var now = audioCtx.currentTime;\n      masterGain.gain.setTargetAtTime(0.14, now, 0.02);\n      gain0.gain.setTargetAtTime(c0, now, 0.02);\n      gain1.gain.setTargetAtTime(c1, now, 0.02);\n      gain2.gain.setTargetAtTime(c2, now, 0.02);\n    } else if (audioCtx && masterGain) {\n      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n    }\n  } catch (e) {}\n}\n\nlab.onUpdate(function() {\n  var c0 = lab.values.c0;\n  var c1 = lab.values.c1;\n  var c2 = lab.values.c2;\n  var x0 = [], x1 = [], x2 = [], xSum = [];\n  var peak = 0;\n  for (var i = 0; i < N; i++) {\n    var t = (2 * Math.PI * 2 * i) / N;\n    x0[i] = c0 * Math.sin(t);\n    x1[i] = c1 * Math.sin(2 * t);\n    x2[i] = c2 * Math.sin(3 * t);\n    xSum[i] = x0[i] + x1[i] + x2[i];\n    if (Math.abs(xSum[i]) > peak) peak = Math.abs(xSum[i]);\n  }\n  ctx.clearRect(0, 0, W, H);\n  drawStemWave(x0, 16, 12, 260, 66, 1.5, '#38bdf8', 'c0*x0[n] (220Hz)');\n  drawStemWave(x1, 16, 87, 260, 66, 1.5, '#f59e0b', 'c1*x1[n] (440Hz)');\n  drawStemWave(x2, 16, 162, 260, 66, 1.5, '#ec4899', 'c2*x2[n] (660Hz)');\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 18px sans-serif';\n  ctx.fillText('+', 286, 84);\n  ctx.fillText('+', 286, 159);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('合成 →', 310, 122);\n  drawStemWave(xSum, 368, 22, 336, 196, 2.8, '#10b981', 'x[n] = c0*x0[n] + c1*x1[n] + c2*x2[n]');\n  updateAudio(c0, c1, c2, lab.values.play);\n  lab.setReadout('合成信号峰值幅度: ' + peak.toFixed(2) + ' | 权重: c₀=' + c0.toFixed(1) + ', c₁=' + c1.toFixed(1) + ', c₂=' + c2.toFixed(1) + (lab.values.play ? ' | 🔊 实时发声中' : ''));\n});"
    },
    {
      "type": "concept",
      "heading": "2. 叠加原理：分而治之的 DSP 核心策略",
      "paragraphs": [
        "有了合成与分解的概念，我们就能揭开整个数字信号处理（DSP）最核心的魔法——**叠加原理（Superposition）**。",
        "假设一个复杂输入信号 `x[n]` 要通过一个线性系统，输出为 `y[n]`。直接分析复杂信号如何被系统改变往往非常痛苦。利用叠加原理，我们可以分三步走：1）先把 `x[n]` **分解**成一组极简单的**输入信号分量**（`x0[n], x1[n], x2[n]...`）；2）让每个简单分量**单独**通过这个线性系统，得到对应的**输出信号分量**（`y0[n], y1[n], y2[n]...`）；3）把这些输出分量直接**合成（相加）**起来。",
        "最神奇的结论在于：**通过“先拆、再分别处理、最后相加”得到的输出 `y[n]`，与把原始 `x[n]` 直接扔进系统得到的输出完全一模一样！**",
        "其实你每天心算都在用这招：让你在脑子里算 `2041 × 4`，你绝不会在脑海里想象 2041 根火柴乘 4 再一根根数；你会本能地把 2041 分解成 `2000 + 40 + 1`，分别乘 4 得到 `8000`、`160`、`4`，最后合成出 `8164`。注意：叠加原理**只在系统是线性的时候才成立**；一旦系统是非线性的（比如包含平方、限幅削波），交叉项就会出现，分解相加的结果就会严重失真。"
      ],
      "formula": {
        "expr": "T{ x₀[n] + x₁[n] + ... } = T{ x₀[n] } + T{ x₁[n] } + ... = y₀[n] + y₁[n] + ...",
        "explain": "T{·} 代表线性系统的处理变换。左边是“先合并再整体进系统”，右边是“各自进系统后再合并结果”，两者严格相等。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：验证叠加原理——线性系统 vs 非线性系统",
      "instruction": "调节两个输入分量的幅度，观察右侧两条输出曲线（绿色实线“先拆后加”与粉色虚线“直接输入”）是否重合；再打开非线性开关，亲眼见证叠加原理如何瞬间失效。",
      "controls": [
        {
          "type": "slider",
          "id": "amp0",
          "label": "输入分量 x₀[n] 幅度 (正弦波)",
          "min": 0,
          "max": 1.2,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp1",
          "label": "输入分量 x₁[n] 幅度 (方波脉冲)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "nonlinear",
          "label": "切换为非线性系统 (y = 0.6·x²)",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar N = 32;\n\nfunction runSystem(arr, isNonlinear) {\n  var out = [];\n  for (var i = 0; i < N; i++) {\n    if (isNonlinear) {\n      out[i] = 0.6 * arr[i] * arr[i];\n    } else {\n      var prev = i > 0 ? arr[i - 1] : 0;\n      out[i] = 0.65 * arr[i] + 0.35 * prev;\n    }\n  }\n  return out;\n}\n\nfunction drawMini(arr, x, y, w, h, color, title) {\n  var zeroY = y + h / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(x, zeroY);\n  ctx.lineTo(x + w, zeroY);\n  ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.strokeRect(x, y, w, h);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px monospace';\n  ctx.fillText(title, x + 5, y + 13);\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = x + 8 + ((w - 16) * i) / (N - 1);\n    var py = zeroY - (arr[i] / 2.4) * (h * 0.42);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n}\n\nlab.onUpdate(function() {\n  var amp0 = lab.values.amp0;\n  var amp1 = lab.values.amp1;\n  var isNL = lab.values.nonlinear;\n  var x0 = [], x1 = [], xTotal = [];\n  for (var i = 0; i < N; i++) {\n    x0[i] = amp0 * Math.sin((2 * Math.PI * 2 * i) / N);\n    x1[i] = (i >= 8 && i < 20) ? amp1 : 0;\n    xTotal[i] = x0[i] + x1[i];\n  }\n  var y0 = runSystem(x0, isNL);\n  var y1 = runSystem(x1, isNL);\n  var ySum = [];\n  var yDirect = runSystem(xTotal, isNL);\n  var maxErr = 0;\n  for (var j = 0; j < N; j++) {\n    ySum[j] = y0[j] + y1[j];\n    var err = Math.abs(yDirect[j] - ySum[j]);\n    if (err > maxErr) maxErr = err;\n  }\n  ctx.clearRect(0, 0, W, H);\n  drawMini(x0, 14, 12, 196, 65, '#38bdf8', 'x0[n] 正弦分量');\n  drawMini(x1, 14, 87, 196, 65, '#f59e0b', 'x1[n] 脉冲分量');\n  drawMini(xTotal, 14, 162, 196, 65, '#f8fafc', 'x[n] = x0 + x1 总输入');\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('分别/整体', 216, 110);\n  ctx.fillText('过系统 →', 216, 128);\n  var rx = 282, ry = 14, rw = 424, rh = 212;\n  var zeroY = ry + rh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(rx, zeroY);\n  ctx.lineTo(rx + rw, zeroY);\n  for (var g = 1; g < 4; g++) {\n    var gx = rx + (rw * g) / 4;\n    ctx.moveTo(gx, ry);\n    ctx.lineTo(gx, ry + rh);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var k = 0; k < N; k++) {\n    var px1 = rx + 12 + ((rw - 24) * k) / (N - 1);\n    var py1 = zeroY - (ySum[k] / 2.6) * (rh * 0.42);\n    if (k === 0) ctx.moveTo(px1, py1);\n    else ctx.lineTo(px1, py1);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  for (var k2 = 0; k2 < N; k2++) {\n    var sx1 = rx + 12 + ((rw - 24) * k2) / (N - 1);\n    var sy1 = zeroY - (ySum[k2] / 2.6) * (rh * 0.42);\n    ctx.beginPath();\n    ctx.arc(sx1, sy1, 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var m = 0; m < N; m++) {\n    var px2 = rx + 12 + ((rw - 24) * m) / (N - 1);\n    var py2 = zeroY - (yDirect[m] / 2.6) * (rh * 0.42);\n    if (m === 0) ctx.moveTo(px2, py2);\n    else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n  ctx.restore();\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  for (var m2 = 0; m2 < N; m2++) {\n    var sx2 = rx + 12 + ((rw - 24) * m2) / (N - 1);\n    var sy2 = zeroY - (yDirect[m2] / 2.6) * (rh * 0.42);\n    ctx.beginPath();\n    ctx.arc(sx2, sy2, 5, 0, Math.PI * 2);\n    ctx.stroke();\n  }\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('● 实线: 叠加输出 y0[n] + y1[n]', rx + 12, ry + 18);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('○ 虚线: 直接输出 T{x0[n] + x1[n]}', rx + 12, ry + 36);\n  ctx.fillStyle = maxErr < 0.0001 ? '#10b981' : '#ec4899';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText(maxErr < 0.0001 ? '✔ 完美重合 (Error = 0)' : '✘ 叠加失效 (MaxErr = ' + maxErr.toFixed(3) + ')', rx + 225, ry + 24);\n  var sysDesc = isNL ? '当前: 非线性 y[n]=0.6·x²[n]' : '当前: 线性 y[n]=0.65x[n]+0.35x[n-1]';\n  lab.setReadout(sysDesc + ' | 两条输出曲线最大偏差: ' + maxErr.toFixed(4));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【常见踩坑】把“信号相乘”误当成线性组合：线性组合只允许“乘以常数（缩放）再相加”。一旦代码中出现两个信号数组逐点相乘（如调幅调制或平方检波），就跨出了线性系统的边界，叠加原理不再适用。",
        "【算法思维】分解不是目的，化简才是关键：同一个信号有无穷种分解法，但只有能把系统响应变简单的分解（例如后续章节要学的“脉冲分解”和“傅里叶正弦分解”）才有工程价值。",
        "【核心结论】只要确认系统满足线性条件，我们就可以先用最简单的测试信号（如单个脉冲或单一频率正弦波）摸清系统的脾气，从而精确预测任意复杂输入信号的输出。"
      ]
    }
  ]
});
