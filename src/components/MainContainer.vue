<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import Header from "./layout/Header.vue";
import router from "../router";
import svgIcon from "./layout/svg-icon.vue";
import { useRoute } from "vue-router";
import { useTestStore } from "../store";
const store = useTestStore();
const route = useRoute();
const baseMenu = ref<any[]>([]);
const onCollapse = (collapsed: boolean, type: string) => {
  console.log(collapsed, type);
};

const onBreakpoint = (broken: boolean) => {
  console.log(broken);
};

// 当前选中的menu
const selectedKeys = ref<string[]>(["1"]);

// 当前展开的menu
const openKeys = ref<string[]>([]);

// 处理menu切换
const handelmenuswitch = (item: any) => {
  console.log(item);
  const path =
    baseMenu.value.find((el) => el.meta.key === item.key)?.path || "/404";
  // router.push({ path: "/redirect", query: { path } });
  router.push({ path });
};
onMounted(() => {
  const menu = router
    .getRoutes()
    .filter((el: any) => el.meta.title && el.meta.hidden !== true)
    .sort((a: any, b: any) => a.meta.key - b.meta.key);
  nextTick(() => {
    baseMenu.value = menu;
    console.log(baseMenu.value);
  });
});
watch(
  () => route.fullPath,
  (newval) => {
    let routerk = router.getRoutes().find((el: any) => el.path === newval)?.meta
      ?.key as string;
    selectedKeys.value = [routerk];
  },
  { immediate: true, deep: true }
);
</script>
<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="store.menuCollapsed"
      collapsible
      :trigger="null"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
      width="10vw"
    >
      <div class="logo">
        <span v-show="!store.menuCollapsed">
          <!-- <img
            style="width: 10vw; border-radius: 5px"
            src="../assets/head-day.png"
            alt=""
          /> -->
        </span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="light"
        @click="handelmenuswitch"
      >
        <a-menu-item
          v-for="item in baseMenu"
          :key="item.meta.key"
          class="nav-items-flex"
        >
          <template #icon>
            <svg-icon
              :name="
                selectedKeys[0] !== item.meta.key
                  ? item.meta.checkIcon
                  : item.meta.ckeckedIcon
              "
            ></svg-icon>
          </template>

          <span class="nav-text">{{ item.meta.title }}</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <Header />
      <div
        style="
          box-sizing: border-box;
          padding: 21px;
          height: calc(100vh - 60px);
          border-radius: 10px;
          background-color: #f2f3f5;
          overflow-y: scroll;
        "
      >
        <!-- 子路由 -->
        <router-view v-slot="{ Component }">
          <transition :name="'slide-fade'" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
        <!-- <router-view></router-view> -->
      </div>
      <div
        class="footer"
        :style="`width: calc(100vw - ${store.menuCollapsed ? 0 : 240}px);`"
      >
        <span>爽歪歪集团 | 贼tm牛逼的火锅店</span>
      </div>
    </a-layout>
  </a-layout>
</template>

<style scoped lang="less">
.logo {
  height: 60px;
  background: #fff;
  line-height: 60px;
  font-size: 20px;
  // color: #416aff;
  font-weight: bolder;
  cursor: pointer;
  background-image: -webkit-linear-gradient(right, #237eff, #416aff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.site-layout-sub-header-background {
  background: #fff;
}

.site-layout-background {
  background: #fff;
}

.read-the-docs {
  color: #888;
}
.container-layout {
  // height: calc(100vh - 60px);
  width: 100%;
  .sections {
    padding: 2vh 2vw 0;
    box-sizing: border-box;
  }
}
.main-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
}
:deep .ant-layout {
  background-color: rgb(242, 243, 245);
}
.footer {
  text-align: center;
  position: fixed;
  bottom: 0;
  width: 100vw;
  font-weight: 400;
  font-size: 12px;
  color: #818ea7;
  right: 0;
  background-color: transparent;
  padding: 16px 50px;
}

.menu-i {
  height: 100%;
  display: flex;
  align-items: center;
}
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.4s ease;
  // transition: opacity 0.4s ease, transform 0.4s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  // transform: translateX(50%);
}

.slide-fade-leave-to {
  opacity: 0;
  // transform: translateX(-50%);
}
</style>
