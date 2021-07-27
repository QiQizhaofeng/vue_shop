<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登陆表单区域 -->
      <el-form ref="LoginFormRef" class="form_info" :rules="LoginFormRules" label-width="85px" :model="LoginForm">
        <!-- 用户名区域 -->
        <el-form-item label="用户账号:" prop="username" class="username">
          <el-input v-model="LoginForm.username" prefix-icon="el-icon-s-custom" placeholder="请输入用户账号"></el-input>
        </el-form-item>
        <!-- 密码区域 -->
        <el-form-item label="用户密码:" prop="password" class="password">
          <el-input type="password" v-model="LoginForm.password" prefix-icon="el-icon-lock" placeholder="请输入用户密码"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="buttons">
          <el-button type="primary" plain @click="login">登录</el-button>
          <el-button type="info" plain @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  //登录表单数据的绑定
  data: function () {
    return {
      LoginForm: {
        username: "admin",
        password: "123456",
      },
      //表单验证规则
      LoginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 3, max: 11, message: '长度在 3 到 11 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入用户密码', trigger: 'blur' },
          { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
        ]
      }
    };
  },
  methods:{
    //表单重置
    resetLoginForm(){
      this.$refs.LoginFormRef.resetFields();
    },
      //表单预验证
    login(){
      console.log(11);
      this.$refs.LoginFormRef.validate(async valid=>{
        if(!valid) return;
        let {data:res}=await this.$http.post('login',this.LoginForm);
        if(res.meta.status !==200) return this.$message.error('用户登陆失败!');
        this.$message.success('用户登陆成功');
        console.log(res);
        window.sessionStorage.setItem('token',res.data.token);
        this.$router.push('/home');
      });
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  background-color: #2e2e2e;
  height: 100%;
}
.login_box {
  width: 650px;
  height: 400px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
.avatar_box {
  width: 130px;
  height: 130px;
  border: 1px solid #eee;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 0 10px #ddd;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: #eee;
  }
}
.form_info {
  position: absolute;
  bottom: 40px;
  width: 100%;
  padding: 0 60px;
  box-sizing: border-box;
  .username,
  .password{
    margin:40px 0px;
  }
}
.buttons {
  margin-top: 40px;
  display: flex;
  justify-content: flex-end;
}
</style>
