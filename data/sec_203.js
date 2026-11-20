window.__BOOK_REGISTER_SECTION__("sec_203", {
  "title": "定点与浮点 DSP 架构对比 (Fixed versus Floating Point)",
  "intuition": "定点 DSP 像一把刻度均匀的固定量程钢尺，成本低但必须时刻提防溢出与误差；浮点 DSP 则像自带对数变焦的科学计算器，以更复杂的硬件换取超大动态范围与极简的算法开发体验。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 数字表示法：均匀网格 vs 对数网格",
      "paragraphs": [
        "数字信号处理器（DSP）按内部存储和运算数字的格式可分为**定点 (Fixed Point)** 与**浮点 (Floating Point)** 两大阵营。",
        "**定点 DSP** 通常至少使用 **16 位**表示一个数（如 Motorola 也有 24 位定点系列）。16 位共有 $2^{16} = 65,536$ 种比特组合，常见有 4 种映射方式：**无符号整数**（`0` 到 `65,535`）、**有符号整数**（补码表示 `-32,768` 到 `32,767`）、**无符号小数**（在 `0` 到 `1` 之间均匀分布）以及**有符号小数**（在 `-1` 到 `1` 之间等距分布）。它们的共同特点是：**所有可表示的刻度在量程内是均匀分布的**。",
        "**浮点 DSP** 通常至少使用 **32 位**存储每个数值，提供多达 $2^{32} = 4,294,967,296$ 种组合。在最常用的 `ANSI/IEEE Std. 754-1985` 标准下，最大和最小非零值分别可达 $\\pm 3.4 \\times 10^{38}$ 和 $\\pm 1.2 \\times 10^{-38}$。浮点格式最核心的特征是**刻度非均匀分布**：任意两个相邻可表示数之间的间距，永远大约是该数值大小的**千万分之一**。这意味着大数之间间距大、小数之间间距极小，在极小信号下依然拥有细腻的分辨率。",
        "此外，所有浮点 DSP 也都必须能处理定点数（用于循环计数器、地址偏移以及 ADC/DAC 接口信号），只是速度取决于内部架构——例如 ADI 的 **SHARC** 系列同时针对定点和浮点做了硬件优化，因此常被称为“32 位 DSP”而非单纯的浮点 DSP。"
      ],
      "formula": {
        "expr": "Δ_float ≈ 10^-7 × |x|   vs   Δ_fixed = 常数 (均匀间距)",
        "explain": "Δ 表示数轴上相邻两个可表示值之间的台阶间距；浮点数的间距随信号幅值 |x| 自动缩放，而定点数的间距在全量程内固定不变。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 硬件代价、量化噪声与信噪比 (SNR) 的巨大鸿沟",
      "paragraphs": [
        "在通用计算机上，定点运算比浮点快得多；但在 **DSP** 中两者的运算速度**大致相同**，因为 DSP 内部有高度针对数学运算优化的专用硬件。区别在于**硬件复杂度与成本**：浮点 DSP 所有的寄存器和数据总线都必须做宽到 32 位（定点只需 16 位），且需要更复杂的浮点乘法器、ALU 以及更大的指令集。因此定点 DSP 更便宜（例如 1999 年成书时，定点芯片售价约 5~100 美元，浮点则为 10~300 美元）。",
        "那么多花的钱到底买来了什么核心性能？答案是**信噪比 (Signal-to-Noise Ratio, SNR)**。每次将真实信号存入数字格式时，都必须向上或向下舍入，最大误差为半个台阶间距（`Δ/2`），这等价于向信号中注入了**量化噪声**，其标准差约为台阶间距的三分之一（`σ ≈ Δ/3`）。",
        "对于 32 位浮点，因为间距永远是当前值的千万分之一，其信噪比恒定在约 **30,000,000 : 1**；而对于 16 位定点整数，存储 `10,000` 时台阶是数值的万分之一，存储 `1,000` 时恶化为千分之一，典型信噪比只有约 **10,000 : 1**。换言之，**32 位浮点的量化噪声比 16 位定点足足低约 3,000 倍**，且不会因为信号变小而瞬间淹没在噪声里。"
      ],
      "formula": {
        "expr": "σ_noise ≈ Δ / 3  ⇒  SNR_float ≈ 3×10^7 : 1 ,  SNR_fixed ≈ 10^4 : 1",
        "explain": "σ_noise 为量化噪声的标准差；浮点格式凭借对数比例缩放，将单次存储的量化噪声压低至传统 16 位定点的约 1/3000。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：定点均匀量化 vs 浮点对数量化（实时波形与听感对比）",
      "instruction": "将“信号幅度”拉低到 10% 以下，切换“开启浮点对数量化”开关并点击试听，观察画布背景的量化网格密度变化，并聆听小信号下定点产生的失真杂音与浮点的纯净对比。",
      "controls": [
        {
          "type": "toggle",
          "id": "format",
          "label": "开启浮点对数量化（关闭为定点）",
          "value": false
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "信号幅度",
          "min": 2,
          "max": 100,
          "step": 2,
          "value": 20,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "等效演示位深",
          "min": 4,
          "max": 8,
          "step": 1,
          "value": 5,
          "unit": " bit"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听量化听感",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "(function() {\n  const W = lab.width, H = lab.height, ctx = lab.ctx;\n  let audioSrc = null;\n\n  function qFixed(x, bits) {\n    const L = Math.pow(2, bits - 1);\n    const q = Math.round(x * L) / L;\n    return Math.max(-1, Math.min(1 - 1 / L, q));\n  }\n\n  function qFloat(x, bits) {\n    if (x === 0) return 0;\n    const s = x < 0 ? -1 : 1;\n    const ax = Math.abs(x);\n    const M = Math.max(1, bits - 3);\n    const minExp = -6;\n    if (ax < Math.pow(2, minExp)) {\n      const subStep = Math.pow(2, minExp - M);\n      return s * Math.round(ax / subStep) * subStep;\n    }\n    const e = Math.min(0, Math.floor(Math.log2(ax)));\n    const p2 = Math.pow(2, e);\n    const m = ax / p2;\n    const steps = Math.pow(2, M);\n    const mq = 1 + Math.round((m - 1) * steps) / steps;\n    return s * Math.min(1, mq * p2);\n  }\n\n  function getLevels(isFloat, bits) {\n    const lvls = [0];\n    if (!isFloat) {\n      const L = Math.pow(2, bits - 1);\n      for (let i = -L; i < L; i++) {\n        if (i !== 0) lvls.push(i / L);\n      }\n    } else {\n      const M = Math.max(1, bits - 3);\n      const steps = Math.pow(2, M);\n      const minExp = -6;\n      const subStep = Math.pow(2, minExp - M);\n      for (let k = 1; k < steps; k++) {\n        lvls.push(k * subStep, -k * subStep);\n      }\n      for (let e = minExp; e < 0; e++) {\n        const p2 = Math.pow(2, e);\n        for (let k = 0; k < steps; k++) {\n          const val = (1 + k / steps) * p2;\n          lvls.push(val, -val);\n        }\n      }\n      lvls.push(1, -1);\n    }\n    return lvls;\n  }\n\n  function stopAudio() {\n    if (audioSrc) {\n      try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n      audioSrc = null;\n    }\n  }\n\n  function updateAudio() {\n    stopAudio();\n    if (!lab.values.play) return;\n    const actx = lab.getAudioContext();\n    if (!actx) return;\n    if (actx.state === 'suspended') actx.resume();\n    const sr = actx.sampleRate;\n    const dur = 0.5;\n    const len = Math.round(sr * dur);\n    const cycles = Math.round(220 * dur);\n    const freq = cycles / (len / sr);\n    const buf = actx.createBuffer(1, len, sr);\n    const ch = buf.getChannelData(0);\n    const amp = lab.values.amp / 100;\n    const bits = lab.values.bits;\n    const isFloat = !!lab.values.format;\n    for (let i = 0; i < len; i++) {\n      const x = amp * Math.sin(2 * Math.PI * freq * i / sr);\n      const q = isFloat ? qFloat(x, bits) : qFixed(x, bits);\n      ch[i] = q * 0.3;\n    }\n    const src = actx.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    src.connect(actx.destination);\n    src.start();\n    audioSrc = src;\n  }\n\n  function render() {\n    const isFloat = !!lab.values.format;\n    const amp = lab.values.amp / 100;\n    const bits = lab.values.bits;\n\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(0, 0, W, H);\n\n    const x0 = 48, x1 = 460, y0 = 24, y1 = 220;\n    const midY = (y0 + y1) / 2;\n    const halfH = (y1 - y0) / 2;\n\n    const lvls = getLevels(isFloat, bits);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (let i = 0; i < lvls.length; i++) {\n      const ly = midY - lvls[i] * halfH;\n      ctx.beginPath();\n      ctx.moveTo(x0, ly);\n      ctx.lineTo(x1, ly);\n      ctx.stroke();\n    }\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.beginPath();\n    ctx.moveTo(x0, midY);\n    ctx.lineTo(x1, midY);\n    ctx.stroke();\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText('+1.0', x0 - 6, y0 + 4);\n    ctx.fillText('0', x0 - 6, midY + 4);\n    ctx.fillText('-1.0', x0 - 6, y1 + 4);\n\n    const N = 320;\n    let sigPow = 0, errPow = 0;\n    const errs = [];\n\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (let i = 0; i <= N; i++) {\n      const t = i / N;\n      const x = amp * Math.sin(2 * Math.PI * 2 * t);\n      const px = x0 + t * (x1 - x0);\n      const py = midY - x * halfH;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = isFloat ? '#10b981' : '#f59e0b';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i <= N; i++) {\n      const t = i / N;\n      const x = amp * Math.sin(2 * Math.PI * 2 * t);\n      const q = isFloat ? qFloat(x, bits) : qFixed(x, bits);\n      const err = q - x;\n      errs.push(err);\n      sigPow += x * x;\n      errPow += err * err;\n      const px = x0 + t * (x1 - x0);\n      const py = midY - q * halfH;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    const snrDb = 10 * Math.log10(sigPow / (errPow + 1e-12));\n\n    const rx0 = 490, rx1 = 700;\n    const emid = 74;\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(rx0, 24, rx1 - rx0, 100);\n    ctx.beginPath();\n    ctx.moveTo(rx0, emid);\n    ctx.lineTo(rx1, emid);\n    ctx.stroke();\n\n    const errScale = Math.pow(2, bits - 1);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= N; i++) {\n      const px = rx0 + (i / N) * (rx1 - rx0);\n      const ey = emid - Math.max(-44, Math.min(44, errs[i] * errScale * 20));\n      if (i === 0) ctx.moveTo(px, ey); else ctx.lineTo(px, ey);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('量化误差放大波形 (q - x)', rx0, 16);\n\n    ctx.fillText('演示信噪比 (SNR)', rx0, 148);\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(rx0, 160, rx1 - rx0, 22);\n    const barW = Math.max(0, Math.min(1, snrDb / 55)) * (rx1 - rx0);\n    ctx.fillStyle = snrDb > 22 ? '#10b981' : (snrDb > 12 ? '#f59e0b' : '#ec4899');\n    ctx.fillRect(rx0, 160, barW, 22);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText(snrDb.toFixed(1) + ' dB', rx0 + 8, 176);\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(isFloat ? '浮点：小信号附近台阶自动变密' : '定点：台阶固定，小信号易塌陷', rx0, 206);\n\n    ctx.textAlign = 'left';\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('— 原始信号', x0 + 6, 15);\n    ctx.fillStyle = isFloat ? '#10b981' : '#f59e0b';\n    ctx.fillText(isFloat ? '— 浮点对数量化' : '— 定点均匀量化', x0 + 82, 15);\n\n    const gapRatio = isFloat\n      ? ('~ 1/' + Math.pow(2, Math.max(1, bits - 3)) + ' × 当前幅值')\n      : ('恒定 1/' + Math.pow(2, bits - 1) + ' (满量程)');\n    lab.setReadout((isFloat ? '浮点对数量化' : '定点均匀量化') + ' | 幅度: ' + lab.values.amp + '% | 台阶间距: ' + gapRatio + ' | 演示 SNR: ' + snrDb.toFixed(1) + ' dB');\n    updateAudio();\n  }\n\n  lab.onUpdate(render);\n  render();\n})();"
    },
    {
      "type": "concept",
      "heading": "3. 扩展精度累加器与算法开发复杂度",
      "paragraphs": [
        "数字信号处理的核心操作往往是成百上千次的**乘加运算**（例如 FIR 滤波）。如果在**传统微处理器**上用 16 位定点变量做累加器，为了防止连加溢出，工程师每一步都必须缩小（Scale）被加数，这会在每一步都引入新的量化噪声。最坏情况下，在一个 **500 抽头的 FIR 滤波器**中，输出噪声可能是单次输入噪声的 500 倍，信噪比会从 `10,000 : 1` 惨跌到 `20 : 1`！",
        "DSP 芯片通过内置**扩展精度累加器 (Extended Precision Accumulator)** 解决了这个致命问题：这是一个位宽达到普通内存单元 **2~3 倍**（或更多）的专用寄存器。例如 16 位 DSP 通常配备 **32~40 位**累加器，而 SHARC 在定点模式下拥有 **80 位**累加器。在循环累加过程中，巨大的余量让舍入噪声几乎为零；只有当整个累加彻底完成、需要写回 16 位内存时，才承受**唯一一次**缩放与舍入误差。",
        "即便如此，定点编程的心智负担依然远高于浮点。对比 SHARC 手册中的乘法指令：浮点乘法**只有一种写法**（`Fn = Fx * Fy`），工程师可以把精力完全放在算法上；而定点乘法却有**几十种选项组合**——必须指明目标寄存器（`Rn` / `MRF` / `MRB`）、有符号/无符号（`S`/`U`）、小数/整数（`F`/`I`）、饱和保护（`SAT`）或四舍五入（`RND`）等，每一步都要精打细算溢出与定标问题。"
      ],
      "formula": {
        "expr": "y[n] = Σ h[k] · x[n-k]   (k = 0 .. N-1)",
        "explain": "h[k] 为第 k 个滤波器系数，x[n-k] 为输入采样。普通窄累加器在 N 次累加中不断缩放丢弃低位导致噪声雪崩；扩展精度累加器则保留完整乘积位宽直到最终输出。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：窄累加器噪声塌陷 vs DSP 扩展精度累加器",
      "instruction": "将“FIR 抽头数 N”拖向 500，观察传统窄累加器下输出波形的台阶畸变与信噪比暴跌；然后切换“开启 DSP 扩展精度累加器”，见证输出瞬间恢复纯净。",
      "controls": [
        {
          "type": "slider",
          "id": "taps",
          "label": "FIR 抽头数 N (累加次数)",
          "min": 10,
          "max": 500,
          "step": 10,
          "value": 120,
          "unit": " 阶"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "基础寄存器字长",
          "min": 10,
          "max": 16,
          "step": 2,
          "value": 14,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "useExt",
          "label": "开启 DSP 扩展精度累加器 (40/80-bit)",
          "value": false
        }
      ],
      "jsCode": "(function() {\n  const W = lab.width, H = lab.height, ctx = lab.ctx;\n\n  function render() {\n    const N = lab.values.taps;\n    const B = lab.values.bits;\n    const useExt = !!lab.values.useExt;\n    const Q = Math.pow(2, B - 1);\n\n    const h = new Float64Array(N);\n    const mid = (N - 1) / 2;\n    let hSum = 0;\n    const fc = 0.06;\n    for (let k = 0; k < N; k++) {\n      const n = k - mid;\n      const sinc = Math.abs(n) < 1e-9 ? 2 * fc : Math.sin(2 * Math.PI * fc * n) / (Math.PI * n);\n      const win = N === 1 ? 1 : 0.5 * (1 - Math.cos(2 * Math.PI * k / (N - 1)));\n      h[k] = sinc * win;\n      hSum += h[k];\n    }\n    for (let k = 0; k < N; k++) h[k] /= hSum;\n\n    const pts = 180;\n    const total = N + pts;\n    const x = new Float64Array(total);\n    const xq = new Float64Array(total);\n    for (let i = 0; i < total; i++) {\n      x[i] = 0.35 * Math.sin(2 * Math.PI * 0.015 * i);\n      xq[i] = Math.round(x[i] * Q) / Q;\n    }\n\n    const yIdeal = new Float64Array(pts);\n    const yOut = new Float64Array(pts);\n    const scale = Math.max(1, N / 2);\n\n    let sigPow = 0, errPow = 0;\n    for (let t = 0; t < pts; t++) {\n      let idealAcc = 0;\n      let acc = 0;\n      for (let k = 0; k < N; k++) {\n        const idx = t + N - 1 - k;\n        idealAcc += h[k] * x[idx];\n        if (useExt) {\n          acc += h[k] * xq[idx];\n        } else {\n          const scaledTerm = Math.round(((h[k] * xq[idx]) / scale) * Q) / Q;\n          acc = Math.round((acc + scaledTerm) * Q) / Q;\n        }\n      }\n      yIdeal[t] = idealAcc;\n      yOut[t] = useExt ? (Math.round(acc * Q) / Q) : (acc * scale);\n      const err = yOut[t] - yIdeal[t];\n      sigPow += yIdeal[t] * yIdeal[t];\n      errPow += err * err;\n    }\n\n    const snrRatio = Math.sqrt(sigPow / (errPow + 1e-12));\n    const snrDb = 20 * Math.log10(snrRatio);\n\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(0, 0, W, H);\n\n    const x0 = 42, x1 = 465, y0 = 26, y1 = 216;\n    const midY = (y0 + y1) / 2;\n    const ampPx = (y1 - y0) / 2 / 0.45;\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (let g = -2; g <= 2; g++) {\n      const gy = midY + g * 42;\n      ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();\n    }\n\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (let t = 0; t < pts; t++) {\n      const px = x0 + (t / (pts - 1)) * (x1 - x0);\n      const py = midY - yIdeal[t] * ampPx;\n      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = useExt ? '#10b981' : '#f59e0b';\n    ctx.lineWidth = 2.1;\n    ctx.beginPath();\n    for (let t = 0; t < pts; t++) {\n      const px = x0 + (t / (pts - 1)) * (x1 - x0);\n      const py = midY - Math.max(-0.46, Math.min(0.46, yOut[t])) * ampPx;\n      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('— 理想滤波输出', x0 + 4, 16);\n    ctx.fillStyle = useExt ? '#10b981' : '#f59e0b';\n    ctx.fillText(useExt ? '— 扩展精度累加输出' : '— 窄累加器缩放输出', x0 + 100, 16);\n\n    const rx0 = 492, rx1 = 702;\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('累加器寄存器结构', rx0, 26);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(rx0, 38, 120, 24);\n    ctx.fillStyle = useExt ? '#10b981' : '#f59e0b';\n    ctx.fillRect(rx0, 38, useExt ? 206 : 100, 24);\n    ctx.fillStyle = '#0f172a';\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText(useExt ? (B * 2 + 12) + '-bit 扩展累加器 (零中间舍入)' : (B + '-bit 窄累加器 (每步截断)'), rx0 + 6, 54);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('输出噪声放大波形 (×5)', rx0, 90);\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.strokeRect(rx0, 98, rx1 - rx0, 56);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    for (let t = 0; t < pts; t++) {\n      const px = rx0 + (t / (pts - 1)) * (rx1 - rx0);\n      const err = (yOut[t] - yIdeal[t]) * 5;\n      const py = 126 - Math.max(-25, Math.min(25, err * 60));\n      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('输出信噪比 (SNR)', rx0, 176);\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(rx0, 186, rx1 - rx0, 22);\n    const barW = Math.max(0, Math.min(1, snrDb / 90)) * (rx1 - rx0);\n    ctx.fillStyle = snrDb > 45 ? '#10b981' : (snrDb > 25 ? '#f59e0b' : '#ec4899');\n    ctx.fillRect(rx0, 186, barW, 22);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px monospace';\n    ctx.fillText(snrDb.toFixed(1) + ' dB (' + (snrRatio > 9999 ? Math.round(snrRatio) : snrRatio.toFixed(1)) + ':1)', rx0 + 8, 201);\n\n    lab.setReadout((useExt ? 'DSP 扩展精度累加器' : '传统 ' + B + '-bit 窄累加器') + ' | FIR 抽头数 N = ' + N + ' | 输出 SNR: ' + snrDb.toFixed(1) + ' dB (' + snrRatio.toFixed(1) + ' : 1)');\n  }\n\n  lab.onUpdate(render);\n  render();\n})();"
    },
    {
      "type": "concept",
      "heading": "4. 工程选型三维标准与“32 位定点 vs 浮点”辨析",
      "paragraphs": [
        "在实际工程中如何拍板选择定点还是浮点？主要看三个维度：第一，**ADC/DAC 的转换位深**，**12~14 bit** 通常是分水岭——例如 8 位的电视/视频信号用定点绰绰有余，而 20~24 位的专业数字音频则几乎必选浮点；第二，**算法复杂度**——时域简单算法（如只需几十行代码的 FIR 滤波）适合定点，而频域复杂算法（如频谱分析、FFT 卷积）用浮点能成倍缩短开发周期；第三，**商业成本结构**——大批量、价格敏感的消费品（如手机，单颗芯片差几美元就能决定成败）倾向定点以压低硬件BOM成本；小批量、性能至上的高端装备（如售价数十万美元的医用 CT 扫描仪）则首选浮点以换取研发速度与极限精度。",
        "从行业趋势看，嵌入式设计师中有约 38% 已在使用 DSP、49% 正在考虑切换；目前使用定点 DSP 的工程师数量约是浮点的两倍，但浮点市场增速最快——超过一半的 16 位定点用户计划在未来向浮点迁移。",
        "最后必须厘清一个常被误解的事实：定点和浮点**并非永远对应 16 位和 32 位**。例如 SHARC 处理器支持用于数字音频的 **32 位定点模式**，它将 $2^{32}$ 个量化级别**均匀铺满** `[-1, 1]` 这一较小区间；而 32 位浮点则是将同样多的级别按对数铺满 $\\pm 3.4 \\times 10^{38}$ 的巨大范围。因此，**32 位定点在满量程内拥有更高的精度（单次采样量化误差更小），而 32 位浮点则拥有压倒性的动态范围**。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "同速度不同价：在 DSP 上定点与浮点运算速度相近，多花的成本买的是更大的动态范围、更高的信噪比以及成倍缩短的软件开发周期。",
        "16 位定点的两大死穴：一是信号幅值变小时相对量化噪声急剧恶化；二是多阶乘加运算若没有扩展精度累加器（32~80 bit），每步防溢出缩放会让噪声呈百倍级雪崩。",
        "选型分水岭：12~14 bit ADC/DAC 是经验界限；时域短代码且拼百万级出货成本选定点，频域复杂算法或小批量高性能设备选浮点。",
        "精度 vs 动态范围辨析：同为 32 位时，32 位定点在 [-1, 1] 内精度更高（单样本误差更小），32 位浮点则拥有横跨 76 个数量级的超大动态范围。"
      ]
    }
  ]
});
