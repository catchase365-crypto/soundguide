window.__BOOK_REGISTER_SECTION__("sec_039", {
  "title": "数据转换中的模拟滤波器 (Analog Filters for Data Conversion)",
  "intuition": "模拟滤波器是 ADC 入口与 DAC 出口的“频谱门卫”——但由于硬件元器件无法做到一刀切，它总会在奈奎斯特频率下方留下一片必须舍弃的“滚降废土区”。",
  "blocks": [
    {
      "type": "concept",
      "heading": "数字系统前后的两道模拟门卫",
      "paragraphs": [
        "根据采样定理，一个完整的数字信号处理（DSP）系统必须在模拟与数字的边界处放置两枚低通滤波器（对应原书图 3-7）：",
        "1. **抗混叠滤波器 (Antialias Filter)**：放置在 ADC（模数转换器）之前，负责在采样发生前砍掉所有高于 **奈奎斯特频率 ($f_s / 2$)** 的高频成分，防止它们在采样后伪装（混叠）成低频信号。",
        "2. **重建滤波器 (Reconstruction Filter)**：放置在 DAC（数模转换器）之后，用来滤除数模转换产生的阶梯高频谐波（同样截止于 $f_s / 2$），并可附加**零阶保持 (Zeroth-Order Hold)** 高频衰减的补偿提升。",
        "很多软件工程师会觉得“我一辈子不碰示波器，学模拟滤波器干嘛？”这是大错特错的：第一，你拿到的任何数字信号都已经刻上了前端抗混叠滤波器的烙印；第二，DSP 的未来（如多速率采样技术）正是用软件算法去替代昂贵的模拟硬件，不懂硬件就写不出替代它的软件；第三，大量数字滤波器的设计起点，正是先把经典的模拟滤波器“翻译”成软件代码。"
      ],
      "formula": {
        "expr": "f_Nyquist = f_s / 2",
        "explain": "f_s 为采样频率（Hz），f_Nyquist 为奈奎斯特频率。理想情况下，抗混叠与重建滤波器的任务就是“放行 f < f_Nyquist，阻断 f > f_Nyquist”。"
      }
    },
    {
      "type": "concept",
      "heading": "三大家族与 Sallen-Key 硬件骨架",
      "paragraphs": [
        "工程中最常用的模拟滤波器有三大经典家族，它们分别优化了不同的性能指标：**切比雪夫 (Chebyshev)**、**巴特沃斯 (Butterworth)** 和 **贝塞尔 (Bessel / Thompson)**。每个滤波器的复杂度都由**极点 (Poles)** 的数量决定——极点越多，所需电子元件越多，过渡带性能也越好。",
        "注意，这三个名字描述的是滤波器的**数学传输特性**，而不是某一种固定接法。例如图 3-8 展示的经典**改进型 Sallen-Key 电路**，单个电路块就是一个 2 极点低通滤波器。只要把表 3-1 查出的系数 $k_1, k_2$ 代入公式算出电阻 $R$ 和 $R_f$（通常任选 $R_1 = 10\\text{ k}\\Omega, C = 0.01\\,\\mu\\text{F}$，且元件精度需达 1% 或更高），就能任意配置成三大类型之一。",
        "想要 4、6、8 极点的高阶滤波器？只需把 2、3、4 级 Sallen-Key 电路直接串联（级联）即可，每级使用表 3-1 中对应的系数。如果想要**高通滤波器**，只需把电路中的电阻 $R$ 和电容 $C$ 位置互换（保持 $R_f$ 和 $R_1$ 不动）就能立刻实现。运放的单位增益带宽只要达到截止频率 $f_c$ 的 30~100 倍以上即可（100 kHz 以下非常容易满足）。"
      ],
      "formula": {
        "expr": "R = k_1 / (C * f_c),   R_f = R_1 * k_2",
        "explain": "f_c 为目标截止频率（Hz），C 和 R_1 为预先选定的基准电容与电阻（如 0.01 uF 与 10 kΩ），k_1 与 k_2 根据极点数与滤波器类型从设计表查得。"
      }
    },
    {
      "type": "concept",
      "heading": "芯片里的巧思：开关电容滤波器 (Switched Capacitor Filter)",
      "paragraphs": [
        "分立的电阻电容适合小批量研发，但大批量生产必须把滤波器做进硅芯片（集成电路）里。难题在于：**在硅片上直接制造高精度电阻非常困难**。工程师给出的绝妙答案是**开关电容滤波器**。",
        "它的核心思想是“以开关和微型电容模拟电阻”（对应图 3-10）：把普通 RC 低通电路里的电阻 $R$ 拿掉，换成一个极小的电容（例如主电容 $C$ 的 $1\\%$，即 $C/100$）和一个高速电子开关。开关以远高于滤波器截止频率（通常 100 倍以上）的时钟频率 $f$ 在输入端和输出端之间来回切换：",
        "当开关连向输入端，小电容瞬间充满输入电压；切换连向输出端时，这点微小的电荷就会被倾倒进大电容 $C$ 里。时钟切换得越快，电荷搬运得就越快，等效的“电阻”就越小。由此带来一个极其迷人的工程特性：**滤波器的截止频率与驱动开关的时钟频率严格成正比**。只需 10 美元买一颗 8 引脚的集成芯片，改变外部时钟频率就能随时切换截止频率，特别适合支持多采样率的数据采集系统。"
      ],
      "formula": {
        "expr": "f_c ∝ f_clock",
        "explain": "开关电容滤波器的截止频率 f_c 直接正比于开关驱动时钟频率 f_clock，等效电阻 R_eq = 1 / (C_small * f_clock)。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：开关电容“电荷搬运”与等效 RC 响应",
      "instruction": "拖动【开关时钟频率 f】滑块，观察左侧小电容 C/100 如何一包一包搬运电荷，并对比右侧阶梯输出与等效连续 RC 曲线（绿色）的重合度；切换【输入阶跃电压】可重新触发充放电。",
      "controls": [
        {
          "type": "slider",
          "id": "clockHz",
          "label": "开关时钟频率 f",
          "min": 2,
          "max": 30,
          "step": 1,
          "value": 10,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "stepHigh",
          "label": "输入阶跃电压 (0V ↔ 5V)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showRC",
          "label": "叠加等效 RC 连续响应曲线",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar vout = 0, rcVal = 0, phase = 0, switchToIn = true, vSmall = 0;\nvar histIn = [], histOut = [], histRC = [];\nvar sampleAcc = 0, alpha = 0.08;\nfor (var i = 0; i < 200; i++) { histIn.push(0); histOut.push(0); histRC.push(0); }\n\nlab.onLoop(function(dt) {\n  var dtc = Math.min(dt, 0.05);\n  var f = lab.values.clockHz;\n  var vin = lab.values.stepHigh ? 5.0 : 0.0;\n\n  phase += f * dtc;\n  while (phase >= 0.5) {\n    phase -= 0.5;\n    switchToIn = !switchToIn;\n    if (switchToIn) {\n      vSmall = vin;\n    } else {\n      vout = vout + alpha * (vSmall - vout);\n    }\n  }\n  var rate = -Math.log(1 - alpha) * f;\n  rcVal = rcVal + (vin - rcVal) * (1 - Math.exp(-rate * dtc));\n\n  sampleAcc += dtc;\n  if (sampleAcc >= 0.018) {\n    sampleAcc = 0;\n    histIn.push(vin);\n    histOut.push(vout);\n    histRC.push(rcVal);\n    if (histIn.length > 220) { histIn.shift(); histOut.shift(); histRC.shift(); }\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(278, 12); ctx.lineTo(278, H - 12);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('开关电容电荷泵电路 (示意图)', 20, 22);\n\n  var cx = 135, cy = 96;\n  ctx.strokeStyle = '#94a3b8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(35, cy); ctx.lineTo(95, cy);\n  ctx.moveTo(175, cy); ctx.lineTo(255, cy);\n  ctx.stroke();\n\n  ctx.fillStyle = vin > 2.5 ? '#f59e0b' : '#64748b';\n  ctx.beginPath(); ctx.arc(35, cy, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.font = '11px monospace';\n  ctx.fillText('Vin=' + vin.toFixed(0) + 'V', 14, cy - 12);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(255, cy, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillText('Vout', 238, cy - 12);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(95, cy, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(175, cy, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(cx, cy + 26, 4, 0, Math.PI * 2); ctx.fill();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy + 26);\n  ctx.lineTo(switchToIn ? 95 : 175, cy);\n  ctx.stroke();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('开关 f = ' + f + 'Hz', cx - 34, cy - 18);\n\n  ctx.strokeStyle = '#94a3b8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy + 26); ctx.lineTo(cx, cy + 56);\n  ctx.moveTo(cx - 12, cy + 56); ctx.lineTo(cx + 12, cy + 56);\n  ctx.moveTo(cx - 12, cy + 64); ctx.lineTo(cx + 12, cy + 64);\n  ctx.moveTo(cx, cy + 64); ctx.lineTo(cx, cy + 88);\n  ctx.moveTo(cx - 10, cy + 88); ctx.lineTo(cx + 10, cy + 88);\n  ctx.stroke();\n\n  var chargeRatio = vSmall / 5.0;\n  ctx.fillStyle = 'rgba(236, 72, 153, ' + (0.2 + 0.75 * chargeRatio) + ')';\n  ctx.fillRect(cx - 11, cy + 57, 22, 6);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('C/100', cx + 16, cy + 64);\n\n  var bx = 215;\n  ctx.strokeStyle = '#94a3b8';\n  ctx.beginPath();\n  ctx.moveTo(bx, cy); ctx.lineTo(bx, cy + 52);\n  ctx.moveTo(bx - 18, cy + 52); ctx.lineTo(bx + 18, cy + 52);\n  ctx.moveTo(bx - 18, cy + 64); ctx.lineTo(bx + 18, cy + 64);\n  ctx.moveTo(bx, cy + 64); ctx.lineTo(bx, cy + 88);\n  ctx.moveTo(bx - 10, cy + 88); ctx.lineTo(bx + 10, cy + 88);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(56, 189, 248, ' + (0.15 + 0.85 * (vout / 5.0)) + ')';\n  ctx.fillRect(bx - 17, cy + 53, 34, 10);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('主电容 C', bx - 22, cy + 104);\n\n  var gx = 305, gy = 32, gw = 395, gh = 175;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('阶跃响应实时追踪 (阶梯波 vs 等效RC)', gx, 22);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 5; g++) {\n    var yy = gy + gh - (g / 5) * gh;\n    ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.font = '10px monospace';\n    ctx.fillText(g + 'V', gx - 20, yy + 3);\n  }\n\n  function drawSeries(arr, color, lw, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    for (var k = 0; k < arr.length; k++) {\n      var px = gx + (k / (arr.length - 1)) * gw;\n      var py = gy + gh - (arr[k] / 5.0) * gh;\n      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  drawSeries(histIn, '#f59e0b', 1.5, true);\n  if (lab.values.showRC) drawSeries(histRC, '#10b981', 2, false);\n  drawSeries(histOut, '#38bdf8', 2.5, false);\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('-- 输入 Vin', gx + 10, gy + 14);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 开关电容输出 Vout', gx + 90, gy + 14);\n  if (lab.values.showRC) { ctx.fillStyle = '#10b981'; ctx.fillText('— 等效连续 RC 曲线', gx + 235, gy + 14); }\n\n  lab.setReadout('开关时钟 f = ' + f + ' Hz (fc ∝ f) | 输入 Vin = ' + vin.toFixed(1) + ' V | 主电容电压 Vout = ' + vout.toFixed(2) + ' V');\n});"
    },
    {
      "type": "concept",
      "heading": "对数视角 vs 线性视角：滚降锐度与通带波纹的真相",
      "paragraphs": [
        "现在我们来对比三大滤波器的性能。第一个指标是**截止频率锐度 (Cutoff Frequency Sharpness)**，即从允许通过的**通带 (Passband)** 过渡到阻止通过的**阻带 (Stopband)** 时，幅度下降（滚降，Roll-off）有多快。",
        "在**对数坐标（dB 图，原书图 3-11）**下对比 2、4、8 极点的响应曲线，结论一目了然：**切比雪夫滚降最快、最锋利；巴特沃斯次之；贝塞尔的滚降简直惨不忍睹**。在对数图里，这三者的通带看起来都像“完全平坦的水平线”。",
        "然而，一旦我们把纵轴切换成**线性坐标（Linear Scale，原书图 3-12）**，另一个真相立刻暴露出来：切比雪夫滤波器的通带并不是平的，而是存在上下起伏的**通带波纹 (Passband Ripple，如 6% 波纹)**！事实上，切比雪夫之所以能拥有如此惊人的滚降速度，正是通过“牺牲通带平坦度、允许波纹存在”换来的——允许的通带波纹越大，阻带滚降就越快；而**巴特沃斯**才是在通带内保持最平坦（最忠实于原信号幅度）的滤波器。"
      ],
      "formula": {
        "expr": "|H_Cheby(f)| = sqrt(1 + ε^2) / sqrt(1 + ε^2 * C_N^2(f / f_c))",
        "explain": "切比雪夫幅频响应公式（归一化直流增益为1）。ε 决定了通带波纹大小（6% 波纹对应 ε ≈ 0.352），C_N 为 N 阶切比雪夫多项式：在通带内振荡于 [-1, 1] 之间形成波纹，越过 f_c 后呈双曲余弦爆炸增长带来极陡滚降。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：三大滤波器幅频曲线（对数 vs 线性）与听感对比",
      "instruction": "切换【对数/线性视图】观察切比雪夫 6% 通带波纹；调节【极点数】和【测试信号频率】，并点击【播放滤波后测试音】亲耳感受不同滤波器在 1000 Hz 截止频率后的阻带衰减能力。",
      "controls": [
        {
          "type": "slider",
          "id": "filterIdx",
          "label": "高亮滤波器 (0贝塞尔 1巴特沃斯 2切比雪夫)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "poles",
          "label": "滤波器极点数",
          "min": 2,
          "max": 8,
          "step": 2,
          "value": 8,
          "unit": " 极点"
        },
        {
          "type": "slider",
          "id": "testFreq",
          "label": "测试信号频率 (fc = 1000 Hz)",
          "min": 200,
          "max": 3500,
          "step": 50,
          "value": 1350,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "logScale",
          "label": "对数 (Log) 纵轴视图",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波后测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar ac = null, osc = null, gainNode = null;\n\nfunction besselPoly(n) {\n  if (n === 0) return [1];\n  if (n === 1) return [1, 1];\n  var bPrev2 = [1], bPrev1 = [1, 1];\n  for (var k = 2; k <= n; k++) {\n    var cur = new Array(k + 1).fill(0);\n    for (var i = 0; i < bPrev1.length; i++) cur[i] += (2 * k - 1) * bPrev1[i];\n    for (var j = 0; j < bPrev2.length; j++) cur[j + 2] += bPrev2[j];\n    bPrev2 = bPrev1; bPrev1 = cur;\n  }\n  return bPrev1;\n}\n\nfunction rawBesselMag(coeffs, w) {\n  var re = 0, im = 0, wp = 1;\n  for (var k = 0; k < coeffs.length; k++) {\n    if (k % 2 === 0) re += coeffs[k] * wp * ((k / 2) % 2 === 0 ? 1 : -1);\n    else im += coeffs[k] * wp * (((k - 1) / 2) % 2 === 0 ? 1 : -1);\n    wp *= w;\n  }\n  return coeffs[0] / Math.sqrt(re * re + im * im);\n}\n\nvar besselCache = {};\n[2, 4, 6, 8].forEach(function(n) {\n  var coeffs = besselPoly(n);\n  var lo = 0.5, hi = 5.0, target = Math.SQRT1_2;\n  for (var it = 0; it < 32; it++) {\n    var mid = 0.5 * (lo + hi);\n    if (rawBesselMag(coeffs, mid) > target) lo = mid; else hi = mid;\n  }\n  besselCache[n] = { coeffs: coeffs, scale: 0.5 * (lo + hi) };\n});\n\nfunction getMag(type, poles, u) {\n  if (type === 0) {\n    var b = besselCache[poles];\n    return rawBesselMag(b.coeffs, u * b.scale);\n  } else if (type === 1) {\n    return 1.0 / Math.sqrt(1.0 + Math.pow(u, 2 * poles));\n  } else {\n    var eps = 0.352;\n    var cn = (u <= 1.0) ? Math.cos(poles * Math.acos(u)) : Math.cosh(poles * Math.acosh(u));\n    return Math.sqrt(1 + eps * eps) / Math.sqrt(1 + eps * eps * cn * cn);\n  }\n}\n\nfunction updateAudio(freq, mag) {\n  try {\n    if (lab.values.play) {\n      if (!ac) ac = lab.getAudioContext();\n      if (ac.state === 'suspended') ac.resume();\n      if (!osc) {\n        osc = ac.createOscillator();\n        gainNode = ac.createGain();\n        osc.type = 'sine';\n        osc.connect(gainNode);\n        gainNode.connect(ac.destination);\n        osc.start();\n      }\n      osc.frequency.setTargetAtTime(freq, ac.currentTime, 0.02);\n      gainNode.gain.setTargetAtTime(Math.min(0.18, mag * 0.16), ac.currentTime, 0.02);\n    } else if (osc) {\n      osc.stop();\n      osc.disconnect();\n      gainNode.disconnect();\n      osc = null; gainNode = null;\n    }\n  } catch (e) {}\n}\n\nlab.onUpdate(function() {\n  ctx.clearRect(0, 0, W, H);\n  var fIdx = lab.values.filterIdx;\n  var poles = lab.values.poles;\n  var testFreq = lab.values.testFreq;\n  var isLog = lab.values.logScale;\n  var uTest = testFreq / 1000.0;\n\n  var px = 72, py = 24, pw = 620, ph = 180;\n  var maxU = 4.0;\n\n  function mapY(m) {\n    if (isLog) {\n      var logVal = Math.log10(Math.max(m, 0.00005));\n      var frac = (1.0 - logVal) / 5.0;\n      return py + Math.max(0, Math.min(1, frac)) * ph;\n    } else {\n      var fracLin = 1.0 - m / 1.3;\n      return py + Math.max(0, Math.min(1, fracLin)) * ph;\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '10px monospace';\n\n  if (isLog) {\n    var logTicks = [10, 1, 0.1, 0.01, 0.001, 0.0001];\n    logTicks.forEach(function(val) {\n      var yy = mapY(val);\n      ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); ctx.stroke();\n      ctx.fillStyle = val === 1 ? '#f8fafc' : '#94a3b8';\n      ctx.fillText(val.toString(), 18, yy + 3);\n    });\n  } else {\n    var linTicks = [1.2, 1.0, 0.8, 0.6, 0.4, 0.2, 0];\n    linTicks.forEach(function(val) {\n      var yy = mapY(val);\n      ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); ctx.stroke();\n      ctx.fillStyle = val === 1.0 ? '#f8fafc' : '#94a3b8';\n      ctx.fillText(val.toFixed(1), 32, yy + 3);\n    });\n  }\n\n  for (var u = 0; u <= 4; u += 0.5) {\n    var xx = px + (u / maxU) * pw;\n    ctx.strokeStyle = u === 1 ? 'rgba(248, 250, 252, 0.25)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath(); ctx.moveTo(xx, py); ctx.lineTo(xx, py + ph); ctx.stroke();\n    ctx.fillStyle = u === 1 ? '#f8fafc' : '#94a3b8';\n    ctx.fillText((u * 1000).toFixed(0) + 'Hz', xx - 14, py + ph + 16);\n  }\n\n  var names = ['贝塞尔 Bessel', '巴特沃斯 Butterworth', '切比雪夫 Chebyshev (6%波纹)'];\n  var colors = ['#f59e0b', '#38bdf8', '#ec4899'];\n\n  [0, 1, 2].forEach(function(t) {\n    if (t === fIdx) return;\n    ctx.save();\n    ctx.globalAlpha = 0.28;\n    ctx.strokeStyle = colors[t];\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (var i = 0; i <= 300; i++) {\n      var uu = (i / 300) * maxU;\n      var xx = px + (uu / maxU) * pw;\n      var yy = mapY(getMag(t, poles, uu));\n      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n    }\n    ctx.stroke();\n    ctx.restore();\n  });\n\n  ctx.strokeStyle = colors[fIdx];\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  for (var i = 0; i <= 300; i++) {\n    var uu = (i / 300) * maxU;\n    var xx = px + (uu / maxU) * pw;\n    var yy = mapY(getMag(fIdx, poles, uu));\n    if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  var tx = px + (uTest / maxU) * pw;\n  var magTest = getMag(fIdx, poles, uTest);\n  var ty = mapY(magTest);\n  ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';\n  ctx.setLineDash([4, 4]);\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(tx, py); ctx.lineTo(tx, py + ph); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(tx, ty, 6, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();\n\n  ctx.font = 'bold 11px sans-serif';\n  [0, 1, 2].forEach(function(t, idx) {\n    ctx.fillStyle = colors[t];\n    ctx.globalAlpha = (t === fIdx) ? 1.0 : 0.45;\n    ctx.fillText((t === fIdx ? '▶ ' : '   ') + names[t], px + pw - 210, py + 16 + idx * 16);\n  });\n  ctx.globalAlpha = 1.0;\n\n  var atten = 1.0 / Math.max(magTest, 1e-6);\n  updateAudio(testFreq, magTest);\n  lab.setReadout('当前: ' + poles + '极点 ' + names[fIdx] + ' | 测试频率 ' + testFreq + ' Hz | 输出幅度: ' + (magTest * 100).toFixed(2) + '% (衰减 ' + (atten >= 100 ? atten.toFixed(0) : atten.toFixed(1)) + ' 倍)');\n});"
    },
    {
      "type": "concept",
      "heading": "残酷的工程现实：0.4 fs ~ 0.5 fs 的“不可用废土区”",
      "paragraphs": [
        "即便派出滚降最锋利的 8 极点切比雪夫滤波器，在工程实战中也远远不够“完美”。书上举了一个经典的 12 位采集系统案例：假设采样率 $f_s = 10,000\\text{ Hz}$，奈奎斯特频率为 $5\\text{ kHz}$。我们希望所有超过 $5\\text{ kHz}$ 的信号至少被衰减 **100 倍**（残留低于 $1\\%$）。",
        "查对数曲线（图 3-11c）可知，8 极点切比雪夫直到 $1.35 f_c$ 处才达到 100 倍衰减。按比例缩放，必须把滤波器截止频率 $f_c$ 向下退让到 $5000 / 1.35 \\approx 3.7\\text{ kHz}$！这意味着 **$3.7\\text{ kHz}$ 到 $5\\text{ kHz}$ 之间的频带被滤波器缓慢的滚降白白浪费了**。",
        "再看一个精妙的细节：对于 12 位系统（$4096$ 个量化台阶），100 倍衰减够用吗？答案是**够用**！因为 $5000\\sim 6300\\text{ Hz}$ 的干扰信号混叠折叠后，会落入 $3700\\sim 5000\\text{ Hz}$——也就是那片本来就被抛弃的滚降区里，我们根本不在乎它的幅度！真正能混叠并污染 **可用通带 ($0\\sim 3.7\\text{ kHz}$)** 的高频干扰，频率必须大于 $6300\\text{ Hz}$（即 $1.7 f_c$）；而在这个位置，8 极点切比雪夫提供的衰减高达 **1300 倍**，足以压制 12 位系统的量化底噪！",
        "由此得出一条刻骨铭心的工程铁律：**在绝大多数真实采样系统中，采样频率的 $0.4 f_s$ 到 $0.5 f_s$ 之间，永远是一片由滤波器滚降与混叠残留交织而成的“不可用废土区 (Unusable Wasteland)”**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 3：抗混叠“滚降废土区”与混叠折叠模拟器 (fs = 10 kHz)",
      "instruction": "拖动【截止频率 fc】与【外部高频干扰源】，观察大于 5 kHz 的信号如何跨过奈奎斯特频率折叠回来；试听当干扰进入通带且衰减不足时产生的刺耳低频假音！",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "抗混叠截止频率 fc",
          "min": 1500,
          "max": 4800,
          "step": 100,
          "value": 3700,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "poles",
          "label": "切比雪夫极点数",
          "min": 2,
          "max": 8,
          "step": 2,
          "value": 8,
          "unit": " 极点"
        },
        {
          "type": "slider",
          "id": "jamFreq",
          "label": "外部高频干扰源频率",
          "min": 5100,
          "max": 9500,
          "step": 100,
          "value": 6300,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听混叠后的低频假信号",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar ac = null, osc = null, gainNode = null;\n\nfunction chebyMag(poles, u) {\n  var eps = 0.352;\n  var cn = (u <= 1.0) ? Math.cos(poles * Math.acos(u)) : Math.cosh(poles * Math.acosh(u));\n  return Math.sqrt(1 + eps * eps) / Math.sqrt(1 + eps * eps * cn * cn);\n}\n\nfunction updateAudio(aliasFreq, mag) {\n  try {\n    if (lab.values.play) {\n      if (!ac) ac = lab.getAudioContext();\n      if (ac.state === 'suspended') ac.resume();\n      if (!osc) {\n        osc = ac.createOscillator();\n        gainNode = ac.createGain();\n        osc.type = 'sine';\n        osc.connect(gainNode);\n        gainNode.connect(ac.destination);\n        osc.start();\n      }\n      osc.frequency.setTargetAtTime(aliasFreq, ac.currentTime, 0.02);\n      var g = Math.min(0.20, Math.max(0.0002, mag * 0.40));\n      gainNode.gain.setTargetAtTime(g, ac.currentTime, 0.02);\n    } else if (osc) {\n      osc.stop();\n      osc.disconnect();\n      gainNode.disconnect();\n      osc = null; gainNode = null;\n    }\n  } catch (e) {}\n}\n\nlab.onUpdate(function() {\n  ctx.clearRect(0, 0, W, H);\n  var fs = 10000, nyq = 5000;\n  var fc = lab.values.fc;\n  var poles = lab.values.poles;\n  var jamF = lab.values.jamFreq;\n  var aliasF = fs - jamF;\n\n  var px = 55, py = 28, pw = 640, ph = 174;\n  function mapX(f) { return px + (f / fs) * pw; }\n  function mapYdb(db) {\n    var clamped = Math.max(-80, Math.min(5, db));\n    return py + ((5 - clamped) / 85) * ph;\n  }\n\n  var xFc = mapX(fc), xNyq = mapX(nyq);\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';\n  ctx.fillRect(px, py, xFc - px, ph);\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';\n  ctx.fillRect(xFc, py, xNyq - xFc, ph);\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.07)';\n  ctx.fillRect(xNyq, py, px + pw - xNyq, ph);\n\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillStyle = '#10b981'; ctx.fillText('可用通带 (0~' + (fc/1000).toFixed(1) + 'k)', px + 8, py + 16);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('废土区', xFc + 4, py + 16);\n  ctx.fillStyle = '#ec4899'; ctx.fillText('高于奈奎斯特 (将会混叠折叠)', xNyq + 12, py + 16);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '10px monospace';\n  [0, -20, -40, -60, -80].forEach(function(db) {\n    var yy = mapYdb(db);\n    ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); ctx.stroke();\n    ctx.fillStyle = db === -40 ? '#f59e0b' : '#94a3b8';\n    ctx.fillText(db + 'dB', 14, yy + 3);\n  });\n\n  ctx.save();\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n  ctx.setLineDash([5, 4]);\n  var y40 = mapYdb(-40);\n  ctx.beginPath(); ctx.moveTo(px, y40); ctx.lineTo(px + pw, y40); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('100倍衰减线 (-40dB)', px + pw - 135, y40 - 5);\n  ctx.restore();\n\n  for (var f = 0; f <= fs; f += 1000) {\n    var xx = mapX(f);\n    ctx.strokeStyle = f === nyq ? 'rgba(248, 250, 252, 0.55)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath(); ctx.moveTo(xx, py); ctx.lineTo(xx, py + ph); ctx.stroke();\n    ctx.fillStyle = f === nyq ? '#f8fafc' : '#94a3b8';\n    ctx.fillText((f / 1000) + 'k', xx - 7, py + ph + 15);\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('Nyquist (5kHz)', xNyq - 42, py + ph + 28);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= 320; i++) {\n    var ff = (i / 320) * fs;\n    var m = chebyMag(poles, ff / fc);\n    var db = 20 * Math.log10(Math.max(m, 1e-4));\n    var xx = mapX(ff), yy = mapYdb(db);\n    if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  var jamMag = chebyMag(poles, jamF / fc);\n  var jamDb = 20 * Math.log10(Math.max(jamMag, 1e-4));\n  var xJam = mapX(jamF), yJam = mapYdb(jamDb), yZero = mapYdb(0), yBot = mapYdb(-80);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 3;\n  ctx.beginPath(); ctx.moveTo(xJam, yBot); ctx.lineTo(xJam, yJam); ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(xJam, yJam, 5, 0, Math.PI * 2); ctx.fill();\n\n  var xAlias = mapX(aliasF);\n  var inPassband = aliasF < fc;\n  var aliasColor = inPassband ? (jamMag > 0.01 ? '#ef4444' : '#10b981') : '#f59e0b';\n\n  ctx.save();\n  ctx.strokeStyle = aliasColor;\n  ctx.setLineDash([4, 3]);\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(xAlias, yBot); ctx.lineTo(xAlias, yJam); ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = aliasColor;\n  ctx.beginPath(); ctx.arc(xAlias, yJam, 5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(xJam, yJam - 6);\n  ctx.quadraticCurveTo(xNyq, Math.max(py + 20, yJam - 45), xAlias, yJam - 6);\n  ctx.stroke();\n\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillStyle = aliasColor;\n  var statusTxt = inPassband ? (jamMag > 0.01 ? '⚠ 混叠入侵通带且衰减不足!' : '✓ 虽落入通带，但已被充分衰减') : '✓ 混叠落入废土区 (无害)';\n  ctx.fillText(statusTxt, px + 8, py + ph - 10);\n\n  var atten = 1.0 / Math.max(jamMag, 1e-6);\n  updateAudio(aliasF, jamMag);\n  lab.setReadout('干扰源 ' + jamF + ' Hz → 混叠成 ' + aliasF + ' Hz | 滤波器衰减: ' + (atten >= 100 ? atten.toFixed(0) : atten.toFixed(1)) + ' 倍 (' + jamDb.toFixed(1) + ' dB) | ' + statusTxt);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "选型口诀：要阻带最狠选【切比雪夫】（代价是通带有波纹）；要通带幅度最准选【巴特沃斯】；对时域脉冲不失真有要求才考虑【贝塞尔】，但千万别指望它的高频衰减。",
        "永远别把有效信号塞满整个奈奎斯特带宽：真实模拟滤波器的滚降需要缓冲区，0.4 fs 到 0.5 fs 通常都是“不可用废土区”（例如 10 kHz 采样率，可用带宽往往只有 3.7 kHz）。",
        "多采样率硬件系统优先用【开关电容滤波器】：用单颗 IC 替代庞大的分立电阻电容网络，改变时钟频率就能自动缩放截止频率 f_c。",
        "自己焊 Sallen-Key 模拟滤波器时，必须使用 1% 或更高精度的电阻与电容，且运放的单位增益带宽应大于目标截止频率 f_c 的 30~100 倍。"
      ]
    }
  ]
});
