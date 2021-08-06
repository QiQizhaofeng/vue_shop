import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Categories from '../components/goods/Categories.vue'
import Params from '../components/goods/Params.vue'
import Goods from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
import Order from '../components/order/Order.vue'
import Reports from '../components/report/Reports.vue'


Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { 
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children:[
      {path:'/welcome', component: Welcome},
      {path:'/users',component:Users},
      {path:'/rights',component:Rights},
      {path:'/roles',component:Roles},
      {path:'/categories',component:Categories},
      {path:'/params',component:Params},
      {path:'/goods',component:Goods},
      {path:'/goods/add',component:Add},
      {path:'/orders',component:Order},
      {path:'/reports',component:Reports},
    ]
  },
]
const router = new VueRouter({
  routes
})
//挂载路由导航守卫
router.beforeEach((to,from,next)=>{
  //to:将要访问的页面路径，from当前页面路径,next()放行函数,next('/login')强制跳转
  //如果页面访问的是登录页直接放行
  if(to.path==='/login') return next()
  //从sessionStorage中获取保存到token值
  const tokenStr = window.sessionStorage.getItem('token')
  //没有token,强制跳转到登录页
  if(!tokenStr) return next('/login')
  next()
})
export default router
