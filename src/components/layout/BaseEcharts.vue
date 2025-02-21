<template>
  <div
    :style="{
      width: width,
      height: height,
    }"
    ref="echartsRef"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch, PropType } from "vue";
import { useEcharts, EChartsCoreOption } from "../../hooks/baseecharts"; // 引入hooks

const props = defineProps({
  options: { type: Object as PropType<EChartsCoreOption>, required: true },
  height: { type: String, default: "100%" },
  width: { type: String, default: "100%" },
  themeColors: { type: Array as PropType<string[]>, default: () => [] },
});

const echartsRef = ref();

const { setOptions, initCharts } = useEcharts(echartsRef, props.options);

// 创建一个计算属性来响应 props.options 的变化
// const watchedOptions = computed(() => {
//     return { ...props.options };
// });

watch(
  () => props.options,
  (nVal) => {
    let targetOptions: EChartsCoreOption = {};
    if (props.themeColors && props.themeColors.length > 0) {
      targetOptions = { ...nVal };
      targetOptions.color = props.themeColors;
    } else {
      targetOptions = { ...nVal };
    }
    setOptions(targetOptions);
  },
  {
    deep: true,
  }
);

onMounted(() => {
  initCharts();
});
</script>
