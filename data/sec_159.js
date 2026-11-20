window.__BOOK_REGISTER_SECTION__("sec_159", {
  "title": "巅峰对决 #2：加窗 Sinc（FIR）vs. 切比雪夫（IIR）",
  "intuition": "频域滤波领域的终极较量：加窗 Sinc 是精度无上限的重装坦克，切比雪夫是速度领先一个数量级的超跑刺客。",
  "blocks": [
    {
      "type": "concept",
      "heading": "第一回合：公平起跑线与中等性能较量",
      "paragraphs": [
        "加窗 Sinc（Windowed-Sinc）和切比雪夫（Chebyshev）都是专门用来做**频域分离**的数字滤波器——把保留的通带频率和需要剔除的阻带频率干净地切开。但两者的底层架构完全不同：**加窗 Sinc 是基于卷积实现的 FIR 滤波器，而切比雪夫是基于递归（反馈）实现的 IIR 滤波器**。",
        "由于切比雪夫滤波器的频响形状会随截止频率改变，为了打造公平的擂台，我们把双方都设定在归一化截止频率 `fc = 0.2`。一方派出 **6 极点、0.5% 通带纹波的切比雪夫低通滤波器**，另一方派出 **51 点核长度的加窗 Sinc 滤波器**。在这个配置下，两者的 90% 到 10% 滚降斜率完全一致（对应原书图 21-2a）。",
        "近身肉搏开始后，差距迅速显现：",
        "1. **通带纹波**：切比雪夫在通带内有 0.5% 的波动，而加窗 Sinc 完全平坦。不过只要愿意，切比雪夫的纹波也可以轻松调成 0%（即退化为巴特沃斯），因此这局不算分。",
        "2. **阻带衰减（决定性差距）**：切换到对数坐标（dB，图 21-2b）后，**加窗 Sinc 完胜切比雪夫**。51 点加窗 Sinc 在阻带能迅速砸穿 -75 dB 以下，而 6 极点切比雪夫的阻带是缓慢斜坡式下降的。",
        "3. **阶跃响应（平局）**：图 21-3 展示了两者的时域阶跃响应——都很糟糕（存在明显过冲与振铃），这正是频域锐利滤波器的通病。切比雪夫有非线性相位导致波形不对称（但可通过双向滤波校正），加窗 Sinc 则是零相位且过冲略小，总体算平手。"
      ],
      "formula": {
        "expr": "FIR: y[n] = Σ h[k]·x[n-k]   |   IIR: y[n] = Σ a_k·x[n-k] + Σ b_k·y[n-k]",
        "explain": "x[n] 为输入信号，y[n] 为输出信号。加窗 Sinc（FIR）只对历史输入做加权求和（卷积），天然稳定且可做到零相位；切比雪夫（IIR）把过去的滤波输出 y[n-k] 也反馈回来参与计算（递归），用极少的参数就能撬动陡峭的滚降。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：中低强度频域对比（幅度 / dB / 阶跃响应与听感）",
      "instruction": "拖动截止频率与 Sinc 点数滑块，切换对数(dB)或阶跃响应视图；点击播放测试音（320Hz 有效信号 + 2000Hz 刺耳干扰），切换听感对象亲耳对比两者的阻带抑噪能力。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 fc",
          "min": 0.06,
          "max": 0.42,
          "step": 0.01,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "kernelLen",
          "label": "加窗 Sinc 点数",
          "min": 21,
          "max": 101,
          "step": 10,
          "value": 51,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "对数坐标 (dB)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "stepView",
          "label": "观察阶跃响应 (Step)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "audioSinc",
          "label": "听感切换：加窗Sinc (关=切比雪夫)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet audioCtx = null;\nlet oscPass = null;\nlet oscInterf = null;\nlet gainPass = null;\nlet gainInterf = null;\nlet masterGain = null;\nlet isPlaying = false;\n\nfunction buildCheby6Biquads(fc) {\n  const eps = 0.100376;\n  const gamma = Math.asinh(1 / eps) / 6;\n  const scale3dB = Math.cosh(Math.acosh(1 / eps) / 6);\n  const K = Math.tan(Math.PI * Math.max(0.01, Math.min(0.49, fc)));\n  const sections = [];\n  for (let k = 1; k <= 3; k++) {\n    const theta = Math.PI * (2 * k - 1) / 12;\n    const sigma = -Math.sinh(gamma) * Math.sin(theta) / scale3dB;\n    const omega = Math.cosh(gamma) * Math.cos(theta) / scale3dB;\n    const c = sigma * sigma + omega * omega;\n    const K2 = K * K;\n    const d0 = 1 - 2 * sigma * K + c * K2;\n    sections.push({\n      b0: (c * K2) / d0,\n      b1: (2 * c * K2) / d0,\n      b2: (c * K2) / d0,\n      a1: (-2 + 2 * c * K2) / d0,\n      a2: (1 + 2 * sigma * K + c * K2) / d0\n    });\n  }\n  return sections;\n}\n\nfunction chebyMag(sections, f) {\n  const w = 2 * Math.PI * f;\n  const c1 = Math.cos(w), s1 = -Math.sin(w);\n  const c2 = Math.cos(2 * w), s2 = -Math.sin(2 * w);\n  let mag = 0.995;\n  for (let i = 0; i < sections.length; i++) {\n    const s = sections[i];\n    const nr = s.b0 + s.b1 * c1 + s.b2 * c2;\n    const ni = s.b1 * s1 + s.b2 * s2;\n    const dr = 1 + s.a1 * c1 + s.a2 * c2;\n    const di = s.a1 * s1 + s.a2 * s2;\n    mag *= Math.hypot(nr, ni) / Math.max(1e-12, Math.hypot(dr, di));\n  }\n  return mag;\n}\n\nfunction buildWindowedSinc(fc, len) {\n  const M = len - 1;\n  const h = new Array(len);\n  let sum = 0;\n  for (let i = 0; i < len; i++) {\n    const x = i - M / 2;\n    const sinc = Math.abs(x) < 1e-8 ? 2 * fc : Math.sin(2 * Math.PI * fc * x) / (Math.PI * x);\n    const win = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / M) + 0.08 * Math.cos(4 * Math.PI * i / M);\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (let i = 0; i < len; i++) h[i] /= sum;\n  return h;\n}\n\nfunction sincMag(h, f) {\n  const w = 2 * Math.PI * f;\n  let re = 0, im = 0;\n  for (let i = 0; i < h.length; i++) {\n    re += h[i] * Math.cos(w * i);\n    im -= h[i] * Math.sin(w * i);\n  }\n  return Math.hypot(re, im);\n}\n\nfunction updateAudio(magPass, magInterf) {\n  if (lab.values.play && !isPlaying) {\n    try {\n      audioCtx = lab.getAudioContext();\n      if (audioCtx.state === 'suspended') audioCtx.resume();\n      oscPass = audioCtx.createOscillator();\n      oscInterf = audioCtx.createOscillator();\n      gainPass = audioCtx.createGain();\n      gainInterf = audioCtx.createGain();\n      masterGain = audioCtx.createGain();\n      oscPass.type = 'sine';\n      oscPass.frequency.value = 320;\n      oscInterf.type = 'sine';\n      oscInterf.frequency.value = 2000;\n      masterGain.gain.value = 0.25;\n      gainPass.gain.value = magPass * 0.45;\n      gainInterf.gain.value = magInterf * 0.65;\n      oscPass.connect(gainPass).connect(masterGain);\n      oscInterf.connect(gainInterf).connect(masterGain);\n      masterGain.connect(audioCtx.destination);\n      oscPass.start();\n      oscInterf.start();\n      isPlaying = true;\n    } catch (e) {}\n  } else if (!lab.values.play && isPlaying) {\n    try {\n      if (oscPass) { oscPass.stop(); oscPass.disconnect(); }\n      if (oscInterf) { oscInterf.stop(); oscInterf.disconnect(); }\n      if (masterGain) masterGain.disconnect();\n    } catch (e) {}\n    oscPass = null; oscInterf = null; isPlaying = false;\n  }\n  if (isPlaying && audioCtx && gainPass && gainInterf) {\n    const t = audioCtx.currentTime;\n    gainPass.gain.setTargetAtTime(magPass * 0.45, t, 0.03);\n    gainInterf.gain.setTargetAtTime(magInterf * 0.65, t, 0.03);\n  }\n}\n\nfunction drawGrid(px, py, pw, ph, xTicks, yTicks, xLabels, yLabels, xTitle, yTitle) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  for (let i = 0; i < xTicks.length; i++) {\n    const x = px + xTicks[i] * pw;\n    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + ph); ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText(xLabels[i], x, py + ph + 14);\n  }\n  for (let i = 0; i < yTicks.length; i++) {\n    const y = py + (1 - yTicks[i]) * ph;\n    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText(yLabels[i], px - 6, y + 4);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(px, py, pw, ph);\n  ctx.fillStyle = 'rgba(248,250,252,0.85)';\n  ctx.textAlign = 'center';\n  ctx.fillText(xTitle, px + pw / 2, py + ph + 28);\n  ctx.save();\n  ctx.translate(15, py + ph / 2);\n  ctx.rotate(-Math.PI / 2);\n  ctx.fillText(yTitle, 0, 0);\n  ctx.restore();\n}\n\nlab.onUpdate(() => {\n  const fc = lab.values.fc;\n  const kernelLen = lab.values.kernelLen;\n  const dbScale = lab.values.dbScale;\n  const stepView = lab.values.stepView;\n  const audioSinc = lab.values.audioSinc;\n\n  const sections = buildCheby6Biquads(fc);\n  const sincH = buildWindowedSinc(fc, kernelLen);\n\n  const fTestPass = 0.04;\n  const fTestInterf = 0.25;\n  const chebyInterf = chebyMag(sections, fTestInterf);\n  const sincInterf = sincMag(sincH, fTestInterf);\n  const chebyPass = chebyMag(sections, fTestPass);\n  const sincPass = sincMag(sincH, fTestPass);\n  updateAudio(audioSinc ? sincPass : chebyPass, audioSinc ? sincInterf : chebyInterf);\n\n  ctx.clearRect(0, 0, W, H);\n  const px = 58, py = 20, pw = W - 82, ph = H - 56;\n\n  if (!stepView) {\n    if (dbScale) {\n      drawGrid(px, py, pw, ph, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0.2, 0.4, 0.6, 0.8, 1], ['0', '0.1', '0.2', '0.3', '0.4', '0.5'], ['-100', '-80', '-60', '-40', '-20', '0'], '归一化频率 (Frequency)', '幅度 (dB)');\n    } else {\n      drawGrid(px, py, pw, ph, [0, 0.2, 0.4, 0.6, 0.8, 1], [0, 0.333, 0.667, 1], ['0', '0.1', '0.2', '0.3', '0.4', '0.5'], ['0.0', '0.5', '1.0', '1.5'], '归一化频率 (Frequency)', '线性幅度');\n    }\n    const xTest = px + (fTestInterf / 0.5) * pw;\n    ctx.strokeStyle = 'rgba(236,72,153,0.45)';\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath(); ctx.moveTo(xTest, py); ctx.lineTo(xTest, py + ph); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('2kHz干扰点(f=0.25)', xTest + 5, py + 14);\n\n    const mapY = (m) => {\n      if (dbScale) {\n        const db = Math.max(-100, Math.min(0, 20 * Math.log10(Math.max(1e-6, m))));\n        return py + (1 - (db + 100) / 100) * ph;\n      }\n      return py + (1 - Math.min(1.5, m) / 1.5) * ph;\n    };\n\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let i = 0; i <= 240; i++) {\n      const f = 0.5 * (i / 240);\n      const x = px + (i / 240) * pw;\n      const y = mapY(chebyMag(sections, f));\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let i = 0; i <= 240; i++) {\n      const f = 0.5 * (i / 240);\n      const x = px + (i / 240) * pw;\n      const y = mapY(sincMag(sincH, f));\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  } else {\n    drawGrid(px, py, pw, ph, [0, 0.167, 0.333, 0.5, 0.667, 0.833, 1], [0.2, 0.4, 0.6, 0.8, 1], ['-30', '-20', '-10', '0', '10', '20', '30'], ['0.0', '0.5', '1.0', '1.5', '2.0'], '样本序号 (Sample number)', '阶跃幅度');\n    const half = (kernelLen - 1) / 2;\n    const Nmax = 61;\n    const sincStep = [];\n    let acc = 0;\n    for (let n = -30; n <= 30; n++) {\n      const idx = n + half;\n      if (idx >= 0 && idx < kernelLen) acc += sincH[idx];\n      else if (idx >= kernelLen && n === -30) acc = 1;\n      sincStep.push(acc);\n    }\n    const chebyStep = [];\n    const st = sections.map(() => ({ x1: 0, x2: 0, y1: 0, y2: 0 }));\n    for (let n = -30; n <= 30; n++) {\n      let v = n >= 0 ? 0.995 : 0;\n      for (let s = 0; s < 3; s++) {\n        const sec = sections[s], z = st[s];\n        const y = sec.b0 * v + sec.b1 * z.x1 + sec.b2 * z.x2 - sec.a1 * z.y1 - sec.a2 * z.y2;\n        z.x2 = z.x1; z.x1 = v; z.y2 = z.y1; z.y1 = y;\n        v = y;\n      }\n      chebyStep.push(v);\n    }\n    const mapSY = (val) => py + (1 - (val + 0.5) / 2.5) * ph;\n\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i < Nmax; i++) {\n      const x = px + (i / (Nmax - 1)) * pw;\n      const y = mapSY(chebyStep[i]);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i < Nmax; i++) {\n      const x = px + (i / (Nmax - 1)) * pw;\n      const y = mapSY(sincStep[i]);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 加窗 Sinc (' + kernelLen + '点 FIR)', px + 14, py + 18);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('— 切比雪夫 (6极点 IIR)', px + 14, py + 36);\n\n  const cDb = (20 * Math.log10(Math.max(1e-6, chebyInterf))).toFixed(1);\n  const sDb = (20 * Math.log10(Math.max(1e-6, sincInterf))).toFixed(1);\n  const playingTag = lab.values.play ? (' | 正在发声: ' + (audioSinc ? '加窗Sinc' : '切比雪夫')) : '';\n  lab.setReadout('fc=' + fc.toFixed(2) + ' | f=0.25处衰减: 切比雪夫 ' + cDb + ' dB vs 加窗Sinc ' + sDb + ' dB' + playingTag);\n});"
    },
    {
      "type": "concept",
      "heading": "第二回合：极限性能较量（120V 电网中的 100mV 微弱信号）",
      "paragraphs": [
        "如果只是处理普通滤波，两个选手都能胜任。但真正拉开分水岭的是**极致性能**与**运行速度**这两个硬核指标。",
        "想象一个极其残酷的工程难题：你要从 **120 伏、60 赫兹的强干扰工频电源线**上，提取出一个仅有 **100 毫伏、61 赫兹的微弱信号**！这要求滤波器在 60Hz 和 61Hz 之间拥有极窄的过渡带，以及深不见底的阻带衰减。",
        "原书图 21-4 对比了两者的极限能力：切比雪夫方派出了在单精度浮点数下、截止频率 `fc = 0.05` 时**能稳定运行的最高阶数极限（6 极点）**；而加窗 Sinc 方则把两个 501 点的核做**自卷积**，合成了一个 **1001 点** 的核（自卷积会让阻带衰减的 dB 数直接翻倍！）。",
        "结果毫无悬念：**加窗 Sinc 彻底碾压切比雪夫**。递归滤波器（IIR）由于极点靠近单位圆时对量化误差和数值精度极度敏感，哪怕改用双精度或多级联，性能上限依然很低；而加窗 Sinc（FIR）只要你愿意等，性能几乎可以堆砌到任何你想要的极致水准。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "第三回合：速度较量（法拉利 vs. 卡丁车）",
      "paragraphs": [
        "加窗 Sinc 的性能确实强到令人发指，但它必须付出高昂的代价——**计算速度**。作者把两者的速度对比形容为**法拉利赛车（切比雪夫 IIR）与卡丁车（加窗 Sinc FIR）的竞速**。",
        "观察原书图 21-5 的相对执行时间曲线你会发现一个微妙的规律：在频率靠近 `0`（极低频）和 `0.5`（奈奎斯特频率附近）时，加窗 Sinc 的耗时突然暴涨！原因在于：**切比雪夫 IIR 在低频和高频处的滚降天然变得更陡峭**；为了保证对比公平（匹配相同的滚降性能），加窗 Sinc 必须被迫大幅拉长滤波器核的长度，导致无论是直接卷积还是 FFT 快速卷积，计算耗时都急剧攀升。",
        "工程上的经验法则是：**在同等滤波性能下，IIR 滤波器的运行速度通常比 FIR 滤波器快大约一个数量级（10 倍左右，相当于卡丁车 15 mph 对比法拉利 150 mph）**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 2：极限阻带深度 vs. 算力耗时沙盘",
      "instruction": "拖动目标截止频率 fc 与加窗 Sinc 核长度，同时观察左图（图 21-4 极限阻带对比）与右图（图 21-5 等效性能下的相对执行耗时游标）。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 fc",
          "min": 0.02,
          "max": 0.48,
          "step": 0.01,
          "value": 0.05,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sincLen",
          "label": "加窗 Sinc 核长度",
          "min": 101,
          "max": 1001,
          "step": 100,
          "value": 1001,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "doubleConv",
          "label": "自卷积增强阻带 (图 21-4)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showFFT",
          "label": "显示 FFT 卷积耗时曲线",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction buildCheby6Biquads(fc) {\n  const eps = 0.100376;\n  const gamma = Math.asinh(1 / eps) / 6;\n  const scale3dB = Math.cosh(Math.acosh(1 / eps) / 6);\n  const K = Math.tan(Math.PI * Math.max(0.01, Math.min(0.49, fc)));\n  const sections = [];\n  for (let k = 1; k <= 3; k++) {\n    const theta = Math.PI * (2 * k - 1) / 12;\n    const sigma = -Math.sinh(gamma) * Math.sin(theta) / scale3dB;\n    const omega = Math.cosh(gamma) * Math.cos(theta) / scale3dB;\n    const c = sigma * sigma + omega * omega;\n    const K2 = K * K;\n    const d0 = 1 - 2 * sigma * K + c * K2;\n    sections.push({\n      b0: (c * K2) / d0,\n      b1: (2 * c * K2) / d0,\n      b2: (c * K2) / d0,\n      a1: (-2 + 2 * c * K2) / d0,\n      a2: (1 + 2 * sigma * K + c * K2) / d0\n    });\n  }\n  return sections;\n}\n\nfunction chebyMag(sections, f) {\n  const w = 2 * Math.PI * f;\n  const c1 = Math.cos(w), s1 = -Math.sin(w);\n  const c2 = Math.cos(2 * w), s2 = -Math.sin(2 * w);\n  let mag = 0.995;\n  for (let i = 0; i < sections.length; i++) {\n    const s = sections[i];\n    const nr = s.b0 + s.b1 * c1 + s.b2 * c2;\n    const ni = s.b1 * s1 + s.b2 * s2;\n    const dr = 1 + s.a1 * c1 + s.a2 * c2;\n    const di = s.a1 * s1 + s.a2 * s2;\n    mag *= Math.hypot(nr, ni) / Math.max(1e-12, Math.hypot(dr, di));\n  }\n  return mag;\n}\n\nfunction buildWindowedSinc(fc, len) {\n  const M = len - 1;\n  const h = new Array(len);\n  let sum = 0;\n  for (let i = 0; i < len; i++) {\n    const x = i - M / 2;\n    const sinc = Math.abs(x) < 1e-8 ? 2 * fc : Math.sin(2 * Math.PI * fc * x) / (Math.PI * x);\n    const win = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / M) + 0.08 * Math.cos(4 * Math.PI * i / M);\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (let i = 0; i < len; i++) h[i] /= sum;\n  return h;\n}\n\nfunction sincMag(h, f) {\n  const w = 2 * Math.PI * f;\n  let re = 0, im = 0;\n  for (let i = 0; i < h.length; i++) {\n    re += h[i] * Math.cos(w * i);\n    im -= h[i] * Math.sin(w * i);\n  }\n  return Math.hypot(re, im);\n}\n\nfunction drawPanelGrid(px, py, pw, ph, title, yLabels, xTitle, yTitle) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '10px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  for (let i = 0; i <= 5; i++) {\n    const x = px + (i / 5) * pw;\n    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + ph); ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText((i * 0.1).toFixed(1), x, py + ph + 13);\n  }\n  const nY = yLabels.length - 1;\n  for (let i = 0; i <= nY; i++) {\n    const y = py + (1 - i / nY) * ph;\n    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText(yLabels[i], px - 5, y + 3);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.strokeRect(px, py, pw, ph);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, px + pw / 2, py - 7);\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.fillText(xTitle, px + pw / 2, py + ph + 26);\n  ctx.save();\n  ctx.translate(px - 32, py + ph / 2);\n  ctx.rotate(-Math.PI / 2);\n  ctx.fillText(yTitle, 0, 0);\n  ctx.restore();\n}\n\nlab.onUpdate(() => {\n  const fc = lab.values.fc;\n  const sincLen = lab.values.sincLen;\n  const doubleConv = lab.values.doubleConv;\n  const showFFT = lab.values.showFFT;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lpx = 50, lpy = 22, lpw = 290, lph = 180;\n  drawPanelGrid(lpx, lpy, lpw, lph, '极限阻带衰减对比 (dB)', ['-100', '-80', '-60', '-40', '-20', '0', '20'], '频率 (fc=' + fc.toFixed(2) + ')', '幅度 (dB)');\n\n  const sections = buildCheby6Biquads(fc);\n  const baseLen = doubleConv ? Math.max(51, Math.floor((sincLen + 1) / 2)) : sincLen;\n  const sincH = buildWindowedSinc(fc, baseLen);\n  const mapLdB = (m) => {\n    const db = Math.max(-100, Math.min(20, 20 * Math.log10(Math.max(1e-7, m))));\n    return lpy + (1 - (db + 100) / 120) * lph;\n  };\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 180; i++) {\n    const f = 0.5 * (i / 180);\n    const x = lpx + (i / 180) * lpw;\n    const y = mapLdB(chebyMag(sections, f));\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 180; i++) {\n    const f = 0.5 * (i / 180);\n    const x = lpx + (i / 180) * lpw;\n    let mag = sincMag(sincH, f);\n    if (doubleConv) mag = mag * mag;\n    const y = mapLdB(mag);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('加窗Sinc ' + sincLen + '点' + (doubleConv ? '(自卷积)' : ''), lpx + lpw - 6, lpy + 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('6极点切比雪夫', lpx + lpw - 6, lpy + 32);\n\n  const rpx = 410, rpy = 22, rpw = 290, rph = 180;\n  drawPanelGrid(rpx, rpy, rpw, rph, '等效性能相对执行时间 (图21-5)', ['0', '10', '20', '30', '40', '50'], '截止频率', '相对执行时间');\n\n  const tStd = (f) => 4.0 / Math.sin(Math.PI * Math.max(0.015, Math.min(0.485, f))) + 2.0;\n  const tFFT = (f) => 13.0 + 1.8 * Math.max(0, Math.log2(0.12 / Math.sin(Math.PI * Math.max(0.012, Math.min(0.488, f)))));\n  const tIIR = 1.1;\n  const mapTimeY = (t) => rpy + (1 - Math.min(50, t) / 50) * rph;\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  ctx.moveTo(rpx, mapTimeY(tIIR));\n  ctx.lineTo(rpx + rpw, mapTimeY(tIIR));\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  let started = false;\n  for (let i = 1; i < 180; i++) {\n    const f = 0.5 * (i / 180);\n    const tv = tStd(f);\n    const x = rpx + (i / 180) * rpw;\n    const y = mapTimeY(tv);\n    if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (showFFT) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.2;\n    ctx.setLineDash([5, 3]);\n    ctx.beginPath();\n    for (let i = 1; i < 180; i++) {\n      const f = 0.5 * (i / 180);\n      const x = rpx + (i / 180) * rpw;\n      const y = mapTimeY(tFFT(f));\n      if (i === 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  const cx = rpx + (fc / 0.5) * rpw;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(cx, rpy); ctx.lineTo(cx, rpy + rph); ctx.stroke();\n  ctx.setLineDash([]);\n\n  const curStd = tStd(fc);\n  const curFFT = tFFT(fc);\n  const bestFIR = showFFT ? Math.min(curStd, curFFT) : curStd;\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(cx, mapTimeY(Math.min(50, curStd)), 4, 0, Math.PI * 2); ctx.fill();\n  if (showFFT) {\n    ctx.beginPath(); ctx.arc(cx, mapTimeY(curFFT), 4, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('标准卷积 FIR', rpx + rpw * 0.5, rpy + 18);\n  if (showFFT) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('FFT 卷积 FIR', rpx + rpw * 0.5, rpy + 34);\n  }\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('递归 IIR (法拉利)', rpx + rpw * 0.72, mapTimeY(tIIR) - 7);\n\n  const speedup = (bestFIR / tIIR).toFixed(1);\n  lab.setReadout('fc=' + fc.toFixed(2) + ' | 等效标准卷积耗时 ' + curStd.toFixed(1) + 'x | FFT卷积 ' + curFFT.toFixed(1) + 'x | 当前频点 IIR 比最优 FIR 快约 ' + speedup + ' 倍');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【选型黄金法则】要**极速、实时性、低算力开销**（如嵌入式微控制器实时音频/控制），首选 **切比雪夫 IIR**（通常比等效 FIR 快约 10 倍）；要**极致阻带衰减、任意定制频响或严格线性相位**（如强背景噪声中抠出微弱信号），必须上 **加窗 Sinc FIR**。",
        "【单精度浮点极点陷阱】不要以为切比雪夫可以无限堆极点：在低截止频率（如 `fc = 0.05`）且使用单精度浮点时，超过 **6 个极点** 就极易出现数值不稳定和截断误差崩溃。",
        "【自卷积黑科技】当单个加窗 Sinc 阻带衰减不够深时，把一个 `M` 点核与它自身做一次卷积得到 `2M-1` 点核，可以把阻带衰减的 dB 深度直接翻倍。",
        "【相位与滤波方式】切比雪夫天生具有非线性相位（阶跃响应前后不对称），但在离线处理中可以通过**正反双向滤波**来彻底抵消相位畸变；加窗 Sinc 则天生对称且为零相位。"
      ]
    }
  ]
});
