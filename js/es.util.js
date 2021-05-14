/**
 * ES6 - class
 */

(function (window) {
  let utilName = '$es'
  // window.es = new EsUtils();

  /* EsUtils 工具类 */
  function esExtendUtil(utilExtendArray) {
    Object.defineProperty(window, utilName, {
      get: function () {
        let temp_es = {}
        // esExtendUtil(temp_es, utilExtendArray)
        if (!$.isPlainObject(utilExtendArray)) {
          console.log('utilExtendArray must be a array')
          return
        }
        for (let key in utilExtendArray) {
          Object.defineProperty(temp_es, key, {
            get() {
              return utilExtendArray[key];
            }
          })
        }
        return temp_es;
      }
    })
  }

  /* http 请求工具 */
  const httpRequest = {
    ajax: function (requestOption) {
      /* 请求发送前拦截器 */
      // 登录超时
      /* 请求参数默认值配置 */
      // 默认配置
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
        _config[key] = typeof (requestOption[key]) == "boolean" ? requestOption[key] : requestOption[key] || _default[key];
      }
      // [20210223][upd]
      if (!requestOption.hasOwnProperty("type")) {
        _config.type = _default.type;
      }
      // 请求成功
      var defaultSuc = function (res) {
        console.group("—————— 响应结果（result） ——————");
        if (res.code === "000000") {
          console.log("响应结果(res)：", res);
          $dtd.resolve(res);
        } else {
          console.warn("响应结果(code)：", res.code);
          console.warn("响应结果(data)：", res.data);
          console.warn("响应结果(message)：", res.message);
          layer.msg(res.message);
          $dtd.reject(res);
        }
        console.groupEnd();
      }
      var defaultSucResultFilter = function (res) {
        console.group("—————— 响应结果（result filter） ——————");
        if (res.code === "000000") {
          console.log("响应结果(res.data)：", res.data);
          $dtd.resolve(res.data);
        } else {
          console.warn("响应结果(code)：", res.code);
          console.warn("响应结果(data)：", res.data);
          console.warn("响应结果(message)：", res.message);
          $dtd.reject(res);
        }
        console.groupEnd();
      }
      // 请求失败
      var defaultErr = function (err) {
        var status = err.status;
        var resText = err.responseText || "";
        if (resText) {
          var errStart = resText.indexOf("<h1>") + 4;
          var errEnd = resText.indexOf("</h1>");
          var errText = resText.substring(errStart, errEnd);
          layer.msg(errText);
        }
        utils.operate.removeLoad();
      }
      // complete
      var defaultComplete = function (xhr, status) {}
      var defaultCompleteRemoveLoading = function (xhr, status) {
        utils.operate.removeLoad();
      }
      // config - 请求成功
      if (!_config.hasOwnProperty('success') || _config.hasOwnProperty('success') && !_config.success) {
        _config.success = defaultSuc;
      }
      // success: Boolean = true 触发失败拦截
      if (_config.hasOwnProperty('success') && _config.success && !$.isFunction(_config.success)) {
        _config.success = defaultSucResultFilter;
      }
      // config - 请求失败
      if (!_config.hasOwnProperty('error')) {
        _config.error = defaultErr;
      }
      // config - complete
      if (!_config.hasOwnProperty('complete') || _config.hasOwnProperty('complete') && !_config.complete) {
        _config.complete = defaultComplete;
      }
      // complete: Boolean = true
      if (_config.hasOwnProperty('complete') && _config.complete && !$.isFunction(_config.complete)) {
        _config.complete = defaultCompleteRemoveLoading;
      }
      // 参数 - query
      if (_config.type == "get" && ($.isPlainObject(_config.data) || $.isPlainObject(_config.datas))) {
        _config.url += "?" + utils.object.toQuery(_config.data || _config.datas);
        if (_config.hasOwnProperty('data')) {
          _config.data = ""
        }
      }
      // 参数 - data
      // [20210127][upd] ignoreJSONFormat 是否不进行JSON 处理
      if (_config.type == "post" && $.isPlainObject(_config.data) && !_config.hasOwnProperty('ignoreJSONFormat')) {
        _config.data = JSON.stringify(_config.data);
      }
      // [20210202][ext] 移除请求参数中空值属性
      // [20210220][upd] notRemoveNullAttr 控制是否移除控制字段
      if (_config.hasOwnProperty('data') && !_config.notRemoveNullAttr) {
        _config.data = utils.param.removeObjectNullAttributes(_config.data) // [20210202]
      }
      if (_config.hasOwnProperty('ignoreJSONFormat')) {
        delete _config.ignoreJSONFormat;
      }
      /* 请求发送 */
      _config.url = apis.BASE_URL + _config.url;

      $.ajax(_config);

      return $dtd;
    }
  }
  /* 操作对象工具 */
  const objectOperate = {
		// [20201223] 在不可用 Oject.assign 时适用
		assign: function(source, target){
			function assign(obj1, obj2){
				for(var key in obj2){
					obj1[key] = obj2[key];
				}
			}
			if(target instanceof Array){
				$.each(target, function(index,item){
					assign(source, item);
				})
			}else{
				assign(source, target);
			}
			return source
		},
		/**
		 * [20210105] 监听js动态赋值元素change事件
		 * @param id
		 * @param classname
		 * @param property
		 * @param callback
		 * [20210111][upd] 如果使用id 进行监听，通过dataset.val 取值
		 */
		defineProperty: function(id, classname, property, callback){
			var _cur = null
			if(id){
				_cur = document.getElementById(id)
			}
			if(classname){
				_cur = document.getElementsByClassName(classname)[0]
			}
			_cur && Object.defineProperty(_cur, property, {
				set: function(v){
					if(id && _cur.value!=v){
						_cur.dataset.val = v
					}
					callback(v) // 0114
				}
			})
		},
		// [20201223] 对象转查询字符串
		toQuery: function(obj){
			var query = "";
			if(obj || JSON.stringify(query) != "{}"){
				for(var key in obj){
					query += key + "=" + obj[key] + "&";
				}
				query = query.substring(0, query.length - 1);
			}
			return query;
		},
		// [20201223] 对象转数组
		toArray: function(obj){
			var _obj = JSON.stringify(obj) == "{}"  ? {} : obj;
			var _arr = [];
			for(var key in _obj){
				_arr.push({
					label: _obj[key],
					value: key
				});
			};
			return _arr;
		},
		// [20210220][crt] 生成字段数组
		getColumnArray: function(columnStr){
			var _str = "|"+str.replaceAll("\n", "")
			var _arr = _str.split("||")
			var _tar = []
			$.each(_arr, function(index,item){
				if(item){
					// _arr.splice(index,1)
				// }else{
					var _index = item.indexOf(" |")
					_tar.push(item.substring(0, _index))
				}
			})
			return _tar
		}
  }
  
  

  /* 扩展工具对象 */
  esExtendUtil({
    http: httpRequest,
    obj: objectOperate
  })
}(window))


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