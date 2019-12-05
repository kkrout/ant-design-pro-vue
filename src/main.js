// with polyfills
import 'core-js/stable'
import 'regenerator-runtime/runtime'

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store/'
import { VueAxios } from './utils/request'

// mock
// WARNING: `mockjs` NOT SUPPORT `IE` PLEASE DO NOT USE IN `production` ENV.
import './mock'

import bootstrap from './core/bootstrap'
import './core/lazy_use'
import './permission' // permission control
import './utils/filter' // global filter
import './components/global.less'
import './index.less'
// 引入依赖包
import axios from 'axios'
import { Message } from 'ant-design-vue'
import { post, postJson, get, del, put, upload } from './api/request'

Vue.config.productionTip = false

// mount axios Vue.$http and this.$http
Vue.use(VueAxios)

new Vue({
  router,
  store,
  created: bootstrap,
  render: h => h(App)
}).$mount('#app')

var requestSeq = 0
var GOABLE_LOADING

const isWhiteList = function (url) {
  return !url.startsWith('/api/coll') &&
    !url.startsWith('/api/message')
}

//  REQUEST 请求异常拦截
axios.interceptors.request.use(config => {
  //= =========  所有请求之前都要执行的操作  ==============
  if (isWhiteList(config.url)) {
    requestSeq++
  }
  return config
}, err => {
  return Promise.reject(err)
})

//  RESPONSE 响应异常拦截
axios.interceptors.response.use(data => {
  if (!isWhiteList(data.config.url)) {
    return data.data
  }
  requestSeq--
  if (!data.data.success) {
    Message.error(data.data.message)
    return Promise.reject(data.data)
  }

  return data.data
}, err => {
  if (!isWhiteList(err.config.url)) {
    return Promise.reject(err)
  }
  var status = err.response.status
  switch (status) {
    case 401:
      Message.error('登录超时，请重新登录')
      store.dispatch('Logout').then(() => {
        window.location.href = '/user/login'
      })
      break
    case 404:
      Message.error('找不到页面')
      break
    case 504:
      Message.error('请求超时，请稍后重试')
      break
    case 500:
      Message.error(err.response.data.message)
  }
  requestSeq--
  return Promise.reject(err)
})

//  向VUE的原型上添加请求方法
Vue.prototype.$getReq = get
Vue.prototype.$postJsonReq = postJson
Vue.prototype.$delReq = del
Vue.prototype.$post = post
Vue.prototype.$put = put
Vue.prototype.$upload = upload

// 请求超过500ms提示正在加载
setInterval(() => {
  if (requestSeq > 0) {
    if (!GOABLE_LOADING) {
      GOABLE_LOADING = Message.loading('请求中...', 60)
    }
  } else {
    GOABLE_LOADING && GOABLE_LOADING()
    GOABLE_LOADING = null
  }
}, 500)
