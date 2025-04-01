import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { getUserMenu } from "../api/user";
import { removeStorage, setStorage } from "../utils/storage";
import { nextTick } from "vue";
import { useTestStore } from "../store";
const baseStore = useTestStore();
const modules = import.meta.glob("../components/**/**.vue");

// tenantList  deviceRegist  targetManage  acceryManager
// 定义静态路由
const routes: Array<RouteRecordRaw> = [
  // 主页面路由

  {
    path: "/Layout",
    name: "Layout",
    component: () => import("../components/MainContainer.vue"),
    children: [],
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
export async function dynamicRouter() {
  // 覆盖默认的Layout路由
  await router.addRoute({
    path: "/Layout",
    name: "Layout",
    component: () => import("../components/MainContainer.vue"),
    children: [],
  });
  let routerInfo = {} as any;
  let res = await getUserMenu();
  if (res.code == 0) {
    routerInfo = res.data as any;
    setStorage("routerInfo", routerInfo);
  } else {
    removeStorage("routerInfo");
    return;
  }
  let routers = routerInfo.permissions;
  routers = routers.filter((row: any) => row.is_hidden === 0);

  baseStore.sPermession = routers;
  let dynamicRoutes = getAllRoute(routers) as any[];
  let baseRoute = dynamicRoutes.find((el) => el.component).component;
  dynamicRoutes.forEach((row: any) => {
    const items = seriesTree(row);
    console.log(items);

    if (items.meta.hidden && items.meta.component)
      router.addRoute("Layout", items);
  });
  router.addRoute({
    path: "/",
    name: "Home",
    redirect: baseRoute,
  });
}

const getAllRoute = (items: any) => {
  let rout = items.flatMap(({ children = [], ...node }) => [
    node,
    ...getAllRoute(children),
  ]);
  return rout;
};

const seriesTree = (item: any) => {
  let name = (item.component || "/").split("/")[1];
  return {
    path: item.component,
    name: name,
    component: modules[`${item.path}`],
    meta: {
      title: item.title,
      key: item.sort,
      checkIcon: item.checkIcon,
      ckeckedIcon: item.ckeckedIcon,
      hidden: item.is_hidden ? false : true,
      children: item.children,
      component: item.component,
    },
  };
};

router.beforeEach(async (to, from, next) => {
  baseStore.currentRouter = to.fullPath;
  if (to.path.includes("login")) {
    return next();
  }
  // if(from.path.includes("login")){
  //   retru
  // }
  await dynamicRouter();
  nextTick(() => {
    next();
  });
});

router.afterEach((to, from) => {});

export default router;
