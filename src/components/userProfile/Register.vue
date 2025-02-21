<template>
  <div class="login-container">
    <a-form
      :model="formState"
      name="basic"
      layout="horizontal"
      :label-col="{ span: 8, style: { textAlign: 'start' } }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      class="login-form"
      ref="loginFormRef"
    >
      <h2 style="text-align: center; margin-bottom: 2vw">
        {{ t("login.title") }}
      </h2>
      <a-form-item
        :label="t('login.username')"
        name="username"
        :rules="[{ required: true, message: t('login.loginPlaceholder') }]"
      >
        <a-input v-model:value="formState.username" />
      </a-form-item>

      <a-form-item
        :label="t('login.password')"
        name="password"
        :rules="[{ required: true, message: t('login.passwordPlaceholder') }]"
      >
        <a-input-password v-model:value="formState.password" />
      </a-form-item>
      <a-form-item
        :label="t('login.code')"
        name="code"
        :rules="[{ required: true, message: t('login.codePlaceholder') }]"
      >
        <a-input-search v-model:value="formState.code">
          <template #enterButton>
            <a-button
              type="primary"
              @click="getCodeReq"
              :loading="getCodeLoading"
              >{{ !getCodeLoading ? t("login.getCode") : time + "s" }}</a-button
            >
          </template>
        </a-input-search>
        <!-- <a-button type="primary">获取验证码</a-button> -->
      </a-form-item>

      <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
        <a-button @click="onFinish" type="primary" html-type="submit">{{
          t("login.login")
        }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useLocale } from "../../hooks/languageHook";
import { setStorage } from "../../utils/storage";
import { setToken } from "../../utils/auth";
import router from "../../router";
const { t } = useLocale();
const loginFormRef = ref();
const timer = ref();
const getCodeLoading = ref(false);
const time = ref(0);
interface FormState {
  username: string;
  password: string;
  code: string;
}

const formState = reactive<FormState>({
  username: "",
  password: "",
  code: "",
});

const getCodeReq = () => {
  getCodeLoading.value = true;
  // 调用短信验证码接口

  // 倒计时60s,页面显示倒计时时间,结束后loading消失
  time.value = 60;
  timer.value = setInterval(() => {
    time.value--;
    if (time.value <= 0) {
      clearInterval(timer.value);
      getCodeLoading.value = false;
    }
  }, 1000);
};

const onFinish = () => {
  loginFormRef!
    .value!.validate()
    .then(() => {
      setStorage("userInfo", { ...formState });
      setToken("123456");
      router.push("/");
    })
    .catch(() => {});
};
</script>

<style lang="less" scoped>
@media (min-width: 992px) and (max-width: 1199px) {
  .login-container {
    .login-form {
      width: 60vw !important;
    }
  }
}
@media (min-width: 768px) and (max-width: 991px) {
  .login-container {
    .login-form {
      width: 80vw !important;
    }
  }
}
@media (max-width: 767px) {
  .login-container {
    .login-form {
      width: 90vw !important;
    }
  }
}
.login-container {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-image: url("../../assets/loginbg.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  justify-content: center;
  align-items: start;
  .languages {
    position: absolute;
    top: 20px;
    right: 20px;
  }
  .login-form {
    padding: 2vw 2vw;
    margin: 0 auto;
    overflow: hidden;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    width: 40vw;
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
</style>
