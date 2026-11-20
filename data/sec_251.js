window.__BOOK_REGISTER_SECTION__("sec_251", {
  "title": "信号处理的威力：破解本福特定律与现实应用 (The Power of Signal Processing)",
  "intuition": "传统纯数学在繁琐推导中迷失了方向，而信号处理（DSP）把数字分布映射到对数轴并做周期折叠，一举看穿了“跨越多个数量级”的本质，并直接用于揪出财务造假。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么传统数学碰壁，而 DSP 却能降维打击？",
      "paragraphs": [
        "在数学史上，**本福特定律（Benford's Law）** 从未被视为世纪大难题，而更像一个令人着迷的小谜题：为什么自然界和经济统计中，以 `1` 开头的数字高达约 30.1%，而以 `9` 开头的数字却只有约 4.6%？无数聪明的数学家试图从数论、测度论或公理化不变性出发硬算，却往往陷入极其晦涩的数学推导中。",
        "本书第 34 章的核心目的，正是展示 **数字信号处理（DSP）在非传统领域的惊人威力**。DSP 工程师看这个问题完全不需要硬碰数论：只要对数据取以 10 为底的对数 `u = log10(x)`，把分布看成对数轴上的一个连续“信号波形”，再考察它的小数部分 `u mod 1`（对应首位数字）。",
        "在信号处理的视角下，对数轴上取小数部分 `mod 1`，等价于把宽广的对数信号按周期 `1` 切段并**周期叠加（卷绕 / 混叠）**。只要原始分布足够宽、平滑地跨越了好几个数量级（即对数信号带宽很窄、高频分量极少），周期叠加后所有高低起伏就会互相抵消，变成一条平坦的均匀分布——于是首位数字自然严格服从对数间隔公式！"
      ],
      "formula": {
        "expr": "P(d) = log10(1 + 1/d),  d ∈ {1, 2, ..., 9}",
        "explain": "P(d) 是首位数字为 d 的出现概率；当 log10(x) 的小数部分在 [0, 1) 区间上均匀分布时，首位数字 d 对应的区间长度恰好是 log10(d+1) - log10(d) = log10(1 + 1/d)。"
      }
    },
    {
      "type": "concept",
      "heading": "1976 年 Raimi 的经典乌龙：尺度缩放 vs 跨越数量级",
      "paragraphs": [
        "传统数学方法在这件事上的无力感，在数学家 **Ralph Raimi** 于 1976 年发表的里程碑式综述论文中体现得淋漓尽致。他在文中用极其详尽的数学细节梳理了前人的各种理论，并在字里行间顺带提到了一句关键评价：“……许多学者含糊地指出，当分布**跨越多个数量级（covers several orders of magnitude）**时，本福特定律成立得更好。”",
        "正如我们通过信号处理视角所确认的，**这正是本福特定律得以成立的真正根源**！然而极具戏剧性的是，Raimi 当时因为一个微小的逻辑失误，反而论证这一说法不可能是正确的——他把“对分布做尺度缩放（Scaling）”和“分布跨越多少个数量级”混为一谈了。",
        "用 DSP 的对数坐标思维一眼就能看穿这个误区：把数据集所有数字乘以一个常数 `c`（尺度缩放 `x → c·x`），在对数轴上就是 `log10(c·x) = log10(c) + log10(x)`。这仅仅是把整个信号波形**整体左右平移**了一段距离 `log10(c)`，信号本身的**跨度（带宽/覆盖的数量级数量）丝毫没有改变**！只有真正拉宽分布的动态范围，才能让 `mod 1` 卷绕结果稳定收敛到本福特定律。"
      ],
      "formula": {
        "expr": "log10(c · x) = log10(c) + log10(x)",
        "explain": "c 为任意正数缩放倍率，x 为原始数据。乘以 c 在对数轴上只是平移偏移量 log10(c)，绝不会改变分布的宽度（标准差 σ），也就不会改变它跨越了多少个数量级。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：对数信号跨越数量级 vs 尺度缩放平移",
      "instruction": "先保持跨度 σ 较小（如 0.35），拖动“尺度缩放平移”观察右侧首位数字柱状图如何剧烈摇摆；再将跨度 σ 拉大到 1.5 以上，体会无论怎么缩放平移，分布都稳如磐石。",
      "controls": [
        {
          "type": "slider",
          "id": "span",
          "label": "跨越数量级宽度 (σ)",
          "min": 0.1,
          "max": 2.5,
          "step": 0.05,
          "value": 0.35,
          "unit": " dec"
        },
        {
          "type": "slider",
          "id": "shift",
          "label": "尺度缩放平移 log10(c)",
          "min": -1,
          "max": 1,
          "step": 0.05,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showWrap",
          "label": "显示模 1 周期卷绕结果 (绿线)",
          "value": true
        }
      ],
      "jsCode": "(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var benford = [];\n  for (var d = 1; d <= 9; d++) {\n    benford[d] = Math.log10(1 + 1 / d);\n  }\n  function gauss(u, mu, sigma) {\n    var z = (u - mu) / sigma;\n    return Math.exp(-0.5 * z * z) / (Math.sqrt(2 * Math.PI) * sigma);\n  }\n  function wrappedPdf(v, mu, sigma) {\n    var sum = 0;\n    for (var k = -15; k <= 15; k++) {\n      sum += gauss(v + k, mu, sigma);\n    }\n    return sum;\n  }\n  function render() {\n    var sigma = lab.values.span;\n    var mu = lab.values.shift;\n    var showWrap = lab.values.showWrap;\n    ctx.clearRect(0, 0, W, H);\n    ctx.fillStyle = '#0b1120';\n    ctx.fillRect(0, 0, W, H);\n\n    var lx0 = 38, ly0 = 28, lw = 316, lh = 176;\n    var uMin = -3, uMax = 3;\n    var yMax = 1.8;\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var u = -3; u <= 3; u++) {\n      var gx = lx0 + ((u - uMin) / (uMax - uMin)) * lw;\n      ctx.beginPath();\n      ctx.moveTo(gx, ly0);\n      ctx.lineTo(gx, ly0 + lh);\n      ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.font = '10px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText(String(u), gx, ly0 + lh + 13);\n    }\n    for (var py = 0; py <= 1.5; py += 0.5) {\n      var gy = ly0 + lh - (py / yMax) * lh;\n      ctx.beginPath();\n      ctx.moveTo(lx0, gy);\n      ctx.lineTo(lx0 + lw, gy);\n      ctx.stroke();\n    }\n\n    var xUnit0 = lx0 + ((0 - uMin) / (uMax - uMin)) * lw;\n    var xUnit1 = lx0 + ((1 - uMin) / (uMax - uMin)) * lw;\n    ctx.fillStyle = 'rgba(16,185,129,0.10)';\n    ctx.fillRect(xUnit0, ly0, xUnit1 - xUnit0, lh);\n\n    if (showWrap) {\n      var yOne = ly0 + lh - (1.0 / yMax) * lh;\n      ctx.save();\n      ctx.setLineDash([4, 4]);\n      ctx.strokeStyle = 'rgba(245,158,11,0.7)';\n      ctx.beginPath();\n      ctx.moveTo(xUnit0, yOne);\n      ctx.lineTo(xUnit1, yOne);\n      ctx.stroke();\n      ctx.restore();\n\n      ctx.beginPath();\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2.5;\n      for (var i = 0; i <= 60; i++) {\n        var v = i / 60;\n        var val = wrappedPdf(v, mu, sigma);\n        var px = xUnit0 + v * (xUnit1 - xUnit0);\n        var pyVal = ly0 + lh - Math.min(val / yMax, 1.0) * lh;\n        if (i === 0) ctx.moveTo(px, pyVal);\n        else ctx.lineTo(px, pyVal);\n      }\n      ctx.stroke();\n    }\n\n    ctx.beginPath();\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    var steps = 180;\n    for (var s = 0; s <= steps; s++) {\n      var uVal = uMin + (s / steps) * (uMax - uMin);\n      var pdfVal = gauss(uVal, mu, sigma);\n      var sx = lx0 + (s / steps) * lw;\n      var sy = ly0 + lh - Math.min(pdfVal / yMax, 1.0) * lh;\n      if (s === 0) ctx.moveTo(sx, sy);\n      else ctx.lineTo(sx, sy);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('对数轴分布 log10(x)（蓝=原信号 / 绿=模1卷绕）', lx0, 18);\n\n    var rx0 = 398, ry0 = 28, rw = 296, rh = 176;\n    var pMax = 0.55;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var r = 0.1; r <= 0.5; r += 0.1) {\n      var rgy = ry0 + rh - (r / pMax) * rh;\n      ctx.beginPath();\n      ctx.moveTo(rx0, rgy);\n      ctx.lineTo(rx0 + rw, rgy);\n      ctx.stroke();\n    }\n\n    var probs = [];\n    var maxErr = 0;\n    var subSteps = 20;\n    for (var d = 1; d <= 9; d++) {\n      var a = Math.log10(d);\n      var b = Math.log10(d + 1);\n      var dv = (b - a) / subSteps;\n      var area = 0;\n      for (var m = 0; m < subSteps; m++) {\n        var mid = a + (m + 0.5) * dv;\n        area += wrappedPdf(mid, mu, sigma) * dv;\n      }\n      probs[d] = area;\n      var err = Math.abs(area - benford[d]);\n      if (err > maxErr) maxErr = err;\n    }\n\n    var barSlot = rw / 9;\n    var barW = barSlot * 0.62;\n    for (var d = 1; d <= 9; d++) {\n      var cx = rx0 + (d - 0.5) * barSlot;\n      var bh = Math.min(probs[d] / pMax, 1.0) * rh;\n      var diff = Math.abs(probs[d] - benford[d]);\n      ctx.fillStyle = diff < 0.015 ? '#10b981' : (diff < 0.05 ? '#38bdf8' : '#ec4899');\n      ctx.fillRect(cx - barW / 2, ry0 + rh - bh, barW, bh);\n      ctx.fillStyle = 'rgba(248,250,252,0.75)';\n      ctx.font = '11px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText(String(d), cx, ry0 + rh + 14);\n    }\n\n    ctx.beginPath();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    for (var d = 1; d <= 9; d++) {\n      var cx = rx0 + (d - 0.5) * barSlot;\n      var cy = ry0 + rh - (benford[d] / pMax) * rh;\n      if (d === 1) ctx.moveTo(cx, cy);\n      else ctx.lineTo(cx, cy);\n    }\n    ctx.stroke();\n    for (var d = 1; d <= 9; d++) {\n      var cx = rx0 + (d - 0.5) * barSlot;\n      var cy = ry0 + rh - (benford[d] / pMax) * lh;\n      cy = ry0 + rh - (benford[d] / pMax) * rh;\n      ctx.fillStyle = '#f59e0b';\n      ctx.beginPath();\n      ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('首位数字分布 vs 本福特理论曲线 (橙)', rx0, 18);\n\n    var scaleFactor = Math.pow(10, mu);\n    var status = maxErr < 0.01 ? '完美符合本福特定律' : (maxErr < 0.05 ? '近似符合（存在波纹）' : '严重偏离（受缩放位置影响剧烈）');\n    lab.setReadout('跨度 σ=' + sigma.toFixed(2) + ' dec | 缩放倍数 c=' + scaleFactor.toFixed(2) + 'x | 最大偏离=' + (maxErr * 100).toFixed(2) + '% | ' + status);\n  }\n  lab.onUpdate(render);\n})();"
    },
    {
      "type": "concept",
      "heading": "实战降维应用：财务报表与税务审计中的“造假探测器”",
      "paragraphs": [
        "本福特定律绝不只是书斋里的数学趣闻，它在现实世界中有着锋利的应用——**反欺诈与财务审计**。当你下一次填写个人所得税申报表或企业财务报告时，不妨想一想：如果有人为了避税或粉饰业绩而**人为编造**了部分账目数字，首位数字的分布会发生什么变化？",
        "真实的商业流水、发票金额、费用支出通常跨越多个数量级并由复杂的乘性增长形成，因此天然遵循本福特定律。但人类大脑在“凭空编数字”时存在根深蒂固的直觉偏差：人们要么以为各个首位数字应该差不多均匀出现（每个约 11.1%），要么下意识偏爱 `4, 5, 6` 这样看起来“稳妥、不起眼”的中间数字，同时严重低估以 `1` 开头的比例。",
        "于是，哪怕造假者小心翼翼地让总账平账，只要审计师或税务系统统计所有明细账目的首位数字分布，将其与本福特曲线做残差与卡方检验（`χ²`），人为捏造的假账就会像黑夜里的探照灯一样立刻现出原形！"
      ],
      "formula": {
        "expr": "χ² = Σ (O_d - E_d)² / E_d,  E_d = N · log10(1 + 1/d)",
        "explain": "O_d 为实际统计到首位数字 d 的账目笔数，E_d 为本福特定律预测的理论笔数，N 为总账目笔数。χ² 越大，说明账本越偏离自然规律，人为造假嫌疑越高。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：财务账目反欺诈审计台（含残差听诊）",
      "instruction": "拖动“人工伪造数据比例”向真实账本中掺入假数字，观察左右两图的分布偏离与 χ² 警报；开启声音听诊，对比纯正账本的和谐基音与假账诱发的刺耳不和谐泛音。",
      "controls": [
        {
          "type": "slider",
          "id": "fraudRatio",
          "label": "人工伪造数据比例",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "sampleCount",
          "label": "财务账目样本数 N",
          "min": 200,
          "max": 4000,
          "step": 200,
          "value": 2000,
          "unit": " 笔"
        },
        {
          "type": "toggle",
          "id": "midBias",
          "label": "造假习惯：偏好 4~6 中间数字（关闭=均匀瞎编）",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 音频听诊：本福特纯度音",
          "activeLabel": "⏸ 停止听诊"
        }
      ],
      "jsCode": "(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var benford = [];\n  for (var d = 1; d <= 9; d++) {\n    benford[d] = Math.log10(1 + 1 / d);\n  }\n  var midWeights = [0, 0.03, 0.07, 0.11, 0.19, 0.23, 0.18, 0.10, 0.06, 0.03];\n  var midCdf = [0];\n  for (var d = 1; d <= 9; d++) {\n    midCdf[d] = midCdf[d - 1] + midWeights[d];\n  }\n\n  var audioNodes = null;\n\n  function mulberry32(a) {\n    return function() {\n      var t = a += 0x6D2B79F5;\n      t = Math.imul(t ^ (t >>> 15), t | 1);\n      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n    };\n  }\n\n  function stopAudio() {\n    if (audioNodes) {\n      try {\n        audioNodes.oscBase.stop();\n        audioNodes.oscWarn.stop();\n        audioNodes.oscHigh.stop();\n        audioNodes.master.disconnect();\n      } catch (e) {}\n      audioNodes = null;\n    }\n  }\n\n  function syncAudio(rmsePct, chi2) {\n    var wantPlay = !!lab.values.play;\n    if (!wantPlay) {\n      stopAudio();\n      return;\n    }\n    var ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') {\n      ac.resume();\n    }\n    if (!audioNodes) {\n      var master = ac.createGain();\n      master.gain.value = 0.25;\n      master.connect(ac.destination);\n\n      var oscBase = ac.createOscillator();\n      oscBase.type = 'sine';\n      oscBase.frequency.value = 220;\n      var gBase = ac.createGain();\n      gBase.gain.value = 0.35;\n      oscBase.connect(gBase);\n      gBase.connect(master);\n\n      var oscWarn = ac.createOscillator();\n      oscWarn.type = 'sawtooth';\n      oscWarn.frequency.value = 311.13;\n      var gWarn = ac.createGain();\n      gWarn.gain.value = 0;\n      oscWarn.connect(gWarn);\n      gWarn.connect(master);\n\n      var oscHigh = ac.createOscillator();\n      oscHigh.type = 'triangle';\n      oscHigh.frequency.value = 698.46;\n      var gHigh = ac.createGain();\n      gHigh.gain.value = 0;\n      oscHigh.connect(gHigh);\n      gHigh.connect(master);\n\n      oscBase.start();\n      oscWarn.start();\n      oscHigh.start();\n      audioNodes = { master: master, oscBase: oscBase, oscWarn: oscWarn, oscHigh: oscHigh, gBase: gBase, gWarn: gWarn, gHigh: gHigh };\n    }\n    var warnAmt = Math.min(1, Math.max(0, (rmsePct - 1.0) / 6.0));\n    var highAmt = Math.min(1, Math.max(0, (chi2 - 20.0) / 120.0));\n    var now = ac.currentTime;\n    audioNodes.gWarn.gain.setTargetAtTime(warnAmt * 0.22, now, 0.04);\n    audioNodes.gHigh.gain.setTargetAtTime(highAmt * 0.16, now, 0.04);\n  }\n\n  function render() {\n    var fraudPct = lab.values.fraudRatio;\n    var N = lab.values.sampleCount;\n    var midBias = lab.values.midBias;\n\n    var rng = mulberry32(20250519);\n    var counts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];\n    for (var i = 0; i < N; i++) {\n      var rReal = rng();\n      var rFake = rng();\n      var isFake = ((i * 37) % 100) < fraudPct;\n      var digit = 1;\n      if (!isFake) {\n        digit = Math.floor(Math.pow(10, rReal));\n        if (digit < 1) digit = 1;\n        if (digit > 9) digit = 9;\n      } else {\n        if (midBias) {\n          for (var k = 1; k <= 9; k++) {\n            if (rFake <= midCdf[k]) {\n              digit = k;\n              break;\n            }\n          }\n        } else {\n          digit = 1 + Math.floor(rFake * 9);\n          if (digit > 9) digit = 9;\n        }\n      }\n      counts[digit]++;\n    }\n\n    var obs = [];\n    var sqErrSum = 0;\n    var chi2 = 0;\n    for (var d = 1; d <= 9; d++) {\n      obs[d] = counts[d] / N;\n      var diff = obs[d] - benford[d];\n      sqErrSum += diff * diff;\n      var expectedCnt = benford[d] * N;\n      chi2 += ((counts[d] - expectedCnt) * (counts[d] - expectedCnt)) / expectedCnt;\n    }\n    var rmsePct = Math.sqrt(sqErrSum / 9) * 100;\n\n    ctx.clearRect(0, 0, W, H);\n    ctx.fillStyle = '#0b1120';\n    ctx.fillRect(0, 0, W, H);\n\n    var lx0 = 42, ly0 = 30, lw = 380, lh = 174;\n    var pMax = 0.40;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var p = 0.1; p <= 0.4; p += 0.1) {\n      var gy = ly0 + lh - (p / pMax) * lh;\n      ctx.beginPath();\n      ctx.moveTo(lx0, gy);\n      ctx.lineTo(lx0 + lw, gy);\n      ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.5)';\n      ctx.font = '10px monospace';\n      ctx.textAlign = 'right';\n      ctx.fillText(Math.round(p * 100) + '%', lx0 - 6, gy + 3);\n    }\n\n    var slot = lw / 9;\n    var barW = slot * 0.58;\n    for (var d = 1; d <= 9; d++) {\n      var cx = lx0 + (d - 0.5) * slot;\n      var bh = Math.min(obs[d] / pMax, 1.0) * lh;\n      var absDiff = Math.abs(obs[d] - benford[d]);\n      ctx.fillStyle = absDiff < 0.015 ? '#38bdf8' : (absDiff < 0.04 ? '#f59e0b' : '#ec4899');\n      ctx.fillRect(cx - barW / 2, ly0 + lh - bh, barW, bh);\n      ctx.fillStyle = 'rgba(248,250,252,0.8)';\n      ctx.font = '11px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText(String(d), cx, ly0 + lh + 14);\n    }\n\n    ctx.beginPath();\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.2;\n    for (var d = 1; d <= 9; d++) {\n      var cx = lx0 + (d - 0.5) * slot;\n      var cy = ly0 + lh - (benford[d] / pMax) * lh;\n      if (d === 1) ctx.moveTo(cx, cy);\n      else ctx.lineTo(cx, cy);\n    }\n    ctx.stroke();\n    for (var d = 1; d <= 9; d++) {\n      var cx = lx0 + (d - 0.5) * slot;\n      var cy = ly0 + lh - (benford[d] / pMax) * lh;\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath();\n      ctx.arc(cx, cy, 3.2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('账目首位数字统计 (N=' + N + ') vs 本福特基线 (绿)', lx0, 18);\n\n    var rx0 = 458, ry0 = 52, rw = 236, rh = 152;\n    var midY = ry0 + rh / 2;\n    var errMax = 0.15;\n    ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n    ctx.beginPath();\n    ctx.moveTo(rx0, midY);\n    ctx.lineTo(rx0 + rw, midY);\n    ctx.stroke();\n\n    var rSlot = rw / 9;\n    var rBarW = rSlot * 0.56;\n    for (var d = 1; d <= 9; d++) {\n      var rcx = rx0 + (d - 0.5) * rSlot;\n      var delta = obs[d] - benford[d];\n      var dh = Math.min(Math.abs(delta) / errMax, 1.0) * (rh / 2);\n      ctx.fillStyle = Math.abs(delta) < 0.015 ? '#10b981' : (delta > 0 ? '#ec4899' : '#f59e0b');\n      if (delta >= 0) {\n        ctx.fillRect(rcx - rBarW / 2, midY - dh, rBarW, dh);\n      } else {\n        ctx.fillRect(rcx - rBarW / 2, midY, rBarW, dh);\n      }\n      ctx.fillStyle = 'rgba(248,250,252,0.75)';\n      ctx.font = '10px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText(String(d), rcx, ry0 + rh + 14);\n    }\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('审计残差偏差 (O - E)', rx0, 18);\n\n    var badgeText = chi2 < 20.09 ? '审计通过 (自然分布)' : (chi2 < 35 ? '轻度异常 (建议复核)' : '高度造假警报!');\n    var badgeColor = chi2 < 20.09 ? '#10b981' : (chi2 < 35 ? '#f59e0b' : '#ec4899');\n    ctx.fillStyle = badgeColor;\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(badgeText + '  χ²=' + chi2.toFixed(1), rx0, 38);\n\n    syncAudio(rmsePct, chi2);\n    lab.setReadout('掺假比例=' + fraudPct + '% | 均方根偏离 RMSE=' + rmsePct.toFixed(2) + '% | 卡方统计量 χ²=' + chi2.toFixed(1) + ' (阈值 20.1) | ' + badgeText);\n  }\n  lab.onUpdate(render);\n})();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（Raimi 逻辑误区）：对数据整体乘以常数 c（如换算货币单位或量纲），在对数轴上只是平移而不是拉宽；分布是否服从本福特定律，只取决于它是否足够平滑地“跨越多个数量级”。",
        "避坑 2（本福特审计的适用边界）：只有跨越多个数量级、不受人为强行上下限截断（例如限价 100~199 元的商品清单）的自然数据，才适合用本福特定律做异常检测，盲目套用会产生误报。",
        "核心结论：DSP 的频域/周期卷绕视角是跨学科利器——换个坐标系（线性域 → 对数域），许多令传统数学束手无策的难题会瞬间变成一眼看穿的工程直觉。"
      ]
    }
  ]
});
