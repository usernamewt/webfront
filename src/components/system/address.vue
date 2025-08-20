<script setup>
import { ref } from 'vue'
import { VueDraggableNext as draggable } from 'vue-draggable-next'

const sourceList = ref([
  { id: 1, name: '单选框', color: 'blue' },
  { id: 2, name: '多选框', color: 'blue' },
  { id: 1, name: 'Template Item', color: 'blue' },
])

const targetList = ref([])

// Deep clone function for complex objects
const cloneItem = (original) => {
  return {
    ...original,
    id: Date.now(), // Generate new ID
    name: `Copy of ${original.name}`,
  }
}
</script>

<template>
  <div class="clone-demo">
    <div class="source">
      <h3>Source (Clone)</h3>
      <draggable
        v-model="sourceList"
        :animation="150"
        :group="{ name: 'shared', pull: 'clone', put: false }"
        :clone="cloneItem"
        :sort="false"
      >
        <div
          v-for="item in sourceList"
          :key="item.id"
          style="
            width: 200px;
            height: 38px;
            border: 1px solid #c1c1c1;
            line-height: 38px;
            text-align: center;
            cursor: move;
          "
        >
          {{ item.name }}
        </div>
      </draggable>
    </div>

    <div class="target">
      <h3>Target</h3>
      <draggable v-model="targetList" group="shared" :animation="150">
        <div
          v-if="!targetList.length"
          style="min-width: 200px; min-height: 200px"
        ></div>

        <div
          v-for="item in targetList"
          :key="item.id"
          style="
            width: 200px;
            height: 36px;
            border: 1px solid cyan;
            line-height: 36px;
            text-align: center;
            margin-bottom: 5px;
          "
        >
          {{ item.id }}
        </div>
      </draggable>
    </div>
  </div>
</template>

<style scoped lang="less">
.clone-demo {
  display: flex;
  gap: 300px;
}
.target {
  min-height: 400px;
  min-width: 200px;
}
</style>
