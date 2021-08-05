<template>
<div>
     <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>商品管理</el-breadcrumb-item>
    <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    <el-breadcrumb-item>添加商品</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card>
    <el-alert title="添加商品消息" type="info" show-icon center :closable="false"></el-alert>
    <!-- 步骤条 -->
    <el-steps :active="active-0" finish-status="success" align-center>
      <el-step title="基本信息"></el-step>
      <el-step title="商品参数"></el-step>
      <el-step title="商品属性"></el-step>
      <el-step title="商品图片"></el-step>
      <el-step title="商品内容"></el-step>
      <el-step title="完成"></el-step>
    </el-steps>
    <!-- tab标签页 -->
    <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" label-position="top">
      <el-tabs v-model="active" tab-position="left" :before-leave="beforeLeave" @tab-click="tabClicked">
        <el-tab-pane label="基本信息" name="0">
          <el-form-item label="商品名称" prop="goods_name">
            <el-input v-model="addForm.goods_name"></el-input>
          </el-form-item>
          <el-form-item label="商品价格" prop="goods_price">
            <el-input v-model="addForm.goods_price" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品重量" prop="goods_weight">
            <el-input v-model="addForm.goods_weight" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品数量" prop="goods_number">
            <el-input v-model="addForm.goods_number" type="number"></el-input>
          </el-form-item>
          <el-form-item label="商品分类" prop="goods_cat">
            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="props" @change="handleChange" clearable></el-cascader>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品参数" name="1">
          <el-form-item :label="item.attr_name" v-for=" item in manyTabelData" :key="item.attr_id">
            <el-checkbox-group v-model="item.attr_vals">
              <el-checkbox :label="cataItem" v-for="(cataItem,i) in item.attr_vals" :key="i" border></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品属性" name="2">
          <el-form-item :label="item.attr_name" v-for=" item in onlyTabelData" :key="item.attr_id">
            <el-input v-model="item.attr_vals"></el-input>
          </el-form-item>
        </el-tab-pane>
        <el-tab-pane label="商品图片" name="3">
          <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersObj" :on-success="handleSuccess">
            <el-button size="small" type="primary">点击上传</el-button>
          </el-upload>
        </el-tab-pane>
        <el-tab-pane label="商品内容" name="4">
          <quill-editor v-model="addForm.goods_introduce"></quill-editor>
          <el-button type="primary" class="addGoods" @click="add">添加商品</el-button>
        </el-tab-pane>
      </el-tabs>
    </el-form>
  </el-card>
  <!-- 图片预览 -->
  <el-dialog title="提示" :visible.sync="dialogVisible" width="50%">
    <img :src="PreviewPath" class="previewImg">
  </el-dialog>
</div>
</template>
<script>
import _ from 'lodash'

