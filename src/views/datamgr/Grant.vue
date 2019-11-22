<template>
  <div>
    <a-card>
      <a-list size="large" :showPagination="false">
        <a-list-item :key="index" v-for="(item, index) in data">
          <a-list-item-meta :description="item.connect">
            <a slot="title">{{ item.sourceName }}</a>
          </a-list-item-meta>
          <div slot="actions">
            <template>
              <Button type="primary" icon="edit" title="编辑" />
              <a-divider type="vertical"/>
              <Button type="default" icon="swap" title="连接" />
              <a-divider type="vertical"/>
              <Button type="danger" icon="delete" title="删除" />
            </template>
          </div>
        </a-list-item>
      </a-list>
    </a-card>
  </div>
</template>

<script>
import { STable, Ellipsis } from '@/components'
import { Button, Icon } from 'ant-design-vue/es'

export default {
  name: 'Grant',
  components: {
    STable,
    Ellipsis,
    Button,
    Icon
  },
  data () {
    return {
      data: [{ 'config': '{"database":"promotiondb","password":"Promotuser@#123","address":"192.168.207.8:3306","username":"promotuser"}', 'connect': 'jdbc:mysql://192.168.207.8:3306/promotiondb?characterEncoding=utf-8&useUnicode=true', 'createBy': '', 'createTime': '2019-09-18 14:15:25', 'id': 40, 'sourceCode': 'mps_prod', 'sourceName': 'mps_prod', 'type': 'mysql' }, { 'config': '{"database":"mpcdb","password":"Mpc!@123","address":"192.168.207.204:3306","username":"mpcuser"}', 'connect': 'jdbc:mysql://192.168.207.204:3306/mpcdb?useSSL=false&allowMultiQueries=true&tinyInt1isBit=false&zeroDateTimeBehavior=convertToNull', 'createBy': '', 'createTime': '2019-11-19 14:34:50', 'id': 41, 'sourceCode': 'mdm_prod', 'sourceName': 'mdm_prod', 'type': 'mysql' }, { 'config': '{"database":"ucdb","password":"Uc!@#123","address":"192.168.207.204:3306","username":"ucuser"}', 'connect': 'jdbc:mysql://192.168.207.204:3306/ucdb?characterEncoding=utf-8&useUnicode=true', 'createBy': '', 'createTime': '2019-09-18 14:46:41', 'id': 42, 'sourceCode': 'uc_prod', 'sourceName': 'uc_prod', 'type': 'mysql' }, { 'config': '{"database":"apidb","password":"Api@#123","address":"192.168.207.8:3306","username":"apiuser"}', 'connect': 'jdbc:mysql://192.168.207.8:3306/apidb?useSSL=false&allowMultiQueries=true&zeroDateTimeBehavior=convertToNull&tinyInt1isBit=false', 'createBy': '', 'createTime': '2019-10-30 14:27:17', 'id': 43, 'sourceCode': 'api_prod', 'sourceName': 'api_prod', 'type': 'mysql' }, { 'config': '{"database":"stockproddb","password":"Stockuser123","address":"192.168.207.244:3306","username":"stockproddb"}', 'connect': 'jdbc:mysql://192.168.207.244:3306/stockproddb?characterEncoding=utf-8&useUnicode=true', 'createBy': '', 'createTime': '2019-09-28 21:25:10', 'id': 44, 'sourceCode': 'stockdb', 'sourceName': 'stockdb', 'type': 'mysql' }, { 'config': '{"password":"purcotton@2019","address":"192.168.207.200:2379"}', 'connect': 'redis://192.168.207.200:2379', 'createBy': '', 'createTime': '2019-10-11 16:20:48', 'id': 45, 'sourceCode': 'redis_200', 'sourceName': 'redis_200', 'type': 'redis' }, { 'config': '{"database":"paymentdb","password":"Paymentuser@123","address":"192.168.207.217","username":"paymentuser"}', 'connect': 'jdbc:mysql://192.168.207.217/paymentdb?useSSL=false', 'createBy': '', 'createTime': '2019-10-15 09:14:50', 'id': 46, 'sourceCode': 'pay_db', 'sourceName': 'pay_db', 'type': 'mysql' }, { 'config': '{"database":"cmsdb","password":"cmsUser@123","address":"192.168.207.243","username":"cms_user"}', 'connect': 'jdbc:mysql://192.168.207.243/cmsdb?useSSL=false', 'createBy': '', 'createTime': '2019-10-15 09:15:44', 'id': 47, 'sourceCode': 'content_db', 'sourceName': 'content_db', 'type': 'mysql' }, { 'config': '{"database":"teadb","password":"Teauser123","address":"192.168.208.143:3306","username":"teauser"}', 'connect': 'jdbc:mysql://192.168.208.143:3306/teadb?useSSL=false&allowMultiQueries=true&zeroDateTimeBehavior=convertToNull', 'createBy': '', 'createTime': '2019-10-18 16:21:56', 'id': 48, 'sourceCode': 'tea_prod', 'sourceName': 'tea_prod', 'type': 'mysql' }, { 'config': '{"database":"posdb","password":"PosUser@123","address":"192.168.207.18:3306","username":"posuser"}', 'connect': 'jdbc:mysql://192.168.207.18:3306/posdb?useSSL=false&characterEncoding=utf-8&useUnicode=true&allowPublicKeyRetrieval=true', 'createBy': '', 'createTime': '2019-10-21 16:32:11', 'id': 49, 'sourceCode': 'pos_prod', 'sourceName': 'pos_prod', 'type': 'mysql' }, { 'config': '{"database":"distributiondb","password":"Distributionuser123","address":"192.168.207.37:3306","username":"distributionuser"}', 'connect': 'jdbc:mysql://192.168.207.37:3306/distributiondb?useSSL=false', 'createBy': '', 'createTime': '2019-10-21 16:38:56', 'id': 50, 'sourceCode': 'distributiondb', 'sourceName': 'distributiondb', 'type': 'mysql' }, { 'config': '{"database":"trade","password":"Tradeuser123","address":"192.168.206.213:3306","username":"trade"}', 'connect': 'jdbc:mysql://192.168.206.213:3306/trade?characterEncoding=utf-8&useUnicode=true&useSSL=false', 'createBy': '', 'createTime': '2019-10-21 16:41:31', 'id': 51, 'sourceCode': 'trade_prod', 'sourceName': 'trade_prod', 'type': 'mysql' }, { 'config': '{"password":"purcotton@2019","address":"192.168.207.41:6379"}', 'connect': 'redis://192.168.207.41:6379', 'createBy': '', 'createTime': '2019-10-23 15:34:05', 'id': 52, 'sourceCode': 'redis_41', 'sourceName': 'redis_41', 'type': 'redis' }, { 'config': '{"database":"datamaintendb","password":"Datamainten123","address":"192.168.207.8:3306","username":"datamainten"}', 'connect': 'jdbc:mysql://192.168.207.8:3306/datamaintendb?characterEncoding=utf-8&useUnicode=true', 'createBy': '', 'createTime': '2019-10-31 14:44:06', 'id': 53, 'sourceCode': 'owner', 'sourceName': 'owner', 'type': 'mysql' }],
      selectedRowKeys: [],
      options: {
        alert: { show: false, clear: () => { this.selectedRowKeys = [] } },
        rowSelection: {
          selectedRowKeys: this.selectedRowKeys,
          onChange: this.onSelectChange
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
