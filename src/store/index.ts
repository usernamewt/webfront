import { defineStore } from "pinia";
import io from "socket.io-client";
import { getToken } from "../utils/auth";
import { getStorage } from "../utils/storage";
import { message } from "ant-design-vue";
// import {getUserInfo} from '../api/user'

export const useTestStore = defineStore("BaseStore", {
  state: () => {
    return {
      // UID用户id
      uid: "",
      // 菜单类型
      menuType: "equipmentlist",
      // 设备ID
      deviceId: "",
      // 设备位置
      deviceLocation: "",
      targetId: "",
      urlId: "",
      // 设备名称
      device_name: "",
      // 当前控制url
      currentUrl: {
        sourceId: "",
        urllist: [],
      },
      // 是否显示url选择
      isShowUrl: false,
      header: "设备列表",
      // sn
      sn: "",
      // 全局loading
      boxLoading: false,
      currentRouter: "/",
      userRole: 0,
      menuCollapsed: false,
      socket: {} as any,
      socketMsg: {} as any,
    };
  },

  actions: {
    setUid() {
      // getUserInfo().then((res:any)=>{
      //     this.uid = res.data.id
      // })
    },
    initSocket() {
      let token = getToken();
      this.socket = io(`ws://47.120.49.37:8082?atoy=${token}`);
      this.socket.emit("authenticate", {
        userId: getStorage("routerInfo").user.id,
        nickname: getStorage("routerInfo").user.nickname,
      });
      this.socket.on("connection", () => {
        console.log("连接成功");
      });
      this.socket.on("disconnect", () => {
        console.log("断开连接");
      });
    },
    setSocketMessage() {
      this.socket.on("new_message", (data: any) => {
        this.socketMsg = data;
      });
    },
    sendSocketMessage(data: any) {
      this.socket.emit(data.type, data.val);
    },
    closeSocket() {
      this.socket.close();
    },
  },
});
