<template>
  <div class="login-container">
    <!-- <div class="img-container">
      <span class="logo">LOGO</span>
      <h1>APP-FAST 网迅达</h1>
      <span>网迅达简介</span>
    </div> -->

    <div class="form-container">
      <div class="title">
        <svgIcon name="burge" style="font-size: 2.5rem" /><span
          >爽爽吃后台</span
        >
      </div>
      <span class="title little"
        >Shuang Eat 是无为市最具影响力的 Web 设计规范</span
      >
      <a-tabs centered>
        <a-tab-pane key="1">
          <template #tab>
            <span>
              <apple-outlined />
              账号密码登录
            </span>
          </template>
          <a-form
            :model="formPassword"
            name="basic"
            layout="horizontal"
            autocomplete="off"
            class="login-form"
            ref="loginFormRef"
          >
            <a-form-item
              name="username"
              class="input-class"
              :rules="[
                {
                  required: true,
                  message: '请输入用户名',
                  type: 'string',
                },
              ]"
            >
              <a-input
                size="large"
                v-model:value="formPassword.username"
                placeholder="请输入用户名"
              />
            </a-form-item>
            <a-form-item
              name="password"
              class="input-class"
              :rules="[{ required: true, message: '请输入密码' }]"
            >
              <div style="display: flex; flex-wrap: nowrap; flex: 4 1">
                <a-input
                  size="large"
                  v-model:value="formPassword.password"
                  placeholder="请输入密码"
                  ref="codeRef"
                />
              </div>
            </a-form-item>
          </a-form>
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #tab>
            <span>
              <android-outlined />
              短信验证码登录
            </span>
          </template>
          <a-form
            :model="formPhone"
            name="basic"
            layout="horizontal"
            autocomplete="off"
            class="login-form"
            ref="loginFormRef"
          >
            <a-form-item
              name="phone"
              class="input-class"
              :rules="[
                {
                  required: true,
                  message: '请输入正确的手机号',
                  type: 'string',
                  pattern: /^1[3456789]\d{9}$/,
                },
              ]"
            >
              <a-input
                size="large"
                v-model:value="formPhone.mobile"
                placeholder="请输入手机号"
              />
            </a-form-item>
            <a-form-item
              name="code"
              class="input-class"
              :rules="[{ required: true, message: t('login.codePlaceholder') }]"
            >
              <div style="display: flex; flex-wrap: nowrap; flex: 4 1">
                <a-input
                  size="large"
                  style="margin-right: 10px"
                  v-model:value="formPhone.code"
                  placeholder="请输入验证码"
                  ref="codeRef"
                />
                <a-button
                  size="large"
                  @click="getCodeReq"
                  :loading="getCodeLoading"
                  class="input-goup-btn-class"
                  >{{
                    !getCodeLoading ? t("login.getCode") : "" + time + "s"
                  }}</a-button
                >
              </div>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>

      <a-button
        class="login-button"
        @click="onFinish"
        type="primary"
        html-type="submit"
        size="large"
        >登录</a-button
      >
    </div>
    <div class="footer"><span>安徽爽了网络科技有限公司</span></div>
    <verifyCode
      :show="isVerificationVisible"
      @submit="handleVerificationSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, reactive, ref } from "vue";
import { useLocale } from "../../hooks/languageHook";
import { setStorage } from "../../utils/storage";
import { getToken, setToken } from "../../utils/auth";
import { getUserMenu, userLogin } from "../../api/user";
import verifyCode from "../common/verifyCode.vue";
import svgIcon from "../layout/svg-icon.vue";
import { message } from "ant-design-vue";
import { useTestStore } from "../../store";
import { useRouter } from "vue-router";
const router = useRouter();
// import { setupRoutes } from "../../router/dynamic";
const isVerificationVisible = ref(false);
const { t } = useLocale();
const loginFormRef = ref();
// const timer = ref();
const getCodeLoading = ref(false);
const time = ref(0);
const baseStore = useTestStore();
const codeRef = ref();
const handleVerificationSubmit = () => {
  isVerificationVisible.value = false;
};
interface FormPassword {
  username: string;
  password: string;
}
interface FormPhone {
  mobile: string;
  code: string;
}

