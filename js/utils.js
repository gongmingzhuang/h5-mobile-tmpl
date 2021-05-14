/**
 * [20210507][crt] 请求对象
 * @requestOption: Object
 * - url: 必填项
 * - type：get(默认)/post
 * - data: 请求参数
 * - headers： 请求头
 *  
 */
function $ajax(requestOption) {
  var $dtd = $.Deferred(),
    _config = {},
    _default = {
      type: "get"
    }
  // requestOption 是对象
  if (!$.isPlainObject(requestOption)) {
    console.group("—————— 请求参数错误 ——————");
    console.error("请求参数：", requestOption);
    console.error("提示：请求参数必须为对象。");
    console.groupEnd();
    return;
  }
  // url 不为空
  if (!requestOption.hasOwnProperty('url') || requestOption.hasOwnProperty('url') && !requestOption.url) {
    console.group("—————— 请求参数错误 ——————");
    console.error("请求URL 未配置或为空");
    console.groupEnd();
    return;
  }
  // 遍历属性
  for (var key in requestOption) {
    _config[key] = requestOption[key] ? requestOption[key] : _default[key];
    if (key == 'url') {
      _config[key] = SERVER_IP + _config[key];
    }
  }
  // 默认type
  if (!requestOption.hasOwnProperty("type")) {
    _config.type = _default.type;
  }
  // get 请求data处理
  if (_config.type == "get" && $.isPlainObject(_config.data)) {
    _config.url += "?" + util.toQuery(_config.data);
    if (_config.hasOwnProperty('data')) {
      _config.data = ""
    }
  }
  // post 请求data处理
  if (_config.type == "post" && $.isPlainObject(_config.data)) {
    _config.data = JSON.stringify(_config.data);
  }
  // 响应拦截
  _config.success = function (res) {
    $dtd.resolve(res)
  }
  _config.error = function (err) {
    $dtd.reject(err)
  }

  $.ajax(_config);

  return $dtd;
}


/**
 * [20210507] 工具类
 * - toQuery: 对象转查询字符串
 * - assign: 在不可用 Oject.assign 时适用
 * - formToObject： 表单数组转对象
 * - moneyFormat：金额格式化
 */
var util = {
  toQuery: function (obj) {
    var query = "";
    if (obj || JSON.stringify(query) != "{}") {
      for (var key in obj) {
        query += key + "=" + obj[key] + "&";
      }
      query = query.substring(0, query.length - 1);
    }
    return query;
  },
  assign: function (source, target) {
    function assign(obj1, obj2) {
      for (var key in obj2) {
        obj1[key] = obj2[key];
      }
    }
    if (target instanceof Array) {
      $.each(target, function (index, item) {
        assign(source, item);
      })
    } else {
      assign(source, target);
    }
    return source
  },
  formToObject: function (formArray) {
    if (!formArray instanceof Array) {
      console.error("formArray must be a Array.");
      return
    }
    var _obj = {};
    $.each(formArray, function (index, item) {
      _obj[item.name] = item.value;
    })
    return _obj;
  },
  moneyFormat: function (number, decimals) {
    decimals = decimals || 2;
    var number = (number + '').replace(/[^0-9+-Ee.]/g, '');
    var n = !isFinite(+number) ? 0 : +number,
      prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
      sep = ',', // 千位逗号
      dec = '.',
      s = '',
      vs = '';
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return '' + (n * k) / k;
    };

    s = (prec ? toFixedFix(n, prec) : '' + (n)).split('.');
    var re = /(-?\d+)(\d{3})/;
    while (re.test(s[0])) {
      s[0] = s[0].replace(re, "$1" + sep + "$2");
    };

    if ((s[1] || '').length < prec) {
      s[1] = s[1] || '';
      s[1] += new Array(prec - s[1].length + 1).join('0');
    };
    // alert('s=='+s+'===dec=='+dec);
    //var  vs=s.toString().substring(0,s.length-1);
    /* console.log("hello world —— author: lianghaishun") */
    // alert(vs);
    return s.join(dec);
  },
  getUrlQuery: function () {
    var query = window.location.search;
    if (query && query.substring(0, 1) == '?') {
      query = query.substring(1);
      var _queryArray = query.split("&");
      var obj = {};
      $.each(_queryArray, function (index, item) {
        var _item = item.split('=');
        obj[_item[0]] = _item[1]
      })
      return obj;
    }
  }
}