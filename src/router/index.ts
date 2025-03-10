import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { getUserMenu } from "../api/user";
import { getStorage, removeStorage, setStorage } from "../utils/storage";
import { nextTick } from "vue";

// tenantList  deviceRegist  targetManage  acceryManager
// 定义静态路由
const routes: Array<RouteRecordRaw> = [
  // 主页面路由
  {
    path: "/",
    name: "Home",
    redirect: "/chat",
  },
  {
    path: "/Layout",
    name: "Layout",
    component: () => import("../components/MainContainer.vue"),
    children: [
      {
        path: "/chat",
        name: "chat",
        component: () => import("../components/chat/index.vue"),
        meta: {
          title: "研讨中心",
          key: "1",
          checkIcon: "icon-device-check",
          ckeckedIcon: "icon-device-checked",
          hidden: false,
        },
      },
      {
        path: "/user",
        name: "user",
        component: () => import("../components/user/index.vue"),
        meta: {
          title: "用户管理",
          key: "2",
          checkIcon: "icon-device-check",
          ckeckedIcon: "icon-device-checked",
          hidden: false,
        },
      },
      {
        path: "/role",
        name: "role",
        component: () => import("../components/chat/index.vue"),
        meta: {
          title: "角色管理",
          key: "3",
          checkIcon: "icon-device-check",
          ckeckedIcon: "icon-device-checked",
          hidden: false,
        },
      },
    ],
  },
  // 登陆路由
  {
    path: "/login",
    component: () => import("../components/userProfile/Login.vue"),
  },
  // 重定向路由
  {
    path: "/redirect",
    component: () => import("../components/userProfile/redirect.vue"),
  },
  // 404路由
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../components/404.vue"),
  },
  // 500路由
  {
    path: "/error",
    component: () => import("../components/500.vue"),
  },
  // 添加更多的路由记录...
];

// 创建router实例
const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 动态路由添加或删除
export async function dynamicRouter() {}

router.beforeEach((to, from, next) => {
  let routerInfo = getStorage("routerInfo");
  if (to.path.includes("login")) {
    return next();
  }
  nextTick(async () => {
    if (routerInfo && routerInfo.user) {
      console.log("有缓存路由");
      next();
    } else {
      console.log("无缓存路由");
      let res = await getUserMenu();
      if (res.code == 0) {
        let routerInfo = res.data;
        setStorage("routerInfo", routerInfo);
        next();
      } else {
        removeStorage("routerInfo");
        next("/login");
      }
    }
  });
});

router.afterEach((to, from) => {});

export default router;
