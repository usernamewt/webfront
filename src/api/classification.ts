import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

// 获取分类
export const getClassifitionList = (data: any): Res<ItypeAPI<any>> => {
  return request.post("/classification/getAll", data);
};
