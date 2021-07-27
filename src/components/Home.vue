<template>
<el-container  class="home-container">
  <!-- 头部区域 -->
  <el-header>
    <div>
      <img src="../assets/7.png" alt="" class="seven">
      <span>阿七购物</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </el-header>
  <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width=" isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
        <el-menu background-color="#1e1e1e" text-color="#fff" active-text-color="#409eff" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
            <!-- 一级菜单 -->
          <el-submenu :index="item.id + '' " :key="item.id" v-for="item in menulist">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class=iconsObj[item.id]></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :key="subItem.id" :index="'/'+subItem.path" v-for="subItem in item.children" @click="saveNavState('/'+subItem.path)">
            <!-- 二级菜单模板区域 -->
            <template slot="title">
              <!-- 图标 -->
              <i class="el-icon-menu"></i>
              <!-- 文本 -->
              <span>{{subItem.authName}}</span>
            </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体区域 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data(){
    return {
      //左侧菜单数据
      menulist:[],
      iconsObj:{
        '125':'el-icon-s-custom',
        '103':'el-icon-s-tools',
        '101':'el-icon-s-goods',
        '102':'el-icon-s-order',
        '145':'el-icon-s-data'
      },
      isCollapse:false,
      //被激活的地址
      activePath:'',
    }
  },
  created(){
    this.getMenuList()
    this.activePath=window.sessionStorage.getItem('activePath')
  },
  methods:{
    logout(){
      //清空token
      window.sessionStorage.clear()
      //跳转到登录页面
      this.$router.push('/login')
    },
    //获取所有菜单
    async getMenuList(){
      const {data:res}= await this.$http.get('menus')
      if(res.meta.status !==200) return this.$massage.error(res.meta.msg);
      this.menulist=res.data
    },
    // 菜单折叠与展开
    toggleCollapse(){
      this.isCollapse=! this.isCollapse
    },
    //保存链接的激活状态
    saveNavState(activePath){
      window.sessionStorage.setItem('activePath',activePath)
      this.activePath=activePath
    }
  }
}
</script>
<style lang="less" scoped>
.el-header{
    display: flex;
    background-color: #323233;
    justify-content: space-between;
    padding: 0;
    color: #fff;
    font-size: 20px;
    .seven{
        width: 55px;
        height: 55px;
    }
    >div{
        display: flex;
        align-items: center;
        span{
            margin-left: 15px;
        }
    }
    .el-button{
        display: flex;
        text-align: center;
        margin: 10px;
    }
}
.el-aside{
    background-color: #1e1e1e;
    .el-menu{
      border-right:0px;
    }
}
.el-main{
    background-color: #eeee;
}
.home-container{
    height: 100%;
}
.toggle-button{
  background-color: #909399;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
