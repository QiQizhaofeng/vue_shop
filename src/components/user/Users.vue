<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    <el-breadcrumb-item>用户列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card>
  <!-- 搜索添加区域 -->
    <el-row :gutter="20">
      <el-col :span="7">
        <!-- 搜索区域 -->
        <div>
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <template #append>
              <el-button icon="el-icon-search" @click="getUserList"></el-button>
            </template>
          </el-input>
        </div>
      </el-col>
      <el-col :span="4">
        <!-- 添加区域 -->
        <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="addForm.username"></el-input>
          </el-form-item>
          <el-form-item label="用户密码" prop="password">
            <el-input v-model="addForm.password"></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱" prop="email">
            <el-input v-model="addForm.email"></el-input>
          </el-form-item>
          <el-form-item label="用户号码" prop="mobile">
            <el-input v-model="addForm.mobile"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addUser">确 定</el-button>
          </span>
        </template>
        </el-dialog>
        <!-- 修改用户的对话框 -->
        <el-dialog title="编辑用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px"> 
          <el-form-item label="用户名称" prop="username">
            <el-input v-model="editForm.username" disabled></el-input>
          </el-form-item>
          <el-form-item label="用户邮箱" prop="email">
            <el-input v-model="editForm.email"></el-input>
          </el-form-item>
          <el-form-item label="用户号码" prop="mobile">
            <el-input v-model="editForm.mobile"></el-input>
          </el-form-item>
        </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editUserInfo">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-col>
    </el-row>
  <!-- 用户列表区域 -->
    <el-table :data="userslist" border stripe>
      <el-table-column label="序号" type="index"></el-table-column>
      <el-table-column label="姓名" prop="username"></el-table-column>
      <el-table-column label="邮箱" prop="email"></el-table-column>
      <el-table-column label="电话" prop="mobile"></el-table-column>
      <el-table-column label="角色" prop="role_name"></el-table-column>
      <el-table-column label="状态" >
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
          </el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180px">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeUserById(scope.row.id)"></el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="assignRoles(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="assignRolesVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
           <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
           </el-option>
          </el-select>
        </p>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignRolesVisible = false">取 消</el-button>
          <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  <!-- 分页区域 -->
  <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
  </el-card>
 
