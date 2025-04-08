<template>
  <div class="container-box">
    <div class="table-box" ref="tbBox">
      <a-table
        :columns="menuColumns"
        :data-source="menuData"
        :pagination="false"
        :scroll="{ y: baseScroll }"
      >
        <template #customFilterIcon="{ filtered }">
          <search-outlined
            :style="{ color: filtered ? '#108ee9' : undefined }"
          />
        </template>
        <template
          #customFilterDropdown="{
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
            column,
          }"
        >
          <div style="padding: 8px">
            <a-input
              ref="searchInput"
              :placeholder="`Search ${column.dataIndex}`"
              :value="selectedKeys[0]"
              style="width: 188px; margin-bottom: 8px; display: block"
              @change="
              (e:any) => setSelectedKeys(e.target.value ? [e.target.value] : [])
            "
              @pressEnter="
                handleSearch(selectedKeys, confirm, column.dataIndex)
              "
            />
            <a-button
              type="primary"
              size="small"
              style="width: 90px; margin-right: 8px"
              @click="handleSearch(selectedKeys, confirm, column.dataIndex)"
            >
              <template #icon><SearchOutlined /></template>
              查询
            </a-button>
            <a-button
              size="small"
              style="width: 90px"
              @click="handleReset(clearFilters)"
            >
              重置
            </a-button>
          </div>
        </template>
        <template #bodyCell="{ column, text, record }">
          <template v-if="column.dataIndex === 'operation'">
            <div style="display: flex; justify-content: space-between">
              <a @click="handelEditMenu(record)">编辑</a>
              <a @click="handelAddMenu(record)">添加</a>
              <a-popconfirm
                title="确定删除？"
                ok-text="是"
                cancel-text="否"
                @confirm="handelDelMenu(record)"
              >
                <a-button size="small" type="link">删除</a-button>
              </a-popconfirm>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <a-modal
      v-model:open="openModal"
      style="width: 40vw"
      :title="persForm.id ? '编辑' : '新增'"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
      :okText="'确定'"
      :cancelText="'取消'"
    >
      <a-form
        :model="persForm"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
        ref="userFormRef"
        style="width: 100%"
      >
        <a-form-item
          label="上级菜单"
          name="fid"
          :rules="[{ required: true, message: '请选择上级菜单' }]"
        >
          <a-tree-select
            v-model:value="persForm.fid"
            :fieldNames="{ label: 'title', key: 'id', value: 'id' }"
            :treeDefaultExpandedKeys="[0]"
            show-search
            style="width: 100%"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            placeholder="Please select"
            allow-clear
            :tree-data="menuperData"
            tree-node-filter-prop="title"
          >
          </a-tree-select>
        </a-form-item>
        <a-form-item
          label="菜单类型"
          name="level"
          :rules="[{ required: true, message: '请选择菜单类型' }]"
        >
          <a-radio-group
            v-model:value="persForm.level"
            :options="plainOptions"
          />
        </a-form-item>
        <a-form-item
          label="菜单名称"
          name="title"
          :rules="[{ required: true, message: '请输入菜单名称' }]"
        >
          <a-input v-model:value="persForm.title" />
        </a-form-item>
        <a-form-item v-if="persForm.level !== -1" label="菜单图标">
          <div
            style="
              display: flex;
              flex-wrap: nowrap;
              justify-content: space-between;
            "
          >
            <div style="width: 48%; position: relative" ref="iconBoxDef">
              <transition name="fade">
                <div class="icon-search" v-if="showIconModaldef">
                  <a-input
                    v-model:value="iconSearchName"
                    placeholder="搜索图标"
                    @change="searchIcon"
                  />
                </div>
              </transition>
              <transition name="fade">
                <div class="icon-box" v-if="showIconModaldef">
                  <span
                    class="icon-item"
                    :class="{ active: persForm.icondef === item }"
                    v-for="item in svgShowList"
                    :key="item"
                    @mousedown="persForm.icondef = item"
                    ><svg-icon :name="item" />&nbsp;&nbsp;<span
                      style="text-wrap: nowrap"
                      >{{ item }}</span
                    ></span
                  >
                </div>
              </transition>
              <a-input
                v-model:value="persForm.icondef"
                @focus="
                  showIconModaldef = true;
                  showIconModalact = false;
                  iconSearchName = '';
                "
              >
                <template #prefix>
                  默认：<svg-icon :name="persForm.icondef!" />
                </template>
              </a-input>
            </div>
            <div style="width: 48%; position: relative" ref="iconBoxAct">
              <transition name="fade">
                <div class="icon-search right" v-if="showIconModalact">
                  <a-input
                    v-model:value="iconSearchName"
                    placeholder="搜索图标"
                    @change="searchIcon"
                  />
                </div>
              </transition>
              <transition name="fade">
                <div class="icon-box" v-if="showIconModalact">
                  <span
                    class="icon-item"
                    :class="{ active: persForm.iconact === item }"
                    v-for="item in svgShowList"
                    :key="item"
                    @mousedown="persForm.iconact = item"
                    ><svg-icon :name="item" />&nbsp;&nbsp;<span
                      style="text-wrap: nowrap"
                      >{{ item }}</span
                    ></span
                  >
                </div>
              </transition>
              <a-input
                v-model:value="persForm.iconact"
                @focus="
                  showIconModalact = true;
                  showIconModaldef = false;
                  iconSearchName = '';
                "
              >
                <template #prefix>
                  激活：<svg-icon :name="persForm.iconact!" />
                </template>
              </a-input>
            </div>
          </div>
        </a-form-item>
        <a-form-item
          label="是否外链"
          v-if="persForm.level !== -1"
          name="isFrame"
          :rules="[{ required: true, message: '请选择是否外链' }]"
        >
          <a-radio-group v-model:value="persForm.isFrame" name="radioGroup">
            <a-radio :value="0">是</a-radio>
            <a-radio :value="1">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="persForm.level !== -1"
          label="菜单状态"
          name="state"
          :rules="[{ required: true, message: '请选择菜单状态' }]"
        >
          <a-radio-group v-model:value="persForm.state" name="radioGroup">
            <a-radio :value="0">启用</a-radio>
            <a-radio :value="1">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="persForm.level !== -1"
          label="是否显示"
          name="is_hidden"
          :rules="[{ required: true, message: '请选择菜单是否显示' }]"
        >
          <a-radio-group v-model:value="persForm.is_hidden" name="radioGroup">
            <a-radio :value="0">是</a-radio>
            <a-radio :value="1">否</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="persForm.level === 1"
          label="路由地址"
          name="component"
          :rules="[{ required: true, message: '请输入路由地址' }]"
        >
          <a-input v-model:value="persForm.component" />
        </a-form-item>
        <a-form-item
          v-if="persForm.level === 1"
          label="组件路径"
          name="path"
          :rules="[{ required: true, message: '请输入组件路径' }]"
        >
          <a-input v-model:value="persForm.path" />
        </a-form-item>
        <a-form-item
          v-if="persForm.level !== 0"
          label="权限字符"
          name="perms"
          :rules="[{ required: true, message: '请输入权限字符' }]"
        >
          <a-input v-model:value="persForm.perms" />
        </a-form-item>
        <a-form-item
          v-if="persForm.level !== 0"
          label="权限备注"
          name="mark"
          :rules="[{ required: true, message: '请输入备注' }]"
        >
          <a-input v-model:value="persForm.mark" />
        </a-form-item>
        <a-form-item
          label="显示排序"
          name="sort"
          :rules="[{ required: true, message: '请输入排序' }]"
        >
          <a-input-number
            v-model:value="persForm.sort"
            :min="0"
            :max="100000"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref, reactive, nextTick, onUnmounted } from "vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import api from "../../api/index";