onMounted(() => {});

const formPassword = reactive<FormPassword>({
  username: "user",
  password: "user123",
});
const formPhone = reactive<FormPhone>({
  mobile: "",
  code: "",
});

const getCodeReq = () => {
  loginFormRef!.value!.validate("phone").then(() => {
    isVerificationVisible.value = true;
  });
};

const onFinish = () => {
  loginFormRef!
    .value!.validate()
    .then(() => {
      userLogin(formPassword).then((res: any) => {
        if (res.code == 0) {
          setToken(res.data);
          console.log(getToken());

          getUserMenu().then((res) => {
            setStorage("routerInfo", res.data);
            nextTick(() => {
              router.push("/chat");
            });
          });
        } else {
          message.error(res.msg);
        }
      });
    })
    .catch(() => {});
};
</script>

<style lang="less" scoped>
.login-container {
  background-color: #fff;
  background-image: url("../../assets/bgcolor.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: start;
  overflow: hidden;
  .text-container {
    position: fixed;
    top: 18vh;
    left: 15vw;
    display: flex;
    flex-direction: column;
    justify-content: center;
    span {
      font-weight: bold;
      font-size: 66px;
      color: #0154c8;
      display: inline-block;
      margin-bottom: 20px;
    }
    .desc {
      font-weight: 400;
      font-size: 28px;
      color: #0e3873;
    }
  }
  .img-container {
    width: 550px;
    font-weight: bolder;
    height: 100vh;
    background: linear-gradient(163.85deg, #1d2129 0%, #00308f 100%);
    color: #fff;
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    justify-content: center;
    .logo {
      position: absolute;
      top: 20px;
      left: 20px;
    }
  }
  .login-button {
    margin-top: 20px;
    width: 328px;
    min-width: 280px;
    max-width: 75vw;
  }
  .form-container {
    margin-top: 12vh;
    .title {
      display: flex;
      justify-content: center;
      align-items: center;
      font-weight: bold;
      font-size: 33px;
      color: #1c1e20;
      margin-bottom: 10px;
      span {
        margin-left: 20px;
      }
      &.little {
        font-size: 14px;
        font-weight: 400;
        color: #999;
        margin-bottom: 48px;
      }
    }
    .login-form {
      margin: 0 auto;
      overflow: hidden;
      width: 328px;
      min-width: 280px;
      max-width: 75vw;
      // box-shadow: 7px 6px 40px 0px rgba(188, 211, 255, 0.4);
      // width: 30vw;
      .input-group-class {
        display: flex;
        flex-wrap: nowrap;
      }
      .input-class {
        width: 100%;
      }
      .title-container {
        text-align: center;
        margin-bottom: 2vw;
        .title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #333;
        }
      }
    }
  }

  .languages {
    position: absolute;
    top: 20px;
    right: 20px;
  }
}
.footer {
  text-align: center;
  position: fixed;
  bottom: 0;
  width: 100vw;
  font-weight: 400;
  font-size: 12px;
  color: #818ea7;
  left: 0;
  background-color: transparent;
  padding: 24px 50px;
}

:deep(.slick-slide) {
  text-align: center;
  height: 160px;
  line-height: 160px;
  background: #364d79;
  overflow: hidden;
}

:deep(.slick-arrow.custom-slick-arrow) {
  width: 25px;
  height: 25px;
  font-size: 25px;
  color: #fff;
  background-color: rgba(31, 45, 61, 0.11);
  transition: ease all 0.3s;
  opacity: 0.3;
  z-index: 1;
}
:deep(.slick-arrow.custom-slick-arrow:before) {
  display: none;
}
:deep(.slick-arrow.custom-slick-arrow:hover) {
  color: #fff;
  opacity: 0.5;
}

:deep(.slick-slide h3) {
  color: #fff;
}
</style>
