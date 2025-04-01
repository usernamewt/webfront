<template>
  <div class="header">
    <div
      class="title"
      @click="() => (baseStore.menuCollapsed = !baseStore.menuCollapsed)"
    >
      <menu-unfold-outlined
        v-if="!baseStore.menuCollapsed"
        class="collapse"
        style="margin-right: 10px"
      />
      <menu-fold-outlined class="collapse" v-else />

      <span
        ><LeftOutlined
          style="margin-right: 10px; cursor: pointer"
          v-if="!route.meta.hidden && route.path !== '/manager'"
          @click="router.push('/manager')"
        />{{ header }}</span
      >
    </div>
    <div style="display: flex; align-items: center">
      <!-- <span>欢迎用户：{{ getStorage("userPohone") }}</span
      ><a-divider type="vertical" />
      <a @click="logout" href="javascript:;" class="menu-i"
        ><span>注销登录</span></a
      > -->
      <a-dropdown>
        <a-upload
          v-model:file-list="fileList"
          action="http://47.120.49.37:8082/api/upload"
          @change="handleChange"
          :headers="{ 'X-Requested-With': null }"
          crossOrigin="anonymous"
          :showUploadList="false"
        >
          <div
            class="image-container"
            style="position: relative; overflow: hidden"
          >
            <a-avatar
              :src="avurl"
              style="cursor: pointer"
              class="avater-main"
            />
            <div class="slide-up-text">
              <span>更改头像</span>
            </div>
          </div>
        </a-upload>
        <template #overlay>
          <a-menu>
            <a-menu-item>
              <a href="javascript:;"
                >欢迎：{{ getStorage("routerInfo")?.user.nickname || "" }}</a
              >
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">个人中心</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" @click="logout">注销登录</a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, onMounted, nextTick } from "vue";
import { useTestStore } from "../../store";
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  LeftOutlined,
} from "@ant-design/icons-vue";
import { userLogout, updateAvatar } from "../../api/user";
import router from "../../router";
import { useRoute } from "vue-router";
import { getStorage, removeStorage, setStorage } from "../../utils/storage";
import { message, UploadChangeParam } from "ant-design-vue";
import { removeToken } from "../../utils/auth";
const route = useRoute();
const baseStore = useTestStore();
const header = ref("设备列表");
const host = ref("http://47.120.49.37:8082");
const avurl = ref(
  `${
    getStorage("routerInfo").user.avatar.includes("http")
      ? getStorage("routerInfo").user.avatar
      : `${host.value}${getStorage("routerInfo").user.avatar}`
  }`
);
onMounted(() => {
  host.value = "http://47.120.49.37:8082";
});
watch(
  route,
  (nroute: any) => {
    header.value = nroute?.meta?.title || "404";
  },
  { immediate: true, deep: true }
);

const fileList = ref([]);
const handleChange = async (info: UploadChangeParam) => {
  const status = info.file.status;
  if (status !== "uploading") {
  }
  if (status === "done") {
    message.success(`${info.file.name}  上传成功`);
    avurl.value = info.fileList[0].response.url;
    fileList.value = [];
    // 更新用户头像
    updateAvatar({
      id: getStorage("routerInfo").user.id,
      avatar: info.fileList[0].response.url,
    }).then((res) => {
      if (res.code === 0) {
        // setStorage("routerInfo",res.data)
        let routerInfo = getStorage("routerInfo");
        routerInfo.user.avatar = info.fileList[0].response.url;
        setStorage("routerInfo", routerInfo);
        message.success(res.msg);
      } else {
        message.error(res.msg);
      }
    });
  } else if (status === "error") {
    message.error(`${info.file.name}  上传失败`);
  }
};
const logout = () => {
  userLogout().then((res: any) => {
    if (res.code === 0) {
      setStorage("userInfo", null);
      setStorage("token", null);
      setStorage("uid", null);
      removeToken();
      removeStorage("routerInfo");
      nextTick(() => {
        router.push({
          path: "/login",
          query: { redirect: baseStore.currentRouter },
        });
      });
    } else {
      message.error(res.msg);
    }
  });
};
</script>

<style lang="less" scoped>
.collapse {
  z-index: 10;
  color: #7c818d;
  transition: all 0.2s, background 0s;
  margin-right: 10px;
}
.menu-i {
  width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &:hover {
    color: #1890ff;
  }
}
.header {
  width: 100%;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1vh 21px;
  flex-direction: row;
  flex-wrap: nowrap;
  background-color: #fff;

  .title {
    cursor: pointer;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    font-weight: 400;
    font-size: 16px;
    color: #1c1e20;
  }
  :deep.van-switch__node {
    line-height: 1em;
    text-align: center;
  }
  .icon-wrapper {
    font-size: 0.5em;
    height: 2em;
    line-height: 2em;
    text-align: center;
    font-weight: bolder;
  }
  .logout {
    cursor: pointer;
    &:hover {
      color: #1890ff;
    }
  }
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.slide-up-text {
  cursor: pointer;
  position: absolute;
  bottom: -20px;
  left: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  font-size: 0.5rem;
}

.image-container:hover .slide-up-text {
  bottom: 0;
}
</style>
