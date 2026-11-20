window.__BOOK_REGISTER_SECTION__("sec_207", {
  "title": "ADSP-2106x SHARC 处理器家族全景 (The ADSP-2106x family)",
  "intuition": "同一套核心架构，通过“片内双端口 SRAM 容量、Link Port 并行链路与供电电压”的精准分级，在 10 美元级消费电子与顶级多核并行计算之间拉出一条完整的产品光谱。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么同一个 DSP 要分裂出整个家族？——市场与内存的博弈",
      "paragraphs": [
        "在数字信号处理系统中，**内存访问速度往往是比算力更致命的瓶颈**。为此，ADSP-2106x（SHARC）家族在芯片内部直接集成了充裕的**双端口 SRAM（On-chip dual-ported SRAM）**，让处理器核心与 DMA 控制器可以同时读写数据而不互相卡死。",
        "但现实工程中，DSP 大量应用在手机、CD 播放器等**成本极度敏感**的产品里——多买一比特用不上的片内 SRAM 都是纯利润流失。因此，SHARC 家族的划分既取决于技术，也取决于市场：**家族成员共享完全相同的核心指令与计算架构，主要通过裁剪片内存储容量与 I/O 外设来拉出价格梯度**。",
        "家族中最元老的成员是 `ADSP-21020`。它只包含最纯粹的计算核心架构，**没有任何片内 SRAM 或 I/O 控制器**，因此无法作为单芯片计算机独立工作，必须外挂存储器与接口芯片。而从 `ADSP-21060` 往后的所有家族成员都是完整的“单芯片计算机”，只需接上电源并通过外部 PROM 或数据链路把程序灌入片内内存即可直接运行。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "Table 29-1 全家福拆解：从 10 美元入门款到 Quad-SHARC 巨兽",
      "paragraphs": [
        "原书表 29-1 列出了 SHARC 家族的核心成员，按定位从入门到旗舰可以清晰分为四档：",
        "1. **极致性价比与教学款**：`ADSP-21065L` 拥有 `544 kbit` 片内 SRAM，售价低至 **10 美元**，凭借极高性价比把大量定点运算应用吸引到了浮点架构阵营；`ADSP-21061` 配备 `1 Mbit` SRAM，正是官方低价评估板 **EZ-KIT Lite** 所搭载的芯片。",
        "2. **中流砥柱与初代旗舰**：`ADSP-21062` 配备 `2 Mbit` SRAM，功能与旗舰 `21060` 一致但用更少内存换取更低成本；初代“动力总成” `ADSP-21060` 拥有高达 `4 Mbit` 的片内 SRAM，足以一口气吞下整幅未压缩的 `512 × 512` 像素（8-bit 灰度）数字图像。",
        "3. **多核模块与二代跃迁**：`AD1460`（Quad-SHARC）直接在 `2.05\" × 2.05\" × 0.16\"` 的微型封装内塞入四颗 `ADSP-21060`（共 `4 Mbit × 4` SRAM），爆发出 `480 MFLOPS` 的惊人算力；而第二代 `ADSP-21160M` 则携 **SIMD 双引擎架构**、64 位外部总线与 14 通道 DMA 登场。",
        "即便是最低端的 `ADSP-21065L`，其 `544 kbit` 片内内存也足够缓存 **6–8 秒** 的数字化语音（按每秒 8k 采样、每样本 8-bit 计算，同时扣除少量程序代码占位）；若仍不够用，全系均可无缝外扩更便宜的慢速外部 SRAM。"
      ],
      "formula": {
        "expr": "T_max = C_SRAM / (f_s × B_bit)",
        "explain": "T_max 为片内最大原始音频缓存时长（秒）；C_SRAM 为可用片内 SRAM 容量（bit，如 544 kbit ≈ 557,056 bit）；f_s 为采样率（Hz，如 8000）；B_bit 为单样本量化位深（如 8 bit）。工程中通常还需预留 15%–20% 空间给指令代码与 DMA 缓冲。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：片内 SRAM 极限缓冲测算与 8-bit 语音听感对比",
      "instruction": "拖动芯片型号、采样率与量化位深滑块，观察片内 SRAM 能存下多少秒音频与几张 512×512 图像，并点击播放按钮实时对比不同采样率/位深下的量化台阶与音质差异。",
      "controls": [
        {
          "type": "slider",
          "id": "chipIdx",
          "label": "芯片型号 (0:21065L ~ 4:AD1460)",
          "min": 0,
          "max": 4,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "fs",
          "label": "采样率 f_s",
          "min": 4,
          "max": 24,
          "step": 2,
          "value": 8,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "量化位深",
          "min": 4,
          "max": 16,
          "step": 2,
          "value": 8,
          "unit": " bit"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放采样量化测试音",
          "activeLabel": "⏸ 暂停测试音"
        }
      ],
      "jsCode": "var chips = [\n  { name: 'ADSP-21065L', kbits: 544, color: '#10b981' },\n  { name: 'ADSP-21061', kbits: 1024, color: '#38bdf8' },\n  { name: 'ADSP-21062', kbits: 2048, color: '#f59e0b' },\n  { name: 'ADSP-21060 / 21160M', kbits: 4096, color: '#ec4899' },\n  { name: 'AD1460 (Quad)', kbits: 16384, color: '#a855f7' }\n];\nvar srcNode = null;\nvar gainNode = null;\nvar phase = 0;\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n}\nfunction startAudio() {\n  stopAudio();\n  var ctx = lab.getAudioContext();\n  if (!ctx) return;\n  if (ctx.state === 'suspended') ctx.resume();\n  var sr = ctx.sampleRate;\n  var len = sr;\n  var buf = ctx.createBuffer(1, len, sr);\n  var data = buf.getChannelData(0);\n  var fsHz = lab.values.fs * 1000;\n  var levels = Math.pow(2, lab.values.bits);\n  var holdStep = Math.max(1, Math.round(sr / fsHz));\n  var held = 0;\n  for (var i = 0; i < len; i++) {\n    if (i % holdStep === 0) {\n      var t = i / sr;\n      var s = 0.52 * Math.sin(2 * Math.PI * 220 * t) + 0.30 * Math.sin(2 * Math.PI * 440 * t) + 0.16 * Math.sin(2 * Math.PI * 660 * t);\n      held = Math.round(((s + 1) * 0.5) * (levels - 1)) / (levels - 1) * 2 - 1;\n    }\n    data[i] = held * 0.22;\n  }\n  srcNode = ctx.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  if (!gainNode) {\n    gainNode = ctx.createGain();\n    gainNode.gain.value = 0.85;\n    gainNode.connect(ctx.destination);\n  }\n  srcNode.connect(gainNode);\n  srcNode.start();\n}\nfunction draw() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }\n  for (var gy = 0; gy <= h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }\n  var chip = chips[lab.values.chipIdx];\n  var totalBits = chip.kbits * 1024;\n  var bps = lab.values.fs * 1000 * lab.values.bits;\n  var rawSec = totalBits / bps;\n  var usableSec = rawSec * 0.80;\n  var imgBits = 512 * 512 * 8;\n  var imgRatio = totalBits / imgBits;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText(chip.name + '  (' + (chip.kbits >= 1024 ? (chip.kbits / 1024) + ' Mbit' : chip.kbits + ' kbit') + ' SRAM)', 18, 26);\n  ctx.fillStyle = 'rgba(255,255,255,0.07)';\n  ctx.fillRect(18, 42, 310, 26);\n  var barFrac = Math.min(1, chip.kbits / 4096);\n  ctx.fillStyle = chip.color;\n  ctx.fillRect(18, 42, Math.max(12, 310 * barFrac), 26);\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(18, 42, 310, 26);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('音频码率: ' + (bps / 1000).toFixed(0) + ' kbps', 18, 92);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 15px sans-serif';\n  ctx.fillText('可用缓冲: ' + usableSec.toFixed(1) + ' 秒 (纯数据 ' + rawSec.toFixed(1) + ' 秒)', 18, 118);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('512×512×8bit 图像容量:', 18, 150);\n  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(18, 160, 310, 20);\n  ctx.fillStyle = imgRatio >= 1 ? '#10b981' : '#f59e0b';\n  ctx.fillRect(18, 160, Math.min(310, 310 * imgRatio), 20);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(imgRatio >= 1 ? ('可存 ' + imgRatio.toFixed(1) + ' 张完整图像') : ('仅够 ' + (imgRatio * 100).toFixed(0) + '% 单张图像'), 24, 174);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('注: 工程中需预留 ~20% SRAM 存放程序指令与堆栈', 18, 212);\n  var wx = 356, wy = 24, ww = 346, wh = 190;\n  ctx.fillStyle = 'rgba(15,23,42,0.65)';\n  ctx.fillRect(wx, wy, ww, wh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.strokeRect(wx, wy, ww, wh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('DAC 零阶保持 + ' + lab.values.bits + '-bit 量化阶梯预览 (' + lab.values.fs + ' kHz)', wx + 10, wy + 18);\n  var midY = wy + wh * 0.56;\n  var amp = wh * 0.30;\n  ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var px = 0; px <= ww - 20; px++) {\n    var tNorm = px / (ww - 20);\n    var val = 0.65 * Math.sin(2 * Math.PI * 2 * tNorm + phase) + 0.35 * Math.sin(2 * Math.PI * 4 * tNorm + phase * 1.5);\n    var py = midY - val * amp;\n    if (px === 0) ctx.moveTo(wx + 10 + px, py); else ctx.lineTo(wx + 10 + px, py);\n  }\n  ctx.stroke();\n  var stepPx = Math.max(2, Math.round((ww - 20) / (lab.values.fs * 2.2)));\n  var levels = Math.pow(2, lab.values.bits);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  var lastPy = midY;\n  for (var px = 0; px <= ww - 20; px += stepPx) {\n    var tNorm = px / (ww - 20);\n    var val = 0.65 * Math.sin(2 * Math.PI * 2 * tNorm + phase) + 0.35 * Math.sin(2 * Math.PI * 4 * tNorm + phase * 1.5);\n    var q = Math.round(((val + 1) * 0.5) * (levels - 1)) / (levels - 1) * 2 - 1;\n    var py = midY - q * amp;\n    if (px === 0) ctx.moveTo(wx + 10 + px, py); else { ctx.lineTo(wx + 10 + px, lastPy); ctx.lineTo(wx + 10 + px, py); }\n    lastPy = py;\n  }\n  ctx.lineTo(wx + ww - 10, lastPy);\n  ctx.stroke();\n  lab.setReadout(chip.name + ' | SRAM: ' + chip.kbits + ' kbit | 采样: ' + lab.values.fs + ' kHz / ' + lab.values.bits + ' bit | 有效录音: ' + usableSec.toFixed(1) + ' 秒 | 声音: ' + (lab.values.play ? '播放中' : '静音'));\n}\nlab.onUpdate(function() {\n  if (lab.values.play) startAudio(); else stopAudio();\n  draw();\n});\nlab.onLoop(function(dt) {\n  if (lab.values.play) { phase += dt * 3.5; draw(); }\n});"
    },
    {
      "type": "concept",
      "heading": "I/O 分道扬镳与低功耗演进：Link Ports、DMA 与 L/M 电压后缀",
      "paragraphs": [
        "除了片内 SRAM 大小，SHARC 家族成员在 **I/O 外设**上也做了精准刀法：高端的 `ADSP-21060` 和 `ADSP-21062` 各自配备了 **6 个 Link Port（链路端口）**。每个 Link Port 都是 4 位宽的高速并行通信通道，专门用于把多颗 SHARC 芯片像搭积木一样直接互联成多处理器并行系统。",
        "相反，面向低成本单芯片应用的 `ADSP-21061` 和 `ADSP-21065L` 砍掉了用不上的 Link Port，转而**加强了用于服务串行口（Serial Port）的 DMA 通道数量**，让音频编解码器（CODEC）与数据流的后台搬运更加省心。",
        "此外，在芯片型号末尾常能看到 `L` 或 `M` 后缀（例如 `ADSP-21060L`、`ADSP-21160M`）。这代表芯片告别了传统的 **5.0 V** 供电，进入了低功耗低压时代：`ADSP-21060L` 工作在 **3.3 V**，而第二代 `ADSP-21160M` 更是进一步降到了 **2.5 V**。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "第二代 SHARC 跃迁：ADSP-21160 的 SIMD 双引擎架构",
      "paragraphs": [
        "1998 年 6 月，Analog Devices 推出了第二代 SHARC 架构——`ADSP-21160`。它引入了 **SIMD（Single Instruction Multiple Data，单指令多数据）** 核心架构：在芯片内部复制了**第二套完整的计算单元**（包含算术逻辑单元 ALU、桶形移位器、数据寄存器组和乘法器）。",
        "这意味着同一条指令拍下来，两个计算引擎可以同时对两组不同数据做乘加运算。借助 **100 MHz** 主频、两条 **64 位数据总线**（带来高达 **1600 MB/s** 的恐怖内存总线带宽）以及专门面向定点计算的 **4 个 80 位累加器**，`ADSP-21160M` 执行一次 1024 点 FFT 仅需 **46 微秒**！",
        "更精妙的是工程兼容性：SIMD 第二引擎对第一代 `ADSP-2106x` 保持了**向后代码兼容**。老程序无需重写就能直接跑在新芯片上，而一旦开启双引擎并行模式，性能可实现最高达 **10 倍** 的跨越式提升。"
      ],
      "formula": {
        "expr": "BW_mem = 2 × (64 bit / 8) × 100 MHz = 1600 MB/s",
        "explain": "BW_mem 为片内内存总线总带宽；因子 2 代表两条独立的 64 位数据总线并行传输（每条每周期 8 字节），乘以 100 MHz 时钟频率正好得到每秒 1600 兆字节的吞吐极限。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：SHARC 架构代际与多核 Link Port 并行算力推演",
      "instruction": "切换“第二代 SIMD 双引擎”开关，并拖动 Link Port 互联节点数与 FFT 点数滑块，动态观察内部计算管线、数据脉冲与 1024 点 FFT 耗时对比。",
      "controls": [
        {
          "type": "toggle",
          "id": "simd",
          "label": "启用第二代 SIMD 双引擎 (ADSP-21160M)",
          "value": true
        },
        {
          "type": "slider",
          "id": "nodes",
          "label": "Link Port 互联节点数",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": " 颗"
        },
        {
          "type": "slider",
          "id": "fftSize",
          "label": "FFT 计算规模",
          "min": 256,
          "max": 2048,
          "step": 256,
          "value": 1024,
          "unit": " 点"
        }
      ],
      "jsCode": "var pulse = 0;\nfunction draw() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= w; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }\n  for (var gy = 0; gy <= h; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }\n  var isSimd = lab.values.simd;\n  var nodes = lab.values.nodes;\n  var fftN = lab.values.fftSize;\n  var log2N = Math.log(fftN) / Math.LN2;\n  var scaleFFT = (fftN * log2N) / (1024 * 10);\n  var base1st = 460 * scaleFFT;\n  var base2nd = 46 * scaleFFT;\n  var parallelGain = 1 + (nodes - 1) * 0.78;\n  var curUs = (isSimd ? base2nd : base1st) / parallelGain;\n  var bwPerNode = isSimd ? 1600 : 320;\n  var totalBw = bwPerNode * nodes;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText((isSimd ? '第二代 ADSP-21160M (SIMD 100MHz)' : '第一代 ADSP-21060 (SISD 40MHz)') + ' × ' + nodes + ' 节点拓扑', 16, 24);\n  var boxW = 92;\n  var gap = 16;\n  var startX = 16;\n  for (var i = 0; i < nodes; i++) {\n    var bx = startX + i * (boxW + gap);\n    var by = 40;\n    var bh = 148;\n    ctx.fillStyle = 'rgba(15,23,42,0.75)';\n    ctx.fillRect(bx, by, boxW, bh);\n    ctx.strokeStyle = isSimd ? '#38bdf8' : '#10b981';\n    ctx.lineWidth = 1.5;\n    ctx.strokeRect(bx, by, boxW, bh);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('DSP #' + (i + 1), bx + 8, by + 16);\n    ctx.fillStyle = isSimd ? '#38bdf8' : '#10b981';\n    ctx.fillRect(bx + 8, by + 26, boxW - 16, 28);\n    ctx.fillStyle = '#0f172a';\n    ctx.font = 'bold 10px sans-serif';\n    ctx.fillText('计算单元 A', bx + 16, by + 44);\n    if (isSimd) {\n      ctx.fillStyle = '#ec4899';\n      ctx.fillRect(bx + 8, by + 60, boxW - 16, 28);\n      ctx.fillStyle = '#0f172a';\n      ctx.fillText('计算单元 B', bx + 16, by + 78);\n    } else {\n      ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n      ctx.setLineDash([3, 3]);\n      ctx.strokeRect(bx + 8, by + 60, boxW - 16, 28);\n      ctx.setLineDash([]);\n      ctx.fillStyle = 'rgba(255,255,255,0.35)';\n      ctx.font = '10px sans-serif';\n      ctx.fillText('单引擎模式', bx + 18, by + 78);\n    }\n    ctx.fillStyle = 'rgba(245,158,11,0.22)';\n    ctx.fillRect(bx + 8, by + 100, boxW - 16, 38);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.strokeRect(bx + 8, by + 100, boxW - 16, 38);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('4 Mbit SRAM', bx + 14, by + 116);\n    ctx.fillText(isSimd ? '2×64-bit 总线' : '48/32-bit 总线', bx + 12, by + 131);\n    var pyOffset = (pulse * 40) % 12;\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath(); ctx.arc(bx + 28, by + 94 - pyOffset * 0.3, 2.5, 0, Math.PI * 2); ctx.fill();\n    if (isSimd) { ctx.beginPath(); ctx.arc(bx + 62, by + 94 - pyOffset * 0.3, 2.5, 0, Math.PI * 2); ctx.fill(); }\n    if (i < nodes - 1) {\n      var lx = bx + boxW;\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(lx, by + 60); ctx.lineTo(lx + gap, by + 60); ctx.stroke();\n      ctx.beginPath(); ctx.moveTo(lx, by + 74); ctx.lineTo(lx + gap, by + 74); ctx.stroke();\n      var dotX = lx + ((pulse * 28) % gap);\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath(); ctx.arc(dotX, by + 60, 3, 0, Math.PI * 2); ctx.fill();\n      ctx.beginPath(); ctx.arc(lx + gap - (dotX - lx), by + 74, 3, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(nodes > 1 ? '橙色连线: 4-bit Link Port 高速并行互连 (有效并行加速比 ' + parallelGain.toFixed(2) + 'x)' : '提示: 增加节点数可观察 4-bit Link Port 芯片间并行通信', 16, 212);\n  var rx = 450, ry = 36, rw = 254, rh = 186;\n  ctx.fillStyle = 'rgba(15,23,42,0.72)';\n  ctx.fillRect(rx, ry, rw, rh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(fftN + ' 点 FFT 耗时对比 (越短越快)', rx + 12, ry + 22);\n  var maxUs = base1st;\n  ctx.fillStyle = 'rgba(255,255,255,0.7)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('1代单核基准: ' + base1st.toFixed(0) + ' µs', rx + 12, ry + 48);\n  ctx.fillStyle = 'rgba(16,185,129,0.35)';\n  ctx.fillRect(rx + 12, ry + 54, rw - 24, 16);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('当前配置耗时: ' + curUs.toFixed(1) + ' µs', rx + 12, ry + 92);\n  var curFrac = Math.max(0.04, Math.min(1, curUs / maxUs));\n  ctx.fillStyle = isSimd ? '#38bdf8' : '#10b981';\n  ctx.fillRect(rx + 12, ry + 98, (rw - 24) * curFrac, 18);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('总总线带宽: ' + totalBw + ' MB/s', rx + 12, ry + 146);\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('加速倍数: ' + (base1st / curUs).toFixed(1) + '× (对比 1 代单核)', rx + 12, ry + 170);\n  lab.setReadout((isSimd ? '21160M SIMD' : '21060 SISD') + ' × ' + nodes + ' | ' + fftN + '点FFT: ' + curUs.toFixed(1) + ' µs | 总内存带宽: ' + totalBw + ' MB/s');\n}\nlab.onUpdate(draw);\nlab.onLoop(function(dt) { pulse += dt; draw(); });"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要把片内 SRAM 容量全当成纯数据缓冲：`ADSP-21065L` 的 `544 kbit` 理论上能存约 8.5 秒（8kHz / 8-bit）语音，但实际工程必须扣除指令代码与堆栈占位，因此可靠缓存时长约 6–8 秒。",
        "认清 `ADSP-21020` 的独立运行陷阱：它是无片内内存与无 I/O 的“纯核心”，绝不能像 `2106x` 那样仅靠电源加外部 PROM 就单芯片启动。",
        "按需挑选 I/O：需要多芯片并行计算（如雷达、阵列处理）必选带 6 个 Link Port 的 `21060`/`21062`；若只接串口音频流，选去掉 Link Port 但增强串口 DMA 的 `21061`/`21065L` 成本最低。",
        "严防供电电压混插：标准芯片为 `5.0 V`，带 `L` 后缀（如 `21060L`）为 `3.3 V`，带 `M` 后缀（如 `21160M`）为 `2.5 V`，硬件设计时务必核对电平标准。",
        "从 1 代平滑升级到 2 代：利用 `ADSP-21160M` 的向后代码兼容性可快速迁移旧固件，再逐步重构为 SIMD 双引擎以解锁高达 10 倍的性能红利。"
      ]
    }
  ]
});
