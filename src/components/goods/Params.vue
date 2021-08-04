<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>分类参数</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card>
    <!-- 警告区域 -->
    <el-alert title="注意：只允许为第是三分级设置相关参数！" type="warning" :closable="false"></el-alert>
    <!-- 选择商品分类区域 -->
    <el-row>
      <el-col>
        <span>选择商品分类：</span>
        <!-- 选择商品分类的级联选择框 -->
        <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cateProps" @change="CateChange" clearable></el-cascader>
      </el-col>
    </el-row>
    <!-- tab页面标签区域 -->
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <!-- 添加动态参数面板 -->
      <el-tab-pane label="动态参数" name="many">
      <el-button type="primary" size="mini" :disabled="isbtnDisable" @click="addParamsDialogVisible = true">添加参数</el-button>
      <el-table :data="manyTableData" border stripe>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
             <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
            <el-input class="input-new-tag" v-if="scope.row.inputVisible"
            v-model="scope.row.inputValue" ref="saveTagInput" size="small"
            @keyup.enter.native="handleInputConfirm(scope.row)"
            @blur="handleInputConfirm(scope.row)">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+New Tag</el-button>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="attr_name" label="参数名称"></el-table-column>
        <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="showRemoveParamsDialog(scope.row.attr_id)">删除</el-button>
        </template>
        </el-table-column>
      </el-table>
      </el-tab-pane>
      <!-- 添加静态属性面板 -->
      <el-tab-pane label="静态属性" name="only">
        <el-button type="primary" size="mini" :disabled="isbtnDisable" @click="addParamsDialogVisible = true">添加属性</el-button>
        <el-table :data="onlyTableData" border stripe>
        <!-- 展开行 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-tag v-for="(item,i) in scope.row.attr_vals" :key="i" closable @close="handleClose(i,scope.row)">{{item}}</el-tag>
            <el-input class="input-new-tag" v-if="scope.row.inputVisible"
            v-model="scope.row.inputValue" ref="saveTagInput" size="small"
            @keyup.enter.capture="handleInputConfirm(scope.row)"
            @blur="handleInputConfirm(scope.row)">
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+New Tag</el-button>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column prop="attr_name" label="属性名称"></el-table-column>
        <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditParamsDialog(scope.row.attr_id)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="showRemoveParamsDialog(scope.row.attr_id)">删除</el-button>
        </template>
        </el-table-column>
      </el-table>
      <!-- 添加参数/属性对话框 -->
       <el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisible" width="50%" :append-to-body="true" @close="addParamsDialogClosed">
          <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px"> 
            <el-form-item :label="titleText" prop="attr_name">
              <el-input v-model="addForm.attr_name"></el-input>
            </el-form-item>
          </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="addParamsDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      <!-- 修改对话框 -->
      <el-dialog :title="'编辑' + titleText" :visible.sync="editParamsDialogVisible" width="50%" @close="editParamsDialogClosed" :append-to-body="true">
          <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px"> 
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name" clearable></el-input>
          </el-form-item>
        </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editParamsDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</div>
