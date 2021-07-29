<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>权限管理</el-breadcrumb-item>
    <el-breadcrumb-item>角色列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 添加角色按钮区域 -->
    <el-row>
      <el-col>
        <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
      </el-col>
    </el-row>
    <!-- 角色列表区域 -->
    <el-table :data="rolesList" border stripe>
      <!-- 展开列 -->
      <el-table-column label="详情" type="expand">
        <template slot-scope="scope">
          <el-row :class="['bdbottom','vcenter',i1===0 ? 'bdtop':'']" v-for=" (item1,i1) in scope.row.children" :key="item1.id">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级三级权限 -->
            <el-col :span="19">
              <el-row :class="[i2===0 ? '':'bdtop','vcenter']" v-for=" (item2,i2) in item1.children" :key="item2.id">
                <el-col :span="6">
                  <el-tag closable type="success" @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="13">
                  <el-tag closable :class="[i3===0 ? '':'bdtop']" type="warning" v-for=" (item3,i3) in item1.children" :key="item3.id" @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 序号列 -->
      <el-table-column label="序号" type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" width="290px">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini"  @click="showEditDialog(scope.row.id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
          <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="assignRoles(scope.row)">分配权限</el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
     <!-- 分配权限对话框 -->
        <el-dialog title="分配权限" :visible.sync="assignRolesVisible" width="50%" @close="setRightDialogClosed">
          <el-tree :data="rightList" :props="treeProps" ref="treeRef" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys"></el-tree>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="assignRolesVisible = false">取 消</el-button>
              <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
          </template>
        </el-dialog>
     <!-- 添加用户对话框 -->
        <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="addForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addRole">确 定</el-button>
          </span>
        </template>
        </el-dialog>
        <!-- 修改用户的对话框 -->
        <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px"> 
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editForm.roleName" disabled></el-input>
          </el-form-item>
          <el-form-item label="角色描述" prop="roleDesc">
            <el-input v-model="editForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editRoleInfo">确 定</el-button>
            </span>
          </template>
        </el-dialog>
  </el-card>
</div>
</template>
<script>
export default {
  data: function () {
    return {
      //权限列表
      rolesList:[],
      //控制添加用户对话框的显示与隐藏
      addDialogVisible:false,
      //添加用户的表单数据
      addForm:{
        roleName:'',
        roleDesc:'',
      },
      //添加表单验证规则对象
      addFormRules:{
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ],
      },
      //控制修改用户对话框的显示与隐藏
      editDialogVisible:false,
      //用户查询到的对象
      editForm:{},
      //修改表单验证规则对象
      editFormRules:{
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 15, message: '长度在 2 到 15 个字符', trigger: 'blur' }
        ],
      },
      //控制分配权限对话框的显示与隐藏
      assignRolesVisible:false,
      //所有权限的数据
      rightList:{},
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      //默认选中的节点id值数组
      defKeys:[],
      //当前即将分配权限角色id
      roleId:''
    };
  },
  created(){
    //获取所以权限
    this.getRolesList()
  },
  methods:{
    //获取权限列表
    async getRolesList(){
      const {data:res} = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      this.rolesList=res.data
    },
    //添加新角色
    addRole(){
      this.$refs.addFormRef.validate(async valid=>{
        console.log(valid);
        if(!valid) return
        //通过后可以添加用户发出请求
        const {data:res} = await this.$http.post('roles',this.addForm)
        if(res.meta.status !== 201 ){
          this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.addDialogVisible = false
        this.getRolesList()
      })
    },
    //监听用户对话框的关闭事件(重置表单)：1.监听对话框的close事件、2拿到表单的引用($refs.addFormRef),调用resetFields()
    addDialogClosed(){
      this.$refs.addFormRef.resetFields()
    },
    //展示编辑用户的对话框
    async showEditDialog(id){
      const{data:res} = await this.$http.get('roles/'+ id)
      if(res.meta.status !== 200){
        return this.$message.error('查询角色信息失败')
      }
      this.editForm=res.data
      this.editDialogVisible= true
    },
    //监听修改用户对话框的关闭事件(重置表单)：1.监听对话框的close事件、2拿到表单的引用($refs.addFormRef),调用resetFields()
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    //修改用户信息并提交
    editRoleInfo(){
      //预验证
      this.$refs.editFormRef.validate(async valid =>{
        if(!valid) return
        //发起修改用户信息是的是数据请求
        const {data : res} = await this.$http.put('roles/'+this.editForm.roleId, {roleName:this.editForm.roleName,roleDesc:this.editForm.roleDesc})
        if(res.meta.status !== 200){
          return this.$message.error('修改用户信息失败')
        }
        this.editDialogVisible=false
        this.getRolesList()
        return this.$message.success('修改用户信息成功')
      })
    },
    //根据id删除对应的角色
    async removeRoleById(id) {
      const confirmRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)//捕获用户取消行为
      //如果用户点击了确定，则返回字符串 confirm
      //如果用户点击了取消，则返回字符串 cancel
      if(confirmRes !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} =await this.$http.delete('roles/'+ id)
      if(res.meta.status !== 200){
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    //根据id删除对应权限
    async removeRightById(role,rightId){
      const confirmRes = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)//捕获用户取消行为
      //如果用户点击了确定，则返回字符串 confirm
      //如果用户点击了取消，则返回字符串 cancel
      if(confirmRes !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} =await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if(res.meta.status !== 200){
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除权限成功')
      role.children=res.data
    },
    //展示分配权限对话框
    async assignRoles(role){
      //获取所有权限的数据
      this.roleId=role.id
      const {data:res} = await this.$http.get('rights/tree')
      if(res.meta.status !== 200){
        return this.$message.error('获取权限数据失败')
      }
      this.rightList=res.data
      this.getLeafKeys(role,this.defKeys)
      this.assignRolesVisible= true
    },
    //通过递归函数获取角色下所有权限的id并保存到defKeys数组中
    getLeafKeys(node,arr){
      if(!node.children){
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item,arr)
      });
    },
    //监听关闭分配权限对话框清空defKeys数组
    setRightDialogClosed(){
      this.defKeys=[]
    },
    //为角色分配权限事件
    async allotRights(){
      const keys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr= keys.join(',')
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.assignRolesVisible=false
    }
  }
}

</script>
<style lang="less" scoped>
.el-tag{
    margin: 7px;
}
.bdtop{
    border-top: 1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee;
}
.vcenter{
    display: flex;
    align-items: center;
}
</style>
