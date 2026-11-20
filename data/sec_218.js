window.__BOOK_REGISTER_SECTION__("sec_218", {
  "title": "电路分析与相量变换 (Electrical Circuit Analysis)",
  "intuition": "把恼人的正弦微积分方程变成小学生都能算的复数乘除法：用复阻抗 Z 统一电阻、电容和电感，像算直流分压一样轻松求解交流 RLC 电路。",
  "blocks": [
    {
      "type": "concept",
      "heading": "告别微分方程：用相量变换把“微积分”降维成“代数”",
      "paragraphs": [
        "在通用电路分析中，电阻遵循欧姆定律 `v = iR`，但电容和电感却由微分方程统治：电容电流是电压的变化率（`i = C dv/dt`），电感电压是电流的变化率（`v = L di/dt`）。只要电路里多几个电容电感，联立求解这些高阶微分方程就会变成一场数学噩梦。",
        "幸运的是，如果把电路中的激励信号限制为**正弦波（Sinusoids）**，奇迹就发生了。我们可以利用**相量变换（Phasor transform）**——即把同频率的余弦/正弦信号用复数来表示（严格数学定义是乘以复指数 `e^(jωt)` 后取实部）。在这一视角下，每个元器件都可以看作一个线性系统：输入是代表电流的复数 `I`，输出是代表电压的复数 `V`，连接两者的比例系数同样是一个复数，我们称之为**阻抗（Impedance）**，记作 `Z`。",
        "这样一来，繁琐的微积分运算直接退化成了与直流欧姆定律完全同构的复数乘法。其中，复阻抗 `Z` 的模长代表电压与电流的**幅度比**，而它的相角则代表电压相对于电流的**相位差**。"
      ],
      "formula": {
        "expr": "V = I × Z",
        "explain": "V 为代表正弦电压的复数相量，I 为代表正弦电流的复数相量，Z 为元器件的复阻抗（在极坐标下，|Z| = |V|/|I|，∠Z = ∠V - ∠I）。"
      }
    },
    {
      "type": "concept",
      "heading": "电阻、电容、电感的复阻抗与 90° 相移本质",
      "paragraphs": [
        "从各自的微分方程出发，可以推导出三大基础元件在角频率 `ω` 下的复阻抗：`Z_R = R`、`Z_C = -j/(ωC)`、`Z_L = jωL`。电阻的阻抗是纯实数，只改变幅度不改变相位；而电容和电感的阻抗是纯虚数，专门负责制造 `±90°` 的相移并随频率改变阻碍能力。",
        "假设流过三者的电流都是单位幅度的余弦波（在本章替换法则下写作复数 `I = 1 + 0j`，对应时域 `cos(ωt)`）：对于**电阻**，`V = (1+0j)R = R + 0j`，电压仍是同相的余弦波；对于**电容**，`V = (1+0j)(-j/ωC) = 0 - j/ωC`，根据 `Re{(a+bj)e^(jωt)} = a·cos(ωt) - b·sin(ωt)`，虚部为负对应正弦波 `+sin(ωt)/ωC`，即电压**滞后**电流 90°，且频率越高容抗越小；对于**电感**，`V = (1+0j)(jωL) = 0 + jωL`，对应负正弦波 `-ωL·sin(ωt)`，即电压**超前**电流 90°，且频率越高感抗越大。"
      ],
      "formula": {
        "expr": "Z_R = R,   Z_C = -j / (ωC),   Z_L = jωL",
        "explain": "R 为电阻（欧姆），C 为电容（法拉），L 为电感（亨利），ω = 2πf 为信号角频率（弧度/秒），j 为虚数单位。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：R / C / L 复阻抗与相位超前/滞后观察台",
      "instruction": "拖动「元件类型」滑块切换电阻(0)、电容(1)、电感(2)，调节角频率 ω 与元件参数，观察左侧时域波形的幅度/相位变化与右侧复平面相量的旋转投影关系。",
      "controls": [
        {
          "type": "slider",
          "id": "comp",
          "label": "元件类型 (0=R, 1=C, 2=L)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "角频率 ω",
          "min": 0.8,
          "max": 2.4,
          "step": 0.1,
          "value": 1.2,
          "unit": " rad/s"
        },
        {
          "type": "slider",
          "id": "param",
          "label": "元件参数 (R / C / L)",
          "min": 0.6,
          "max": 1.6,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "animate",
          "label": "开启相量动态旋转",
          "value": true
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height, ctx = lab.ctx;\nvar phase = 0;\nfunction getImpedance() {\n  var comp = Math.round(lab.values.comp);\n  var w = lab.values.omega;\n  var p = lab.values.param;\n  if (comp === 0) return { name: '电阻 Resistor (R)', re: p, im: 0, mag: p, angDeg: 0, paramTxt: 'R = ' + p.toFixed(1) + ' Ω' };\n  if (comp === 1) { var xc = 1 / (w * p); return { name: '电容 Capacitor (C)', re: 0, im: -xc, mag: xc, angDeg: -90, paramTxt: 'C = ' + p.toFixed(1) + ' F' }; }\n  var xl = w * p;\n  return { name: '电感 Inductor (L)', re: 0, im: xl, mag: xl, angDeg: 90, paramTxt: 'L = ' + p.toFixed(1) + ' H' };\n}\nfunction draw(ph) {\n  ctx.clearRect(0, 0, W, H);\n  var z = getImpedance();\n  var w = lab.values.omega;\n  var scale = 24;\n  var gx0 = 24, gx1 = 424, gy0 = 24, gy1 = 216, gcy = 120;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var x = gx0; x <= gx1; x += 40) { ctx.beginPath(); ctx.moveTo(x, gy0); ctx.lineTo(x, gy1); ctx.stroke(); }\n  for (var y = gy0; y <= gy1; y += 24) { ctx.beginPath(); ctx.moveTo(gx0, y); ctx.lineTo(gx1, y); ctx.stroke(); }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(gx0, gcy); ctx.lineTo(gx1, gcy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(gx0, gy0); ctx.lineTo(gx0, gy1); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域波形：输入电流 I(t) 与输出电压 V(t)', gx0, 16);\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  for (var px = 0; px <= gx1 - gx0; px += 2) {\n    var t = (px / (gx1 - gx0)) * 2.5 * Math.PI;\n    var iVal = Math.cos(w * t + ph);\n    var py = gcy - iVal * scale;\n    if (px === 0) ctx.moveTo(gx0 + px, py); else ctx.lineTo(gx0 + px, py);\n  }\n  ctx.stroke();\n  var angRad = (z.angDeg * Math.PI) / 180;\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  for (var px2 = 0; px2 <= gx1 - gx0; px2 += 2) {\n    var t2 = (px2 / (gx1 - gx0)) * 2.5 * Math.PI;\n    var vVal = z.mag * Math.cos(w * t2 + ph + angRad);\n    var py2 = gcy - vVal * scale;\n    if (px2 === 0) ctx.moveTo(gx0 + px2, py2); else ctx.lineTo(gx0 + px2, py2);\n  }\n  ctx.stroke();\n  var iNow = Math.cos(ph);\n  var vNow = z.mag * Math.cos(ph + angRad);\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(gx0, gcy - iNow * scale, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(gx0, gcy - vNow * scale, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#10b981'; ctx.fillText('— I (单位余弦电流)', gx0 + 10, 232);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— V (输出电压)', gx0 + 145, 232);\n  var cx = 572, cy = 120, cr = 80;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.arc(cx, cy, scale, 0, Math.PI * 2); ctx.stroke();\n  ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(cx - cr - 12, cy); ctx.lineTo(cx + cr + 12, cy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(cx, cy - cr - 12); ctx.lineTo(cx, cy + cr + 12); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('复平面相量 (Re / Im)', cx - 60, 16);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('+Re', cx + cr - 10, cy - 6);\n  ctx.fillText('+j', cx + 6, cy - cr + 4);\n  var ix = cx + Math.cos(ph) * scale, iy = cy - Math.sin(ph) * scale;\n  var vx = cx + z.mag * Math.cos(ph + angRad) * scale, vy = cy - z.mag * Math.sin(ph + angRad) * scale;\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3;\n  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ix, iy); ctx.stroke();\n  ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(ix, iy, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 3;\n  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(vx, vy); ctx.stroke();\n  ctx.fillStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(vx, vy, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)'; ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(vx, vy); ctx.lineTo(vx, cy); ctx.stroke();\n  ctx.setLineDash([]);\n  var zStr = z.re.toFixed(2) + (z.im >= 0 ? ' + ' : ' - ') + Math.abs(z.im).toFixed(2) + 'j';\n  lab.setReadout(z.name + ' | ' + z.paramTxt + ' | 复阻抗 Z = ' + zStr + ' | 幅度比 |Z| = ' + z.mag.toFixed(2) + ' | 相位差 ∠Z = ' + (z.angDeg > 0 ? '+' : '') + z.angDeg + '°');\n}\nlab.onUpdate(function() {\n  if (!lab.values.animate) phase = 0;\n  draw(phase);\n});\nlab.onLoop(function(dt) {\n  if (lab.values.animate) {\n    phase += dt * lab.values.omega;\n    draw(phase);\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "实战 RLC 陷波滤波器：像直流电阻分压一样计算频响",
      "paragraphs": [
        "把 R、C、L 统一写成复阻抗后，直流电路中所有串并联、分压公式都可以原封不动地照搬过来。以经典的 **RLC 陷波滤波器（Notch filter）** 为例（如图 30-6：上臂为电阻 `Z1 = R`，下臂为电感 `Z2 = jωL` 与电容 `Z3 = -j/(ωC)` 串联接地），它常被用来精准剔除音频或仪器信号中的特定窄带干扰（比如 60 Hz 工频交流哼声）。",
        "利用分压公式直接写出复数传递函数：`Vout / Vin = (Z2 + Z3) / (Z1 + Z2 + Z3)`。令净电抗 `k = ωL - 1/(ωC)`，经过复数代数化简（分子分母同乘共轭复数），即可将实部与虚部分离，再转换为极坐标下的**幅频响应（Magnitude）**与**相频响应（Phase）**。",
        "当恰好处于谐振频率（即 `ωL = 1/(ωC)`，使得 `k = 0`）时，串联的电感和电容阻抗相互完全抵消，下臂等同于对地短路！此时输出幅度跌落至 `0`（形成一道尖锐的深坑把干扰彻底吞掉），而相位会在这一瞬间从 `-π/2` 跳变到 `+π/2`（总共跳变 `π` 弧度）。电阻 `R` 越大，陷波的“坑口”就越宽；`R` 越小，陷波就越窄越锋利。"
      ],
      "formula": {
        "expr": "Vout / Vin = k²/(R² + k²) + j·Rk/(R² + k²),   Mag = |k| / √(R² + k²),   Phase = arctan(R / k)",
        "explain": "其中 k = ωL - 1/(ωC) 为串联 LC 支路的净电抗；Mag 表示各频率正弦波通过滤波器后的幅度衰减倍数，Phase 表示相移弧度。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：RLC 陷波滤波器频响曲线与实时音频抗干扰听感",
      "instruction": "点击「播放信号+干扰对比」先听 220 Hz 有效信号混入刺耳干扰音的效果，再开启「RLC 陷波滤波器」并拖动 f₀ 对准干扰频率 f_noise，亲耳聆听干扰音在幅频深谷中被瞬间抹除的过程。",
      "controls": [
        {
          "type": "slider",
          "id": "f0",
          "label": "陷波中心频率 f₀",
          "min": 200,
          "max": 1000,
          "step": 10,
          "value": 600,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "R",
          "label": "电阻 R (决定陷波带宽)",
          "min": 15,
          "max": 250,
          "step": 5,
          "value": 50,
          "unit": " Ω"
        },
        {
          "type": "slider",
          "id": "fTest",
          "label": "测试干扰频率 f_noise",
          "min": 150,
          "max": 1100,
          "step": 10,
          "value": 600,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "filterOn",
          "label": "接入 RLC 陷波滤波器",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放信号+干扰对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height, ctx = lab.ctx;\nvar audioNodes = null;\nfunction evalFilter(freq) {\n  var L = 0.05;\n  var w0 = 2 * Math.PI * lab.values.f0;\n  var C = 1 / (w0 * w0 * L);\n  var w = 2 * Math.PI * freq;\n  var k = w * L - 1 / (w * C);\n  var R = lab.values.R;\n  var mag = Math.abs(k) / Math.sqrt(R * R + k * k);\n  var ph = k === 0 ? 0 : Math.atan(R / k);\n  return { mag: mag, phase: ph, k: k, C: C, L: L };\n}\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  var fMin = 100, fMax = 1200;\n  var fTest = lab.values.fTest;\n  var f0 = lab.values.f0;\n  var active = lab.values.filterOn;\n  var mx0 = 46, mx1 = 342, my0 = 26, my1 = 206;\n  var px0 = 408, px1 = 704, py0 = 26, py1 = 206;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var f = 200; f <= 1000; f += 200) {\n    var xm = mx0 + ((f - fMin) / (fMax - fMin)) * (mx1 - mx0);\n    var xp = px0 + ((f - fMin) / (fMax - fMin)) * (px1 - px0);\n    ctx.beginPath(); ctx.moveTo(xm, my0); ctx.lineTo(xm, my1); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(xp, py0); ctx.lineTo(xp, py1); ctx.stroke();\n  }\n  for (var m = 0; m <= 1.2; m += 0.4) {\n    var ym = my1 - (m / 1.2) * (my1 - my0);\n    ctx.beginPath(); ctx.moveTo(mx0, ym); ctx.lineTo(mx1, ym); ctx.stroke();\n  }\n  var y10 = my1 - (1.0 / 1.2) * (my1 - my0);\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(mx0, y10); ctx.lineTo(mx1, y10); ctx.stroke();\n  var pyMid = (py0 + py1) / 2;\n  ctx.beginPath(); ctx.moveTo(px0, pyMid); ctx.lineTo(px1, pyMid); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.strokeRect(mx0, my0, mx1 - mx0, my1 - my0);\n  ctx.strokeRect(px0, py0, px1 - px0, py1 - py0);\n  ctx.fillStyle = '#f8fafc'; ctx.font = '12px sans-serif';\n  ctx.fillText('a. 幅频响应 Magnitude |Vout/Vin|', mx0, 17);\n  ctx.fillText('b. 相频响应 Phase (radians)', px0, 17);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)'; ctx.font = '10px sans-serif';\n  ctx.fillText('1.0', mx0 - 22, y10 + 3);\n  ctx.fillText('0.0', mx0 - 22, my1);\n  ctx.fillText('+π/2', px0 - 26, py0 + 16);\n  ctx.fillText('0', px0 - 14, pyMid + 3);\n  ctx.fillText('-π/2', px0 - 26, py1 - 8);\n  ctx.fillText('200Hz', mx0 + 20, my1 + 14);\n  ctx.fillText('600Hz', mx0 + 124, my1 + 14);\n  ctx.fillText('1000Hz', mx0 + 228, my1 + 14);\n  ctx.fillText('200Hz', px0 + 20, py1 + 14);\n  ctx.fillText('600Hz', px0 + 124, py1 + 14);\n  ctx.fillText('1000Hz', px0 + 228, py1 + 14);\n  ctx.beginPath();\n  ctx.strokeStyle = active ? '#38bdf8' : 'rgba(56,189,248,0.28)';\n  ctx.lineWidth = 2.5;\n  for (var i = 0; i <= 200; i++) {\n    var freq = fMin + (i / 200) * (fMax - fMin);\n    var res = evalFilter(freq);\n    var xx = mx0 + (i / 200) * (mx1 - mx0);\n    var yy = my1 - (res.mag / 1.2) * (my1 - my0);\n    if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  if (!active) {\n    ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(mx0, y10); ctx.lineTo(mx1, y10); ctx.stroke();\n    ctx.setLineDash([]);\n  }\n  ctx.beginPath();\n  ctx.strokeStyle = active ? '#10b981' : 'rgba(16,185,129,0.28)';\n  ctx.lineWidth = 2.5;\n  var prevK = null;\n  for (var j = 0; j <= 240; j++) {\n    var freqP = fMin + (j / 240) * (fMax - fMin);\n    var resP = evalFilter(freqP);\n    var xp2 = px0 + (j / 240) * (px1 - px0);\n    var yp2 = pyMid - (resP.phase / 1.8) * ((py1 - py0) / 2);\n    if (j === 0 || (prevK !== null && prevK < 0 && resP.k >= 0)) ctx.moveTo(xp2, yp2);\n    else ctx.lineTo(xp2, yp2);\n    prevK = resP.k;\n  }\n  ctx.stroke();\n  var xtM = mx0 + ((fTest - fMin) / (fMax - fMin)) * (mx1 - mx0);\n  var xtP = px0 + ((fTest - fMin) / (fMax - fMin)) * (px1 - px0);\n  var cur = evalFilter(fTest);\n  var effMag = active ? cur.mag : 1.0;\n  var effPh = active ? cur.phase : 0.0;\n  var ytM = my1 - (effMag / 1.2) * (my1 - my0);\n  var ytP = pyMid - (effPh / 1.8) * ((py1 - py0) / 2);\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(236,72,153,0.6)'; ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(xtM, my0); ctx.lineTo(xtM, my1); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(xtP, py0); ctx.lineTo(xtP, py1); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(xtM, ytM, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(xtP, ytP, 5, 0, Math.PI * 2); ctx.fill();\n  var x0M = mx0 + ((f0 - fMin) / (fMax - fMin)) * (mx1 - mx0);\n  ctx.fillStyle = '#f59e0b'; ctx.font = '11px sans-serif';\n  ctx.fillText('f₀=' + f0 + 'Hz', Math.min(mx1 - 52, Math.max(mx0 + 2, x0M - 22)), my0 + 13);\n  var cMicro = (cur.C * 1e6).toFixed(2);\n  var db = effMag > 0.0001 ? (20 * Math.log10(effMag)).toFixed(1) : '-80.0';\n  lab.setReadout((active ? '【滤波已开启】' : '【直通旁路】') + ' L = 50mH, C = ' + cMicro + 'μF | 干扰频率 ' + fTest + 'Hz 处增益 = ' + effMag.toFixed(3) + ' (' + db + ' dB) | 相移 = ' + effPh.toFixed(2) + ' rad');\n}\nfunction updateAudio() {\n  var playing = !!lab.values.play;\n  if (playing && !audioNodes) {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    var oscSig = ac.createOscillator();\n    var gainSig = ac.createGain();\n    oscSig.type = 'triangle';\n    oscSig.frequency.value = 220;\n    var oscNoise = ac.createOscillator();\n    var gainNoise = ac.createGain();\n    oscNoise.type = 'sine';\n    oscNoise.frequency.value = lab.values.fTest;\n    var master = ac.createGain();\n    master.gain.value = 0.16;\n    oscSig.connect(gainSig); gainSig.connect(master);\n    oscNoise.connect(gainNoise); gainNoise.connect(master);\n    master.connect(ac.destination);\n    oscSig.start(); oscNoise.start();\n    audioNodes = { ac: ac, oscSig: oscSig, gainSig: gainSig, oscNoise: oscNoise, gainNoise: gainNoise, master: master };\n  }\n  if (!playing && audioNodes) {\n    try {\n      audioNodes.master.gain.setTargetAtTime(0, audioNodes.ac.currentTime, 0.015);\n      var oldNodes = audioNodes;\n      setTimeout(function() {\n        try { oldNodes.oscSig.stop(); oldNodes.oscNoise.stop(); oldNodes.master.disconnect(); } catch (e) {}\n      }, 60);\n    } catch (e) {}\n    audioNodes = null;\n  }\n  if (audioNodes) {\n    var now = audioNodes.ac.currentTime;\n    var sigGain = lab.values.filterOn ? 0.55 * evalFilter(220).mag : 0.55;\n    var noiseGain = lab.values.filterOn ? 0.75 * evalFilter(lab.values.fTest).mag : 0.75;\n    audioNodes.oscNoise.frequency.setTargetAtTime(lab.values.fTest, now, 0.015);\n    audioNodes.gainSig.gain.setTargetAtTime(sigGain, now, 0.02);\n    audioNodes.gainNoise.gain.setTargetAtTime(noiseGain, now, 0.02);\n  }\n}\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "前提边界坑：相量法与复阻抗 `V = IZ` 仅适用于**稳态正弦激励**的线性电路；如果信号是方波脉冲或关注开关瞬间的暂态冲激，不能直接套用单一频率的复阻抗，必须回到微分方程、傅里叶分解或拉普拉斯变换。",
        "电容与电感符号坑：写复阻抗时极易弄混正负号——容抗为 `-j/(ωC)`（高频趋近短路，电压滞后电流 90°），感抗为 `+jωL`（高频趋近开路，电压超前电流 90°），两者在谐振点恰好大小相等、符号相反并相互抵消。",
        "数字替换 vs 数学等价：本章用复数“替换”正弦波虽能化简电路代数，但物理本质仍在实数域运算；下一章（复杂傅里叶变换）将进一步升级为复数与物理世界的“数学等价”。"
      ]
    }
  ]
});
