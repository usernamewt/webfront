import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

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
// 修改权限
export const updatePermission = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/permission/update", data);
};

// 删除权限
export const delPermission = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/permission/delete", data);
};

// // 查询用户权限
// export const getUserPermission = (data: any): Res<ItypeAPI<any>> => {
//   return request.post("/permission/getUserPermission", data);
// }
