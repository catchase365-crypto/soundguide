window.__BOOK_REGISTER_SECTION__("sec_054", {
  "title": "线性与非线性系统实例图谱 (Examples of Linear and Nonlinear Systems)",
  "intuition": "判断一个系统是否线性，既可以用数学家的“齐次、可加、移不变”严格审视，也可以用工程师的“静态直线 + 正弦保真”一眼识破；现实中几乎所有线性系统都在做比例、叠加与延迟组合，而非线性系统则会催生谐波失真、饱和削波或路径依赖。",
  "blocks": [
    {
      "type": "concept",
      "heading": "给现实系统做“线性体检”的两套标准",
      "paragraphs": [
        "在正式翻看表 5-1 的现实系统清单之前，我们需要把数学定义与工程直觉对齐。**数学家眼中的线性系统**必须同时满足三条铁律：**齐次性**（输入放大 k 倍，输出也严格放大 k 倍）、**可加性**（多个输入同时进入，等于各自单独输入的输出之和）以及**移不变性**（输入晚到一秒，输出也原封不动晚到一秒）。",
        "而在实验室或工程现场，科学家与工程师更常使用两把直观的尺子：**静态线性 (Static Linearity)**——在稳态或直流条件下，输出与输入是否呈过原点的直线比例关系；以及**正弦保真度 (Sinusoidal Fidelity)**——输入纯正弦波时，输出是否依然是**同频率**的纯正弦波（允许幅度和相位变化，但绝不允许产生新频率或波形畸变）。"
      ],
      "formula": {
        "expr": "T{a·x1[n] + b·x2[n]} = a·T{x1[n]} + b·T{x2[n]}",
        "explain": "线性算子 T 的核心判据：先加权叠加再输入系统，等价于先各自通过系统再做相同的加权叠加；输入若为单一频率正弦波，输出频谱中也绝不会冒出新的频率分量。"
      }
    },
    {
      "type": "concept",
      "heading": "线性系统家族：物理世界与 DSP 核心算子",
      "paragraphs": [
        "对照原书表 5-1，看似五花八门的线性系统其实可以归纳为五大类：",
        "1. **经典物理与电路系统**：声波与电磁波在常规介质中的传播、由电阻/电容/电感组成的电气网络 (RLC)、理想电子放大器与滤波器，以及由质量块、弹簧和阻尼器构成的机械振动系统。它们的共同本质是**常系数线性微分方程**。",
        "2. **基本信号变换**：将信号乘以一个**常数**（纯粹的放大或衰减）、**单位系统**（`y = x`，原样输出）、**零系统**（输出恒为 `0`），以及声音的**回声 (Echo)**、**共振 (Resonance)** 与光学/数字图像的**模糊 (Blurring)**。",
        "3. **微积分与离散对应算子**：连续信号中的**微分**与**积分**，以及它们在数字信号处理中的孪生兄弟——**一阶差分 (First Difference)** 与**累加和 (Running Sum)**。",
        "4. **DSP 两大支柱算法**：**卷积 (Convolution)**（输出等于输入历史值乘以一组固定权重系数之和）与**递归 (Recursion)**（在卷积基础上，还把过去算出的输出值按权重反馈进来参与计算）。",
        "5. **工程上的巧思——局部小信号线性化**：晶体管等电子器件本身是非线性的，但只要用直流偏置把它稳在合适的工作点上，输入**微小的扰动信号 (Small perturbations)** 时，它的响应就会乖乖表现出极佳的线性特性。"
      ],
      "formula": {
        "expr": "y[n] = x[n] - x[n-1]   |   y[n] = Σ h[k]·x[n-k]",
        "explain": "一阶差分（离散微分）与卷积公式：它们都是对信号做移位、乘以固定系数并相加，因此天然满足齐次性、可加性与移不变性。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：正弦保真度与可加性听觉/频谱测试台",
      "instruction": "切换“系统类型”(1~2为线性，3~5为非线性)，开启声音对比纯正弦与谐波失真的听感差异，并打开“叠加第二个正弦波”观察是否冒出互调新频率。",
      "controls": [
        {
          "type": "slider",
          "id": "sysType",
          "label": "系统类型 (1比例 / 2回声 / 3平方 / 4削波 / 5门限)",
          "min": 1,
          "max": 5,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "输入信号振幅",
          "min": 0.1,
          "max": 1.4,
          "step": 0.05,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "基波频率 f0",
          "min": 120,
          "max": 440,
          "step": 20,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "twoTone",
          "label": "叠加第二个正弦波 (1.5×f0 测试可加性)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放系统输出声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var sysNames = ['', '1. 常数倍乘 (线性)', '2. 延迟回声 Echo (线性)', '3. 信号平方 y=0.65x² (非线性)', '4. 放大器饱和削波 (非线性)', '5. 门限死区开关 (非线性)'];\nvar audioSrc = null;\nvar audioGain = null;\nvar lastAudioSig = '';\n\nfunction evalSys(sysType, amp, freq, twoTone, t) {\n  var w1 = 2 * Math.PI * freq;\n  var x = amp * Math.sin(w1 * t);\n  if (twoTone) x += 0.55 * amp * Math.sin(2 * Math.PI * (freq * 1.5) * t);\n  var y = 0;\n  if (sysType === 1) {\n    y = 0.72 * x;\n  } else if (sysType === 2) {\n    var tau = 0.0012;\n    var xDel = amp * Math.sin(w1 * (t - tau));\n    if (twoTone) xDel += 0.55 * amp * Math.sin(2 * Math.PI * (freq * 1.5) * (t - tau));\n    y = 0.65 * x + 0.48 * xDel;\n  } else if (sysType === 3) {\n    y = 0.65 * x * x;\n  } else if (sysType === 4) {\n    y = Math.max(-0.55, Math.min(0.55, x));\n  } else {\n    y = Math.abs(x) > 0.3 ? (x > 0 ? 0.68 : -0.68) : 0;\n  }\n  return { x: x, y: y };\n}\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n  if (audioGain) {\n    try { audioGain.disconnect(); } catch (e) {}\n    audioGain = null;\n  }\n  lastAudioSig = '';\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') { ac.resume(); }\n  var sysType = Math.round(lab.values.sysType);\n  var amp = lab.values.amp;\n  var freq = Math.round(lab.values.freq);\n  var twoTone = !!lab.values.twoTone;\n  var sig = sysType + '|' + amp.toFixed(2) + '|' + freq + '|' + (twoTone ? 1 : 0);\n  if (sig === lastAudioSig && audioSrc) return;\n  lastAudioSig = sig;\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n  }\n  var sr = ac.sampleRate;\n  var len = sr;\n  var buf = ac.createBuffer(1, len, sr);\n  var data = buf.getChannelData(0);\n  var mean = 0;\n  for (var i = 0; i < len; i++) {\n    var val = evalSys(sysType, amp, freq, twoTone, i / sr).y;\n    data[i] = val;\n    mean += val;\n  }\n  mean /= len;\n  for (var j = 0; j < len; j++) {\n    data[j] = Math.max(-0.9, Math.min(0.9, (data[j] - mean) * 0.35));\n  }\n  if (!audioGain) {\n    audioGain = ac.createGain();\n    audioGain.gain.value = 0.55;\n    audioGain.connect(ac.destination);\n  }\n  var src = ac.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(audioGain);\n  src.start();\n  audioSrc = src;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var sysType = Math.round(lab.values.sysType);\n  var amp = lab.values.amp;\n  var freq = Math.round(lab.values.freq);\n  var twoTone = !!lab.values.twoTone;\n  var isLinear = sysType <= 2;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  var waveX = 16, waveY = 34, waveW = 420, waveH = 190;\n  var specX = 458, specY = 34, specW = 246, specH = 190;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= 4; gx++) {\n    var px = waveX + (waveW * gx / 4);\n    ctx.beginPath(); ctx.moveTo(px, waveY); ctx.lineTo(px, waveY + waveH); ctx.stroke();\n  }\n  for (var gy = 0; gy <= 4; gy++) {\n    var py = waveY + (waveH * gy / 4);\n    ctx.beginPath(); ctx.moveTo(waveX, py); ctx.lineTo(waveX + waveW, py); ctx.stroke();\n  }\n\n  var midY = waveY + waveH / 2;\n  var scaleY = waveH * 0.34;\n  var tWin = 2.0 / freq;\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(waveX, waveY, waveW, waveH); ctx.clip();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var i = 0; i <= 240; i++) {\n    var t = (i / 240) * tWin;\n    var res = evalSys(sysType, amp, freq, twoTone, t);\n    var xPix = waveX + (i / 240) * waveW;\n    var yPix = midY - res.x * scaleY;\n    if (i === 0) ctx.moveTo(xPix, yPix); else ctx.lineTo(xPix, yPix);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = isLinear ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var j = 0; j <= 240; j++) {\n    var tj = (j / 240) * tWin;\n    var rj = evalSys(sysType, amp, freq, twoTone, tj);\n    var xP = waveX + (j / 240) * waveW;\n    var yP = midY - rj.y * scaleY;\n    if (j === 0) ctx.moveTo(xP, yP); else ctx.lineTo(xP, yP);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(waveX, waveY, waveW, waveH);\n  ctx.strokeRect(specX, specY, specW, specH);\n\n  var N = 256;\n  var ys = [];\n  for (var n = 0; n < N; n++) {\n    ys.push(evalSys(sysType, amp, freq, twoTone, (n / N) * tWin).y);\n  }\n  var mags = [];\n  var maxK = 9;\n  var newFreqCount = 0;\n  for (var k = 0; k <= maxK; k++) {\n    var re = 0, im = 0;\n    for (var m = 0; m < N; m++) {\n      var ang = 2 * Math.PI * k * m / N;\n      re += ys[m] * Math.cos(ang);\n      im -= ys[m] * Math.sin(ang);\n    }\n    var mag = Math.sqrt(re * re + im * im) * (k === 0 ? 1 : 2) / N;\n    mags.push(mag);\n    var isInputFreq = (k === 2) || (twoTone && k === 3);\n    if (!isInputFreq && mag > 0.03) newFreqCount++;\n  }\n\n  var barStep = specW / (maxK + 1);\n  var baseLineY = specY + specH - 24;\n  var barMaxH = specH - 42;\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  for (var b = 0; b <= maxK; b++) {\n    var bx = specX + b * barStep + barStep * 0.2;\n    var bw = barStep * 0.6;\n    var normH = Math.min(1.0, mags[b] / 1.4) * barMaxH;\n    var isOrig = (b === 2) || (twoTone && b === 3);\n    ctx.fillStyle = isOrig ? '#10b981' : '#f59e0b';\n    ctx.fillRect(bx, baseLineY - normH, bw, normH);\n    ctx.fillStyle = 'rgba(248,250,252,0.7)';\n    var lbl = b === 0 ? 'DC' : (b * 0.5) + 'f';\n    if (b % 2 === 0 || b === 1 || b === 3 || b === 5) {\n      ctx.fillText(lbl, bx + bw / 2, specY + specH - 8);\n    }\n  }\n\n  ctx.textAlign = 'left';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = isLinear ? '#10b981' : '#ec4899';\n  ctx.fillText(sysNames[sysType], 16, 20);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('--- 输入 x(t)', 265, 20);\n  ctx.fillStyle = isLinear ? '#10b981' : '#ec4899';\n  ctx.fillText('— 输出 y(t)', 355, 20);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('输出频谱 (绿色=原频率, 琥珀=新增谐波/互调)', specX, 20);\n\n  var status = isLinear\n    ? '线性保真：输出频谱仅含原输入频率，无任何新增谐波'\n    : '非线性失真：检测到 ' + newFreqCount + ' 个新频率分量 (含直流/谐波/互调)';\n  lab.setReadout(sysNames[sysType] + ' | 基波 ' + freq + ' Hz | ' + status);\n}\n\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "非线性系统图鉴：为什么“1 + 1 不再等于 2”？",
      "paragraphs": [
        "看懂了线性系统，再反过来审视原书表 5-1 中的**非线性系统**，你会发现它们无一例外都在某个环节打破了“比例与叠加”：",
        "1. **违背静态线性**：许多自然界物理公式天然呈幂律或指数关系。例如电阻消耗的热功率 `P = V² / R`（电压翻倍，功率变成 4 倍）、黑体热辐射定律 `R = k·T⁴`，以及光线穿透半透明介质的衰减定律 `I = I₀·e^(-αT)`。",
        "2. **破坏正弦保真度（强行造出新频率）**：峰值检波器、平方电路、正弦转方波电路以及倍频器。只要它们吃进一个光滑的正弦波，吐出来的波形带棱角或频率翻倍，就必然引入了大量高次谐波。",
        "3. **电子电路常见失真与饱和**：当放大器或变压器被驱动得过猛时，输出碰顶截断产生**饱和 (Saturation)** 与**削波 (Clipping)**；推挽电路过零处卡顿产生**交越失真 (Crossover distortion)**；电压来不及快速跳变则产生**压摆率失真 (Slewing)**。",
        "4. **信号乘以另一个信号**：注意区分！把信号乘以一个**常数**是线性的；但如果把输入信号乘以**另一个时变信号**（比如调幅广播 **AM 调制**中的载波相乘、自动增益控制 **AGC** 根据音量动态调小倍数），系统立刻变成非线性的，因为输入翻倍时控制信号或包络行为会引发乘积交叉项。",
        "5. **磁滞与阈值系统**：铁磁材料的磁通密度与磁场强度关系、硫化橡胶的应力-应变关系存在**磁滞/滞后现象 (Hysteresis)**——输出不仅看当前输入，还取决于历史路径；而数字逻辑门（大于高电平阈值输出 1，否则为 0）或地震波震碎岩石，则是典型的**阈值系统 (Threshold systems)**。"
      ],
      "formula": {
        "expr": "P = V² / R   |   R = k·T⁴   |   I = e^(-αT)",
        "explain": "表 5-1 给出的经典非线性静态关系：功率随电压平方增长、热辐射随温度四次方暴涨、透射光强随厚度指数衰减，均无法画成过原点的直线。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：静态非线性、偏置小信号线性化与磁滞回线",
      "instruction": "对比非线性静态曲线与直流偏置点处的切线近似：拖动“输入扰动幅度”从极小到大，亲眼见证“小信号时近似线性，大信号时严重失真”，或切换到模式 3 观察磁滞回线的路径依赖。",
      "controls": [
        {
          "type": "slider",
          "id": "curveMode",
          "label": "特性模式 (1晶体管指数 / 2功率平方 / 3磁滞回线)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "bias",
          "label": "直流工作偏置点 (Bias)",
          "min": -0.5,
          "max": 0.6,
          "step": 0.05,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "drive",
          "label": "输入扰动幅度 (小信号 ↔ 大信号)",
          "min": 0.06,
          "max": 0.75,
          "step": 0.03,
          "value": 0.15,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showTangent",
          "label": "显示偏置点切线 (局部线性近似预测)",
          "value": true
        }
      ],
      "jsCode": "var modeNames = ['', '1. 晶体管指数特性 (偏置+小信号可线性化)', '2. 平方律器件 P∝V² (强静非线性)', '3. 铁磁磁滞回线 Hysteresis (路径依赖非线性)'];\nvar curTime = 0;\n\nfunction evalStatic(mode, x) {\n  if (mode === 1) {\n    return 0.35 * (Math.exp(1.45 * x) - 1);\n  } else if (mode === 2) {\n    return 0.9 * x * x - 0.15;\n  }\n  return 0.75 * Math.tanh(2.1 * x);\n}\n\nfunction evalDeriv(mode, x) {\n  if (mode === 1) return 0.35 * 1.45 * Math.exp(1.45 * x);\n  if (mode === 2) return 1.8 * x;\n  return 0;\n}\n\nfunction drawScene(tSec) {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var mode = Math.round(lab.values.curveMode);\n  var bias = lab.values.bias;\n  var drive = lab.values.drive;\n  var showTan = !!lab.values.showTangent;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  var lx = 24, ly = 34, lw = 280, lh = 190;\n  var rx = 346, ry = 34, rw = 354, rh = 190;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    ctx.beginPath(); ctx.moveTo(lx + lw * i / 4, ly); ctx.lineTo(lx + lw * i / 4, ly + lh); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(lx, ly + lh * i / 4); ctx.lineTo(lx + lw, ly + lh * i / 4); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx + rw * i / 4, ry); ctx.lineTo(rx + rw * i / 4, ry + rh); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx, ry + rh * i / 4); ctx.lineTo(rx + rw, ry + rh * i / 4); ctx.stroke();\n  }\n\n  var cx = lx + lw / 2;\n  var cy = ly + lh / 2;\n  var sx = lw * 0.36;\n  var sy = lh * 0.36;\n\n  function toLX(x) { return cx + x * sx; }\n  function toLY(y) { return cy - y * sy; }\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(lx, ly, lw, lh); ctx.clip();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(lx, cy); ctx.lineTo(lx + lw, cy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(cx, ly); ctx.lineTo(cx, ly + lh); ctx.stroke();\n\n  if (mode !== 3) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var k = 0; k <= 120; k++) {\n      var xv = -1.35 + (k / 120) * 2.7;\n      var yv = evalStatic(mode, xv);\n      if (k === 0) ctx.moveTo(toLX(xv), toLY(yv)); else ctx.lineTo(toLX(xv), toLY(yv));\n    }\n    ctx.stroke();\n\n    var y0 = evalStatic(mode, bias);\n    var slope = evalDeriv(mode, bias);\n    if (showTan) {\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 1.6;\n      ctx.setLineDash([5, 4]);\n      ctx.beginPath();\n      ctx.moveTo(toLX(-1.35), toLY(y0 + slope * (-1.35 - bias)));\n      ctx.lineTo(toLX(1.35), toLY(y0 + slope * (1.35 - bias)));\n      ctx.stroke();\n      ctx.setLineDash([]);\n    }\n  } else {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (var p = 0; p <= 160; p++) {\n      var th = (p / 160) * Math.PI * 2;\n      var xh = bias + drive * Math.sin(th);\n      var yh = 0.78 * Math.tanh(2.1 * xh - 0.9 * drive * Math.cos(th));\n      if (p === 0) ctx.moveTo(toLX(xh), toLY(yh)); else ctx.lineTo(toLX(xh), toLY(yh));\n    }\n    ctx.stroke();\n  }\n\n  var thetaNow = (tSec * 2.5) % (Math.PI * 2);\n  var xNow = bias + drive * Math.sin(thetaNow);\n  var yNow = mode === 3\n    ? 0.78 * Math.tanh(2.1 * xNow - 0.9 * drive * Math.cos(thetaNow))\n    : evalStatic(mode, xNow);\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';\n  ctx.fillRect(toLX(bias - drive), ly, toLX(bias + drive) - toLX(bias - drive), lh);\n\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(toLX(xNow), toLY(yNow), 5.5, 0, Math.PI * 2); ctx.fill();\n  ctx.restore();\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();\n  var rMidY = ry + rh / 2;\n  var yBase = mode === 3 ? 0 : evalStatic(mode, bias);\n  var slopeB = mode === 3 ? 1.2 : evalDeriv(mode, bias);\n\n  if (showTan && mode !== 3) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.6;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (var q = 0; q <= 180; q++) {\n      var thq = (q / 180) * Math.PI * 4;\n      var xq = bias + drive * Math.sin(thq);\n      var yLin = yBase + slopeB * (xq - bias);\n      var pxq = rx + (q / 180) * rw;\n      var pyq = rMidY - yLin * sy;\n      if (q === 0) ctx.moveTo(pxq, pyq); else ctx.lineTo(pxq, pyq);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  var maxErr = 0;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var s = 0; s <= 180; s++) {\n    var ths = (s / 180) * Math.PI * 4;\n    var xs = bias + drive * Math.sin(ths);\n    var ys = mode === 3\n      ? 0.78 * Math.tanh(2.1 * xs - 0.9 * drive * Math.cos(ths))\n      : evalStatic(mode, xs);\n    if (mode !== 3) {\n      var err = Math.abs(ys - (yBase + slopeB * (xs - bias)));\n      if (err > maxErr) maxErr = err;\n    }\n    var pxs = rx + (s / 180) * rw;\n    var pys = rMidY - ys * sy;\n    if (s === 0) ctx.moveTo(pxs, pys); else ctx.lineTo(pxs, pys);\n  }\n  ctx.stroke();\n\n  var curPhaseRatio = thetaNow / (Math.PI * 4);\n  var curRX = rx + curPhaseRatio * rw;\n  var curRY = rMidY - yNow * sy;\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(curRX, curRY, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = mode === 3 ? '#ec4899' : '#38bdf8';\n  ctx.fillText(modeNames[mode], 24, 20);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 实际输出 y(t)', rx, 20);\n  if (mode !== 3 && showTan) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('--- 切线线性近似', rx + 115, 20);\n  }\n\n  var msg = mode === 3\n    ? '磁滞回线：同一输入 x 在上升与下降阶段对应不同输出 y，完全无法用单值函数或切线近似'\n    : '偏置 x0=' + bias.toFixed(2) + ' | 扰动幅度=' + drive.toFixed(2) + ' | 偏离线性切线最大误差=' + maxErr.toFixed(3) + (maxErr < 0.04 ? ' (近似线性!)' : ' (明显非线性失真)');\n  lab.setReadout(msg);\n}\n\nlab.onUpdate(function() {\n  drawScene(curTime);\n});\n\nlab.onLoop(function(dt, timeSec) {\n  curTime = timeSec;\n  drawScene(timeSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【乘常数 vs 乘信号】把信号乘以固定常数（放大/衰减）是线性系统；但把信号乘以另一个时变信号（如 AM 调制、AGC 自动增益）则是典型的非线性系统。",
        "【波形变“糊”不代表非线性】回声、共振、图像模糊、微分、积分、卷积与递归，全都是纯正的线性系统——因为它们只做移位、比例和叠加，绝不制造新频率。",
        "【频谱仪是最诚实的裁判】线性系统满足正弦保真度，输出里绝对不会出现输入中没有的新频率；一旦频谱中冒出倍频谐波或和差互调频率，电路或算法里一定藏着非线性环节。",
        "【小信号线性化的边界】晶体管等实际电子器件本质是非线性的，工程上靠合理偏置把它稳在小扰动区间来借用线性理论；一旦输入幅度过大闯入饱和、削波或门限死区，线性模型立刻失效。"
      ]
    }
  ]
});