</template>
<script>
export default {

    data: function () {
        return {
          //商品分类列表
          cateList:[],
          //级联选择框的配置对象
          cateProps:{
            expandTrigger: 'hover',
            value:'cat_id',//指定具体选中的那个值的属性
            label:'cat_name',//指定你所看到的属性
            children:'children'//指定父子嵌套属性
          },
          //级联选择框双向绑定的数组
          selectedCateKeys:[],
          //被激活的页签
          activeName:'many',
          //动态参数数据绑定
          manyTableData:[],
          //静态属性数据绑定
          onlyTableData:[],
          //控制添加对话框的显示与隐藏
          addParamsDialogVisible:false,
          //添加数据的表单对象
          addForm:{
            attr_name:'',
          },
          //添加表单的验证对象
          addFormRules:{
            attr_name:[
              { required: true, message: '请输入参数名称', trigger: 'blur' },
              { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
            ]
          },
          //控制修改对话框的显示与隐藏
          editParamsDialogVisible:false,
          //修改数据的表单对象
          editForm:{},
          //修改表单的验证对象
          editFormRules:{
            attr_name:[
              { required: true, message: '请输入参数名称', trigger: 'blur' },
              { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
            ]
          },
          //添加标签
          inputVisible: false,
          inputValue: ''
        };
    },
    created(){
      this.getCateList()
    },
    methods:{
      //获取所有商品分类列表
      async getCateList(){
        const {data:res}= await this.$http.get('categories')
        if(res.meta.status !== 200 ) {
          return this.$message.error('获取商品分类失败')
        }
        //把数据列表赋值给cateList
        this.cateList=res.data
         console.log(this.cateList)
      },
      //级联选择框选中项发生变化触发事件
      CateChange(){
        this.getParamsData()
      },
      //获取参数的列表数据
      async getParamsData(){
        if(this.selectedCateKeys.length !== 3){
          this.selectedCateKeys=[]
          this.manyTableData=[]
          this.onlyTableData=[]
          return
        }
        console.log(this.selectedCateKeys);
        //根据所选分类的id，和当前所处的面板，获取对应的参数
        const {data:res}= await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:this.activeName}})
        if(res.meta.status !== 200 ) {
          return this.$message.error('获取商品分类参数失败')
        }
        console.log(res.data);
        res.data.forEach(item=>{
          item.attr_vals=item.attr_vals ? item.attr_vals.split(' '):[]
          //控制文本框的显示与隐藏
          item.inputVisible=false
          item.inputValue=''
        })
        console.log(res.data);
        if(this.activeName==='many'){
          this.manyTableData=res.data
        }else{
          this.onlyTableData=res.data
        }
      },
      //tab页签点击事件
      handleClick(){
        console.log(this.activeName);
        this.getParamsData()
      },
      //点击提交添加属性/参数
      addParams(){
        this.$refs.addFormRef.validate(async valid =>{
          if(!valid) return
          const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{attr_name:this.addForm.attr_name,attr_sel:this.activeName})
          if(res.meta.status !== 201){
            return this.$message.error('添加参数失败')
          }
          this.$message.success('添加参数成功')
           this.getParamsData()
          this.addParamsDialogVisible = false
         
        })
      },
      //重置添加表单内容
      addParamsDialogClosed(){
        this.$refs.addFormRef.resetFields()
      },
      //展示编辑商品分类对话框
      async showEditParamsDialog(attr_id){
        const{data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`,{params:{attr_sel:this.activeName}})
        if(res.meta.status !== 200){
          return this.$message.error('查询参数失败')
        }
        this.editForm=res.data
        this.editParamsDialogVisible= true
      },
      //修改用户信息并提交
      editParams(){
        //预验证
        this.$refs.editFormRef.validate(async valid =>{
          if(!valid) return
          //发起修改用户信息是的是数据请求
          const {data : res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {attr_name:this.editForm.attr_name,attr_sel:this.activeName})
          if(res.meta.status !== 200){
            return this.$message.error('修改参数失败')
          }
          this.editParamsDialogVisible=false
          this.getParamsData()
          return this.$message.success('修改参数成功')
        })
      },
      //重置修改表单内容
      editParamsDialogClosed(){
        this.$refs.editFormRef.resetFields()
        this.editForm.attr_name=''
      },
      //展示删除商品分类对话框
      async showRemoveParamsDialog(id) {
        const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        }).catch(err=>err)//捕获用户取消行为
        //如果用户点击了确定，则返回字符串 confirm
        //如果用户点击了取消，则返回字符串 cancel
        if(confirmRes !== 'confirm'){
          return this.$message.info('已取消删除')
        }
        const {data:res} =await this.$http.delete(`categories/${this.cateId}/  attributes/${id}`)
        if(res.meta.status !== 200){
          return this.$message.error('删除参数失败')
        }
        this.$message.success('删除参数成功')
        this.getParamsData()
      },
      
      //添加标签
      showInput(row) {
        row.inputVisible = true;
        //让文本框自动获得焦点
        //$nextTick 方法的作用：当页面上的元素被重新渲染之后才会执行回调函数中的代码
        this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
      },

      async handleInputConfirm(row) {
        if(row.inputValue.trim().length === 0){
          row.inputValue=''
          row.inputVisible=false
          return
        }
        row.attr_vals.push(row.inputValue.trim())
        row.inputValue=''
        row.inputVisible=false
        this.saveAttrVals(row)
      },
      //将attr_vals数组的操作提交数据库
      async saveAttrVals(row){
        //发送请求
        const {data : res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {attr_name:row.attr_name,attr_sel:this.activeName,attr_vals:row.attr_vals.join(' ')})
        if(res.meta.status !== 200){
            return this.$message.error('编辑参数标签失败')
        }
        return this.$message.success('编辑参数标签成功')
      },
      //删除参数标签
      handleClose(i,row){
        row.attr_vals.splice(i,1)
        this.saveAttrVals(row)
      }
    },
    computed: {
      //如果按钮被禁用则返回true，否则返回false
      isbtnDisable(){
        if(this.selectedCateKeys.length !==3){
          return true
        }
        return false
      },
      //获取当前分类的id
      cateId(){
        if(this.selectedCateKeys.length ===3){
          return this.selectedCateKeys[2]
        }
        return null
      },
      //动态计算激活的对话框标题
      titleText(){
        if(this.activeName ==='many'){
          return '动态参数'
        }else{
          return '静态属性'
        }
      }
    }
  
}
</script>
<style lang="less" scoped>
.el-alert{
  margin-bottom: 20px;
}
.el-tag{
  margin-left: 10px;
}

.input-new-tag
,.button-new-tag{
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>
