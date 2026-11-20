window.__BOOK_REGISTER_SECTION__("sec_053", {
  "title": "静态线性与正弦保真度 (Static Linearity and Sinusoidal Fidelity)",
  "intuition": "线性系统在直流静止时是一条过原点的直线，在面对正弦波时则是绝对忠实的“频率复读机”——只改幅度和相位，绝不篡改频率与波形。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从数学公理走向工程直觉",
      "paragraphs": [
        "在数学上，**齐次性（Homogeneity）**、**可加性（Additivity）**与**移位不变性（Shift Invariance）**构成了线性系统的严格定义。但在实际面对一块电路板或一段机械结构时，仅仅背诵这三条公理，很难让人获得直观的物理手感。",
        "为此，科学家与工程师在工程实践中总结出两条极其好用的直观判据：**静态线性（Static Linearity）**与**正弦保真度（Sinusoidal Fidelity）**。它们虽然不是数学上最本质的起点，却直接对应人类观察和验证真实系统是否线性的思维方式。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "静态线性与「无记忆系统」的充要桥梁",
      "paragraphs": [
        "**静态线性**描述的是当输入信号静止不变（即直流 DC 或静态）时系统的反应：输出等于输入乘以一个常数。如果把所有可能输入值与对应输出值画成坐标图，它必然是一条**穿过原点的直线**。最经典的例子就是电阻的**欧姆定律**（电流与电压成正比）与弹簧的**胡克定律**（伸长量与拉力成正比）。",
        "与之相对的是静态非线性系统：例如**硅 PN 结二极管**在约 `0.6 V` 附近呈现指数级导通；而**铁磁材料**的磁通密度 `B` 与磁场强度 `H` 之间存在**磁滞回线（Hysteresis）**——同样的输入 `H`，输出 `B` 竟然取决于样品过去曾被如何磁化。",
        "所有线性系统必然满足静态线性，但反过来却不一定：有些系统对直流是线性的，面对快速变化的信号却会失真。然而对于一类极其常见的**无记忆系统（Memoryless Systems）**——即系统的瞬时输出仅仅取决于当前瞬时输入，与历史完全无关（例如理想电阻的瞬时电流只看此刻瞬时电压）——只要它同时满足**静态线性**，就能严格证明它必定是线性系统。"
      ],
      "formula": {
        "expr": "y(t) = k · x(t)",
        "explain": "对于无记忆且满足静态线性的系统：y(t) 为 t 时刻的瞬时输出，x(t) 为 t 时刻的瞬时输入，k 为恒定的比例常数（如电导 1/R 或弹簧刚度系数）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：静态传输特性与无记忆/记忆效应实验室",
      "instruction": "拖动「系统模式」滑块切换线性电阻、硅二极管与铁磁滞回线，调整斜率与输入幅度，观察左侧 X-Y 传输曲线如何实时塑造右侧时域输出波形。",
      "controls": [
        {
          "type": "slider",
          "id": "nonlinMode",
          "label": "系统模式 (0线性 1二极管 2磁滞)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "slope",
          "label": "静态斜率 / 灵敏度 k",
          "min": 0.3,
          "max": 1.8,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "输入激励幅度",
          "min": 0.3,
          "max": 1.5,
          "step": 0.05,
          "value": 1,
          "unit": " V"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet phase = 0;\n\nfunction evalSystem(x, velSign, mode, slope, amp) {\n  if (mode === 0) {\n    return slope * x;\n  } else if (mode === 1) {\n    if (x > 0) {\n      return slope * 0.045 * (Math.exp(x * 2.8) - 1);\n    }\n    return 0.01 * slope * x;\n  } else {\n    const a = Math.max(0.15, amp);\n    const ratio = Math.max(-1, Math.min(1, x / a));\n    const sinPart = Math.sqrt(Math.max(0, 1 - ratio * ratio));\n    const dir = velSign >= 0 ? -1 : 1;\n    return slope * Math.tanh(1.8 * x + dir * 0.65 * a * sinPart);\n  }\n}\n\nfunction draw(t) {\n  ctx.clearRect(0, 0, W, H);\n  const mode = Math.round(lab.values.nonlinMode);\n  const slope = lab.values.slope;\n  const amp = lab.values.amp;\n\n  const cx = 140, cy = 124, scaleX = 56, scaleY = 54;\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gx = -2; gx <= 2; gx++) {\n    ctx.beginPath();\n    ctx.moveTo(cx + gx * scaleX, 26);\n    ctx.lineTo(cx + gx * scaleX, 224);\n    ctx.stroke();\n  }\n  for (let gy = -2; gy <= 2; gy++) {\n    ctx.beginPath();\n    ctx.moveTo(30, cy + gy * scaleY);\n    ctx.lineTo(250, cy + gy * scaleY);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.28)\";\n  ctx.beginPath();\n  ctx.moveTo(30, cy); ctx.lineTo(250, cy);\n  ctx.moveTo(cx, 26); ctx.lineTo(cx, 224);\n  ctx.stroke();\n\n  const curveColor = mode === 0 ? \"#10b981\" : (mode === 1 ? \"#f59e0b\" : \"#ec4899\");\n  ctx.strokeStyle = curveColor;\n  ctx.lineWidth = 2.5;\n\n  if (mode !== 2) {\n    ctx.beginPath();\n    for (let i = 0; i <= 160; i++) {\n      const xVal = -1.6 + (3.2 * i) / 160;\n      const yVal = evalSystem(xVal, 1, mode, slope, amp);\n      const px = cx + xVal * scaleX;\n      const py = cy - Math.max(-1.8, Math.min(1.8, yVal)) * scaleY;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  } else {\n    ctx.beginPath();\n    for (let i = 0; i <= 180; i++) {\n      const th = (i / 180) * Math.PI * 2;\n      const xVal = amp * Math.cos(th);\n      const yVal = slope * Math.tanh(1.8 * xVal + 0.65 * amp * Math.sin(th));\n      const px = cx + xVal * scaleX;\n      const py = cy - yVal * scaleY;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  const xNow = amp * Math.cos(t);\n  const velSign = -Math.sin(t);\n  const yNow = mode === 2\n    ? slope * Math.tanh(1.8 * xNow + 0.65 * amp * Math.sin(t))\n    : evalSystem(xNow, velSign, mode, slope, amp);\n\n  const dotX = cx + xNow * scaleX;\n  const dotY = cy - Math.max(-1.8, Math.min(1.8, yNow)) * scaleY;\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.beginPath();\n  ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  const wx0 = 300, wx1 = 695, wy0 = 124, wScale = 46;\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= 4; gx++) {\n    const x = wx0 + ((wx1 - wx0) * gx) / 4;\n    ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, 224); ctx.stroke();\n  }\n  ctx.strokeStyle = \"rgba(255,255,255,0.25)\";\n  ctx.beginPath(); ctx.moveTo(wx0, wy0); ctx.lineTo(wx1, wy0); ctx.stroke();\n\n  ctx.strokeStyle = \"#38bdf8\";\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const u = i / 200;\n    const th = t - (1 - u) * Math.PI * 4;\n    const xv = amp * Math.cos(th);\n    const px = wx0 + u * (wx1 - wx0);\n    const py = wy0 - xv * wScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = curveColor;\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const u = i / 200;\n    const th = t - (1 - u) * Math.PI * 4;\n    const xv = amp * Math.cos(th);\n    const vs = -Math.sin(th);\n    const yv = mode === 2\n      ? slope * Math.tanh(1.8 * xv + 0.65 * amp * Math.sin(th))\n      : evalSystem(xv, vs, mode, slope, amp);\n    const px = wx0 + u * (wx1 - wx0);\n    const py = wy0 - Math.max(-2.0, Math.min(2.0, yv)) * wScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.beginPath(); ctx.arc(wx1, wy0 - xNow * wScale, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = curveColor;\n  ctx.beginPath(); ctx.arc(wx1, wy0 - Math.max(-2.0, Math.min(2.0, yNow)) * wScale, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"12px sans-serif\";\n  const titles = [\"静态线性 (欧姆/胡克定律)\", \"硅二极管 (指数非线性)\", \"铁磁滞回线 (历史记忆)\"];\n  ctx.fillText(\"X-Y 传输特性: \" + titles[mode], 26, 18);\n  ctx.fillText(\"实时激励 x(t) [蓝] → 输出 y(t)\", 300, 18);\n  ctx.fillStyle = \"rgba(248,250,252,0.65)\";\n  ctx.fillText(\"输入 X\", 215, cy - 6);\n  ctx.fillText(\"输出 Y\", cx + 6, 36);\n\n  const memText = mode === 0 ? \"无记忆 + 静态线性 ⇒ 严格线性系统\" : (mode === 1 ? \"无记忆但静态非线性 ⇒ 产生单向畸变\" : \"有记忆 + 非线性 ⇒ 输出随历史路径分裂\");\n  lab.setReadout(\"当前: \" + titles[mode] + \" | x=\" + xNow.toFixed(2) + \", y=\" + yNow.toFixed(2) + \" | \" + memText);\n}\n\nlab.onUpdate(() => {\n  draw(phase);\n});\n\nlab.onLoop((dt) => {\n  phase += dt * 2.4;\n  draw(phase);\n});"
    },
    {
      "type": "concept",
      "heading": "正弦保真度、系统内的「恶魔」与技术员三步测试法",
      "paragraphs": [
        "**正弦保真度（Sinusoidal Fidelity）**揭示了线性系统面对动态波形时的核心法则：**如果线性系统的输入是一个正弦波，那么输出也必然是一个正弦波，并且频率与输入完全相同**。注意，正弦波是**唯一**拥有这种特权的波形——方波进入线性系统后，完全可能变得面目全非。不过，输出正弦波与输入正弦波在**幅度**与**相位**上允许存在差异，这正是电路与滤波器中**频率响应（增益曲线与相位曲线）**的本质。",
        "反过来问：如果一个黑盒系统对正弦波输入总能输出同频正弦波，它就一定是线性的吗？答案是否定的，虽然反例不多但非常巧妙：想象黑盒里躲着一个想欺骗你的**恶魔（Evil Demon）**，他手里有一台示波器和一台正弦信号发生器。每当你输入一个正弦波，他立刻测出频率并拨动发生器输出一个正弦波。这个系统其实是非线性的——因为它不满足**可加性**。只要同时输入**两个正弦波之和**，恶魔一次只能发一个正弦波，立刻原形毕露！现实中的**锁相环（PLL）**就正是这样工作的。",
        "在工程实验室里，技术员通常这样高置信度地判断电子设备是否线性：接上正弦信号发生器与示波器后，①检查输出是否为纯净正弦（不能有上下削顶、正负半周不对称或过零点畸变）；②改变输入幅度，看输出幅度是否成比例同步跟踪；③扫描输入频率，验证输出频率是否严格同步变化（幅度、相位随频率改变甚至在特定频点增益归零都是完全合法的）。"
      ],
      "formula": {
        "expr": "y(t) = |H(f)| · A · sin(2πft + φ(f))",
        "explain": "当输入为 A·sin(2πft) 时，线性系统的输出必为同频正弦波：f 为保持不变的输入频率，|H(f)| 为系统在该频率下的幅度增益，φ(f) 为引入的相移。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：技术员示波器与听觉验真台（支持实时发声）",
      "instruction": "开启声音对比三种系统对正弦波的处理：观察「线性系统」如何保持波形纯净仅改幅相、「非线性削波」如何产生刺耳谐波，以及开启「叠加第二正弦波」如何瞬间揭穿「恶魔系统」的伪装！",
      "controls": [
        {
          "type": "slider",
          "id": "sysMode",
          "label": "系统类型 (0线性 1削波 2恶魔)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "主正弦频率 f1",
          "min": 150,
          "max": 600,
          "step": 10,
          "value": 260,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "输入信号幅度",
          "min": 0.2,
          "max": 1.3,
          "step": 0.05,
          "value": 0.75,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "twoTone",
          "label": "输入叠加第二正弦波 (1.5×f1)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 监听输出声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet phase = 0;\nlet audioState = null;\n\nfunction makeClipCurve() {\n  const n = 1024;\n  const curve = new Float32Array(n);\n  for (let i = 0; i < n; i++) {\n    const x = (i * 2) / (n - 1) - 1;\n    let y = x;\n    if (x > 0.16) y = 0.16 + 0.12 * (x - 0.16);\n    else if (x < -0.22) y = -0.22 + 0.18 * (x + 0.22);\n    curve[i] = y * 2.2;\n  }\n  return curve;\n}\n\nconst clipCurve = makeClipCurve();\n\nfunction updateAudio() {\n  const playing = !!lab.values.play;\n  if (!playing) {\n    if (audioState) {\n      try {\n        audioState.osc1.stop();\n        audioState.osc2.stop();\n        audioState.osc1.disconnect();\n        audioState.osc2.disconnect();\n        audioState.master.disconnect();\n      } catch (e) {}\n      audioState = null;\n    }\n    return;\n  }\n\n  const ac = lab.getAudioContext();\n  if (ac.state === \"suspended\") {\n    ac.resume();\n  }\n\n  if (!audioState) {\n    const osc1 = ac.createOscillator();\n    const osc2 = ac.createOscillator();\n    const gain1 = ac.createGain();\n    const gain2 = ac.createGain();\n    const shaper = ac.createWaveShaper();\n    const master = ac.createGain();\n    osc1.type = \"sine\";\n    osc2.type = \"sine\";\n    osc1.connect(gain1);\n    osc2.connect(gain2);\n    gain1.connect(shaper);\n    gain2.connect(shaper);\n    shaper.connect(master);\n    master.connect(ac.destination);\n    osc1.start();\n    osc2.start();\n    audioState = { osc1, osc2, gain1, gain2, shaper, master, ac };\n  }\n\n  const f1 = lab.values.freq;\n  const amp = lab.values.amp;\n  const mode = Math.round(lab.values.sysMode);\n  const twoTone = !!lab.values.twoTone;\n  const now = audioState.ac.currentTime;\n\n  audioState.osc1.frequency.setTargetAtTime(f1, now, 0.02);\n  audioState.osc2.frequency.setTargetAtTime(f1 * 1.5, now, 0.02);\n\n  const g1Resp = 1 / Math.sqrt(1 + Math.pow(f1 / 380, 2));\n  const g2Resp = 1 / Math.sqrt(1 + Math.pow((f1 * 1.5) / 380, 2));\n\n  if (mode === 0) {\n    audioState.shaper.curve = null;\n    audioState.gain1.gain.setTargetAtTime(0.22 * amp * g1Resp, now, 0.02);\n    audioState.gain2.gain.setTargetAtTime(twoTone ? 0.16 * amp * g2Resp : 0, now, 0.02);\n    audioState.master.gain.setTargetAtTime(0.65, now, 0.02);\n  } else if (mode === 1) {\n    audioState.shaper.curve = clipCurve;\n    audioState.gain1.gain.setTargetAtTime(0.45 * amp, now, 0.02);\n    audioState.gain2.gain.setTargetAtTime(twoTone ? 0.32 * amp : 0, now, 0.02);\n    audioState.master.gain.setTargetAtTime(0.35, now, 0.02);\n  } else {\n    audioState.shaper.curve = null;\n    audioState.gain1.gain.setTargetAtTime(0.22 * amp, now, 0.02);\n    audioState.gain2.gain.setTargetAtTime(0, now, 0.02);\n    audioState.master.gain.setTargetAtTime(0.65, now, 0.02);\n  }\n}\n\nfunction drawScope(t) {\n  ctx.clearRect(0, 0, W, H);\n  const f1 = lab.values.freq;\n  const amp = lab.values.amp;\n  const mode = Math.round(lab.values.sysMode);\n  const twoTone = !!lab.values.twoTone;\n\n  const panels = [\n    { x0: 20, x1: 340, title: \"输入信号 x(t) [示波器 A]\" },\n    { x0: 380, x1: 700, title: \"系统输出 y(t) [示波器 B]\" }\n  ];\n\n  const cy = 128;\n  const scaleY = 48;\n\n  for (let p = 0; p < 2; p++) {\n    const pan = panels[p];\n    ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n    ctx.lineWidth = 1;\n    for (let gx = 0; gx <= 4; gx++) {\n      const gxPos = pan.x0 + ((pan.x1 - pan.x0) * gx) / 4;\n      ctx.beginPath(); ctx.moveTo(gxPos, 30); ctx.lineTo(gxPos, 222); ctx.stroke();\n    }\n    for (let gy = -1; gy <= 1; gy++) {\n      ctx.beginPath(); ctx.moveTo(pan.x0, cy + gy * scaleY); ctx.lineTo(pan.x1, cy + gy * scaleY); ctx.stroke();\n    }\n    ctx.strokeStyle = \"rgba(255,255,255,0.28)\";\n    ctx.beginPath(); ctx.moveTo(pan.x0, cy); ctx.lineTo(pan.x1, cy); ctx.stroke();\n    ctx.fillStyle = \"#f8fafc\";\n    ctx.font = \"12px sans-serif\";\n    ctx.fillText(pan.title, pan.x0, 20);\n  }\n\n  const cycles = f1 / 120;\n  const g1 = 1 / Math.sqrt(1 + Math.pow(f1 / 380, 2));\n  const ph1 = -Math.atan(f1 / 380);\n  const g2 = 1 / Math.sqrt(1 + Math.pow((f1 * 1.5) / 380, 2));\n  const ph2 = -Math.atan((f1 * 1.5) / 380);\n\n  ctx.strokeStyle = \"#38bdf8\";\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 220; i++) {\n    const u = i / 220;\n    const ang = u * Math.PI * 2 * cycles - t;\n    let xv = amp * Math.sin(ang);\n    if (twoTone) xv = 0.65 * amp * Math.sin(ang) + 0.45 * amp * Math.sin(1.5 * ang);\n    const px = 20 + u * 320;\n    const py = cy - xv * scaleY;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const outColor = mode === 0 ? \"#10b981\" : (mode === 1 ? \"#ec4899\" : \"#f59e0b\");\n  ctx.strokeStyle = outColor;\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i <= 220; i++) {\n    const u = i / 220;\n    const ang = u * Math.PI * 2 * cycles - t;\n    let yv = 0;\n    if (mode === 0) {\n      yv = amp * g1 * Math.sin(ang + ph1);\n      if (twoTone) {\n        yv = 0.65 * amp * g1 * Math.sin(ang + ph1) + 0.45 * amp * g2 * Math.sin(1.5 * ang + ph2);\n      }\n    } else if (mode === 1) {\n      let xv = amp * Math.sin(ang);\n      if (twoTone) xv = 0.65 * amp * Math.sin(ang) + 0.45 * amp * Math.sin(1.5 * ang);\n      if (xv > 0.45) yv = 0.45 + 0.15 * (xv - 0.45);\n      else if (xv < -0.62) yv = -0.62 + 0.2 * (xv + 0.62);\n      else yv = xv;\n    } else {\n      yv = amp * Math.sin(ang);\n    }\n    const px = 380 + u * 320;\n    const py = cy - yv * scaleY;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (mode === 2 && twoTone) {\n    ctx.fillStyle = \"#f59e0b\";\n    ctx.font = \"bold 12px sans-serif\";\n    ctx.fillText(\"恶魔穿帮：双音输入却仅输出单频正弦！\", 385, 45);\n  } else if (mode === 2) {\n    ctx.fillStyle = \"rgba(245,158,11,0.85)\";\n    ctx.font = \"12px sans-serif\";\n    ctx.fillText(\"单音欺骗成功：外观与线性正弦完全一致\", 385, 45);\n  }\n\n  const modeNames = [\"线性系统 (频响增益与相移)\", \"非线性削波 (产生谐波失真)\", \"恶魔伪装系统 (违背可加性)\"];\n  const respStr = mode === 0 ? (\" | 增益=\" + g1.toFixed(2) + \", 相移=\" + Math.round(ph1 * 180 / Math.PI) + \"°\") : \"\";\n  lab.setReadout(\"模式: \" + modeNames[mode] + \" | f1=\" + f1 + \"Hz\" + (twoTone ? \" + \" + Math.round(f1 * 1.5) + \"Hz\" : \"\") + respStr);\n}\n\nlab.onUpdate(() => {\n  updateAudio();\n  drawScope(phase);\n});\n\nlab.onLoop((dt) => {\n  phase += dt * 4.5;\n  drawScope(phase);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "静态线性必须「过原点」：如果直流静态曲线是直线但不过原点（即存在直流偏置 y = kx + b），系统就不满足齐次性与可加性，严格来说是非线性系统（或仿射系统）。",
        "记住「无记忆 + 静态线性 ⇒ 线性」：但凡系统内部带有电容、电感、积分器或磁滞等“记忆元件”，就不能只靠测直流特性来断定动态线性。",
        "正弦保真度是正弦波的专属特权：别指望方波或脉冲通过线性滤波器后还能保持原有形状，只有纯正弦波能保证输出波形与频率不变。",
        "用双音测试防「恶魔」：只测单频正弦波无法识破锁相环（PLL）这类非加性伪线性系统，实操中可用双音叠加（Double-tone Test）验证可加性。"
      ]
    }
  ]
});
