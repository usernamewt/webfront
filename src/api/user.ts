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

// 退出登录
export const userLogout = (): Res<ItypeAPI<any>> => {
    return request.get("/user/logout");
}

// 获取用户菜单鉴权
export const getUserMenu = (): Res<ItypeAPI<any>> => {
    return request.get("/user/getAuth");
}



