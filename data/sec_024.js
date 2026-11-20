window.__BOOK_REGISTER_SECTION__("sec_024", {
  "title": "反射地震学：给地球做“声波 B 超” (Reflection Seismology)",
  "intuition": "通过向地下引爆声波并利用 DSP 剥离地层间的“回声套娃”（多次反射），人类得以像给地球做 B 超一样精准绘制十公里深处的石油与矿藏地图。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从炸药放炮到地壳透视：理想与现实的落差",
      "paragraphs": [
        "早在 20 世纪 20 年代，地球物理学家就发现可以用声音探测地壳结构。勘探人员在地面引爆炸药产生强声波，声波向地下传播并在深度超过 **10 公里** 的不同岩石界面处发生反射。地面传感器记录下这些回声波形（即 **反射地震图 / Echo Seismogram**），早期专家全靠 **肉眼看图** 来反推地下构造，这种方法迅速成为寻找石油和矿藏的首选手段。",
        "在 **理想情况** 下，一声巨响传向地下，每穿过一个地层分界面，就只产生 **一个** 干脆利落的回声。通过测量回声到达的时间差，就能直接算出各个地层的埋藏深度。但真实的地壳远没有这么乖巧——从深层界面反射回来的声波，在返回地面的途中必须重新穿过它上方的所有地层界面。",
        "这就导致声波像被困在两面镜子之间的光线一样，在各层之间反复弹跳，产生 **“回声的回声”**（即 **二次回声 / 多次反射**）。这些滞后到达的虚假回声与深层真实地层的微弱回声混杂在一起，把地震图搅成一团难以辨认的乱麻。"
      ],
      "formula": {
        "expr": "d = (v * t) / 2",
        "explain": "d 为地层界面深度，v 为声波在该岩层中的传播速度，t 为地面测得的一次直达回声往返总时间（除以 2 是因为声波走了一个来回）。如果把二次回声误当成一次回声，算出来的深度 d 就会严重失真。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：地层间的“回声套娃”是如何毁掉地震图的",
      "instruction": "拖动界面深度与反射率滑块，切换“开启二次/多次反射干扰”，观察左侧声波在岩层间的弹跳路径与右侧地震图波形的变化，并可点击播放回声听感。",
      "controls": [
        {
          "type": "slider",
          "id": "depth1",
          "label": "浅层界面深度",
          "min": 1,
          "max": 3.5,
          "step": 0.1,
          "value": 1.6,
          "unit": " km"
        },
        {
          "type": "slider",
          "id": "depth2",
          "label": "深层界面间距",
          "min": 1,
          "max": 3.5,
          "step": 0.1,
          "value": 2.2,
          "unit": " km"
        },
        {
          "type": "slider",
          "id": "reflectivity",
          "label": "界面反射强度",
          "min": 0.2,
          "max": 0.85,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showSecondary",
          "label": "开启多次反射干扰 (Echoes of Echoes)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放地震波回声听感",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar lastShot = -10;\nvar wasPlaying = false;\n\nfunction ricker(dt, f) {\n  var a = Math.PI * Math.PI * f * f * dt * dt;\n  return (1 - 2 * a) * Math.exp(-a);\n}\n\nfunction buildEchoes() {\n  var d1 = lab.values.depth1;\n  var d2 = lab.values.depth2;\n  var r = lab.values.reflectivity;\n  var sec = lab.values.showSecondary;\n  var v1 = 2.0;\n  var v2 = 2.6;\n  var t1 = (2 * d1) / v1;\n  var dt2 = (2 * d2) / v2;\n  var t2 = t1 + dt2;\n  var echoes = [];\n  echoes.push({ t: t1, amp: r, primary: true, label: 'P1' });\n  echoes.push({ t: t2, amp: (1 - r * r) * 0.72, primary: true, label: 'P2' });\n  if (sec) {\n    for (var k = 2; k <= 5; k++) {\n      var amp1 = Math.pow(-r, k - 1) * r;\n      if (Math.abs(amp1) > 0.02) {\n        echoes.push({ t: t1 * k, amp: amp1, primary: false, label: 'M' });\n      }\n    }\n    for (var m = 1; m <= 3; m++) {\n      var ampB = (1 - r * r) * 0.72 * Math.pow(-r * 0.85, m);\n      if (Math.abs(ampB) > 0.02) {\n        echoes.push({ t: t2 + m * Math.min(t1, dt2), amp: ampB, primary: false, label: 'M' });\n      }\n    }\n  }\n  return { echoes: echoes, t1: t1, t2: t2 };\n}\n\nfunction triggerAudio() {\n  try {\n    var actx = lab.getAudioContext();\n    if (!actx) return;\n    if (actx.state === 'suspended') actx.resume();\n    var now = actx.currentTime + 0.04;\n    var data = buildEchoes();\n    var list = [{ t: 0, amp: 0.9, primary: true }].concat(data.echoes);\n    for (var i = 0; i < list.length; i++) {\n      var e = list[i];\n      var at = now + e.t * 0.32;\n      var mag = Math.min(1, Math.abs(e.amp));\n      if (mag < 0.03) continue;\n      var osc = actx.createOscillator();\n      var g = actx.createGain();\n      osc.type = 'triangle';\n      osc.frequency.setValueAtTime(e.primary ? 170 : 125, at);\n      osc.frequency.exponentialRampToValueAtTime(48, at + 0.09);\n      g.gain.setValueAtTime(0.001, at);\n      g.gain.linearRampToValueAtTime(mag * 0.28, at + 0.008);\n      g.gain.exponentialRampToValueAtTime(0.0008, at + 0.11);\n      osc.connect(g);\n      g.connect(actx.destination);\n      osc.start(at);\n      osc.stop(at + 0.12);\n    }\n  } catch (err) {}\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  var splitX = 250;\n  var d1 = lab.values.depth1;\n  var d2 = lab.values.depth2;\n  var sec = lab.values.showSecondary;\n  var data = buildEchoes();\n\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(10, 12, splitX - 20, H - 24);\n  var surfY = 34;\n  var y1 = surfY + d1 * 24;\n  var y2 = Math.min(H - 22, y1 + d2 * 24);\n\n  ctx.fillStyle = 'rgba(56,189,248,0.08)';\n  ctx.fillRect(10, surfY, splitX - 20, y1 - surfY);\n  ctx.fillStyle = 'rgba(16,185,129,0.08)';\n  ctx.fillRect(10, y1, splitX - 20, y2 - y1);\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(10, surfY); ctx.lineTo(splitX - 10, surfY); ctx.stroke();\n  ctx.strokeStyle = '#10b981';\n  ctx.beginPath(); ctx.moveTo(10, y1); ctx.lineTo(splitX - 10, y1); ctx.stroke();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath(); ctx.moveTo(10, y2); ctx.lineTo(splitX - 10, y2); ctx.stroke();\n\n  var srcX = 52;\n  var recX = 200;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(srcX, surfY, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(recX - 4, surfY - 4, 8, 8);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  ctx.moveTo(srcX, surfY); ctx.lineTo((srcX + recX) / 2, y1); ctx.lineTo(recX, surfY);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath();\n  ctx.moveTo(srcX, surfY); ctx.lineTo((srcX + recX) / 2, y2); ctx.lineTo(recX, surfY);\n  ctx.stroke();\n\n  if (sec) {\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.3;\n    ctx.beginPath();\n    ctx.moveTo(srcX, surfY);\n    ctx.lineTo(srcX + 35, y1);\n    ctx.lineTo(srcX + 75, surfY);\n    ctx.lineTo(srcX + 115, y1);\n    ctx.lineTo(recX, surfY);\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('炸药震源', srcX - 20, surfY - 9);\n  ctx.fillText('检波器', recX - 16, surfY - 9);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('界面1 (' + d1.toFixed(1) + 'km)', 16, y1 - 4);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('界面2 (+' + d2.toFixed(1) + 'km)', 16, y2 - 4);\n\n  var gx = splitX + 12;\n  var gw = W - gx - 16;\n  var midY = H * 0.56;\n  var maxT = 7.5;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var t = 0; t <= 7; t++) {\n    var tx = gx + (t / maxT) * gw;\n    ctx.beginPath(); ctx.moveTo(tx, 20); ctx.lineTo(tx, H - 20); ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.fillText(t + 's', tx - 5, H - 6);\n  }\n  ctx.beginPath(); ctx.moveTo(gx, midY); ctx.lineTo(gx + gw, midY); ctx.stroke();\n\n  ctx.beginPath();\n  var N = 420;\n  for (var i = 0; i <= N; i++) {\n    var curT = (i / N) * maxT;\n    var val = 0;\n    for (var j = 0; j < data.echoes.length; j++) {\n      var ec = data.echoes[j];\n      var diff = curT - ec.t;\n      if (Math.abs(diff) < 0.35) {\n        val += ec.amp * ricker(diff, 7.5);\n      }\n    }\n    var px = gx + (i / N) * gw;\n    var py = midY - val * 72;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = sec ? '#f8fafc' : '#10b981';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  for (var j = 0; j < data.echoes.length; j++) {\n    var ec = data.echoes[j];\n    if (ec.t > maxT) continue;\n    var mx = gx + (ec.t / maxT) * gw;\n    ctx.fillStyle = ec.primary ? '#38bdf8' : '#ec4899';\n    ctx.beginPath(); ctx.arc(mx, 28, 3, 0, Math.PI * 2); ctx.fill();\n    ctx.font = '10px sans-serif';\n    ctx.fillText(ec.primary ? ec.label : '虚像', mx - 8, 42);\n  }\n\n  ctx.fillStyle = '#e2e8f0';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('地震图波形 (蓝点=真实界面回声，粉点=多次反射虚像)', gx, 16);\n\n  var secCount = sec ? (data.echoes.length - 2) : 0;\n  lab.setReadout('一次主回声: ' + data.t1.toFixed(2) + 's & ' + data.t2.toFixed(2) + 's  |  叠加二次虚像数: ' + secCount + ' 个');\n}\n\nlab.onUpdate(function() {\n  draw();\n  if (lab.values.play && !wasPlaying) {\n    triggerAudio();\n    wasPlaying = true;\n  } else if (!lab.values.play) {\n    wasPlaying = false;\n  }\n});\n\nlab.onLoop(function(dt, timeSec) {\n  if (lab.values.play) {\n    if (timeSec - lastShot >= 2.6) {\n      triggerAudio();\n      lastShot = timeSec;\n    }\n  } else {\n    lastShot = -10;\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "DSP 的救场：为什么早期勘探只能去“简单地带”？",
      "paragraphs": [
        "在没有数字信号处理的年代，早期地球物理学家是怎么找油的？答案非常直白：**他们专挑地质结构“简单”的地方去探测**——那些岩层平缓、反射界面少、多次反射极弱的区域，靠人眼就能分清主回声。",
        "然而，地球上大量宝贵的油气资源藏在地质极度复杂的区域，最典型的就是 **海底油田**。海水与海底岩石之间的声阻抗差异极大，声波一旦进入海水层，就会在海面与海底之间像乒乓球一样疯狂来回震荡，形成极其剧烈的 **多次混响（鸣震）**，直接把深层油气藏那一点点微弱的一次反射信号彻底淹没。",
        "从 20 世纪 60 年代开始，**数字信号处理（DSP）** 彻底改变了反射地震学。工程师利用 **预测反褶积（Predictive Deconvolution）** 等数字滤波算法，根据浅水层的反射周期规律，在数字域精确抵消掉这些周期性“回声套娃”，把真正反映深层地貌的 **一次主回声** 从噪声与二次回声的汪洋大海中孤立提取出来。"
      ],
      "formula": {
        "expr": "y[n] = x[n] + r * x[n - k]",
        "explain": "极简的海洋多次波消除滤波器思路：x[n] 是传感器收到的混杂地震信号，k 是声波在海水层往返一次对应的采样点数（周期），r 是海底反射系数。由于多次反射呈周期性交替衰减，把当前信号加上延迟 k 步并缩放 r 倍的自身信号，就能巧妙地将成串的二次虚像一一抵消。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：DSP 反滤波从“海底混响”中救出深层油藏信号",
      "instruction": "观察上方未处理信号中海水鸣震如何淹没深层油藏；开启“DSP 多次波抑制”并调节估计误差，体验算法如何一秒净化波形。",
      "controls": [
        {
          "type": "slider",
          "id": "waterDepth",
          "label": "海水深度",
          "min": 60,
          "max": 240,
          "step": 15,
          "value": 120,
          "unit": " m"
        },
        {
          "type": "toggle",
          "id": "dspCancel",
          "label": "开启 DSP 多次波抑制 (反滤波)",
          "value": false
        },
        {
          "type": "slider",
          "id": "mismatch",
          "label": "水层模型估计误差",
          "min": -20,
          "max": 20,
          "step": 2,
          "value": 0,
          "unit": " %"
        },
        {
          "type": "toggle",
          "id": "showTarget",
          "label": "显示真实油藏标尺",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction ricker(dt, f) {\n  var a = Math.PI * Math.PI * f * f * dt * dt;\n  return (1 - 2 * a) * Math.exp(-a);\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  var depth = lab.values.waterDepth;\n  var cancel = lab.values.dspCancel;\n  var errPct = lab.values.mismatch;\n  var showTarget = lab.values.showTarget;\n\n  var vw = 1500;\n  var Tw = (2 * depth) / vw;\n  var rw = 0.72;\n  var Toil = 0.58;\n  var oilAmp = 0.24;\n\n  var N = 500;\n  var dt = 0.002;\n  var raw = new Array(N);\n  var clean = new Array(N);\n\n  for (var i = 0; i < N; i++) {\n    var t = i * dt;\n    var val = 0;\n    for (var k = 1; k <= 8; k++) {\n      var mt = k * Tw;\n      if (mt > 1.05) break;\n      var mAmp = Math.pow(-rw, k - 1) * rw;\n      val += mAmp * ricker(t - mt, 32);\n    }\n    val += oilAmp * ricker(t - Toil, 34);\n    val += -rw * oilAmp * ricker(t - (Toil + Tw), 34);\n    val += Math.sin(i * 1.7) * 0.008;\n    raw[i] = val;\n  }\n\n  var kw = Math.round(Tw / dt);\n  var kEst = Math.max(1, Math.round(kw * (1 + errPct / 100)));\n  for (var i = 0; i < N; i++) {\n    if (!cancel) {\n      clean[i] = raw[i];\n    } else {\n      var delayed = (i - kEst >= 0) ? raw[i - kEst] : 0;\n      clean[i] = raw[i] + rw * delayed;\n    }\n  }\n\n  var padL = 44;\n  var padR = 20;\n  var pw = W - padL - padR;\n  var topY = 66;\n  var botY = 178;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var s = 0; s <= 10; s++) {\n    var gx = padL + (s / 10) * pw;\n    ctx.beginPath(); ctx.moveTo(gx, 18); ctx.lineTo(gx, H - 18); ctx.stroke();\n    if (s % 2 === 0) {\n      ctx.fillStyle = '#64748b';\n      ctx.font = '10px sans-serif';\n      ctx.fillText((s * 0.1).toFixed(1) + 's', gx - 8, H - 4);\n    }\n  }\n  ctx.beginPath(); ctx.moveTo(padL, topY); ctx.lineTo(padL + pw, topY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(padL, botY); ctx.lineTo(padL + pw, botY); ctx.stroke();\n\n  if (showTarget) {\n    var ox = padL + (Toil / 1.0) * pw;\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.beginPath(); ctx.moveTo(ox, 18); ctx.lineTo(ox, H - 18); ctx.stroke();\n    ctx.restore();\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('深层油气藏位置 (' + Toil + 's)', ox + 5, 28);\n  }\n\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = padL + (i / (N - 1)) * pw;\n    var py = topY - raw[i] * 55;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.7;\n  ctx.stroke();\n\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = padL + (i / (N - 1)) * pw;\n    var py = botY - clean[i] * 55;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = cancel ? '#10b981' : 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = cancel ? 2.1 : 1.4;\n  ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('原始海底地震记录 (海水多次鸣震淹没深层信号)', padL, 16);\n\n  ctx.fillStyle = cancel ? '#10b981' : '#94a3b8';\n  var botTitle = cancel ? 'DSP 反滤波输出 (多次波已剥离，深层油藏信号清晰可见)' : 'DSP 处理输出 (尚未开启滤波，与原始信号一致)';\n  ctx.fillText(botTitle, padL, 128);\n\n  var status = cancel ? (errPct === 0 ? '完美抵消' : '存在 ' + Math.abs(errPct) + '% 延迟误差残余') : '未开启滤波';\n  lab.setReadout('海水层往返周期 Tw = ' + (Tw * 1000).toFixed(0) + ' ms (延迟 ' + kw + ' 采样点)  |  处理状态: ' + status);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "物理本质区分：一次反射波（Primary Echo）携带真实地下界面深度，二次反射波（Secondary Echo）则是声波在界面间弹跳产生的“虚假重影”。",
        "速度模型是反褶积的生命线：如实验二所示，如果对水深或岩层声速估计哪怕偏差 10%，DSP 逆滤波器就无法精准对齐延迟采样点 k，反而会在波形中残留出伪影。",
        "DSP 的真正价值在于“化难为易”：它没有改变爆炸物理过程，而是把原本必须依赖简单地质环境才能看懂的信号，解放到了深海、复杂断层等高难度工业现场。"
      ]
    }
  ]
});
