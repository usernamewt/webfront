<template>
  <img
    ref="imgRef"
    :src="effectiveSrc"
    :alt="alt"
    :class="['w-image', className]"
    :style="style"
    @error="handleError"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "",
  },
  lazy: {
    type: Boolean,
    default: true,
  },
  className: {
    type: String,
    default: "",
  },
  errorSrc: {
    type: String,
    default: "/default-error-image.png",
  },
  style: {
    type: Object,
    default: () => ({}),
  },
});

const effectiveSrc = ref("");
const imgRef = ref(null);
const isError = ref(false);
let observer = null;

// 初始化加载逻辑
const loadImage = () => {
  if (isError.value) return;
  effectiveSrc.value = props.src;
};

// 错误处理
const handleError = () => {
  if (!isError.value && props.errorSrc) {
    isError.value = true;
    effectiveSrc.value = props.errorSrc;
  }
};

// 懒加载处理
const initLazyLoad = () => {
  if (typeof IntersectionObserver === "undefined") {
    loadImage();
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadImage();
          observer.unobserve(imgRef.value);
        }
      });
    },
    {
      rootMargin: "0px 0px 200px 0px", // 提前200px加载
    }
  );

  observer.observe(imgRef.value);
};

onMounted(() => {
  if (props.lazy) {
    initLazyLoad();
  } else {
    loadImage();
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style scoped>
.w-image {
  max-width: 100%;
  height: auto;
  transition: opacity 0.3s ease;
}

.w-image[lazy="true"] {
  opacity: 0;
}

.w-image.loaded {
  opacity: 1;
}
</style>
