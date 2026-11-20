window.__BOOK_REGISTER_SECTION__("sec_018", {
  "title": "回声控制与主动消噪 (Echo Control)",
  "intuition": "把恼人的回声或环境噪声精确测量出来，再由数字芯片制造一个波形完全相反的“镜像反信号”与之叠加，让干扰在耳边凭空归零。",
  "blocks": [
    {
      "type": "concept",
      "heading": "电话回声从哪来？为何短途无感、长途抓狂？",
      "paragraphs": [
        "在长途电话通信中，回声是一个非常棘手的问题。当你对着电话说话时，代表你声音的信号会沿着线路传到对方的接收端，但总有一小部分信号能量会在远端发生反射，像皮球撞墙一样**作为回声传回你的听筒**。",
        "为什么你打同城或几百公里内的电话时几乎察觉不到回声？因为距离短时，信号往返的耗时（延迟）只有**几毫秒（milliseconds）**。人耳早已习惯在日常室内环境里听到这种极短延迟的反射声，大脑会自动把它与原声融为一体，通话听起来十分自然。",
        "但当通话跨越洲际（如跨洋长途）时，距离拉长导致回声延迟暴增到**几百毫秒**。这时你会清清楚楚地听到自己半秒前刚说完的话又在耳边重复一遍，节奏被打断，听感极其刺耳和烦躁。"
      ],
      "formula": {
        "expr": "y(t) = s(t) + α · s(t - τ)",
        "explain": "y(t) 是你听筒里最终听到的声音；s(t) 是你自己的原声（或侧音）；α 是远端反射回来的回声衰减系数（0 < α < 1）；τ 是信号往返一趟的时间延迟。当 τ 只有几毫秒时几乎无感，一旦 τ 达到数百毫秒就会产生明显回声。"
      }
    },
    {
      "type": "lab",
      "heading": "长途电话回声延迟与反信号抵消实验",
      "instruction": "拖动“往返延迟”滑块对比短途（<20ms）与洲际长途（>200ms）的听感差异，再开启“DSP 反信号抵消”并点击播放声音，亲耳听回声是如何被抹除的。",
      "controls": [
        {
          "type": "slider",
          "id": "delayMs",
          "label": "往返延迟 τ",
          "min": 5,
          "max": 350,
          "step": 5,
          "value": 220,
          "unit": " ms"
        },
        {
          "type": "slider",
          "id": "echoGain",
          "label": "回声反射强度 α",
          "min": 0.1,
          "max": 0.9,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "cancel",
          "label": "开启 DSP 反信号抵消",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲测试音",
          "activeLabel": "⏸ 停止测试音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet pulseTimer = 0.95;\nlet wasPlaying = false;\n\nfunction envelope(dtMs) {\n  if (dtMs < 0 || dtMs > 45) return 0;\n  const x = dtMs / 45;\n  return Math.sin(Math.PI * x) * Math.sin(2 * Math.PI * 3.5 * x);\n}\n\nfunction draw() {\n  const delayMs = lab.values.delayMs;\n  const echoGain = lab.values.echoGain;\n  const cancel = lab.values.cancel;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 72) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (let y = 30; y < H; y += 45) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n\n  const yTop = 82;\n  const yBot = 185;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(20, yTop); ctx.lineTo(W - 20, yTop);\n  ctx.moveTo(20, yBot); ctx.lineTo(W - 20, yBot);\n  ctx.stroke();\n\n  const tStart = 35;\n  const maxMs = 450;\n  const toX = (ms) => 24 + (ms / maxMs) * (W - 48);\n  const amp = 48;\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let ms = 0; ms <= maxMs; ms += 1) {\n    const val = envelope(ms - tStart);\n    const x = toX(ms);\n    const y = yTop - val * amp;\n    if (ms === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let ms = 0; ms <= maxMs; ms += 1) {\n    const val = echoGain * envelope(ms - (tStart + delayMs));\n    const x = toX(ms);\n    const y = yTop - val * amp;\n    if (ms === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (cancel) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    for (let ms = 0; ms <= maxMs; ms += 1) {\n      const val = -echoGain * 0.97 * envelope(ms - (tStart + delayMs));\n      const x = toX(ms);\n      const y = yTop - val * amp;\n      if (ms === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let ms = 0; ms <= maxMs; ms += 1) {\n    const orig = envelope(ms - tStart);\n    const echo = echoGain * envelope(ms - (tStart + delayMs));\n    const anti = cancel ? -echoGain * 0.97 * envelope(ms - (tStart + delayMs)) : 0;\n    const net = orig + echo + anti;\n    const x = toX(ms);\n    const y = yBot - net * amp;\n    if (ms === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('原声发射 (0 ms)', toX(tStart) - 10, 22);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('返回回声 (+' + delayMs + ' ms)', toX(tStart + delayMs) - 20, 22);\n  if (cancel) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('DSP 反信号 (虚线)', W - 135, 40);\n  }\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('最终听到的合成输出信号', 28, yBot - 36);\n\n  const feel = delayMs < 25 ? '自然融为一体 (短途正常)' : (delayMs < 80 ? '出现轻微重音/混响感' : '严重滞后，极其刺耳烦躁');\n  const estKm = Math.round(delayMs * 100);\n  lab.setReadout('往返延迟: ' + delayMs + ' ms (约等效 ' + estKm + ' km 链路) | 主观听感: ' + feel + ' | 状态: ' + (cancel ? '反信号已抵消 (-30 dB)' : '原始未抵消'));\n}\n\nfunction triggerBeep(delayMs, echoGain, cancel) {\n  try {\n    const actx = lab.getAudioContext();\n    if (!actx) return;\n    if (actx.state === 'suspended') actx.resume();\n    const now = actx.currentTime;\n\n    const playBurst = (startTime, gainVal) => {\n      if (gainVal < 0.005) return;\n      const osc = actx.createOscillator();\n      const gain = actx.createGain();\n      osc.type = 'sine';\n      osc.frequency.setValueAtTime(620, startTime);\n      osc.frequency.exponentialRampToValueAtTime(420, startTime + 0.06);\n      gain.gain.setValueAtTime(0.0001, startTime);\n      gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.008);\n      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.065);\n      osc.connect(gain);\n      gain.connect(actx.destination);\n      osc.start(startTime);\n      osc.stop(startTime + 0.075);\n    };\n\n    playBurst(now, 0.25);\n    const residualGain = cancel ? echoGain * 0.25 * 0.03 : echoGain * 0.25;\n    playBurst(now + delayMs / 1000, residualGain);\n  } catch (e) {}\n}\n\nlab.onUpdate(() => {\n  draw();\n  if (lab.values.play && !wasPlaying) {\n    pulseTimer = 0.95;\n  }\n  wasPlaying = !!lab.values.play;\n});\n\nlab.onLoop((dt) => {\n  if (!lab.values.play) return;\n  pulseTimer += dt;\n  if (pulseTimer >= 0.95) {\n    pulseTimer = 0;\n    triggerBeep(lab.values.delayMs, lab.values.echoGain, lab.values.cancel);\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "DSP 的杀手锏：用“反信号”消灭回声、啸叫与环境噪声",
      "paragraphs": [
        "数字信号处理（DSP）对付这类干扰的核心思路非常优雅：**以毒攻毒（波形相消）**。DSP 芯片实时测量返回来的回声信号，计算出它的形状和大小，然后合成一个**幅度相同、但正负完全颠倒的“反信号（Antisignal）”**。当反信号与讨厌的回声相加时，正波峰撞上负波谷，回声就在电路中被精准抵消了。",
        "这同一个原理还直接解决了另外两个现实生活中的大难题：",
        "1. **免提电话防啸叫（Speakerphone Feedback）**：如果你用传统免提设备一边听一边说，扬声器放出的声音会直接灌进旁边的麦克风，不断循环放大，立刻产生刺耳的“啸叫（Squealing）”。利用 DSP 回声消除技术，系统把扬声器发出的声音作为已知参考信号产生反信号抵消掉，就能让双方**同时说话、同时收听（全双工通话）**而不产生啸叫。",
        "2. **环境主动降噪（Antinoise）**：把同一个想法从电话线搬到空气声波中——用麦克风拾取周围环境噪音，再由芯片实时生成波形相反的**数字抗噪声（Antinoise）**播放出来，就能让噪音大幅衰减（这正是今天主动降噪耳机的核心原理）。"
      ],
      "formula": {
        "expr": "e_net[n] = e[n] + (-ê[n]) ≈ 0",
        "explain": "e[n] 是实际混入的回声或环境噪声离散采样值；-ê[n] 是 DSP 实时预测并生成反相后的“反信号 / 抗噪声”；只要预测得足够准，两者相加的残余信号 e_net[n] 就会趋近于 0。"
      }
    },
    {
      "type": "lab",
      "heading": "数字抗噪声 (Antinoise) 与相位精准度挑战",
      "instruction": "开启声音播放环境嗡鸣声，试着拖动“反信号相位误差”和“幅度匹配度”滑块，观察为什么反信号必须极度精确，否则不仅消不掉噪声，甚至可能让噪声变得更响！",
      "controls": [
        {
          "type": "slider",
          "id": "phaseErr",
          "label": "反信号相位误差",
          "min": 0,
          "max": 180,
          "step": 1,
          "value": 0,
          "unit": " °"
        },
        {
          "type": "slider",
          "id": "ampMatch",
          "label": "反信号幅度匹配度",
          "min": 0,
          "max": 150,
          "step": 5,
          "value": 100,
          "unit": " %"
        },
        {
          "type": "toggle",
          "id": "antinoise",
          "label": "开启主动降噪 (Antinoise)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放环境低频嗡鸣声",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet phaseScroll = 0;\nlet osc1 = null;\nlet masterGain = null;\n\nfunction getResidualFactor() {\n  if (!lab.values.antinoise) return 1.0;\n  const a = lab.values.ampMatch / 100;\n  const phi = (lab.values.phaseErr * Math.PI) / 180;\n  return Math.sqrt(Math.pow(1 - a * Math.cos(phi), 2) + Math.pow(a * Math.sin(phi), 2));\n}\n\nfunction updateAudio() {\n  try {\n    if (lab.values.play) {\n      const actx = lab.getAudioContext();\n      if (!actx) return;\n      if (actx.state === 'suspended') actx.resume();\n      if (!osc1) {\n        osc1 = actx.createOscillator();\n        masterGain = actx.createGain();\n        osc1.type = 'triangle';\n        osc1.frequency.setValueAtTime(165, actx.currentTime);\n        masterGain.gain.setValueAtTime(0, actx.currentTime);\n        osc1.connect(masterGain);\n        masterGain.connect(actx.destination);\n        osc1.start();\n      }\n      const r = getResidualFactor();\n      masterGain.gain.setTargetAtTime(Math.min(0.35, 0.14 * r), actx.currentTime, 0.03);\n    } else if (masterGain) {\n      const actx = lab.getAudioContext();\n      if (actx) masterGain.gain.setTargetAtTime(0, actx.currentTime, 0.03);\n    }\n  } catch (e) {}\n}\n\nfunction draw() {\n  const antinoise = lab.values.antinoise;\n  const a = lab.values.ampMatch / 100;\n  const phi = (lab.values.phaseErr * Math.PI) / 180;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 60) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (let y = 30; y < H; y += 45) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n\n  const midY = H / 2 + 8;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(W, midY); ctx.stroke();\n\n  const amp = 52;\n  const cycles = 3.2;\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let x = 0; x <= W; x += 2) {\n    const theta = (x / W) * Math.PI * 2 * cycles - phaseScroll;\n    const y = midY - Math.sin(theta) * amp;\n    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (antinoise) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (let x = 0; x <= W; x += 2) {\n      const theta = (x / W) * Math.PI * 2 * cycles - phaseScroll;\n      const y = midY - (-a * Math.sin(theta + phi)) * amp;\n      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  for (let x = 0; x <= W; x += 2) {\n    const theta = (x / W) * Math.PI * 2 * cycles - phaseScroll;\n    const noise = Math.sin(theta);\n    const anti = antinoise ? -a * Math.sin(theta + phi) : 0;\n    const y = midY - (noise + anti) * amp;\n    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('● 环境原始噪声', 20, 24);\n  if (antinoise) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('● 数字反噪声 (Antinoise)', 140, 24);\n  }\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('● 叠加后残余声波', 310, 24);\n\n  const r = getResidualFactor();\n  const pct = Math.round(r * 100);\n  const db = r < 0.005 ? '-46.0 dB (近乎静音)' : (20 * Math.log10(r)).toFixed(1) + ' dB';\n  const warn = r > 1.01 ? ' ⚠ 相位偏差过大，噪声反而被放大！' : (r < 0.15 ? ' ✓ 完美反相抵消' : '');\n  lab.setReadout('残余噪声幅度: ' + pct + '% (' + db + ')' + warn);\n}\n\nlab.onUpdate(() => {\n  draw();\n  updateAudio();\n});\n\nlab.onLoop((dt) => {\n  phaseScroll += dt * 3.0;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "回声是否让人抓狂，核心取决于“时间延迟 τ”：几毫秒的回声符合人耳日常经验，几百毫秒的延迟则是通讯系统的大敌。",
        "反信号（Antisignal）和主动降噪（Antinoise）对相位与延迟估计极为敏感：如果相位误差超过 60°（尤其是接近 180° 时），抵消不仅失效，还会同相叠加让噪声和啸叫变得更响。",
        "在真实免提通话和主动降噪工程中，房间或链路反射特性会随人体移动和温度变化而改变，因此不能只用固定参数，必须依靠 DSP 进行实时测量与自适应追踪。"
      ]
    }
  ]
});
