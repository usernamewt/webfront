<template>
  <div>
    <div class="toolbar-container">
      <Toolbar
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
        style="border-bottom: 1px solid #ccc"
      />
      <Editor
        :defaultConfig="editorConfig"
        :mode="mode"
        v-model="valueHtml"
        style="height: 200px; overflow-y: hidden"
        @onCreated="handleCreated"
        @onChange="handleChange"
        @onDestroyed="handleDestroyed"
        @onFocus="handleFocus"
        @onBlur="handleBlur"
        @customAlert="customAlert"
        @customPaste="customPaste"
      />
      <div class="btns">
        <SvgIcon :name="'ai'" style="font-size: 20px" />
        <span>AI润色</span>
      </div>
    </div>

    <!-- <div style="margin-top: 10px">
      <textarea
        v-model="textVal"
        readonly
        style="width: 100%; height: 200px; outline: none"
      ></textarea>
    </div> -->
  </div>
</template>

<script lang="ts" setup>
import "@wangeditor/editor/dist/css/style.css";
import { onBeforeUnmount, ref, shallowRef, onMounted, watch } from "vue";
import { Editor, Toolbar } from "@wangeditor/editor-for-vue";
import { message } from "ant-design-vue";
import SvgIcon from "../layout/svg-icon.vue";
const props = defineProps({
  texts: {
    type: String,
    default: "",
  },
});

const emits = defineEmits(["updata_text"]);
const mode = ref("default"); // 或 'simple'

// 编辑器实例，必须用 shallowRef，重要！
const editorRef = shallowRef();

// 内容 HTML
const valueHtml = ref("<p>hello</p>");
watch(
  () => props.texts,
  () => {
    valueHtml.value = props.texts;
  },
  { immediate: true, deep: true }
);
// 模拟 ajax 异步获取内容
onMounted(() => {});

const toolbarConfig = {
  excludeKeys: ["fullScreen", "code", "codeBlock", "group-video"],
};
const editorConfig = {
  placeholder: "请输入内容...",
  MENU_CONF: {
    uploadImage: {
      server: "http://47.120.49.37:8082/api/upload",
      fieldName: "file",
      // 单个文件的最大体积限制，默认为 2M
      maximgSize: 10 * 1024 * 1024, // 10M
      // 最多可上传几个文件，默认为 100
      maxNumberOfimgs: 10,
      // 选择文件时的类型限制，默认为 ['image/*'] 。如不想限制，则设置为 []
      allowedimgTypes: ["image/*"],
      // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
      meta: {
        // token: 'xxx',
        // otherKey: 'yyy'
        // img:''
      },
      // 将 meta 拼接到 url 参数中，默认 false
      metaWithUrl: false,
      // 自定义增加 http  header
      headers: {
        // "X-Requested-With": null,
      },
      // 跨域是否传递 cookie ，默认为 false
      withCredentials: true,
      // 超时时间，默认为 10 秒
      timeout: 10 * 1000, //10 秒
      // 上传前
      onBeforeUpload(imgs) {
        message.info("图片正在上传中,请耐心等待");
        return imgs;
      },
      // 自定义插入图片
      customInsert(res, insertFn) {
        // 因为自定义插入导致onSuccess与onFailed回调函数不起作用,自己手动处理
        // 先关闭等待的ElMessage
        if (res.code === 200) {
          message.success("图片上传成功");
        } else {
          message.error("图片上传失败，请重新尝试");
        }
        // 从 res 中找到 url alt href ，然后插入图片
        insertFn(res.url);
        // console.log(res, "res.data")
      },

      // 单个文件上传成功之后
      onSuccess(img, res) {
        console.log(`${img.name} 上传成功`, res);
      },

      // 单个文件上传失败
      onFailed(img, res) {
        console.log(`${img.name} 上传失败`, res);
      },

      // 上传进度的回调函数
      onProgress(progress) {
        console.log("progress", progress);
        // progress 是 0-100 的数字
      },

      // 上传错误，或者触发 timeout 超时
      onError(img, err, res) {
        console.log(`${img.name} 上传出错`, err, res);
      },
    },
  },
};

// 组件销毁时，也及时销毁编辑器，重要！
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;

  editor.destroy();
});

// 编辑器回调函数
const handleCreated = (editor: any) => {
  editorRef.value = editor; // 记录 editor 实例，重要！
};
const handleChange = (editor: any) => {
  emits("updata_text", editor.getHtml());
};
const handleDestroyed = (editor: any) => {
  console.log("destroyed", editor);
};
const handleFocus = (editor: any) => {
  console.log("focus", editor);
};
const handleBlur = (editor: any) => {
  console.log("blur", editor);
};
const customAlert = (info: any, type: any) => {
  alert(`【自定义提示】${type} - ${info}`);
};
const customPaste = (editor: any, event: any, callback: any) => {
  console.log("ClipboardEvent 粘贴事件对象", event);

  // 自定义插入内容
  editor.insertText("xxx");

  // 返回值（注意，vue 事件的返回值，不能用 return）
  callback(false); // 返回 false ，阻止默认粘贴行为
  // callback(true) // 返回 true ，继续默认的粘贴行为
};

// const insertText = () => {
//   const editor = editorRef.value;
//   if (editor == null) return;

//   editor.insertText("hello world");
// };

// const printHtml = () => {
//   const editor = editorRef.value;
//   if (editor == null) return;
//   console.log(editor.getHtml());
// };

// const disable = () => {
//   const editor = editorRef.value;
//   if (editor == null) return;
//   editor.disable();
// };
</script>

<style lang="less" scoped>
.toolbar-container {
  border: 1px solid #ccc;
  width: 36vw;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
}

.btns {
  position: absolute;
  right: 5px;
  bottom: 5px;
  display: flex;
  align-items: center;
  cursor: pointer;
}
</style>
