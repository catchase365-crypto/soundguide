window.__BOOK_REGISTER_SECTION__("sec_043", {
  "title": "单比特数据转换：增量调制与 Δ-Σ 转换器 (Single Bit Data Conversion)",
  "intuition": "用极高的时钟采样率换取极简的 1 比特硬件量化，通过高速“0/1 脉冲流”的疏密变化来精确还原模拟信号的斜率或电压电平。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心思想：用速度换精度，以及基础增量调制 (Delta Modulation)",
      "paragraphs": [
        "在通信与高保真音频领域，**单比特 ADC 和 DAC (Single Bit ADC/DAC)** 是一种极为流行的多速率转换技术。它的核心哲学非常简单：**用更高的采样速率，去换取更少的量化比特数**——走到极致时，每个采样点只需要 **1 个比特**（0 或 1）。",
        "这类电路大多基于**增量调制 (Delta Modulation)**。在一个典型的增量调制器中，模拟输入信号直接送入一个**比较器 (Comparator)**，与储能电容上的当前电压进行比较：若输入信号电压高于电容电压，比较器输出 `1`；反之输出 `0`。随后，一个**数字锁存器 (Latch)** 在几百 kHz 的高速时钟脉冲控制下，同步锁存并输出这一比特。",
        "输出端通过反馈回路驱动一个电子开关：当输出为 `1` 时，接通**正电荷注入器**，让电容电压在每个时钟周期增加一个固定步长（例如 1 mV）；当输出为 `0` 时，接通**负电荷注入器**，使电容电压减少相同步长。通过这种负反馈，电容电压就像走楼梯一样紧紧“追随”着输入信号的波形。",
        "这种输出码流有一个鲜明特征：**码流中 `1` 和 `0` 的相对数量，正比于输入信号的斜率（导数）**。信号上升时 `1` 多于 `0`，信号下降时 `0` 多于 `1`，信号恒定时 `1` 和 `0` 交替出现。接收端只需复制发送端的“电荷注入器+电容”反馈部分即可还原波形。而且所有比特地位完全平等，没有传统串口通信中起始位、LSB/MSB、停止位的区分。",
        "然而，基础增量调制存在一个无法回避的“三角困境”：**最大压摆率 (Slew Rate)、量化步长与数据速率**三者相互制约。如果为了语音通信而把步长做小、压摆率做高，时钟数据率就会飙升到 MHz 量级，远超普通数字语音所需的 64 kbps，缺乏商业实用价值。"
      ],
      "formula": {
        "expr": "S_max = ΔV × f_clk",
        "explain": "S_max 为电路能追踪的最大压摆率（斜率极限，V/s），ΔV 为每个时钟周期电容电压的固定步长，f_clk 为锁存器的采样时钟频率。输入信号变化率一旦超过 S_max，电容电压就会发生“斜率过载”而严重失真。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：基础增量调制 (DM) 与连续可变斜率 (CVSD) 追踪对比",
      "instruction": "拖动“基础步长”和“信号变化率”滑块，观察阶跃跳变处何时出现粉色“斜率受限区”；再打开“CVSD 自适应步长”开关，观察 4 位移位寄存器如何自动放大步长以快速追上输入信号。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "信号变化率",
          "min": 1,
          "max": 6,
          "step": 0.5,
          "value": 2,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "step",
          "label": "基础步长 ΔV",
          "min": 0.2,
          "max": 1.5,
          "step": 0.1,
          "value": 0.5,
          "unit": " V"
        },
        {
          "type": "toggle",
          "id": "cvsd",
          "label": "开启 CVSD 自适应步长",
          "value": false
        }
      ],
      "jsCode": "(function(){var ctx=lab.ctx,W=lab.width,H=lab.height;function draw(){var freq=lab.values.freq,baseStep=lab.values.step,cvsd=lab.values.cvsd,N=120,x=[],capArr=[],bits=[],slewFlags=[],cap=0,curStep=baseStep,hist=[0,1,0,1],slewCount=0,maxErr=0;for(var n=0;n<N;n++){var val=0;if(n>=10&&n<45)val=6.0;else if(n>=45)val=6.0*Math.cos(2*Math.PI*freq*(n-45)/N);x.push(val);var bit=val>=cap?1:0;bits.push(bit);if(cvsd){hist.shift();hist.push(bit);if(n>=3&&hist[0]===hist[1]&&hist[1]===hist[2]&&hist[2]===hist[3]){curStep=Math.min(baseStep*5.0,curStep*1.35+baseStep*0.25);}else{curStep=Math.max(baseStep,curStep*0.8);}}else{curStep=baseStep;}var limited=Math.abs(val-cap)>curStep*1.5;slewFlags.push(limited);if(limited)slewCount++;cap+=(bit===1?curStep:-curStep);capArr.push(cap);var err=Math.abs(val-cap);if(err>maxErr)maxErr=err;}ctx.clearRect(0,0,W,H);var padL=44,padR=16,plotW=W-padL-padR,topY=18,topH=134,midY=topY+topH/2,scaleY=topH/16;ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;for(var v=-6;v<=6;v+=3){var gy=midY-v*scaleY;ctx.beginPath();ctx.moveTo(padL,gy);ctx.lineTo(W-padR,gy);ctx.stroke();ctx.fillStyle='rgba(248,250,252,0.5)';ctx.font='11px monospace';ctx.textAlign='right';ctx.fillText(v+'V',padL-6,gy+4);}for(var i=0;i<=6;i++){var gx=padL+(i/6)*plotW;ctx.beginPath();ctx.moveTo(gx,topY);ctx.lineTo(gx,224);ctx.stroke();}for(var n=0;n<N;n++){if(slewFlags[n]){var bx=padL+(n/N)*plotW,bw=plotW/N+0.6;ctx.fillStyle='rgba(236,72,153,0.16)';ctx.fillRect(bx,topY,bw,topH);}}ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.beginPath();for(var n=0;n<N;n++){var px=padL+((n+0.5)/N)*plotW,py=midY-x[n]*scaleY;if(n===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();ctx.strokeStyle='#10b981';ctx.lineWidth=2;ctx.beginPath();for(var n=0;n<N;n++){var x0=padL+(n/N)*plotW,x1=padL+((n+1)/N)*plotW,py=midY-capArr[n]*scaleY;if(n===0)ctx.moveTo(x0,midY);ctx.lineTo(x0,py);ctx.lineTo(x1,py);}ctx.stroke();var bitTop=172,bitBot=216;ctx.fillStyle='rgba(248,250,252,0.5)';ctx.font='11px monospace';ctx.textAlign='right';ctx.fillText('1',padL-6,bitTop+4);ctx.fillText('0',padL-6,bitBot+4);ctx.strokeStyle='#f59e0b';ctx.lineWidth=1.8;ctx.beginPath();for(var n=0;n<N;n++){var bx0=padL+(n/N)*plotW,bx1=padL+((n+1)/N)*plotW,by=bits[n]===1?bitTop:bitBot;if(n===0)ctx.moveTo(bx0,by);else ctx.lineTo(bx0,by);ctx.lineTo(bx1,by);}ctx.stroke();ctx.textAlign='left';ctx.font='11px sans-serif';ctx.fillStyle='#38bdf8';ctx.fillText('— 输入信号',padL+6,13);ctx.fillStyle='#10b981';ctx.fillText('— 电容追踪电压',padL+90,13);ctx.fillStyle='#f59e0b';ctx.fillText('— 1-bit 输出码流',padL+198,13);ctx.fillStyle='#ec4899';ctx.fillText('■ 斜率受限区',padL+315,13);lab.setReadout('模式: '+(cvsd?'CVSD 自适应步长':'固定步长 DM')+' | 基础步长: '+baseStep.toFixed(1)+' V | 峰值追踪误差: '+maxErr.toFixed(2)+' V | 斜率受限时钟: '+slewCount+'/'+N);}lab.onUpdate(draw);})();"
    },
    {
      "type": "concept",
      "heading": "连续可变斜率增量调制 (CVSD)：专攻语音的低码率方案",
      "paragraphs": [
        "为了打破基础增量调制的瓶颈，工程师发明了**连续可变斜率增量调制 (CVSD)**（典型芯片如 Motorola MC3518 系列）。它的思路很巧妙：先把时钟频率降到可接受的水平（例如 30 kHz、2000 个量化级），此时电路静态压摆率极差；然后再加一套数字逻辑来动态补偿。",
        "具体做法是在输出端挂一个 **4 位移位寄存器**，持续监视最近产生的 4 个比特。一旦电路陷入“斜率过载”（即追不上输入信号），输出就会连续出现 **4 个全 `1`**（正斜率过载）或 **4 个全 `0`**（负斜率过载）。检测逻辑捕捉到这一信号后，便会通知电荷注入器增大单步注入的电荷量，从而瞬间提升压摆率。",
        "通常在检测逻辑和电荷注入器之间还会放一个模拟低通滤波器，称为**音节滤波器 (Syllabic Filter)**。它的时间常数匹配人类说话时音节的平均长度：只要处于斜率受限状态，步长就会随时间越变越大；一旦追上信号，步长就平滑回落。接收端只需放一个参数完全一致的音节滤波器，就能在 **16 ~ 32 kHz** 的极低数据率下还原出清晰可懂的语音。",
        "但必须清醒地认识到：CVSD 虽然是数字传输语音最简单廉价的手段，却**绝对不能用于通用模数转换 (ADC)**。因为它的码流反映的是信号的“导数”而非电平本身，步长还在不停动态变化，且通常无法保留输入信号的 **直流分量 (DC level)**。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "Δ-Σ (Delta-Sigma) 转换器：从测量“斜率”跃迁到测量“电平”",
      "paragraphs": [
        "为了解决 CVSD 无法作为通用 ADC 的痛点，**Δ-Σ 转换器 (Delta-Sigma Converter)** 将模拟电路与 DSP 数字滤波算法巧妙地结合在了一起。它对基础电路做了两处看似微小却改变全局的改动：",
        "第一，比较器不再直接拿输入信号和电容对比，而是**把电容电压与“地电位 (0V)”进行比较**，模拟输入则通过电阻不断向电容灌入或吸出电流；第二，反馈逻辑反转——当输出为 `1` 时，向电容注入**负电荷**（拉低电容电压）；输出为 `0` 时，注入**正电荷**（拉高电容电压）。整个反馈环路的目标变成：**用反向电荷把电容死死稳在 0 伏附近**。",
        "这一改动带来了质的飞跃：如果输入电压为正，电路必须输出更多的 `1` 来产生足够多的负电荷与之抵消；输入电压为 `0` 时，`1` 和 `0` 的数量正好相等。也就是说，**输出码流中 `1` 和 `0` 的比例不再对应斜率，而是直接对应输入电压的绝对电平（幅度）**！",
        "正因如此，我们只要把输出码流送入计数器，统计固定时钟周期内 `1` 的个数（例如在 4096 个时钟内计数，就得到一个 12-bit ADC：4095 代表最大正电压，0 代表最大负电压，2048 代表 0V），就能直接读出采样值。**Delta-Sigma** 这个名字正是来源于此：**Delta**（增量调制）+ **Sigma**（累加/求和）。",
        "而在现代商用芯片（如 National Semiconductor ADC16071）中，工程师用更优雅的 DSP 方法取代了简单计数器：先将 1-bit 码流映射为数字量（例如 1 变 4095，0 变 0），通过一个高阶**数字低通滤波器**（如 6.4 MHz 时钟下的 246 点 FIR 滤波器）滤除高频量化噪声，再通过**抽取 (Decimation)**（每 64 个点保留 1 个）将采样率降回 100 kHz，从而直接输出高精度的 16-bit 数字信号。反之，做 **Δ-Σ DAC** 时，只需把 1-bit 码流送入一个极其简单的单级 RC 模拟低通滤波器，脉冲的平均电压就能完美还原出模拟波形。"
      ],
      "formula": {
        "expr": "V_avg = V_high × (N_1 / N) + V_low × (N_0 / N)",
        "explain": "在 Δ-Σ DAC 或平均解调中，V_avg 为低通滤波后的模拟平均电压；V_high 与 V_low 分别代表逻辑 1 和 0 的电平（如 5V 和 0V）；N_1/N 与 N_0/N 分别为码流中 1 和 0 所占的比例。例如 80% 为 1（5V）、20% 为 0（0V）时，输出精确等于 4V。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：Δ-Σ 脉冲密度调制、低通重构与实时听音",
      "instruction": "拖动“过采样率”和“输入幅度”，观察下方 1-bit 码流如何随正弦波峰谷改变疏密；点击播放声音并切换“低通滤波器 (LPF)”开关，亲耳对比未滤波的 1-bit 脉冲噪声与滤波后的纯净正弦波。",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "输入信号幅度",
          "min": 0.1,
          "max": 0.9,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "osr",
          "label": "过采样率 (时钟密度)",
          "min": 8,
          "max": 64,
          "step": 4,
          "value": 24,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "lpf",
          "label": "开启低通滤波器 (LPF 重构)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放 Δ-Σ 转换音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "(function(){var ctx=lab.ctx,W=lab.width,H=lab.height,ac=null,src=null,f1=null,f2=null,gain=null,isPlaying=false,lastOsr=-1,lastAmp=-1;function simAndDraw(){var amp=lab.values.amp,osr=lab.values.osr,useLpf=lab.values.lpf,cycles=2,totalClocks=osr*cycles,x=[],bits=[],lpfOut=[],cap=0,ones=0;var alpha=Math.min(0.65,14/osr);for(var n=0;n<totalClocks;n++){var val=amp*Math.sin(2*Math.PI*cycles*n/totalClocks);x.push(val);var bit=cap>=0?1:0;bits.push(bit);if(bit===1)ones++;cap+=val+(bit===1?-1:1);}var bipolar=bits.map(function(b){return b===1?1:-1;});if(useLpf){var fwd=new Array(totalClocks),rc=0;for(var n=0;n<totalClocks;n++){rc=rc+alpha*(bipolar[n]-rc);fwd[n]=rc;}rc=fwd[totalClocks-1];for(var n=totalClocks-1;n>=0;n--){rc=rc+alpha*(fwd[n]-rc);lpfOut[n]=rc;}}else{lpfOut=bipolar;}var mse=0;for(var n=0;n<totalClocks;n++){var d=lpfOut[n]-x[n];mse+=d*d;}var rmse=Math.sqrt(mse/totalClocks);ctx.clearRect(0,0,W,H);var padL=44,padR=16,plotW=W-padL-padR,topY=18,topH=128,midY=topY+topH/2,scaleY=topH/2.4;ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;[-1,0,1].forEach(function(v){var gy=midY-v*scaleY;ctx.beginPath();ctx.moveTo(padL,gy);ctx.lineTo(W-padR,gy);ctx.stroke();ctx.fillStyle='rgba(248,250,252,0.5)';ctx.font='11px monospace';ctx.textAlign='right';ctx.fillText(v.toFixed(0),padL-6,gy+4);});ctx.strokeStyle=useLpf?'#10b981':'rgba(236,72,153,0.75)';ctx.lineWidth=useLpf?2.4:1.3;ctx.beginPath();for(var n=0;n<totalClocks;n++){var px=padL+((n+0.5)/totalClocks)*plotW,py=midY-lpfOut[n]*scaleY;if(useLpf){if(n===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}else{var x0=padL+(n/totalClocks)*plotW,x1=padL+((n+1)/totalClocks)*plotW;if(n===0)ctx.moveTo(x0,py);else ctx.lineTo(x0,py);ctx.lineTo(x1,py);}}ctx.stroke();ctx.strokeStyle='#38bdf8';ctx.lineWidth=2;ctx.beginPath();for(var i=0;i<=180;i++){var t=i/180,px=padL+t*plotW,py=midY-(amp*Math.sin(2*Math.PI*cycles*t))*scaleY;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.stroke();var bitTop=168,bitBot=216;ctx.fillStyle='rgba(248,250,252,0.5)';ctx.font='11px monospace';ctx.textAlign='right';ctx.fillText('1',padL-6,bitTop+4);ctx.fillText('0',padL-6,bitBot+4);ctx.strokeStyle='#f59e0b';ctx.lineWidth=1.6;ctx.beginPath();for(var n=0;n<totalClocks;n++){var bx0=padL+(n/totalClocks)*plotW,bx1=padL+((n+1)/totalClocks)*plotW,by=bits[n]===1?bitTop:bitBot;if(n===0)ctx.moveTo(bx0,by);else ctx.lineTo(bx0,by);ctx.lineTo(bx1,by);}ctx.stroke();ctx.textAlign='left';ctx.font='11px sans-serif';ctx.fillStyle='#38bdf8';ctx.fillText('— 输入正弦波',padL+6,13);ctx.fillStyle=useLpf?'#10b981':'#ec4899';ctx.fillText(useLpf?'— 低通滤波重构波':'— 未滤波 1-bit 脉冲',padL+105,13);ctx.fillStyle='#f59e0b';ctx.fillText('— Δ-Σ 1-bit 码流',padL+242,13);var duty=(ones/totalClocks*100).toFixed(1);lab.setReadout('过采样率: '+osr+'x | 1 的总占比: '+duty+'% | 低通滤波: '+(useLpf?'开启':'关闭')+' | 重构均方根误差: '+rmse.toFixed(3));if(lab.values.play){if(!ac)ac=lab.getAudioContext();if(ac){if(ac.state==='suspended')ac.resume();if(!gain){f1=ac.createBiquadFilter();f1.type='lowpass';f1.Q.value=0.707;f2=ac.createBiquadFilter();f2.type='lowpass';f2.Q.value=0.707;gain=ac.createGain();gain.gain.value=0.14;f1.connect(f2);f2.connect(gain);gain.connect(ac.destination);}var cut=useLpf?550:18000;f1.frequency.setTargetAtTime(cut,ac.currentTime,0.02);f2.frequency.setTargetAtTime(cut,ac.currentTime,0.02);if(!isPlaying||lastOsr!==osr||lastAmp!==amp){if(src){try{src.stop();src.disconnect();}catch(e){}}var sr=ac.sampleRate,buf=ac.createBuffer(1,sr,sr),data=buf.getChannelData(0),hold=Math.max(1,Math.round(128/osr)),aCap=0,curOut=1;for(var s=0;s<sr;s++){if(s%hold===0){var sig=amp*Math.sin(2*Math.PI*220*s/sr),b=aCap>=0?1:0;curOut=b===1?1:-1;aCap+=sig+(b===1?-1:1);}data[s]=curOut;}src=ac.createBufferSource();src.buffer=buf;src.loop=true;src.connect(f1);src.start();isPlaying=true;lastOsr=osr;lastAmp=amp;}}}else{if(isPlaying&&src){try{src.stop();src.disconnect();}catch(e){}src=null;isPlaying=false;}}}lab.onUpdate(simAndDraw);})();"
    },
    {
      "type": "concept",
      "heading": "Δ-Σ ADC 的三大工程“怪癖”与选型陷阱",
      "paragraphs": [
        "尽管 Δ-Σ 转换器在音频领域大放异彩，但它的工作原理决定了几个固有的怪癖，严重限制了它在某些通用工程场景中的使用：",
        "1. **极难进行多路复用 (Multiplexing)**：由于芯片内部通常包含一个长抽头的数字滤波器（如 246 点 FIR），当你把输入开关从 A 通道切换到 B 通道时，数字滤波器里还残留着 A 通道的历史数据。必须等待滤波器彻底“冲刷干净”旧数据后，输出才恢复有效，导致多通道高速切换效率极低。",
        "2. **无法确定精确的采样时刻**：每个输出的采样值，实际上是内部对一段连续时间窗口内的 1-bit 信息进行滤波平均后的“合成结果”。对于音频这种**频域编码**信号，这毫无问题；但对于需要精确捕捉脉冲瞬态或波形形状的**时域编码**信号，不知道样本到底对应哪一微秒会带来很大麻烦。",
        "3. **“16-bit 音频精度”不等于“16-bit 直流测量精度”**：绝大多数 Δ-Σ ADC 专为音频优化，数据手册上标的“16 bit”往往是指**语音/音频信号能达到 16 比特的动态范围**，并不保证每个独立采样点都具备 16 比特的绝对直流精度和线性度。切勿直接拿音频 Δ-Σ 芯片去做高精度通用数据采集 (DAQ)。"
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
        "增量调制 (DM) 编码的是信号的【斜率/导数】，而 Δ-Σ 调制编码的是信号的【电压电平】，这是两者最本质的分水岭。",
        "CVSD 用 4 位移位寄存器和音节滤波器解决了 DM 的斜率过载，以 16~32 kbps 极低码率称霸低成本数字语音，但因丢失直流电平且步长时变，绝不可用作通用 ADC。",
        "Δ-Σ ADC 的本质是“高速 1-bit 过采样 + 数字低通滤波 + 抽取降采样”；Δ-Σ DAC 则反过来，核心过滤全在数字域，输出端仅需一颗极简 RC 模拟滤波器。",
        "工程避坑：不要对 Δ-Σ ADC 做高速多路复用（滤波器需要建立/清空时间）；不要用它测量要求严格精确采样时刻的时域脉冲；也不要把“16-bit 音频动态范围”误当成通用仪器的绝对采样精度。"
      ]
    }
  ]
});
