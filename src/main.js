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

//  REQUEST 请求异常拦截
axios.interceptors.request.use(config => {
  //= =========  所有请求之前都要执行的操作  ==============
  return config
}, err => {
  var status = err.response.status
  if (status == 504) {
    Message.error('请求超时，请稍后重试')
  }
  return Promise.resolve(err)
})

//  RESPONSE 响应异常拦截
axios.interceptors.response.use(data => {
  console.log(Object.keys(data))
  return data.data
}, err => {
  var status = err.response.status
  if (status == 404) {
    Message.error('找不到页面')
  }
  return Promise.resolve(err)
})

//  向VUE的原型上添加请求方法
Vue.prototype.$getReq = get
Vue.prototype.$postJsonReq = postJson
Vue.prototype.$postJsonReq = postJson
Vue.prototype.$delReq = del
Vue.prototype.$post = post
Vue.prototype.$put = put
Vue.prototype.$upload = upload

