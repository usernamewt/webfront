<template>
  <div class="loading-icon" v-if="props.isLoading">
    <SvgIcon name="loading" class="load-animate" />
    <span
      style="margin-top: 30px; font-size: 30px; font-weight: 600; color: #333"
      >AppFast</span
    >
  </div>
</template>

<script lang="ts" setup>
import SvgIcon from "./svg-icon.vue";
const props = defineProps({
  isLoading: {
    type: Boolean,
  },
});
</script>

<style scoped lang="less">
.loading-icon {
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  .load-animate {
    width: 100px;
    height: 100px;
    animation: rotate 1s linear infinite;
  }
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
