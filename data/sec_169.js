window.__BOOK_REGISTER_SECTION__("sec_169", {
  "title": "相机与人眼：光学成像、视网膜感知与 CCD 传感器 (Cameras and Eyes)",
  "intuition": "电子相机与人类眼睛共享同一套底层架构——先用可变光圈的透镜将三维光子精准映射成二维像场，再用感光阵列把光强分布转换为电信号或神经脉冲。",
  "blocks": [
    {
      "type": "concept",
      "heading": "透镜聚焦与双系统对焦架构",
      "paragraphs": [
        "人眼与电子相机在物理结构上惊人地相似，都由两大核心部件组成：**透镜组件 (lens assembly)** 与 **成像传感器 (imaging sensor)**。前者负责收集物体表面反射的光子并将其汇聚到传感器平面上，后者则将二维光强分布转换为电子视频信号或生物神经信号。",
        "所谓**聚焦 (focus)**，是指物体上的每一个点与投影屏幕上的每一个点形成严格的**一对一映射**。以强光下花样滑冰运动员鞋尖 $1\\text{ mm} \\times 1\\text{ mm}$ 的微小区域为例：每秒约有 **100 万亿 ($10^{14}$) 个光子**撞击该区域，表面会随机反射其中 1% 到 99% 的光子；但在 3 米外、直径 1 厘米的透镜孔径只能截获约**百万分之一**的反射光子。玻璃与空气界面的**折射 (refraction)** 改变每个光子的行进方向，使从同一点发散出去的光子重新汇合到像面上的同一点。",
        "如果未能正确对焦，物体上的一个点会在传感器上投射成一个圆形光斑，导致图像模糊。相机与人眼采用了截然不同的机械方案来调焦与控光：",
        "**电子相机**：内部充满空气，通过机械结构整体**前后移动刚性透镜**与传感器（如 CCD）之间的距离来完成对焦；光强则由机械**光圈 (iris)** 改变透镜有效通光直径来控制。",
        "**人类眼睛**：是一个直径约 3 厘米、内部充满透明液体的球体，外层由坚韧的**巩膜 (sclera)** 包裹。人眼有两片透镜——前端固定曲率、承担绝大部分折射任务的**角膜 (cornea)**，以及内部可变形的晶状体。当**睫状肌 (ciliary muscles)** 收缩时，晶状体被压扁，从而将不同距离的物体精准聚焦到眼底；而由不透明肌肉组织构成的**虹膜 (iris)** 通过收缩来放大或缩小**瞳孔 (pupil)**。"
      ],
      "formula": {
        "expr": "N_captured ≈ N_incident × ρ × (A_lens / 2πd²)",
        "explain": "到达传感器的光子数 N_captured 取决于入射光子数 N_incident、物体表面反射率 ρ (1%–99%) 以及透镜截获的立体角比例 (透镜面积 A_lens 与距离 d 平方之比)。"
      }
    },
    {
      "type": "concept",
      "heading": "光学系统的隐藏权衡：景深、曝光时间与动态范围",
      "paragraphs": [
        "在光学成像中，光强、光圈直径、传感器灵敏度与曝光时间之间存在环环相扣的**工程权衡 (trade-offs)**。当环境光线充足时，缩小光圈直径不仅能减少进光量，还会带来更大的**景深 (depth-of-field)**——即物体在距离相机多大的前后范围内都能保持清晰对焦；同时，充足的光照允许缩短**曝光时间 (exposure time)**，显著减轻手抖与物体高速运动造成的运动模糊。",
        "之所以需要可调光圈，是因为自然界的光强跨度远超传感器本身的直接承载能力。日光与月光的照度相差约 **100 万倍 ($10^6$)**，再叠加普通物体表面 1% 到 99%（约 100 倍）的反射率差异，环境总光强动态范围高达**近一亿倍 ($10^8$)**。",
        "典型电子相机的传感器**动态范围 (dynamic range)** 约为 300 到 1000（例如最大输出 1 V、暗态均方根噪声 1 mV），再配合能将通光面积调节约 300 倍的机械光圈，整套系统的总动态范围可达几十万倍——但即便如此，烈日下曝光正常的相机在黑夜里依然几乎全黑。相比之下，人眼几乎能覆盖整个自然界动态范围，令人意外的是瞳孔面积从暗到明**仅变化约 20 倍**；余下数百万倍的跨度，全靠视网膜感光神经细胞缓慢调节自身化学灵敏度来完成（例如走进黑暗电影院需要数分钟适应）。",
        "从 DSP 信号处理视角来看，一幅反射图像其实是两个二维信号的乘积：**场景照明分布 (illumination)** 乘以 **物体表面反射率分布 (reflectance)**。所有普通材料的反射率都在 1% 到 99% 之间，动态范围不到 100，却承载了物体轮廓、材质等全部关键信息；而照明信号动辄跨越数百万倍（单幅图内也常达 10–100 倍），几乎不含物体本身信息，反而会拉爆图像动态范围。DSP 图像增强的核心思路之一，就是压制照明分量、让反射率分量主导画面。"
      ],
      "formula": {
        "expr": "I(x, y) = L(x, y) · R(x, y) ,   DR_sensor = S_max / N_rms",
        "explain": "图像信号 I(x,y) 等于环境照明 L(x,y) 与物体反射率 R(x,y) 的逐点乘积；传感器动态范围 DR_sensor 定义为可测最大信号 S_max 与器件固有均方根噪声 N_rms 之比。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：透镜对焦、光圈景深与暗光曝光权衡",
      "instruction": "拖动「物体位置」与「对焦距离」观察光线如何在传感器平面汇合或形成模糊弥散圆；切换「暗光环境」并调节「光圈直径」，直观对比景深大小与长曝光抖动模糊之间的矛盾。",
      "controls": [
        {
          "type": "slider",
          "id": "focusDist",
          "label": "镜头对焦距离",
          "min": 1,
          "max": 5,
          "step": 0.1,
          "value": 2.5,
          "unit": " m"
        },
        {
          "type": "slider",
          "id": "objDist",
          "label": "物体实际位置",
          "min": 1,
          "max": 5,
          "step": 0.1,
          "value": 2.5,
          "unit": " m"
        },
        {
          "type": "slider",
          "id": "iris",
          "label": "光圈直径 (Iris)",
          "min": 1,
          "max": 10,
          "step": 0.5,
          "value": 6,
          "unit": " mm"
        },
        {
          "type": "toggle",
          "id": "darkScene",
          "label": "切换至暗光环境 (长曝光抖动)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet animT = 0;\n\nfunction draw(timeSec) {\n  const focusDist = lab.values.focusDist;\n  const objDist = lab.values.objDist;\n  const iris = lab.values.iris;\n  const darkScene = lab.values.darkScene;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let x = 20; x < 470; x += 30) {\n    ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x, H - 12); ctx.stroke();\n  }\n  for (let y = 20; y < H; y += 30) {\n    ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(470, y); ctx.stroke();\n  }\n\n  const axisY = 126;\n  const distToX = (d) => 275 - (d - 1.0) * 55;\n  const objX = distToX(objDist);\n  const focusX = distToX(focusDist);\n  const lensX = 335 + (focusDist - 2.5) * 4.5;\n  const sensorX = 452;\n  const apHalf = 7 + iris * 4.4;\n\n  const dofHalf = Math.min(2.4, 0.14 * focusDist * focusDist / Math.max(0.9, iris * 0.48));\n  const dofNearX = distToX(Math.max(1.0, focusDist - dofHalf));\n  const dofFarX = distToX(Math.min(5.0, focusDist + dofHalf));\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';\n  ctx.fillRect(dofFarX, 24, dofNearX - dofFarX, H - 48);\n  ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(dofFarX, 24); ctx.lineTo(dofFarX, H - 24); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(dofNearX, 24); ctx.lineTo(dofNearX, H - 24); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('清晰景深范围 (DOF)', Math.max(18, (dofFarX + dofNearX) / 2 - 48), 38);\n\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(focusX, 46); ctx.lineTo(focusX, H - 30); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(20, axisY); ctx.lineTo(465, axisY); ctx.stroke();\n\n  const convX = sensorX + (focusDist - objDist) * 19;\n  const yTopAtSensor = (axisY - apHalf) + apHalf * (sensorX - lensX) / (convX - lensX);\n  const yBotAtSensor = (axisY + apHalf) - apHalf * (sensorX - lensX) / (convX - lensX);\n  const blurRadius = Math.abs(yTopAtSensor - axisY);\n\n  const rayEndX = convX > sensorX ? convX : sensorX + 8;\n  const yTopEnd = (axisY - apHalf) + apHalf * (rayEndX - lensX) / (convX - lensX);\n  const yBotEnd = (axisY + apHalf) - apHalf * (rayEndX - lensX) / (convX - lensX);\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';\n  ctx.beginPath();\n  ctx.moveTo(objX, axisY);\n  ctx.lineTo(lensX, axisY - apHalf);\n  ctx.lineTo(sensorX, yTopAtSensor);\n  ctx.lineTo(sensorX, yBotAtSensor);\n  ctx.lineTo(lensX, axisY + apHalf);\n  ctx.closePath();\n  ctx.fill();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  ctx.moveTo(objX, axisY); ctx.lineTo(lensX, axisY - apHalf); ctx.lineTo(rayEndX, yTopEnd);\n  ctx.moveTo(objX, axisY); ctx.lineTo(lensX, axisY + apHalf); ctx.lineTo(rayEndX, yBotEnd);\n  ctx.moveTo(objX, axisY); ctx.lineTo(rayEndX, axisY);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.ellipse(lensX, axisY, 10, 56, 0, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.stroke();\n\n  ctx.fillStyle = '#475569';\n  ctx.fillRect(lensX - 18, 56, 8, Math.max(4, axisY - apHalf - 56));\n  ctx.fillRect(lensX - 18, axisY + apHalf, 8, Math.max(4, (axisY + 70) - (axisY + apHalf)));\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('光圈', lensX - 24, 52);\n  ctx.fillText('透镜', lensX - 10, 200);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(sensorX, 55, 6, 142);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('传感器', sensorX - 14, 48);\n\n  ctx.strokeStyle = blurRadius < 2.2 ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 4;\n  ctx.beginPath();\n  ctx.moveTo(sensorX + 3, Math.min(yTopAtSensor, yBotAtSensor));\n  ctx.lineTo(sensorX + 3, Math.max(yTopAtSensor, yBotAtSensor));\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(objX, axisY, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(convX, axisY, 3.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('物点 (' + objDist.toFixed(1) + 'm)', objX - 26, axisY + 20);\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(482, 18, 224, 204); ctx.clip();\n  ctx.fillStyle = darkScene ? '#04070f' : '#0f172a';\n  ctx.fillRect(482, 18, 224, 204);\n\n  const lightCollected = Math.pow(iris / 4.0, 2) * (darkScene ? 0.14 : 1.0);\n  const expMs = Math.min(240, Math.max(4, Math.round(25 / lightCollected)));\n  const shakeAmp = darkScene ? Math.min(18, Math.max(0, (expMs - 18) * 0.085)) : 0;\n  const brightness = Math.min(1.0, (darkScene ? 0.35 + lightCollected * 1.4 : 0.72 + lightCollected * 0.15));\n\n  const cx = 594;\n  const cy = 122;\n  const defocusPx = Math.min(20, blurRadius * 0.62);\n  const samples = defocusPx < 1.0 && shakeAmp < 0.5 ? 1 : 9;\n\n  for (let i = 0; i < samples; i++) {\n    const angle = (i / Math.max(1, samples - 1)) * Math.PI * 2;\n    const rOff = i === 0 ? 0 : defocusPx;\n    const shakeOff = shakeAmp * Math.sin(timeSec * 8 + i * 0.9);\n    const tx = cx + Math.cos(angle) * rOff * 0.65 + shakeOff;\n    const ty = cy + Math.sin(angle) * rOff * 0.65;\n    const alpha = (1 / samples) * brightness;\n\n    ctx.strokeStyle = 'rgba(248, 250, 252, ' + (alpha * 1.35) + ')';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath(); ctx.arc(tx, ty, 34, 0, Math.PI * 2); ctx.stroke();\n    ctx.strokeStyle = 'rgba(56, 189, 248, ' + (alpha * 1.35) + ')';\n    ctx.beginPath(); ctx.arc(tx, ty, 18, 0, Math.PI * 2); ctx.stroke();\n    ctx.fillStyle = 'rgba(16, 185, 129, ' + (alpha * 1.5) + ')';\n    ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fill();\n    ctx.strokeStyle = 'rgba(245, 158, 11, ' + (alpha * 1.2) + ')';\n    ctx.beginPath();\n    ctx.moveTo(tx - 44, ty); ctx.lineTo(tx + 44, ty);\n    ctx.moveTo(tx, ty - 44); ctx.lineTo(tx, ty + 44);\n    ctx.stroke();\n  }\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(482, 18, 224, 204);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('传感器成像预览 (模糊 + 抖动)', 492, 34);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('曝光时间: ' + expMs + ' ms', 492, 212);\n\n  const inDof = Math.abs(objDist - focusDist) <= dofHalf;\n  lab.setReadout('景深半宽: ±' + dofHalf.toFixed(2) + ' m | 弥散圆半径: ' + blurRadius.toFixed(1) + ' px (' + (inDof ? '景深内清晰' : '离焦模糊') + ') | 所需曝光: ' + expMs + ' ms' + (shakeAmp > 2 ? ' (存在运动/抖动模糊!)' : ''));\n}\n\nlab.onUpdate(() => draw(animT));\nlab.onLoop((dt, timeSec) => {\n  animT = timeSec;\n  draw(timeSec);\n});"
    },
    {
      "type": "concept",
      "heading": "视网膜的“倒置”三层结构、RGB 编码与中央凹扫视",
      "paragraphs": [
        "覆盖在眼球后半球内壁的**视网膜 (retina)** 由三层功能各异的神经细胞组成：光感受器层、中间图像处理与数据压缩层、以及通往大脑的视神经纤维层。令人称奇的是，几乎所有动物的视网膜排布看起来都是**“反过来”**的——光感受器位于最深处，入射光线必须先穿过视神经和中间处理层才能被探测到。",
        "视网膜上的光感受器按显微镜下的形态分为两类：**视杆细胞 (rods)** 与 **视锥细胞 (cones)**。视杆细胞专门在极弱光线（如星夜）下工作，但它无法分辨色彩，因此夜间视觉是黑白的。在极暗环境下，视觉画面会呈现不断跳动的颗粒感，这并非人眼有缺陷，而是因为进入眼球的光子极其稀疏，个别光子被随机探测到的**统计噪声 (statistical noise / 散粒噪声)** 显露了出来——所有微光夜视仪都会遇到同样的物理极限。",
        "视锥细胞则负责在充足光线下分辨颜色，人眼共有对**红、绿、蓝**敏感的三类视锥细胞，它们各自含有吸收不同波长光子的**视紫红质 (photopigments)**。这种将连续光谱粗略归并为三大频段的机制称为 **RGB 编码**，随后大脑底层神经还会将其重编码为“红/绿、蓝/黄、明/暗”三对拮抗通道。相比之下，科学用高光谱相机可以将光学频谱切分为成百上千种独立颜色（用于识别癌细胞、分析恒星物理或识破森林伪装）；人眼之所以只保留 3 种颜色通道，大概因为原始人类生存只需要“在蓝天映衬下，从绿叶中找出红苹果”。",
        "每个视杆或视锥细胞宽约 3 微米，密布在 $3\\text{ cm} \\times 3\\text{ cm}$ 的视网膜上，构成约 $10{,}000 \\times 10{,}000 = 1\\text{ 亿}$ 个感受器；然而连接大脑的视神经仅有约 **100 万条神经纤维**。这意味着平均每条神经纤维通过中间连接层汇聚了约 **100 个感光细胞**的信息——中间层不仅完成数据压缩，还顺带实现了**边缘锐化**和**照明分量抑制**等生物图像处理。",
        "视网膜正中心有一个直径极小的凹陷区，叫做**中央凹 (fovea，拉丁语意为“小坑”)**，它是人眼高分辨率视觉的核心，具有三大特征：**第一**，视神经和连接层被推向两侧，让光线直射感光细胞；**第二**，中央凹里**只有视锥细胞、没有视杆细胞**且排列极其紧密——这也解释了为什么夜间盯着暗弱物体正中反而不如用余光（偏离中心）看得清楚；**第三**，每条神经纤维仅对应少数几个视锥细胞，空间定位精度极高。在正常阅读距离下，中央凹视野仅覆盖直径约 1 毫米（比单个印刷字母还小，约等效于 $20 \\times 20$ 像素网格）。人眼通过称为**扫视 (saccades)** 的高速微跳动快速扫描场景来弥补视野之小，同时扫视还能不断刷新感光细胞的光强刺激——如果强制眼球死死盯住同一画面不动，细节和色彩在几秒内就会因视网膜适应而褪色消失。"
      ],
      "formula": {
        "expr": "100,000,000 光感受器  --(100:1 汇聚与边缘增强)-->  1,000,000 视神经纤维",
        "explain": "视网膜上约 1 亿个 3 μm 级感光细胞先经过中间层进行边缘锐化、抑制照明不均与百倍降维，再通过约 100 万条视神经传向大脑。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：视锥/视杆光谱响应、暗视觉光子噪声与中央凹盲区",
      "instruction": "拖动「环境光强」从烈日强光降到极暗星夜，观察视锥细胞退出工作、画面褪为黑白并浮现随机光子散粒噪声；开启「直视物体」，体验中央凹因缺乏视杆细胞而在暗处形成的中心盲区！",
      "controls": [
        {
          "type": "slider",
          "id": "lightLog",
          "label": "环境光强 (10^x 相对照度)",
          "min": 0,
          "max": 8,
          "step": 0.1,
          "value": 6.5,
          "unit": " log"
        },
        {
          "type": "slider",
          "id": "wavelength",
          "label": "测试单色光波长",
          "min": 380,
          "max": 680,
          "step": 5,
          "value": 530,
          "unit": " nm"
        },
        {
          "type": "toggle",
          "id": "foveaMode",
          "label": "直视目标 (突显中央凹无视杆盲区)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet seed = 1;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) % 4294967296;\n  return seed / 4294967296;\n}\nfunction gauss(x, mu, sig) {\n  const d = (x - mu) / sig;\n  return Math.exp(-0.5 * d * d);\n}\n\nfunction drawScene(t) {\n  const lightLog = lab.values.lightLog;\n  const wl = lab.values.wavelength;\n  const foveaMode = lab.values.foveaMode;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const gx = 42, gy = 28, gw = 350, gh = 172;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = gy + (gh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke();\n  }\n  for (let nm = 350; nm <= 700; nm += 50) {\n    const x = gx + ((nm - 350) / 350) * gw;\n    ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(nm), x - 9, gy + gh + 14);\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('波长 (nm)', gx + gw / 2 - 22, gy + gh + 28);\n  ctx.fillText('相对灵敏度', 8, gy + 10);\n\n  const coneActive = Math.max(0, Math.min(1, (lightLog - 1.8) / 2.2));\n  const curves = [\n    { name: '蓝视锥', mu: 440, sig: 36, amp: 0.82, col: '#38bdf8', isCone: true },\n    { name: '视杆 (黑白)', mu: 505, sig: 42, amp: 0.85, col: '#f8fafc', isCone: false },\n    { name: '绿视锥', mu: 540, sig: 40, amp: 0.86, col: '#10b981', isCone: true },\n    { name: '红视锥', mu: 575, sig: 43, amp: 0.82, col: '#ec4899', isCone: true }\n  ];\n\n  curves.forEach((c, idx) => {\n    ctx.save();\n    ctx.strokeStyle = c.col;\n    ctx.globalAlpha = c.isCone ? (0.2 + 0.8 * coneActive) : (lightLog < 4.5 ? 1.0 : 0.45);\n    ctx.lineWidth = c.isCone ? (coneActive > 0.3 ? 2.2 : 1.2) : 2.2;\n    if (c.isCone && coneActive < 0.25) ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    for (let nm = 350; nm <= 700; nm += 3) {\n      const val = c.amp * gauss(nm, c.mu, c.sig);\n      const x = gx + ((nm - 350) / 350) * gw;\n      const y = gy + gh - val * gh;\n      if (nm === 350) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n\n    ctx.fillStyle = c.col;\n    ctx.font = '10px sans-serif';\n    ctx.fillText(c.name, gx + 8 + idx * 84, 16);\n  });\n\n  const cx = gx + ((wl - 350) / 350) * gw;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(cx, gy); ctx.lineTo(cx, gy + gh); ctx.stroke();\n  ctx.setLineDash([]);\n\n  const resp = curves.map((c) => c.amp * gauss(wl, c.mu, c.sig));\n  curves.forEach((c, i) => {\n    const py = gy + gh - resp[i] * gh;\n    ctx.fillStyle = c.col;\n    ctx.beginPath(); ctx.arc(cx, py, 4, 0, Math.PI * 2); ctx.fill();\n  });\n\n  const vx = 425, vy = 18, vw = 278, vh = 204;\n  ctx.save();\n  ctx.beginPath(); ctx.rect(vx, vy, vw, vh); ctx.clip();\n\n  const lumGain = Math.max(0.18, Math.min(1.0, 0.22 + lightLog * 0.11));\n  const mixGray = (r, g, b) => {\n    const lum = (0.299 * r + 0.587 * g + 0.114 * b);\n    const rr = Math.round((lum + (r - lum) * coneActive) * lumGain);\n    const gg = Math.round((lum + (g - lum) * coneActive) * lumGain);\n    const bb = Math.round((lum + (b - lum) * coneActive) * lumGain);\n    return 'rgb(' + rr + ',' + gg + ',' + bb + ')';\n  };\n\n  ctx.fillStyle = mixGray(56, 189, 248);\n  ctx.fillRect(vx, vy, vw, vh);\n\n  ctx.fillStyle = mixGray(16, 185, 129);\n  ctx.beginPath(); ctx.arc(vx + 72, vy + 125, 58, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(vx + 206, vy + 132, 62, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(vx + 138, vy + 150, 68, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = mixGray(239, 68, 68);\n  ctx.beginPath(); ctx.arc(vx + 139, vy + 118, 30, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = mixGray(254, 215, 170);\n  ctx.beginPath(); ctx.arc(vx + 129, vy + 108, 6, 0, Math.PI * 2); ctx.fill();\n\n  if (lightLog < 3.6) {\n    const noiseIntensity = Math.pow((3.6 - lightLog) / 3.6, 1.35);\n    const count = Math.floor(noiseIntensity * 650);\n    seed = Math.floor(t * 24) + 1337;\n    for (let i = 0; i < count; i++) {\n      const nx = vx + rand() * vw;\n      const ny = vy + rand() * vh;\n      const bright = rand() > 0.45;\n      ctx.fillStyle = bright ? 'rgba(248,250,252,' + (0.15 + noiseIntensity * 0.45) + ')' : 'rgba(2,6,23,' + (0.3 + noiseIntensity * 0.5) + ')';\n      ctx.fillRect(nx, ny, 2.5, 2.5);\n    }\n  }\n\n  if (foveaMode) {\n    const fx = vx + 139, fy = vy + 118, fr = 36;\n    if (lightLog < 2.8) {\n      const blindAlpha = Math.min(0.92, (2.8 - lightLog) / 2.2);\n      const grad = ctx.createRadialGradient(fx, fy, 4, fx, fy, fr);\n      grad.addColorStop(0, 'rgba(2, 6, 23, ' + blindAlpha + ')');\n      grad.addColorStop(1, 'rgba(2, 6, 23, 0)');\n      ctx.fillStyle = grad;\n      ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();\n    }\n    ctx.strokeStyle = '#f59e0b';\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('中央凹 (无视杆)', fx - 38, fy - fr - 5);\n  }\n\n  const pupilAreaFactor = 1 + 19 * (1 - lightLog / 8.0);\n  const pupilR = 4 + Math.sqrt(pupilAreaFactor) * 2.2;\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';\n  ctx.beginPath(); ctx.arc(vx + vw - 26, vy + 26, 18, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n  ctx.fillStyle = '#020617';\n  ctx.beginPath(); ctx.arc(vx + vw - 26, vy + 26, pupilR, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '9px sans-serif';\n  ctx.fillText('瞳孔 ' + pupilAreaFactor.toFixed(0) + 'x', vx + vw - 44, vy + 54);\n\n  ctx.restore();\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(vx, vy, vw, vh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('视网膜主观视觉模拟', vx + 10, vy + 16);\n\n  const modeStr = lightLog >= 3.8 ? '视锥主导 (全彩)' : (lightLog >= 2.0 ? '混合过渡 (色彩减弱)' : '视杆主导 (黑白 + 光子散粒噪声)');\n  lab.setReadout('照度: 10^' + lightLog.toFixed(1) + ' | ' + modeStr + ' | ' + wl + 'nm 响应[蓝:' + resp[0].toFixed(2) + ' 杆:' + resp[1].toFixed(2) + ' 绿:' + resp[2].toFixed(2) + ' 红:' + resp[3].toFixed(2) + ']');\n}\n\nlab.onUpdate(() => drawScene(0));\nlab.onLoop((dt, timeSec) => drawScene(timeSec));"
    },
    {
      "type": "concept",
      "heading": "CCD 图像传感器：三相电势阱与行优先读出架构",
      "paragraphs": [
        "现代电子相机最核心的感光器件是**电荷耦合器件 (CCD, Charge Coupled Device)**。它是一块约 1 厘米见方的**P 型硅 (p-type silicon)** 薄片——所谓 P 型硅，意味着内部存在大量可自由移动的正电荷载流子，称为**空穴 (holes，记作 `+`)**。芯片背面镀有接地的金属层，正面覆盖一层绝缘体，绝缘体上方则排列着重复的金属电极阵列。",
        "最常见的 CCD 采用**三相读出 (three-phase readout)** 结构：每隔三个电极连到同一根相位控制线（$\\phi_1, \\phi_2, \\phi_3$）。当向其中一相电极施加 +10 V 正电压、另外两相保持 0 V 时，硅中的正电荷空穴会被同性相斥地推离电极下方，从而在绝缘层下方形成一块缺乏空穴的耗尽区，称为**势阱 (potential well)**。",
        "当单个光子撞击硅片时，其能量会激发出一个**电子-空穴对 (electron-hole pair)**：空穴被排斥移走，而带负电的电子 (`-`) 则被电极上的正电压牢牢囚禁在势阱中。在**积分时间 (integration period)** 内（例如标准电视为 $1/60$ 秒，天文摄影则可长达数小时），投射在 CCD 上的二维光强分布就被忠实地转换成了各势阱中积累的**电荷量分布**。",
        "接下来的读出机制极为巧妙——把电子一格一格“推”向输出放大器：首先同时给相邻两相电极加上 +10 V 正电压，使每个势阱**向右扩展**；随后撤掉前一相的正电压，原势阱坍塌，被困电子就被顺势挤进了右侧相邻的新势阱中。不断循环这组三相脉冲，所有电子最终被推入集成在同一块硅片上的**电荷灵敏放大器 (charge sensitive amplifier)**——它本质上是一个极小的电容（通常小于 $1\\text{ pF}$）加上一个单位增益缓冲器，将脉冲电荷直接转化为成正比的电压序列。",
        "在二维 CCD 阵列中，所有像元按列排列。积分结束后，每一行电荷同时向上移动一行；每次上移，最顶端第 1 行的电荷就会落入顶部的**水平寄存器 (horizontal register)**，并迅速沿水平方向依次送入放大器。这种从左上角第一像素开始、逐行从左到右、自上而下吐出数据的顺序，正是数字图像处理中最通用的**行优先顺序 (row major order)**。"
      ],
      "formula": {
        "expr": "V_out = Q_well / C_sense   (C_sense < 1 pF)",
        "explain": "电荷灵敏放大器输出电压 V_out 正比于势阱积累并推入电容的电子总电荷 Q_well；通过把读出电容 C_sense 做得极小（不足 1 皮法），哪怕微弱电荷也能产生显著电压。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 3：CCD 三相电势阱电荷转移与行优先读出仿真",
      "instruction": "观察光子在 P 型硅势阱中激发电子-空穴对，通过三相电极电压 (φ1/φ2/φ3) 的交替通断将电子向右推入 <1 pF 放大器电容；可关闭「自动连续移位」后手动单步推演，或开启音频监听串行视频脉冲声。",
      "controls": [
        {
          "type": "slider",
          "id": "lightFlux",
          "label": "入射光强 (势阱电子数)",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 6,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "phaseStep",
          "label": "手动三相时钟步进",
          "min": 0,
          "max": 12,
          "step": 1,
          "value": 0,
          "unit": " 步"
        },
        {
          "type": "toggle",
          "id": "autoShift",
          "label": "自动连续三相电荷移位",
          "value": true
        },
        {
          "type": "audio",
          "id": "sonify",
          "label": "▶ 监听串行视频输出脉冲",
          "activeLabel": "⏸ 暂停信号声"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet osc = null;\nlet gain = null;\nlet lastStep = -1;\n\nconst phaseOrder = ['φ2', 'φ1', 'φ3', 'φ2', 'φ1', 'φ3', 'φ2', 'φ1', 'φ3'];\nconst states = [\n  { p1: 10, p2: 0, p3: 0, label: 'a/b. φ1=+10V 形成势阱与光电积分' },\n  { p1: 10, p2: 0, p3: 10, label: 'c. φ1 与 φ3 同加 +10V，势阱向右扩展' },\n  { p1: 0, p2: 0, p3: 10, label: 'd. 撤去 φ1 电压，电子被推进 φ3 势阱' },\n  { p1: 0, p2: 10, p3: 10, label: 'e. φ3 与 φ2 同加 +10V，势阱继续右扩' },\n  { p1: 0, p2: 10, p3: 0, label: 'f. 撤去 φ3 电压，电子进入 φ2 势阱' },\n  { p1: 10, p2: 10, p3: 0, label: 'g. φ2 与 φ1 同加 +10V，准备推入下一单元' }\n];\n\nconst pattern2D = [\n  [0.2, 0.3, 0.9, 0.9, 0.3],\n  [0.2, 0.8, 0.5, 0.4, 0.9],\n  [0.3, 0.9, 0.3, 0.8, 0.9],\n  [0.4, 0.9, 0.9, 0.9, 0.6],\n  [0.2, 0.5, 0.4, 0.3, 0.8]\n];\n\nfunction updateAudio(normVal) {\n  if (!lab.values.sonify) {\n    if (gain) {\n      try { gain.gain.setTargetAtTime(0, gain.context.currentTime, 0.02); } catch (e) {}\n    }\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') {\n    try { ac.resume(); } catch (e) {}\n  }\n  if (!osc) {\n    osc = ac.createOscillator();\n    gain = ac.createGain();\n    osc.type = 'triangle';\n    osc.frequency.value = 240;\n    gain.gain.value = 0;\n    osc.connect(gain);\n    gain.connect(ac.destination);\n    osc.start();\n  }\n  const f = 190 + normVal * 520;\n  osc.frequency.setTargetAtTime(f, ac.currentTime, 0.015);\n  gain.gain.setTargetAtTime(0.04 + normVal * 0.07, ac.currentTime, 0.015);\n}\n\nfunction draw(timeSec) {\n  const flux = lab.values.lightFlux;\n  const auto = lab.values.autoShift;\n  const stepIdx = auto ? Math.floor(timeSec * 2.2) : lab.values.phaseStep;\n  const st = states[stepIdx % 6];\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(st.label, 18, 22);\n\n  const bx = 24, by = 78, ew = 40, eh = 16, subH = 88;\n  const busY = { 'φ1': 36, 'φ2': 48, 'φ3': 60 };\n  const busV = { 'φ1': st.p1, 'φ2': st.p2, 'φ3': st.p3 };\n  const busCol = { 'φ1': '#38bdf8', 'φ2': '#10b981', 'φ3': '#f59e0b' };\n\n  ['φ1', 'φ2', 'φ3'].forEach((k) => {\n    const active = busV[k] > 0;\n    ctx.strokeStyle = active ? busCol[k] : 'rgba(148,163,184,0.3)';\n    ctx.lineWidth = active ? 2.2 : 1;\n    ctx.beginPath(); ctx.moveTo(bx, busY[k]); ctx.lineTo(bx + 9 * ew, busY[k]); ctx.stroke();\n    ctx.fillStyle = active ? busCol[k] : '#64748b';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(k + '(' + busV[k] + 'V)', 2, busY[k] + 3);\n  });\n\n  ctx.fillStyle = '#334155';\n  ctx.fillRect(bx, by + 10, 9 * ew, 12);\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(bx, by + 22, 9 * ew, subH);\n  ctx.strokeStyle = '#94a3b8';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(bx, by + 22 + subH); ctx.lineTo(bx + 9 * ew, by + 22 + subH); ctx.stroke();\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('P型硅衬底 (接地背面)', bx + 115, by + 22 + subH + 15);\n\n  for (let i = 0; i < 9; i++) {\n    const ph = phaseOrder[i];\n    const active = busV[ph] > 0;\n    const ex = bx + i * ew + 3;\n    ctx.strokeStyle = busCol[ph];\n    ctx.lineWidth = 1.2;\n    ctx.beginPath(); ctx.moveTo(ex + (ew - 6) / 2, busY[ph]); ctx.lineTo(ex + (ew - 6) / 2, by + 4); ctx.stroke();\n\n    ctx.fillStyle = active ? busCol[ph] : '#475569';\n    ctx.fillRect(ex, by + 4, ew - 6, 6);\n\n    if (active) {\n      ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';\n      ctx.beginPath();\n      ctx.ellipse(ex + (ew - 6) / 2, by + 22, ew * 0.56, 46, 0, 0, Math.PI);\n      ctx.fill();\n      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';\n      ctx.lineWidth = 1.2;\n      ctx.stroke();\n    }\n  }\n\n  for (let i = 0; i < 9; i++) {\n    const ph = phaseOrder[i];\n    const active = busV[ph] > 0;\n    const ex = bx + i * ew + ew / 2;\n    if (!active) {\n      ctx.fillStyle = 'rgba(248, 250, 252, 0.45)';\n      ctx.font = '11px monospace';\n      ctx.fillText('+', ex - 10, by + 42);\n      ctx.fillText('+', ex + 4, by + 56);\n    } else {\n      const eCount = Math.max(2, Math.round(flux * 0.6));\n      ctx.fillStyle = '#f59e0b';\n      ctx.font = 'bold 12px monospace';\n      for (let e = 0; e < eCount; e++) {\n        const ox = ((e % 3) - 1) * 9;\n        const oy = Math.floor(e / 3) * 12;\n        ctx.fillText('-', ex + ox - 3, by + 39 + oy);\n      }\n    }\n    ctx.fillStyle = 'rgba(248, 250, 252, 0.35)';\n    ctx.font = '11px monospace';\n    ctx.fillText('+', ex - 4, by + 95);\n  }\n\n  const photonX = bx + 5.5 * ew;\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let py = 12; py <= by + 34; py += 6) {\n    const px = photonX + Math.sin((py - timeSec * 40) * 0.35) * 5;\n    if (py === 12) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('光子', photonX + 8, 28);\n\n  const ax = bx + 9 * ew + 14;\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(bx + 9 * ew, by + 36); ctx.lineTo(ax + 12, by + 36);\n  ctx.moveTo(ax + 12, by + 36); ctx.lineTo(ax + 12, by + 54);\n  ctx.moveTo(ax + 4, by + 54); ctx.lineTo(ax + 20, by + 54);\n  ctx.moveTo(ax + 4, by + 60); ctx.lineTo(ax + 20, by + 60);\n  ctx.moveTo(ax + 12, by + 60); ctx.lineTo(ax + 12, by + 76);\n  ctx.moveTo(ax + 6, by + 76); ctx.lineTo(ax + 18, by + 76);\n  ctx.stroke();\n  ctx.beginPath();\n  ctx.moveTo(ax + 12, by + 36); ctx.lineTo(ax + 30, by + 36);\n  ctx.lineTo(ax + 30, by + 22); ctx.lineTo(ax + 54, by + 36); ctx.lineTo(ax + 30, by + 50); ctx.closePath();\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('<1 pF', ax - 2, by + 92);\n  ctx.fillText('输出', ax + 34, by + 22);\n\n  const gx = 488, gy = 26, cs = 22;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('2D 行优先读出 (Row Major)', gx, 16);\n\n  const pxIdx = stepIdx % 25;\n  const curRow = Math.floor(pxIdx / 5);\n  const curCol = pxIdx % 5;\n\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.4;\n  ctx.fillRect(gx + 34, gy, 5 * cs, cs - 4);\n  ctx.strokeRect(gx + 34, gy, 5 * cs, cs - 4);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '9px sans-serif';\n  ctx.fillText('水平寄存器', gx + 148, gy + 12);\n\n  for (let r = 0; r < 5; r++) {\n    for (let c = 0; c < 5; c++) {\n      const val = pattern2D[r][c] * (flux / 10);\n      const x = gx + 34 + c * cs;\n      const y = gy + 24 + r * cs;\n      const readDone = r < curRow || (r === curRow && c < curCol);\n      const isCur = r === curRow && c === curCol;\n      ctx.fillStyle = readDone ? 'rgba(30, 41, 59, 0.7)' : 'rgba(56, 189, 248, ' + (0.15 + val * 0.85) + ')';\n      ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);\n      if (isCur) {\n        ctx.strokeStyle = '#ec4899';\n        ctx.lineWidth = 2;\n        ctx.strokeRect(x + 1, y + 1, cs - 2, cs - 2);\n      }\n    }\n  }\n\n  const sx = 488, sy = 170, sw = 212, sh = 50;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(sx, sy, sw, sh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(sx, sy, sw, sh);\n  ctx.fillStyle = '#10b981';\n  ctx.font = '9px sans-serif';\n  ctx.fillText('串行视频电压 V_out', sx + 4, sy + 11);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let k = 0; k <= 24; k++) {\n    const r = Math.floor(k / 5), c = k % 5;\n    const v = pattern2D[r][c] * (flux / 10);\n    const px = sx + 6 + (k / 25) * (sw - 12);\n    const nx = sx + 6 + ((k + 1) / 25) * (sw - 12);\n    const py = sy + sh - 6 - v * (sh - 20);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    ctx.lineTo(nx, py);\n  }\n  ctx.stroke();\n  const curX = sx + 6 + ((pxIdx + 0.5) / 25) * (sw - 12);\n  ctx.strokeStyle = '#ec4899';\n  ctx.beginPath(); ctx.moveTo(curX, sy + 14); ctx.lineTo(curX, sy + sh - 2); ctx.stroke();\n\n  const curVal = pattern2D[curRow][curCol] * (flux / 10);\n  if (stepIdx !== lastStep || !lab.values.sonify) {\n    lastStep = stepIdx;\n    updateAudio(curVal);\n  }\n  lab.setReadout('三相时钟: φ1=' + st.p1 + 'V φ2=' + st.p2 + 'V φ3=' + st.p3 + 'V | 正在行优先读出: 第 ' + (curRow + 1) + ' 行 第 ' + (curCol + 1) + ' 列 | V_out 归一化电平: ' + (curVal * 100).toFixed(0) + '%');\n}\n\nlab.onUpdate(() => draw(0));\nlab.onLoop((dt, timeSec) => draw(timeSec));"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【光学三难权衡】大光圈进光多、可缩短曝光以防运动模糊，但景深极浅容易虚焦；小光圈景深大，却在暗处迫使曝光拉长而抖动模糊——没有完美参数，只有按场景取舍。",
        "【暗光颗粒噪声的物理根源】夜间视觉变黑白且充满噪点，不是眼睛或传感器“坏了”，而是视锥细胞退出工作后，视杆细胞直接暴露在低光子通量下的物理散粒噪声 (statistical noise)；同样因为中央凹没有视杆细胞，夜晚看暗处物体稍微偏开视线（用余光）往往更清晰。",
        "【照明与反射分离的 DSP 启示】图像亮暗差异动辄上百万倍（照明分量），但物体自身的反射率变化其实不到 100 倍；在视觉系统与后续 DSP 算法中，核心任务都是抑制缓慢变化的照明分量，突出反映物体本质的反射率纹理。",
        "【CCD 读出本质是二维转一维】无论芯片上有多少万个像素，CCD 最终都依靠三相时钟将势阱电子一步步推进不到 1 pF 的输出电容，以严格的行优先 (row major) 顺序吐出连续电压流，交给后续 ADC 数字化。"
      ]
    }
  ]
});
