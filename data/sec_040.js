window.__BOOK_REGISTER_SECTION__("sec_040", {
  "title": "对数尺度与线性尺度下的三大滤波器特性对比 (Log Scale vs. Linear Scale & Filter Responses)",
  "intuition": "没有完美的滤波器：切比雪夫用通带波纹换取最陡峭的滚降，巴特沃斯坚守绝对平坦的通带，而贝塞尔则牺牲滚降以换取无过冲、边沿对称的完美时域响应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、对数尺度与线性尺度：同一张频响图的两副面孔",
      "paragraphs": [
        "在评估 **贝塞尔 (Bessel)**、**巴特沃斯 (Butterworth)** 和 **切比雪夫 (Chebyshev)** 这三大经典低通滤波器时，工程师必须同时看两张图：**对数坐标图 (Log scale，原书 Fig. 3-11)** 和 **线性坐标图 (Linear scale，原书 Fig. 3-12)**。",
        "为什么不能只看一张？**对数尺度** 将横跨多个数量级的衰减（从 `1` 到 `0.0001`，即 `0 dB` 到 `-80 dB`）等距铺开，专门用来看清**阻带滚降有多快 (roll-off)**。在对数图上，切比雪夫滤波器衰减最快，巴特沃斯居中，贝塞尔最慢；极点阶数（`2 -> 4 -> 8 pole`）越多，三者的滚降都越陡峭。",
        "然而对数尺度会把 `0.94 ~ 1.0` 之间的微小起伏压缩成一条看起来很平的直线。切换到 **线性尺度 (0 ~ 1.6)** 后，真相立刻暴露：切比雪夫滤波器在通带内出现了明显的波浪状起伏，这就是 **通带波纹 (passband ripple)**。事实上，切比雪夫正是通过**允许通带产生约 6% (0.5 dB) 的波纹**，才换来了如此惊人的陡峭滚降；如果允许更大的波纹（或像 **椭圆滤波器 Elliptic filter** 那样同时在通带和阻带允许波纹），滚降还能进一步加快。",
        "相比之下，巴特沃斯滤波器被称为 **最大平坦滤波器 (maximally flat filter)**——它等价于把通带波纹设为 `0%` 的切比雪夫极限情况，是**不允许通带波纹前提下滚降最快**的设计；而贝塞尔滤波器虽然也无通带波纹，但滚降速度远逊于巴特沃斯。"
      ],
      "formula": {
        "expr": "|H_Butter(f)| = 1 / √(1 + (f / f_c)^(2N)) ,   |H_Cheb(f)| = 1 / √(1 + ε² · T_N²(f / f_c))",
        "explain": "f 为输入频率，f_c 为截止频率（本节归一化为 1 Hz），N 为滤波器阶数（极点数）。巴特沃斯分母随 (f/f_c) 单调递增，通带绝对平坦；切比雪夫引入了波纹系数 ε（6% 波纹对应 ε ≈ 0.363）与在 [-1, 1] 内等幅振荡的切比雪夫多项式 T_N，从而在通带牺牲平坦度换取阻带指数级加快的滚降。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：对数与线性尺度切换 & 滤波器听感实验室",
      "instruction": "切换「线性尺度」对比通带波纹与阻带滚降；拖动「滤波器类型」「极点数」和「测试频率」，并点击播放按钮实时听出不同滤波器在截止频率前后的衰减差异。",
      "controls": [
        {
          "type": "slider",
          "id": "filterType",
          "label": "滤波器 (0贝塞尔/1巴特/2切比)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "poles",
          "label": "滤波器阶数 (极点数)",
          "min": 2,
          "max": 8,
          "step": 2,
          "value": 4,
          "unit": " 阶"
        },
        {
          "type": "slider",
          "id": "testFreq",
          "label": "测试频率 (归一化 fc=1Hz)",
          "min": 0.2,
          "max": 4.5,
          "step": 0.05,
          "value": 1,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "linearScale",
          "label": "使用线性尺度 (关闭=对数尺度)",
          "value": false
        },
        {
          "type": "audio",
          "id": "playTone",
          "label": "▶ 播放滤波测试音",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction getBesselPoly(N) {\n  let b0 = [1];\n  let b1 = [1, 1];\n  if (N === 1) return b1;\n  for (let k = 2; k <= N; k++) {\n    const f = 2 * k - 1;\n    const next = new Array(b0.length + 2).fill(0);\n    for (let i = 0; i < b0.length; i++) next[i] += b0[i];\n    const offset = next.length - b1.length;\n    for (let i = 0; i < b1.length; i++) next[i + offset] += f * b1[i];\n    b0 = b1;\n    b1 = next;\n  }\n  return b1;\n}\n\nfunction evalPolyMag(poly, w) {\n  let re = 0, im = 0;\n  const deg = poly.length - 1;\n  for (let i = 0; i <= deg; i++) {\n    const p = deg - i;\n    const term = poly[i] * Math.pow(w, p);\n    const mod = p % 4;\n    if (mod === 0) re += term;\n    else if (mod === 1) im += term;\n    else if (mod === 2) re -= term;\n    else im -= term;\n  }\n  return Math.hypot(re, im);\n}\n\nconst besselCache = {};\n[2, 4, 6, 8].forEach(N => {\n  const poly = getBesselPoly(N);\n  const dc = poly[poly.length - 1];\n  let lo = 0.5, hi = 5.0;\n  for (let it = 0; it < 35; it++) {\n    const mid = 0.5 * (lo + hi);\n    const mag = dc / evalPolyMag(poly, mid);\n    if (mag > Math.SQRT1_2) lo = mid;\n    else hi = mid;\n  }\n  besselCache[N] = { poly, dc, cN: 0.5 * (lo + hi) };\n});\n\nfunction chebT(N, x) {\n  if (Math.abs(x) <= 1) return Math.cos(N * Math.acos(x));\n  return Math.cosh(N * Math.acosh(x));\n}\n\nfunction getMag(type, N, f) {\n  if (f <= 0) return 1.0;\n  if (type === 0) {\n    const b = besselCache[N];\n    return b.dc / evalPolyMag(b.poly, f * b.cN);\n  } else if (type === 1) {\n    return 1 / Math.sqrt(1 + Math.pow(f, 2 * N));\n  } else {\n    const eps = 0.363;\n    const t = chebT(N, f);\n    return 1 / Math.sqrt(1 + eps * eps * t * t);\n  }\n}\n\nlet osc = null;\nlet gainNode = null;\n\nfunction stopAudio() {\n  if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nfunction updateAudio(fNorm, mag) {\n  if (!lab.values.playTone) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  const audioFreq = fNorm * 440;\n  const targetGain = Math.min(0.32, Math.max(0.0001, mag * 0.25));\n  if (!osc) {\n    osc = ac.createOscillator();\n    gainNode = ac.createGain();\n    osc.type = 'sine';\n    osc.frequency.setValueAtTime(audioFreq, ac.currentTime);\n    gainNode.gain.setValueAtTime(targetGain, ac.currentTime);\n    osc.connect(gainNode);\n    gainNode.connect(ac.destination);\n    osc.start();\n  } else {\n    osc.frequency.setTargetAtTime(audioFreq, ac.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(targetGain, ac.currentTime, 0.02);\n  }\n}\n\nconst names = ['Bessel (贝塞尔)', 'Butterworth (巴特沃斯)', 'Chebyshev (切比雪夫 6%波纹)'];\nconst colors = ['#38bdf8', '#10b981', '#f59e0b'];\n\nfunction draw() {\n  const fType = Math.round(lab.values.filterType);\n  const poles = Math.round(lab.values.poles);\n  const testF = lab.values.testFreq;\n  const isLin = lab.values.linearScale;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 62, padR = 24, padT = 26, padB = 34;\n  const pw = W - padL - padR;\n  const ph = H - padT - padB;\n\n  const xOf = f => padL + (f / 5.0) * pw;\n  const yOf = mag => {\n    if (isLin) {\n      const clamped = Math.max(0, Math.min(1.6, mag));\n      return padT + ph * (1 - clamped / 1.6);\n    } else {\n      const logMin = -4, logMax = 1;\n      const lv = Math.max(logMin, Math.min(logMax, Math.log10(Math.max(1e-6, mag))));\n      return padT + ph * (1 - (lv - logMin) / (logMax - logMin));\n    }\n  };\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.textAlign = 'center';\n  for (let f = 0; f <= 5; f++) {\n    const x = xOf(f);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();\n    ctx.fillText(f + ' Hz', x, padT + ph + 16);\n  }\n\n  ctx.textAlign = 'right';\n  if (isLin) {\n    [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6].forEach((v, idx) => {\n      const y = yOf(v);\n      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();\n      if (idx % 2 === 0 || v === 1.0) ctx.fillText(v.toFixed(1), padL - 8, y + 4);\n    });\n  } else {\n    [0.0001, 0.001, 0.01, 0.1, 1, 10].forEach(v => {\n      const y = yOf(v);\n      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();\n      ctx.fillText(String(v), padL - 8, y + 4);\n    });\n  }\n\n  ctx.save();\n  ctx.setLineDash([5, 5]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(xOf(0), yOf(1));\n  ctx.lineTo(xOf(1), yOf(1));\n  ctx.lineTo(xOf(1), padT + ph);\n  ctx.stroke();\n  ctx.restore();\n\n  [0, 1, 2].forEach(t => {\n    const active = (t === fType);\n    ctx.beginPath();\n    const steps = 320;\n    for (let i = 0; i <= steps; i++) {\n      const f = (i / steps) * 5.0;\n      const m = getMag(t, poles, f);\n      const x = xOf(f), y = yOf(m);\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.strokeStyle = active ? colors[t] : 'rgba(255,255,255,0.18)';\n    ctx.lineWidth = active ? 2.8 : 1.2;\n    ctx.stroke();\n  });\n\n  const curMag = getMag(fType, poles, testF);\n  const mx = xOf(testF), my = yOf(curMag);\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.beginPath(); ctx.moveTo(mx, padT); ctx.lineTo(mx, padT + ph); ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(mx, my, 5.5, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  ctx.textAlign = 'left';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = colors[fType];\n  ctx.fillText(names[fType] + '  |  ' + poles + ' 阶  |  ' + (isLin ? '线性尺度 (可看清通带波纹)' : '对数尺度 (可看清阻带滚降)'), padL + 8, 16);\n\n  const db = 20 * Math.log10(Math.max(1e-6, curMag));\n  lab.setReadout('测试频率: ' + testF.toFixed(2) + ' Hz (音频 ' + Math.round(testF * 440) + ' Hz) | 增益幅度: ' + curMag.toFixed(4) + ' (' + db.toFixed(1) + ' dB)');\n  updateAudio(testF, curMag);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "二、阶跃响应与脉冲响应：过冲、振铃与线性相位",
      "paragraphs": [
        "频域表现出色的切比雪夫滤波器，到了**时域**却可能变成一场灾难。衡量时域保真度的核心指标是 **阶跃响应 (step response，原书 Fig. 3-13)**——当输入信号在瞬间从 `0` 跳变到 `1` 时，滤波器输出会如何跟随？",
        "实验表明，**巴特沃斯**和**切比雪夫**滤波器在阶跃跳变后都会冲过目标值 `1.0`，产生 **过冲 (overshoot)**，随后像弹簧一样来回衰减振荡，称为 **振铃 (ringing)**；而且极点阶数越高，过冲和振铃越剧烈。注意，图中横轴时间对应 `1 Hz` 截止频率；若截止频率提高到 `1000 Hz`，横轴时间将按反比缩放为**毫秒**级别。",
        "唯有 **贝塞尔滤波器** 几乎没有过冲和振铃！它的秘密武器在于 **线性相位 (linear phase)**：在通带内不同频率分量被延迟的时间几乎完全一致。正因如此，当一个方波脉冲通过 `4` 阶贝塞尔滤波器时（**脉冲响应，原书 Fig. 3-14**），**上升沿与下降沿会被平滑成完全对称的形状**；而通过 `4` 阶切比雪夫滤波器时，左边缘会向**上**过冲，右边缘则会向**下**过冲，波形严重不对称。",
        "如果这是一路**视频信号**（脉冲代表画面中一个白色物体），切比雪夫造成的畸变将是毁灭性的：物体的**左侧边缘会出现刺眼的高亮白边，右侧边缘则会出现发黑的暗影**！因此，凡是对波形形状、脉冲边缘高度敏感的场景，贝塞尔都是当之无愧的最佳选择。"
      ],
      "formula": {
        "expr": "τ_g(ω) = - dφ(ω) / dω ≈ 常数  （线性相位 / 恒定群延迟）",
        "explain": "φ(ω) 是滤波器在角频率 ω 处的相移，τ_g(ω) 是群延迟。贝塞尔滤波器在通带内实现了近似恒定的群延迟（即相移随频率呈线性变化），保证组成脉冲边沿的各次谐波同步到达输出端，从而不产生边沿不对称与振铃。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：阶跃与脉冲响应实验室——直击过冲、振铃与视频边缘失真",
      "instruction": "拖动「滤波器类型」和「阶数」观察阶跃响应的过冲与振铃；打开「脉冲响应模式」，对比底部一维视频扫描线的左右边缘明暗畸变！",
      "controls": [
        {
          "type": "slider",
          "id": "filterType",
          "label": "滤波器 (0贝塞尔/1巴特/2切比)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "poles",
          "label": "滤波器阶数 (极点数)",
          "min": 2,
          "max": 8,
          "step": 2,
          "value": 4,
          "unit": " 阶"
        },
        {
          "type": "toggle",
          "id": "pulseMode",
          "label": "脉冲响应 & 视频边缘预览模式 (关闭=阶跃响应)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction getBesselPoly(N) {\n  let b0 = [1], b1 = [1, 1];\n  for (let k = 2; k <= N; k++) {\n    const f = 2 * k - 1;\n    const next = new Array(b0.length + 2).fill(0);\n    for (let i = 0; i < b0.length; i++) next[i] += b0[i];\n    const offset = next.length - b1.length;\n    for (let i = 0; i < b1.length; i++) next[i + offset] += f * b1[i];\n    b0 = b1; b1 = next;\n  }\n  return b1;\n}\n\nfunction evalPolyMag(poly, w) {\n  let re = 0, im = 0;\n  const deg = poly.length - 1;\n  for (let i = 0; i <= deg; i++) {\n    const p = deg - i;\n    const term = poly[i] * Math.pow(w, p);\n    const mod = p % 4;\n    if (mod === 0) re += term;\n    else if (mod === 1) im += term;\n    else if (mod === 2) re -= term;\n    else im -= term;\n  }\n  return Math.hypot(re, im);\n}\n\nconst besselInfo = {};\n[2, 4, 6, 8].forEach(N => {\n  const poly = getBesselPoly(N);\n  const dc = poly[poly.length - 1];\n  let lo = 0.5, hi = 5.0;\n  for (let it = 0; it < 35; it++) {\n    const mid = 0.5 * (lo + hi);\n    if (dc / evalPolyMag(poly, mid) > Math.SQRT1_2) lo = mid;\n    else hi = mid;\n  }\n  besselInfo[N] = { poly, cN: 0.5 * (lo + hi) };\n});\n\nfunction simulate(fType, N, isPulse) {\n  const wc = 2 * Math.PI;\n  const tMax = isPulse ? 5.0 : 4.0;\n  const dt = 0.0015;\n  const totalSteps = Math.round(tMax / dt);\n  const sampleEvery = 5;\n  const pts = [];\n\n  const uFn = t => {\n    if (!isPulse) return t >= 0 ? 1.0 : 0.0;\n    return (t >= 1.0 && t <= 2.6) ? 1.0 : 0.0;\n  };\n\n  let state = new Array(N).fill(0);\n\n  if (fType === 0) {\n    const info = besselInfo[N];\n    const poly = info.poly;\n    const wScale = wc / info.cN;\n    const deriv = (s, u) => {\n      const ds = new Array(N);\n      for (let k = 0; k < N - 1; k++) ds[k] = wScale * s[k + 1];\n      let acc = poly[N] * u;\n      for (let m = 0; m < N; m++) acc -= poly[N - m] * s[m];\n      ds[N - 1] = wScale * acc;\n      return ds;\n    };\n    for (let step = 0; step <= totalSteps; step++) {\n      const t = step * dt;\n      if (step % sampleEvery === 0) pts.push({ t, y: state[0] });\n      const u0 = uFn(t), uHalf = uFn(t + 0.5 * dt), u1 = uFn(t + dt);\n      const k1 = deriv(state, u0);\n      const s2 = state.map((v, i) => v + 0.5 * dt * k1[i]);\n      const k2 = deriv(s2, uHalf);\n      const s3 = state.map((v, i) => v + 0.5 * dt * k2[i]);\n      const k3 = deriv(s3, uHalf);\n      const s4 = state.map((v, i) => v + dt * k3[i]);\n      const k4 = deriv(s4, u1);\n      for (let i = 0; i < N; i++) {\n        state[i] += (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);\n      }\n    }\n  } else {\n    const sections = [];\n    const numSec = N / 2;\n    const eps = 0.363;\n    const aCheb = Math.asinh(1 / eps) / N;\n    for (let k = 0; k < numSec; k++) {\n      const theta = Math.PI * (2 * k + 1) / (2 * N);\n      if (fType === 1) {\n        sections.push({ b1: 2 * wc * Math.sin(theta), w02: wc * wc });\n      } else {\n        const sig = -Math.sinh(aCheb) * Math.sin(theta) * wc;\n        const omg = Math.cosh(aCheb) * Math.cos(theta) * wc;\n        sections.push({ b1: -2 * sig, w02: sig * sig + omg * omg });\n      }\n    }\n    const deriv = (s, u) => {\n      const ds = new Array(N);\n      let inp = u;\n      for (let k = 0; k < numSec; k++) {\n        const y = s[2 * k], v = s[2 * k + 1];\n        ds[2 * k] = v;\n        ds[2 * k + 1] = sections[k].w02 * (inp - y) - sections[k].b1 * v;\n        inp = y;\n      }\n      return ds;\n    };\n    for (let step = 0; step <= totalSteps; step++) {\n      const t = step * dt;\n      if (step % sampleEvery === 0) pts.push({ t, y: state[N - 2] });\n      const u0 = uFn(t), uHalf = uFn(t + 0.5 * dt), u1 = uFn(t + dt);\n      const k1 = deriv(state, u0);\n      const s2 = state.map((v, i) => v + 0.5 * dt * k1[i]);\n      const k2 = deriv(s2, uHalf);\n      const s3 = state.map((v, i) => v + 0.5 * dt * k2[i]);\n      const k3 = deriv(s3, uHalf);\n      const s4 = state.map((v, i) => v + dt * k3[i]);\n      const k4 = deriv(s4, u1);\n      for (let i = 0; i < N; i++) {\n        state[i] += (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);\n      }\n    }\n  }\n  return pts;\n}\n\nconst names = ['Bessel (贝塞尔)', 'Butterworth (巴特沃斯)', 'Chebyshev (切比雪夫 6%波纹)'];\nconst colors = ['#38bdf8', '#10b981', '#f59e0b'];\n\nfunction draw() {\n  const fType = Math.round(lab.values.filterType);\n  const poles = Math.round(lab.values.poles);\n  const isPulse = lab.values.pulseMode;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 56, padR = 24, padT = 26;\n  const padB = isPulse ? 54 : 34;\n  const pw = W - padL - padR;\n  const ph = H - padT - padB;\n\n  const tMax = isPulse ? 5.0 : 4.0;\n  const yMin = isPulse ? -0.5 : 0.0;\n  const yMax = isPulse ? 1.5 : 1.6;\n\n  const xOf = t => padL + (t / tMax) * pw;\n  const yOf = y => padT + ph * (1 - (y - yMin) / (yMax - yMin));\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.textAlign = 'center';\n  for (let t = 0; t <= tMax; t++) {\n    const x = xOf(t);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();\n    ctx.fillText(isPulse ? String(t * 100) : (t + ' s'), x, padT + ph + 15);\n  }\n\n  ctx.textAlign = 'right';\n  const yTicks = isPulse ? [-0.5, 0.0, 0.5, 1.0, 1.5] : [0.0, 0.4, 0.8, 1.0, 1.2, 1.6];\n  yTicks.forEach(v => {\n    const y = yOf(v);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();\n    ctx.fillText(v.toFixed(1), padL - 8, y + 4);\n  });\n\n  ctx.save();\n  ctx.setLineDash([5, 5]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  if (!isPulse) {\n    ctx.moveTo(xOf(0), yOf(0));\n    ctx.lineTo(xOf(0), yOf(1));\n    ctx.lineTo(xOf(tMax), yOf(1));\n  } else {\n    ctx.moveTo(xOf(0), yOf(0));\n    ctx.lineTo(xOf(1.0), yOf(0));\n    ctx.lineTo(xOf(1.0), yOf(1));\n    ctx.lineTo(xOf(2.6), yOf(1));\n    ctx.lineTo(xOf(2.6), yOf(0));\n    ctx.lineTo(xOf(5.0), yOf(0));\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  let activePts = [];\n  [0, 1, 2].forEach(t => {\n    const pts = simulate(t, poles, isPulse);\n    if (t === fType) activePts = pts;\n    ctx.beginPath();\n    pts.forEach((p, idx) => {\n      const x = xOf(p.t), y = yOf(p.y);\n      if (idx === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    });\n    ctx.strokeStyle = (t === fType) ? colors[t] : 'rgba(255,255,255,0.16)';\n    ctx.lineWidth = (t === fType) ? 2.8 : 1.2;\n    ctx.stroke();\n  });\n\n  let maxY = -Infinity, minY = Infinity;\n  activePts.forEach(p => {\n    if (p.y > maxY) maxY = p.y;\n    if (p.y < minY) minY = p.y;\n  });\n  const overshootPct = Math.max(0, (maxY - 1.0) * 100);\n  const undershootPct = Math.max(0, -minY * 100);\n\n  if (isPulse) {\n    const barY = H - 24;\n    const barH = 14;\n    ctx.textAlign = 'right';\n    ctx.fillStyle = 'rgba(248,250,252,0.75)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('视频亮条:', padL - 6, barY + 11);\n    for (let i = 0; i < activePts.length - 1; i++) {\n      const p0 = activePts[i], p1 = activePts[i + 1];\n      const x0 = xOf(p0.t), x1 = xOf(p1.t);\n      const lum = Math.max(0, Math.min(255, Math.round(35 + p0.y * 175)));\n      ctx.fillStyle = 'rgb(' + lum + ',' + lum + ',' + lum + ')';\n      ctx.fillRect(x0, barY, Math.max(1.5, x1 - x0 + 0.5), barH);\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n    ctx.strokeRect(padL, barY, pw, barH);\n  }\n\n  ctx.textAlign = 'left';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = colors[fType];\n  ctx.fillText(names[fType] + '  |  ' + poles + ' 阶  |  ' + (isPulse ? '脉冲响应 (线性相位对称性检测)' : '阶跃响应 (fc = 1 Hz)'), padL + 8, 16);\n\n  if (!isPulse) {\n    let t10 = 0, t90 = 0;\n    for (const p of activePts) {\n      if (t10 === 0 && p.y >= 0.1) t10 = p.t;\n      if (t90 === 0 && p.y >= 0.9) { t90 = p.t; break; }\n    }\n    lab.setReadout('最大峰值: ' + maxY.toFixed(3) + ' | 过冲 (Overshoot): ' + overshootPct.toFixed(1) + '% | 10%~90% 上升时间: ' + (t90 - t10).toFixed(2) + ' s');\n  } else {\n    lab.setReadout('左沿向上过冲: +' + overshootPct.toFixed(1) + '% (亮边) | 右沿向下过冲: -' + undershootPct.toFixed(1) + '% (暗边) | ' + (fType === 0 ? '左右边沿高度对称 (线性相位)' : '边沿不对称振铃畸变'));\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看图避坑：只看对数坐标会忽略通带波纹，只看线性坐标会低估阻带衰减，分析滤波器频响必须对数、线性两张图一起看。",
        "三大滤波器分工：切比雪夫优化【阻带滚降】（代价是通带波纹和严重过冲振铃）；巴特沃斯优化【通带平坦度】（最大平坦，折中方案）；贝塞尔优化【时域阶跃/脉冲响应】（线性相位、边沿对称、无过冲，代价是滚降最慢）。",
        "阶数不是越高越好：提高极点阶数（2 -> 4 -> 8）虽能加快滚降，但会同步加剧巴特沃斯和切比雪夫的时域过冲与振铃延迟。",
        "图像与脉冲处理禁区：在视频扫描、雷达脉冲或高速数字边缘整形等对波形形状敏感的系统中，切忌盲目选用切比雪夫，否则上升/下降沿的不对称过冲会产生严重的亮边与暗影伪影。"
      ]
    }
  ]
});
