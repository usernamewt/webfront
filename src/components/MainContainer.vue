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
  router.push({ path: "/redirect", query: { path } });
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
    if (newval.includes("/client")) {
      selectedKeys.value = ["1"];
    } else if (newval.includes("/device")) {
      selectedKeys.value = ["2"];
      openKeys.value = ["sub1"];
    } else if (newval.includes("/policy")) {
      selectedKeys.value = ["4"];
      openKeys.value = ["sub1"];
    } else if (newval.includes("/target")) {
      selectedKeys.value = ["3"];
      openKeys.value = ["sub1"];
    } else {
      let routerk = router.getRoutes().find((el: any) => el.path === newval)
        ?.meta?.key as string;
      selectedKeys.value = [routerk];
    }
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
      width="240"
    >
      <div class="logo">
        <span v-show="!store.menuCollapsed">吃爽了就爽爽吃</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        v-model:openKeys="openKeys"
        theme="light"
        mode="inline"
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
          background: #f3f7fd;
        "
      >
        <!-- 子路由 -->
        <router-view></router-view>
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
  padding-left: 28px;
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
</style>
