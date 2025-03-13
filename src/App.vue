<script setup lang="ts">
// 暂时不显示语言切换
// import language from "./components/layout/language.vue";
import { onMounted, ref } from "vue";
import zhCN from "ant-design-vue/es/locale/zh_CN";

import dayjs from "dayjs";

import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");
import bus from "./utils/bus";
const isLoading = ref(false);

onMounted(() => {
  bus.on("isLoading", (val) => {
    isLoading.value = val as boolean;
  });
});
</script>

<template>
  <a-config-provider :locale="zhCN">
    <!-- <language /> -->
    <Loading :isLoading="isLoading"></Loading>
    <router-view v-slot="{ Component }">
      <transition :name="'fade'" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </a-config-provider>
</template>

<style scoped lang="less">
.languages {
  position: fixed;
  top: 1vh;
  right: 4vw;
  z-index: 999;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
  // transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from {
  opacity: 0;
  // transform: translateX(50%);
}

.fade-leave-to {
  opacity: 0;
  // transform: translateX(-50%);
}
</style>
