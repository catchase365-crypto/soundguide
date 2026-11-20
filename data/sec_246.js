window.__BOOK_REGISTER_SECTION__("sec_246", {
  "title": "在频域中求解本福特定律 (Solving in the Frequency Domain)",
  "intuition": "把对数域里令人头疼的“卷积”变成频域里一目了然的“乘法”：本福特定律之所以成立，本质上是因为数字分布足够宽时，它的频谱变成了一个极窄的低通滤波器，把取首位数字引入的所有周期振荡谐波全部抹平了。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从卷积到乘法：化繁为简的频域视角",
      "paragraphs": [
        "为了系统地看清本福特定律的运作机制，我们把问题从**对数域（logarithmic domain）**搬到**频域（frequency domain）**。在对数域中，三个核心信号——原始数字的概率密度函数 `pdf(g)`、提取首位数字的周期方波信号 `sf(g)`，以及“1的缩放测试”结果 `ost(g)`——之间是通过**卷积（convolution）**联系起来的。卷积在数学和直觉上都不好处理。",
        "只要对这三个信号分别做傅里叶变换，得到频域信号 `PDF(f)`、`SF(f)` 和 `OST(f)`，复杂的卷积立刻退化为最简单的**逐点相乘**。这对应着本福特定律的三个物理步骤：首先用 `pdf(g)`（或 `PDF(f)`）代表生成数字的概率分布；接着用卷积 `sf(g)`（或乘以 `SF(f)`）表示“提取每个数的首位数字”；最后通过 `ost(g)`（或 `OST(f)`）观察首位数字在不同尺度下的出现概率。",
        "这里有一个小细节：数学上 `pdf(-g)` 的傅里叶变换是 `PDF*(f)`，星号代表**复共轭（complex conjugate）**，即所有相位值取反。但在本福特定律的问题中，**相位不包含我们需要的信息**，我们只关心信号的**幅度（magnitude）**。因此，在实际分析时不必纠结 `pdf(g)` 与 `pdf(-g)`、或 `PDF(f)` 与 `PDF*(f)` 的符号差别。"
      ],
      "formula": {
        "expr": "ost(g) = sf(g) * pdf(-g)   ⟺   OST(f) = SF(f) × PDF*(f)",
        "explain": "g 为对数数轴坐标，f 为对应的频率；* 号在左侧表示卷积运算，在右上角表示复共轭；× 表示频域中的直接乘法。对数域的卷积等价于频域的相乘。"
      }
    },
    {
      "type": "concept",
      "heading": "六个信号的“出厂设定”与高斯带宽规律",
      "paragraphs": [
        "无论是对数域还是频域，这六个信号都有由问题定义锁死的刚性特征。首先，频域在 `f = 0`（直流分量）处的值永远等于信号在对数域的**平均值**。因为概率密度函数 `pdf(g)` 下方的总面积恒等于 1（概率归一化），所以 **`PDF(0)` 永远严格等于 1**。",
        "在典型分析中，我们假设 `pdf(g)` 是一条标准差为 `σ_g` 的**高斯曲线**。高斯函数最美妙的性质之一是：它的傅里叶变换 `PDF(f)` 依然是一条高斯曲线（只画 `f ≥ 0` 的单边谱）。两者的宽度成反比：对数域的数字分布越宽（`σ_g` 越大），频域的包络 `PDF(f)` 就越窄（`σ_f` 越小）。",
        "其次，由于采样方波 `sf(g)` 是周期为 1 的周期信号，根据傅里叶变换对的规律，它的频谱 `SF(f)` 是一串位于整数频率 `f = 0, 1, 2, 3, ...` 上的**离散脉冲（spikes）**，脉冲之间全为零。其中第 0 根脉冲 `SF(0)` 等于 `sf(g)` 处于高电平的时间比例，即 `log10(2) - log10(1) = 0.301`；其余高次谐波脉冲的幅度分别为 `SF(1) = 0.516`、`SF(2) = 0.302`、`SF(3) = 0.064` 等。",
        "最后看结果 `ost(g)` 与 `OST(f)`：如果数据**遵循**本福特定律，`ost(g)` 就是一条恒等于 `0.301` 的水平直线，对应频域只有 `OST(0) = 0.301`，其他频率全为零；如果**不遵循**本福特定律，`ost(g)` 就会呈现周期为 1 的波动，对应 `OST(f)` 在 `f = 0, 1, 2, 3, ...` 处保留了非零脉冲。"
      ],
      "formula": {
        "expr": "σ_f = 1 / (2π · σ_g)",
        "explain": "σ_g 是对数域高斯分布 pdf(g) 的标准差（反映数字跨越的数量级宽度）；σ_f 是频域高斯滤波包络 PDF(f) 的标准差。两者成反比：分布越宽，频域滤波器越窄，越能彻底切掉 f ≥ 1 的谐波脉冲。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：高斯包络如何“扼杀”谐波脉冲（对照 Fig. 34-5）",
      "instruction": "拖动「对数分布宽度 σ_g」滑块，左侧观察对数域 pdf(g) 与 ost(g) 曲线，右侧观察频域 PDF(f) 包络如何乘以 SF(f) 脉冲并决定最终 OST(f) 的谐波生死。",
      "controls": [
        {
          "type": "slider",
          "id": "sigmaG",
          "label": "对数分布宽度 σ_g",
          "min": 0.06,
          "max": 0.7,
          "step": 0.02,
          "value": 0.14,
          "unit": " 数量级"
        },
        {
          "type": "toggle",
          "id": "showSF",
          "label": "叠加显示原始 SF(f) 脉冲",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar d = Math.log10(2);\nfunction sfSigned(k) {\n  if (k === 0) return d;\n  return 2 * Math.sin(Math.PI * k * d) / (Math.PI * k);\n}\nfunction draw() {\n  var sigmaG = lab.values.sigmaG;\n  var showSF = lab.values.showSF;\n  var sigmaF = 1 / (2 * Math.PI * sigmaG);\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 40; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (var gy = 30; gy < H; gy += 30) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.stroke();\n\n  var lx0 = 32, lw = 300;\n  var topBase = 95, topH = 68;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('对数域: pdf(g) [绿] 与 ost(g) [蓝]', lx0, 18);\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(lx0, topBase); ctx.lineTo(lx0 + lw, topBase); ctx.stroke();\n\n  var pdfPeak = 1 / (sigmaG * Math.sqrt(2 * Math.PI));\n  var normScale = Math.min(topH, topH * (pdfPeak / 2.5));\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i <= 150; i++) {\n    var g = -1.5 + (i / 150) * 3.0;\n    var val = Math.exp(-(g * g) / (2 * sigmaG * sigmaG));\n    var px = lx0 + (i / 150) * lw;\n    var py = topBase - val * normScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('pdf(g)', lx0 + 4, topBase - normScale + 12);\n\n  var botBase = 212, botH = 85;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(lx0, botBase); ctx.lineTo(lx0 + lw, botBase); ctx.stroke();\n\n  var y0301 = botBase - 0.301 * botH;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(lx0, y0301); ctx.lineTo(lx0 + lw, y0301); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('0.301', lx0 + lw - 32, y0301 - 4);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  var maxDev = 0;\n  for (var j = 0; j <= 180; j++) {\n    var g2 = -1.5 + (j / 180) * 3.0;\n    var ost = d;\n    for (var k = 1; k <= 16; k++) {\n      var pdfK = Math.exp(-(k * k) / (2 * sigmaF * sigmaF));\n      ost += sfSigned(k) * pdfK * Math.cos(2 * Math.PI * k * g2);\n    }\n    maxDev = Math.max(maxDev, Math.abs(ost - d));\n    var px2 = lx0 + (j / 180) * lw;\n    var py2 = botBase - Math.max(0, Math.min(1.05, ost)) * botH;\n    if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('ost(g)', lx0 + 4, botBase - botH + 10);\n\n  var rx0 = 390, rw = 300, fBase = 212, fH = 160;\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('频域: PDF(f) [绿] × SF(f) [灰] = OST(f) [粉]', rx0, 18);\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(rx0, fBase); ctx.lineTo(rx0 + rw, fBase); ctx.stroke();\n\n  var maxF = 4.5;\n  if (showSF) {\n    for (var f = 0; f <= 4; f++) {\n      var sfMag = Math.abs(sfSigned(f));\n      var sx = rx0 + (f / maxF) * rw;\n      var sy = fBase - sfMag * fH;\n      ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n      ctx.lineWidth = 5;\n      ctx.beginPath(); ctx.moveTo(sx, fBase); ctx.lineTo(sx, sy); ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.45)';\n      ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([5, 3]);\n  ctx.beginPath();\n  for (var m = 0; m <= 120; m++) {\n    var fv = (m / 120) * maxF;\n    var pdfVal = Math.exp(-(fv * fv) / (2 * sigmaF * sigmaF));\n    var fx = rx0 + (fv / maxF) * rw;\n    var fy = fBase - pdfVal * (fH * 0.9);\n    if (m === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  var ost1 = Math.abs(sfSigned(1)) * Math.exp(-1 / (2 * sigmaF * sigmaF));\n  for (var fk = 0; fk <= 4; fk++) {\n    var pdfFk = Math.exp(-(fk * fk) / (2 * sigmaF * sigmaF));\n    var ostMag = Math.abs(sfSigned(fk)) * pdfFk;\n    var ox = rx0 + (fk / maxF) * rw;\n    var oy = fBase - ostMag * fH;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 3;\n    ctx.beginPath(); ctx.moveTo(ox, fBase); ctx.lineTo(ox, oy); ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(ox, oy, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.fillStyle = '#cbd5e1';\n    ctx.fillText('f=' + fk, ox - 8, fBase + 14);\n  }\n\n  var status = maxDev < 0.015 ? '✓ 本福特定律成立（谐波几乎归零）' : '✗ 偏离本福特定律（存在周期波动）';\n  lab.setReadout('σ_g = ' + sigmaG.toFixed(2) + '  |  σ_f = ' + sigmaF.toFixed(2) + '  |  OST(0) = 0.301  |  OST(1) = ' + ost1.toFixed(3) + '  |  ' + status);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "用频域直觉看透两个关键事实",
      "paragraphs": [
        "仔细观察上面的实验，你会立刻发现频域方法为什么被称为“降维打击”：",
        "**第一，直流分量永远不变。** 不管 `σ_g` 怎么变，`PDF(0)` 始终钉死在 `1` 上。因此 `OST(0) = SF(0) × PDF(0) = 0.301 × 1 = 0.301`。这意味着 `ost(g)` 的平均值永远是 `0.301`，与具体分布的形状毫无关系！",
        "**第二，周期波动能否消失，全看 `f ≥ 1` 的谐波脉冲是否被切掉。** 当 `σ_g` 很小时，`PDF(f)` 非常宽胖，`f = 1, 2, 3` 处的脉冲被保留下来，导致 `ost(g)` 剧烈起伏；当 `σ_g` 增大到一定程度（例如跨越半个数量级以上）时，`σ_f = 1/(2πσ_g)` 急剧缩窄，`PDF(1)` 迅速跌向 0，于是所有高于 0 的脉冲全部消失，频域只剩下 `f = 0` 这一根孤零零的脉冲——它在对数域里对应的正是一条平直的 `0.301` 直线。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：听觉微实验——谐波消失时，世界变成平直的“本福特静音”",
      "instruction": "点击「播放谐波声音」，把 sf(g) 与 ost(g) 的高频谐波（f = 1~6）映射为可听声音频率。拖动 σ_g 滑块，亲耳听出“周期振荡的尖锐蜂鸣”如何被高斯滤波抹平为纯直流静音！",
      "controls": [
        {
          "type": "slider",
          "id": "sigmaG",
          "label": "分布宽度 σ_g",
          "min": 0.04,
          "max": 0.65,
          "step": 0.01,
          "value": 0.1,
          "unit": " 数量级"
        },
        {
          "type": "slider",
          "id": "baseFreq",
          "label": "基频 f_1",
          "min": 110,
          "max": 330,
          "step": 10,
          "value": 180,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "rawSF",
          "label": "对比原始 sf(g) 谐波声",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放谐波声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar d = Math.log10(2);\nvar audioCtx = null, masterGain = null, oscs = [], gains = [];\n\nfunction sfMag(k) {\n  if (k === 0) return d;\n  return 2 * Math.abs(Math.sin(Math.PI * k * d)) / (Math.PI * k);\n}\nfunction sfSigned(k) {\n  if (k === 0) return d;\n  return 2 * Math.sin(Math.PI * k * d) / (Math.PI * k);\n}\n\nfunction ensureAudio() {\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    if (!audioCtx) return false;\n    masterGain = audioCtx.createGain();\n    masterGain.gain.value = 0;\n    masterGain.connect(audioCtx.destination);\n    for (var k = 1; k <= 6; k++) {\n      var osc = audioCtx.createOscillator();\n      var g = audioCtx.createGain();\n      osc.type = 'sine';\n      osc.frequency.value = lab.values.baseFreq * k;\n      g.gain.value = 0;\n      osc.connect(g);\n      g.connect(masterGain);\n      osc.start();\n      oscs.push(osc);\n      gains.push(g);\n    }\n  }\n  return true;\n}\n\nfunction updateAudio() {\n  if (!lab.values.play && !audioCtx) return;\n  if (!ensureAudio()) return;\n  if (lab.values.play && audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n  var t = audioCtx.currentTime;\n  masterGain.gain.setTargetAtTime(lab.values.play ? 0.25 : 0, t, 0.03);\n  var sigmaF = 1 / (2 * Math.PI * lab.values.sigmaG);\n  for (var k = 1; k <= 6; k++) {\n    var amp = sfMag(k);\n    if (!lab.values.rawSF) {\n      amp *= Math.exp(-(k * k) / (2 * sigmaF * sigmaF));\n    }\n    oscs[k - 1].frequency.setTargetAtTime(lab.values.baseFreq * k, t, 0.02);\n    gains[k - 1].gain.setTargetAtTime(amp, t, 0.02);\n  }\n}\n\nfunction draw() {\n  var sigmaG = lab.values.sigmaG;\n  var rawSF = lab.values.rawSF;\n  var sigmaF = 1 / (2 * Math.PI * sigmaG);\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (var y = 30; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  var wx0 = 28, ww = 310, wBase = 205, wH = 150;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(rawSF ? '周期方波 sf(g) 波形 (含全部谐波)' : '滤波后 ost(g) 波形 (直流 0.301 + 残余交流谐波)', wx0, 20);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(wx0, wBase); ctx.lineTo(wx0 + ww, wBase); ctx.stroke();\n\n  var dcY = wBase - 0.301 * wH;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(wx0, dcY); ctx.lineTo(wx0 + ww, dcY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('DC = 0.301 (无声直流)', wx0 + ww - 115, dcY - 5);\n\n  ctx.strokeStyle = rawSF ? '#f8fafc' : '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  var harmonicEnergy = 0;\n  for (var i = 0; i <= 200; i++) {\n    var g = (i / 200) * 2.0;\n    var val = d;\n    for (var k = 1; k <= 6; k++) {\n      var mult = rawSF ? 1 : Math.exp(-(k * k) / (2 * sigmaF * sigmaF));\n      val += sfSigned(k) * mult * Math.cos(2 * Math.PI * k * g);\n    }\n    var px = wx0 + (i / 200) * ww;\n    var py = wBase - Math.max(-0.05, Math.min(1.15, val)) * wH;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var bx0 = 380, bw = 310, bBase = 205, bH = 155;\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('可听谐波分量幅度 (f=1~6) 与直流分量 (f=0)', bx0, 20);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(bx0, bBase); ctx.lineTo(bx0 + bw, bBase); ctx.stroke();\n\n  var barW = 24;\n  for (var fk = 0; fk <= 6; fk++) {\n    var mag = sfMag(fk);\n    var mult2 = (fk === 0 || rawSF) ? 1 : Math.exp(-(fk * fk) / (2 * sigmaF * sigmaF));\n    var activeMag = mag * mult2;\n    if (fk >= 1) harmonicEnergy += activeMag * activeMag;\n    var bx = bx0 + fk * 44 + 8;\n    var fullH = (mag / 0.55) * bH;\n    var actH = (activeMag / 0.55) * bH;\n\n    ctx.fillStyle = 'rgba(255,255,255,0.12)';\n    ctx.fillRect(bx, bBase - fullH, barW, fullH);\n    ctx.fillStyle = fk === 0 ? '#f59e0b' : (rawSF ? '#f8fafc' : '#ec4899');\n    ctx.fillRect(bx, bBase - actH, barW, actH);\n\n    ctx.fillStyle = '#cbd5e1';\n    ctx.fillText(fk === 0 ? 'DC' : 'f' + fk, bx + 4, bBase + 15);\n  }\n\n  var acRms = Math.sqrt(harmonicEnergy);\n  var audioDesc = rawSF ? '正在对比原始方波全谐波' : (acRms < 0.02 ? '高次谐波已归零 → 听觉接近静音（本福特成立）' : '残余周期谐波明显 → 可听见蜂鸣');\n  lab.setReadout('AC 谐波强度(RMS) = ' + acRms.toFixed(3) + '  |  基频 = ' + lab.values.baseFreq + ' Hz  |  ' + audioDesc);\n  updateAudio();\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑提醒：分析本福特定律时千万别被 pdf(-g) 带来的共轭符号 PDF*(f) 吓到——复共轭只反转相位，而我们只看频谱幅度，所以工程计算中可直接当成 PDF(f) 处理。",
        "核心公式速记：PDF(0) 恒等于 1，这锁死了 OST(0) = SF(0) = 0.301，保证了最终曲线无论如何波动，平均值永远稳稳站在 0.301。",
        "尺度-带宽反比铁律：σ_f = 1/(2π·σ_g)。只要数据集的对数分布足够宽（σ_g 够大），其频谱就能窄到把 f = 1, 2, 3... 的所有周期脉冲全部滤除，只留下一条平直的 0.301。"
      ]
    }
  ]
});
