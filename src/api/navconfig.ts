import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

// 获取所有轮播图
export const getNav = (): Res<ItypeAPI<any>> => {
  return request.post("/nav/getAll");
};

// 编辑轮播图
export const editNav = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/nav/edit", data);
};

// 新增轮播图
export const addNav = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/nav/add", data);
};

// 删除轮播图
export const delNav = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/nav/delete", data);
};
