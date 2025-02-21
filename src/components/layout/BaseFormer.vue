<template>
  <div class="former-layout">
    <a-form layout="inline" :model="formState">
      <a-form-item :label="t('equipmentfrom.name')">
        <a-input
          v-model:value="formState.device_name"
          :placeholder="t('equipmentfrom.name')"
        >
        </a-input>
      </a-form-item>
      <a-form-item :label="t('equipmentfrom.sn')">
        <a-input
          v-model:value="formState.serial_number"
          :placeholder="t('equipmentfrom.sn')"
        />
      </a-form-item>
      <a-form-item :label="t('equipmentfrom.time')">
        <a-date-picker
          v-model:value="formState.activation_date"
          :placeholder="t('equipmentfrom.time')"
        />
      </a-form-item>
      <a-form-item :label="t('equipmentfrom.status')">
        <a-radio-group v-model:value="formState.status">
          <a-radio value="0">{{ t("equipmentfrom.offline") }}</a-radio>
          <a-radio value="1">{{ t("equipmentfrom.online") }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <br />
    </a-form>
    <div class="btn-group" style="margin-top: 20px">
      <a-button type="primary" style="margin-right: 20px" @click="searchFn">{{
        t("option.search")
      }}</a-button>
      <a-button type="primary" @click="resetFn">{{
        t("option.reset")
      }}</a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import type { UnwrapRef } from "vue";
const emit = defineEmits(["search", "reset"]);
import { useLocale } from "../../hooks/languageHook";

const { t } = useLocale();

interface FormState {
  userName: string;
  device_name: string;
  serial_number: string;
  status: number;
  ip_address: string;
  firmware_version: string;
  location: string;
  last_online_time: string;
  activation_date: string;
}
const formState: UnwrapRef<FormState> = reactive({
  userName: "",
  device_name: "",
  serial_number: "",
  status: 0,
  ip_address: "",
  firmware_version: "",
  location: "",
  last_online_time: "",
  activation_date: "",
});
const searchFn = () => {
  emit("search", formState);
};
const resetFn = () => {
  formState.device_name = "";
  formState.serial_number = "";
  formState.status = 0;
  formState.ip_address = "";
  formState.firmware_version = "";
  formState.location = "";
  formState.last_online_time = "";
  formState.activation_date = "";
  emit("reset");
};
</script>

<style lang="less" scoped>
.former-layout {
  margin-bottom: 2vh;
}
</style>
