<script>
import { defineComponent } from "vue";

export default defineComponent({
  setup() {
    // 拖动排序
    const sourceObj = ref({});
    const targetObj = ref({});
    let sourceIndex;
    let targetIndex;
    const customRow = (record, index) => {
      const style = {
        cursor: "pointer",
      };
      // 鼠标移入
      const onMouseenter = (event) => {
        // 兼容IE
        const ev = event || window.event;
        ev.target.draggable = true;
      };

      // 开始拖拽
      const onDragstart = (event) => {
        const ev = event || window.event;
        ev.stopPropagation();
        // 得到源目标数据
        sourceObj.value = record;
        sourceIndex = index;
      };
      // 拖动元素经过的元素
      const onDragover = (event) => {
        const ev = event || window.event;
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
        ev.dataTransfer.effectAllowed = "move";
        targetIndex = index;
      };
      // 拖动到达目标元素
      const onDragenter = (event) => {
        const ev = event || window.event;
        ev.preventDefault();
        const list = document.getElementsByClassName("ant-table-row");
        const node = document.getElementsByClassName("target");
        if (node.length) {
          node[0].classList.remove("target");
        }
        list[index].classList.add("target");
      };
      // 鼠标松开
      const onDrop = (event) => {
        const ev = event || window.event;
        ev.stopPropagation();
        // 得到目标数据
        targetObj.value = record;
        targetIndex = index;
        const node = document.getElementsByClassName("target");
        if (node.length) {
          node[0].classList.remove("target");
        }
        if (targetIndex === sourceIndex) return;
        // todo 接口未对接
        tableData.value.splice(sourceIndex, 1);
        tableData.value.splice(targetIndex, 0, sourceObj.value);
      };
      return {
        style,
        onMouseenter,
        onDragstart,
        onDragover,
        onDrop,
        onDragenter,
      };
    };
    return {
      customRow,
    };
  },
});
</script>

<style lang="less" scoped>
:deep(.ant-table-tbody > tr.target > td) {
  border-top: 2px #f4c820 solid;
}
</style>