export default {
    data: function () {
      return {
        active:'0',
        addForm: {
          goods_name:'',
          goods_price:0,
          goods_weight:0,
          goods_number:0,
          goods_cat:[],
          //图片数组
          pics:[],
          goods_introduce:'',
          attrs:[]
        },
        //验证规则
        addFormRules: {
          goods_name: [
            { required: true, message: '请输入商品名称', trigger: 'blur' },
          ],
          goods_price: [
            { required: true, message: '请输入商品价格', trigger: 'blur' },
          ],
          goods_weight: [
            { required: true, message: '请输入商品重量', trigger: 'blur' },
          ],
          goods_number: [
            { required: true, message: '请输入商品数量', trigger: 'blur' },
          ],
          goods_cat: [
            { required: true, message: '请选择商品分类', trigger: 'blur' },
          ],            
        },
        //商品分类列表对象
        cateList:[],
        //级联选择器经过触发
        props: {
          expandTrigger: 'hover',
          label:'cat_name',
          value:'cat_id',
          children:'children'
        },
        //动态参数
        manyTabelData:[],
        //静态属性
        onlyTabelData:[],
        //上传图片的url地址
        uploadURL:'http://127.0.0.1:8888/api/private/v1/upload',
        //图片上传组件的headers请求头对象
        headersObj:{Authorization:window.sessionStorage.getItem('token')},
        PreviewPath:'',
        //图片预览对话框
        dialogVisible:false,

      };
    },
    created(){
      this.getCateList()
    },
    methods:{
      //获取商品分类数据
      async getCateList(){
        const{data:res} = await this.$http.get('categories')
        if(res.meta.status !== 200){
          return this.$message.error('查询商品分类失败')
        }
        this.cateList=res.data
        console.log(this.cateList);
      },
      //级联选择器选择发生变化事件
      handleChange() {
        if(this.addForm.goods_cat.length !== 3){
          this.addForm.goods_cat=[]
          return
        }
        console.log(this.addForm.goods_cat);
      },
      //标签页的切换事件
      beforeLeave(activeName, oldActiveName){
        if(oldActiveName ==='0' && this.addForm.goods_cat.length !==3){
          this.$message.error('请选择商品分类')
          return false 
        }
      },
      async tabClicked(){
        console.log(this.active);
        //商品参数面板
        if(this.active==='1'){
          const{data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'many'}})
          if(res.meta.status !== 200){
            return this.$message.error('查询商品参数失败')
          }
          res.data.forEach(item =>{
            item.attr_vals=item.attr_vals.length===0 ? []:item.attr_vals.split(' ')
          })
          this.manyTabelData=res.data
        }
        //商品属性面板
        else if(this.active==='2'){
          const{data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{params:{sel:'only'}})
          if(res.meta.status !== 200){
            return this.$message.error('查询商品属性失败')
          }
          this.onlyTabelData=res.data
          console.log(this.onlyTabelData);
        }
      },
      //商品图片
      //处理图片预览效果
      handlePreview(file) {
        console.log(file);
        this.PreviewPath=file.response.data.url
        this.dialogVisible=true
      },
      //图片上传成功时的钩子函数
      handleSuccess(response){
        console.log(response);
        //1.拼接得到的一个图片信息对象
        const picInfo={pic:response.data.tmp_path}
        //2.将图片信息对象push到pics数组中
        this.addForm.pics.push(picInfo)
        console.log(this.addForm);
      },
      //处理删除图片效果
      handleRemove(file, fileList) {
        console.log(file, fileList);
        //1.获取要删除图片的临时路径
        const filePath=file.response.data.tmp_path
        //2.从pics中找到对应的索引值
        const i= this.addForm.pics.findIndex(x=>{
            x.pic===filePath
        })
        this.addForm.pics.splice(i,1)
        console.log(this.addForm);
      },
      add(){
        this.$refs.addFormRef.validate(async valid =>{
          if(!valid) return this.$message.error('请填写必要的表单项')
          const form= _.cloneDeep(this.addForm)
          form.goods_cat= form.goods_cat.join(',')
          //处理参数和属性
          this.manyTabelData.forEach(item =>{
            const newInfo={attr_id:item.attr_id, attr_vals :item.attr_vals.join(' ')}
            this.addForm.attrs.push(newInfo)
          })
          this.onlyTabelData.forEach(item =>{
            const newInfo={attr_id:item.attr_id, attr_vals :item.attr_vals}
            this.addForm.attrs.push(newInfo)
          })
          form.attrs=this.addForm.attrs
          console.log(form);
          //添加商品发出请求
          const {data : res} = await this.$http.post('goods',form)
          if(res.meta.status !== 201){
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        })
      }
    },
    computed:{
      cateId(){
        if(this.addForm.goods_cat.length ===3){
          return this.addForm.goods_cat[2]
        }
        return null
      }
    }
  
}
</script>
<style lang="less" scoped>
.el-alert,
.el-steps{
    margin-bottom: 20px;
}
.el-checkbox{
    margin: 0 10px 0 0 !important;
}
.previewImg{
    width: 100%;
}
.addGoods{
    margin-top: 20px;
}
</style>
