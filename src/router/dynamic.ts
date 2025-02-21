import router from './index'; // 引入router实例
import { useTestStore } from '../store';
import { nextTick } from 'vue';
const store = useTestStore();
 
// export function setupRoutes() {
//     setTimeout(() => {
//         nextTick(() => {
//             const urls = store.currentRouter.split("?redirect=");
//             const redirect = urls[urls.length - 1];
//             if (redirect && router.hasRoute(redirect)) {
//                 router.push({ path: "/redirect", query: { path: redirect } });
//             } else {
//                 router.push({ path: "/redirect",query:{path:'/'} });
//             }
//         })
//     }, 0);

// }