</div>
</template>
<script>
export default {
    data: function () {
      //验证邮箱规则
      var checkEmail=(rule, value, cb) => {
        let regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if(regEmail.test(value)){
          //合法邮箱
          return cb()
        }
        cb(new Error('请输入合法的邮箱'))
      };
      //验证手机号规则
      var checkMobile=(rule, value, cb) => {
        let regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
       if(regMobile.test(value)){
          //合法邮箱
          return cb()
        }
        cb(new Error('请输入合法的号码'))
      };
      return {
        //获取用户列表的参数对象
        queryInfo:{
            query:'',
            pagenum: 1,//当前的页数
            pagesize: 2//当前页面显示的数据条数
        },
        userslist:[],
        total:0,
        //控制添加用户对话框的显示与隐藏
        addDialogVisible:false,
        //控制修改用户对话框的显示与隐藏
        editDialogVisible:false,
        //控制分配角色对话框的显示与隐藏
        assignRolesVisible:false,
        //用户查询到的对象
        editForm:{},
        //添加用户的表单数据
        addForm:{
          username:'',
          password:'',
          email:'',
          mobile:''
        },
        //添加表单验证规则对象
        addFormRules:{
          username: [
            { required: true, message: '请输入用户名称', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 11 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入用户密码', trigger: 'blur' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          //自定义校验规则
          email:[
            { required: true, message: '请输入用户邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { required: true, message: '请输入用户号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ],
        },
        //修改表单验证规则对象
        editFormRules:{
          //自定义校验规则
          email:[
            { required: true, message: '请输入用户邮箱', trigger: 'blur' },
            { validator: checkEmail, trigger: 'blur' }
          ],
          mobile:[
            { required: true, message: '请输入用户号码', trigger: 'blur' },
            { validator: checkMobile, trigger: 'blur' }
          ],
        },
        //需要被分配角色的用户信息
        userInfo:{},
        //角色列表
        rolesList:[],
        //要分配的新角色
        selectedRoleId:''
      };
    },
    created(){
        this.getUserList()
        this.activePath=window.sessionStorage.getItem('activePath')

    },
    methods:{
      async getUserList(){
        const { data: res } = await this.$http.get('users',{ params: this.queryInfo })
        if(res.meta.status !== 200 ) return this.$message.error('获取用户列表失败');
        console.log(res);
        this.userslist=res.data.users
        this.total=res.data.total
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize=newSize
        this.getUserList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum=newPage
        this.getUserList()
      },
      //监听switch开关状态的改变
      async userStateChanged(userinfo) {
        console.log(userinfo);
        const { data : res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if(res.meta.status !== 200) {
          userinfo.mg_state= !userinfo.mg_state
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
      },
      //监听用户对话框的关闭事件(重置表单)：1.监听对话框的close事件、2拿到表单的引用($refs.addFormRef),调用resetFields()
      addDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      //添加新用户
      addUser(){
        this.$refs.addFormRef.validate(async valid=>{
          console.log(valid);
          if(!valid) return
          //通过后可以添加用户发出请求
          const {data:res} = await this.$http.post('users',this.addForm)
          if(res.meta.status !== 201 ){
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUserList()
        })
      },
      //展示编辑用户的对话框
      async showEditDialog(id){
        const{data:res} = await this.$http.get('users/'+ id)
        if(res.meta.status !== 200){
          return this.$message.error('查询用户信息失败')
        }
        this.editForm=res.data
        this.editDialogVisible= true
      },
      //监听修改用户对话框的关闭事件(重置表单)：1.监听对话框的close事件、2拿到表单的引用($refs.addFormRef),调用resetFields()
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      //修改用户信息并提交
      editUserInfo(){
        //预验证
        this.$refs.editFormRef.validate(async valid =>{
          if(!valid) return
          //发起修改用户信息是的是数据请求
          const {data : res} = await this.$http.put('users/'+this.editForm.id, {email:this.editForm.email,mobile:this.editForm.mobile})
          if(res.meta.status !== 200){
            return this.$message.error('修改用户信息失败')
          }
          this.editDialogVisible=false
          this.getUserList()
          return this.$message.success('修改用户信息成功')
        })
      },
      //根据id删除对应的用户
      async removeUserById(id) {
        const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)//捕获用户取消行为
      //如果用户点击了确定，则返回字符串 confirm
      //如果用户点击了取消，则返回字符串 cancel
      if(confirmRes !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} =await this.$http.delete('users/'+ id)
      if(res.meta.status !== 200){
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
      },
      //展示分配角色的对话框
      async assignRoles(userInfo){
        this.userInfo=userInfo
        // 在展示分配角色对话框之前先获取所有角色列表
        const {data:res}=await this.$http.get('roles')
        if(res.meta.status !== 200){
          return this.$message.error('获取角色列表失败')
        }
        this.rolesList=res.data
        this.assignRolesVisible = true
      },
      //分配角色事件
      async saveRoleInfo(){
        if(!this.selectedRoleId){
          return this.$message.error('请选择要分配的角色')
        }
        console.log(22222222);
        const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectedRoleId})
        if(res.meta.status !== 200){
          return this.$message.error('分配角色失败')
        }
        this.$message.success('分配角色成功')
        console.log(11111111);
        this.getUserList()
        this.assignRolesVisible = false
      },
      //监听分配角色对话框关闭的事件
      setRoleDialogClosed(){
        this.selectedRoleId=''
        this.userInfo=''
      }
    }
  
}
</script>
<style lang="less" scoped>

</style>
