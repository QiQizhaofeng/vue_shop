<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品分类</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card>
  <!-- 搜索添加区域 -->
    <el-row :gutter="20">
      <el-col>
        <!-- 添加区域 -->
        <el-button type="primary" class="addclass" @click="showAddCateDialog">添加分类</el-button>
        <!-- 添加商品分类对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="90px">
          <el-form-item label="分类名称:" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类:">
            <!-- options：用来指定数据源 -->
            <!-- props：用来指定配置对象 -->
            <!-- v-model：用来绑定到data数据中 -->
            <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCataChange" clearable></el-cascader>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="addCateDialogVisible=false">取 消</el-button>
            <el-button type="primary" @click="addCate">确 定</el-button>
          </span>
        </template>
        </el-dialog>
        <!-- 修改分类的对话框 -->
        <el-dialog title="编辑分类" :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
          <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="80px"> 
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="editCateForm.cat_name"></el-input>
          </el-form-item>
        </el-form>
          <template #footer>
            <span class="dialog-footer">
              <el-button @click="editCateDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
          </template>
        </el-dialog>
      </el-col>
    </el-row>
  <!-- 商品分类列表区域 -->
  <tree-table :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" show-index border>
    <!-- 是否有效模板区域 -->
    <template slot="isok" slot-scope="scope">
      <i class="el-icon-success" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
      <i class="el-icon-error" style="color: red" v-else></i>
    </template>
    <!-- 是排序模板区域 -->
    <template slot="order" slot-scope="scope">
      <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
      <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
      <el-tag size="mini" type="warning" v-else>三级</el-tag>
    </template>
     <!-- 操作模板区域 -->
    <template slot="opt" slot-scope="scope">
      <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditCateDialog(scope.row.cat_id)">编辑</el-button>
      <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
    </template>
  </tree-table>
    
  <!-- 分页区域 -->
<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
  </el-card>
</div>
</template>
<script>
export default {

    data: function () {
        return {
          //商品分类数据列表
          cateList:[],
          //查询条件
          queryInfo:{
            type:3,
            pagenum:1,
            pagesize:5
          },
          //总数据条数
          total:0,
          //为table指定列的定义
          columns:[{
            label:'分类名称',
            prop:'cat_name'
          },
          {
            label:'是否有效',
            //表示将当前列定义为模板列
            type:'template',
            //表示当前列模板列的名称
            template:'isok'
          },
          {
            label:'排序',
            type:'template',
            template:'order'
          },
          {
            label:'操作',
            type:'template',
            template:'opt'
          }],
          //控制添加商品分类对话框的显示与隐藏
          addCateDialogVisible:false,
          //添加分类的表单数据对象
          addCateForm:{
            //将要添加分类的名称
            cat_name:'',
            //父级分类的id
            cat_pid:0,
            //分类等级,默认添加一级分类
            cat_level:0
          },
          //添加分类的规则
          addCateFormRules:{
            cat_name:[
              { required: true, message: '请输入分类名称', trigger: 'blur' },
              { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
            ]
          },
          //父级分类列表
          parentCateList:[],
          //指定级联选择器的配置对象
          cascaderProps:{
            checkStrictly:true,
            expandTrigger: 'hover',
            value:'cat_id',//指定具体选中的那个值的属性
            label:'cat_name',//指定你所看到的属性
            children:'children'//指定父子嵌套属性
          },
          //选中的父级分类id数组
          selectedKeys:[],
          //修改表单验证规则对象
          editCateFormRules:{
            //自定义校验规则
            cat_name:[
              { required: true, message: '请输入用户名称', trigger: 'blur' },
              { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
            ],          
          },
          editCateForm:{},
          editCateDialogVisible:false,
        };
    },
    created(){
      //商品分类数据列表
      this.getCateList()
    },
    methods:{
      //获取商品分类数据
      async getCateList(){
        const { data: res } = await this.$http.get('categories',{ params: this.queryInfo })
        if(res.meta.status !== 200 ) return this.$message.error('获取商品分类失败');
        console.log(res.data);
        //把数据列表赋值给cateList
        this.cateList=res.data.result
        //总数据条数
        this.total=res.data.total
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize=newSize
        this.getCateList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum=newPage
        this.getCateList()
      },
      //展示添加商品分类对话框
      showAddCateDialog(){
        //获取父级分类列表数据
        this.getParentCateList()
        this.addCateDialogVisible=true
      },
      //获取父级分类的列表
      async getParentCateList(){
        const {data:res} = await this.$http.get('categories',{ params: {type:2} })
        if(res.meta.status !== 200 ){
          this.$message.error('获取父级分类数据失败')
        }
        this.parentCateList=res.data
        console.log(this.parentCateList);
      },
      //选择发生变化促发事件
      parentCataChange(){
        if(this.selectedKeys.length > 0){
          this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
          this.addCateForm.cat_level = this.selectedKeys.length
          return
        }else{
          this.addCateForm.cat_pid = 0
          this.addCateForm.cat_level = 0
        }
      },
      //点击按钮
      addCate(){
        //预验证
        this.$refs.addCateFormRef.validate(async valid =>{
          if(!valid) return
          //通过后可以添加分类发出请求
          const {data : res} = await this.$http.post('categories', this.addCateForm)
          if(res.meta.status !== 201){
            return this.$message.error('添加分类失败')
          }
          this.getCateList()
          this.addCateDialogVisible=false
          return this.$message.success('添加分类成功')
        })
      
      },
      //重置表单数据
      addCateDialogClosed(){
        this.$refs.addCateFormRef.resetFields()
        this.selectedKeys=[]
        this.addCateForm.cat_pid=0
        this.addCateForm.cat_level=0
      },
      //展示编辑商品分类对话框
      async showEditCateDialog(id){
        const{data:res} = await this.$http.get('categories/'+ id)
        if(res.meta.status !== 200){
          return this.$message.error('查询分类失败')
        }
        this.editCateForm=res.data
        this.editCateDialogVisible= true
      },
      //修改用户信息并提交
      editCate(){
        //预验证
        this.$refs.editCateFormRef.validate(async valid =>{
          if(!valid) return
          //发起修改用户信息是的是数据请求
          const {data : res} = await this.$http.put('categories/'+this.editCateForm.cat_id, {cat_name:this.editCateForm.cat_name})
          if(res.meta.status !== 200){
            return this.$message.error('修改分类失败')
          }
          this.editCateDialogVisible=false
          this.getCateList()
          return this.$message.success('修改分类成功')
        })
      },
      //监听修改用户对话框的关闭事件(重置表单)：1.监听对话框的close事件、2拿到表单的引用($refs.addFormRef),调用resetFields()
      editCateDialogClosed(){
        this.$refs.editCateFormRef.resetFields()
      },
      //根据id删除对应的用户
      async removeCateById(id) {
        const confirmRes = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err=>err)//捕获用户取消行为
      //如果用户点击了确定，则返回字符串 confirm
      //如果用户点击了取消，则返回字符串 cancel
      if(confirmRes !== 'confirm'){
        return this.$message.info('已取消删除')
      }
      const {data:res} =await this.$http.delete('categories/'+ id)
      if(res.meta.status !== 200){
        return this.$message.error('删除分类失败')
      }
      this.$message.success('删除分类成功')
      this.getCateList()
      },
    }
  
}
</script>
<style lang="less" scoped>
.addclass{
    margin-bottom: 20px;
}
</style>
