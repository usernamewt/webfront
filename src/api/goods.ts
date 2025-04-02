import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

// 获取商品列表
export const getGoodsList = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/goods/getAll", data);
};

// 新增商品
export const addGoods = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/goods/add", data);
};

// 编辑商品
export const editGoods = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/goods/edit", data);
};

// 删除商品
export const deleteGoods = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/goods/delete", data);
};

// 上/下架商品
export const changeGoodsStatus = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/goods/changeStatus", data);
};
