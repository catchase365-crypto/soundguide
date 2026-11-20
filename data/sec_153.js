window.__BOOK_REGISTER_SECTION__("sec_153", {
  "title": "用整数实现递归滤波器 (Using Integers)",
  "intuition": "递归滤波器天生偏爱浮点数；硬上整数运算不仅面临反馈环路中舍入误差累积与系统失稳的风险，还必须用“分数移位”或“查表法”来绕开小数乘法。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么递归滤波器在整数世界里举步维艰？",
      "paragraphs": [
        "在数字信号处理中，单精度浮点数（`float32`）是实现简单递归滤波器的理想选择。虽然我们也能强行用整数（`int`）来实现，但难度会瞬间飙升，核心源于**两大拦路虎**：",
        "第一大难题是**有限位宽带来的舍入误差（Round-off Error）**。与只做一次有限累加的卷积（FIR）滤波器不同，递归滤波器存在**反馈回路**——上一次的输出 `y[n-1]` 会被乘以系数后不断喂回下一次计算。有限整数位宽产生的微小截断或舍入误差会在反馈环里反复迭代放大，轻则劣化滤波器的频率响应、在低电平时产生卡死的“死区（Deadband）”，重则导致等效极点漂移出单位圆，直接让整个滤波器**发散失稳**。",
        "第二大难题是**小数系数的整数化处理**。递归滤波器的核心系数几乎都是小数（例如单极点低通滤波器中的 `0.15` 和 `0.85`）。纯整数处理器或无浮点单元（FPU）的单片机无法直接执行 `0.15 * x` 这样的运算，必须另辟蹊径把小数乘法拆解成纯整数操作。"
      ],
      "formula": {
        "expr": "y[n] = a0 * x[n] + b1 * y[n-1]",
        "explain": "x[n] 是当前输入采样，y[n] 是当前输出，y[n-1] 是上一时刻输出。a0 与 b1 通常为小数（如 a0 = 0.15, b1 = 0.85）。一旦使用低位宽整数，每次乘法后的取整误差都会通过 b1 * y[n-1] 持续回流并影响后续输出。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：整数舍入误差、死区效应与听感对比",
      "instruction": "拖动位宽与反馈系数滑块，观察整数滤波器的波形台阶与“死区”滞留现象；点击播放按钮对比浮点与整数滤波的声音质感。",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "定点整数精度 (位宽)",
          "min": 4,
          "max": 14,
          "step": 1,
          "value": 6,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "b1",
          "label": "反馈系数 b1 (衰减慢度)",
          "min": 0.5,
          "max": 0.98,
          "step": 0.02,
          "value": 0.88,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "roundUp",
          "label": "开启四舍五入 (对比向零截断)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 对比听感 (前1秒浮点 / 后1秒整数)",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "var audioSrc = null;\nvar lastPlay = false;\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\n\nfunction startAudio() {\n  stopAudio();\n  try {\n    var ctx = lab.getAudioContext();\n    if (!ctx) return;\n    if (ctx.state === 'suspended') ctx.resume();\n    var sr = ctx.sampleRate || 44100;\n    var dur = 2.0;\n    var len = Math.floor(sr * dur);\n    var buf = ctx.createBuffer(1, len, sr);\n    var data = buf.getChannelData(0);\n    var bits = lab.values.bits;\n    var b1 = lab.values.b1;\n    var a0 = 1 - b1;\n    var useRound = lab.values.roundUp;\n    var scale = (1 << (bits - 1)) - 1;\n    var half = Math.floor(len / 2);\n    var yf = 0;\n    var yi = 0;\n    for (var i = 0; i < len; i++) {\n      var localT = (i % half) / sr;\n      var env = Math.exp(-localT * 3.0);\n      var x = env * (0.65 * Math.sin(2 * Math.PI * 220 * localT) + 0.35 * Math.sin(2 * Math.PI * 660 * localT));\n      if (i < half) {\n        yf = a0 * x + b1 * yf;\n        data[i] = yf * 0.25;\n      } else {\n        if (i === half) yi = 0;\n        var xi = Math.round(x * scale);\n        var raw = a0 * xi + b1 * yi;\n        yi = useRound ? Math.round(raw) : Math.trunc(raw);\n        data[i] = (yi / scale) * 0.25;\n      }\n    }\n    audioSrc = ctx.createBufferSource();\n    audioSrc.buffer = buf;\n    audioSrc.loop = true;\n    audioSrc.connect(ctx.destination);\n    audioSrc.start(0);\n  } catch (e) {}\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var bits = lab.values.bits;\n  var b1 = lab.values.b1;\n  var a0 = 1 - b1;\n  var useRound = lab.values.roundUp;\n  var scale = (1 << (bits - 1)) - 1;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, w, h);\n\n  var padL = 46, padR = 20, padT = 36, padB = 30;\n  var plotW = w - padL - padR;\n  var plotH = h - padT - padB;\n  var baseY = padT + plotH * 0.86;\n  var unitH = plotH * 0.72;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = baseY - (g / 4) * unitH;\n    ctx.beginPath();\n    ctx.moveTo(padL, gy);\n    ctx.lineTo(w - padR, gy);\n    ctx.stroke();\n  }\n  for (var gx = 0; gx <= 6; gx++) {\n    var px = padL + (gx / 6) * plotW;\n    ctx.beginPath();\n    ctx.moveTo(px, padT);\n    ctx.lineTo(px, baseY + 12);\n    ctx.stroke();\n  }\n\n  var N = 120;\n  var yfArr = [];\n  var yiArr = [];\n  var xArr = [];\n  var yf = 0, yi = 0;\n  var maxErr = 0;\n\n  for (var n = 0; n < N; n++) {\n    var xn = (n >= 6 && n <= 38) ? 1.0 : 0.0;\n    xArr.push(xn);\n    yf = a0 * xn + b1 * yf;\n    yfArr.push(yf);\n\n    var xi = Math.round(xn * scale);\n    var raw = a0 * xi + b1 * yi;\n    yi = useRound ? Math.round(raw) : Math.trunc(raw);\n    var yiNorm = yi / scale;\n    yiArr.push(yiNorm);\n\n    var err = Math.abs(yiNorm - yf);\n    if (err > maxErr) maxErr = err;\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.setLineDash([4, 4]);\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = padL + (n / (N - 1)) * plotW;\n    var py = baseY - xArr[n] * unitH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = padL + (n / (N - 1)) * plotW;\n    var py = baseY - yfArr[n] * unitH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = padL + (n / (N - 1)) * plotW;\n    var py = baseY - yiArr[n] * unitH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = padL + (n / (N - 1)) * plotW;\n    var errScaled = Math.min(1.0, Math.abs(yiArr[n] - yfArr[n]) * 3);\n    var py = baseY - errScaled * unitH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1.0', 14, baseY - unitH + 4);\n  ctx.fillText('0.0', 14, baseY + 4);\n  ctx.fillText('样本 n (0 → 119)', padL + plotW / 2 - 45, h - 8);\n\n  var lx = padL;\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('● 理想浮点响应', lx, 20);\n  ctx.fillStyle = '#10b981'; ctx.fillText('● 整数定点响应', lx + 120, 20);\n  ctx.fillStyle = '#ec4899'; ctx.fillText('● 舍入误差 (×3放大)', lx + 240, 20);\n  ctx.fillStyle = '#94a3b8'; ctx.fillText('--- 输入矩形脉冲', lx + 390, 20);\n  if (lab.values.play) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('🔊 音频循环对比中', w - 135, 20);\n  }\n\n  var finalIntNorm = yiArr[N - 1];\n  var modeText = useRound ? '四舍五入(易产生尾部零输入死锁)' : '向零截断(易提前归零与幅值偏低)';\n  lab.setReadout('量化台阶: 1/' + scale + ' | 策略: ' + modeText + ' | 峰值误差: ' + (maxErr * 100).toFixed(2) + '% | 末尾死区残留: ' + finalIntNorm.toFixed(3));\n\n  if (lab.values.play) {\n    startAudio();\n    lastPlay = true;\n  } else if (lastPlay) {\n    stopAudio();\n    lastPlay = false;\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "破解小数乘法：分数移位法 vs 查表法 (LUT)",
      "paragraphs": [
        "为了在没有小数运算的纯整数环境中算出诸如 `0.15 * x` 的结果，书中给出了两种最经典的工程套路：",
        "**方法一：分数逼近与位移除法（Fraction Approximation）**。把小数系数改写成一个整数分数，并且刻意挑选 **2 的整数次幂** 作为分母。例如，把 `0.15` 近似写成 `19 / 128`（实际值为 `0.1484375`）。计算时先做整数乘法 `x * 19`，再除以 `128`。在二进制硬件或 C 语言中，除以 `128` 等价于极其高速的**右移 7 位（`>> 7`）**，完全不需要昂贵的整数除法器！但要注意两个坑：一是分母 `2^N` 越小，系数逼近误差越大；二是先乘后除会导致中间乘积变大，必须确保中间累加器位宽足够，避免整数溢出。",
        "**方法二：查表法（Look-Up Table, LUT）**。直接用空间换时间，彻底消灭乘法！例如，一个 **12 位 ADC** 采集到的样本值固定落在 `0` 到 `4095` 之间。我们可以提前在内存里建好一张长度为 `4096` 的数组表，把 `0.15 * 0`、`0.15 * 1` …… 直到 `0.15 * 4095` 的结果算好存进去。程序运行时只需执行一次数组寻址 `LUT[sample]`，速度飞快！但代价也很现实：**极其耗费内存**——不仅采样位宽每多 1 位表格体积就翻倍，而且**每一个小数系数都需要一张独立的查表**。"
      ],
      "formula": {
        "expr": "0.15 * x  ≈  (x * 19) >> 7   vs   LUT[x]",
        "explain": "左侧为分数移位法：用 19/128 近似 0.15，乘法后右移 7 位即可；右侧为查表法：直接以输入整数 x 作为下标读取预计算结果，无需任何算术乘法，但需要 2^B 大小的内存空间。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：分数移位逼近 vs 查表法 (LUT) 权衡模拟器",
      "instruction": "调节目标系数、分母移位位数 N 与 ADC 位宽，直观对比分数移位误差、中间乘法溢出位宽以及 LUT 内存膨胀代价。",
      "controls": [
        {
          "type": "slider",
          "id": "coeff",
          "label": "目标小数系数 c",
          "min": 0.05,
          "max": 0.95,
          "step": 0.01,
          "value": 0.15,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "shiftBits",
          "label": "分母移位位数 N (分母=2^N)",
          "min": 3,
          "max": 10,
          "step": 1,
          "value": 7,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "adcBits",
          "label": "ADC 位宽 (决定 LUT 长度)",
          "min": 8,
          "max": 16,
          "step": 1,
          "value": 12,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "showDiff",
          "label": "放大显示移位取整误差",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var coeff = lab.values.coeff;\n  var N = lab.values.shiftBits;\n  var adcBits = lab.values.adcBits;\n  var showDiff = lab.values.showDiff;\n\n  var denom = 1 << N;\n  var num = Math.round(coeff * denom);\n  var approx = num / denom;\n  var relErr = Math.abs(approx - coeff) / coeff * 100;\n  var lutEntries = 1 << adcBits;\n  var lutKB = (lutEntries * 2) / 1024;\n  var maxAdc = lutEntries - 1;\n  var maxProd = Math.max(1, maxAdc * num);\n  var prodBits = Math.ceil(Math.log(maxProd + 1) / Math.LN2);\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, w, h);\n\n  var lx = 44, ly = 36, lw = 316, lh = 166;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var py = ly + (i / 4) * lh;\n    ctx.beginPath(); ctx.moveTo(lx, py); ctx.lineTo(lx + lw, py); ctx.stroke();\n    var px = lx + (i / 4) * lw;\n    ctx.beginPath(); ctx.moveTo(px, ly); ctx.lineTo(px, ly + lh); ctx.stroke();\n  }\n\n  var maxS = 128;\n  var maxY = Math.max(coeff, approx) * maxS * 1.15;\n  if (maxY < 10) maxY = 10;\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(lx, ly + lh);\n  ctx.lineTo(lx + lw, ly + lh - (coeff * maxS / maxY) * lh);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var s = 0; s <= maxS; s++) {\n    var px = lx + (s / maxS) * lw;\n    var val = Math.floor((s * num) / denom);\n    var py = ly + lh - (val / maxY) * lh;\n    if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.2;\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  for (var s = 0; s <= maxS; s++) {\n    var px = lx + (s / maxS) * lw;\n    var valLut = Math.round(coeff * s);\n    var py = ly + lh - (valLut / maxY) * lh;\n    if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  if (showDiff) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    for (var s = 0; s <= maxS; s++) {\n      var px = lx + (s / maxS) * lw;\n      var val = Math.floor((s * num) / denom);\n      var err = Math.abs(val - coeff * s);\n      var py = ly + lh - Math.min(1.0, (err * 4) / maxY) * lh;\n      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 理想 c*x', lx, 22);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 移位 (x*' + num + ')>>' + N, lx + 82, 22);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('--- LUT[x]', lx + 205, 22);\n  if (showDiff) {\n    ctx.fillStyle = '#ec4899'; ctx.fillText('— 误差×4', lx + 280, 22);\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('输入样本 x (0 → 128 局部放大)', lx + 75, h - 12);\n\n  var rx = 395, rw = 300;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.fillRect(rx, 24, rw, 192);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx, 24, rw, 192);\n\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('工程指标实时对比面板', rx + 14, 46);\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('1. 分数移位法: ' + num + ' / ' + denom + ' = ' + approx.toFixed(5), rx + 14, 72);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('系数相对误差: ' + relErr.toFixed(2) + '%', rx + 14, 90);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(rx + 14, 96, rw - 28, 10);\n  var errBar = Math.min(1, relErr / 15) * (rw - 28);\n  ctx.fillStyle = relErr > 3 ? '#ec4899' : '#10b981';\n  ctx.fillRect(rx + 14, 96, errBar, 10);\n\n  ctx.fillStyle = prodBits > 16 ? '#f59e0b' : '#38bdf8';\n  ctx.fillText('乘法中间位宽需求: ' + prodBits + ' bit' + (prodBits > 16 ? ' (超16位,需32位寄存器!)' : ' (16位可控)'), rx + 14, 128);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('2. 查表法 (LUT): ' + lutEntries + ' 项 / 系数', rx + 14, 156);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('单表内存: ' + lutKB.toFixed(1) + ' KB (4个系数共 ' + (lutKB * 4).toFixed(1) + ' KB)', rx + 14, 174);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(rx + 14, 182, rw - 28, 10);\n  var memBar = Math.min(1, (adcBits - 7) / 9) * (rw - 28);\n  ctx.fillStyle = adcBits >= 14 ? '#ec4899' : '#f59e0b';\n  ctx.fillRect(rx + 14, 182, memBar, 10);\n\n  lab.setReadout('分数近似: ' + num + '/' + denom + ' (' + approx.toFixed(4) + ', 误差 ' + relErr.toFixed(2) + '%) | 单系数LUT: ' + lutEntries + ' 项 (' + lutKB.toFixed(1) + ' KB) | 乘法中间防溢出需: ' + prodBits + ' bit');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "作者的终极忠告：先看看移动平均滤波器够不够用！",
      "paragraphs": [
        "在费尽心思折腾上面两种整数技巧之前，作者 Steven W. Smith 留下了一句极其接地气的忠告：**先确认一下，移动平均滤波器（Moving Average Filter）的递归算法能不能满足你的需求。因为——它深爱整数（It *loves* integers）！**",
        "为什么同为“递归算法”，移动平均滤波器就能和整数处得如鱼得水？回顾第 15 章的递归移动平均公式：每前进一个采样点，只需要用上一次的累加和，加上新进入窗口的采样值，再减去滑出窗口的旧采样值。它的**所有递归反馈系数严格等于 `1`**，根本不存在 `0.15` 或 `0.85` 这种小数乘法！",
        "这意味着两件美妙的事：第一，反馈环路里**只有纯整数加减法**，只要累加器位宽够大就不会产生任何舍入误差积累，也绝对不可能因为系数截断而失稳；第二，如果只是为了在时域里平滑随机噪声，用纯整数实现的递归移动平均不仅速度最快，而且精度与浮点完全一致。"
      ],
      "formula": {
        "expr": "sum[n] = sum[n-1] + x[n] - x[n-M]",
        "explain": "递归移动平均的核心递推式：反馈系数为整数 1，全程仅有整数加减（最后按需除以窗口长度 M 或右移即可），彻底免疫递归舍入误差与极点失稳。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "能用单精度浮点（float32）就别硬上整数：IIR/递归滤波器的反馈回路会放大舍入误差，低位宽整数极易产生“死区”甚至失稳。",
        "算力紧且位宽不高时用查表法（LUT）：用 2^B 长度的数组直接替代小数乘法，但别忘了“每个系数都得单配一张表”，ADC 位宽一高内存会指数级爆炸。",
        "内存紧缺时用 2 的幂次分数移位法：把小数变成 k / 2^N（如 0.15 ≈ 19/128），先乘后右移，同时务必用 32 位中间寄存器防止乘法溢出。",
        "需求降维打击：如果项目只需时域平滑降噪而不在乎陡峭的频率滚降，果断换用递归移动平均滤波器——它天生与整数完美契合。"
      ]
    }
  ]
});
