import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

// 获取分类
export const getClassifitionList = (): Res<ItypeAPI<any>> => {
  return request.post("/classification/getAll");
};

// 添加分类
export const addClassifition = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/classification/add", data);
};

// 删除分类
export const deleteClassifition = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/classification/delete", data);
};

// 修改分类
export const updateClassifition = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/classification/update", data);
};
