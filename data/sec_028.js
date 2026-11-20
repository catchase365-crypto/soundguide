window.__BOOK_REGISTER_SECTION__("sec_028", {
  "title": "信号与图表术语 (Signal and Graph Terminology)",
  "intuition": "信号本质上是两个参数之间的对应关系；看懂信号图表，关键在于分清「自变量（横轴）决定了什么域」以及「采样点如何从 0 开始编号」，千万别被图上画的是点还是线给骗了。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是信号？连续信号、离散信号与混合信号",
      "paragraphs": [
        "在工程中，**信号（Signal）** 就是描述一个参数如何随另一个参数变化的规律。最常见的模拟电子信号是「随时间变化的电压」。由于电压和时间都可以取连续范围内的任意值，这种信号被称为 **连续信号（Continuous Signal）**。",
        "当连续信号经过 **模数转换器（ADC）** 进入计算机时，两个参数都会被迫 **量化（Quantized）**：例如用 `12 bits`、每秒 `1000` 个采样点的速率进行采集，电压就被限制在 `2^12 = 4096` 个离散二进制电平上，而时间也只在每 `1 毫秒（1 ms）` 的整步长上才有定义。这种两个参数都离散化的信号称为 **离散信号（Discrete Signal）** 或 **数字化信号（Digitized Signal）**。",
        "通常情况下，连续信号存在于自然界，离散信号存在于计算机内部（尽管两类情况都能找到反例）。此外，还存在一个参数连续、另一个参数离散的 **混合信号（Mixed Signal）**。由于这类信号较少见且没有专属名词，使用时必须显式指明两个参数各自的性质。"
      ],
      "formula": {
        "expr": "N_levels = 2^B,   Δt = 1 / f_s",
        "explain": "B 为 ADC 的量化位数（如 12 bits 对应 4096 个幅度等级）；f_s 为采样率（如 1000 samples/s 对应时间间隔 Δt = 1 ms）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：ADC 双重离散化——时间采样与幅度量化",
      "instruction": "拖动「采样点数」与「量化位数」滑块，观察连续信号如何被切分成离散台阶；点击播放可直观对比量化噪声与采样粗糙度。",
      "controls": [
        {
          "type": "slider",
          "id": "samples",
          "label": "总采样点数 (2个周期)",
          "min": 8,
          "max": 96,
          "step": 2,
          "value": 24,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "幅度量化精度",
          "min": 2,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " bits"
        },
        {
          "type": "toggle",
          "id": "showCont",
          "label": "叠加原始连续信号",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放量化测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioCtx = null;\nvar srcNode = null;\nvar gainNode = null;\n\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); } catch (e) {}\n    try { srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n}\n\nfunction syncAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    gainNode = audioCtx.createGain();\n    gainNode.gain.value = 0.14;\n    gainNode.connect(audioCtx.destination);\n  }\n  if (audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n  stopAudio();\n  var sr = audioCtx.sampleRate;\n  var buf = audioCtx.createBuffer(1, sr, sr);\n  var data = buf.getChannelData(0);\n  var f0 = 220;\n  var spc = lab.values.samples / 2;\n  var levels = Math.pow(2, lab.values.bits);\n  for (var i = 0; i < sr; i++) {\n    var phase = (i * f0 / sr) % 1;\n    var qPhase = Math.floor(phase * spc) / spc;\n    var raw = 0.72 * Math.sin(2 * Math.PI * qPhase) + 0.28 * Math.sin(6 * Math.PI * qPhase);\n    var qIdx = Math.round(((raw + 1) / 2) * (levels - 1));\n    data[i] = (qIdx / (levels - 1)) * 2 - 1;\n  }\n  srcNode = audioCtx.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(gainNode);\n  srcNode.start();\n}\n\nfunction signalFn(t) {\n  return 0.72 * Math.sin(4 * Math.PI * t) + 0.28 * Math.sin(12 * Math.PI * t);\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var padL = 54, padR = 24, padT = 22, padB = 34;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var midY = padT + plotH / 2;\n  var ampScale = plotH * 0.44;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var bits = lab.values.bits;\n  var levels = Math.pow(2, bits);\n  var N = lab.values.samples;\n\n  if (bits <= 5) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n    ctx.lineWidth = 1;\n    for (var lv = 0; lv < levels; lv++) {\n      var qy = (lv / (levels - 1)) * 2 - 1;\n      var py = midY - qy * ampScale;\n      ctx.beginPath();\n      ctx.moveTo(padL, py);\n      ctx.lineTo(W - padR, py);\n      ctx.stroke();\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(padL, padT);\n  ctx.lineTo(padL, H - padB);\n  ctx.moveTo(padL, midY);\n  ctx.lineTo(W - padR, midY);\n  ctx.stroke();\n\n  if (lab.values.showCont) {\n    ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var px = 0; px <= plotW; px += 2) {\n      var t = px / plotW;\n      var y = midY - signalFn(t) * ampScale;\n      if (px === 0) ctx.moveTo(padL + px, y);\n      else ctx.lineTo(padL + px, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  var maxErr = 0;\n  for (var i = 0; i < N; i++) {\n    var ti = i / N;\n    var tiNext = (i + 1) / N;\n    var raw = signalFn(ti);\n    var qIdx = Math.round(((raw + 1) / 2) * (levels - 1));\n    var qVal = (qIdx / (levels - 1)) * 2 - 1;\n    var err = Math.abs(raw - qVal);\n    if (err > maxErr) maxErr = err;\n    var x1 = padL + ti * plotW;\n    var x2 = padL + tiNext * plotW;\n    var yq = midY - qVal * ampScale;\n    if (i === 0) ctx.moveTo(x1, yq);\n    else ctx.lineTo(x1, yq);\n    ctx.lineTo(x2, yq);\n  }\n  ctx.stroke();\n\n  for (var j = 0; j < N; j++) {\n    var tj = j / N;\n    var rj = signalFn(tj);\n    var qjIdx = Math.round(((rj + 1) / 2) * (levels - 1));\n    var qjVal = (qjIdx / (levels - 1)) * 2 - 1;\n    var xj = padL + tj * plotW;\n    var yj = midY - qjVal * ampScale;\n    ctx.strokeStyle = 'rgba(16,185,129,0.35)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(xj, midY);\n    ctx.lineTo(xj, yj);\n    ctx.stroke();\n\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath();\n    ctx.arc(xj, yj, N > 60 ? 2.5 : 3.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillText('+1', padL - 8, midY - ampScale + 4);\n  ctx.fillText('0', padL - 8, midY + 4);\n  ctx.fillText('-1', padL - 8, midY + ampScale + 4);\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('Sample number (i = 0 .. ' + (N - 1) + ')', padL + plotW / 2, H - 10);\n\n  lab.setReadout('采样总数 N = ' + N + ' | 量化级数 = 2^' + bits + ' = ' + levels + ' 级 | 实测最大量化误差 = ' + maxErr.toFixed(3));\n}\n\nlab.onUpdate(function() {\n  draw();\n  syncAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "纵轴、横轴的别名体系与核心概念「域 (Domain)」",
      "paragraphs": [
        "在不确定信号具体物理量（电压、光强、声压等）时，纵轴通常采用通用标签 **幅度（Amplitude）**。它在数学和工程中还有一组等价叫法：**y 轴（y-axis）**、**因变量（dependent variable）**、**值域（range）** 以及 **纵坐标（ordinate）**。",
        "横轴则代表信号的另一个参数，常见名称包括：**x 轴（x-axis）**、**自变量（independent variable）**、**定义域（domain）** 以及 **横坐标（abscissa）**。对于采集到的离散信号，最通用的横轴标签是 **采样序号（sample number）**；如果是连续信号，则必须明确写成 `time`（时间）、`distance`（距离）或 `x` 等。",
        "两个参数 **不可互换**：纵轴是横轴的 **函数（function）**。自变量描述的是每个点「何时」或「如何」采集，因变量则是「实际测得的数值」。给定横轴上的某一点，总能唯一找到纵轴上的值，但反过来通常不行。",
        "DSP 中极高频出现的一个词是 **域（Domain）**——说白了，**横轴是什么物理参数，信号就处于什么域**。横轴是时间，就是 **时域（time domain）**；横轴是频率，就是 **频域（frequency domain）**；横轴是空间距离（如地球物理学家沿地表等间距测量岩石密度），就是 **空间域（spatial domain）**。如果横轴只标着泛泛的 `sample number`，作者通常也会把它归为时域，因为等时间间隔采样是最常见的数据获取方式。"
      ],
      "formula": {
        "expr": "y = f(x)   ⇒   Amplitude = f(Domain)",
        "explain": "因变量（幅度）是自变量（域）的函数；只要确认横轴参数的类型，就能立刻确定信号所在的域。"
      }
    },
    {
      "type": "concept",
      "heading": "图表绘制的视觉错觉与 0-based 索引警报",
      "paragraphs": [
        "看图时有一个极易上当的习惯：**把画成连续折线的图当成连续信号**。当信号的采样点数很多时（例如原书图 2-1 中 `N = 512`），把 512 个点全部画成圆点会糊成一团，因此插画师往往直接画成连续曲线；而在点数较少（比如少于 100 点）的图中，通常会画出独立的圆点，至于点与点之间是否连线，完全取决于作者想让你关注采样点之间可能的变化趋势，还是仅帮你看清噪声数据的走向。**判断信号是离散还是连续，必须看横轴标签，绝对不能靠图上有没有画圆点！**",
        "另一个在代码与公式对接时让人抓狂的坑是 **采样索引（sample number / index）的起点**。DSP 中通常用大写字母 `N` 表示信号的总采样点数（例如 `N = 512`）。给这些采样点编号时，学术界和工程界存在两种惯例：数学家习惯从 `1` 编到 `N`（即 `1` 到 `512`），而 DSP 工程师及计算机科学普遍习惯从 `0` 编到 `N - 1`（即 `0` 到 `511`）。本书及绝大多数工程代码严格采用 `0 到 N - 1`，务必时刻保持警惕！"
      ],
      "formula": {
        "expr": "i ∈ {0, 1, 2, ..., N - 1}",
        "explain": "N 为信号总采样点数（如 N = 512）；i 为每个采样点的索引（sample number / index）。在 DSP 惯例中，第一个样本是 x[0]，最后一个样本是 x[N - 1]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：图表视觉错觉与采样索引检查器",
      "instruction": "把 N 调大到 256 以上并关闭「显示离散圆点」，观察离散信号如何「伪装」成连续曲线；切换索引惯例观察同一物理采样点的编号变化。",
      "controls": [
        {
          "type": "slider",
          "id": "nSamples",
          "label": "总采样点数 N",
          "min": 16,
          "max": 512,
          "step": 16,
          "value": 48,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "connectLines",
          "label": "用折线连接采样点",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showDots",
          "label": "显示离散圆点标记",
          "value": true
        },
        {
          "type": "toggle",
          "id": "zeroBased",
          "label": "DSP 索引惯例 (0 ~ N-1)",
          "value": true
        },
        {
          "type": "slider",
          "id": "probePct",
          "label": "探针采样位置",
          "min": 0,
          "max": 100,
          "step": 1,
          "value": 25,
          "unit": "%"
        }
      ],
      "jsCode": "function sampleVal(i, N) {\n  var t = i / N;\n  var base = 0.55 * Math.sin(2 * Math.PI * 3 * t) + 0.25 * Math.cos(2 * Math.PI * 7 * t);\n  var pseudoNoise = 0.16 * Math.sin(i * 19.73 + 0.5) * Math.cos(i * 7.11);\n  return base + pseudoNoise;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var padL = 56, padR = 24, padT = 26, padB = 38;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var midY = padT + plotH / 2;\n  var ampScale = plotH * 0.42;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = padT + (plotH * g) / 4;\n    ctx.beginPath();\n    ctx.moveTo(padL, gy);\n    ctx.lineTo(W - padR, gy);\n    ctx.stroke();\n  }\n  for (var gx = 0; gx <= 8; gx++) {\n    var vx = padL + (plotW * gx) / 8;\n    ctx.beginPath();\n    ctx.moveTo(vx, padT);\n    ctx.lineTo(vx, H - padB);\n    ctx.stroke();\n  }\n\n  var N = lab.values.nSamples;\n  var connect = lab.values.connectLines;\n  var dots = lab.values.showDots;\n  var zeroBased = lab.values.zeroBased;\n\n  if (connect) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = N > 200 ? 1.3 : 1.8;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var x = padL + (i / (N - 1)) * plotW;\n      var y = midY - sampleVal(i, N) * ampScale;\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  if (dots) {\n    ctx.fillStyle = '#10b981';\n    var radius = N <= 64 ? 3.5 : (N <= 160 ? 2.2 : 1.4);\n    for (var j = 0; j < N; j++) {\n      var xj = padL + (j / (N - 1)) * plotW;\n      var yj = midY - sampleVal(j, N) * ampScale;\n      if (!connect) {\n        ctx.strokeStyle = 'rgba(16,185,129,0.35)';\n        ctx.lineWidth = 1;\n        ctx.beginPath();\n        ctx.moveTo(xj, midY);\n        ctx.lineTo(xj, yj);\n        ctx.stroke();\n      }\n      ctx.beginPath();\n      ctx.arc(xj, yj, radius, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  var k = Math.min(N - 1, Math.round((lab.values.probePct / 100) * (N - 1)));\n  var kx = padL + (k / (N - 1)) * plotW;\n  var kv = sampleVal(k, N);\n  var ky = midY - kv * ampScale;\n  var dispIdx = zeroBased ? k : (k + 1);\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(kx, padT);\n  ctx.lineTo(kx, H - padB);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath();\n  ctx.arc(kx, ky, 5, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  for (var t = 0; t <= 4; t++) {\n    var rawIdx = Math.round(((N - 1) * t) / 4);\n    var lbl = zeroBased ? rawIdx : (rawIdx + 1);\n    var tx = padL + (rawIdx / (N - 1)) * plotW;\n    ctx.fillText(String(lbl), tx, H - padB + 15);\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('Sample number (' + (zeroBased ? '0 to ' + (N - 1) : '1 to ' + N) + ')', padL + plotW / 2, H - 6);\n\n  ctx.save();\n  ctx.translate(16, padT + plotH / 2);\n  ctx.rotate(-Math.PI / 2);\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'center';\n  ctx.fillText('Amplitude', 0, 0);\n  ctx.restore();\n\n  if (N >= 112 && connect && !dots) {\n    ctx.fillStyle = 'rgba(245,158,11,0.18)';\n    ctx.fillRect(padL + 8, padT + 4, 340, 20);\n    ctx.fillStyle = '#f59e0b';\n    ctx.textAlign = 'left';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('视觉伪装: 看起来像连续模拟线，但横轴仍是离散 Sample number!', padL + 14, padT + 18);\n  }\n\n  lab.setReadout('总点数 N = ' + N + ' | 索引范围: [' + (zeroBased ? 0 : 1) + ' .. ' + (zeroBased ? N - 1 : N) + '] | 探针: x[' + dispIdx + '] = ' + kv.toFixed(3) + ' (物理第 ' + (k + 1) + ' 个采样)');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "判别信号类型只看坐标轴，不看画法：当采样点数 N > 100 时，图表为了清晰常把离散信号画成连续折线。先读横轴标签（time 还是 sample number），再下结论。",
        "横轴定「域」，纵轴定「值」：x 轴（自变量/domain）决定信号在时域、频域还是空间域；y 轴（因变量/amplitude）是 x 轴的函数，两者通常不可逆推。",
        "严防 0-based 与 1-based 索引混淆：写 C/Python/DSP 算法时数组下标从 0 到 N-1（如 0~511），而数学公式或 MATLAB 默认从 1 到 N（如 1~512），跨语言移植代码时差 1 位（off-by-one）是最常见 Bug。"
      ]
    }
  ]
});
