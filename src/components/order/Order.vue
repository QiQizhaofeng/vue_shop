<template>
<div>
  <!-- 面包屑导航区域 -->
  <el-breadcrumb separator-class="el-icon-arrow-right">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>订单管理</el-breadcrumb-item>
    <el-breadcrumb-item>订单列表</el-breadcrumb-item>
  </el-breadcrumb>
  <!-- 卡片视图区域 -->
  <el-card>
    <el-row>
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
        </el-input>
      </el-col>
    </el-row>
    <!-- tab表单区域 -->
    <el-table :data="orderList" stripe border style="width: 100%">
      <el-table-column type="index" label="序号" width="45">
      </el-table-column>
      <el-table-column prop="order_number" label="订单编号">
      </el-table-column>
      <el-table-column prop="order_price" label="订单价格(元)" width="95">
      </el-table-column>
      <el-table-column prop="order_pay" label="是否付款" width="70">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.order_pay===0" size="mini">已付款</el-tag>
          <el-tag type="warning" v-else size="mini">未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_send" label="是否发货" width="70">
      </el-table-column>
      <el-table-column prop="update_time" label="下单时间" width="145">
        <template slot-scope="scope">{{scope.row.update_time | orderFormat}}</template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template>
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showBox"></el-button>
          <el-button type="success"  size="mini" @click="showProgress"><i class="el-icon-loading"></i></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px"> 
        <el-form-item label="省市区/县" prop="edit1">
          <el-cascader v-model="editForm.edit1" :options="cityData" :props="props"></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="edit2">
          <el-input v-model="editForm.edit2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="edit">确 定</el-button>
        </span>
      </template>
    </el-dialog>
    <!--物流进度对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressDialogVisible" width="50%">
      <!-- 物流时间线 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>



    <!-- 分页区域 -->
    <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15]" :page-size="queryInfo.pagesize" layout="total, sizes, prev, pager, next, jumper" :total="total"></el-pagination>
  </el-card>
</div>
</template>
<script>
import cityData from './citydata.js'
export default {

    data: function () {
      return {
        queryInfo:{
          query:'',
          pagenum: 1,//当前的页数
          pagesize: 10//当前页面显示的数据条数
        },
        total:0,
        orderList:[],
        //控制修改地址对话框
        editDialogVisible:false,
        editForm:{
          edit1:[],
          edit2:''
        },
        editFormRules:{
          edit1:[
            { required: true, message: '请输入省市区/县', trigger: 'blur' },
          ],
          edit2:[
            { required: true, message: '请输入详细地址 ', trigger: 'blur' },
          ]
        },
        cityData,
        props:{
          expandTrigger: 'hover'
        },
        //控制物流进度对话框
        progressDialogVisible:false,
        //物流死数据
        wuliu:{
            "data": [    {      "time": "2018-05-10 09:39:00",      "ftime":           "2018-05-10 09:39:00",      "context": "已签收,感谢使用顺丰,期待再次为您服务          ",      "location": ""    },    {      "time": "2018-05-10 08:23:00",                "ftime": "2018-05-10 08:23:00",      "context": "[北京市]北京海淀育新小区营          业点派件员 顺丰速运 95338正在为您派件",      "location": ""    },    {                "time": "2018-05-10 07:32:00",      "ftime": "2018-05-10 07:32:00",                "context": "快件到达 [北京海淀育新小区营业点]",      "location": ""    },              {      "time": "2018-05-10 02:03:00",      "ftime": "2018-05-10           02:03:00",      "context": "快件在[北京顺义集散中心]已装车,准备发往 [北京海淀          育新小区营业点]",      "location": ""    },    {      "time": "2018-05-09           23:05:00",      "ftime": "2018-05-09 23:05:00",      "context": "快件到达           [北京顺义集散中心]",      "location": ""    },    {      "time":           "2018-05-09 21:21:00",      "ftime": "2018-05-09 21:21:00",                "context": "快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]",                "location": ""    },    {      "time": "2018-05-09 13:07:00",                "ftime": "2018-05-09 13:07:00",      "context": "顺丰速运 已收取快件",                "location": ""    },    {      "time": "2018-05-09 12:25:03",                "ftime": "2018-05-09 12:25:03",      "context": "卖家发货",                "location": ""    },    {      "time": "2018-05-09 12:22:24",                "ftime": "2018-05-09 12:22:24",      "context": "您的订单将由HLA（北京海淀          区清河中街店）门店安排发货。",      "location": ""    },    {      "time":           "2018-05-08 21:36:04",      "ftime": "2018-05-08 21:36:04",                "context": "商品已经下单",      "location": ""    }  ],  "meta": {           "status": 200, "message": "获取物流信息成功！" }
        },
        progressInfo:[],
      };
    },
    created(){
      this.getOrderList()
    },
    methods:{
      //获取订单数据列表
      async getOrderList(){
        const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
        if(res.meta.status !== 200){
          return this.$message.error('获取订单列表失败');
        }
        console.log(res.data);
        this.orderList=res.data.goods
        this.total=res.data.total
      },
      //监听pagesize改变的事件
      handleSizeChange(newSize) {
        this.queryInfo.pagesize=newSize
        this.getOrderList()
      },
      //监听页码值改变的事件
      handleCurrentChange(newPage) {
        this.queryInfo.pagenum=newPage
        this.getOrderList()
      },
      //展示修改地址对话框
      showBox(){
        this.editDialogVisible=true
      },
      //修改地址提交事件
      edit(){
        this.editDialogVisible=false
      },
      //重置
      editDialogClosed(){
        this.$refs.editFormRef.resetFields()
      },
      //展示物流进度对话框
      showProgress(){
      //   const {data:res} = await this.$http.get('/kuaidi/' + 1106975712662)
      //   if(res.meta.status !== 200){
      //     return this.$message.error('获取订单物流信息失败');
      //   }
      //   this.progressInfo=res.data
      //   console.log(this.progressInfo);
        this.progressInfo=this.wuliu.data
        console.log(this.progressInfo);
        this.progressDialogVisible=true
      }
    }
  
}
</script>
<style lang="less" scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';

</style>
