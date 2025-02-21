<template>
  <span
    class="num"
    :class="{ cursor: isClickable ? 'pointer' : 'default' }"
    @click="handleClick"
  >
    {{ currentValue }}
  </span>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

// 定义 props 类型
const props = defineProps<{
  // 目标值
  target: number;
  // 动画时长，默认 3000 毫秒
  duration?: number;
  // 字体颜色，默认值 'black'
  fontColor?: string;
  // 字体大小，默认值 '2rem'
  fontSize?: string;
  // 是否允许点击重新开始动画，默认为 false
  clickable?: boolean;
}>();

// 响应式变量 currentValue
const currentValue = ref<number>(0);

// 用来控制动画是否正在进行的变量
let intervalId: ReturnType<typeof setInterval> | null = null;

// 控制是否可以点击
const isClickable = ref<boolean>(props.clickable ?? true);

// 动画更新函数
const animateCounter = () => {
  const targetValue = props.target;
  const duration = props.duration ?? 3000;

  // 计算每次更新的增量，确保增量不会过小
  let step = targetValue / (duration / 10);
  if (step < 1) step = 1; // 确保最小步长为1

  // 清除之前的动画
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    currentValue.value += step;

    // 保证 currentValue 永远是整数
    currentValue.value = Math.floor(currentValue.value); // 使用 Math.floor 确保值是整数

    // 如果 currentValue 超过了 targetValue，直接设为 targetValue
    if (currentValue.value >= targetValue) {
      currentValue.value = targetValue;
      clearInterval(intervalId!);
    }
  }, 10); // 每 10 毫秒更新一次
};

// 处理点击事件，重新开始动画
const handleClick = () => {
  if (isClickable.value) {
    currentValue.value = 0;
    animateCounter();
  }
};

// 在组件挂载时启动动画
onMounted(() => {
  animateCounter();
});

// 在组件卸载前清除定时器
onBeforeUnmount(() => {
  if (intervalId) {
    clearInterval(intervalId);
  }
});

// 在组件的 target 更新时重新启动动画
watch(
  () => props.target,
  () => {
    currentValue.value = 0;
    animateCounter();
  },
  { immediate: true }
);
</script>
<style scoped>
.counter {
  font-family: Arial, sans-serif;
}

.num {
  cursor: pointer;
  font-size: 26px !important;
  font-weight: 600;
  color: #fff !important;
  line-height: 33px;
}

.num.clickable {
  cursor: pointer;
}
</style>
