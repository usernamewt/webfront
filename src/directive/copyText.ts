
import { message } from "ant-design-vue";
import { Directive } from "vue";
import useClipboard from "vue-clipboard3";

/**
 * vue-clipboard3复制方法
 */
const copyText = (text: string) => {
  const { toClipboard } = useClipboard()
  return new Promise((resolve, reject) => {
    try {
      toClipboard(text)
      message.success('复制成功')
      resolve(text)
    } catch (e) {
        message.error('复制失败')
      reject(e)
    }
  })
}
const copy: Directive = {
  mounted(el, binding) {
    el.addEventListener('click',() => {
      if (binding.value) {
        const text = typeof binding.value === 'string' ? binding.value : binding.value.text
        copyText(text)
      }
    })
  }
}
export default copy;