import svgIcon from "../layout/svg-icon.vue";
import { message } from "ant-design-vue";
import _ from "lodash";
import moment from "moment";
import { filterEmptyValues } from "../../utils/tools";
type Pers = {
  id?: string;
  fid?: number; //父级id
  title: string; //菜单名称
  sort?: number; //排序
  level?: number; //菜单等级0:一级菜单 1:二级菜单，-1:操作
  icondef?: string; //图标默认
  iconact?: string; //图标激活
  component?: string; //组件路径
  created_time?: string;
  updated_time?: string;
  perms: string; //权限标识
  mark: string; //备注
  path?: string;
  isFrame?: number; //是否外链
  state?: number; //菜单状态
  is_hidden?: number; //是否隐藏
};
const userFormRef = ref();
const labelCol = { style: { width: "80px" } };
const wrapperCol = { span: 14 };
const menuData = ref<any>([]);
const menuperData = ref<any>([]);
const svgList = ref<any>([]);
const svgShowList = ref<any>([]);
const showIconModaldef = ref(false);
const showIconModalact = ref(false);
const tbBox = ref();
const baseScroll = ref(0);
const iconSearchName = ref("");
const iconBoxDef = ref();
const iconBoxAct = ref();
const plainOptions = [
  { label: "目录", value: 0 },
  { label: "菜单", value: 1 },
  { label: "按钮", value: -1 },
];
const persForm = ref<Pers>({
  id: "",
  fid: undefined,
  title: "",
  sort: 0,
  level: 0,
  icondef: "",
  iconact: "",
  component: "",
  perms: "",
  created_time: "",
  updated_time: "",
  mark: "",
  path: "",
  isFrame: 1,
  state: 0,
  is_hidden: 0,
});
const openModal = ref(false);
onMounted(() => {
  search();
  initSvg();
  baseScroll.value = tbBox.value.offsetHeight - 80;
  document.addEventListener("click", toggleShowIcon);
});
onUnmounted(() => {
  document.removeEventListener("click", toggleShowIcon);
});
const toggleShowIcon = (e: any) => {
  if (
    !(
      (iconBoxDef.value && iconBoxDef.value.contains(e.target)) ||
      (iconBoxAct.value && iconBoxAct.value.contains(e.target))
    )
  ) {
    showIconModaldef.value = false;
    showIconModalact.value = false;
    iconSearchName.value = "";
    svgShowList.value = svgList.value;
  }
};
const searchIcon = () => {
  console.log(iconSearchName.value);
  svgShowList.value = svgList.value.filter((item: any) => {
    return item.includes(iconSearchName.value);
  });
};
const search = async () => {
  let data = await api.permission.getAllPermission();
  menuData.value = data.data;
  menuperData.value = [
    {
      id: 0,
      title: "主类目",
      children: data.data,
    },
  ];
};
const initSvg = () => {
  const svgModules = import.meta.glob("/src/assets/icons/*.svg", {
    eager: true,
  });

  // 获取 SVG 文件的名称
  const svgFileNames = Object.keys(svgModules).map((filePath) => {
    return filePath.split("/").pop()?.split(".svg")[0]; // 提取文件名
  });
  svgList.value = svgFileNames;
  svgShowList.value = svgFileNames;
};
const searchInput = ref();
const state = reactive({
  searchText: "",
  searchedColumn: "",
});
const handleSearch = (selectedKeys: any, confirm: any, dataIndex: any) => {
  confirm();
  state.searchText = selectedKeys[0];
  state.searchedColumn = dataIndex;
};

