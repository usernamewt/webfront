import axios from "axios";
import router from "../router";
import { getToken, removeToken } from "./auth";
import { message } from "ant-design-vue";
import { setStorage } from "./storage";
import { useTestStore } from "../store";
const whiteList = ["/user/send_sms", "/user/login", "/user/logout"];

// 创建axios实例
const request = axios.create({
  // baseURL: '/api',// 所有的请求地址前缀部分
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 80000, // 请求超时时间(毫秒)
  withCredentials: true, // 异步请求携带cookie
  // headers: {
  // 设置后端需要的传参类型
  // 'Content-Type': 'application/json',
  // 'token': x-auth-token',//一开始就要token
  // 'X-Requested-With': 'XMLHttpRequest',
  // },
});

// request拦截器
request.interceptors.request.use(
  (config) => {
    const baseStore = useTestStore();
    let token = getToken();
    console.log(token);
    console.log(router.currentRoute.value);
    if (whiteList.includes(config.url!)) {
      console.log("in white list");
      config.headers["Authorization"] = undefined;
      return config;
    }
    if (token) {
      console.log(token);
      // 添加请求头
      // config.headers["Authorization"]="Bearer "+ token
      config.headers["Authorization"] = token;
    } else {
      config.headers["Authorization"] = "";
      if (
        router.currentRoute.value.path !== "/login" &&
        router.currentRoute.value.path !== "/user/send_sms"
      ) {
        setStorage("uid", null);
        setStorage("token", null);
        message.error("token失效，请重新登录");
        router.push({
          path: "/login",
          query: { redirect: baseStore.currentRouter },
        });
      }
    }

    return config;
  },
  (error) => {
    // 对请求错误做些什么
    Promise.reject(error);
  }
);

// response 拦截器
request.interceptors.response.use(
  (response) => {
    const baseStore = useTestStore();
    // 对响应数据做点什么
    if (response.data.code === 401) {
      message.error("token失效，请重新登录");
      // token失效，跳转到登录页面
      localStorage.removeItem("Admin-Token");
      removeToken();
      router.push({
        path: "/login",
        query: { redirect: baseStore.currentRouter },
      });
    }
    return response.data;
  },
  (error) => {
    const baseStore = useTestStore();
    // 401 token失效
    console.log(error.response);
    if (error.response.status === 401) {
      setStorage("uid", null);
      setStorage("token", null);
      message.error("token失效，请重新登录");
      removeToken();
      router.push({
        path: "/login",
        query: { redirect: baseStore.currentRouter },
      });
    }

    if (error.response.status === 500) {
      message.error("服务器错误，请稍后再试");
      router.push("/error");
    }
    return Promise.reject(error);
  }
);
export default request;
