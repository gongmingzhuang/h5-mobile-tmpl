/**
 * [20210507][crt] h5 api 接口
 */
var AJAX_CONFIG = {
  SERVER_IP: "http://192.168.200.203:8099/",
}
var util = {
  assign: ES.object.assign
}
/**
 * [20210507][crt] 用户登陆
 */
function login(data) {
  // 参数默认
  var _param = {}

  var _request = {
    url: "user/logins",
    type: "post",
    headers: {
      "content-type": "application/json"
    },
    data: util.assign(_param, data)
  }
  return _request
}

/**
* [20210511][crt] 请求当前用户信息
*/
function getCurrentUserInfo (data) {
  // 参数默认
  var _param = {type: 1}

  var _request = {
    url: "user/getCurrentUserInfo",
    data: util.assign(_param, data)
  }
  return _request
}


/**
 * [20210508][crt] 请求业务员交易明细列表
 */
function getSaleList (data) {
    // 参数默认
    var _param = {}

    var _request = {
      url: "user/getSaleList",
      type: "post",
      headers: {
        "content-type": "application/json"
      },
      data: util.assign(_param, data)
    }
    return _request
}

/**
 * [20210510][crt] 请求当前业务员交易明细
 */
function getSaleDetail (data) {
      // 参数默认
      var _param = {type: 1}

      var _request = {
        url: "user/getSaleList",
        type: "post",
        headers: {
          "content-type": "application/json"
        },
        data: util.assign(_param, data)
      }
      return _request
}


/**
 * [20210510][crt] 请求代理商交易明细列表
 */
 function getAgentList (data) {
  // 参数默认
  var _param = {}

  var _request = {
    url: "user/getSaleList",
    type: "post",
    headers: {
      "content-type": "application/json"
    },
    data: util.assign(_param, data)
  }
  return _request
}

/**
* [20210510][crt] 请求当前代理商交易明细
*/
function getAgentDetail (data) {
    // 参数默认
    var _param = {type: 1}

    var _request = {
      url: "user/getSaleList",
      type: "post",
      headers: {
        "content-type": "application/json"
      },
      data: util.assign(_param, data)
    }
    return _request
}

/**
* [20210511][crt] 请求所有业务员
*/
function getSalesmanList (data) {
  // 参数默认
  var _param = {type: 1}

  var _request = {
    url: "user/getSalesmanList",
    data: util.assign(_param, data)
  }
  return _request
}

/**
 * [20210514][crt] 用户详情
 */
 function info(data) {
  // 参数默认
  var _param = {}

  var _request = {
    url: "user/info",
    type: "post",
    headers: {
      "content-type": "application/json"
    },
    data: util.assign(_param, data)
  }
  return _request
}