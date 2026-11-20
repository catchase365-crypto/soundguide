window.__BOOK_REGISTER_SECTION__("sec_201", {
  "title": "环形缓冲技术与实时 FIR 滤波实现 (Circular Buffering)",
  "intuition": "把线性内存首尾相连成“圆环”，让新样本只覆盖最老样本并顺延指针，从而以零数据搬移的 O(1) 代价支撑实时数字信号处理。",
  "blocks": [
    {
      "type": "concept",
      "heading": "离线处理 vs. 实时处理：为什么 DSP 离不开环形缓冲？",
      "paragraphs": [
        "在动手写算法前，必须先分清 **离线处理 (off-line processing)** 与 **实时处理 (real-time processing)** 的本质差异。在离线处理中，**完整的输入信号同时驻留在计算机内存中**。例如地震学家用地震仪记录整场地震的地面震动，震动结束后再读入电脑分析；或是医学 CT、MRI 扫描时先采集完整数据集，稍后再重建图像。这种“全量数据随时可取”的场景是个人电脑和大型机的领地，常见于科研与工程分析。",
        "而在消费电子与工业控制中，主流是 **实时处理**：输出信号必须在采集输入信号的同时产生。典型代表包括电话通话（10 毫秒内的延迟人耳完全察觉不到）、助听器以及雷达（允许几秒显示延迟，但必须持续流式输出）。实时系统不断重复“读入一个（或一组）样本 → 执行算法 → 输出一个（或一组）样本”的循环，没有任何休止符。",
        "以实时 **FIR 滤波器** 为例，若滤波器有 8 个系数 `a0, a1, ..., a7`，计算当前输出就必须随时取用最近的 8 个输入样本 `x[n], x[n-1], ..., x[n-7]`。如果每来一个新样本就把数组里的旧数据整体向后搬移一格，8 阶或许还能忍受，几百阶的滤波器就会白白耗尽处理器时间。如何用最小代价持续更新这组滑动历史窗口？答案正是 **环形缓冲 (Circular Buffering)**。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "环形缓冲区的原理与四大核心参数",
      "paragraphs": [
        "如图 28-3 所示，假设我们在物理内存中开辟 8 个连续地址 `20041` 到 `20048` 存放最近 8 个样本。**环形缓冲区的核心思想是把线性数组的末尾逻辑连接到开头**——地址 `20041` 被视为紧挨在 `20048` 之后，就像 `20044` 紧挨着 `20045` 一样。",
        "我们用一个 **指针 (pointer)** 变量记住“最新样本”所在地址。例如某时刻指针指向 `20044`（存放 `x[n]`），紧随其后的 `20045` 恰好就是最老的样本 `x[n-7]`。当下一个新样本到来时，直接覆盖 `20045` 处最老的旧值，然后把指针向前推进一格变为 `20045` 即可。整个过程 **只需修改一个内存单元和一个指针**，效率极高。",
        "管理一个环形缓冲区需要 **4 个参数**：1) **起始指针**（如 `20041`）；2) **结束指针**（如 `20048`）或 **缓冲区长度**（如 `8`）；3) **内存寻址步长 (step size)**，当每个地址存一个样本时步长为 `1`，但在按字节寻址、每个样本占 2 或 4 字节的系统中，步长就必须是 `2` 或 `4`；4) **最新样本指针**。前三个参数在运行期间保持不变，唯有第四个参数随每个新样本动态更新，因此 DSP 硬件通常会专门优化“根据前三个参数自动回绕更新指针”的逻辑。",
        "顺带一提，环形缓冲区在 **离线处理** 中也有妙用：当算法分多级执行（例如由多个双二阶滤波器 `biquads` 串联而成的递归滤波器），各级之间会产生中间信号。与其暴力开辟内存存下整段中间信号，不如用环形缓冲区只保存当前计算必需的那几个中间样本——用轻微的算法复杂度换取可观的内存节省。"
      ],
      "formula": {
        "expr": "Ptr_next = Start + ((Ptr - Start + Step) mod (N × Step))",
        "explain": "Start 为缓冲区起始内存地址，Ptr 为当前最新样本指针，Step 为单个样本占据的地址步长（如 1 字或 2/4 字节），N 为缓冲区容量。当指针越过末尾地址时，取模（或硬件边界比较）使其自动回绕到 Start。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：物理线性内存 vs. 逻辑环形指针回绕",
      "instruction": "拖动“采样推进步数”或开启“自动连续采样”，观察物理内存地址如何保持不动、新样本如何精准覆盖最老槽位，以及“地址步长”如何改变实际地址跨度。",
      "controls": [
        {
          "type": "slider",
          "id": "stepCount",
          "label": "采样推进步数 (n)",
          "min": 0,
          "max": 24,
          "step": 1,
          "value": 3,
          "unit": " 步"
        },
        {
          "type": "slider",
          "id": "bufLen",
          "label": "缓冲区长度 N",
          "min": 4,
          "max": 10,
          "step": 1,
          "value": 8,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "byteStep",
          "label": "内存寻址步长 (Step)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": " 字节"
        },
        {
          "type": "toggle",
          "id": "autoRun",
          "label": "自动连续采样",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet autoPhase = 0;\nlet lastStepTime = 0;\n\nfunction sampleVal(n) {\n  const vals = [-0.225767, -0.269847, -0.228918, -0.113940, 0.048679, 0.222977, 0.371370, 0.462791, -0.062222, 0.314159, -0.184210, 0.271828];\n  const idx = ((n % vals.length) + vals.length) % vals.length;\n  return vals[idx];\n}\n\nfunction draw() {\n  const N = lab.values.bufLen;\n  const stepSize = lab.values.byteStep;\n  const nTotal = Math.floor(lab.values.stepCount + autoPhase);\n  const startAddr = 20041;\n  const endAddr = startAddr + (N - 1) * stepSize;\n  const newestSlot = ((nTotal % N) + N) % N;\n  const oldestSlot = (newestSlot + 1) % N;\n  const ptrAddr = startAddr + newestSlot * stepSize;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 40) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (let y = 0; y <= H; y += 40) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('物理线性内存 (Start=' + startAddr + ', End=' + endAddr + ')', 16, 18);\n\n  const topY = 28;\n  const availH = H - 38;\n  const rowH = Math.min(22, Math.floor(availH / N));\n  const boxX = 76;\n  const boxW = 86;\n\n  for (let i = 0; i < N; i++) {\n    const y = topY + i * rowH;\n    const addr = startAddr + i * stepSize;\n    const age = ((newestSlot - i) % N + N) % N;\n    const isNewest = (i === newestSlot);\n    const isOldest = (i === oldestSlot);\n    const val = sampleVal(nTotal - age);\n\n    ctx.fillStyle = isNewest ? '#10b981' : (isOldest ? '#f59e0b' : '#94a3b8');\n    ctx.font = '11px monospace';\n    ctx.fillText(String(addr), 22, y + rowH * 0.7);\n\n    ctx.fillStyle = isNewest ? 'rgba(16,185,129,0.22)' : (isOldest ? 'rgba(245,158,11,0.16)' : 'rgba(15,23,42,0.75)');\n    ctx.strokeStyle = isNewest ? '#10b981' : (isOldest ? '#f59e0b' : '#475569');\n    ctx.lineWidth = (isNewest || isOldest) ? 1.8 : 1;\n    ctx.fillRect(boxX, y + 1, boxW, rowH - 2);\n    ctx.strokeRect(boxX, y + 1, boxW, rowH - 2);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px monospace';\n    ctx.fillText((val >= 0 ? ' ' : '') + val.toFixed(4), boxX + 7, y + rowH * 0.7);\n\n    const tag = age === 0 ? 'x[n] 最新' : ('x[n-' + age + ']' + (isOldest ? ' 最老(待覆盖)' : ''));\n    ctx.fillStyle = isNewest ? '#10b981' : (isOldest ? '#f59e0b' : '#38bdf8');\n    ctx.font = '11px sans-serif';\n    ctx.fillText(tag, boxX + boxW + 8, y + rowH * 0.7);\n  }\n\n  const firstY = topY + rowH * 0.5;\n  const lastY = topY + (N - 1) * rowH + rowH * 0.5;\n  const arrowX = boxX + boxW + 132;\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(arrowX, lastY);\n  ctx.lineTo(arrowX + 22, lastY);\n  ctx.lineTo(arrowX + 22, firstY);\n  ctx.lineTo(arrowX, firstY);\n  ctx.stroke();\n\n  ctx.beginPath();\n  ctx.moveTo(arrowX, firstY);\n  ctx.lineTo(arrowX + 7, firstY - 4);\n  ctx.lineTo(arrowX + 7, firstY + 4);\n  ctx.closePath();\n  ctx.fillStyle = '#ec4899';\n  ctx.fill();\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('首尾回绕', arrowX + 27, (firstY + lastY) / 2 + 3);\n\n  const cx = 568;\n  const cy = 128;\n  const R = 76;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('逻辑环形视图 (指针顺时针步进)', 476, 18);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n\n  for (let i = 0; i < N; i++) {\n    const ang = -Math.PI / 2 + (i / N) * Math.PI * 2;\n    const nx = cx + Math.cos(ang) * R;\n    const ny = cy + Math.sin(ang) * R;\n    const isNewest = (i === newestSlot);\n    const isOldest = (i === oldestSlot);\n    const age = ((newestSlot - i) % N + N) % N;\n\n    ctx.beginPath();\n    ctx.arc(nx, ny, isNewest ? 13 : 10, 0, Math.PI * 2);\n    ctx.fillStyle = isNewest ? '#10b981' : (isOldest ? '#f59e0b' : '#1e293b');\n    ctx.fill();\n    ctx.strokeStyle = isNewest ? '#f8fafc' : (isOldest ? '#fde68a' : '#38bdf8');\n    ctx.lineWidth = 1.5;\n    ctx.stroke();\n\n    ctx.fillStyle = (isNewest || isOldest) ? '#0f172a' : '#f8fafc';\n    ctx.font = 'bold 10px monospace';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'middle';\n    ctx.fillText(age === 0 ? 'n' : ('-' + age), nx, ny);\n  }\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'alphabetic';\n\n  const pAng = -Math.PI / 2 + (newestSlot / N) * Math.PI * 2;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(cx + Math.cos(pAng) * (R - 17), cy + Math.sin(pAng) * (R - 17));\n  ctx.stroke();\n\n  ctx.beginPath();\n  ctx.arc(cx, cy, 5, 0, Math.PI * 2);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fill();\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('Ptr=' + ptrAddr, cx, cy + 20);\n  ctx.textAlign = 'left';\n\n  lab.setReadout('样本 n=' + nTotal + ' | Start=' + startAddr + ' | End=' + endAddr + ' | Step=' + stepSize + ' | 当前指针 Ptr=' + ptrAddr + ' (下次将覆盖地址 ' + (startAddr + oldestSlot * stepSize) + ')');\n}\n\nlab.onUpdate(() => {\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.autoRun) {\n    lastStepTime += dt;\n    if (lastStepTime >= 0.7) {\n      lastStepTime = 0;\n      autoPhase += 1;\n      draw();\n    }\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "表 28-1 拆解：双环形缓冲区的 FIR 滤波 14 步",
      "paragraphs": [
        "在真正搭建实时 FIR 滤波器时，其实需要 **两个** 环形缓冲区：一个存放输入信号样本 `x`，另一个存放滤波器系数 `a`。表 28-1 看似把简单任务拆解得过于繁琐，但正是对这 14 个微步骤的高效并行处理，彻底拉开了 DSP 与传统微处理器的差距。",
        "每当一个新样本到来，处理器必须依次完成以下动作：**采样与入队（步骤 1–4）**：用 ADC 采集样本并触发中断 → 检测并管理中断 → 将新样本写入输入信号环形缓冲区 → 更新输入环形缓冲指针。**清零累加器（步骤 5）**：把累加器 `ACC` 清零。",
        "**核心乘加内循环（步骤 6–12）**：控制对所有系数的遍历循环 → 从系数环形缓冲区取系数 `a[k]` → 更新系数指针 → 从输入环形缓冲区取样本 `x[n-k]` → 更新输入指针 → 将系数与样本相乘 → 把乘积加到累加器。最后 **输出（步骤 13–14）**：将累加器结果送入保持缓冲，再写入 DAC。",
        "由于 **步骤 6–12 要为每个滤波器系数重复执行一次**，它们是决定吞吐量的绝对瓶颈。传统微处理器只能按顺序串行执行这 14 步；而专业 DSP 的硬件架构能让循环体（步骤 6–12）高度并行，在理想情况下 **单个时钟周期就能同时完成取数、双指针回绕更新、乘法和累加**。"
      ],
      "formula": {
        "expr": "y[n] = Σ_{k=0}^{N-1} a[k] · x[n - k]",
        "explain": "y[n] 是累加器在步骤 12 结束后的最终输出；a[k] 来自系数环形缓冲区，x[n-k] 来自输入信号环形缓冲区。每算 1 个输出点，步骤 6–12 的取数、双指针更新与乘加循环就要执行 N 次。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：双环形缓冲区实时 FIR 滤波与听感对比",
      "instruction": "点击“播放测试音”后，调节“FIR 滤波器阶数 N”和“高频嘶声干扰强度”，对比开启/关闭滤波时波形与耳中高频噪声的实时变化。",
      "controls": [
        {
          "type": "slider",
          "id": "taps",
          "label": "FIR 滤波器阶数 N (循环次数)",
          "min": 2,
          "max": 16,
          "step": 2,
          "value": 8,
          "unit": " 阶"
        },
        {
          "type": "slider",
          "id": "noiseLevel",
          "label": "高频嘶声干扰强度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 55,
          "unit": " %"
        },
        {
          "type": "toggle",
          "id": "enableFilter",
          "label": "开启 FIR 实时滤波",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst MAX_TAPS = 16;\nconst visBuf = new Float32Array(MAX_TAPS);\nlet visPtr = 0;\nlet visPhase = 0;\nconst waveIn = new Array(220).fill(0);\nconst waveOut = new Array(220).fill(0);\n\nlet audioCtx = null;\nlet gainNode = null;\nlet scriptNode = null;\nconst audBuf = new Float32Array(MAX_TAPS);\nlet audPtr = 0;\nlet audPhase = 0;\n\nfunction ensureAudio() {\n  if (audioCtx) return;\n  audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  gainNode = audioCtx.createGain();\n  gainNode.gain.value = 0;\n  gainNode.connect(audioCtx.destination);\n  scriptNode = audioCtx.createScriptProcessor(1024, 0, 1);\n  scriptNode.onaudioprocess = (e) => {\n    const out = e.outputBuffer.getChannelData(0);\n    const sr = audioCtx.sampleRate || 44100;\n    const N = lab.values.taps;\n    const nAmt = lab.values.noiseLevel / 100;\n    const useFilt = lab.values.enableFilter;\n    const coeff = 1 / N;\n    audPtr = audPtr % N;\n    for (let i = 0; i < out.length; i++) {\n      audPhase += 1;\n      const t = audPhase / sr;\n      const tone = 0.45 * Math.sin(2 * Math.PI * 220 * t) + 0.25 * Math.sin(2 * Math.PI * 440 * t);\n      const hiss = nAmt * (0.35 * (Math.random() * 2 - 1) + 0.35 * Math.sin(2 * Math.PI * 4800 * t));\n      const x = tone + hiss;\n      audBuf[audPtr] = x;\n      let y = x;\n      if (useFilt) {\n        let acc = 0;\n        let p = audPtr;\n        for (let k = 0; k < N; k++) {\n          acc += coeff * audBuf[p];\n          p = (p - 1 + N) % N;\n        }\n        y = acc;\n      }\n      audPtr = (audPtr + 1) % N;\n      out[i] = Math.max(-0.95, Math.min(0.95, y));\n    }\n  };\n  scriptNode.connect(gainNode);\n}\n\nfunction stepVisual() {\n  const N = lab.values.taps;\n  const nAmt = lab.values.noiseLevel / 100;\n  const useFilt = lab.values.enableFilter;\n  visPtr = visPtr % N;\n  visPhase += 0.12;\n  const tone = 0.55 * Math.sin(visPhase) + 0.25 * Math.sin(visPhase * 2);\n  const hiss = nAmt * (0.45 * Math.sin(visPhase * 9.5) + 0.3 * (Math.random() * 2 - 1));\n  const x = tone + hiss;\n  visBuf[visPtr] = x;\n  let y = x;\n  if (useFilt) {\n    let acc = 0;\n    let p = visPtr;\n    const coeff = 1 / N;\n    for (let k = 0; k < N; k++) {\n      acc += coeff * visBuf[p];\n      p = (p - 1 + N) % N;\n    }\n    y = acc;\n  }\n  visPtr = (visPtr + 1) % N;\n  waveIn.push(x);\n  if (waveIn.length > 220) waveIn.shift();\n  waveOut.push(y);\n  if (waveOut.length > 220) waveOut.shift();\n}\n\nfunction draw() {\n  const N = lab.values.taps;\n  const useFilt = lab.values.enableFilter;\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 40) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (let y = 0; y <= H; y += 40) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n\n  const ox = 16;\n  const oy = 32;\n  const ow = 450;\n  const oh = 190;\n  ctx.fillStyle = 'rgba(15,23,42,0.6)';\n  ctx.fillRect(ox, oy, ow, oh);\n  ctx.strokeStyle = '#334155';\n  ctx.strokeRect(ox, oy, ow, oh);\n\n  const midY = oy + oh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath(); ctx.moveTo(ox, midY); ctx.lineTo(ox + ow, midY); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(236,72,153,0.65)';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (let i = 0; i < waveIn.length; i++) {\n    const px = ox + (i / (waveIn.length - 1)) * ow;\n    const py = midY - waveIn[i] * 56;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i < waveOut.length; i++) {\n    const px = ox + (i / (waveOut.length - 1)) * ow;\n    const py = midY - waveOut[i] * 56;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('输入 x[n] (含高频干扰)', ox, 20);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('输出 y[n] (' + (useFilt ? 'FIR 滤波后' : '旁路直通未滤波') + ')', ox + 170, 20);\n\n  const rx = 595;\n  const ry = 112;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('双环形缓冲区 MAC 循环 (步骤 6-12)', 485, 20);\n\n  const rOut = 64;\n  const rIn = 36;\n  ctx.strokeStyle = 'rgba(56,189,248,0.25)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.arc(rx, ry, rOut, 0, Math.PI * 2); ctx.stroke();\n  ctx.strokeStyle = 'rgba(245,158,11,0.25)';\n  ctx.beginPath(); ctx.arc(rx, ry, rIn, 0, Math.PI * 2); ctx.stroke();\n\n  const curSlot = ((visPtr - 1) % N + N) % N;\n  for (let i = 0; i < N; i++) {\n    const a = -Math.PI / 2 + (i / N) * Math.PI * 2;\n    const isCur = (i === curSlot);\n    ctx.beginPath();\n    ctx.arc(rx + Math.cos(a) * rOut, ry + Math.sin(a) * rOut, isCur ? 6 : 4, 0, Math.PI * 2);\n    ctx.fillStyle = isCur ? '#10b981' : '#38bdf8';\n    ctx.fill();\n\n    ctx.beginPath();\n    ctx.arc(rx + Math.cos(a) * rIn, ry + Math.sin(a) * rIn, isCur ? 5 : 3.5, 0, Math.PI * 2);\n    ctx.fillStyle = isCur ? '#f8fafc' : '#f59e0b';\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '10px monospace';\n  ctx.fillText('x[n-k] 信号环', 488, 202);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('a[k] 系数环', 488, 219);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('每点循环: ' + (useFilt ? N : 1) + ' 次乘加', 588, 202);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('ACC += a[k]*x[n-k]', 588, 219);\n\n  lab.setReadout('阶数 N=' + N + ' | 干扰=' + lab.values.noiseLevel + '% | 模式=' + (useFilt ? 'FIR 滤波 (每样本执行 ' + N + ' 次乘加循环)' : '旁路直通') + ' | 音频=' + (lab.values.play ? '实时发声中' : '已静音'));\n}\n\nlab.onUpdate(() => {\n  if (lab.values.play) {\n    ensureAudio();\n    if (audioCtx && audioCtx.state === 'suspended') {\n      audioCtx.resume();\n    }\n    if (gainNode && audioCtx) {\n      gainNode.gain.setTargetAtTime(0.28, audioCtx.currentTime, 0.02);\n    }\n  } else if (gainNode && audioCtx) {\n    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n  }\n  draw();\n});\n\nlab.onLoop(() => {\n  stepVisual();\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "牢记字节寻址步长坑：写 C 或汇编管理环形缓冲区时，若系统按字节寻址而每个样本占 2 字节（16-bit）或 4 字节（32-bit float），指针步长 `Step` 必须设为 2 或 4，绝不能想当然写死 `+1`。",
        "环形缓冲的价值是消除数据搬移：每采集 1 个新样本只覆盖 1 个最老样本并更新 1 次指针，把历史窗口维护成本从 `O(N)` 压到 `O(1)`。",
        "分清主战场在步骤 6–12：实时 FIR 滤波器绝大部分算力消耗在双环形缓冲区取数、双指针回绕与乘加循环中，这也是专用 DSP 硬件级环形寻址远胜传统通用 CPU 的原因。",
        "离线多级处理同样可用：面对串联递归滤波器等需要中间信号的离线算法，环形缓冲能以极小内存代价替代整段中间数组存储。"
      ]
    }
  ]
});
