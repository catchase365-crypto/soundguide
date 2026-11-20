window.__BOOK_REGISTER_SECTION__("sec_017", {
  "title": "数据压缩与语音码率权衡 (Compression)",
  "intuition": "相邻的语音采样点几乎都在“重复彼此”，DSP 数据压缩算法正是利用这种冗余性，在保持听感可用的前提下把占用带宽狠狠砍掉数倍甚至数十倍。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么数字化语音可以大幅压缩？——相邻采样的高度冗余",
      "paragraphs": [
        "在传统数字电话网络中，模拟语音通常以 **每秒 8000 次采样（8000 samples/sec）**、每次 8 bit 对数压缩编码的方式进行数字化，算下来单路语音需要占据 **64 kilobits/sec (64 kbps)** 的传输速率。",
        "但如果我们把这 8000 个采样点排成一排仔细观察，会发现一个惊人的事实：绝大多数数字信息都是 **冗余的（redundant）**。由于人类声带振动和空气介质的物理惯性，声音信号在短短 1/8000 秒（0.125 毫秒）内根本来不及发生剧烈突变。也就是说，**任意一个采样点携带的信息，很大程度上已经被它紧邻的前后采样点重复表达了**。",
        "为了不再花昂贵的带宽反复传输这些“几乎没变”的数值，科学家们开发了数十种 DSP **数据压缩（data compression）** 算法，并在接收端使用匹配的 **解压缩（uncompression）** 算法将其恢复为原始信号形态。最朴素的直觉就是：与其传输每个点的绝对幅度，不如只传输相邻两点之间的微小差值。"
      ],
      "formula": {
        "expr": "d[n] = x[n] - x[n-1]",
        "explain": "x[n] 是第 n 个语音采样值，x[n-1] 是前一个紧邻采样值，d[n] 是两者的差值（残差）。因为语音变化平滑，d[n] 的幅度远小于 x[n]，只需很少的比特就能记下来。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：直击 8000 Hz 语音采样的相邻冗余度",
      "instruction": "拖动「语音基频」与「高频复杂度」滑块，对比上方原始采样点 x[n] 与下方相邻差值 d[n] 的幅度差异，观察冗余是如何转化为码率节省的。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "语音基频",
          "min": 120,
          "max": 500,
          "step": 10,
          "value": 200,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "detail",
          "label": "高频复杂度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 25,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "showDiff",
          "label": "显示相邻采样差值 d[n]",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst w = lab.width;\nconst h = lab.height;\n\nfunction draw() {\n  const freq = lab.values.freq;\n  const detail = lab.values.detail / 100;\n  const showDiff = lab.values.showDiff;\n\n  ctx.clearRect(0, 0, w, h);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, w, h);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= w; gx += 72) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();\n  }\n  for (let gy = 30; gy < h; gy += 45) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();\n  }\n\n  const N = 80;\n  const fs = 8000;\n  const samples = [];\n  let maxX = 0;\n  let maxD = 0;\n\n  for (let i = 0; i < N; i++) {\n    const t = i / fs;\n    const raw = 0.65 * Math.sin(2 * Math.PI * freq * t) + 0.35 * detail * Math.sin(2 * Math.PI * freq * 2.8 * t + 0.7);\n    const q = Math.round(raw * 127);\n    samples.push(q);\n    if (Math.abs(q) > maxX) maxX = Math.abs(q);\n  }\n\n  const diffs = [0];\n  for (let i = 1; i < N; i++) {\n    const d = samples[i] - samples[i - 1];\n    diffs.push(d);\n    if (Math.abs(d) > maxD) maxD = Math.abs(d);\n  }\n\n  const yTop = 72;\n  const yBot = 178;\n  const scale = 52 / 127;\n  const stepX = (w - 40) / (N - 1);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(20, yTop); ctx.lineTo(w - 20, yTop); ctx.stroke();\n  if (showDiff) {\n    ctx.beginPath(); ctx.moveTo(20, yBot); ctx.lineTo(w - 20, yBot); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.4)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const px = 20 + i * stepX;\n    const py = yTop - samples[i] * scale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (let i = 0; i < N; i++) {\n    const px = 20 + i * stepX;\n    const py = yTop - samples[i] * scale;\n    ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n    ctx.beginPath(); ctx.moveTo(px, yTop); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('原始 8000 Hz 采样 x[n] (需要 ±127 满量程 8 bit 编码)', 20, 18);\n\n  if (showDiff) {\n    const boxH = Math.max(4, maxD * scale);\n    ctx.fillStyle = 'rgba(16,185,129,0.10)';\n    ctx.fillRect(20, yBot - boxH, w - 40, boxH * 2);\n\n    for (let i = 1; i < N; i++) {\n      const px = 20 + i * stepX;\n      const py = yBot - diffs[i] * scale;\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath(); ctx.moveTo(px, yBot); ctx.lineTo(px, py); ctx.stroke();\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath(); ctx.arc(px, py, 2.3, 0, Math.PI * 2); ctx.fill();\n    }\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('相邻采样差值 d[n] = x[n] - x[n-1] (绿色阴影为实际占用动态范围)', 20, 130);\n  }\n\n  const bitsNeeded = Math.max(2, Math.ceil(Math.log2(maxD * 2 + 1)));\n  const estRate = bitsNeeded * 8;\n  const ratio = (64 / estRate).toFixed(1);\n  lab.setReadout(`原始峰值: ±${maxX} (64 kbps)  |  差值峰值: ±${maxD}  |  仅编码差值约需: ${bitsNeeded} bit/样本 (≈ ${estRate} kbps，压缩 ${ratio}x)`);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "压缩率与音质的三大工程台阶：64 → 32 → 8 → 2 kbps",
      "paragraphs": [
        "不同的数据压缩算法在**压缩比（数据率降低多少）**与**还原音质（失真程度）**之间做出了截然不同的工程权衡。在电信与语音工程中，有三个极具代表性的性能台阶：",
        "1. **64 kbps 降至 32 kbps（压缩 2 倍）**：通常**没有任何可感知的音质损失（no loss of sound quality）**。此时依靠波形预测与差分量化，足以忠实还原人耳听觉细节。",
        "2. **压缩至 8 kbps（压缩 8 倍）**：声音听起来会**受到明显影响（noticeably affected）**，比如高频变闷或带有轻微金属声，但依然清晰可辨，**完全可用于长途电话网络**，在信道昂贵的年代极大地降低了通话成本。",
        "3. **极限压缩至约 2 kbps（压缩约 32 倍）**：这是传统语音压缩能达到的最高极限之一。此时的语音已经**高度失真（highly distorted）**，带有强烈的机器电子音质感，普通民用通话难以忍受，但在**军事通信（military）和海底通信（undersea communications）**等带宽极度匮乏的极端场景下，能听懂关键指令就已经具备巨大的实用价值。"
      ],
      "formula": {
        "expr": "Bitrate = f_s × B_eff",
        "explain": "Bitrate 为总数据率（如 64, 32, 8, 2 kbps）；f_s 为采样率（8000 Hz）；B_eff 为每个采样点平均消耗的有效比特数。当 B_eff 从 8 bit 压到 0.25 bit（即 2 kbps）时，已无法逐点记录波形，只能改用参数模型勉强合成语音轮廓。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：语音压缩码率与听感失真实时实验室（支持发声）",
      "instruction": "点击播放合成元音语音，缓慢将「目标压缩码率」从 64 kbps 一路向左拖到 32、8 乃至 2 kbps，对比波形台阶、误差波以及耳朵听到的失真变化。",
      "controls": [
        {
          "type": "slider",
          "id": "bitrate",
          "label": "目标压缩码率",
          "min": 2,
          "max": 64,
          "step": 2,
          "value": 64,
          "unit": " kbps"
        },
        {
          "type": "toggle",
          "id": "showError",
          "label": "显示压缩失真误差波",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放模拟压缩语音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst w = lab.width;\nconst h = lab.height;\n\nlet audioCtx = null;\nlet scriptNode = null;\nlet isPlaying = false;\nlet phase = 0;\nlet modPhase = 0;\nlet heldSample = 0;\nlet holdCounter = 0;\nlet visualOffset = 0;\n\nfunction getParams(br) {\n  let levels, targetFs, buzzy, tier, color;\n  if (br >= 32) {\n    levels = Math.round(16 + ((br - 32) / 32) * 240);\n    targetFs = 8000;\n    buzzy = 0;\n    tier = br >= 60 ? '原始基准 (64 kbps 级)' : '无损听感区 (≥32 kbps，无音质损失)';\n    color = '#10b981';\n  } else if (br >= 8) {\n    levels = Math.round(5 + ((br - 8) / 24) * 11);\n    targetFs = 3200 + ((br - 8) / 24) * 4800;\n    buzzy = ((32 - br) / 24) * 0.25;\n    tier = '长途电话可用区 (8~30 kbps，音质明显受影响但可用)';\n    color = '#f59e0b';\n  } else {\n    levels = Math.max(2, Math.round(2 + ((br - 2) / 6) * 3));\n    targetFs = 1200 + ((br - 2) / 6) * 2000;\n    buzzy = 0.45 + ((8 - br) / 6) * 0.40;\n    tier = '极限窄带区 (≈2 kbps，高度失真，适于军事/海底通信)';\n    color = '#ec4899';\n  }\n  return { levels, targetFs, buzzy, tier, color };\n}\n\nfunction draw() {\n  const br = lab.values.bitrate;\n  const showError = lab.values.showError;\n  const p = getParams(br);\n\n  ctx.clearRect(0, 0, w, h);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, w, h);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= w; gx += 72) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();\n  }\n  for (let gy = 40; gy < h; gy += 45) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();\n  }\n\n  const yWave = showError ? 82 : 120;\n  const yErr = 192;\n  const amp = showError ? 52 : 76;\n  const errAmp = 34;\n  const duration = 0.015;\n  const steps = 360;\n  const holdStep = Math.max(1, Math.round((8000 / p.targetFs) * (steps / 120)));\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.beginPath(); ctx.moveTo(20, yWave); ctx.lineTo(w - 20, yWave); ctx.stroke();\n  if (showError) {\n    ctx.beginPath(); ctx.moveTo(20, yErr); ctx.lineTo(w - 20, yErr); ctx.stroke();\n  }\n\n  const origArr = [];\n  const compArr = [];\n  let lastComp = 0;\n  let sqErrSum = 0;\n\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * duration + visualOffset;\n    const ph = 2 * Math.PI * 165 * t;\n    const orig = 0.55 * Math.sin(ph) + 0.30 * Math.sin(ph * 2 + 0.4) + 0.15 * Math.sin(ph * 3);\n    origArr.push(orig);\n\n    if (i % holdStep === 0) {\n      let s = orig;\n      if (p.buzzy > 0) {\n        const pulse = (Math.sin(ph) > 0 ? 1 : -1) * 0.45;\n        s = s * (1 - p.buzzy) + pulse * p.buzzy;\n      }\n      lastComp = Math.round(s * p.levels) / p.levels;\n    }\n    compArr.push(lastComp);\n    const diff = lastComp - orig;\n    sqErrSum += diff * diff;\n  }\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const px = 20 + (i / steps) * (w - 40);\n    const py = yWave - origArr[i] * amp;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = p.color;\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const px = 20 + (i / steps) * (w - 40);\n    const py = yWave - compArr[i] * amp;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (showError) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= steps; i++) {\n      const px = 20 + (i / steps) * (w - 40);\n      const py = yErr - (compArr[i] - origArr[i]) * errAmp;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('失真误差波 (还原波形 - 原始波形)', 20, 150);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('浅蓝: 原始语音波形   |   粗线: 压缩解压后波形 (' + br + ' kbps)', 20, 20);\n\n  const rmsErr = Math.sqrt(sqErrSum / (steps + 1));\n  const snr = rmsErr < 0.002 ? '> 45 dB' : (20 * Math.log10(0.45 / rmsErr)).toFixed(1) + ' dB';\n  lab.setReadout(`当前码率: ${br} kbps (${(64 / br).toFixed(1)}x 压缩)  |  状态: ${p.tier}  |  等效信噪比: ${snr}`);\n}\n\nfunction syncAudio() {\n  if (lab.values.play && !isPlaying) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    scriptNode = audioCtx.createScriptProcessor(1024, 0, 1);\n    scriptNode.onaudioprocess = function(e) {\n      const out = e.outputBuffer.getChannelData(0);\n      const sr = audioCtx.sampleRate || 44100;\n      const p = getParams(lab.values.bitrate);\n      const holdSamples = Math.max(1, Math.round(sr / p.targetFs));\n      for (let i = 0; i < out.length; i++) {\n        modPhase = (modPhase + (2 * Math.PI * 2.0) / sr) % (2 * Math.PI);\n        const pitch = 155 + 16 * Math.sin(modPhase);\n        phase = (phase + (2 * Math.PI * pitch) / sr) % (2 * Math.PI);\n        if (holdCounter <= 0) {\n          let s = 0.55 * Math.sin(phase) + 0.30 * Math.sin(phase * 2 + 0.4) + 0.15 * Math.sin(phase * 3);\n          if (p.buzzy > 0) {\n            const pulse = (Math.sin(phase) > 0 ? 1 : -1) * 0.45;\n            s = s * (1 - p.buzzy) + pulse * p.buzzy;\n          }\n          heldSample = Math.round(s * p.levels) / p.levels;\n          holdCounter = holdSamples;\n        }\n        holdCounter--;\n        out[i] = heldSample * 0.22;\n      }\n    };\n    scriptNode.connect(audioCtx.destination);\n    isPlaying = true;\n  } else if (!lab.values.play && isPlaying) {\n    if (scriptNode) {\n      scriptNode.disconnect();\n      scriptNode = null;\n    }\n    isPlaying = false;\n  }\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    visualOffset += dt * 0.004;\n    draw();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "压缩的本质不是“凭空丢信息”，而是剔除相邻采样之间高度重复的冗余部分；信号变化越平缓，可压缩的潜力就越大。",
        "做音频/语音系统选型时牢记三个分水岭：32 kbps 可保音质无损，8 kbps 适合高性价比长途语音通信，2 kbps 属于军事/海底等极端窄带的保底方案（高度失真但能听清语意）。",
        "压缩与解压缩必须严格成对匹配；一旦丢包或两端算法版本不一致，差值预测链条会瞬间崩塌并产生刺耳爆音。"
      ]
    }
  ]
});
