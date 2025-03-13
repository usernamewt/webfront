import { Directive } from "vue";

const lazyLoadPng: Directive = {
  mounted(el, binding) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton";
    skeleton.style.width = el.width ? `${el.width}px` : "100%";
    skeleton.style.height = el.height ? `${el.height}px` : "100%";
    el.parentNode.insertBefore(skeleton, el);
    el.style.display = "none";

    el.setAttribute("data-src", binding.value);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(() => {
        el.src = el.getAttribute("data-src");
        el.onload = () => {
          skeleton.remove();
          el.style.display = "block";
        };
        // 图片加载失败时，显示错误占位符
        el.onerror = () => {
          skeleton.remove();
          el.style.display = "block";
          el.src = "http://47.120.49.37:8082/error.png"; // 错误占位符
        };

        observer.unobserve(el);
      });
    });

    observer.observe(el);
  },
};
export default lazyLoadPng;
