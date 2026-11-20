window.__BOOK_REGISTER_SECTION__("sec_231", {
  "title": "级联与并联滤波器合并（Cascade and Parallel Stages）",
  "intuition": "把复杂高阶递归滤波器拆成低阶“积木块”（级联或并联），在 z 域用多项式乘法或通分相加合并后再还原成单一递推公式，从而彻底绕开噩梦级的直接设计。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、为什么要“分阶段”设计递归滤波器？",
      "paragraphs": [
        "在工程上，直接设计一个 4 阶甚至 8 阶的复杂递归滤波器（比如带通或带阻滤波器）非常困难——极点和零点的代数方程会瞬间膨胀到难以驾驭。因此，工程师通常会采用**模块化设计**：先把滤波器拆解成几个简单的低阶阶段（例如二阶节 **Biquad**，记为 `System 1` 和 `System 2`），分别设计好它们的递归系数 `a0, a1, a2, b1, b2` 与 `A0, A1, A2, B1, B2`，最后再把它们合二为一，变成等价的单一系统 `System 3`。",
        "两个子系统最常见的连接方式有两种：**级联（Cascade）**与**并联（Parallel）**。例如，把一个低通滤波器和一个高通滤波器**级联**（串联），只有两者都放行的中间频段能通过，自然就形成了一个**带通滤波器（Band-Pass）**；而如果把它们**并联**后将输出相加，低频由低通放行、高频由高通放行，中间被双方同时拦住或相位抵消的频段就会凹陷下去，从而形成一个**带阻滤波器（Band-Reject）**。",
        "为什么在 z 域里合并这么简单？因为和频域完全一致：**系统级联对应传递函数相乘，系统并联对应传递函数相加**。我们只需要把两套递归系数送进 z 域，做一次多项式乘法或分式加法，再把结果拉回时域，就得到了合体后的单一递归系统 `System 3`。"
      ],
      "formula": {
        "expr": "级联: H3[z] = H1[z] · H2[z]    |    并联: H3[z] = H1[z] + H2[z]",
        "explain": "H1[z] 和 H2[z] 分别是 System 1 与 System 2 的 z 域传递函数（分子除以分母的多项式分式）；H3[z] 是合并后 System 3 的总传递函数。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：级联（带通）与并联（带阻）的频响合成与听感对比",
      "instruction": "切换「级联 / 并联」开关并拖动两级截止频率滑块，观察青绿色合成曲线 H3[z] 的形态变化，可点击播放实时对比声音滤波效果。",
      "controls": [
        {
          "type": "toggle",
          "id": "parallel",
          "label": "并联模式（关：级联带通 / 开：并联带阻）",
          "value": false
        },
        {
          "type": "slider",
          "id": "fc1",
          "label": "Stage 1 低通截止 fc1",
          "min": 200,
          "max": 3200,
          "step": 50,
          "value": 1600,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "fc2",
          "label": "Stage 2 高通截止 fc2",
          "min": 200,
          "max": 3200,
          "step": 50,
          "value": 500,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar audioNode = null;\nvar gainNode = null;\nvar activeA = [1, 0, 0, 0, 0];\nvar activeB = [0, 0, 0, 0, 0];\nvar xHist = [0, 0, 0, 0, 0];\nvar yHist = [0, 0, 0, 0, 0];\nvar phase = 0;\n\nfunction designBiquad(kind, fc, fs) {\n  var safeFc = Math.min(fc, fs * 0.45);\n  var K = Math.tan(Math.PI * safeFc / fs);\n  var K2 = K * K;\n  var norm = 1 / (1 + Math.SQRT2 * K + K2);\n  var a0, a1, a2;\n  if (kind === 'lp') {\n    a0 = K2 * norm;\n    a1 = 2 * a0;\n    a2 = a0;\n  } else {\n    a0 = norm;\n    a1 = -2 * norm;\n    a2 = norm;\n  }\n  var b1 = -2 * (K2 - 1) * norm;\n  var b2 = -(1 - Math.SQRT2 * K + K2) * norm;\n  return { A: [a0, a1, a2], B: [0, b1, b2] };\n}\n\nfunction combineStages(s1, s2, isParallel) {\n  var A1 = s1.A.slice(), B1 = s1.B.slice();\n  var A2 = s2.A.slice(), B2 = s2.B.slice();\n  for (var i = 0; i <= 2; i++) {\n    B1[i] = -B1[i];\n    B2[i] = -B2[i];\n  }\n  B1[0] = 1;\n  B2[0] = 1;\n  var A3 = [0, 0, 0, 0, 0];\n  var B3 = [0, 0, 0, 0, 0];\n  for (var i = 0; i <= 4; i++) {\n    for (var j = 0; j <= 2; j++) {\n      if (i - j < 0 || i - j > 2) continue;\n      if (!isParallel) {\n        A3[i] += A1[j] * A2[i - j];\n      } else {\n        A3[i] += A1[j] * B2[i - j] + A2[j] * B1[i - j];\n      }\n      B3[i] += B1[j] * B2[i - j];\n    }\n  }\n  for (var i = 0; i <= 4; i++) B3[i] = -B3[i];\n  B3[0] = 0;\n  return { A: A3, B: B3 };\n}\n\nfunction evalMag(A, B, f, fs) {\n  var w = 2 * Math.PI * f / fs;\n  var nr = 0, ni = 0, dr = 1, di = 0;\n  for (var k = 0; k < A.length; k++) {\n    var c = Math.cos(k * w);\n    var s = Math.sin(k * w);\n    nr += A[k] * c;\n    ni -= A[k] * s;\n    if (k > 0) {\n      dr -= B[k] * c;\n      di += B[k] * s;\n    }\n  }\n  var den = Math.hypot(dr, di);\n  return den > 1e-9 ? Math.hypot(nr, ni) / den : 0;\n}\n\nfunction syncAudio() {\n  var wantPlay = !!lab.values.play;\n  if (wantPlay && !audioNode) {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    var s1a = designBiquad('lp', lab.values.fc1, ac.sampleRate);\n    var s2a = designBiquad('hp', lab.values.fc2, ac.sampleRate);\n    var s3a = combineStages(s1a, s2a, !!lab.values.parallel);\n    activeA = s3a.A;\n    activeB = s3a.B;\n    audioNode = ac.createScriptProcessor(1024, 0, 1);\n    gainNode = ac.createGain();\n    gainNode.gain.value = 0.22;\n    audioNode.onaudioprocess = function(e) {\n      var out = e.outputBuffer.getChannelData(0);\n      var sr = ac.sampleRate;\n      for (var i = 0; i < out.length; i++) {\n        phase += 110 / sr;\n        if (phase >= 1) phase -= 1;\n        var saw = (2 * phase - 1) * 0.38;\n        var noise = (Math.random() * 2 - 1) * 0.35;\n        xHist[0] = saw + noise;\n        var y = activeA[0]*xHist[0] + activeA[1]*xHist[1] + activeA[2]*xHist[2] + activeA[3]*xHist[3] + activeA[4]*xHist[4]\n              + activeB[1]*yHist[1] + activeB[2]*yHist[2] + activeB[3]*yHist[3] + activeB[4]*yHist[4];\n        if (!isFinite(y)) y = 0;\n        y = Math.max(-1.5, Math.min(1.5, y));\n        yHist[0] = y;\n        for (var k = 4; k >= 1; k--) {\n          xHist[k] = xHist[k - 1];\n          yHist[k] = yHist[k - 1];\n        }\n        out[i] = y;\n      }\n    };\n    audioNode.connect(gainNode);\n    gainNode.connect(ac.destination);\n  } else if (wantPlay && audioNode) {\n    var ac2 = lab.getAudioContext();\n    var s1b = designBiquad('lp', lab.values.fc1, ac2.sampleRate);\n    var s2b = designBiquad('hp', lab.values.fc2, ac2.sampleRate);\n    var s3b = combineStages(s1b, s2b, !!lab.values.parallel);\n    activeA = s3b.A;\n    activeB = s3b.B;\n  } else if (!wantPlay && audioNode) {\n    audioNode.disconnect();\n    gainNode.disconnect();\n    audioNode = null;\n    gainNode = null;\n    xHist = [0, 0, 0, 0, 0];\n    yHist = [0, 0, 0, 0, 0];\n  }\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  var isPar = !!lab.values.parallel;\n  var fc1 = lab.values.fc1;\n  var fc2 = lab.values.fc2;\n  var fsPlot = 8000;\n  var s1 = designBiquad('lp', fc1, fsPlot);\n  var s2 = designBiquad('hp', fc2, fsPlot);\n  var s3 = combineStages(s1, s2, isPar);\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 46, padR = 20, padT = 28, padB = 30;\n  var pw = W - padL - padR;\n  var ph = H - padT - padB;\n  var fMax = 4000;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = padT + ph * (1 - g / 4);\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + pw, gy); ctx.stroke();\n  }\n  for (var fx = 0; fx <= fMax; fx += 500) {\n    var gx = padL + (fx / fMax) * pw;\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + ph); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '11px monospace';\n    ctx.fillText(fx + '', gx - 12, H - 10);\n  }\n\n  var y1 = padT + ph * (1 - 1 / 1.25);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(padL, y1); ctx.lineTo(padL + pw, y1); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '11px monospace';\n  ctx.fillText('1.0', 14, y1 + 4);\n  ctx.fillText('0.0', 14, padT + ph + 4);\n\n  function drawCurve(A, B, color, width, dashed, fill) {\n    ctx.save();\n    if (dashed) ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    ctx.beginPath();\n    var N = 220;\n    for (var i = 0; i <= N; i++) {\n      var f = (i / N) * (fMax * 0.98);\n      var m = Math.min(1.25, evalMag(A, B, f, fsPlot));\n      var px = padL + (f / fMax) * pw;\n      var py = padT + ph * (1 - m / 1.25);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    if (fill) {\n      ctx.lineTo(padL + pw * 0.98, padT + ph);\n      ctx.lineTo(padL, padT + ph);\n      ctx.closePath();\n      ctx.fillStyle = fill;\n      ctx.fill();\n    }\n    ctx.restore();\n  }\n\n  drawCurve(s1.A, s1.B, '#f59e0b', 1.5, true, null);\n  drawCurve(s2.A, s2.B, '#38bdf8', 1.5, true, null);\n  drawCurve(s3.A, s3.B, isPar ? '#ec4899' : '#10b981', 3, false, isPar ? 'rgba(236,72,153,0.14)' : 'rgba(16,185,129,0.16)');\n\n  var xFc1 = padL + (fc1 / fMax) * pw;\n  var xFc2 = padL + (fc2 / fMax) * pw;\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(xFc1 - 1, padT, 2, ph);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(xFc2 - 1, padT, 2, ph);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('--- H1 低通 (' + fc1 + 'Hz)', padL + 8, 17);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('--- H2 高通 (' + fc2 + 'Hz)', padL + 160, 17);\n  ctx.fillStyle = isPar ? '#ec4899' : '#10b981';\n  ctx.fillText(isPar ? '━━ H3 并联合成 (带阻特性)' : '━━ H3 级联合成 (带通特性)', padL + 320, 17);\n\n  lab.setReadout((isPar ? '[并联 Band-Reject]' : '[级联 Band-Pass]') + '  fc1=' + fc1 + 'Hz, fc2=' + fc2 + 'Hz  |  System 3 (4阶) a0=' + s3.A[0].toFixed(3) + ', b1=' + s3.B[1].toFixed(3) + ', b4=' + s3.B[4].toFixed(3));\n});"
    },
    {
      "type": "concept",
      "heading": "二、两个二阶节（Biquad）级联的 z 域代数展开",
      "paragraphs": [
        "为了看清系数是怎么“合体”的，我们先用最常见的二阶节（Biquad）级联来手工推导一遍。按照 z 变换传递函数标准形式（Eq. 33-3），`System 1` 和 `System 2` 的传递函数各自是一个分子分母均为二阶的多项式分式。把它们级联起来，就是直接将两个分式相乘。",
        "相乘之后，分子和分母都会从 2 阶升到 4 阶。注意看分母的符号变化：`1 - b1·z^-1 - b2·z^-2` 与 `1 - B1·z^-1 - B2·z^-2` 相乘时，`z^-2` 项除了 `b2` 和 `B2`，还会多出两个负号相乘产生的交叉项 `(+b1·B1)·z^-2`。因为最终标准型要求分母写成 `1 - (b1_new)·z^-1 - (b2_new)·z^-2 ...` 的减号形式，所以提取出来的新递归系数 `b2` 就变成了 `b2 + B2 - b1·B1`（注意这里是减去 `b1·B1`）。",
        "手工推导两级二阶节就已经写出这么多交叉项了，如果把 4 个 4 阶阶段拼成 16 阶滤波器，手算代数几乎必然出错。好在 Steven Smith 指出：这段繁琐的代数其实隐藏着一个极其优雅的规律——**多项式相乘，等价于它们的系数数组做卷积！**"
      ],
      "formula": {
        "expr": "a0=a0·A0, a1=a0·A1+a1·A0, ..., b1=b1+B1, b2=b2+B2-b1·B1, b3=-b1·B2-b2·B1, b4=-b2·B2",
        "explain": "两个二阶节级联成四阶系统 System 3 后的完整递归系数映射关系，左边为合并后的新系数，右边为原两级系数。"
      }
    },
    {
      "type": "concept",
      "heading": "三、表 33-1 的程序魔法：仅差一行代码的通用合并算法",
      "paragraphs": [
        "基于“多项式乘法 = 系数卷积”的洞察，表 33-1 用不到 35 行代码就同时搞定了**级联**和**并联**两种合并（最高支持两个 8 阶阶段合并成 16 阶），其核心流程只有干净利落的三步：",
        "**第一步：递归系数转入 z 域（行 220–270）**。先把输入的 `B1[]` 和 `B2[]` 数组全部取反（对应传递函数分母中的减号 `-b_k`），再强制把第 0 项置为 `B1[0] = 1`、`B2[0] = 1`（代表分母里的常数 `1`）。这一步之后，`A1[], B1[]` 和 `A2[], B2[]` 就彻底变成了纯正的多项式系数数组。",
        "**第二步：多项式卷积合并（行 290–380）**。无论是级联还是并联，新系统的**分母永远是两个旧分母相乘**，即直接对 `B1[]` 和 `B2[]` 做卷积（行 360）。而分子只差一行代码：如果是级联（`CP% = 0`），直接卷积两个分子 `A1[] * A2[]`（行 340）；如果是并联（`CP% = 1`），遵循小学学过的分数加法通分法则 `w/x + y/z = (w·z + x·y) / (x·z)`，新分子就是两组交叉卷积之和 `A1[] * B2[] + A2[] * B1[]`（行 350）。",
        "**第三步：移回时域递推系数（行 400–430）**。把算好的分母数组 `B3[]` 全部取反，并强制把 `B3[0] = 0` 清零（因为时域递推公式中，当前输出 `y[n]` 不能依赖它自己！）。此时 `A3[]` 和 `B3[]` 就已经可以直接用于滤波计算了。"
      ],
      "formula": {
        "expr": "行340(级联): A3 = A1 * A2  |  行350(并联): A3 = A1 * B2 + A2 * B1  |  行360(通用分母): B3 = B1 * B2",
        "explain": "这里的星号 * 代表数组卷积（Convolution）。级联与并联算法在代码实现上唯一的区别，仅仅是分子的这第 340 行与第 350 行。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：表 33-1 多项式卷积透视镜与脉冲响应演化",
      "instruction": "切换 CP% 开关或拖动阶段系数，实时观察中间数组如何取反、卷积，以及右侧合并后 System 3 的时域脉冲响应 h3[n] 如何变化。",
      "controls": [
        {
          "type": "toggle",
          "id": "parallel",
          "label": "CP% 模式（关：0 级联 Line 340 / 开：1 并联 Line 350）",
          "value": false
        },
        {
          "type": "slider",
          "id": "a1",
          "label": "Stage 1 分子系数 a1",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "b1",
          "label": "Stage 1 递归系数 b1",
          "min": -0.85,
          "max": 0.85,
          "step": 0.05,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "B1",
          "label": "Stage 2 递归系数 B1",
          "min": -0.85,
          "max": 0.85,
          "step": 0.05,
          "value": -0.5,
          "unit": ""
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction fmtArr(arr) {\n  return '[' + arr.map(function(v) { return (v >= 0 ? ' ' : '') + v.toFixed(2); }).join(',') + ']';\n}\n\nlab.onUpdate(function() {\n  var isPar = !!lab.values.parallel;\n  var A1 = [1.0, lab.values.a1, 0.0];\n  var B1_in = [0.0, lab.values.b1, -0.20];\n  var A2 = [1.0, -0.5, 0.0];\n  var B2_in = [0.0, lab.values.B1, -0.15];\n\n  var B1_tf = [1.0, -B1_in[1], -B1_in[2]];\n  var B2_tf = [1.0, -B2_in[1], -B2_in[2]];\n\n  var A3 = [0, 0, 0, 0, 0];\n  var B3_tf = [0, 0, 0, 0, 0];\n  for (var i = 0; i <= 4; i++) {\n    for (var j = 0; j <= 2; j++) {\n      if (i - j < 0 || i - j > 2) continue;\n      if (!isPar) {\n        A3[i] += A1[j] * A2[i - j];\n      } else {\n        A3[i] += A1[j] * B2_tf[i - j] + A2[j] * B1_tf[i - j];\n      }\n      B3_tf[i] += B1_tf[j] * B2_tf[i - j];\n    }\n  }\n  var B3 = [0, -B3_tf[1], -B3_tf[2], -B3_tf[3], -B3_tf[4]];\n\n  var N = 21;\n  var h = [];\n  var maxAbs = 1.0;\n  for (var n = 0; n < N; n++) {\n    var val = n < 5 ? A3[n] : 0;\n    for (var k = 1; k <= 4; k++) {\n      if (n - k >= 0) val += B3[k] * h[n - k];\n    }\n    h.push(val);\n    if (Math.abs(val) > maxAbs) maxAbs = Math.abs(val);\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath(); ctx.moveTo(435, 12); ctx.lineTo(435, H - 12); ctx.stroke();\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('1) 系数转传递函数 (Lines 220-270): B[i]=-B[i], B[0]=1', 14, 22);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('A1 = ' + fmtArr(A1), 14, 42);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('B1_tf = ' + fmtArr(B1_tf), 215, 42);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('A2 = ' + fmtArr(A2), 14, 60);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('B2_tf = ' + fmtArr(B2_tf), 215, 60);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = isPar ? '#ec4899' : '#10b981';\n  ctx.fillText(isPar ? '2) 并联通分 (Line 350): A3 = A1*B2 + A2*B1' : '2) 级联卷积 (Line 340): A3 = A1 * A2', 14, 92);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('   通用分母 (Line 360): B3_tf = B1_tf * B2_tf', 14, 110);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('3) 转回 System 3 递推系数 (Lines 400-430):', 14, 142);\n  ctx.font = '11.5px monospace';\n  ctx.fillStyle = isPar ? '#ec4899' : '#10b981';\n  ctx.fillText('A3 = ' + fmtArr(A3), 14, 166);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('B3 = ' + fmtArr(B3), 14, 188);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('注: B3[0] 已强制置 0 (消去自反馈项)', 14, 214);\n\n  var px0 = 458, pw = 246, py0 = 28, ph = 186;\n  var yZero = py0 + ph / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath(); ctx.moveTo(px0, py0); ctx.lineTo(px0 + pw, py0); ctx.moveTo(px0, py0 + ph); ctx.lineTo(px0 + pw, py0 + ph); ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(px0, yZero); ctx.lineTo(px0 + pw, yZero); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('System 3 脉冲响应 h3[n] (n=0..20)', px0, 18);\n\n  var stemColor = isPar ? '#ec4899' : '#10b981';\n  for (var n = 0; n < N; n++) {\n    var sx = px0 + (n / (N - 1)) * pw;\n    var sy = yZero - (h[n] / (maxAbs * 1.1)) * (ph / 2);\n    ctx.strokeStyle = stemColor;\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(sx, yZero); ctx.lineTo(sx, sy); ctx.stroke();\n    ctx.fillStyle = stemColor;\n    ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, Math.PI * 2); ctx.fill();\n  }\n\n  lab.setReadout((isPar ? 'CP%=1 (并联): ' : 'CP%=0 (级联): ') + 'A3=' + fmtArr(A3) + ' | B3=' + fmtArr(B3));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【符号与第 0 项最易踩坑】：递推系数 `b_k` 搬进 z 域分母时必须全盘取反且令 `B[0] = 1`；算完卷积回到递推系数时必须再次取反，并强制令 `B3[0] = 0`，否则系统会出现非因果/自引用错误。",
        "【一行代码决定拓扑结构】：级联与并联合并时分母永远是 `B1 * B2`；唯有分子不同——级联直接卷积 `A1 * A2`，并联按分数通分做交叉卷积 `A1 * B2 + A2 * B1`。",
        "【高阶合并的数值精度警示】：虽然这套程序能把多级合并成单一高阶系统，但在实际定点或单精度浮点硬件中，阶数越高，极点对系数的微小舍入误差越敏感（甚至可能飘出单位圆导致振荡）。工程上常用此法分析低阶合并或解析表达式，而在实际实时运算中，通常仍保持二阶节（Biquad）逐级级联运行。"
      ]
    }
  ]
});
