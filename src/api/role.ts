import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

// 编辑角色状态
export const editRoleState = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/role/editRoleState", data);
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

// 编辑角色
export const editRole = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/role/editRole", data);
};

// 新增角色
export const addRole = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/role/addRole", data);
};
