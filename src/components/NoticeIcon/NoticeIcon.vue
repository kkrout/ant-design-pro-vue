<template>
  <a-popover
    v-model="visible"
    trigger="click"
    placement="bottomRight"
    overlayClassName="header-notice-wrapper"
    :getPopupContainer="() => $refs.noticeRef.parentElement"
    :autoAdjustOverflow="true"
    :arrowPointAtCenter="true"
    :overlayStyle="{ width: '300px', top: '50px' }"
  >
    <template slot="content">
      <a-spin :spinning="loading">
        <a-tabs>
          <!--<a-tab-pane tab="通知" key="1">-->
          <!--<a-list>-->
          <!--<a-list-item>-->
          <!--<a-list-item-meta title="你收到了 14 份新周报" description="一年前">-->
          <!--<a-avatar style="background-color: white" slot="avatar" src="https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png"/>-->
          <!--</a-list-item-meta>-->
          <!--</a-list-item>-->
          <!--<a-list-item>-->
          <!--<a-list-item-meta title="你推荐的 曲妮妮 已通过第三轮面试" description="一年前">-->
          <!--<a-avatar style="background-color: white" slot="avatar" src="https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png"/>-->
          <!--</a-list-item-meta>-->
          <!--</a-list-item>-->
          <!--<a-list-item>-->
          <!--<a-list-item-meta title="这种模板可以区分多种通知类型" description="一年前">-->
          <!--<a-avatar style="background-color: white" slot="avatar" src="https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png"/>-->
          <!--</a-list-item-meta>-->
          <!--</a-list-item>-->
          <!--</a-list>-->
          <!--</a-tab-pane>-->
          <a-tab-pane tab="消息" key="2">
            <a-list>
              <a-list-item v-for="(item,index) in messageList" :key="item.id">
                <a-list-item-meta>
                  <a-avatar @click="readMsg(item,index)" style="background-color: white" slot="avatar" src="https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png"/>
                  <template slot="title">
                    <ellipsis :length="22" @click.native="readMsg(item,index)" tooltip>{{ item.title }}</ellipsis>
                    <a-button size="small" type="link" v-if="item.downloadPath" @click="downloadFile(item,index)" >下载</a-button>
                  </template>
                </a-list-item-meta>
              </a-list-item>
              <div v-if="messageList.length<messageCount" slot="loadMore">加载更多...</div>
            </a-list>
          </a-tab-pane>
          <a-tab-pane tab="待办" key="3">
            <a-list></a-list>
          </a-tab-pane>
        </a-tabs>
      </a-spin>
    </template>
    <span @click="fetchNotice" class="header-notice" ref="noticeRef">
      <a-badge :count="messageCount">
        <a-icon style="font-size: 16px; padding: 4px" type="bell" />
      </a-badge>
    </span>
  </a-popover>
</template>

<script>
import { Ellipsis } from '@/components'
export default {
  name: 'HeaderNotice',
  components: { Ellipsis },
  data () {
    return {
      loading: false,
      visible: false,
      messageCount: 0,
      messageList: []
    }
  },
  watch: {
    $route: {
      handler: function (val, oldVal) {
        this.noReadCount()
      }
    }
  },
  mounted () {
    this.noReadCount()
  },
  methods: {
    fetchNotice () {
      this.$post('/api/message/noread-list/5').then(res => {
        this.messageList = res.data
      })
    },
    noReadCount () {
      this.$post('/api/message/noread-count').then(res => {
        this.messageCount = res.data
        // setTimeout(this.noReadCount, 5000)
      })
    },
    downloadFile (item, index) {
      this.$post('/api/message/readed/' + item.id)
      this.$delete(this.messageList, index)
      window.open(item.downloadPath)
    },
    readMsg (item, index) {
      this.$post('/api/message/readed/' + item.id)
      this.$delete(this.messageList, index)
    }
  }
}
</script>

<style lang="css">
  .header-notice-wrapper {
    top: 50px !important;
  }
</style>
<style lang="less" scoped>
  .header-notice{
    display: inline-block;
    transition: all 0.3s;

    span {
      vertical-align: initial;
    }
  }
</style>
