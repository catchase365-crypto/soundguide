window.__BOOK_REGISTER_SECTION__("sec_019", {
  "title": "数字音乐处理：多轨混音与人工混响 (Music)",
  "intuition": "数字化表示保护音乐信号在漫长链路中不发生劣化，而数字混音与人工混响则能把录音棚里单薄的干声，重塑为置身客厅或大教堂的沉浸式空间听感。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从录音棚到音箱：为什么需要数字化与多轨混音？",
      "paragraphs": [
        "一首音乐从歌手与乐手的**麦克风**出发，最终抵达发烧友的**扬声器**，中间要经过极其漫长的录制、存储、剪辑与分发链路。如果采用传统的**模拟存储与处理**（例如老式磁带），每一次复制、剪辑和传输都会叠加磁带底噪、失真与高频衰减——任何对比过**盒式磁带 (Cassette Tape)** 与 **激光唱片 (Compact Disk, CD)** 音质的人，都能立刻听出这种差距。**数字数据表示**的核心威力，就在于让信号在无数次搬运与运算后依然保持“零代际损耗”。",
        "在现代录音棚的典型工作流中，音乐并不是一次“一锅端”录完的，而是分别录制在**多个独立声道或音轨 (Multiple Channels / Tracks)** 上——甚至会把每件乐器和每一位歌手分开录制。这样做给了音响工程师极大的创作自由，可以在后期单独修正某件乐器的音准、音量与音色。",
        "将各个独立音轨合成为最终成品的复杂过程，称为**混音 (Mix Down)**。在混音阶段，**数字信号处理 (DSP)** 承担着至关重要的角色，包括**滤波 (Filtering)**、**信号的加减叠加 (Signal Addition and Subtraction)** 以及**精细剪辑 (Signal Editing)** 等。"
      ],
      "formula": {
        "expr": "y[n] = Σ w_k · x_k[n]",
        "explain": "y[n] 是混音输出的最终数字音频序列；x_k[n] 代表第 k 条独立录制的乐器或人声数字音轨；w_k 是工程师为第 k 轨设定的增益权重（可通过加减和滤波动态调整各轨平衡）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：多轨混音台与“磁带劣化 vs 数字无损”听感对比",
      "instruction": "拖动两条音轨的增益滑块观察叠加波形，并打开“模拟磁带劣化”开关，实时听辨底噪与非线性失真对音质的破坏。",
      "controls": [
        {
          "type": "slider",
          "id": "g1",
          "label": "轨道 1 增益 (330Hz 旋律)",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "g2",
          "label": "轨道 2 增益 (110Hz 贝斯)",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "analogDegrade",
          "label": "开启模拟磁带劣化 (底噪 + 削波失真)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放混音监听",
          "activeLabel": "⏸ 停止监听"
        }
      ],
      "jsCode": "const ctx2d = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet phase = 0;\nlet ac = null;\nlet osc1 = null, osc2 = null, gain1 = null, gain2 = null, master = null;\nlet noiseSrc = null, noiseGain = null, shaper = null;\n\nfunction makeCurve(amount, linear) {\n  const n = 256;\n  const c = new Float32Array(n);\n  for (let i = 0; i < n; i++) {\n    const x = (i * 2) / (n - 1) - 1;\n    if (linear) {\n      c[i] = x;\n    } else {\n      c[i] = ((3 + amount) * x * 20 * (Math.PI / 180)) / (Math.PI + amount * Math.abs(x));\n    }\n  }\n  return c;\n}\nconst linearCurve = makeCurve(0, true);\nconst tapeCurve = makeCurve(38, false);\n\nfunction stopAudio() {\n  try {\n    if (osc1) { osc1.stop(); osc1.disconnect(); osc1 = null; }\n    if (osc2) { osc2.stop(); osc2.disconnect(); osc2 = null; }\n    if (noiseSrc) { noiseSrc.stop(); noiseSrc.disconnect(); noiseSrc = null; }\n    if (master) { master.disconnect(); master = null; }\n  } catch (e) {}\n}\n\nfunction syncAudio() {\n  const v = lab.values;\n  if (!v.play) {\n    stopAudio();\n    return;\n  }\n  ac = lab.getAudioContext();\n  if (!ac || ac.state === 'closed') return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!osc1) {\n    master = ac.createGain();\n    master.gain.value = 0.22;\n    shaper = ac.createWaveShaper();\n    shaper.oversample = '2x';\n    shaper.curve = linearCurve;\n    master.connect(shaper);\n    shaper.connect(ac.destination);\n\n    osc1 = ac.createOscillator();\n    osc1.type = 'triangle';\n    osc1.frequency.value = 330;\n    gain1 = ac.createGain();\n    osc1.connect(gain1);\n    gain1.connect(master);\n    osc1.start();\n\n    osc2 = ac.createOscillator();\n    osc2.type = 'sine';\n    osc2.frequency.value = 110;\n    gain2 = ac.createGain();\n    osc2.connect(gain2);\n    gain2.connect(master);\n    osc2.start();\n\n    const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);\n    const data = buf.getChannelData(0);\n    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.22;\n    noiseSrc = ac.createBufferSource();\n    noiseSrc.buffer = buf;\n    noiseSrc.loop = true;\n    noiseGain = ac.createGain();\n    noiseSrc.connect(noiseGain);\n    noiseGain.connect(master);\n    noiseSrc.start();\n  }\n  const now = ac.currentTime;\n  gain1.gain.setTargetAtTime(v.g1 * 0.45, now, 0.03);\n  gain2.gain.setTargetAtTime(v.g2 * 0.55, now, 0.03);\n  noiseGain.gain.setTargetAtTime(v.analogDegrade ? 0.14 : 0, now, 0.03);\n  shaper.curve = v.analogDegrade ? tapeCurve : linearCurve;\n}\n\nfunction draw() {\n  const v = lab.values;\n  ctx2d.clearRect(0, 0, W, H);\n  ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx2d.lineWidth = 1;\n  for (let gx = 0; gx <= W; gx += 60) {\n    ctx2d.beginPath(); ctx2d.moveTo(gx, 0); ctx2d.lineTo(gx, H); ctx2d.stroke();\n  }\n  [42, 102, 178].forEach(cy => {\n    ctx2d.beginPath(); ctx2d.moveTo(0, cy); ctx2d.lineTo(W, cy); ctx2d.stroke();\n  });\n\n  ctx2d.font = '12px sans-serif';\n  ctx2d.fillStyle = '#38bdf8';\n  ctx2d.fillText('Track 1 (330Hz 旋律轨)', 12, 20);\n  ctx2d.fillStyle = '#ec4899';\n  ctx2d.fillText('Track 2 (110Hz 贝斯轨)', 12, 80);\n  ctx2d.fillStyle = v.analogDegrade ? '#f59e0b' : '#10b981';\n  ctx2d.fillText(v.analogDegrade ? 'Mix Down 输出 (模拟磁带劣化：底噪 + 削波失真)' : 'Mix Down 输出 (数字无损混音：纯净线性叠加)', 12, 140);\n\n  ctx2d.lineWidth = 2;\n  ctx2d.strokeStyle = '#38bdf8';\n  ctx2d.beginPath();\n  for (let x = 0; x < W; x += 2) {\n    const t = (x / W) * Math.PI * 10;\n    const y = 42 - v.g1 * 22 * Math.sin(t * 3 + phase);\n    if (x === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);\n  }\n  ctx2d.stroke();\n\n  ctx2d.strokeStyle = '#ec4899';\n  ctx2d.beginPath();\n  for (let x = 0; x < W; x += 2) {\n    const t = (x / W) * Math.PI * 10;\n    const y = 102 - v.g2 * 22 * Math.sin(t + phase * 0.5);\n    if (x === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);\n  }\n  ctx2d.stroke();\n\n  ctx2d.strokeStyle = v.analogDegrade ? '#f59e0b' : '#10b981';\n  ctx2d.lineWidth = 2.4;\n  ctx2d.beginPath();\n  for (let x = 0; x < W; x += 2) {\n    const t = (x / W) * Math.PI * 10;\n    const s1 = v.g1 * Math.sin(t * 3 + phase);\n    const s2 = v.g2 * Math.sin(t + phase * 0.5);\n    let mix = 0.55 * (s1 + s2);\n    if (v.analogDegrade) {\n      const r = Math.sin(x * 12.9898 + phase * 9.3) * 43758.5453;\n      const noise = (r - Math.floor(r) - 0.5) * 0.24;\n      mix = Math.tanh(mix * 2.1) * 0.85 + noise;\n    }\n    const y = 178 - mix * 38;\n    if (x === 0) ctx2d.moveTo(x, y); else ctx2d.lineTo(x, y);\n  }\n  ctx2d.stroke();\n\n  lab.setReadout('轨1权重: ' + v.g1.toFixed(2) + ' | 轨2权重: ' + v.g2.toFixed(2) + ' | 链路状态: ' + (v.analogDegrade ? '模拟劣化 (信噪比下降)' : '数字保真 (SNR 极高)'));\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  phase += dt * 4.5;\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "人工混响 (Artificial Reverberation)：把“户外干声”变成“大教堂”",
      "paragraphs": [
        "在音乐制作中，最迷人的 DSP 应用之一便是**人工混响 (Artificial Reverberation)**。为什么录好音之后不能直接把各轨加在一起就完事？因为专业录音棚为了避免录制时互相串音，四周都铺满了吸音材料，尽量消除了自然回声。如果直接将这样的“干声”轨道简单相加，听众听到的成品就会显得**单薄而干瘪 (frail and diluted)**，仿佛乐队是在空旷的户外露天演奏一样。",
        "人类的听觉极其依赖声音中的**回声与混响成分**来判断空间感。DSP 允许工程师在**混音 (Mix Down)** 阶段向干声中注入精确控制的人工回声与混响，从而模拟出各种理想的聆听环境：",
        "• **10–20 毫秒 (ms) 的短延迟回声**：会给大脑传递“声波很快遇到墙壁并反射回来”的线索，营造出**中等大小听音室或舒适客厅**的亲切空间感。\n• **数百毫秒 (a few hundred milliseconds) 的长延迟回声**：意味着声波需要飞跃几十上百米才会折返，能瞬间模拟出**大教堂 (Cathedral-like)** 般宏伟、深邃的声场体验。"
      ],
      "formula": {
        "expr": "y[n] = x[n] + α · y[n - D],  D = round(τ · f_s)",
        "explain": "x[n] 为干声直达信号；y[n - D] 是延迟了 D 个采样点（对应物理延迟时间 τ 秒，f_s 为采样率）后的历史反射声；α (0 ≤ α < 1) 为空间衰减系数，决定回声在空气与墙壁间多次反弹后衰减的快慢。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：人工混响空间模拟器（10–20ms 客厅 vs 数百毫秒教堂）",
      "instruction": "拖动“回声延迟时间 τ”滑块，对比 15ms 小房间与 220ms 大教堂的脉冲响应序列；点击播放听取拨弦脉冲，并切换“纯干声模式”感受户外般的单薄感。",
      "controls": [
        {
          "type": "slider",
          "id": "delayMs",
          "label": "回声延迟时间 τ",
          "min": 10,
          "max": 350,
          "step": 5,
          "value": 15,
          "unit": " ms"
        },
        {
          "type": "slider",
          "id": "wet",
          "label": "混响混合比 (Wet)",
          "min": 0,
          "max": 0.9,
          "step": 0.05,
          "value": 0.55,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "feedback",
          "label": "空间反馈衰减 α",
          "min": 0,
          "max": 0.75,
          "step": 0.05,
          "value": 0.45,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "dryOnly",
          "label": "纯干声模式 (模拟户外无反射)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲试听空间感",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "const ctx2d = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet ac = null;\nlet dryGain = null, wetInput = null, delayNode = null, fbGain = null, wetGain = null, lpFilter = null, master = null;\nlet lastTrigger = -10;\nlet pulseAnim = 0;\n\nfunction teardownAudio() {\n  try {\n    if (master) { master.disconnect(); master = null; }\n    if (delayNode) { delayNode.disconnect(); delayNode = null; }\n  } catch (e) {}\n  dryGain = null; wetInput = null; fbGain = null; wetGain = null; lpFilter = null;\n}\n\nfunction ensureAudio() {\n  const v = lab.values;\n  if (!v.play) {\n    teardownAudio();\n    return;\n  }\n  ac = lab.getAudioContext();\n  if (!ac || ac.state === 'closed') return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!master) {\n    master = ac.createGain();\n    master.gain.value = 0.45;\n    master.connect(ac.destination);\n\n    dryGain = ac.createGain();\n    dryGain.gain.value = 0.85;\n    dryGain.connect(master);\n\n    wetInput = ac.createGain();\n    delayNode = ac.createDelay(1.0);\n    lpFilter = ac.createBiquadFilter();\n    lpFilter.type = 'lowpass';\n    lpFilter.frequency.value = 3400;\n    fbGain = ac.createGain();\n    wetGain = ac.createGain();\n\n    wetInput.connect(delayNode);\n    delayNode.connect(lpFilter);\n    lpFilter.connect(fbGain);\n    fbGain.connect(delayNode);\n    delayNode.connect(wetGain);\n    wetGain.connect(master);\n    lastTrigger = -10;\n  }\n  const now = ac.currentTime;\n  delayNode.delayTime.setTargetAtTime(v.delayMs / 1000, now, 0.02);\n  wetGain.gain.setTargetAtTime(v.dryOnly ? 0 : v.wet, now, 0.02);\n  fbGain.gain.setTargetAtTime(v.dryOnly ? 0 : v.feedback, now, 0.02);\n}\n\nfunction triggerPluck() {\n  if (!ac || !master || ac.state !== 'running') return;\n  const now = ac.currentTime;\n  const freqs = [440, 554.37, 659.25];\n  freqs.forEach((f, idx) => {\n    const osc = ac.createOscillator();\n    const env = ac.createGain();\n    osc.type = idx === 0 ? 'triangle' : 'sine';\n    osc.frequency.value = f;\n    env.gain.setValueAtTime(0.0001, now);\n    env.gain.linearRampToValueAtTime(0.18 / (idx + 1), now + 0.008);\n    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);\n    osc.connect(env);\n    env.connect(dryGain);\n    env.connect(wetInput);\n    osc.start(now);\n    osc.stop(now + 0.13);\n  });\n}\n\nfunction draw() {\n  const v = lab.values;\n  ctx2d.clearRect(0, 0, W, H);\n  const left = 52, right = 685, baseY = 196, maxH = 138;\n  const spanMs = 1000;\n\n  ctx2d.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx2d.lineWidth = 1;\n  for (let ms = 0; ms <= spanMs; ms += 100) {\n    const x = left + (ms / spanMs) * (right - left);\n    ctx2d.beginPath(); ctx2d.moveTo(x, 30); ctx2d.lineTo(x, baseY); ctx2d.stroke();\n    ctx2d.fillStyle = 'rgba(248,250,252,0.5)';\n    ctx2d.font = '11px sans-serif';\n    ctx2d.fillText(ms + 'ms', x - 12, baseY + 18);\n  }\n  ctx2d.beginPath(); ctx2d.moveTo(left, baseY); ctx2d.lineTo(right, baseY); ctx2d.stroke();\n\n  let spaceLabel = '';\n  let echoColor = '#10b981';\n  if (v.dryOnly) {\n    spaceLabel = '当前空间：纯干声直出（如同户外演奏，声音单薄稀释）';\n    echoColor = '#f59e0b';\n  } else if (v.delayMs <= 25) {\n    spaceLabel = '当前空间：10-20ms 级（中等大小客厅 / 紧凑试听室）';\n    echoColor = '#10b981';\n  } else if (v.delayMs < 120) {\n    spaceLabel = '当前空间：25-120ms 级（小型音乐厅 / 剧场声场）';\n    echoColor = '#38bdf8';\n  } else {\n    spaceLabel = '当前空间：百毫秒级（大教堂般宏伟深邃空间）';\n    echoColor = '#ec4899';\n  }\n\n  ctx2d.font = 'bold 13px sans-serif';\n  ctx2d.fillStyle = echoColor;\n  ctx2d.fillText(spaceLabel, left, 22);\n\n  if (!v.dryOnly && v.wet > 0) {\n    ctx2d.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n    ctx2d.setLineDash([5, 4]);\n    ctx2d.lineWidth = 1.5;\n    ctx2d.beginPath();\n    for (let ms = v.delayMs; ms <= spanMs; ms += 10) {\n      const k = (ms - v.delayMs) / v.delayMs;\n      const envAmp = v.wet * Math.pow(Math.max(v.feedback, 0.001), k);\n      const px = left + (ms / spanMs) * (right - left);\n      const py = baseY - envAmp * maxH;\n      if (ms === v.delayMs) ctx2d.moveTo(px, py); else ctx2d.lineTo(px, py);\n    }\n    ctx2d.stroke();\n    ctx2d.setLineDash([]);\n  }\n\n  ctx2d.strokeStyle = '#f8fafc';\n  ctx2d.lineWidth = 4;\n  ctx2d.beginPath();\n  ctx2d.moveTo(left, baseY);\n  ctx2d.lineTo(left, baseY - maxH);\n  ctx2d.stroke();\n  ctx2d.fillStyle = '#f8fafc';\n  ctx2d.beginPath();\n  ctx2d.arc(left, baseY - maxH, 4.5, 0, Math.PI * 2);\n  ctx2d.fill();\n  ctx2d.font = '11px sans-serif';\n  ctx2d.fillText('直达干声', left - 18, baseY - maxH - 10);\n\n  let echoCount = 0;\n  if (!v.dryOnly && v.wet > 0) {\n    for (let k = 1; k * v.delayMs <= spanMs; k++) {\n      const amp = v.wet * Math.pow(v.feedback, k - 1);\n      if (amp < 0.015) break;\n      echoCount++;\n      const px = left + ((k * v.delayMs) / spanMs) * (right - left);\n      const py = baseY - amp * maxH;\n      ctx2d.strokeStyle = echoColor;\n      ctx2d.lineWidth = 2.5;\n      ctx2d.beginPath();\n      ctx2d.moveTo(px, baseY);\n      ctx2d.lineTo(px, py);\n      ctx2d.stroke();\n      ctx2d.fillStyle = echoColor;\n      ctx2d.beginPath();\n      ctx2d.arc(px, py, 3, 0, Math.PI * 2);\n      ctx2d.fill();\n    }\n  }\n\n  if (v.play && pulseAnim > 0) {\n    const scanX = left + (1 - pulseAnim) * (right - left);\n    ctx2d.strokeStyle = 'rgba(56, 189, 248, ' + (pulseAnim * 0.7) + ')';\n    ctx2d.lineWidth = 2;\n    ctx2d.beginPath(); ctx2d.moveTo(scanX, 32); ctx2d.lineTo(scanX, baseY); ctx2d.stroke();\n  }\n\n  lab.setReadout('延迟 τ: ' + (v.dryOnly ? '0 (关闭)' : v.delayMs + ' ms') + ' | 混响比: ' + (v.dryOnly ? '0.00' : v.wet.toFixed(2)) + ' | 有效反射簇: ' + echoCount + ' 个');\n}\n\nlab.onUpdate(() => {\n  ensureAudio();\n  draw();\n});\n\nlab.onLoop((dt, timeSec) => {\n  const v = lab.values;\n  if (v.play) {\n    if (timeSec - lastTrigger >= 1.25) {\n      lastTrigger = timeSec;\n      pulseAnim = 1.0;\n      triggerPluck();\n    }\n    pulseAnim = Math.max(0, pulseAnim - dt * 0.9);\n  } else {\n    pulseAnim = 0;\n  }\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数字存储与混音的底层优势是“抗长链路劣化”：磁带等模拟介质每多一次拷贝或编辑就会叠加底噪和失真，而数字信号在合理量化精度下可以无损经历成百上千次 DSP 滤波与叠加。",
        "多轨干声绝不能“一加了之”：由于录音棚刻意消除了自然反射，直接相加会让音乐听起来像在户外一样单薄，必须借助人工混响补全空间声学线索。",
        "用延迟时间掌控空间尺度：10–20 ms 对应舒适的中小听音室，几百毫秒则模拟教堂等宏伟空间；工程中写递归混响滤波器 y[n] = x[n] + α·y[n-D] 时，必须严格保证反馈系数 |α| < 1，否则系统会能量发散并产生刺耳啸叫。",
        "多轨叠加注意防削波 (Clipping)：多路数字信号直接相加可能导致瞬时幅值溢出满量程，混音时需合理调节各轨权重 w_k 并预留动态余量 (Headroom)。"
      ]
    }
  ]
});
