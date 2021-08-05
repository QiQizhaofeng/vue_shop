import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/global.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
//导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
//导入富文本编辑器样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
//配置请求的根路径
axios.defaults.baseURL='http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config=>{
  //为请求头对象添加Token验证的Authorization字段
  config.headers.Authorization=window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table',TreeTable)

//将富文本编辑器注册为可用的组件
Vue.use(VueQuillEditor)

//过滤器
Vue.filter('dateFormat',function(originVal){
  const time =new Date(originVal)
  const y=time.getFullYear()
  const m=(time.getMonth() + 1 + '').padStart(2,'0')
  const d=(time.getDay() + '').padStart(2,'0')
  const hh=(time.getHours() + '').padStart(2,'0')
  const mm=(time.getMinutes() + '').padStart(2,'0')
  const ss=(time.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
