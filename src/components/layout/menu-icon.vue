<template>
  <SvgIcon :name="icon" />
</template>

<script lang="ts" setup>
import { onMounted, ref } from "vue";
import SvgIcon from "./svg-icon.vue";
import bus from "../../utils/bus";
const icon = ref("");
onMounted(() => {
  icon.value = props.icon;
  bus.on("icon-check", (e: any) => {
    if (e == props.key) {
      icon.value = props.actIcon;
    } else {
      icon.value = props.icon;
    }
  });
});
const props = defineProps({
  icon: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  actIcon: {
    type: String,
    default: "",
  },
  key: {
    type: String,
    default: "",
  },
});
</script>

<style scoped></style>
