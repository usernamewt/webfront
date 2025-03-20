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
// 修改用户状态
export const updateUserStatus = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/updateState", data);
};
// 删除用户
export const deleteUser = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/delete", data);
};
// 新增用户
export const addUser = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/user/add", data);
};

// 获取所有权限列表
export const getAllPermission = (): Res<ItypeAPI<any>> => {
  return request.get("/permission/all");
};

// 查询角色权限
export const getRolePermission = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/permission/queryByRole", data);
};

// 新增权限
export const addPermission = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/permission/add", data);
};

// 删除权限
export const deletePermission = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/permission/delete", data);
};

// // 查询用户权限
// export const getUserPermission = (data: any): Res<ItypeAPI<any>> => {
//   return request.post("/permission/getUserPermission", data);
// }
