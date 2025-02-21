
import { defineStore } from 'pinia'
// import {getUserInfo} from '../api/user'

export const useTestStore = defineStore('BaseStore', {
    state:()=>{
        return {
            // UID用户id
            uid:'',
            // 菜单类型
            menuType:'equipmentlist',
            // 设备ID
            deviceId:'',
            // 设备位置
            deviceLocation:'',
            targetId:'',
            urlId:'',
            // 设备名称
            device_name:'',
            // 当前控制url
            currentUrl:{
                sourceId:'',
                urllist:[]
            },
            // 是否显示url选择
            isShowUrl:false,
            header:'设备列表',
            // sn
            sn:'',
            // 全局loading
            boxLoading:false,
            currentRouter:'/',
            userRole:0,
            menuCollapsed:false
        }
    },
    
    actions:{
        setUid(){
            // getUserInfo().then((res:any)=>{
            //     this.uid = res.data.id
            // })
        }
    }
})
