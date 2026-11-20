window.__BOOK_REGISTER_SECTION__("sec_036", {
  "title": "采样定理与混叠现象 (The Sampling Theorem)",
  "intuition": "只要采样频率严格高于模拟信号最高频率的两倍，离散的采样点就能唯一锁定连续波形；一旦越界，高频就会“伪装”成低频并发生相位翻转，造成不可逆的信息毁灭。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是“恰当采样”？稀疏的点也能还原真相",
      "paragraphs": [
        "在把连续模拟信号送入 ADC 变成一串离散数字时，怎样才算**恰当采样（Proper Sampling）**？定义非常纯粹：**只要你能从这串离散样本中精确重构出唯一的原始模拟信号，采样就是恰当的。**即便采样点看起来稀疏得让人困惑，只要信息没有丢失，过程就是可逆的。",
        "观察不同频率正弦波的采样表现：当模拟信号频率为 `0`（直流 DC）或采样率的 `0.09` 倍（每周期约 11.1 个点）时，采样点大致勾勒出了波形轮廓；但当频率升高到采样率的 `0.31` 倍时，每个周期只剩下 **3.2 个采样点**，单看散点甚至连波形起伏的趋势都看不出来。",
        "然而，这 3.2 点/周期的采样依然是**完全恰当的**！因为没有任何其他正弦波（在合理频带约束下）能刚好穿过这一模一样的点阵。虽然你不能简单地用直线把它们连起来还原波形（需要更精密的重建滤波），但所有信息已经完整保存在数据里了。"
      ],
      "formula": {
        "expr": "N_cycle = f_s / f_analog",
        "explain": "N_cycle 为每个正弦波周期内的采样点数；f_s 为采样率；f_analog 为输入模拟信号频率。只要 N_cycle > 2，采样点序列就与原始正弦波形成唯一的一一对应关系。"
      }
    },
    {
      "type": "concept",
      "heading": "混叠：高频的“完美犯罪”与采样定理",
      "paragraphs": [
        "如果把模拟频率继续推高到采样率的 `0.95` 倍（每个周期仅 **1.05 个采样点**），灾难就发生了：采样点连起来看，竟然精确对应着一个频率只有 `0.05` 倍采样率、而且上下颠倒的正弦波！",
        "这种高频信号在采样后“冒名顶替”变成低频信号的现象，叫做**混叠（Aliasing）**。就像罪犯使用化名（Alias）隐匿身份一样，一旦混叠发生，数字信号中没有任何线索能告诉你原始频率究竟是 `0.95` 还是 `0.05`，原始波形再也无法还原——这就是**不当采样（Improper Sampling）**。",
        "由此引出了数字信号处理的基石——**香农采样定理（Shannon/Nyquist Sampling Theorem）**：一个连续信号能够被恰当采样，**当且仅当它不包含高于采样率一半（0.5 f_s）的频率分量**。顺带一提，工程界对**奈奎斯特频率（Nyquist frequency）**和**奈奎斯特率（Nyquist rate）**的定义并不统一（例如对于 3 kHz 信号用 8 kHz 采样，3、6、8、4 kHz 这四个数在不同文献中都可能被冠以这两个名字），但在本书中，这两个术语统一指代**采样率的一半（f_s / 2）**。"
      ],
      "formula": {
        "expr": "f_max < f_s / 2",
        "explain": "f_max 为模拟信号中包含的最高有效频率；f_s 为采样率；f_s / 2 即本书定义的奈奎斯特频率/奈奎斯特率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：时域波形混叠与听感折返实验室",
      "instruction": "拖动「模拟频率/采样率比值」滑块跨越 0.5（奈奎斯特极限），观察粉色混叠波形如何接管离散采样点，并点击播放声音听取音高在 0.5 处发生“折返下降”的奇异听感！",
      "controls": [
        {
          "type": "slider",
          "id": "freqRatio",
          "label": "模拟频率 / 采样率 (f / fs)",
          "min": 0.05,
          "max": 2.2,
          "step": 0.01,
          "value": 0.31,
          "unit": " fs"
        },
        {
          "type": "toggle",
          "id": "showAlias",
          "label": "显示混叠伪装波形",
          "value": true
        },
        {
          "type": "toggle",
          "id": "hearOriginal",
          "label": "听原始高频 (关闭=听采样后音高)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音 (虚拟 fs=1600Hz)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let osc = null;\nlet gain = null;\nlet ac = null;\nconst FS_VIRTUAL = 1600;\n\nfunction getAliasInfo(r) {\n  const k = Math.round(r);\n  const diff = r - k;\n  const fAlias = Math.abs(diff);\n  const inverted = diff < -1e-9;\n  return { fAlias, inverted };\n}\n\nfunction updateAudio() {\n  const play = lab.values.play;\n  const ratio = lab.values.freqRatio;\n  const hearOrig = lab.values.hearOriginal;\n  const info = getAliasInfo(ratio);\n  const targetHz = hearOrig ? ratio * FS_VIRTUAL : info.fAlias * FS_VIRTUAL;\n\n  if (play) {\n    if (!ac) ac = lab.getAudioContext();\n    if (ac.state === \"suspended\") ac.resume();\n    if (!osc) {\n      osc = ac.createOscillator();\n      gain = ac.createGain();\n      osc.type = \"sine\";\n      gain.gain.setValueAtTime(0.12, ac.currentTime);\n      osc.connect(gain);\n      gain.connect(ac.destination);\n      osc.frequency.setValueAtTime(targetHz, ac.currentTime);\n      osc.start();\n    } else {\n      osc.frequency.setTargetAtTime(targetHz, ac.currentTime, 0.02);\n    }\n  } else {\n    if (osc) {\n      try {\n        osc.stop();\n        osc.disconnect();\n        gain.disconnect();\n      } catch (e) {}\n      osc = null;\n      gain = null;\n    }\n  }\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const ratio = lab.values.freqRatio;\n  const showAlias = lab.values.showAlias;\n  const info = getAliasInfo(ratio);\n  const isAliased = ratio > 0.5 + 1e-6;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 40;\n  const padR = 20;\n  const plotW = W - padL - padR;\n  const midY = H / 2 + 8;\n  const amp = 74;\n  const N = 16;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  [-1, 0, 1].forEach(function (v) {\n    const y = midY - v * amp;\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(W - padR, y);\n    ctx.stroke();\n  });\n\n  for (let n = 0; n <= N; n++) {\n    const x = padL + (n / N) * plotW;\n    ctx.beginPath();\n    ctx.moveTo(x, midY - amp - 10);\n    ctx.lineTo(x, midY + amp + 10);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = \"rgba(248,250,252,0.5)\";\n  ctx.font = \"11px monospace\";\n  ctx.textAlign = \"right\";\n  ctx.fillText(\"+1\", padL - 6, midY - amp + 4);\n  ctx.fillText(\"0\", padL - 6, midY + 4);\n  ctx.fillText(\"-1\", padL - 6, midY + amp + 4);\n\n  ctx.strokeStyle = \"#38bdf8\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  const steps = 480;\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * N;\n    const y = midY - Math.sin(2 * Math.PI * ratio * t) * amp;\n    const x = padL + (t / N) * plotW;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (showAlias && isAliased) {\n    const sign = info.inverted ? -1 : 1;\n    ctx.save();\n    ctx.strokeStyle = \"#ec4899\";\n    ctx.lineWidth = 2.5;\n    ctx.setLineDash([6, 4]);\n    ctx.beginPath();\n    for (let i = 0; i <= steps; i++) {\n      const t = (i / steps) * N;\n      const y = midY - sign * Math.sin(2 * Math.PI * info.fAlias * t) * amp;\n      const x = padL + (t / N) * plotW;\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  for (let n = 0; n <= N; n++) {\n    const x = padL + (n / N) * plotW;\n    const val = Math.sin(2 * Math.PI * ratio * n);\n    const y = midY - val * amp;\n    ctx.fillStyle = isAliased ? \"#f59e0b\" : \"#10b981\";\n    ctx.fillRect(x - 4, y - 4, 8, 8);\n    ctx.strokeStyle = \"#f8fafc\";\n    ctx.lineWidth = 1.2;\n    ctx.strokeRect(x - 4, y - 4, 8, 8);\n  }\n\n  ctx.font = \"12px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"— 原始模拟信号 (\" + ratio.toFixed(2) + \" fs)\", padL, 18);\n  ctx.fillStyle = isAliased ? \"#f59e0b\" : \"#10b981\";\n  ctx.fillText(\"■ 离散采样点\", padL + 195, 18);\n  if (showAlias && isAliased) {\n    ctx.fillStyle = \"#ec4899\";\n    ctx.fillText(\"-- 混叠伪装波形 (\" + info.fAlias.toFixed(2) + \" fs, \" + (info.inverted ? \"180°反相\" : \"0°同相\") + \")\", padL + 300, 18);\n  }\n\n  const spc = (1 / ratio).toFixed(2);\n  const origHz = Math.round(ratio * FS_VIRTUAL);\n  const aliasHz = Math.round(info.fAlias * FS_VIRTUAL);\n  const status = isAliased\n    ? \"⚠️ 发生混叠！原信号 \" + origHz + \" Hz 伪装成 \" + aliasHz + \" Hz（\" + (info.inverted ? \"180°反相\" : \"0°同相\") + \"）\"\n    : \"✅ 恰当采样（每周期 \" + spc + \" 点），\" + origHz + \" Hz 可无损重构\";\n  lab.setReadout(\"虚拟 fs=\" + FS_VIRTUAL + \" Hz | \" + status);\n}\n\nlab.onUpdate(function () {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "频率折叠、相位翻转与混叠的“双重诅咒”",
      "paragraphs": [
        "数字信号绝不可能表达高于 `0.5 f_s` 的频率。任何超越奈奎斯特极限的连续频率，在采样后都会沿着“之”字形折线**折叠（Folding）**回 `0 ~ 0.5 f_s` 之间。例如，数字域里出现了一个 `0.2 f_s` 的正弦波，如果存在混叠，它可能来自模拟域的无穷多个频率：`0.2, 0.8, 1.2, 1.8, 2.2... f_s`。",
        "为什么说混叠是**双重诅咒（Double Curse）**？因为如果原本的低频位置（比如 `0.2 f_s`）已经存在合法信号，来自高频（比如 `0.8 f_s`）的混叠分量就会直接**叠加**在它身上，导致高频和低频的信息同时被污染毁坏。",
        "此外，混叠还会系统性地改变信号的**相位**，但只可能出现两种结果：**0°（不反相）**或 **180°（完全倒相）**。当模拟频率处于 `[0, 0.5], [1.0, 1.5], [2.0, 2.5]... f_s` 区间时，相位保持 `0°`；而一旦落入 `[0.5, 1.0], [1.5, 2.0], [2.5, 3.0]... f_s` 这些偶次折叠区，波形不仅频率折返，相位还会瞬间翻转 `180°`。"
      ],
      "formula": {
        "expr": "f_digital = | f_analog - round(f_analog / f_s) * f_s |",
        "explain": "f_digital 为采样后在数字域观测到的表观频率（恒落在 0 到 0.5 f_s 之间）；当括号内差值为负时，信号相位发生 180° 倒相。"
      }
    },
    {
      "type": "concept",
      "heading": "冲激串与频谱复制：从频域彻底证明采样定理",
      "paragraphs": [
        "为了严谨分析连续信号变成离散数组时发生了什么（避免“苹果和橘子”的跨维度比较），DSP 引入了一个纯理论桥梁——**冲激串（Impulse Train）**：在采样瞬间发出无限窄、高度等于原信号幅度的脉冲，采样间隙为零。冲激串与离散数组的信息量完全等价，但它本身是连续波形，可以直接和原信号进行频谱对比。",
        "以过滤到 `3.3 kHz` 的语音信号为例：在时域用冲激串去乘以原信号，等价于在频域把原信号的频谱**原封不动地复制到每一个采样频率的整数倍位置（f_s, 2f_s, 3f_s...）上**。每个复制中心右侧是原样的**上边带（Upper Sideband）**，左侧则是左右镜像翻转的**下边带（Lower Sideband）**。",
        "现在谜底揭晓了：如果你用 `10 kHz` 采样 `3.3 kHz` 语音，第一组下边带落在 `10 - 3.3 = 6.7 kHz` 到 `10 kHz` 之间，完全没有侵入 `0 ~ 5 kHz` 的奈奎斯特通带！此时只需用一个截止频率为 `0.5 f_s`（`5 kHz`）的**模拟低通滤波器**切掉所有高频复制品，就能把冲激串完美变回原始信号。反之，若把采样率降到 `5 kHz`，`5 - 3.3 = 1.7 kHz` 的下边带就会长驱直入 `0 ~ 2.5 kHz` 的基带区，与原频谱混成一团无法分离的乱麻——这便从频域彻底证明了采样定理。"
      ],
      "formula": {
        "expr": "f_lower_edge = f_s - f_max > 0.5 * f_s",
        "explain": "f_lower_edge 是第一组采样下边带的左边界；要求它不越过 0.5 f_s 边界，化简后即得 f_max < 0.5 f_s。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：频域复制、边带翻转与混叠入侵实验室",
      "instruction": "尝试设置原书经典参数：先将信号最高频率设为 3.3 kHz、采样率设为 10.0 kHz 观察完美分离；再将采样率拖低到 5.0 kHz，亲眼见证左右翻转的下边带如何入侵基带！",
      "controls": [
        {
          "type": "slider",
          "id": "bw",
          "label": "信号最高频率 f_max",
          "min": 1,
          "max": 5,
          "step": 0.1,
          "value": 3.3,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "fs",
          "label": "采样率 f_s",
          "min": 3,
          "max": 14,
          "step": 0.2,
          "value": 10,
          "unit": " kHz"
        },
        {
          "type": "toggle",
          "id": "showLpf",
          "label": "显示理想低通重构滤波器 (≤0.5 fs)",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const bw = lab.values.bw;\n  const fs = lab.values.fs;\n  const showLpf = lab.values.showLpf;\n  const nyquist = fs * 0.5;\n  const isAliased = bw > nyquist + 1e-6;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 36;\n  const padR = 20;\n  const padB = 32;\n  const plotW = W - padL - padR;\n  const maxFreq = 24;\n  const y0 = H - padB;\n  const peakH = 122;\n\n  function xOf(f) {\n    return padL + (f / maxFreq) * plotW;\n  }\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let f = 0; f <= maxFreq; f += 2) {\n    const x = xOf(f);\n    ctx.beginPath();\n    ctx.moveTo(x, 26);\n    ctx.lineTo(x, y0);\n    ctx.stroke();\n\n    ctx.fillStyle = \"rgba(248,250,252,0.55)\";\n    ctx.font = \"11px monospace\";\n    ctx.textAlign = \"center\";\n    ctx.fillText(f + \"\", x, y0 + 15);\n  }\n  ctx.fillStyle = \"rgba(248,250,252,0.7)\";\n  ctx.textAlign = \"right\";\n  ctx.fillText(\"频率 (kHz)\", W - padR, y0 + 28);\n\n  ctx.strokeStyle = \"rgba(248,250,252,0.35)\";\n  ctx.beginPath();\n  ctx.moveTo(padL, y0);\n  ctx.lineTo(W - padR, y0);\n  ctx.stroke();\n\n  function drawLobe(fZero, width, dir, fill, stroke) {\n    const p0 = fZero;\n    const p1 = fZero + dir * 0.35 * width;\n    const p2 = fZero + dir * 0.65 * width;\n    const p3 = fZero + dir * width;\n\n    ctx.save();\n    ctx.beginPath();\n    ctx.rect(padL, 0, plotW, y0 + 1);\n    ctx.clip();\n\n    ctx.beginPath();\n    ctx.moveTo(xOf(p0), y0);\n    ctx.lineTo(xOf(p0), y0 - peakH * 0.92);\n    ctx.lineTo(xOf(p1), y0 - peakH * 0.92);\n    ctx.lineTo(xOf(p2), y0 - peakH * 0.48);\n    ctx.lineTo(xOf(p3), y0);\n    ctx.closePath();\n\n    ctx.fillStyle = fill;\n    ctx.fill();\n    ctx.strokeStyle = stroke;\n    ctx.lineWidth = 2;\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  for (let k = 1; k <= 8; k++) {\n    const center = k * fs;\n    if (center - bw > maxFreq) break;\n\n    drawLobe(center, bw, -1, \"rgba(56,189,248,0.18)\", \"#38bdf8\");\n    drawLobe(center, bw, 1, \"rgba(56,189,248,0.18)\", \"#38bdf8\");\n\n    if (center <= maxFreq) {\n      ctx.save();\n      ctx.strokeStyle = \"rgba(248,250,252,0.25)\";\n      ctx.setLineDash([3, 3]);\n      ctx.beginPath();\n      ctx.moveTo(xOf(center), 28);\n      ctx.lineTo(xOf(center), y0);\n      ctx.stroke();\n      ctx.restore();\n\n      ctx.fillStyle = \"#38bdf8\";\n      ctx.font = \"11px monospace\";\n      ctx.textAlign = \"center\";\n      ctx.fillText((k === 1 ? \"\" : k) + \"fs\", xOf(center), 22);\n    }\n  }\n\n  drawLobe(0, bw, 1, \"rgba(16,185,129,0.28)\", \"#10b981\");\n\n  if (isAliased) {\n    const badStart = Math.max(0, fs - bw);\n    const badEnd = nyquist;\n    if (badEnd > badStart) {\n      ctx.fillStyle = \"rgba(236,72,153,0.32)\";\n      ctx.fillRect(xOf(badStart), y0 - peakH, xOf(badEnd) - xOf(badStart), peakH);\n      ctx.strokeStyle = \"#ec4899\";\n      ctx.lineWidth = 2;\n      ctx.strokeRect(xOf(badStart), y0 - peakH, xOf(badEnd) - xOf(badStart), peakH);\n\n      ctx.fillStyle = \"#ec4899\";\n      ctx.font = \"bold 12px sans-serif\";\n      ctx.textAlign = \"left\";\n      ctx.fillText(\"⚠ 混叠重叠区\", xOf(badStart) + 4, y0 - peakH - 6);\n    }\n  }\n\n  if (showLpf) {\n    ctx.save();\n    ctx.strokeStyle = \"#f59e0b\";\n    ctx.lineWidth = 2;\n    ctx.setLineDash([6, 4]);\n    ctx.strokeRect(xOf(0), y0 - peakH * 1.12, xOf(nyquist) - xOf(0), peakH * 1.12);\n    ctx.restore();\n\n    ctx.fillStyle = \"#f59e0b\";\n    ctx.font = \"11px sans-serif\";\n    ctx.textAlign = \"left\";\n    ctx.fillText(\"低通滤波通带 (≤\" + nyquist.toFixed(1) + \"kHz)\", xOf(0) + 4, y0 - peakH * 1.12 - 5);\n  }\n\n  ctx.font = \"12px sans-serif\";\n  ctx.textAlign = \"right\";\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"■ 原始基带\", W - padR - 115, 18);\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"■ 采样复制边带\", W - padR, 18);\n\n  const msg = isAliased\n    ? \"❌ 混叠入侵！下边带倒灌至 \" + Math.max(0, fs - bw).toFixed(1) + \" kHz，低通滤波器已无法剥离\"\n    : \"✅ 频谱安全分离！理想低通滤波截断 >\" + nyquist.toFixed(1) + \" kHz 后即可完美还原\";\n  lab.setReadout(\"f_max=\" + bw.toFixed(1) + \" kHz | fs=\" + fs.toFixed(1) + \" kHz | 奈奎斯特极限=\" + nyquist.toFixed(1) + \" kHz | \" + msg);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数字域的铁律：数据一旦混叠，神仙也救不回来！必须在 ADC 之前放置硬件模拟抗混叠低通滤波器，强行切除高于 0.5 f_s 的高频信号（包括无用的高频噪声，否则噪声也会折叠进有用频段）。",
        "工程采样率留足余量：理论上 f_s > 2 f_max 即可，但现实中的模拟滤波器没有垂直的“砖墙”滚降特性，通常需要 2.5 倍到 3 倍以上的采样率（如 3.3 kHz 语音配 8~10 kHz 采样）给滤波器留出过渡带。",
        "别被“看起来稀疏”骗了：每周期 3 个多点看起来完全不像正弦波，但它包含的还原信息是 100% 完备的；真正需要警惕的是超过 0.5 f_s 后波形频谱坍缩与 180° 相位反转。",
        "看清别人嘴里的 Nyquist：读论文或看芯片手册时，先确认作者说的 Nyquist frequency/rate 指的是 f_s / 2 还是 2 f_max，避免算错两倍。"
      ]
    }
  ]
});
