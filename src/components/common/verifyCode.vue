<template>
  <div>
    <div
      v-show="show"
      :class="['vue-puzzle-vcode', { show_: show }]"
      @mousedown="onCloseMouseDown"
      @mouseup="onCloseMouseUp"
      @touchstart="onCloseMouseDown"
      @touchend="onCloseMouseUp"
    >
      <div class="vue-auth-box_" @mousedown.stop @touchstart.stop>
        <div class="auth-body_" :style="`height: ${canvasHeight}px`">
          <!-- 主图，有缺口 -->
          <canvas
            style="border-radius: 10px"
            ref="canvas1"
            :width="canvasWidth"
            :height="canvasHeight"
            :style="`width:${canvasWidth}px;height:${canvasHeight}px`"
          />
          <!-- 成功后显示的完整图 -->
          <canvas
            ref="canvas3"
            :class="['auth-canvas3_', { show: isSuccess }]"
            :width="canvasWidth"
            :height="canvasHeight"
            :style="`width:${canvasWidth}px;height:${canvasHeight}px`"
          />
          <!-- 小图 -->
          <canvas
            :width="puzzleBaseSize"
            class="auth-canvas2_"
            :height="canvasHeight"
            ref="canvas2"
            :style="`width:${puzzleBaseSize}px;height:${canvasHeight}px;transform:translateX(${
              styleWidth -
              sliderBaseSize -
              (puzzleBaseSize - sliderBaseSize) *
                ((styleWidth - sliderBaseSize) / (canvasWidth - sliderBaseSize))
            }px)`"
          />

          <div
            :class="['info-box_', { show: infoBoxShow }, { fail: infoBoxFail }]"
          >
            {{ infoText }}
          </div>
          <div
            :class="['flash_', { show: !isSuccess }]"
            :style="`transform: translateX(${
              isSuccess
                ? `${canvasWidth + canvasHeight * 0.578}px`
                : `-${canvasHeight * 0.578}px`
            }) skew(-30deg, 0);`"
          ></div>
          <img
            class="reset_"
            @click="reset"
            src="https://zahour-sensor.oss-cn-beijing.aliyuncs.com/applet/zayn/%E5%88%B7%E6%96%B0.png"
          />
        </div>
        <div class="auth-control_">
          <div class="range-box" :style="`height:${sliderBaseSize}px`">
            <div class="range-text">{{ sliderText }}</div>
            <div
              class="range-slider"
              ref="rangeSlider"
              :style="`width:${styleWidth}px`"
            >
              <div
                :class="['range-btn', { isDown: mouseDown }]"
                :style="`width:${sliderBaseSize}px`"
                @mousedown="onRangeMouseDown($event)"
                @touchstart="onRangeMouseDown($event)"
              >
                <!-- 按钮内部样式 -->
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  canvasWidth: { type: Number, default: 350 }, // 主canvas的宽
  canvasHeight: { type: Number, default: 200 }, // 主canvas的高
  // 是否出现，由父级控制
  show: { type: Boolean, default: true },
  puzzleScale: { type: Number, default: 1 }, // 拼图块的大小缩放比例
  sliderSize: { type: Number, default: 50 }, // 滑块的大小
  range: { type: Number, default: 10 }, // 允许的偏差值
  // 所有的背景图片
  imgs: {
    type: Array,
  },
  successText: {
    type: String,
    default: "验证通过！",
  },
  failText: {
    type: String,
    default: "验证失败，请重试",
  },
  sliderText: {
    type: String,
    default: "拖动滑块完成拼图验证",
  },
});

const verSuccess = ref(false);
const mouseDown = ref(false); // 鼠标是否在按钮上按下
const startWidth = ref(50); // 鼠标点下去时父级的width
const startX = ref(0); // 鼠标按下时的X
const newX = ref(0); // 鼠标当前的偏移X
const pinX = ref(0); // 拼图的起始X
const pinY = ref(0); // 拼图的起始Y
const loading = ref(false); // 是否正在加在中，主要是等图片onload
const isCanSlide = ref(false); // 是否可以拉动滑动条
const error = ref(false); // 图片加在失败会出现这个，提示用户手动刷新
const infoBoxShow = ref(false); // 提示信息是否出现
const infoText = ref(""); // 提示等信息
const infoBoxFail = ref(false); // 是否验证失败
const timer1 = ref(null); // setTimout1
const closeDown = ref(false); // 为了解决Mac上的click BUG
const isSuccess = ref(false); // 验证成功
const imgIndex = ref(-1); // 用于自定义图片时不会随机到重复的图片
const isSubmting = ref(false); // 是否正在判定，主要用于判定中不能点击重置按钮

const canvas1 = ref(null);
const canvas2 = ref(null);
const canvas3 = ref(null);
const rangeSlider = ref(null);

// 计算属性
const styleWidth = computed(() => {
  const w = startWidth.value + newX.value - startX.value;
  return w < sliderBaseSize.value
    ? sliderBaseSize.value
    : w > props.canvasWidth
    ? props.canvasWidth
    : w;
});

const puzzleBaseSize = computed(() => {
  return Math.round(Math.max(Math.min(props.puzzleScale, 2), 0.2) * 52.5 + 6);
});

const sliderBaseSize = computed(() => {
  return Math.max(
    Math.min(Math.round(props.sliderSize), Math.round(props.canvasWidth * 0.5)),
    10
  );
});

// 生命周期
onMounted(() => {
  document.addEventListener("mousemove", onRangeMouseMove, { passive: false });
  document.addEventListener("mouseup", onRangeMouseUp, { passive: false });
  document.addEventListener("touchmove", onRangeMouseMove, { passive: false });
  document.addEventListener("touchend", onRangeMouseUp, { passive: false });
  if (props.show) {
    document.body.classList.add("vue-puzzle-overflow");
    reset();
  }
});

onBeforeUnmount(() => {
  clearTimeout(timer1.value);
  document.removeEventListener("mousemove", onRangeMouseMove, {
    passive: false,
  });
  document.removeEventListener("mouseup", onRangeMouseUp, { passive: false });
  document.removeEventListener("touchmove", onRangeMouseMove, {
    passive: false,
  });
  document.removeEventListener("touchend", onRangeMouseUp, { passive: false });
});

// 监听
watch(
  () => props.show,
  (newV) => {
    if (newV) {
      document.body.classList.add("vue-puzzle-overflow");
      reset();
    } else {
      isSubmting.value = false;
      isSuccess.value = false;
      infoBoxShow.value = false;
      document.body.classList.remove("vue-puzzle-overflow");
    }
  }
);

// 方法
function onClose() {
  if (!mouseDown.value && !isSubmting.value) {
    clearTimeout(timer1.value);
  }
}

function onCloseMouseDown() {
  closeDown.value = true;
  init(true);
  //给父组件传一个状态
  emit("submit", "F");
}

function onCloseMouseUp() {
  if (closeDown.value) {
    onClose();
  }
  closeDown.value = false;
}

function onRangeMouseDown(e) {
  if (isCanSlide.value) {
    mouseDown.value = true;
    startWidth.value = rangeSlider.value.clientWidth;
    newX.value = e.clientX || e.changedTouches[0].clientX;
    startX.value = e.clientX || e.changedTouches[0].clientX;
  }
}

function onRangeMouseMove(e) {
  if (mouseDown.value) {
    newX.value = e.clientX || e.changedTouches[0].clientX;
  }
}

function onRangeMouseUp() {
  if (mouseDown.value) {
    mouseDown.value = false;
    submit();
  }
}

function init(withCanvas) {
  if (loading.value && !withCanvas) {
    return;
  }
  loading.value = true;
  isCanSlide.value = false;
  const c = canvas1.value;
  const c2 = canvas2.value;
  const c3 = canvas3.value;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  const ctx2 = c2.getContext("2d", { willReadFrequently: true });
  const ctx3 = c3.getContext("2d", { willReadFrequently: true });
  const isFirefox =
    navigator.userAgent.indexOf("Firefox") >= 0 &&
    navigator.userAgent.indexOf("Windows") >= 0; // 是windows版火狐
  const img = document.createElement("img");
  ctx.fillStyle = "rgba(255,255,255,1)";
  ctx3.fillStyle = "rgba(255,255,255,1)";
  ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight);
  ctx2.clearRect(0, 0, props.canvasWidth, props.canvasHeight);

  pinX.value = getRandom(
    puzzleBaseSize.value,
    props.canvasWidth - puzzleBaseSize.value - 20
  ); // 留20的边距
  pinY.value = getRandom(20, props.canvasHeight - puzzleBaseSize.value - 20); // 主图高度 - 拼图块自身高度 - 20边距
  img.crossOrigin = "anonymous"; // 匿名，想要获取跨域的图片
  img.onload = () => {
    const [x, y, w, h] = makeImgSize(img);
    ctx.save();
    paintBrick(ctx);
    ctx.closePath();
    if (!isFirefox) {
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.clip();
    } else {
      ctx.clip();
      ctx.save();
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = "#000";
      ctx.shadowBlur = 0;
      ctx.fill();
      ctx.restore();
    }

    ctx.drawImage(img, x, y, w, h);
    ctx3.fillRect(0, 0, props.canvasWidth, props.canvasHeight);
    ctx3.drawImage(img, x, y, w, h);

    ctx.globalCompositeOperation = "source-atop";
    paintBrick(ctx);

    ctx.arc(
      pinX.value + Math.ceil(puzzleBaseSize.value / 2),
      pinY.value + Math.ceil(puzzleBaseSize.value / 2),
      puzzleBaseSize.value * 1.2,
      0,
      Math.PI * 2,
      true
    );
    ctx.closePath();
    ctx.shadowColor = "rgba(255, 255, 255, .8)";
    ctx.shadowOffsetX = -1;
    ctx.shadowOffsetY = -1;
    ctx.shadowBlur = Math.min(Math.ceil(8 * props.puzzleScale), 12);
    ctx.fillStyle = "#ffffaa";
    ctx.fill();

    const imgData = ctx.getImageData(
      pinX.value - 3, // 为了阴影 是从-3px开始截取，判定的时候要+3px
      pinY.value - 20,
      pinX.value + puzzleBaseSize.value + 5,
      pinY.value + puzzleBaseSize.value + 5
    );
    ctx2.putImageData(imgData, 0, pinY.value - 20);

    ctx.restore();
    ctx.clearRect(0, 0, props.canvasWidth, props.canvasHeight);

    ctx.save();
    paintBrick(ctx);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "source-atop";
    paintBrick(ctx);
    ctx.arc(
      pinX.value + Math.ceil(puzzleBaseSize.value / 2),
      pinY.value + Math.ceil(puzzleBaseSize.value / 2),
      puzzleBaseSize.value * 1.2,
      0,
      Math.PI * 2,
      true
    );
    ctx.shadowColor = "#ffffff";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "destination-over";
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();

    loading.value = false;
    isCanSlide.value = true;
  };
  img.onerror = () => {
    init(true); // 如果图片加载错误就重新来，并强制用canvas随机作图
  };

  if (!withCanvas && props.imgs && props.imgs.length) {
    let randomNum = getRandom(0, props.imgs.length - 1);
    if (randomNum === imgIndex.value) {
      if (randomNum === props.imgs.length - 1) {
        randomNum = 0;
      } else {
        randomNum++;
      }
    }
    imgIndex.value = randomNum;
    img.src = props.imgs[randomNum];
  } else {
    img.src = makeImgWithCanvas();
  }
}

function getRandom(min, max) {
  return Math.ceil(Math.random() * (max - min) + min);
}

function makeImgSize(img) {
  const imgScale = img.width / img.height;
  const canvasScale = props.canvasWidth / props.canvasHeight;
  let x = 0,
    y = 0,
    w = 0,
    h = 0;
  if (imgScale > canvasScale) {
    h = props.canvasHeight;
    w = imgScale * h;
    y = 0;
    x = (props.canvasWidth - w) / 2;
  } else {
    w = props.canvasWidth;
    h = w / imgScale;
    x = 0;
    y = (props.canvasHeight - h) / 2;
  }
  return [x, y, w, h];
}

function paintBrick(ctx) {
  const moveL = Math.ceil(15 * props.puzzleScale); // 直线移动的基础距离
  ctx.beginPath();
  ctx.moveTo(pinX.value, pinY.value);
  ctx.lineTo(pinX.value + moveL, pinY.value);
  ctx.arcTo(
    pinX.value + moveL,
    pinY.value - moveL / 2,
    pinX.value + moveL + moveL / 2,
    pinY.value - moveL / 2,
    moveL / 2
  );
  ctx.arcTo(
    pinX.value + moveL + moveL,
    pinY.value - moveL / 2,
    pinX.value + moveL + moveL,
    pinY.value,
    moveL / 2
  );
  ctx.lineTo(pinX.value + moveL + moveL + moveL, pinY.value);
  ctx.lineTo(pinX.value + moveL + moveL + moveL, pinY.value + moveL);
  ctx.arcTo(
    pinX.value + moveL + moveL + moveL + moveL / 2,
    pinY.value + moveL,
    pinX.value + moveL + moveL + moveL + moveL / 2,
    pinY.value + moveL + moveL / 2,
    moveL / 2
  );
  ctx.arcTo(
    pinX.value + moveL + moveL + moveL + moveL / 2,
    pinY.value + moveL + moveL,
    pinX.value + moveL + moveL + moveL,
    pinY.value + moveL + moveL,
    moveL / 2
  );
  ctx.lineTo(
    pinX.value + moveL + moveL + moveL,
    pinY.value + moveL + moveL + moveL
  );
  ctx.lineTo(pinX.value, pinY.value + moveL + moveL + moveL);
  ctx.lineTo(pinX.value, pinY.value + moveL + moveL);

  ctx.arcTo(
    pinX.value + moveL / 2,
    pinY.value + moveL + moveL,
    pinX.value + moveL / 2,
    pinY.value + moveL + moveL / 2,
    moveL / 2
  );
  ctx.arcTo(
    pinX.value + moveL / 2,
    pinY.value + moveL,
    pinX.value,
    pinY.value + moveL,
    moveL / 2
  );
  ctx.lineTo(pinX.value, pinY.value);
}

function makeImgWithCanvas() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = props.canvasWidth;
  canvas.height = props.canvasHeight;
  ctx.fillStyle = `rgb(${getRandom(100, 255)},${getRandom(
    100,
    255
  )},${getRandom(100, 255)})`;
  ctx.fillRect(0, 0, props.canvasWidth, props.canvasHeight);
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = `rgb(${getRandom(100, 255)},${getRandom(
      100,
      255
    )},${getRandom(100, 255)})`;
    ctx.strokeStyle = `rgb(${getRandom(100, 255)},${getRandom(
      100,
      255
    )},${getRandom(100, 255)})`;

    if (getRandom(0, 2) > 1) {
      ctx.save();
      ctx.rotate((getRandom(-90, 90) * Math.PI) / 180);
      ctx.fillRect(
        getRandom(-20, canvas.width - 20),
        getRandom(-20, canvas.height - 20),
        getRandom(10, canvas.width / 2 + 10),
        getRandom(10, canvas.height / 2 + 10)
      );
      ctx.restore();
    } else {
      ctx.beginPath();
      const ran = getRandom(-Math.PI, Math.PI);
      ctx.arc(
        getRandom(0, canvas.width),
        getRandom(0, canvas.height),
        getRandom(10, canvas.height / 2 + 10),
        ran,
        ran + Math.PI * 1.5
      );
      ctx.closePath();
      ctx.fill();
    }
  }
  return canvas.toDataURL("image/png");
}

function submit() {
  isSubmting.value = true;

  console.log("pinX.value:", pinX.value);
  console.log("styleWidth.value:", styleWidth.value);
  console.log("sliderBaseSize.value:", sliderBaseSize.value);
  console.log("puzzleBaseSize.value:", puzzleBaseSize.value);
  console.log("props.canvasWidth:", props.canvasWidth);

  const x = Math.abs(
    pinX.value -
      (styleWidth.value - sliderBaseSize.value) +
      (puzzleBaseSize.value - sliderBaseSize.value) *
        ((styleWidth.value - sliderBaseSize.value) /
          (props.canvasWidth - sliderBaseSize.value)) -
      3
  );

  console.log("x:", x);

  if (x < props.range) {
    infoText.value = props.successText;
    infoBoxFail.value = false;
    infoBoxShow.value = true;
    isCanSlide.value = false;
    isSuccess.value = false;
    clearTimeout(timer1.value);
    timer1.value = setTimeout(() => {
      isSubmting.value = false;
      verSuccess.value = true;
      emit("submit", "F", verSuccess.value);
      reset();
    }, 800);
  } else {
    infoText.value = props.failText;
    infoBoxFail.value = true;
    infoBoxShow.value = true;
    isCanSlide.value = false;
    clearTimeout(timer1.value);
    timer1.value = setTimeout(() => {
      isSubmting.value = false;
      reset();
    }, 800);
  }
}

function resetState() {
  infoBoxFail.value = false;
  infoBoxShow.value = false;
  isCanSlide.value = false;
  isSuccess.value = false;
  startWidth.value = sliderBaseSize.value; // 鼠标点下去时父级的width
  startX.value = 0; // 鼠标按下时的X
  newX.value = 0; // 鼠标当前的偏移X
}

function reset() {
  if (isSubmting.value) {
    return;
  }
  resetState();
  init();
}

const emit = defineEmits(["submit"]);
</script>

<style lang="less" scoped>
.vue-puzzle-vcode {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
  opacity: 1;
  pointer-events: none;
  transition: opacity 200ms;

  &.show_ {
    opacity: 1;
    pointer-events: auto;
  }
}

.vue-auth-box_ {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px;
  background: #fff;
  user-select: none;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);

  .auth-body_ {
    position: relative;
    overflow: hidden;
    border-radius: 3px;

    .info-box_ {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 24px;
      line-height: 24px;
      text-align: center;
      overflow: hidden;
      font-size: 13px;
      background-color: #83ce3f;
      opacity: 0;
      transform: translateY(24px);
      transition: all 200ms;
      color: #fff;
      z-index: 10;

      &.show {
        opacity: 0.95;
        transform: translateY(0);
      }

      &.fail {
        background-color: #ce594b;
      }
    }

    .auth-canvas2_ {
      position: absolute;
      top: 0;
      left: 0;
      width: 60px;
      height: 100%;
      z-index: 2;
    }

    .auth-canvas3_ {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      transition: opacity 600ms;
      z-index: 3;

      &.show {
        opacity: 1;
      }
    }

    .flash_ {
      position: absolute;
      top: 0;
      left: 0;
      width: 30px;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.1);
      z-index: 3;

      &.show {
        transition: transform 600ms;
      }
    }

    .reset_ {
      position: absolute;
      top: 2px;
      right: 2px;
      width: 35px;
      height: auto;
      z-index: 12;
      cursor: pointer;
      transition: transform 200ms;
      transform: rotate(0deg);

      &:hover {
        transform: rotate(-90deg);
      }
    }
  }

  .auth-control_ {
    .range-box {
      position: relative;
      width: 100%;
      background-color: #eef1f8;
      margin-top: 20px;
      border-radius: 3px;
      box-shadow: inset -2px -2px 4px rgba(50, 130, 251, 0.1),
        inset 2px 2px 4px rgba(34, 73, 132, 0.2);
      border-radius: 43px;

      .range-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 14px;
        color: #b7bcd1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        text-align: center;
        width: 100%;
        background: -webkit-gradient(
          linear,
          left top,
          right top,
          color-stop(0, #4d4d4d),
          color-stop(0.4, #4d4d4d),
          color-stop(0.5, white),
          color-stop(0.6, #4d4d4d),
          color-stop(1, #4d4d4d)
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        -webkit-animation: animate 1.5s infinite;
      }

      @-webkit-keyframes animate {
        from {
          background-position: -100px;
        }

        to {
          background-position: 100px;
        }
      }

      @keyframes animate {
        from {
          background-position: -100px;
        }

        to {
          background-position: 100px;
        }
      }

      .range-slider {
        position: absolute;
        height: 100%;
        width: 50px;
        border-radius: 3px;

        .range-btn {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          right: 0;
          width: 50px;
          height: 100%;
          background-color: #fff;
          border-radius: 3px;
          cursor: pointer;
          box-shadow: inset 0px -2px 4px rgba(0, 36, 90, 0.2),
            inset 0px 2px 4px rgba(194, 219, 255, 0.8);
          border-radius: 50%;

          & > div {
            width: 0;
            height: 40%;
            transition: all 200ms;

            &:nth-child(2) {
              margin: 0 4px;
            }

            border: solid 1px #6aa0ff;
          }

          &:hover,
          &.isDown {
            & > div:first-child {
              border: solid 4px transparent;
              height: 0;
              border-right-color: #6aa0ff;
            }

            & > div:nth-child(2) {
              border-width: 3px;
              height: 0;
              border-radius: 3px;
              margin: 0 6px;
              border-right-color: #6aa0ff;
            }

            & > div:nth-child(3) {
              border: solid 4px transparent;
              height: 0;
              border-left-color: #6aa0ff;
            }
          }
        }
      }
    }
  }
}

.vue-puzzle-overflow {
  overflow: hidden !important;
}
</style>
