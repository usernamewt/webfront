import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

interface DataItem {
  id: string;
  res_name: string;
  status: number;
  address: string;
  res_date: string;
  last_checked: string;
}
interface PageI {
  limit?: number;
  offset?: number;
}

export const userLogin = (data: {
  username: string;
  password: string;
}): Res<ItypeAPI<any>> => {
  return request.post("/user/login", data);
};

// 文件上传统一接口
export const uploadFile = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/api/upload", data);
};

// 退出登录
export const userLogout = (): Res<ItypeAPI<any>> => {
  return request.get("/user/logout");
};

// 获取用户菜单鉴权
export const getUserMenu = (): Res<ItypeAPI<any>> => {
  return request.get("/user/getAuth");
};

// 获取用户聊天列表
export const getUserChatList = (): Res<ItypeAPI<any[]>> => {
  return request.get("/user/getChatList");
};

// 获取用户chat
export const getUserChat = (id: any): Res<ItypeAPI<any[]>> => {
  return request.post("/chat/chatrecord", { id: id });
};

// 获取所有用户
export const getAllUser = (data: any): Res<ItypeAPI<any[]>> => {
  return request.post("/user/getByPage", data);
};

// 获取所有角色
export const getAllRole = (): Res<ItypeAPI<any[]>> => {
  return request.post("/role/getRoleList", {
    currentPage: 1,
    pageSize: 999,
  });
};

// 分页获取角色
export const getRoleByPage = (data: any): Res<ItypeAPI<any[]>> => {
  return request.post("/role/getRoleList", data);
};
// 修改用户
export const updateUser = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/update", data);
};
// 修改密码
export const updatePassword = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/updatePassword", data);
};
// 修改头像
export const updateAvatar = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/updateAvatar", data);
};
// 删除用户
export const deleteUser = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/delete", data);
};
// 新增用户
export const addUser = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/add", data);
};
