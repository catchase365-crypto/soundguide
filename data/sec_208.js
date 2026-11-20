window.__BOOK_REGISTER_SECTION__("sec_208", {
  "title": "SHARC EZ-KIT Lite 开发板架构与工作流 (The SHARC EZ-KIT Lite)",
  "intuition": "一块巴掌大的 DSP 入门开发板，只需接上电源、串口线和音频线，就能让你直接用耳朵听见数字信号处理算法对真实声音的实时改变。",
  "blocks": [
    {
      "type": "concept",
      "heading": "硬件全景：只需四根线的桌面 DSP 实验室",
      "paragraphs": [
        "**EZ-KIT Lite** 是 ADI 公司为学习 SHARC 系列数字信号处理器提供的完整入门套件（包含硬件、软件和参考手册）。它以 **ADSP-21061** 处理器为核心，做在一块尺寸仅 `4.5 × 6.5` 英寸的印制电路板上，底部装有塑料支撑柱，可以直接平放在桌面上使用（另有一款插在电脑主板扩展槽里的版本叫 **EZ-LAB**，采用的是带链路口的 `ADSP-21062`）。",
        "为了让新手摆脱繁琐的硬件接线，EZ-KIT Lite 在外部接口上做了极致简化，你只需要连接**四根线**：**9–12V 直流电源（1A）**、连接到个人电脑的 **RS-232 串口线**（通过板载 UART 驱动通信，套件已自带电源和串口线），以及**音频输入（Audio In）**和**音频输出（Audio Out）**。",
        "音频接口的标准电平约为 `1V` 幅度，板子上还设计了一个跳线，允许你直接将麦克风插进输入口，再把电脑用的有源音箱接到输出口——这样一来，任何滤波或音效算法跑起来后，你都能**立刻听见效果**。此外，板上还有 3 个按键（分别用于触发中断 `IRQ`、复位 `Reset` 和翻转系统可读标志位 `Flag`）和 4 颗可编程控制的 LED 指示灯。至于串口扩展、处理器总线、JTAG 仿真器接口以及链路口（仅 EZ-LAB 有效），板上都只预留了**未焊接（unpopulated）**的焊盘，留给高阶玩家自行焊接折腾。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "实验一：EZ-KIT Lite 板级信号流与状态机透视",
      "instruction": "先打开“9-12V 直流供电”，再拖动“工作阶段”滑块或按下“IRQ/Flag 按键”，观察电路板各模块的数据流向、总线带宽与 Flag LED 的联动。",
      "controls": [
        {
          "type": "toggle",
          "id": "power",
          "label": "9-12V DC 供电开关",
          "value": true
        },
        {
          "type": "slider",
          "id": "step",
          "label": "工作阶段 (1开机→4交互)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sampleRate",
          "label": "AD1847 采样率",
          "min": 8,
          "max": 48,
          "step": 8,
          "value": 48,
          "unit": " kHz"
        },
        {
          "type": "toggle",
          "id": "irqBtn",
          "label": "触发 Flag/IRQ 按键",
          "value": false
        }
      ],
      "jsCode": "var t = 0;\nfunction drawBox(ctx, x, y, w, h, title, sub, active, color) {\n  ctx.fillStyle = active ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.45)';\n  ctx.strokeStyle = active ? color : 'rgba(255,255,255,0.18)';\n  ctx.lineWidth = active ? 2 : 1;\n  ctx.fillRect(x, y, w, h);\n  ctx.strokeRect(x, y, w, h);\n  ctx.fillStyle = active ? '#f8fafc' : 'rgba(248,250,252,0.4)';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, x + w / 2, y + h / 2 - (sub ? 4 : -4));\n  if (sub) {\n    ctx.font = '10px monospace';\n    ctx.fillStyle = active ? color : 'rgba(248,250,252,0.3)';\n    ctx.fillText(sub, x + w / 2, y + h / 2 + 12);\n  }\n}\nfunction drawWire(ctx, x1, y1, x2, y2, active, color, phase) {\n  ctx.strokeStyle = active ? color : 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = active ? 2 : 1;\n  ctx.beginPath();\n  ctx.moveTo(x1, y1);\n  ctx.lineTo(x2, y2);\n  ctx.stroke();\n  if (active) {\n    var p = phase % 1;\n    var px = x1 + (x2 - x1) * p;\n    var py = y1 + (y2 - y1) * p;\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(px, py, 3.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n}\nfunction render() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var pwr = lab.values.power;\n  var step = lab.values.step;\n  var irq = lab.values.irqBtn;\n  var fs = lab.values.sampleRate;\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n  ctx.strokeStyle = pwr ? 'rgba(56,189,248,0.45)' : 'rgba(255,255,255,0.1)';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(116, 14, 476, 212);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'left';\n  ctx.fillText('EZ-KIT Lite PCB (4.5\" x 6.5\")', 126, 28);\n  drawBox(ctx, 14, 34, 84, 34, 'Audio In', '~1V / Mic', pwr && step >= 3, '#10b981');\n  drawBox(ctx, 14, 78, 84, 34, 'Audio Out', 'Amplified', pwr && step >= 3, '#10b981');\n  drawBox(ctx, 14, 150, 84, 42, 'PC Host', 'EZ-Lite Host', pwr && step >= 2, '#38bdf8');\n  drawBox(ctx, 290, 186, 130, 30, 'DC Power', '9-12V, 1A', pwr, '#f59e0b');\n  drawBox(ctx, 138, 44, 118, 58, 'AD1847 CODEC', '16b ' + fs + 'kHz', pwr && step >= 3, '#10b981');\n  drawBox(ctx, 308, 40, 136, 68, 'SHARC DSP', 'ADSP-21061', pwr, '#38bdf8');\n  drawBox(ctx, 138, 146, 118, 46, 'UART / RS-232', 'Serial Driver', pwr && step >= 2, '#38bdf8');\n  drawBox(ctx, 314, 134, 124, 38, 'EPROM', '512 kbytes', pwr && step === 1, '#f59e0b');\n  drawBox(ctx, 478, 36, 102, 58, 'Expansion', 'JTAG/Bus(空焊)', false, '#94a3b8');\n  drawBox(ctx, 478, 112, 102, 76, 'Buttons & LEDs', 'IRQ/Flag/Reset', pwr && (step === 4 || irq), '#ec4899');\n  drawWire(ctx, 98, 51, 138, 51, pwr && step >= 3, '#10b981', t * 1.6);\n  drawWire(ctx, 138, 95, 98, 95, pwr && step >= 3, '#10b981', t * 1.6);\n  drawWire(ctx, 256, 73, 308, 73, pwr && step >= 3, '#10b981', t * 2.1);\n  drawWire(ctx, 98, 171, 138, 171, pwr && step >= 2, '#38bdf8', t * 1.3);\n  drawWire(ctx, 256, 171, 286, 171, pwr && step >= 2, '#38bdf8', t * 1.3);\n  drawWire(ctx, 286, 171, 344, 108, pwr && step >= 2, '#38bdf8', t * 1.3);\n  drawWire(ctx, 376, 134, 376, 108, pwr && step === 1, '#f59e0b', t * 1.5);\n  drawWire(ctx, 444, 73, 478, 136, pwr && (step === 4 || irq), '#ec4899', t * 2.4);\n  for (var i = 0; i < 4; i++) {\n    var ledOn = pwr && (irq ? (Math.floor(t * 5) % 4 === i || i % 2 === 0) : (step >= 2 && i === step - 1));\n    ctx.fillStyle = ledOn ? '#ec4899' : 'rgba(255,255,255,0.12)';\n    ctx.beginPath();\n    ctx.arc(497 + i * 21, 175, 5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.fillRect(604, 14, 104, 212);\n  ctx.strokeRect(604, 14, 104, 212);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('四根外部连线', 614, 34);\n  var conns = [\n    ['1. 直流供电', pwr, '#f59e0b'],\n    ['2. RS-232串口', pwr && step >= 2, '#38bdf8'],\n    ['3. Audio In', pwr && step >= 3, '#10b981'],\n    ['4. Audio Out', pwr && step >= 3, '#10b981']\n  ];\n  for (var j = 0; j < conns.length; j++) {\n    ctx.fillStyle = conns[j][1] ? conns[j][2] : 'rgba(255,255,255,0.15)';\n    ctx.beginPath();\n    ctx.arc(620, 62 + j * 34, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.fillStyle = conns[j][1] ? '#f8fafc' : 'rgba(248,250,252,0.4)';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(conns[j][0], 630, 66 + j * 34);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.45)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('注: 扩展区未焊', 614, 206);\n  ctx.fillText('Link口仅限EZ-LAB', 614, 220);\n  var stepNames = ['', '1. EPROM (512KB) 上电自举引导', '2. 串口建立通信 & 下载算法', '3. AD1847 双工实时音频处理', '4. 按键触发 IRQ/Flag 与 LED 响应'];\n  var mbps = (fs * 2 * 16 / 1000).toFixed(2);\n  if (!pwr) {\n    lab.setReadout('电源状态: 已断电（请打开 9-12V DC 供电开关激活电路板）');\n  } else {\n    lab.setReadout('状态: ' + stepNames[step] + ' | 立体声16位码率: ' + mbps + ' Mbps | 按键: ' + (irq ? '触发中' : '空闲'));\n  }\n}\nlab.onUpdate(render);\nlab.onLoop(function(dt) {\n  t += dt;\n  render();\n});"
    },
    {
      "type": "concept",
      "heading": "AD1847 编解码器与“20 Hz 交流耦合”的物理深意",
      "paragraphs": [
        "音频信号进入板子后，负责“模拟↔数字”双向翻译的核心芯片是一颗 **ADI AD1847 Codec（编解码器）**。它内部采用 **16 位 Sigma-Delta（Σ-Δ）架构**，能够以最高 **48 kSPS（每秒 48,000 次采样）** 的速率，**同时完成立体声双通道的模数采集（ADC）与双通道的数模还原（DAC）**，也就是全双工实时吞吐。",
        "值得注意的是，既然 EZ-KIT Lite 的主战场是处理人耳可听的声音信号，AD1847 的模拟输入与输出端都做了 **交流耦合（AC Coupled）** 处理，其高通截止频率大约在 **20 Hz**。",
        "为什么要加上这个 `20 Hz` 的交流耦合电容？道理非常直观：麦克风或外部音源往往夹杂着直流偏置（0 Hz）和极低频的机械震动噪声，它们不但人耳听不见，还会白白占满 16 位定点的动态范围。通过 20 Hz 一阶高通滤波把直流和超低频“挡在门外”，就能让珍贵的 16 位精度全部服务于 `20 Hz – 20 kHz` 的有效音频。不过这也埋下了一个工程注意项：**如果你想拿它采集直流传感器或缓慢变化的温度电压，20 Hz 以下的信号会被直接滤掉！**"
      ],
      "formula": {
        "expr": "|H_ac(f)| = f / sqrt(f^2 + fc^2),  (fc ≈ 20 Hz)",
        "explain": "交流耦合一阶高通幅频响应：当信号频率 f = 0 Hz（直流）时增益为 0（完全阻断）；当 f = fc = 20 Hz 时增益约为 0.707（-3 dB）；当 f 远大于 20 Hz（如人声 300 Hz）时增益趋近于 1，几乎无损通过。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：AD1847 交流耦合 (20Hz) 与预置带通滤波器听感对比",
      "instruction": "打开“叠加 +0.5V 直流偏置”并拖动频率滑块（5–2000 Hz），观察交流耦合如何剥离直流分量；打开“播放对比音”并切换“预置带通滤波”，亲耳感受 300–1000 Hz 语音带通的衰减效果。",
      "controls": [
        {
          "type": "slider",
          "id": "inputFreq",
          "label": "输入测试信号频率",
          "min": 5,
          "max": 2000,
          "step": 5,
          "value": 440,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "dcOffset",
          "label": "叠加 +0.5V 直流偏置",
          "value": true
        },
        {
          "type": "toggle",
          "id": "dspMode",
          "label": "开启 EZ-KIT 预置带通滤波",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var phase = 0;\nvar audioCtx = null, osc = null, gainNode = null;\nfunction calcGain(f, dsp) {\n  var gAC = f / Math.sqrt(f * f + 400);\n  var r = f / 600;\n  var gBP = (r / 1.2) / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(r / 1.2, 2));\n  return { gAC: gAC, total: gAC * (dsp ? gBP : 1) };\n}\nfunction syncAudio() {\n  var play = lab.values.play;\n  var f = lab.values.inputFreq;\n  var dsp = lab.values.dspMode;\n  var g = calcGain(f, dsp).total;\n  try {\n    if (play) {\n      if (!audioCtx) audioCtx = lab.getAudioContext();\n      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n      if (audioCtx && !osc) {\n        osc = audioCtx.createOscillator();\n        gainNode = audioCtx.createGain();\n        osc.type = 'sine';\n        osc.frequency.setValueAtTime(f, audioCtx.currentTime);\n        gainNode.gain.setValueAtTime(g * 0.22, audioCtx.currentTime);\n        osc.connect(gainNode);\n        gainNode.connect(audioCtx.destination);\n        osc.start();\n      } else if (audioCtx && osc) {\n        osc.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.02);\n        gainNode.gain.setTargetAtTime(g * 0.22, audioCtx.currentTime, 0.02);\n      }\n    } else if (osc) {\n      osc.stop();\n      osc.disconnect();\n      osc = null;\n      gainNode = null;\n    }\n  } catch (e) {}\n}\nfunction render() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var f = lab.values.inputFreq;\n  var dc = lab.values.dcOffset;\n  var dsp = lab.values.dspMode;\n  var res = calcGain(f, dsp);\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n  // Left panel: Time-domain waveform\n  var lx = 18, ly = 32, lw = 326, lh = 186;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(lx, ly, lw, lh);\n  var midY = ly + lh * 0.55;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(lx, midY); ctx.lineTo(lx + lw, midY);\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域波形对比 (输入含DC vs 耦合/滤波输出)', lx, 22);\n  var visCycles = 1.2 + Math.log10(f / 5) * 3.2;\n  // Input wave (Amber)\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var x = 0; x <= lw; x += 2) {\n    var ang = phase + (x / lw) * Math.PI * 2 * visCycles;\n    var valIn = (dc ? 0.45 : 0) + 0.42 * Math.sin(ang);\n    var py = midY - valIn * (lh * 0.48);\n    if (x === 0) ctx.moveTo(lx + x, py); else ctx.lineTo(lx + x, py);\n  }\n  ctx.stroke();\n  // Output wave (Emerald)\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var x2 = 0; x2 <= lw; x2 += 2) {\n    var ang2 = phase + (x2 / lw) * Math.PI * 2 * visCycles;\n    var valOut = 0.42 * res.total * Math.sin(ang2);\n    var py2 = midY - valOut * (lh * 0.48);\n    if (x2 === 0) ctx.moveTo(lx + x2, py2); else ctx.lineTo(lx + x2, py2);\n  }\n  ctx.stroke();\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('— 输入信号' + (dc ? ' (+0.5V DC)' : ''), lx + 8, ly + lh - 18);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 输出信号 (DC已滤除)', lx + 155, ly + lh - 18);\n  // Right panel: Bode Plot (5 Hz - 2500 Hz)\n  var rx = 374, ry = 32, rw = 328, rh = 186;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('幅频响应曲线 (5 Hz – 2500 Hz 对数坐标)', rx, 22);\n  var marks = [20, 100, 600, 2000];\n  ctx.font = '10px monospace';\n  for (var m = 0; m < marks.length; m++) {\n    var mx = rx + (Math.log10(marks[m] / 5) / Math.log10(2500 / 5)) * rw;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath(); ctx.moveTo(mx, ry); ctx.lineTo(mx, ry + rh); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.45)';\n    ctx.fillText(marks[m] + 'Hz', mx - 12, ry + rh - 6);\n  }\n  function dbToY(g) {\n    var db = 20 * Math.log10(Math.max(g, 0.015));\n    var norm = (db - (-36)) / 38;\n    return ry + rh - 20 - Math.max(0, Math.min(1, norm)) * (rh - 34);\n  }\n  // AC Coupling only curve (Sky blue dashed)\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var i = 0; i <= rw; i += 3) {\n    var fi = 5 * Math.pow(2500 / 5, i / rw);\n    var gi = calcGain(fi, false).gAC;\n    var pyi = dbToY(gi);\n    if (i === 0) ctx.moveTo(rx + i, pyi); else ctx.lineTo(rx + i, pyi);\n  }\n  ctx.stroke();\n  ctx.restore();\n  // Total curve (Emerald)\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var j = 0; j <= rw; j += 3) {\n    var fj = 5 * Math.pow(2500 / 5, j / rw);\n    var gj = calcGain(fj, dsp).total;\n    var pyj = dbToY(gj);\n    if (j === 0) ctx.moveTo(rx + j, pyj); else ctx.lineTo(rx + j, pyj);\n  }\n  ctx.stroke();\n  // Current frequency marker\n  var curX = rx + (Math.log10(f / 5) / Math.log10(2500 / 5)) * rw;\n  var curY = dbToY(res.total);\n  ctx.strokeStyle = 'rgba(236,72,153,0.5)';\n  ctx.beginPath(); ctx.moveTo(curX, ry); ctx.lineTo(curX, ry + rh); ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(curX, curY, 5, 0, Math.PI * 2); ctx.fill();\n  var curDb = (20 * Math.log10(Math.max(res.total, 0.001))).toFixed(1);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 10px monospace';\n  ctx.fillText(f + 'Hz: ' + curDb + 'dB', Math.min(curX + 6, rx + rw - 82), Math.max(curY - 8, ry + 14));\n  lab.setReadout('频率: ' + f + ' Hz | 20Hz耦合衰减: ' + (20 * Math.log10(res.gAC)).toFixed(1) + ' dB | 总输出增益: ' + curDb + ' dB (' + (dsp ? '带通已开启' : '直通模式') + ')');\n}\nlab.onUpdate(function() {\n  syncAudio();\n  render();\n});\nlab.onLoop(function(dt) {\n  phase += dt * 5;\n  render();\n});"
    },
    {
      "type": "concept",
      "heading": "上电启动与 EZ-Lite Host 的闭环开发流",
      "paragraphs": [
        "当你插上 9–12V 直流电源的那一刻，EZ-KIT Lite 内部究竟发生了什么？处理器会自动从板载的 **512 KB EPROM** 中启动引导，加载一段固化在里面的通信引导程序，通过 UART 与你的 PC 建立起 **RS-232 串口握手**。",
        "紧接着，你在电脑上启动配套的 **EZ-Lite Host** 主机程序。通过这根细细的串口线，PC 端就可以把你写好的 DSP 算法程序**下载**到开发板内存里运行，也可以把 DSP 处理完的数据**上传**回电脑进行分析。",
        "套件中还贴心地附带了好几个**预置演示程序（Prewritten Programs）**，你只需要在 PC 上点点图标就能跑起来——例如直接内置了一个**带通滤波器程序**，对着麦克风说话，音箱里立刻就能传出经过带通滤波后（像电话语音一样）的声音。Author 特别强调这些演示程序有两大不可替代的价值：**第一，让你几分钟内做出有趣的声音效果，迅速建立“系统真的跑通了”的信心；第二，它们本身就是现成的硬件初始化与音频采集代码模板，后续写自己的算法时直接照着改就行。**"
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
        "避坑 1（信号类型）：AD1847 模拟输入输出带有约 20 Hz 的交流耦合高通特性，绝不能指望用这组音频口去直接测量直流电压或超低频传感器信号。",
        "避坑 2（型号差异）：EZ-KIT Lite 基于 ADSP-21061，没有启用多片高速互联的 Link Ports（链路口仅在插槽式的 EZ-LAB / ADSP-21062 上可用）；且板上的串口、处理器总线和 JTAG 仿真口都是空焊盘，需扩展时得自己动手焊接排针。",
        "工程捷径（模板复用）：做嵌入式 DSP 开发最难的是底层 Codec 初始化与中断配置。千万别从零硬写启动代码，直接把官方预置的音频演示程序当作脚手架，把中间的滤波函数替换成你自己的算法即可。"
      ]
    }
  ]
});
