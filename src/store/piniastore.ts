// 用于更改引用顺序store优先加载，避免报错
import {createApp} from 'vue'
import BaseLoadingVue from '../components/layout/BaseLoading.vue';

import {createPinia} from 'pinia'
import App from '../App.vue'

const app = createApp(App)
app.component('Loading',BaseLoadingVue)
app.use(createPinia())
export default app