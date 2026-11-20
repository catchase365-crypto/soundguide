window.__BOOK_REGISTER_SECTION__("sec_023", {
  "title": "声呐技术与阵列信号处理 (Sonar)",
  "intuition": "声呐就是水下的“雷达”：主动声呐通过发射声波脉冲并分析回波来定位测距，被动声呐则靠低频声波在数千公里外隐蔽监听，而多阵元相控阵与 DSP 算力让它们在复杂海洋环境中精准辨向。",
  "blocks": [
    {
      "type": "concept",
      "heading": "主动声呐 vs 被动声呐：发声测距与隐蔽监听",
      "paragraphs": [
        "**声呐 (Sonar)** 是 **SO**und **NA**vigation and **R**anging（声音导航与测距）的缩写。因为电磁波在海水中会迅速衰减，水下探测只能依靠声波。根据是否主动向外发射能量，声呐分为**主动 (Active)** 和**被动 (Passive)** 两大类。",
        "**主动声呐**向水中发射频率在 **2 kHz 到 40 kHz** 之间的声波脉冲，然后接收并分析目标反射回来的回波。它的典型用途包括：水下物体的探测与定位、水下导航、水声通信以及海底地形测绘，典型最大工作距离约为 **10 到 100 公里**。",
        "**被动声呐**本身不发射任何能量，只是单纯地“倾听”水下声音——包括自然水流湍流、海洋生物发声，以及潜艇和水面舰艇发出的机械噪声。因为完全静默，被动声呐非常适合隐蔽行动（*“你发现了对手，但对手却察觉不到你”*），其最重要的应用是探测与追踪潜艇的军事监视系统。被动声呐通常使用比主动声呐**更低的频率**，因为低频声波在水中传播时的**吸收损耗更小**，探测距离可达**数千公里**。"
      ],
      "formula": {
        "expr": "R = (c * Δt) / 2  |  L_abs(f) ∝ α(f) · R",
        "explain": "R 为目标距离，c 为水下声速（约 1500 m/s），Δt 为主动声呐发射脉冲与收到回波的时间差（往返需除以 2）；L_abs 为海水吸收衰减，频率 f 越高、吸收系数 α(f) 越大，因此高频主动声呐射程近，低频被动声呐能听几千公里。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：主动/被动声呐频率、海水吸收与回波听感模拟",
      "instruction": "拖动「工作频率」和「目标距离」滑块，切换「主动/被动声呐」模式，并点击播放试听水下脉冲回波延迟与衰减（注：音频已将 kHz 频段按比例映射至人耳舒适听觉范围）。",
      "controls": [
        {
          "type": "toggle",
          "id": "passive",
          "label": "切换为被动声呐 (仅监听低频噪声)",
          "value": false
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "工作频率",
          "min": 0.5,
          "max": 40,
          "step": 0.5,
          "value": 10,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "dist",
          "label": "目标距离",
          "min": 5,
          "max": 120,
          "step": 5,
          "value": 40,
          "unit": " km"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听声呐信号",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet pingCycle = 0;\nlet echoTriggered = false;\nlet passiveNodes = null;\n\nfunction getPhysics() {\n  const freq = lab.values.freq;\n  const dist = lab.values.dist;\n  const passive = lab.values.passive;\n  const alpha = 0.004 + 0.00018 * freq * freq;\n  const pathMult = passive ? 1 : 2;\n  const atten = Math.exp(-alpha * dist * pathMult);\n  const c = 1.5;\n  const rtt = (2 * dist) / c;\n  return { freq, dist, passive, alpha, atten, rtt };\n}\n\nfunction stopPassiveAudio() {\n  if (passiveNodes) {\n    try {\n      passiveNodes.osc.stop();\n      passiveNodes.noise.stop();\n      passiveNodes.master.disconnect();\n    } catch (e) {}\n    passiveNodes = null;\n  }\n}\n\nfunction ensurePassiveAudio(atten, freq) {\n  const ac = lab.getAudioContext();\n  if (!ac || ac.state === 'closed') return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!passiveNodes) {\n    const osc = ac.createOscillator();\n    const lfo = ac.createOscillator();\n    const lfoGain = ac.createGain();\n    osc.type = 'sawtooth';\n    lfo.type = 'sine';\n    lfo.frequency.value = 3.5;\n    lfoGain.gain.value = 8;\n    lfo.connect(lfoGain);\n    lfoGain.connect(osc.frequency);\n\n    const filter = ac.createBiquadFilter();\n    filter.type = 'lowpass';\n    filter.frequency.value = 260;\n\n    const bufSize = ac.sampleRate * 2;\n    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);\n    const data = buf.getChannelData(0);\n    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * 0.25;\n    const noise = ac.createBufferSource();\n    noise.buffer = buf;\n    noise.loop = true;\n\n    const noiseFilter = ac.createBiquadFilter();\n    noiseFilter.type = 'bandpass';\n    noiseFilter.frequency.value = 320;\n\n    const master = ac.createGain();\n    master.gain.value = 0.08;\n\n    osc.connect(filter);\n    filter.connect(master);\n    noise.connect(noiseFilter);\n    noiseFilter.connect(master);\n    master.connect(ac.destination);\n\n    osc.start();\n    lfo.start();\n    noise.start();\n    passiveNodes = { osc, lfo, noise, master, filter };\n  }\n  const targetFreq = Math.min(240, 48 + freq * 4.5);\n  passiveNodes.osc.frequency.setTargetAtTime(targetFreq, ac.currentTime, 0.05);\n  passiveNodes.master.gain.setTargetAtTime(0.02 + 0.14 * atten, ac.currentTime, 0.05);\n}\n\nfunction triggerTone(pitch, volume, duration) {\n  const ac = lab.getAudioContext();\n  if (!ac || ac.state === 'closed' || volume < 0.005) return;\n  if (ac.state === 'suspended') ac.resume();\n  const now = ac.currentTime;\n  const osc = ac.createOscillator();\n  const gain = ac.createGain();\n  osc.type = 'sine';\n  osc.frequency.setValueAtTime(pitch, now);\n  gain.gain.setValueAtTime(0.0001, now);\n  gain.gain.exponentialRampToValueAtTime(Math.min(0.25, volume), now + 0.015);\n  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);\n  osc.connect(gain);\n  gain.connect(ac.destination);\n  osc.start(now);\n  osc.stop(now + duration + 0.02);\n}\n\nfunction drawScene(t) {\n  const p = getPhysics();\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';\n  ctx.fillRect(0, 0, W, H);\n\n  const oceanX = 16, oceanY = 18, oceanW = 435, oceanH = 204;\n  const grad = ctx.createLinearGradient(0, oceanY, 0, oceanY + oceanH);\n  grad.addColorStop(0, '#0c2d48');\n  grad.addColorStop(1, '#061322');\n  ctx.fillStyle = grad;\n  ctx.fillRect(oceanX, oceanY, oceanW, oceanH);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(oceanX, oceanY, oceanW, oceanH);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  for (let gx = oceanX + 50; gx < oceanX + oceanW; gx += 50) {\n    ctx.beginPath(); ctx.moveTo(gx, oceanY); ctx.lineTo(gx, oceanY + oceanH); ctx.stroke();\n  }\n  for (let gy = oceanY + 40; gy < oceanY + oceanH; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(oceanX, gy); ctx.lineTo(oceanX + oceanW, gy); ctx.stroke();\n  }\n\n  const sx = 52, sy = 120;\n  const tx = 85 + ((p.dist - 5) / 115) * 335;\n  const ty = 120;\n\n  const period = 2.6;\n  const cyclePhase = (pingCycle % period) / period;\n  const travelFrac = 0.08 + (p.dist / 120) * 0.42;\n\n  if (!p.passive) {\n    if (cyclePhase < travelFrac) {\n      const prog = cyclePhase / travelFrac;\n      const rx = sx + prog * (tx - sx);\n      ctx.strokeStyle = '#38bdf8';\n      ctx.lineWidth = 2.5;\n      ctx.beginPath();\n      ctx.arc(sx, sy, Math.max(4, rx - sx), -0.42, 0.42);\n      ctx.stroke();\n    } else if (cyclePhase < travelFrac * 2) {\n      const prog = (cyclePhase - travelFrac) / travelFrac;\n      const rx = tx - prog * (tx - sx);\n      const alphaEcho = Math.max(0.12, p.atten);\n      ctx.strokeStyle = 'rgba(16, 185, 129, ' + alphaEcho.toFixed(2) + ')';\n      ctx.lineWidth = 2.5;\n      ctx.beginPath();\n      ctx.arc(tx, ty, Math.max(4, tx - rx), Math.PI - 0.42, Math.PI + 0.42);\n      ctx.stroke();\n    }\n  } else {\n    for (let k = 0; k < 3; k++) {\n      const r = ((t * 55 + k * 75) % 240);\n      const op = Math.max(0.05, (1 - r / 240) * Math.max(0.25, p.atten));\n      ctx.strokeStyle = 'rgba(245, 158, 11, ' + op.toFixed(2) + ')';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.arc(tx, ty, r, Math.PI - 0.55, Math.PI + 0.55);\n      ctx.stroke();\n    }\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath();\n  ctx.arc(sx, sy, 8, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(p.passive ? '我方监听阵' : '主动声呐船', sx - 28, sy - 16);\n\n  ctx.fillStyle = p.atten > 0.08 ? '#ec4899' : 'rgba(236, 72, 153, 0.35)';\n  ctx.beginPath();\n  ctx.ellipse(tx, ty, 16, 7, 0, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.fillRect(tx - 3, ty - 13, 6, 7);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('目标 (' + p.dist + ' km)', tx - 30, ty + 24);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  if (!p.passive && (p.freq < 2)) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('提示：真实主动声呐通常使用 2~40 kHz', oceanX + 10, oceanY + 18);\n  } else if (p.passive && p.freq > 5) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('提示：高频吸收极大，被动声呐偏爱低频 (< 2 kHz)', oceanX + 10, oceanY + 18);\n  } else {\n    ctx.fillText(p.passive ? '被动模式：单程传播，零发射暴露' : '主动模式：往返双程衰减，精准测距', oceanX + 10, oceanY + 18);\n  }\n\n  const scopeX = 468, scopeY = 18, scopeW = 236, scopeH = 204;\n  ctx.fillStyle = '#090f1d';\n  ctx.fillRect(scopeX, scopeY, scopeW, scopeH);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(scopeX, scopeY, scopeW, scopeH);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(scopeX, scopeY + scopeH / 2);\n  ctx.lineTo(scopeX + scopeW, scopeY + scopeH / 2);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(p.passive ? 'DSP 接收噪声谱/时域波形' : 'DSP 时域回波示波器', scopeX + 10, scopeY + 18);\n\n  const midY = scopeY + scopeH / 2 + 10;\n  ctx.beginPath();\n  ctx.strokeStyle = p.passive ? '#f59e0b' : '#10b981';\n  ctx.lineWidth = 1.6;\n  for (let i = 0; i < scopeW - 16; i++) {\n    const xPos = scopeX + 8 + i;\n    const u = i / (scopeW - 16);\n    let yVal = (Math.sin(i * 1.7 + t * 18) * 0.5 + Math.sin(i * 3.1 - t * 23) * 0.5) * 4;\n    if (!p.passive) {\n      const txCenter = 0.12;\n      const rxCenter = 0.12 + (p.dist / 120) * 0.76;\n      const txEnv = Math.exp(-Math.pow((u - txCenter) / 0.035, 2));\n      const rxEnv = Math.exp(-Math.pow((u - rxCenter) / 0.04, 2)) * p.atten;\n      const carrierFreq = 0.35 + (p.freq / 40) * 1.4;\n      yVal += (txEnv * 55 + rxEnv * 55) * Math.sin(i * carrierFreq);\n    } else {\n      const sigEnv = p.atten * 45;\n      yVal += sigEnv * (Math.sin(i * (0.15 + p.freq * 0.04) - t * 12) * 0.7 + Math.sin(i * 0.45 + t * 7) * 0.3);\n    }\n    const py = midY - yVal;\n    if (i === 0) ctx.moveTo(xPos, py); else ctx.lineTo(xPos, py);\n  }\n  ctx.stroke();\n\n  if (!p.passive) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('Tx', scopeX + 26, scopeY + 42);\n    const rxLabelX = scopeX + 8 + (0.12 + (p.dist / 120) * 0.76) * (scopeW - 16) - 8;\n    ctx.fillStyle = p.atten > 0.05 ? '#10b981' : '#ef4444';\n    ctx.fillText(p.atten > 0.05 ? 'Rx' : '淹没', rxLabelX, scopeY + 42);\n  }\n\n  const snrDb = (20 * Math.log10(Math.max(0.001, p.atten))).toFixed(1);\n  lab.setReadout(\n    (p.passive ? '模式: 被动监听 (单程)' : '模式: 主动测距 (往返 Δt=' + p.rtt.toFixed(1) + ' s)') +\n    '  |  频率: ' + p.freq.toFixed(1) + ' kHz' +\n    '  |  传播保留强度: ' + (p.atten * 100).toFixed(1) + '% (' + snrDb + ' dB)'\n  );\n}\n\nlab.onUpdate(() => {\n  const p = getPhysics();\n  if (!lab.values.play) {\n    stopPassiveAudio();\n  } else if (p.passive) {\n    ensurePassiveAudio(p.atten, p.freq);\n  } else {\n    stopPassiveAudio();\n  }\n  drawScene(0);\n});\n\nlab.onLoop((dt, timeSec) => {\n  const p = getPhysics();\n  const period = 2.6;\n  const prevCycle = pingCycle;\n  pingCycle += dt;\n  const prevPhase = (prevCycle % period) / period;\n  const curPhase = (pingCycle % period) / period;\n  const travelFrac = 0.08 + (p.dist / 120) * 0.42;\n\n  if (lab.values.play) {\n    if (p.passive) {\n      ensurePassiveAudio(p.atten, p.freq);\n    } else {\n      stopPassiveAudio();\n      const pitch = 320 + p.freq * 52;\n      if (curPhase < prevPhase) {\n        triggerTone(pitch, 0.18, 0.14);\n        echoTriggered = false;\n      }\n      if (!echoTriggered && curPhase >= travelFrac * 2) {\n        triggerTone(pitch, 0.18 * p.atten, 0.16);\n        echoTriggered = true;\n      }\n    }\n  } else {\n    stopPassiveAudio();\n  }\n  drawScene(timeSec);\n});"
    },
    {
      "type": "concept",
      "heading": "DSP 如何重塑声呐：波束形成与多通道算力",
      "paragraphs": [
        "数字信号处理（DSP）在声呐领域引发了与雷达极为相似的革命，核心集中在三大环节：**脉冲生成 (Pulse Generation)**、**脉冲压缩 (Pulse Compression)** 以及**检测信号滤波 (Filtering)**。",
        "如果把声呐和雷达横向对比，会发现一个有趣的矛盾：一方面，声呐因为工作频率远低于雷达，信号采样与处理在**频率维度上更简单**；但另一方面，海洋环境远不如大气层均匀稳定（存在温度跃变层、盐度差异、海流和界面反射），导致水下声呐面临的信道环境**远比雷达更加困难**。",
        "正因如此，现代声呐很少只用单个收发传感器，而是通常部署由大量发射与接收单元组成的**大规模传感器阵列 (Extensive Arrays)**。通过 DSP 对这几十甚至上百个通道的信号进行精确的相位延时控制与加权混合，声呐无需机械转动就能**将发射声波脉冲电子转向到指定方向**，并在接收端精确判断回波来自哪个方位——这就是核心的**波束形成 (Beamforming)** 技术。为了实时吞吐和处理如此庞大的多通道数据流，声呐系统需要与高端雷达同等级别的**海量 DSP 算力**。"
      ],
      "formula": {
        "expr": "y[n] = Σ w_k · x_k[n - Δ_k(θ₀)]",
        "explain": "阵列波束形成公式：对第 k 个阵元接收到的信号 x_k 施加与目标指向角 θ₀ 对应的数字延时 Δ_k（即相位对齐）和权重 w_k 后叠加，就能让特定方向的回波同相增强，其他方向的噪声相互抵消。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：多阵元声呐波束形成 (Beamforming) 与电子扫描",
      "instruction": "拖动「阵列阵元数 (N)」观察主瓣如何变窄，拖动「DSP 波束指向角」去对准水下的「目标真实方位角」，体验多通道相干叠加的威力。",
      "controls": [
        {
          "type": "slider",
          "id": "elements",
          "label": "阵列阵元数 (N)",
          "min": 2,
          "max": 16,
          "step": 1,
          "value": 8,
          "unit": " 个"
        },
        {
          "type": "slider",
          "id": "steer",
          "label": "DSP 波束指向角",
          "min": -60,
          "max": 60,
          "step": 1,
          "value": 15,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "target",
          "label": "目标真实方位角",
          "min": -60,
          "max": 60,
          "step": 1,
          "value": -20,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showField",
          "label": "显示声波相干干涉场",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction arrayFactor(N, thetaDeg, steerDeg) {\n  const th = thetaDeg * Math.PI / 180;\n  const th0 = steerDeg * Math.PI / 180;\n  const psi = Math.PI * (Math.sin(th) - Math.sin(th0));\n  if (Math.abs(psi) < 1e-5) return 1.0;\n  return Math.abs(Math.sin(N * psi / 2) / (N * Math.sin(psi / 2)));\n}\n\nfunction draw(timeSec) {\n  const N = lab.values.elements;\n  const steer = lab.values.steer;\n  const target = lab.values.target;\n  const showField = lab.values.showField;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090f1d';\n  ctx.fillRect(0, 0, W, H);\n\n  const mapX = 16, mapY = 16, mapW = 420, mapH = 208;\n  ctx.fillStyle = '#071629';\n  ctx.fillRect(mapX, mapY, mapW, mapH);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(mapX, mapY, mapW, mapH);\n\n  const x0 = 58, y0 = 120;\n  const lambda = 22;\n  const d = lambda / 2;\n  const steerRad = steer * Math.PI / 180;\n  const targetRad = target * Math.PI / 180;\n  const sinSteer = Math.sin(steerRad);\n\n  const elemY = [];\n  for (let k = 0; k < N; k++) {\n    elemY.push(y0 - (k - (N - 1) / 2) * d);\n  }\n\n  if (showField) {\n    const step = 7;\n    const kWave = (2 * Math.PI) / lambda;\n    const omegaT = timeSec * 5.5;\n    for (let px = x0 + 12; px < mapX + mapW - 4; px += step) {\n      for (let py = mapY + 4; py < mapY + mapH - 4; py += step) {\n        let sum = 0;\n        const dx = px - x0;\n        for (let k = 0; k < N; k++) {\n          const dy = py - elemY[k];\n          const r = Math.sqrt(dx * dx + dy * dy);\n          const phase = kWave * r - omegaT + k * Math.PI * sinSteer;\n          sum += Math.cos(phase);\n        }\n        const norm = sum / N;\n        const intensity = Math.abs(norm);\n        if (intensity > 0.12) {\n          if (norm >= 0) {\n            ctx.fillStyle = 'rgba(56, 189, 248, ' + (intensity * 0.72).toFixed(2) + ')';\n          } else {\n            ctx.fillStyle = 'rgba(16, 185, 129, ' + (intensity * 0.35).toFixed(2) + ')';\n          }\n          ctx.fillRect(px, py, step - 1, step - 1);\n        }\n      }\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(x0, y0);\n  ctx.lineTo(mapX + mapW - 10, y0);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';\n  ctx.lineWidth = 1.8;\n  ctx.setLineDash([6, 4]);\n  ctx.beginPath();\n  ctx.moveTo(x0, y0);\n  ctx.lineTo(x0 + 340 * Math.cos(steerRad), y0 - 340 * Math.sin(steerRad));\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(x0 - 4, elemY[N - 1] - 6, 8, elemY[0] - elemY[N - 1] + 12);\n  for (let k = 0; k < N; k++) {\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(x0, elemY[k], 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('N=' + N + ' 阵', x0 - 20, mapY + 16);\n\n  const afTarget = arrayFactor(N, target, steer);\n  const tx = x0 + 280 * Math.cos(targetRad);\n  const ty = y0 - 280 * Math.sin(targetRad);\n  const locked = afTarget > 0.7;\n  ctx.fillStyle = locked ? '#10b981' : '#ec4899';\n  ctx.beginPath();\n  ctx.ellipse(tx, ty, 13, 6, -targetRad, 0, Math.PI * 2);\n  ctx.fill();\n  if (locked) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.arc(tx, ty, 18 + Math.sin(timeSec * 8) * 2, 0, Math.PI * 2);\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('目标 ' + target + '°', tx - 24, ty + 20);\n\n  const patX = 452, patY = 16, patW = 252, patH = 208;\n  ctx.fillStyle = '#0c1324';\n  ctx.fillRect(patX, patY, patW, patH);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(patX, patY, patW, patH);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('阵列波束方向图 |AF(θ)|', patX + 10, patY + 18);\n\n  const gx = patX + 18, gy = patY + 34, gw = patW - 36, gh = 116;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (let i = 0; i <= 4; i++) {\n    const yy = gy + (i / 4) * gh;\n    ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke();\n  }\n  ctx.beginPath();\n  ctx.moveTo(gx + gw / 2, gy); ctx.lineTo(gx + gw / 2, gy + gh); ctx.stroke();\n\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  for (let deg = -60; deg <= 60; deg += 0.5) {\n    const af = arrayFactor(N, deg, steer);\n    const px = gx + ((deg + 60) / 120) * gw;\n    const py = gy + gh - af * gh;\n    if (deg === -60) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const targetPx = gx + ((target + 60) / 120) * gw;\n  const targetPy = gy + gh - afTarget * gh;\n  ctx.strokeStyle = '#ec4899';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(targetPx, gy); ctx.lineTo(targetPx, gy + gh);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = locked ? '#10b981' : '#ec4899';\n  ctx.beginPath();\n  ctx.arc(targetPx, targetPy, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('-60°', gx - 8, gy + gh + 13);\n  ctx.fillText('0°', gx + gw / 2 - 5, gy + gh + 13);\n  ctx.fillText('+60°', gx + gw - 16, gy + gh + 13);\n\n  const barX = gx, barY = patY + 178, barW = gw, barH = 14;\n  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(barX, barY, barW, barH);\n  ctx.fillStyle = locked ? '#10b981' : (afTarget > 0.3 ? '#f59e0b' : '#ec4899');\n  ctx.fillRect(barX, barY, barW * afTarget, barH);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('目标回波接收增益: ' + (afTarget * 100).toFixed(0) + '%', barX, barY - 5);\n\n  const beamWidth = (102 / N).toFixed(1);\n  lab.setReadout(\n    '阵元数 N=' + N + '  |  主瓣半功率宽度 ≈ ' + beamWidth + '°' +\n    '  |  指向角: ' + steer + '°  |  目标角: ' + target + '°' +\n    '  |  定向增益: ' + (afTarget * 100).toFixed(1) + '%' + (locked ? ' [目标锁定]' : '')\n  );\n}\n\nlab.onUpdate(() => draw(0));\nlab.onLoop((dt, timeSec) => draw(timeSec));"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "高频保精度、低频保射程：水下高频声波吸收损耗极快，因此主动声呐（2~40 kHz）射程通常仅 10~100 公里；而被动声呐依靠低频声音传播，在零发射暴露的前提下能监听数千公里外的目标。",
        "声呐虽比雷达频率低，但水下信道极其复杂：水温跃变、盐度分层与多径反射让水声信道极不稳定，不能套用简单的均匀介质假设，必须依靠 DSP 脉冲压缩与自适应滤波。",
        "算力与雷达同级：声呐依靠数十上百个水听器/换能器组成大阵列，靠 DSP 实时对多通道做延时相加（波束形成）来电子扫描和测向，通道数决定了所需 DSP 算力的数量级。"
      ]
    }
  ]
});
