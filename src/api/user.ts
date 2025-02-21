import request from "../utils/request";

import { ItypeAPI } from "../utils/response";
import { Res } from "../utils/response";

interface DataItem {
    id: string;
    res_name: string;
    status: number;
    address: string;
    res_date:string;
    last_checked:string
}
interface PageI {
    limit?:number,
    offset?:number
}

export const userLogin = (data: { username: string; password: string }): Res<ItypeAPI<any>> => {
    return request.post("/user/login", data);
}
/**
 * 
 * @param 设备接口
 * @returns 
 */
// 获取设备列表
export const getEquipmentList = ():Res<ItypeAPI<any>>=>{
    return request.get("/device/list")
}