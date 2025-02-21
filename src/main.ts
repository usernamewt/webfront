import './style.css'
import Vant from 'vant'
import 'vant/lib/index.css';
import i18n from './language/i18n.ts';
import 'ant-design-vue/dist/reset.css';
import app from './store/piniastore.ts'
import "virtual:svg-icons-register";
import userPermession from './directive/userPermession.ts';
import copy from './directive/copyText.ts';



app.use(Vant)
app.use(i18n)
import router,{dynamicRouter} from './router/index.ts';
// 解决用户浏览器刷新页面动态路由无法及时加载的问题
dynamicRouter();
app.use(router)
app.directive('userPermession', userPermession);
app.directive('copy', copy);
app.mount('#app')
