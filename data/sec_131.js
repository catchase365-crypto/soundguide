window.__BOOK_REGISTER_SECTION__("sec_131", {
  "title": "数字滤波器的频域参数与频响测量 (Frequency Domain Parameters)",
  "intuition": "在频域眼里，好滤波器就像一扇“非黑即白”的安检门：通带平如镜、过渡带陡如崖、阻带深不见底；而想要看清这扇门的真实轮廓，靠的是把滤波器核“补零”后做 DFT 采样。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、四种基本频响与“截止频率”的潜规则",
      "paragraphs": [
        "频域滤波器的使命很纯粹：让一部分频率成分毫发无损地通过，同时把另一部分频率彻底拦截。根据拦截位置的不同，工程中最常用的有四种基本频率响应：**低通（Low-pass）**、**高通（High-pass）**、**带通（Band-pass）**和**带阻（Band-reject）**。",
        "无论哪种形状，一条频响曲线都可以拆成三段：**通带（Passband）**是放行区，**阻带（Stopband）**是封锁区，夹在中间的斜坡叫**过渡带（Transition band）**。所谓**快速滚降（Fast roll-off）**，本质上就是过渡带非常窄。",
        "通带和过渡带的交界处被称为**截止频率（Cutoff frequency）**。这里有一个极容易踩的坑：**模拟滤波器**行业通常把幅度衰减到 **0.707（即 -3 dB）**的位置规定为截止频率；但**数字滤波器**并没有统一标准，工程上 **99%、90%、70.7%、50%** 这几个幅度点都有人拿来当截止频率。看别人论文或调库函数时，一定要先确认它用的是哪种定义！"
      ],
      "formula": {
        "expr": "Amplitude_dB = 20 · log10( |H(f)| ) ,   0.707 ≈ -3.01 dB",
        "explain": "|H(f)| 是滤波器在归一化频率 f 处的幅度增益。当幅度降到 0.707 倍（功率降为一半）时，换算成对数分贝正好约为 -3 dB。"
      }
    },
    {
      "type": "concept",
      "heading": "二、评估频域性能的三大核心指标（以及为什么不提“相位”）",
      "paragraphs": [
        "在频域里衡量一个滤波器好不好，主要看三个硬指标（对应原书图 14-4）：**（1）滚降速度（Roll-off sharpness）**——过渡带越陡，越能把挨得很近的两个频率硬生生拆开；**（2）通带纹波（Passband ripple）**——通带必须尽可能平坦，如果通带像波浪一样起伏，原本该保留的信号幅度就会被扭曲；**（3）阻带衰减（Stopband attenuation）**——阻带压得越低（例如 -80 dB 甚至 -120 dB，而不是糟糕的 -30 dB），干扰噪声才越不容易漏网。",
        "细心的读者会发现：三大指标里竟然完全没提**相位（Phase）**？原因有二：第一，在绝大多数频域应用场景（比如音频处理）中，信号本身的相位几乎是随机的，人耳和业务算法并不关心它；第二，如果某天你真的在乎相位，**数字滤波器可以非常轻松地做到“零相移”（所有频率延迟一致或无相移）**，相比之下，模拟滤波器在相位保真度方面简直惨不忍睹。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：亲手调节“频域三指标”与实时听感对比",
      "instruction": "拖动下方滑块改变截止频率、滚降陡峭度、通带纹波和阻带衰减，可切换 dB 对数坐标，并点击“播放测试音”听出 2.1 kHz 邻频与 3.6 kHz 高频啸叫是如何被“抹掉”的。",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "截止频率 fc",
          "min": 0.1,
          "max": 0.4,
          "step": 0.01,
          "value": 0.2,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "rolloff",
          "label": "滚降陡峭度",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "ripple",
          "label": "通带纹波",
          "min": 0,
          "max": 0.25,
          "step": 0.01,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "attenuation",
          "label": "阻带衰减",
          "min": 15,
          "max": 100,
          "step": 5,
          "value": 60,
          "unit": " dB"
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "对数坐标 (dB)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音 (基音+高频干扰)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nlet ac = null, oscs = null, masterGain = null, playing = false;\n\nfunction evalH(f) {\n  const fc = lab.values.cutoff;\n  const k = lab.values.rolloff * 18;\n  const rip = lab.values.ripple;\n  const floor = Math.pow(10, -lab.values.attenuation / 20);\n  const sig = 1 / (1 + Math.exp(k * (f - fc)));\n  const passMask = 1 / (1 + Math.exp(35 * (f - fc * 0.92)));\n  const ripWave = rip * Math.sin((f / Math.max(0.05, fc)) * Math.PI * 5) * Math.sin(Math.min(1, f / 0.05) * Math.PI * 0.5);\n  const stopWave = 0.55 * floor * Math.abs(Math.sin((f - fc) * Math.PI * 36)) * (1 - sig);\n  const mag = sig * (1 + ripWave * passMask) + (1 - sig) * floor * 0.65 + stopWave;\n  return Math.max(1e-6, Math.min(1.45, mag));\n}\n\nconst testTones = [\n  { hz: 350, fn: 0.035, label: '350Hz(基音)', color: '#10b981' },\n  { hz: 2100, fn: 0.21, label: '2.1kHz(邻频)', color: '#f59e0b' },\n  { hz: 3600, fn: 0.36, label: '3.6kHz(高频噪)', color: '#ec4899' }\n];\n\nfunction syncAudio() {\n  const want = !!lab.values.play;\n  if (want && !playing) {\n    ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    masterGain = ac.createGain();\n    masterGain.gain.value = 0.16;\n    masterGain.connect(ac.destination);\n    oscs = testTones.map(t => {\n      const o = ac.createOscillator();\n      const g = ac.createGain();\n      o.type = t.fn < 0.1 ? 'triangle' : 'sine';\n      o.frequency.value = t.hz;\n      g.gain.value = Math.min(1.2, evalH(t.fn));\n      o.connect(g);\n      g.connect(masterGain);\n      o.start();\n      return { o, g, t };\n    });\n    playing = true;\n  } else if (!want && playing) {\n    if (oscs) oscs.forEach(item => { try { item.o.stop(); item.o.disconnect(); } catch (e) {} });\n    if (masterGain) { try { masterGain.disconnect(); } catch (e) {} }\n    oscs = null; masterGain = null; playing = false;\n  } else if (want && playing && oscs && ac) {\n    const now = ac.currentTime;\n    oscs.forEach(item => {\n      item.g.gain.setTargetAtTime(Math.min(1.2, evalH(item.t.fn)), now, 0.02);\n    });\n  }\n}\n\nfunction draw() {\n  syncAudio();\n  ctx.clearRect(0, 0, W, H);\n  const padL = 58, padR = 24, padT = 22, padB = 34;\n  const pw = W - padL - padR, ph = H - padT - padB;\n  const isDb = !!lab.values.dbScale;\n  const fc = lab.values.cutoff;\n\n  function xOf(f) { return padL + (f / 0.5) * pw; }\n  function yOf(mag) {\n    if (!isDb) return padT + ph - (mag / 1.4) * ph;\n    const db = Math.max(-110, Math.min(10, 20 * Math.log10(Math.max(1e-6, mag))));\n    return padT + ((10 - db) / 120) * ph;\n  }\n\n  const xFc = xOf(fc);\n  const transW = Math.min(0.14, 0.14 / Math.sqrt(lab.values.rolloff));\n  const xStop = Math.min(padL + pw, xOf(fc + transW));\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.07)';\n  ctx.fillRect(padL, padT, Math.max(0, xFc - padL), ph);\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';\n  ctx.fillRect(xFc, padT, Math.max(0, xStop - xFc), ph);\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.05)';\n  ctx.fillRect(xStop, padT, Math.max(0, padL + pw - xStop), ph);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  for (let i = 0; i <= 5; i++) {\n    const f = i * 0.1;\n    const x = xOf(f);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + ph); ctx.stroke();\n    ctx.fillText(f.toFixed(1), x - 9, padT + ph + 16);\n  }\n  ctx.fillText('归一化频率 (× fs)', padL + pw / 2 - 48, H - 5);\n\n  const yTicks = isDb ? [0, -20, -40, -60, -80, -100] : [0, 0.5, 0.707, 1.0, 1.2];\n  yTicks.forEach(v => {\n    const y = isDb ? padT + ((10 - v) / 120) * ph : yOf(v);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + pw, y); ctx.stroke();\n    ctx.fillText(isDb ? v + 'dB' : v.toFixed(v === 0.707 ? 3 : 1), 6, y + 4);\n  });\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981';\n  if (xFc - padL > 44) ctx.fillText('通带', (padL + xFc) / 2 - 12, padT + 14);\n  ctx.fillStyle = '#f59e0b';\n  if (xStop - xFc > 32) ctx.fillText('过渡带', (xFc + xStop) / 2 - 16, padT + 14);\n  ctx.fillStyle = '#ec4899';\n  if (padL + pw - xStop > 44) ctx.fillText('阻带', (xStop + padL + pw) / 2 - 12, padT + 14);\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';\n  ctx.beginPath(); ctx.moveTo(xFc, padT); ctx.lineTo(xFc, padT + ph); ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  const steps = 260;\n  for (let i = 0; i <= steps; i++) {\n    const f = (i / steps) * 0.5;\n    const x = xOf(f), y = yOf(evalH(f));\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  const gains = [];\n  testTones.forEach(t => {\n    const m = evalH(t.fn);\n    const x = xOf(t.fn), y = yOf(m);\n    ctx.fillStyle = t.color;\n    ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();\n    ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.5; ctx.stroke();\n    const dbStr = (20 * Math.log10(Math.max(1e-6, m))).toFixed(1) + 'dB';\n    gains.push(t.label + ':' + dbStr);\n  });\n\n  lab.setReadout('fc=' + fc.toFixed(2) + ' fs | 阻带设定=-' + lab.values.attenuation + ' dB | ' + gains.join(' | '));\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "三、如何用 FFT 测量频响？“补零（Zero-Padding）”到底改变了什么？",
      "paragraphs": [
        "假设你手里有一个长度为 $M$ 的滤波器核（即冲激响应），怎么画出它的频率响应曲线？最快的方法是对它做 **FFT**。如果 FFT 长度是 $N$，它会吐出 $N$ 个实部和 $N$ 个虚部，但只有第 `0` 到第 `N/2` 个点（共 `N/2 + 1` 个采样点）是有用信息——第 `0` 点代表 **直流（DC，0 Hz）**，第 `N/2` 点代表**半采样率（0.5 fs）**，其余点只是负频率的镜像重复。转换成极坐标后，你就得到了幅度谱和相位谱。",
        "实际工程中常遇到尴尬事：比如你的滤波器核只有 80 个点，而标准 FFT 只吃 **2 的整数次幂**。怎么办？只需在末尾**补 48 个零（Padding with zeros）**凑成 128 点即可。**在时域末尾补零完全不会改变滤波器本身**——因为输入信号和滤波器做卷积时，那些零乘以任何数都等于零，会悄无声息地“消失”。",
        "更妙的是：你可以疯狂补零到 256、512 甚至 **1024 点**！一个物理系统的真实频响在直流到半采样率之间其实是一条**连续光滑的曲线**，DFT/FFT 只是对这条连续曲线进行“等间隔拍照采样”。补越多的零，$N$ 越大，采样点在频域里挤得越密；如果补无穷多个零，点与点之间就会连成真正的连续曲线。书里给出了一句超实用的经验法则：**画滤波器频响时，先无脑试试 $N = 1024$**，觉得太粗或太慢再微调。"
      ],
      "formula": {
        "expr": "Δf = fs / N   （有效频域点数 = N / 2 + 1，覆盖 0 ~ 0.5 fs）",
        "explain": "N 是补零后的 FFT 总长度。补零越多，频率网格间距 Δf 越小，你看到的频响曲线就越接近底层的连续真包络——但它不会改变滤波器本身的滚降陡峭度。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：补零（Zero-Padding）与频域采样分辨率显微镜",
      "instruction": "试着先固定“真实核长 M”，把“FFT 补零点数”从 64 拖到 1024，观察粉色离散点如何逼近蓝色连续包络；再增大核长 M，对比两者本质区别。",
      "controls": [
        {
          "type": "slider",
          "id": "fftPow",
          "label": "FFT 总点数 (2^k)",
          "min": 6,
          "max": 10,
          "step": 1,
          "value": 7,
          "unit": " (2^k)"
        },
        {
          "type": "slider",
          "id": "kernelLen",
          "label": "真实核长 M",
          "min": 15,
          "max": 61,
          "step": 2,
          "value": 31,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "zoom",
          "label": "放大过渡带 (0.10~0.30 fs)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showCont",
          "label": "显示连续真包络 (N→∞)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\n\nfunction buildKernel(M, fc) {\n  const h = new Array(M);\n  const mid = (M - 1) / 2;\n  let sum = 0;\n  for (let n = 0; n < M; n++) {\n    const x = n - mid;\n    const sinc = x === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * x) / (Math.PI * x);\n    const win = 0.54 - 0.46 * Math.cos((2 * Math.PI * n) / (M - 1));\n    h[n] = sinc * win;\n    sum += h[n];\n  }\n  for (let n = 0; n < M; n++) h[n] /= sum;\n  return h;\n}\n\nfunction dftMag(h, pts) {\n  const res = [];\n  for (let i = 0; i < pts.length; i++) {\n    const f = pts[i];\n    let re = 0, im = 0;\n    const w = 2 * Math.PI * f;\n    for (let n = 0; n < h.length; n++) {\n      re += h[n] * Math.cos(w * n);\n      im -= h[n] * Math.sin(w * n);\n    }\n    res.push({ f, mag: Math.sqrt(re * re + im * im) });\n  }\n  return res;\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const M = lab.values.kernelLen;\n  const N = Math.pow(2, lab.values.fftPow);\n  const fc = 0.20;\n  const h = buildKernel(M, fc);\n\n  const lx = 26, ly = 26, lw = 236, lh = H - 56;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('时域核 (M=' + M + ') + 补零至 N=' + N, lx, 16);\n\n  const dispN = Math.min(N, 256);\n  const zeroY = ly + lh * 0.72;\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(lx, zeroY); ctx.lineTo(lx + lw, zeroY); ctx.stroke();\n\n  const maxH = Math.max(0.25, h[(M - 1) >> 1]);\n  for (let n = 0; n < dispN; n++) {\n    const val = n < M ? h[n] : 0;\n    const x = lx + (n / (dispN - 1)) * lw;\n    const y = zeroY - (val / maxH) * (lh * 0.62);\n    ctx.strokeStyle = n < M ? '#10b981' : 'rgba(245, 158, 11, 0.35)';\n    ctx.lineWidth = n < M ? 1.8 : 1;\n    ctx.beginPath(); ctx.moveTo(x, zeroY); ctx.lineTo(x, y); ctx.stroke();\n    if (n < M || n % 4 === 0) {\n      ctx.fillStyle = n < M ? '#10b981' : 'rgba(245, 158, 11, 0.55)';\n      ctx.beginPath(); ctx.arc(x, y, n < M ? 2.1 : 1.3, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';\n  ctx.font = '10px monospace';\n  ctx.fillText('补零: +' + Math.max(0, N - M) + ' 个0' + (N > 256 ? ' (仅绘前256点)' : ''), lx + 4, ly + lh + 15);\n\n  const rx = 314, ry = 26, rw = W - rx - 20, rh = H - 56;\n  const fMin = lab.values.zoom ? 0.10 : 0.0;\n  const fMax = lab.values.zoom ? 0.30 : 0.5;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  for (let i = 0; i <= 4; i++) {\n    const f = fMin + (i / 4) * (fMax - fMin);\n    const x = rx + (i / 4) * rw;\n    ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + rh); ctx.stroke();\n    ctx.fillText(f.toFixed(2), x - 12, ry + rh + 15);\n  }\n  [0, 0.5, 1.0].forEach(v => {\n    const y = ry + rh - (v / 1.15) * rh;\n    ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + rw, y); ctx.stroke();\n    ctx.fillText(v.toFixed(1), rx - 26, y + 4);\n  });\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('频域响应：DFT 离散采样点(粉) vs 连续包络(蓝)', rx, 16);\n\n  if (lab.values.showCont) {\n    const denseF = [];\n    for (let i = 0; i <= 200; i++) denseF.push(fMin + (i / 200) * (fMax - fMin));\n    const cont = dftMag(h, denseF);\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    cont.forEach((p, idx) => {\n      const x = rx + ((p.f - fMin) / (fMax - fMin)) * rw;\n      const y = ry + rh - (p.mag / 1.15) * rh;\n      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    });\n    ctx.stroke();\n  }\n\n  const kMin = Math.ceil(fMin * N);\n  const kMax = Math.floor(fMax * N);\n  const discF = [];\n  for (let k = kMin; k <= kMax; k++) discF.push(k / N);\n  const disc = dftMag(h, discF);\n  disc.forEach(p => {\n    const x = rx + ((p.f - fMin) / (fMax - fMin)) * rw;\n    const y = ry + rh - (p.mag / 1.15) * rh;\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(x, y, N >= 512 ? 2 : 3.2, 0, Math.PI * 2); ctx.fill();\n  });\n\n  const df = (1 / N).toFixed(4);\n  lab.setReadout('核长 M=' + M + ' | DFT 点数 N=' + N + ' (有效点 N/2+1=' + (N / 2 + 1) + ') | 频率间距 Δf=' + df + ' fs | 框内采样点=' + disc.length);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（截止频率罗生门）：模拟电路默认 -3 dB (0.707) 是截止点，但数字滤波器的截止频率可能是 99%、90%、70.7% 或 50%，看文档和调参前务必核对定义。",
        "避坑 2（补零的真相）：给滤波器核补零做 FFT 不会让滚降变陡、也不会改善滤波性能；它只是把原本连续的频响曲线采样得更密，防止你漏看窄小的纹波或旁瓣（日常分析建议直接从 N = 1024 起步）。",
        "核心权衡（别停止思考）：书上说的“好/坏”只是大概率经验。像“含 60 Hz 工频干扰的心电图（EKG）”——有用信息在时域，干扰却在频域，设计时必然要在时域失真与频域抑制之间做取舍。记住教育第一定律：书上的一段话，绝不是你停止思考的通行证。"
      ]
    }
  ]
});
