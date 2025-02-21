<template>
  <div class="language-wrapper">
    <a-dropdown :placement="'bottom'" :overlayClassName="'lg-dropdown'">
      <a-button style="border: none">
        <template #icon
          ><svg-icon name="language" style="font-size: 1.5em" /></template
      ></a-button>
      <template #overlay>
        <a-menu>
          <a-menu-item :class="currentLocale === 'zh-CN' ? 'active' : ''">
            <div @click="switchLang('zh-CN')">
              <span class="miniz">CN</span>
              <span>中文</span>
            </div>
          </a-menu-item>
          <a-menu-item :class="currentLocale === 'en-US' ? 'active' : ''">
            <div @click="switchLang('en-US')">
              <span class="miniz">US</span>
              <span>Engish</span>
            </div>
          </a-menu-item>
        </a-menu>
      </template>
    </a-dropdown>
    <!-- <van-switch v-model="checked" @change="switchLang">
      <template #node>
        <div class="icon-wrapper">
          {{ checked ? "EN" : "中" }}
        </div>
      </template>
    </van-switch> -->
  </div>
</template>

<script lang="ts" setup>
import svgIcon from "./svg-icon.vue";

import { useLocale } from "../../hooks/languageHook";

const { changeLocale, currentLocale } = useLocale();

const switchLang = async (val: string) => {
  await changeLocale(val);
};
</script>

<style lang="less" scoped>
@media (max-width: 767px) {
  .language-wrapper {
    right: 10vw !important;
  }
}
.language-wrapper {
  height: 60px;
  align-items: center;
  display: flex;
  position: fixed;
  top: 0;
  right: 5vw;
  align-items: center;
  z-index: 999;
}

.icon-wrapper {
  font-size: 0.5em;
  height: 2em;
  line-height: 2em;
  text-align: center;
  font-weight: bolder;
}

.miniz {
  font-size: 0.6em;
  font-weight: bolder;
  margin-right: 5px;
}
</style>
