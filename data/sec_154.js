window.__BOOK_REGISTER_SECTION__("sec_154", {
  "title": "切比雪夫响应与巴特沃斯响应 (The Chebyshev and Butterworth Responses)",
  "intuition": "在滤波器世界里，“通带绝对平坦”与“阻带陡峭切断”不可兼得——切比雪夫响应通过允许通带出现一点可控的波纹，换来了远超巴特沃斯的急剧滚降速度。",
  "blocks": [
    {
      "type": "concept",
      "heading": "用“波纹”换“陡峭”：切比雪夫响应的数学权衡",
      "paragraphs": [
        "设计低通或高通滤波器时，工程师最核心的矛盾是：**如何在截止频率附近把不需要的频率“切”得足够干脆（即更快的滚降速度 roll-off）**。切比雪夫响应（Chebyshev response）正是为此而生的一种数学策略——它主动放弃通带内的绝对平坦，允许幅度在通带内上下起伏产生**波纹（ripple）**，从而换取过渡带极度陡峭的滚降。",
        "无论在模拟电路（如第 3 章用于 ADC/DAC 抗混叠的模拟滤波器）还是数字递归滤波器中，采用这种响应的滤波器都被称为**切比雪夫滤波器**。它的名字源于俄国数学家帕夫努季·切比雪夫（Pafnuti Chebyshev, 1821–1894）提出的**切比雪夫多项式**（在文献中他的姓氏有多种音译拼法，如 Chebychev、Tschebyscheff、Tchebysheff 和 Tchebichef）。",
        "切比雪夫多项式之所以神奇，是因为它在通带区间内会在 `-1` 和 `+1` 之间等幅振荡，而一旦越过截止边界就会以指数级的惊人速度暴增。如原书图 20-1 所示：**通带波纹越大（坏处），滚降就越陡峭（好处）**；切比雪夫响应正是在这两个相互冲突的参数之间所能达到的**数学最优折中**。"
      ],
      "formula": {
        "expr": "|H(f)| = 1 / √( 1 + ε² · T_N²(f / f_p) )",
        "explain": "|H(f)| 是频率 f 处的幅频增益；ε 由允许的通带波纹百分比决定（波纹越大，ε 越大）；f_p 是通带边缘频率；T_N(x) 是 N 阶切比雪夫多项式，在通带内 (x ≤ 1) 始终在 [-1, +1] 之间等幅震荡形成波纹，在阻带 (x > 1) 迅速暴增导致分母急剧变大、增益陡峭跌落。"
      }
    },
    {
      "type": "concept",
      "heading": "0% 的极限与 0.5% 的工程甜点：巴特沃斯 vs. 实用切比雪夫",
      "paragraphs": [
        "如果把切比雪夫滤波器的允许波纹一路调小，直至设为 **0%**，通带内的振荡就完全消失了——此时滤波器退化为**最大平坦滤波器（maximally flat filter）**，也就是大名鼎鼎的**巴特沃斯滤波器（Butterworth filter）**，以英国工程师 S. Butterworth 于 1930 年首次描述该响应而命名。巴特沃斯在通带内极其平滑，没有一丝凸起或凹陷，但代价是滚降拖沓、过渡带很宽。",
        "在实际数字滤波工程中，**0.5% 的通带波纹**往往是一个极佳的经验甜点。观察图 20-1 可以发现，0.5% 的通带不平坦度小到在普通坐标图上几乎用肉眼看不出来，而且信号在进入数字系统前经过的模拟前端电路（运放、ADC 等）本身也就只有这个量级的精度与线性度。",
        "然而，仅仅付出这微不足道的 0.5% 波纹代价，换来的却是**比 0% 巴特沃斯滤波器快得多的滚降速度**。这就是为什么在只需分离频带、不必死磕极致绝对平坦度的场景下，0.5% 波纹的切比雪夫滤波器常常完胜巴特沃斯。"
      ],
      "formula": {
        "expr": "|H_Butterworth(f)| = 1 / √( 1 + (f / f_c)^(2N) )",
        "explain": "当波纹系数 ε 趋近 0 并固定 -3 dB 截止频率 f_c 时，响应简化为巴特沃斯公式：多项式在通带内退化为单调平滑幂函数 (f/f_c)^(2N)，通带完全无波纹，但阻带衰减随频率增长的速度远慢于切比雪夫多项式。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复现图 20-1——波纹大小与滚降陡度的实时博弈",
      "instruction": "拖动「通带波纹」和「滤波器极点数」滑块，实时观察绿线如何随着波纹增大而剧烈变陡，并对比 0% 巴特沃斯与 20% 高波纹基准线。",
      "controls": [
        {
          "type": "slider",
          "id": "ripple",
          "label": "通带波纹 (Passband Ripple)",
          "min": 0,
          "max": 20,
          "step": 0.5,
          "value": 0.5,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "poles",
          "label": "滤波器阶数 / 极点数 (N)",
          "min": 2,
          "max": 8,
          "step": 2,
          "value": 6,
          "unit": " 极点"
        },
        {
          "type": "toggle",
          "id": "showCompare",
          "label": "叠加 0% (巴特沃斯) 与 20% 对比基准",
          "value": true
        }
      ],
      "jsCode": "function chebT(n, x) {\n  if (n === 0) return 1;\n  if (n === 1) return x;\n  let t0 = 1, t1 = x;\n  for (let i = 2; i <= n; i++) {\n    const t2 = 2 * x * t1 - t0;\n    t0 = t1;\n    t1 = t2;\n  }\n  return t1;\n}\n\nfunction magResponse(f, ripplePct, N) {\n  const fc3db = 0.25;\n  if (ripplePct <= 0.001) {\n    return 1 / Math.sqrt(1 + Math.pow(f / fc3db, 2 * N));\n  }\n  const r = ripplePct / 100;\n  const eps = Math.sqrt(1 / ((1 - r) * (1 - r)) - 1);\n  const fp = fc3db / Math.cosh(Math.acosh(1 / eps) / N);\n  const t = chebT(N, f / fp);\n  return 1 / Math.sqrt(1 + eps * eps * t * t);\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  const ripple = lab.values.ripple;\n  const N = lab.values.poles;\n  const showCompare = lab.values.showCompare;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, w, h);\n\n  const padL = 52, padR = 26, padT = 22, padB = 34;\n  const pw = w - padL - padR;\n  const ph = h - padT - padB;\n  const fx = (f) => padL + (f / 0.5) * pw;\n  const fy = (a) => padT + (1 - a / 1.2) * ph;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let f = 0; f <= 0.501; f += 0.1) {\n    const x = fx(f);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();\n  }\n  for (let a = 0; a <= 1.201; a += 0.2) {\n    const y = fy(a);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();\n  }\n\n  if (ripple > 0.01) {\n    const r = ripple / 100;\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';\n    const yTop = fy(1.0);\n    const yBot = fy(1.0 - r);\n    ctx.fillRect(padL, yTop, fx(0.25) - padL, yBot - yTop);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(padL, fy(0.707)); ctx.lineTo(padL + pw, fy(0.707)); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(fx(0.25), padT); ctx.lineTo(fx(0.25), padT + ph); ctx.stroke();\n  ctx.setLineDash([]);\n\n  function plotCurve(rip, color, width, dashed) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    ctx.setLineDash(dashed ? [6, 4] : []);\n    ctx.beginPath();\n    const steps = 260;\n    for (let i = 0; i <= steps; i++) {\n      const f = (i / steps) * 0.5;\n      const a = magResponse(f, rip, N);\n      const x = fx(f), y = fy(a);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  if (showCompare) {\n    plotCurve(0, '#38bdf8', 1.7, true);\n    plotCurve(20, '#f59e0b', 1.7, true);\n  }\n\n  const mainColor = ripple <= 0.01 ? '#38bdf8' : '#10b981';\n  plotCurve(ripple, mainColor, 3, false);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  for (let f = 0; f <= 0.501; f += 0.1) {\n    ctx.fillText(f.toFixed(1), fx(f), padT + ph + 16);\n  }\n  ctx.fillText('归一化频率 (Frequency, Fs=1.0)', padL + pw / 2, h - 4);\n\n  ctx.textAlign = 'right';\n  for (let a = 0; a <= 1.01; a += 0.2) {\n    ctx.fillText(a.toFixed(1), padL - 8, fy(a) + 4);\n  }\n  ctx.fillText('-3dB', padL - 8, fy(0.707) + 4);\n\n  ctx.textAlign = 'left';\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = mainColor;\n  const modeLabel = ripple <= 0.01 ? '当前: 0% 巴特沃斯 (最大平坦)' : '当前: ' + ripple.toFixed(1) + '% 切比雪夫 I 型';\n  ctx.fillText(modeLabel, fx(0.28), padT + 18);\n  if (showCompare) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('--- 0% 巴特沃斯基准', fx(0.28), padT + 36);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('--- 20% 高波纹基准', fx(0.28), padT + 54);\n  }\n\n  const att35 = magResponse(0.35, ripple, N);\n  const attDb = 20 * Math.log10(Math.max(att35, 1e-5));\n  const bw35 = magResponse(0.35, 0, N);\n  const bwDb = 20 * Math.log10(Math.max(bw35, 1e-5));\n  lab.setReadout(\n    (ripple <= 0.01 ? '巴特沃斯 (0%波纹)' : '切比雪夫 I型 (' + ripple.toFixed(1) + '%波纹)') +\n    ' | ' + N + ' 极点 | f=0.35 处阻带增益: ' + att35.toFixed(3) + ' (' + attDb.toFixed(1) + ' dB)' +\n    ' [对比同阶巴特沃斯: ' + bwDb.toFixed(1) + ' dB]'\n  );\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "滤波器波纹版图：Type 1、Type 2 与椭圆滤波器",
      "paragraphs": [
        "本章重点讨论的切比雪夫滤波器严格来说叫做**切比雪夫 I 型（Type 1）滤波器**，它的含义是：**波纹只被允许出现在通带内**，而阻带则保持单调平坦地衰减。这种设计最符合直观需求，也是工程中最常用的切比雪夫形态。",
        "与之相对，还有一种**切比雪夫 II 型（Type 2）滤波器**（又称反切比雪夫滤波器），它反其道而行之：**通带保持绝对平坦，而将波纹全部赶到阻带中**。由于 II 型滤波器在同等条件下的过渡带优势不如 I 型直接且实现繁琐，实际工程中很少使用。",
        "此外，还有一位性能最极致的重量级成员——**椭圆滤波器（Elliptic filter）**。它非常“贪心”：**同时在通带和阻带两边都允许存在波纹**。正因把两端的自由度榨干到了极限，椭圆滤波器在**相同极点数（阶数）下拥有所有滤波器中最快的滚降速度**。代价是其数学设计极其复杂，通常需要直接借助专业 DSP 滤波器设计软件生成系数，但在专业模拟电路与数字信号处理领域，它往往是追求极限性能设计师的首选。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：四大家族频响对比与谐波实时听感实验室",
      "instruction": "通过切换「通带波纹」与「阻带波纹」两个开关组合出 4 种经典滤波器，点击播放声音并拖动截止频率，用眼睛和耳朵同时感受不同滚降速度对 12 次谐波音色的切割效果。",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "截止频率 (Cutoff)",
          "min": 250,
          "max": 1200,
          "step": 10,
          "value": 500,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "passRipple",
          "label": "允许通带波纹 (Passband Ripple)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "stopRipple",
          "label": "允许阻带波纹 (Stopband Ripple)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放 12 次谐波测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const f0 = 140;\nconst numHarm = 12;\nlet playing = false;\nlet audioNodes = [];\nlet masterGain = null;\n\nfunction filterGain(f, fc, passRip, stopRip) {\n  if (!passRip && !stopRip) {\n    const x = f / fc;\n    return 1 / Math.sqrt(1 + Math.pow(x, 8));\n  }\n  if (passRip && !stopRip) {\n    const fp = fc * 0.92;\n    const x = f / fp;\n    const x2 = x * x;\n    const t4 = 8 * x2 * x2 - 8 * x2 + 1;\n    const eps = 0.48;\n    return 1 / Math.sqrt(1 + eps * eps * t4 * t4);\n  }\n  if (!passRip && stopRip) {\n    const fs = fc * 1.32;\n    const x = fs / Math.max(f, 0.5);\n    const x2 = x * x;\n    const t4 = 8 * x2 * x2 - 8 * x2 + 1;\n    if (Math.abs(t4) < 1e-6) return 0;\n    const eps = 0.121;\n    return 1 / Math.sqrt(1 + 1 / (eps * eps * t4 * t4));\n  }\n  const fp = fc * 0.96;\n  const x = f / fp;\n  const x2 = x * x;\n  const z12 = 0.30, z22 = 0.93, k2 = 1.2544;\n  const p12 = k2 / z12, p22 = k2 / z22;\n  const den = (x2 - p12) * (x2 - p22);\n  if (Math.abs(den) < 1e-6) return 0;\n  const r4 = 21.3 * ((x2 - z12) * (x2 - z22)) / den;\n  return 1 / Math.sqrt(1 + (0.48 * r4) * (0.48 * r4));\n}\n\nfunction syncAudio() {\n  const wantPlay = lab.values.play;\n  const fc = lab.values.cutoff;\n  const pr = lab.values.passRipple;\n  const sr = lab.values.stopRipple;\n  try {\n    if (wantPlay && !playing) {\n      const actx = lab.getAudioContext();\n      if (actx.state === 'suspended') actx.resume();\n      masterGain = actx.createGain();\n      masterGain.gain.setValueAtTime(0.0001, actx.currentTime);\n      masterGain.gain.exponentialRampToValueAtTime(0.18, actx.currentTime + 0.04);\n      masterGain.connect(actx.destination);\n      audioNodes = [];\n      for (let k = 1; k <= numHarm; k++) {\n        const osc = actx.createOscillator();\n        const g = actx.createGain();\n        const freq = k * f0;\n        const baseAmp = 1 / Math.pow(k, 0.85);\n        const h = filterGain(freq, fc, pr, sr);\n        osc.type = 'sine';\n        osc.frequency.setValueAtTime(freq, actx.currentTime);\n        g.gain.setValueAtTime(baseAmp * h, actx.currentTime);\n        osc.connect(g);\n        g.connect(masterGain);\n        osc.start();\n        audioNodes.push({ osc: osc, gain: g, freq: freq, baseAmp: baseAmp });\n      }\n      playing = true;\n    } else if (!wantPlay && playing) {\n      const actx = lab.getAudioContext();\n      if (masterGain) {\n        masterGain.gain.setTargetAtTime(0.0001, actx.currentTime, 0.015);\n      }\n      const oldNodes = audioNodes;\n      setTimeout(function() {\n        for (let i = 0; i < oldNodes.length; i++) {\n          try { oldNodes[i].osc.stop(); oldNodes[i].osc.disconnect(); } catch (e) {}\n        }\n      }, 60);\n      audioNodes = [];\n      playing = false;\n    } else if (wantPlay && playing) {\n      const actx = lab.getAudioContext();\n      for (let i = 0; i < audioNodes.length; i++) {\n        const node = audioNodes[i];\n        const h = filterGain(node.freq, fc, pr, sr);\n        node.gain.gain.setTargetAtTime(node.baseAmp * h, actx.currentTime, 0.02);\n      }\n    }\n  } catch (e) {}\n}\n\nfunction draw() {\n  syncAudio();\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  const fc = lab.values.cutoff;\n  const pr = lab.values.passRipple;\n  const sr = lab.values.stopRipple;\n\n  let name = '巴特沃斯 (Butterworth)';\n  let desc = '通带平坦 + 阻带平坦';\n  let color = '#38bdf8';\n  if (pr && !sr) {\n    name = '切比雪夫 I 型 (Type 1)';\n    desc = '通带波纹 + 阻带平坦';\n    color = '#10b981';\n  } else if (!pr && sr) {\n    name = '切比雪夫 II 型 (Type 2)';\n    desc = '通带平坦 + 阻带波纹';\n    color = '#f59e0b';\n  } else if (pr && sr) {\n    name = '椭圆滤波器 (Elliptic)';\n    desc = '通带波纹 + 阻带波纹 (滚降最快)';\n    color = '#ec4899';\n  }\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, w, h);\n\n  const padL = 48, padR = 24, padT = 24, padB = 34;\n  const pw = w - padL - padR;\n  const ph = h - padT - padB;\n  const maxF = 1800;\n  const fx = (f) => padL + (f / maxF) * pw;\n  const fy = (a) => padT + (1 - a / 1.15) * ph;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let f = 0; f <= maxF; f += 300) {\n    const x = fx(f);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();\n  }\n  for (let a = 0; a <= 1.01; a += 0.25) {\n    const y = fy(a);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(fx(fc), padT); ctx.lineTo(fx(fc), padT + ph); ctx.stroke();\n  ctx.setLineDash([]);\n\n  for (let k = 1; k <= numHarm; k++) {\n    const freq = k * f0;\n    const rawAmp = 1 / Math.pow(k, 0.85);\n    const g = filterGain(freq, fc, pr, sr);\n    const outAmp = rawAmp * g;\n    const x = fx(freq);\n    const yRaw = fy(rawAmp);\n    const yOut = fy(outAmp);\n    const y0 = fy(0);\n    ctx.fillStyle = 'rgba(148, 163, 184, 0.18)';\n    ctx.fillRect(x - 6, yRaw, 12, y0 - yRaw);\n    ctx.fillStyle = color;\n    ctx.globalAlpha = 0.75;\n    ctx.fillRect(x - 6, yOut, 12, y0 - yOut);\n    ctx.globalAlpha = 1.0;\n  }\n\n  if (pr || sr) {\n    ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (let i = 0; i <= 260; i++) {\n      const f = (i / 260) * maxF;\n      const a = filterGain(f, fc, false, false);\n      const x = fx(f), y = fy(a);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = color;\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  for (let i = 0; i <= 320; i++) {\n    const f = (i / 320) * maxF;\n    const a = filterGain(f, fc, pr, sr);\n    const x = fx(f), y = fy(a);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  for (let f = 0; f <= maxF; f += 300) {\n    ctx.fillText(f + 'Hz', fx(f), padT + ph + 16);\n  }\n  ctx.fillText('频率 (140Hz 基频及其 2~12 次谐波竖条)', padL + pw / 2, h - 4);\n\n  ctx.textAlign = 'right';\n  for (let a = 0; a <= 1.01; a += 0.5) {\n    ctx.fillText(a.toFixed(1), padL - 8, fy(a) + 4);\n  }\n\n  ctx.textAlign = 'right';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillStyle = color;\n  ctx.fillText(name, padL + pw - 8, padT + 18);\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#e2e8f0';\n  ctx.fillText(desc, padL + pw - 8, padT + 36);\n  if (pr || sr) {\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText('灰虚线: 同阶巴特沃斯参考', padL + pw - 8, padT + 54);\n  }\n\n  const att12 = filterGain(fc * 1.15, fc, pr, sr);\n  const attDb = 20 * Math.log10(Math.max(att12, 1e-4));\n  lab.setReadout(\n    name + ' | 截止频率: ' + fc + ' Hz | 1.15×fc 处增益: ' + att12.toFixed(3) + ' (' + attDb.toFixed(1) + ' dB)' +\n    (playing ? ' | 🔊 正在实时滤波发声' : ' | 点击播放对比谐波音色')\n  );\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "切比雪夫响应的核心哲学是“用通带波纹换取陡峭滚降”：波纹越大，过渡带越窄；波纹降为 0% 时退化为最大平坦的巴特沃斯滤波器。",
        "实战经验首选 0.5% 波纹的切比雪夫 I 型：它在图形上几乎看不出起伏，匹配真实模拟前端的精度上限，同时滚降速度远超巴特沃斯。",
        "四大响应一眼分清：巴特沃斯（全平坦）、切比雪夫 I 型（仅通带波纹，最常用）、切比雪夫 II 型（仅阻带波纹，极少用）、椭圆滤波器（通阻双波纹，同阶滚降最快但通常需借助专业软件设计）。"
      ]
    }
  ]
});