const handelEditMenu = (record: any) => {
  persForm.value = JSON.parse(JSON.stringify(record));
  openModal.value = true;
};
const handelAddMenu = (record: any) => {
  persForm.value.fid = record.id;
  openModal.value = true;
};

const handelDelMenu = async (record: any) => {
  let res = await api.permission.delPermission({ id: record.id });
  if (res.code === 0) {
    message.success(res.msg);
    nextTick(() => {
      search();
    });
  } else {
    message.error(res.msg);
  }
};
const handleReset = (clearFilters: any) => {
  clearFilters({ confirm: true });
  state.searchText = "";
};
const handleOk = async () => {
  const form = await userFormRef.value.validate();
  if (form) {
    let params = { ...persForm.value };
    if (persForm.value.id) {
      // 更新
      params.updated_time = moment().format("YYYY-MM-DD HH:mm:ss");
      params = filterEmptyValues(params);
      let res = await api.permission.updatePermission(params);
      if (res.code === 0) {
        message.success(res.msg);
        openModal.value = false;
        nextTick(() => {
          search();
        });
      } else {
        message.error(res.msg);
      }
    } else {
      // 新增
      params.created_time = moment().format("YYYY-MM-DD HH:mm:ss");
      params.updated_time = moment().format("YYYY-MM-DD HH:mm:ss");
      params = filterEmptyValues(params);
      let res = await api.permission.addPermission(params);
      if (res.code === 0) {
        message.success(res.msg);
        openModal.value = false;
        nextTick(() => {
          search();
        });
      } else {
        message.error(res.msg);
      }
    }
  }
};
const handleCancel = () => {
  // 清空表单
  persForm.value = {
    id: "",
    fid: undefined,
    title: "",
    sort: 0,
    level: 0,
    icondef: "",
    iconact: "",
    component: "",
    perms: "",
    created_time: "",
    updated_time: "",
    mark: "",
    path: "",
    isFrame: 1,
    state: 0,
    is_hidden: 0,
  };
  nextTick(() => {
    openModal.value = false;
  });
};
const menuColumns = ref([
  {
    title: "菜单名称",
    dataIndex: "title",
    key: "title",
    align: "center",
    customFilterDropdown: true,
    onFilter: (value: any, record: any) =>
      record.title.toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible: any) => {
      if (visible) {
        setTimeout(() => {
          searchInput.value.focus();
        }, 100);
      }
    },
  },
  {
    title: "图标",
    dataIndex: "icon",
    key: "icon",
    ellipsis: true,
    align: "center",
  },
  {
    title: "菜单路径",
    dataIndex: "component",
    key: "component",
    ellipsis: true,
    align: "center",
  },
  {
    title: "权限标识",
    dataIndex: "perms",
    key: "perms",
    ellipsis: true,
    align: "center",
  },
  {
    title: "备注",
    dataIndex: "mark",
    key: "mark",
    ellipsis: true,
    align: "center",
  },
  {
    title: "排序",
    dataIndex: "sort",
    key: "sort",
    ellipsis: true,
    align: "center",
  },
  {
    title: "组件路径",
    dataIndex: "path",
    key: "path",
    ellipsis: true,
    align: "center",
    width: 350,
  },
  {
    title: "操作",
    dataIndex: "operation",
    key: "operation",
    ellipsis: true,
    align: "center",
    width: 140,
  },
]);
</script>

<style scoped lang="less">
.btn-groups {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .ant-btn {
    padding: 0;
  }
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.icon-search {
  position: absolute;
  top: 40px;
  left: 0;
  z-index: 9999;
  width: calc(300%);
  padding: 10px;
  background-color: #fff;
}
.icon-box {
  position: absolute;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 10px;
  width: calc(40vw - 150px);
  background-color: #fff;
  border-radius: 10px;
  padding: 50px 10px 10px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);
  margin-top: 40px;
  z-index: 999;
  height: 250px;
  overflow-y: scroll;

  .active {
    background-color: #ccc;
  }
  .icon-item {
    cursor: pointer;
    display: flex;
    justify-content: flex-start;
    padding-left: 4px;
    align-items: center;
    width: 100%;
    height: 36px;
    // border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    span {
      display: inline-block;
      overflow: hidden;
      max-width: 100px;
      text-overflow: ellipsis;
    }
    &:hover {
      background-color: #ccc;
    }
  }
}

.table-box {
  height: calc(100vh - 120px);
  padding: 12px;
  border-radius: 12px;
  background-color: #fff;
  overflow: hidden;
}
</style>
