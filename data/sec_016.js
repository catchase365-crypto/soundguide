window.__BOOK_REGISTER_SECTION__("sec_016", {
  "title": "多路复用：一根铜线如何同时承载 24 通电话 (Multiplexing)",
  "intuition": "把连续的模拟语音切成极短的“数字时间片”，像拉链一样交织排成一列高速比特流，让成百上千通电话共享同一根物理通道而互不串音。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从“专人专线”到“数字拉链”：为什么要多路复用？",
      "paragraphs": [
        "全球大约有十亿部电话，按下几个按键，交换网络就能在几秒内把任意两部连在一起。在 20 世纪 60 年代以前，电话系统完全依赖**模拟信号**：你的声音变成连续变化的电流，一路穿过沉重的机械开关和模拟放大器到达对方。在那个时代，**一通电话就必须独占一对金属导线**。当城市里成千上万的人同时通话时，铺设铜线和建造机械交换机的成本简直是天文数字。",
        "数字信号处理（DSP）彻底改写了这套规则。它先通过模数转换把连续的语音变成一串离散的 `0` 和 `1` 串行数字比特流。由于数字比特极易**交织（Intertwine）**并在另一端**精确分离（Separate）**，我们可以把多路完全无关的通话打包塞进同一根导线里轮流发射，这就是**时分多路复用（Time-Division Multiplexing, TDM）**。",
        "这背后的商业逻辑非常硬核：**铜线和模拟机械开关非常昂贵，而数字逻辑门电路极其便宜**。用廉价的数字芯片把单根线缆的吞吐量翻几十倍，电信运营商的边际成本瞬间暴跌。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：时分多路复用 (TDM) 交织与分离动态演示",
      "instruction": "拖动“复用通话路数”和“传输流速”滑块观察多路语音如何交织成单路串行比特流；关闭“接收端解复用还原”开关可直观看到不分离时发生的严重串音混叠。",
      "controls": [
        {
          "type": "slider",
          "id": "channels",
          "label": "复用通话路数",
          "min": 2,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": " 路"
        },
        {
          "type": "slider",
          "id": "speed",
          "label": "传输流速",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 4,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "demux",
          "label": "开启接收端解复用还原",
          "value": true
        }
      ],
      "jsCode": "var colors = ['#10b981', '#38bdf8', '#f59e0b', '#ec4899', '#a78bfa', '#f8fafc', '#2dd4bf', '#fb7185'];\nvar lastTime = 0;\n\nfunction drawGrid(ctx, w, h) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var x = 0; x <= w; x += 40) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();\n  }\n  for (var y = 0; y <= h; y += 40) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();\n  }\n}\n\nfunction render(t) {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var N = lab.values.channels;\n  var spd = lab.values.speed;\n  var demux = lab.values.demux;\n\n  ctx.clearRect(0, 0, w, h);\n  drawGrid(ctx, w, h);\n\n  var topPad = 24;\n  var botPad = 14;\n  var usableH = h - topPad - botPad;\n  var laneH = usableH / N;\n  var phase = t * spd * 1.4;\n  var activeCh = Math.floor(phase) % N;\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('多路输入语音 (模拟采样)', 14, 15);\n  ctx.fillText('单根高速串行通道 (TDM)', 282, 15);\n  ctx.fillText(demux ? '接收端分离还原' : '未解复用 (严重串音!)', 552, 15);\n\n  for (var i = 0; i < N; i++) {\n    var cy = topPad + (i + 0.5) * laneH;\n    var col = colors[i % colors.length];\n    var amp = Math.min(laneH * 0.34, 14);\n    var freq = 0.055 + i * 0.022;\n\n    ctx.strokeStyle = col;\n    ctx.lineWidth = (i === activeCh) ? 2.2 : 1.3;\n    ctx.beginPath();\n    for (var x = 16; x <= 176; x += 2) {\n      var y = cy + Math.sin(x * freq - phase * 1.6) * amp;\n      if (x === 16) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    var sampleY = cy + Math.sin(176 * freq - phase * 1.6) * amp;\n    ctx.fillStyle = (i === activeCh) ? '#f8fafc' : col;\n    ctx.beginPath();\n    ctx.arc(176, sampleY, (i === activeCh) ? 4 : 2.5, 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.fillStyle = col;\n    ctx.fillText('C' + (i + 1), 2, cy + 4);\n\n    ctx.strokeStyle = (i === activeCh) ? col : 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = (i === activeCh) ? 2 : 1;\n    ctx.beginPath();\n    ctx.moveTo(176, cy);\n    ctx.lineTo(205, 120);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#1e293b';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.fillRect(198, 28, 38, 184);\n  ctx.strokeRect(198, 28, 38, 184);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('MUX', 204, 124);\n\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.strokeStyle = '#64748b';\n  ctx.fillRect(236, 102, 248, 36);\n  ctx.strokeRect(236, 102, 248, 36);\n\n  var slotW = 28;\n  var shift = (phase * slotW) % (slotW * N);\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(237, 103, 246, 34);\n  ctx.clip();\n  for (var s = -N; s < 12; s++) {\n    var px = 236 + s * slotW + (phase * slotW) % slotW;\n    var chIdx = ((Math.floor(phase) - s) % N + N) % N;\n    var pCol = colors[chIdx % colors.length];\n    ctx.fillStyle = pCol;\n    ctx.fillRect(px + 2, 107, slotW - 4, 26);\n    ctx.fillStyle = '#0f172a';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('C' + (chIdx + 1), px + 7, 124);\n  }\n  ctx.restore();\n\n  ctx.fillStyle = '#1e293b';\n  ctx.strokeStyle = demux ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.fillRect(484, 28, 44, 184);\n  ctx.strokeRect(484, 28, 44, 184);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '10px sans-serif';\n  ctx.fillText(demux ? 'DEMUX' : '混叠', 488, 124);\n\n  for (var j = 0; j < N; j++) {\n    var rcy = topPad + (j + 0.5) * laneH;\n    var rCol = demux ? colors[j % colors.length] : '#ec4899';\n    var rAmp = Math.min(laneH * 0.34, 14);\n    var rFreq = 0.055 + j * 0.022;\n\n    ctx.strokeStyle = (demux && j === activeCh) ? rCol : 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = (demux && j === activeCh) ? 2 : 1;\n    ctx.beginPath();\n    ctx.moveTo(528, 120);\n    ctx.lineTo(548, rcy);\n    ctx.stroke();\n\n    ctx.strokeStyle = rCol;\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    for (var rx = 548; rx <= 704; rx += 2) {\n      var ry;\n      if (demux) {\n        ry = rcy + Math.sin(rx * rFreq - phase * 1.6 + 1.2) * rAmp;\n      } else {\n        var sum = 0;\n        for (var k = 0; k < N; k++) {\n          sum += Math.sin(rx * (0.055 + k * 0.022) - phase * 1.6 + k);\n        }\n        ry = rcy + (sum / Math.sqrt(N)) * rAmp * 0.85;\n      }\n      if (rx === 548) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n    }\n    ctx.stroke();\n  }\n\n  lab.setReadout('复用路数: ' + N + ' 路 | 单路速率: 64 kbps | 通道总速率: ' + (N * 64) + ' kbps | ' + (demux ? '接收端按时隙精准还原各路通话' : '警告：未分离时隙，所有通话混杂成串音！'));\n}\n\nlab.onUpdate(function() { render(lastTime); });\nlab.onLoop(function(dt, t) { lastTime = t; render(t); });"
    },
    {
      "type": "concept",
      "heading": "T 载波系统 (T-carrier) 拆解：64 kbps × 24 路 = 1.544 Mbps",
      "paragraphs": [
        "教材给出了电话网络中最经典的复用标准——**T 载波系统（T-carrier system，即著名的 T1 专线）**。它可以把 **24 路**独立电话语音同时塞进同一对普通电话线里。这背后的数字账非常漂亮：",
        "1. **单路语音数字化（64 kbps）**：系统对每路语音以 **8000 次/秒（8000 Hz）** 的频率进行采样，每次采样采用 **8 bit 对数压扩（Companded）** 模数转换。所谓“对数压扩”，就是小声细语分配更精细的量化刻度、大声喊叫分配较粗的刻度，从而只用 8 bit 就能获得接近十余比特的清晰动态范围。因此，单路通话的数据率为 `8000 × 8 = 64,000 bits/sec`（64 kbps）。",
        "2. **24 路交织与帧同步（1.544 Mbps）**：24 路语音合起来净数据率是 `24 × 64,000 = 1,536,000 bits/sec`（1.536 Mbps）。但接收端必须知道“哪 8 个比特属于第 1 路通话”，所以系统在每轮 24 路（192 bit）的帧头额外插入 **1 bit 帧同步信号**，每秒 8000 帧即额外增加 `8,000 bits/sec` 开销。最终总速率恰好为 `1.536 + 0.008 = 1.544 megabits/sec`。",
        "3. **物理传输距离**：高达 1.544 Mbps 的数字脉冲流可以在普通的 **22 号线规（22 gauge）铜质双绞线**上传输约 **6000 英尺**（约 1.8 公里，这是城市电话局端互联的典型距离），之后再由数字中继器整形放大，继续奔向下一段旅程。"
      ],
      "formula": {
        "expr": "R_total = N_ch × f_s × B + R_sync",
        "explain": "R_total 为复用总比特率（T1 标准为 1.544 Mbps）；N_ch 为同时复用的通话路数（24 路）；f_s 为单路采样率（8000 Hz）；B 为每次采样比特数（8 bit 对数压扩）；R_sync 为每秒帧同步比特开销（8000 bps）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：T1 帧结构、速率计算与同步错帧串音听觉测试",
      "instruction": "拖动“复用路数”与“采样率”观察 T1 帧比特排列与 1.544 Mbps 带宽变化；点击“播放监听”并开启“模拟帧同步丢失”，对比清晰语音与错帧串音的波形及听感。",
      "controls": [
        {
          "type": "slider",
          "id": "chCount",
          "label": "复用路数 (N_ch)",
          "min": 1,
          "max": 24,
          "step": 1,
          "value": 24,
          "unit": " 路"
        },
        {
          "type": "slider",
          "id": "sampleRate",
          "label": "单路采样率 (f_s)",
          "min": 2000,
          "max": 8000,
          "step": 1000,
          "value": 8000,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "syncError",
          "label": "模拟帧同步丢失 (错帧串音)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放监听信道 1",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioState = null;\nvar lastT = 0;\n\nfunction ensureAudio() {\n  var ctx = lab.getAudioContext();\n  if (!ctx) return null;\n  if (ctx.state === 'suspended') ctx.resume();\n  if (!audioState) {\n    var master = ctx.createGain();\n    master.gain.value = 0;\n    var filter = ctx.createBiquadFilter();\n    filter.type = 'lowpass';\n    filter.frequency.value = 3600;\n    filter.Q.value = 0.8;\n\n    var osc1a = ctx.createOscillator();\n    osc1a.type = 'triangle';\n    osc1a.frequency.value = 210;\n    var osc1b = ctx.createOscillator();\n    osc1b.type = 'sine';\n    osc1b.frequency.value = 520;\n    var gain1 = ctx.createGain();\n    gain1.gain.value = 0.55;\n\n    var osc2a = ctx.createOscillator();\n    osc2a.type = 'sawtooth';\n    osc2a.frequency.value = 690;\n    var osc2b = ctx.createOscillator();\n    osc2b.type = 'square';\n    osc2b.frequency.value = 1230;\n    var gain2 = ctx.createGain();\n    gain2.gain.value = 0;\n\n    osc1a.connect(gain1);\n    osc1b.connect(gain1);\n    osc2a.connect(gain2);\n    osc2b.connect(gain2);\n    gain1.connect(filter);\n    gain2.connect(filter);\n    filter.connect(master);\n    master.connect(ctx.destination);\n    osc1a.start();\n    osc1b.start();\n    osc2a.start();\n    osc2b.start();\n\n    audioState = {\n      ctx: ctx, master: master, filter: filter,\n      osc1a: osc1a, osc1b: osc1b, gain1: gain1,\n      osc2a: osc2a, osc2b: osc2b, gain2: gain2\n    };\n  }\n  return audioState;\n}\n\nfunction updateAudio(t) {\n  if (lab.values.play) {\n    var a = ensureAudio();\n    if (!a) return;\n    var now = a.ctx.currentTime;\n    var fs = lab.values.sampleRate;\n    var err = lab.values.syncError;\n    a.master.gain.setTargetAtTime(0.14, now, 0.03);\n    a.filter.frequency.setTargetAtTime(fs * 0.45, now, 0.04);\n    a.osc1a.frequency.setTargetAtTime(210 + 30 * Math.sin(t * 2.4), now, 0.02);\n    a.osc1b.frequency.setTargetAtTime(520 + 110 * Math.sin(t * 4.2), now, 0.02);\n    if (err) {\n      a.gain1.gain.setTargetAtTime(0.25 + 0.22 * Math.sin(t * 29), now, 0.01);\n      a.gain2.gain.setTargetAtTime(0.42, now, 0.02);\n      a.osc2a.frequency.setTargetAtTime(690 + 210 * Math.sin(t * 17), now, 0.01);\n    } else {\n      a.gain1.gain.setTargetAtTime(0.55, now, 0.02);\n      a.gain2.gain.setTargetAtTime(0, now, 0.02);\n    }\n  } else if (audioState) {\n    audioState.master.gain.setTargetAtTime(0, audioState.ctx.currentTime, 0.02);\n  }\n}\n\nfunction render(t) {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var N = lab.values.chCount;\n  var fs = lab.values.sampleRate;\n  var err = lab.values.syncError;\n\n  ctx.clearRect(0, 0, w, h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }\n  for (var gy = 0; gy <= h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('T 载波单帧比特结构 (1 bit 同步头 + ' + N + ' 路 × 8 bit 语音时隙)', 20, 22);\n\n  var barX = 20;\n  var barY = 34;\n  var barW = 680;\n  var barH = 42;\n  var syncW = 14;\n  var slotW = (barW - syncW) / N;\n\n  ctx.fillStyle = err ? '#ec4899' : '#f59e0b';\n  ctx.fillRect(barX, barY, syncW - 1, barH);\n  ctx.fillStyle = '#0f172a';\n  ctx.font = 'bold 10px sans-serif';\n  ctx.fillText('F', barX + 3, barY + 25);\n\n  for (var i = 0; i < N; i++) {\n    var sx = barX + syncW + i * slotW;\n    if (i === 0) ctx.fillStyle = '#10b981';\n    else if (i === 1) ctx.fillStyle = '#38bdf8';\n    else ctx.fillStyle = (i % 2 === 0) ? '#334155' : '#475569';\n    ctx.fillRect(sx, barY, Math.max(slotW - 1.5, 1), barH);\n    if (slotW >= 22) {\n      ctx.fillStyle = (i < 2) ? '#0f172a' : '#e2e8f0';\n      ctx.fillText('C' + (i + 1), sx + 4, barY + 25);\n    }\n  }\n\n  var rxOffset = err ? slotW * 0.62 : 0;\n  var rxX = barX + syncW + rxOffset;\n  ctx.strokeStyle = err ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.strokeRect(rxX, barY - 4, slotW, barH + 8);\n  ctx.fillStyle = err ? '#ec4899' : '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(err ? '▲ 接收窗错位：同时咬入 Ch1 + Ch2 导致乱码串音！' : '▲ 接收端精准锁定 Ch1 时隙 (8 bit)', rxX, barY + barH + 18);\n\n  var waveTop = 114;\n  var waveH = 108;\n  var waveMid = waveTop + waveH / 2;\n  ctx.fillStyle = 'rgba(15,23,42,0.75)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(20, waveTop, 680, waveH);\n  ctx.strokeRect(20, waveTop, 680, waveH);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('信道 1 解复用还原波形 (采样台阶随采样率变化)', 28, waveTop + 16);\n\n  var stepPx = Math.max(2, Math.round(16000 / fs));\n  ctx.strokeStyle = err ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  var prevY = waveMid;\n  for (var wx = 24; wx <= 696; wx += stepPx) {\n    var ph = (wx - 24) * 0.045 - t * 4;\n    var val = 0.65 * Math.sin(ph) + 0.35 * Math.sin(ph * 2.4);\n    if (err) {\n      val = 0.4 * val + 0.6 * Math.sin(ph * 3.7 + 1.1) + 0.35 * ((Math.sin(wx * 0.7 + t * 19) > 0) ? 1 : -1);\n    }\n    var wy = waveMid - val * 30;\n    if (wx === 24) {\n      ctx.moveTo(wx, wy);\n    } else {\n      ctx.lineTo(wx, prevY);\n      ctx.lineTo(wx, wy);\n    }\n    prevY = wy;\n  }\n  ctx.stroke();\n\n  var singleKbps = (fs * 8) / 1000;\n  var syncKbps = fs / 1000;\n  var totalMbps = ((N * singleKbps + syncKbps) / 1000).toFixed(3);\n  lab.setReadout('单路: ' + singleKbps + ' kbps | 帧同步开销: ' + syncKbps + ' kbps | 总速率: ' + totalMbps + ' Mbps' + (N === 24 && fs === 8000 ? ' [标准 T1 速率!]' : '') + (err ? ' | ⚠ 同步丢失' : ' | 同步正常'));\n}\n\nlab.onUpdate(function() {\n  updateAudio(lastT);\n  render(lastT);\n});\nlab.onLoop(function(dt, t) {\n  lastT = t;\n  updateAudio(t);\n  render(t);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【64 kbps 的黄金公式】电话语音的基准数字化规格是 `8000 Hz 采样 × 8 bit 对数压扩 = 64 kbps`，千万不要忽略“对数压扩”，线性 8 bit 量化听起来会有明显底噪。",
        "【别漏算同步头】T1 系统 24 路纯语音只有 `1.536 Mbps`，正是每帧 1 bit 的 `8 kbps` 同步头把它凑成了教材中的 `1.544 Mbps`；实际工程中一旦帧同步丢失，整个复用的时隙都会错位成刺耳的乱码。",
        "【经济账决定技术路线】DSP 之所以能在电信网全面取代模拟交换，本质在于“数字逻辑门比铜线和机械开关便宜得多”。",
        "【物理层依然存在距离极限】高速串行脉冲并不是无限传下去的——1.544 Mbps 的 T1 信号在普通 22 号铜线上每走约 `6000 英尺` 仍需数字中继器恢复波形。"
      ]
    }
  ]
});
