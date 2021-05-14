(function (window) {
  // 对外保留工具名
  var utilsName = "ES"
  // 将事件中心挂载到Utils 原型中
  function extendUtil(extendUtil) {
    for (var key in extendUtil) {
      (function (key) {
        Object.defineProperty(Utils.prototype, key, {
          get: function () {
            return extendUtil[key]
          }
        })
      })(key)
    }
  }
  var _utils = new Utils();

  Object.defineProperty(window, utilsName, {
    get: function () {
      return _utils
    }
  })

  // 扩展工具对象
  extendUtil({
    event: new EventClass(),
    custom: new CustomFunctionClass()
  })
  // 扩展模板
  $.extend($.tmpl.tag, {
    "var": {
      open: "var $1;"
    },
    "javascript":{
      open: "$1;"
    }
  });

}(window))

function Utils() {
  // 辅助对象
  this.supply = {}
  // 金额对象
  this.money = {
    /**
     * [20201223] 金额格式化
     * @param number 要格式化的数字
     * @param decimals 保留几位小数
     * @returns {string}
     */
    format: function (number, decimals) {
      decimals = decimals || 2;
      var number = (number + '').replace(/[^0-9+-Ee.]/g, '');
      var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = ',',
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
      // alert(vs);
      return s.join(dec);
    },
    /**
     * [20201218] 金额格式化-将格式化金额转化为数字类型
     * @param numberStr
     * @returns {string|number}
     */
    reverse: function (numberStr) {
      var _number = numberStr.replace(new RegExp(/,/g), '');
      if (isNaN(_number)) {
        return "0.00"
      }
      return +_number;
    },
    /**
     * [20210127] 数字金额大写转换(可以处理整数,小数,负数)
     * @param number
     * 原方法：smalltoBIGEv
     */
    capitalize: function (currencyDigits) {
      var MAXIMUM_NUMBER = 9999999999999.99; //16w
      // Predefine the radix characters and currency symbols for output:
      var CN_ZERO = "零";
      var CN_ONE = "壹";
      var CN_TWO = "贰";
      var CN_THREE = "叁";
      var CN_FOUR = "肆";
      var CN_FIVE = "伍";
      var CN_SIX = "陆";
      var CN_SEVEN = "柒";
      var CN_EIGHT = "捌";
      var CN_NINE = "玖";
      var CN_TEN = "拾";
      var CN_HUNDRED = "佰";
      var CN_THOUSAND = "仟";
      var CN_TEN_THOUSAND = "万";
      var CN_HUNDRED_MILLION = "亿";
      var CN_SYMBOL = "";
      var CN_DOLLAR = "元";
      var CN_TEN_CENT = "角";
      var CN_CENT = "分";
      var CN_INTEGER = "整";

      // Variables:
      var integral; // Represent integral part of digit number.
      var decimal; // Represent decimal part of digit number.
      var outputCharacters; // The output result.
      var parts;
      var digits, radices, bigRadices, decimals;
      var zeroCount;
      var i, p, d, ds;
      var quotient, modulus;

      // Validate input string:
      // 8.11 添加0过滤
      if (currencyDigits || !isNaN(currencyDigits) && currencyDigits == 0) {
        currencyDigits = currencyDigits.toString();
      };


      /*    if (currencyDigits.match(/[^,.\d]/) != null) {
                    alert("输入字符串中的字符无效!");
                    return "";
                }
                if ((currencyDigits).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
                    alert("请输入正确的数字金额!");
                    return "";
                }*/

      // Normalize the format of input digits:
      currencyDigits = currencyDigits ? currencyDigits.replace(/,/g, "") : ""; // Remove comma delimiters.
      currencyDigits = currencyDigits ? currencyDigits.replace(/^0+/, "") : ""; // Trim zeros at the beginning.
      // Assert the number is not greater than the maximum number.
      if (Number(currencyDigits) > MAXIMUM_NUMBER) {
        alert("数字太大啦..");
        return "";
      }

      // Process the coversion from currency digits to characters:
      // Separate integral and decimal parts before processing coversion:
      parts = currencyDigits.split(".");
      if (parts.length > 1) {
        integral = parts[0];
        decimal = parts[1];
        // Cut down redundant decimal digits that are after the second.
        decimal = decimal.substr(0, 2);
      } else {
        integral = parts[0];
        decimal = "";
      }
      // Prepare the characters corresponding to the digits:
      digits = new Array(CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE);
      radices = new Array("", CN_TEN, CN_HUNDRED, CN_THOUSAND);
      bigRadices = new Array("", CN_TEN_THOUSAND, CN_HUNDRED_MILLION);
      decimals = new Array(CN_TEN_CENT, CN_CENT);
      // Start processing:
      outputCharacters = "";
      // Process integral part if it is larger than 0:
      if (Number(integral) > 0) {
        zeroCount = 0;
        for (i = 0; i < integral.length; i++) {
          p = integral.length - i - 1;
          d = integral.substr(i, 1);
          quotient = p / 4;
          modulus = p % 4;
          if (d == "0") {
            zeroCount++;
          } else {
            if (zeroCount > 0) {
              outputCharacters += digits[0];
            }
            zeroCount = 0;
            outputCharacters += digits[Number(d)] + radices[modulus];
          }
          if (modulus == 0 && zeroCount < 4) {
            outputCharacters += bigRadices[quotient];
          }
        }
        outputCharacters += CN_DOLLAR;
      }
      // Process decimal part if there is:
      if (decimal != "") {
        for (i = 0; i < decimal.length; i++) {
          d = decimal.substr(i, 1);
          ds = decimal.substr(-1, 1);
          if (d == 0) {
            if (ds == 0) {
              outputCharacters += "";
            } else {
              outputCharacters += digits[Number(d)];
            }
          } else {

            outputCharacters += digits[Number(d)] + decimals[i];

          }
        }
      }
      // Confirm and return the final output string:
      if (outputCharacters == "") {
        outputCharacters = CN_ZERO + CN_DOLLAR;
      }
      if (decimal == "") {
        outputCharacters += CN_INTEGER;
      }
      outputCharacters = CN_SYMBOL + outputCharacters;
      return outputCharacters;
    },
    /**
     *
     * @param min(不可取)
     * @param max（可取）
     */
    rangeRandomNumber: function (min, max) {
      var _min = min || 0,
        _max = max || 1,
        _num = 0;
      _num = Math.ceil(Math.random() * (_max - _min) + _min)
      return _num
    },
    /**
     * [20210106][copy] 金额转格式
     * @param data
     * @returns {string}
     * 原方法：listAmtEv
     */
    listMoney: function (money) {
      if (money != 'undefined') {
        money = Number(money).toFixed(2);
        var billAmt = money + "";
        if (billAmt.indexOf(".") != -1) {
          billAmt = billAmt.replace(".", "");
        } else {
          billAmt = billAmt + "00";
        }
        var amtLi = "";
        for (var i = 1; 13 > i; i++) {
          amtLi += "<li>";
          if (12 - billAmt.length == i) {
            amtLi += "￥";
          }
          if (12 - billAmt.length < i) {
            amtLi += billAmt.charAt(i - 13 + billAmt.length);
          }
          amtLi += "</li>";
        }
        return amtLi;
      } else {
        for (var i = 1; 13 > i; i++) {
          amtLi += "<li>";
          amtLi += "</li>";
        };
        return amtLi;
      }
    },
    /**
     * [20210226][crt] 输入框格式化控制
     * @param element
     * @param object constraint - 约束项，控制可输小数位
     * @param callback
     */
    inputTriggerEvent: function (element, constraint, callback) {
      $(element)
        .unbind("focus")
        .unbind("blur")
        .focus(function (e) {
          var _val = $(e.target).val()
          _val && $(e.target).val(utils.money.reverse(_val))
        })
        .blur(function (e) {
          // 限制输入
          if (constraint) {
            utils.money.restrictedInput($(this)[0], constraint)
          }
          var _val = $(e.target).val()
          if (_val) {
            $(e.target).val(utils.money.format(_val, 2))
            if (callback) {
              callback(e.target)
            }
          }

        });

      return $(element);
    },
    /**
     * [20210226][cpy] 限制输入小数点两位，可过滤英文
     *
     */
    restrictedInput: function (obj, constraint) {
      if (isNaN(obj.value)) {
        return;
      }

      //如果用户第一位输入的是小数点，则重置输入框内容
      if (obj.value != '' && obj.value.substr(0, 1) == '.') {
        obj.value = "";
      }
      // [20210226][todo] 控制限定小数位
      var _digits = "\\d\\d"
      if (constraint && constraint.limitDigit) {

      }

      obj.value = obj.value.replace(/^0*(0\.|[1-9])/, '$1'); //粘贴不生效
      obj.value = obj.value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符
      obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
      obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
      obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
      if (obj.value.indexOf(".") < 0 && obj.value != "") { //以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
        if (obj.value.substr(0, 1) == '0' && obj.value.length == 2) {
          obj.value = obj.value.substr(1, obj.value.length);
        }
      }
    }
  }
  // 操作对象
  this.operate = {
    // 打印
    print: function (elementId) {
      var headstr = "<html><head>" +
        "<link rel='stylesheet' type='text/css' href='" + M + "/css/public.css'/>" +
        "<link rel='stylesheet' type='text/css' href='" + M + "/css/index.css'/>" +
        "<title></title></head><body>"
      var footstr = "</body>";
      var printData = "<div id='" + elementId + "'>" + document.getElementById(elementId).innerHTML + "</div>";
      var oldstr = document.body.innerHTML;
      // layer.open({
      // 	maxWidth: "100%",
      // 	content: headstr + printData + footstr,
      // 	yes: function(){
      //
      // 	}
      // })
      document.body.innerHTML = headstr + printData + footstr;
      //页面打印缩放比例设置
      // document.getElementsByTagName('body')[0].style.zoom=0.73
      // document.all.WebBrowser.ExecWB(7, 1)
      // document.all.WebBrowser.ExecWB(6, 1)
      window.print();
      // document.getElementsByTagName('body')[0].style.zoom=1
      // document.body.innerHTML = oldstr;
      location.reload();
      // eventInit.forward()
      return false;
    },
    // [20200806] 延时执行操作
    delayInvokeFn: function (fn, delay) {
      var delay = delay || 750;
      setTimeout(function () {
        fn();
      }, delay);
    },
    // [20200323][copy]当点击发票验证，清除入口存放的数据
    clearInvoiceTempData: function (curGate) {
      window.sessionStorage.removeItem(curGate + "InvoiceCheck");
      window.sessionStorage.removeItem(curGate + "InvoiceCheckUrl");
      window.sessionStorage.removeItem("params");
    },
    // [20210126][crt] 加载遮罩层
    addLoading: function (loadingWord) {
      var _dtd = $.Deferred()
      var loadingWord = loadingWord || "加载中，请稍后...";
      if ($('#loading')) {
        $('#loading').remove();
      };
      $('body').append("<div id='loading' class='loading'>" +
        "	<img src=../../img/loading.gif  width='84' height='84' class='loadImg'/>" +
        "	<span class='loadWord'>" + loadingWord + "</span>" +
        "</div>");
      setTimeout(function () {
        _dtd.resolve()
      }, 10)
      return _dtd
    },
    // [20210126][crt] 移除遮罩层
    removeLoad: function () {
      if (document.getElementById("loading")) {
        $('#loading').remove();
      };
    },
    /**
     * [20210311][crt] 请求数据（详情、列表）
     * @param pageJSON [require]
     * @param param - 实参
     * @param operateType - 接口分发字符串
     * @param beforeSubmitFunction - 请求前执行
     * @param afterSubmitFunction - 请求后执行：用于数据预处理
     * @returns {jQuery|{}}
     */
    getData: function (pageJSON, param, operateType, beforeSubmitFunction, afterSubmitFunction) {
      var args = arguments,
        _config = pageJSON.type == 'form' ? pageJSON.api.formData : pageJSON.api.listData,
        _api = window[_config.path][_config.gate][_config.api],
        $dtd = $.Deferred(),
        _default = {
          param: {},
          beforeSubmitFunction: function () {},
          afterSubmitFunction: function () {},
          operateType: null
        };

      param = param || _default.param;
      beforeSubmitFunction = beforeSubmitFunction || _default.beforeSubmitFunction;
      afterSubmitFunction = afterSubmitFunction || _default.afterSubmitFunction;
      operateType = operateType || _default.operateType;

      beforeSubmitFunction(param);

      $.when(utils.ajax(_api(param, operateType, args))).done(function (res) {
        // 常用于对响应数据进行预处理
        res = afterSubmitFunction(res)
        $dtd.resolve(res)
      })
      return $dtd;
    },
    /**
     * [20210311][crt] 表单提交封装
     * @param pageJSON [require]
     * @param param - 实参
     * @param operateType - 接口分发字符串
     * @param beforeSubmitFunction - 请求前执行
     * @param afterSubmitFunction - 请求后执行：默认执行返回按钮
     */
    submit: function (pageJSON, param, operateType, beforeSubmitFunction, afterSubmitFunction) {
      var args = arguments,
        _config = pageJSON.api.submitForm,
        _api = window[_config.path][_config.gate][_config.api],
        _default = {
          param: {},
          beforeSubmitFunction: function () {},
          afterSubmitFunction: function () {
            $(".back").click()
          },
          operateType: null
        };

      param = param || _default.param;
      beforeSubmitFunction = beforeSubmitFunction || _default.beforeSubmitFunction;
      afterSubmitFunction = afterSubmitFunction || _default.afterSubmitFunction;
      operateType = operateType || _default.operateType;

      beforeSubmitFunction(param);

      $.when(utils.ajax(_api(param, operateType, args))).done(function (res) {
        if (res.code == "000000") {
          layer.msg(res.message || TIPSEV.OPERATE_SUCCESS)
          utils.operate.delayInvokeFn(function () {
            afterSubmitFunction(res);
          })
        } else {
          layer.msg(TIPSEV.OPERATE_ERROR + res.message)
        }
      })
    },
    /**
     * [20210311][crt] 自定义请求
     * @param pageJSON [require]
     * @param param - 实参
     * @param operateType - 接口分发字符串
     * @param otherRequestIndex - 自定义请求数组索引，默认：0
     * @param beforeSubmitFunction - 请求前执行
     * @param afterSubmitFunction - 请求后执行
     */
    request: function (pageJSON, param, operateType, otherRequestIndex, beforeSubmitFunction, afterSubmitFunction) {
      otherRequestIndex = otherRequestIndex || 0;
      var args = arguments,
        _config = pageJSON.api.otherRequest[otherRequestIndex],
        _api = window[_config.path][_config.gate][_config.api],
        _default = {
          param: {},
          beforeSubmitFunction: function () {},
          afterSubmitFunction: function () {},
          operateType: null
        };

      if (!_api) {
        utils.log.warn("请求地址错误", _config)
        return
      }

      param = param || _default.param;
      beforeSubmitFunction = beforeSubmitFunction || _default.beforeSubmitFunction;
      afterSubmitFunction = afterSubmitFunction || _default.afterSubmitFunction;
      operateType = operateType || _default.operateType;

      beforeSubmitFunction(param);

      $.when(utils.ajax(_api(param, operateType, args))).done(function (res) {
        afterSubmitFunction(res);
      })
    },
  }
  // 对象
  this.object = {
    // [20201223] 在不可用 Oject.assign 时适用
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
    /**
     * [20210105] 监听js动态赋值元素change事件
     * @param id
     * @param classname
     * @param property
     * @param callback
     * [20210111][upd] 如果使用id 进行监听，通过dataset.val 取值
     */
    defineProperty: function (id, classname, property, callback) {
      var _cur = null
      if (id) {
        _cur = document.getElementById(id)
      }
      if (classname) {
        _cur = document.getElementsByClassName(classname)[0]
      }
      _cur && Object.defineProperty(_cur, property, {
        set: function (v) {
          if (id && _cur.value != v) {
            _cur.dataset.val = v
          }
          callback(v) // 0114
        }
      })
    },
    // [20201223] 对象转查询字符串
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
    // [20201223] 对象转数组
    toArray: function (obj) {
      var _obj = JSON.stringify(obj) == "{}" ? {} : obj;
      var _arr = [];
      for (var key in _obj) {
        _arr.push({
          label: _obj[key],
          value: key
        });
      };
      return _arr;
    },
    // [20210220][crt] 生成字段数组
    getColumnArray: function (columnStr) {
      var _str = "|" + str.replaceAll("\n", "")
      var _arr = _str.split("||")
      var _tar = []
      $.each(_arr, function (index, item) {
        if (item) {
          // _arr.splice(index,1)
          // }else{
          var _index = item.indexOf(" |")
          _tar.push(item.substring(0, _index))
        }
      })
      return _tar
    },
    // [20210512][cpy] 表单数组转对象
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
    }
  }
  // 文件对象
  this.file = {
    // 实例
    fileInit: new FileClass(),
    // 文件上传
    upload: function (event) {
      this.fileInit.upload(event);
    },
    // 查看文件
    preview: function (event) {
      this.fileInit.preview(event);
    },
    // 导出
    export: function (event) {
      this.fileInit.export(event)
    },
    // 获取JSON 文件
    getJSON: function (filePath, relativeFile, module) {
      var relativeFile = relativeFile || "fields";
      var module = module ? module == 1 ? "default" : module : "";
      var value;
      $.ajax({
        url: M + "/json/" + relativeFile + "/" + filePath + ".json",
        type: 'get',
        async: false,
        dataType: "json",
        success: function (data) {
          value = module ? data[module] : data;
          // [20210226][crt] 文件请求数据为空时输出提示信息
          if (!value) {
            console.group("—————— 文件请求数据为空（utils.file.getJSON） ——————");
            console.error("请求参数：", filePath, relativeFile, module);
            console.groupEnd();
            return
          }
          // 7.29 删除label
          if (value.hasOwnProperty("label")) {
            delete value.label;
          }
        }
      });
      return value;
    },
    // [20201228][upd] 获取模板文件
    getHTML: function (filePath) {
      var tmpl = "";
      $.ajax({
        url: filePath,
        type: 'get',
        async: false,
        success: function (data) {
          tmpl = data;
        }
      });
      return tmpl;
    }
  }
  // 路由对象
  this.router = {
    // [20210114][crt] 多门户公用更新路由地址
    updateRoter: function (pageJSON) {
      $.each(pageJSON.colBtns, function (index, item) {
        $.each(item.attrs, function (iindex, iitem) {
          if (item.function != "target" && item.function != "popup" && iitem.attr == "path" || iitem.attr == "back") {
            iitem.default = "/" + cur + iitem.default
          }
        })
      })
      $.each(pageJSON.btns, function (index, item) {
        $.each(item.attrs, function (iindex, iitem) {
          if (item.function != "target" && item.function != "popup" && iitem.attr == "path" || iitem.attr == "back") {
            iitem.default = "/" + cur + iitem.default
          }
        })
      })
    }
  }
  // 参数对象
  this.param = {
    // [20201222] 转换查询条件对象
    getQueryObject: function (pageJSON, queryForm) {
      $.each(pageJSON.query, function (index, item) {
        switch (item.type) {
          case "dateRange":
            // 请求参数
            queryForm[item.control.columns[0].id] = "";
            queryForm[item.control.columns[1].id] = "";
            break;
          case "range":
            // 请求参数
            queryForm[item.control.columns[0].id] = "";
            queryForm[item.control.columns[1].id] = "";
            break;
          default:
            queryForm[item.prop] = "";
            break;
        }
      });
    },
    // [20201216] 加载状态
    statusLoad: function (fields) {
      var _fields = fields;
      // 1215 加载状态值
      $.each(_fields, function (findex, fitem) {
        if (fitem.type == "select" || fitem.type == "radio") {
          // 1221 对于远程请求数据不予处理
          if (fitem.control && fitem.control.config && fitem.control.config.remote) {
            return;
          }
          var status = fitem.control && fitem.control.config.status;
          var module = fitem.control && fitem.control.config.module || "default";
          if (!window.statusTemp) {
            window.statusTemp = {};
          }
          if (!window.statusTemp[status]) {
            window.statusTemp[status] = {};
          }
          if (!window.statusTemp[status][module]) {
            // 对象-用于渲染时直接匹配对应的值，而不需遍历数组
            window.statusTemp[status][module + 'Object'] = utils.file.getJSON(status, "status", module);
            // 数组
            window.statusTemp[status][module] = utils.object.toArray(window.statusTemp[status][module + 'Object']);
          }
          fitem.control.config.queue = window.statusTemp[status][module];
        }
      });
      return ""
    },
    // [20210119][crt] 重排dataset 数组顺序
    reorderDatasetArray: function (datasetArray) {
      var _arr = new Array(datasetArray.length)
      $.each(datasetArray, function (index, item) {
        var _index = item.key.substring(item.key.lastIndexOf('-') + 1)
        _arr[_index - 1] = item
      })
      return _arr
    },
    // [20201209] dataset 转paramValue
    transferToParam: function (dataset) {
      if (!dataset || JSON.stringify(dataset) == "{}") {
        return "";
      }
      var _dataset = [];
      var _param = "";
      for (var key in dataset) {
        var _keyArr = key.split("_");
        var _key = "";
        $.each(_keyArr, function (index, item) {
          if (index > 0) {
            _key += item.substring(0, 1).toUpperCase() + item.substring(1).toLowerCase();
          } else {
            _key += item;
          }
        })
        var __obj = {}
        __obj.key = key;
        __obj.value = dataset[key];
        if (key.search("path") == -1) {
          _dataset.push(__obj);
        }
      }
      // 0119 重排数组
      if (_dataset.length > 0) {
        _dataset = utils.param.reorderDatasetArray(_dataset)
      }
      // 0113 整合参数
      var _otherparam = ""
      $.each(_dataset, function (index, item) {
        var _index = item.key.substring(item.key.lastIndexOf('-') + 1);
        // 0115
        if (item.key.search("title") >= 0) {
          item.value = encodeURIComponent(item.value)
        }
        // _index=0 ->  path
        if (_index != 0) {
          if (_index == 1) {
            _param += "paramValue=" + item.value + "&";
          } else if (index >= 4 && _dataset.length > 5) {
            // 0113 参数操作5个时，整合参数
            _otherparam += item.value + ","
            if (_index == _dataset.length) {
              _param += "paramValue5=" + _otherparam
            }
          } else {
            _param += "paramValue" + (+_index) + "=" + item.value + "&";
          }
        }
      })
      return _param.substring(0, _param.length - 1);
    },
    // [20201228][crt] dataset 转对象
    transferToObject: function (dataset) {
      var _obj = {}
      for (var key in dataset) {
        var _key = key.split("-")[0]
        var _keyArr = _key.split("_")
        var __key = ""
        $.each(_keyArr, function (index, item) {
          if (index > 0) {
            __key += item.substring(0, 1).toUpperCase() + item.substring(1).toLowerCase();
          } else {
            __key += item;
          }
        })
        _obj[__key] = dataset[key]
      }
      return _obj;
    },
    // [20201215][crt] 影像资料数组处理
    pretreatImgInfos: function (imgInfos) {
      var _imgInfos = imgInfos;
      var _data = {};
      $.each(_imgInfos, function (index, item) {
        var _obj = {}
        var _url = item.docImgUrl;
        var _key = null;
        _obj.fileName = _url.substring(_url.indexOf('.') + 1);
        _obj.rowId = item.rowId;
        _obj.remark = item.remark;
        _obj.fileNumber = item.docImgName;
        _obj.docImgUrl = item.docImgUrl;

        switch (item.contrImgType) {
          // 送货单
          case '2':
            _key = "delivery";
            break;
            // 收货单
          case '3':
            _key = "tmall";
            break;
            // 签收单
          case '4':
            _key = "receipt";
            break;
            // 物流单
          case '5':
            _key = "sheet";
            break;
            // 物流单
          case '6':
            _key = "Inspection";
            break;
            // 其他补充资料
          case '7':
            _key = "otherToncat";
            break;
            // 采购合同、订单
          case '8':
            _key = "sellTonct";
            break;
            // 对账单
          case '9':
            _key = "valueTonct";
            break;
            // 发票
          case '11':
            _key = "receTonct";
            break;
        }
        _data[_key] = _obj;
      })
      return _data;
    },
    // [20210201][crt] 删除对象中空字符串属性
    removeObjectNullAttributes: function (object) {
      if (!$.isPlainObject(object)) {
        return object
      }
      var _object = {}
      for (var key in object) {
        if (object[key] || typeof (object[key]) == "boolean") {
          _object[key] = object[key]
        }
      }
      return _object
    },
    // [20210202][crt] 获取token
    getToken: function () {
      var token = false;
      $.when(utils.ajax(apis.common.getTokent())).done(function (res) {
        token = res.tokent;
      })
      // $.ajax({
      // 	type:"get",
      // 	async:false,
      // 	url:M+"/tokent/getTokent.do",
      // 	dataType: "json",
      // 	success:function(data){
      // 		if(data.code=='000000'){
      // 			tokent=data.data.tokent;
      // 			console.log('service:'+tokent);
      // 		}else{
      // 			tokent=null;
      // 			layer.msg("获取Tokent错误,提交失败!");
      // 		}
      // 	},error:function(){
      // 		layer.msg("网络异常请重试");
      // 	}
      //
      // });
      return token;
    },
    // [20210219][upd] 通过数组匹配对应字段
    matchFieldsFromArray: function (pageJSON) {
      var _json = pageJSON,
        _fields = _json.query,
        _array = [];
      if (!_json) {
        return
      }
      // 条件查询字段
      if (_json.hasOwnProperty('queryArray') && $.isArray(_json.queryArray) && _json.queryArray.length > 0) {
        _fields = _json.query;
        _array = _json.queryArray;

        $.each(_fields, function (index, item) {
          item.prop = _array[item.propIndex]
        })
      }
      // 列表字段
      if (_json.hasOwnProperty('fieldArray') && $.isArray(_json.fieldArray) && _json.fieldArray.length > 0) {
        _fields = _json.fields;
        _array = _json.fieldArray;

        $.each(_fields, function (index, item) {
          if (item.label != "操作") {
            item.prop = _array[item.propIndex]
          }
        })
      }
      // 新增字段
      if (_json.hasOwnProperty('cardArray') && $.isArray(_json.cardArray) && _json.cardArray.length > 0) {
        _fields = _json.cards;
        _array = _json.cardArray;

        $.each(_fields, function (index, item) {

          if ($.isArray(_array[item.cardIndex]) && _array[item.cardIndex].length > 0) {

            var __fields = item.fields;
            var __array = _array[item.cardIndex];

            $.each(__fields, function (_index, _item) {
              _item.prop = __array[_item.propIndex]
            })

          }
        })
      }
    },
    // [20210309][upd] 参数编码
    encodeParams: function (params) {
      var _params = params,
        reg = new RegExp("[\u4e00-\u9fa5]", "g") // 0115
      for (var key in _params) {
        if (reg.test(_params[key])) {
          _params[key] = encodeURIComponent(_params[key])
        }
      }
    }
  }
  // 渲染对象
  this.renderTemp = {
    // [20201228][upd] 渲染模板文件
    template: function (elem, template, tmplData) {
      var tmplData = JSON.stringify(tmplData) == "{}" ? null : tmplData;
      var elem = elem ? elem : "body";
      $(elem).html("");
      $.tmpl(template, tmplData).appendTo(elem);

      // utils.operate.removeLoad()
    }
  }

  // dom 对象
  this.dom = {
      // page_1 基础运营商-运营商参数配置
      trigger: function (elemId, triggerType) {
        if (triggerType == "showRequired") {
          var _requiredTip = "<span style='color: red;'>*</span>"
          $("#" + elemId).attr({
            readonly: false,
            required: true
          }).parent().parent().show()
          $("#" + elemId).parent().prev().prepend(_requiredTip)
        }
        if (triggerType == "hideRequired") {
          $("#" + elemId).parent().prev().find("span").remove()
          $("#" + elemId).val("").attr({
            readonly: false
          }).removeAttr("required").parent().parent().hide();
        }
      },
      // [20210309][upd] 重置上传控件
      resetUploadComponent: function (elementId) {
        var _template = "" +
          "	<div class='upload-file m-0-i'>" +
          "		<button type='button' class='upload-button'>选择文件</button>" +
          "		<input type='file' class='companyInput' name='" + elementId + "' onchange='eventInit.upload(event)' data-filesize='10' data-filetype='jpg,png,pdf' data-tip='支持PDF、JPG、PNG文件，最大10M' onclick='eventInit.tip(event)'>" +
          "		<input type='text' class='companyInput file-path' style='color: transparent;' id='" + elementId + "' name='" + elementId + "' value='' required='' aria-required='true'>" +
          "	</div>" +
          "	<button type='button' class='p-rel check m-0-i previewEv d-none' id='" + elementId + "' onclick='eventInit.preview(event)' data-path=''>查看文件</button>" +
          "";
        return _template;
      }
    },
    // log 对象
    this.log = {
      warn: function (message, data) {
        console.group("!!!!! 警告提示（error） !!!!!");
        console.error("提示信息：", message);
        console.error("提示数据：", data);
        console.groupEnd()
      },
      error: function (message, data) {
        console.group("????? 错误提示（error） ?????");
        console.error("错误信息：", message);
        console.error("错误数据：", data);
        console.groupEnd()
      }
    },
    this.$msg = function (message) {
      layui.use('layer', function () {
        var layer = layui.layer
        layer.msg(message)
      })
    }
  // 模板缓存
  this.templateCache = {}
  // 模板对象：将html 和js 代码进行分离
  /**
   * 模板对象-缓存模板
   * @param {String} tempaltePath ：模板路径
   * @param {Boolean} isNotCache ：是否缓存模板
   * @returns 
   */
  this.template = function (tempaltePath, isNotCache) {
    // 截取模板名称
    var templateName = tempaltePath.substring(tempaltePath.lastIndexOf('/') + 1)
    // 缓存模板
    if (!isNotCache && !this.templateCache[templateName]) {
      this.templateCache[templateName] = this.file.getHTML(tempaltePath)
    }
    // 请求模板文件
    this.templateString = this.templateCache.hasOwnProperty(templateName) && this.templateCache[templateName] || this.file.getHTML(tempaltePath)
    // 执行渲染
    /**
     * 模板对象-渲染模板
     * @param {String} elem ：将模板添加到指定html 元素
     * @param {Object} tmplData ：模板数据
     * @param {Boolean} isAppend ：是否采用追加方式添加到html 元素中
     */
    this.render = function (elem, tmplData, isAppend) {
      var tmplData = JSON.stringify(tmplData) == "{}" ? null : tmplData;
      var elem = elem ? elem : "body";
      // 是否采用追加方式添加模板代码
      if (!isAppend) {
        $(elem).html("");
        $.tmpl(this.templateString, tmplData).appendTo(elem);
      } else {
        $(elem).append('<div></div>')
        $.tmpl(this.templateString, tmplData).appendTo(elem + '>div:last-child');
      }
    }
    // [20210514][demand] 划分接口请求前后数据，请求后数据局部渲染
    return this
  }
  // 请求对象
  this.ajax = function (requestOption) {
      console.warn("- 注意：执行请求（ES.$ajax）前，需配置后台请求地址（SERVER_IP），格式：var AJAX_CONFIG = { SERVER_IP: 'http://127.0.0.1:8080' }")
      /* 请求发送前拦截器 */
      // 登录超时
      /* 请求参数默认值配置 */
      // 默认配置
      var $dtd = $.Deferred(),
        _config = {},
        _default = {
          type: "get"
        }
      // [20210512][upd] 可配置响应成功结果code 值
      var REQUEST_SUCCESS_CODE = requestOption.hasOwnProperty('code') && requestOption.code ||
        AJAX_CONFIG.hasOwnProperty('code') && AJAX_CONFIG.code ||
        AJAX_CONFIG.hasOwnProperty('CODE') && AJAX_CONFIG.CODE ||
        AJAX_CONFIG.hasOwnProperty('REQUEST_SUCCESS_CODE') && AJAX_CONFIG.REQUEST_SUCCESS_CODE ||
        '200'
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
      if (requestOption.hasOwnProperty('code')) {
        delete requestOption.code
      }
      // 请求成功
      var defaultSuc = function (res) {
        console.group("—————— 响应结果（result） ——————");
        if (res.code == REQUEST_SUCCESS_CODE) {
          console.log("响应结果(res)：", res);
          $dtd.resolve(res);
        } else {
          console.warn("响应结果(code)：", res.code, REQUEST_SUCCESS_CODE);
          console.warn("响应结果(data)：", res.data);
          console.warn("响应结果(message)：", res.message);
          layer.msg(res.message);
          $dtd.reject(res);
        }
        console.groupEnd();
      }
      var defaultSucResultFilter = function (res) {
        console.group("—————— 响应结果（result filter） ——————");
        if (res.code == REQUEST_SUCCESS_CODE) {
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
        // this.operate.removeLoad();
      }
      // complete
      var defaultComplete = function (xhr, status) {}
      var defaultCompleteRemoveLoading = function (xhr, status) {
        // this.operate.removeLoad();
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
        _config.url += "?" + this.object.toQuery(_config.data || _config.datas);
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
        _config.data = this.param.removeObjectNullAttributes(_config.data) // [20210202]
      }
      if (_config.hasOwnProperty('ignoreJSONFormat')) {
        delete _config.ignoreJSONFormat;
      }
      /* 请求发送 */
      _config.url = (AJAX_CONFIG && AJAX_CONFIG.hasOwnProperty('BASE_URL') && AJAX_CONFIG.BASE_URL ||
          AJAX_CONFIG && AJAX_CONFIG.hasOwnProperty('SERVER_IP') && AJAX_CONFIG.SERVER_IP ||
          window.location.href.substring(0, window.location.href.indexOf('/', 8) + 1)) +
        _config.url;

      $.ajax(_config);

      return $dtd;
    },
    this.$ajax = function (requestApi, resolve, reject, always) {
      $.when(this.ajax(requestApi)).done(function (res) {
        console.log("when.done:", res)
        resolve(res)
      }).fail(function (err) {
        console.log("when.fail:", err)
        reject(err)
      }).always(function (res) {
        always && $.isFunction(always) && always(res)
      })
    }
}

/**
 * [20200813] 文件操作对象
 * @constructor
 */
function FileClass() {
  /**
   * [20201223][RUN] Canvas文件压缩处理
   * @param bdata - 文件数据流
   * @param dtd
   * @returns {*}
   */
  this.compressImage = function (bdata, dtd) { //压缩图片
    var quality = 0.5; //压缩图片的质量 取值[0, 1]
    var oldimglength = bdata.length; //压缩前的大小

    var compresRadio = 0; // 压缩率
    var canvas = document.createElement("canvas"); //创建画布
    var ctx = canvas.getContext("2d");
    var img = new Image();
    img.src = bdata;
    img.onload = function () {
      // 设置画布尺寸
      canvas.width = img.width;
      canvas.height = img.height;
      // 绘制图片
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      // 转Base64
      var cdata = canvas.toDataURL("image/jpeg", quality); //格式需要设置为jpeg，png 格式压缩会变大
      // $("img").attr("src",cdata); //若需要预览
      var newimglength = cdata.length;
      // 解码
      var bstr = atob(cdata.split(',')[1]);
      var len = bstr.length;
      // 创建无符号型数组
      var u8arr = new Uint8Array(len);
      // 拷贝数组
      while (len--) {
        u8arr[len] = bstr.charCodeAt(len);
      }
      // 转成Blob
      var blob = new Blob([u8arr], {
        type: "image/jpeg"
      });
      // 统计信息
      compresRadio = (((oldimglength - newimglength) / oldimglength * 100).toFixed(2)) + '%';
      console.log("图片信息 [尺寸（像素）: " + canvas.width + "×" + canvas.height + "][质量（%）:" + quality * 100 + "%] [压缩率（%）:" + compresRadio + "] [压缩后大小（M）:" + (newimglength / 1024 / 1024) + "]");

      // 使用$.deferred 进行同步处理
      dtd.resolve(blob);
    }
    // 使用$.deferred 进行同步处理
    return dtd;
  }

  /**
   * [20201223][RUN] 文件上传请求
   * @param formData - 文件数据流
   * @param index - 遮罩弹窗id
   * @param fileName - 文件名
   * @param url - 自定义上传接口
   * @returns {string} - 上传成功返回服务器路径
   */
  this.uploadOperate = function (formData, index, fileName, url) {
    // 返回路径
    var filePath = ""
    // 过长文件名截取
    if (fileName.length > 10) {
      fileName = fileName.substring(0, 8) + "..." + fileName.substring(fileName.length - 6);
    }
    // 兼容IE文件上传处理
    var formFile = new FormData();
    formFile.append("file", formData, fileName);
    // 计时
    var start = new Date().getTime();

    $.when(utils.ajax(apis.common.fileUpload(formFile))).done(function (res) {
      utils.operate.removeLoad()
      var end = new Date().getTime();
      console.log("耗时：" + (end - start) + "ms")
      if (res.code === '000000') {
        filePath = res.filePath
        layer.msg(TIPSEV.FILE_UPLOAD_SUCCESS)
        layer.close(index)
      } else {
        layer.msg(TIPSEV.FILE_UPLOAD_ERROR + res.message)
        layer.close(index)
      }
    }).fail(function (reject) {
      utils.operate.removeLoad()
      layer.close(index)
    })
    return filePath
  }

  /**
   * [20201223][RUN] 文件上传 - 使用Canvas支持文件压缩上传
   * @param event - 当前元素
   * @param isZip - 是否执行压缩上传（限图片）
   * @param url - 自定义上传接口
   * @returns {boolean|*}
   */
  this.fileJudgeOperate = function ($event, isZip, url) {
    utils.operate.addLoading()
    var _this = this
    var _etarget = $event.target
    var dtdUtil = $.Deferred()
    var isCheck = true
    var _isZip = isZip

    var _elem = $(_etarget)
    var _fileObj = _etarget.files[0]
    var _fileName = _fileObj.name.toLowerCase()
    var _fileSize = $(_etarget).data('filesize') || 10
    var _fileType = $(_etarget).data('filetype').split(",")

    var isImgTypes = false // 是否为图片
    var isPdf = false // 是否为PDF
    var typeMsg = "" // 图片所支持格式

    // 格式校验
    for (var i = 0; i < _fileType.length; i++) {
      if (i < _fileType - 1) {
        typeMsg += _fileType[i] + "、"
      } else {
        typeMsg += _fileType[i]
      }

      if (_fileName.lastIndexOf(('.' + _fileType[i])) >= 0) {
        isImgTypes = true
        if (_fileName.lastIndexOf(('.pdf')) >= 0) {
          isPdf = true
        }
      }
    }
    // 非空校验
    if (!_fileObj) {
      isCheck = false
      return isCheck
    }
    if (!isImgTypes) {
      layer.msg("只支持上传" + typeMsg + "文件")
      utils.operate.removeLoad()
      isCheck = false
      return isCheck
    }
    // 文件大小判断
    if (_fileObj.size > _fileSize * 1024 * 1024) {
      // if(isPdf && _fileObj.size > _fileSize*1024*1024){
      utils.operate.removeLoad()
      layer.msg("上传的文件不能超过" + _fileSize + "M...")
      isCheck = false
      return isCheck
    }
    // 格式大小检查通过，执行上传
    if (isCheck) {
      // 遮罩层
      var index = layer.load(2, {
        shade: [0.1, '#333']
      })
      var img_size = _fileObj.size; //用来判断大小
      if (img_size >= 1024 * 1024 * 0.1 && !isPdf && _isZip) { //意思是大于0.5m 就进行处理
        var dtd = $.Deferred(); // 新建一个deferred对象
        const reader = new FileReader(); //图片预览
        reader.readAsDataURL(_fileObj);
        reader.onload = function (e) {
          $.when(_this.compressImage(e.target.result, dtd)).done(function (args) {
            dtdUtil.resolve(_this.uploadOperate(args, index, _fileName, url));
          });
        }
      } else {
        dtdUtil.resolve(_this.uploadOperate(_fileObj, index, _fileName, url));
      }
    }
    return dtdUtil;
    // }
  }

  /**
   * [20201223][RUN] pdf 文件预览兼容IE
   * @returns {boolean}
   */
  this.testIEPdfStorage = function () {
    var eFlag;
    if (window.ActiveXObject || "ActiveXObject" in window) {
      //判断是否为IE浏览器，"ActiveXObject" in window判断是否为IE11
      //判断是否安装了adobe Reader
      for (x = 2; x < 10; x++) {
        try {
          oAcro = eval("new ActiveXObject('PDF.PdfCtrl." + x + "');");
          if (oAcro) {
            eFlag = true;
          };
        } catch (e) {
          eFlag = false;
        };
      };
      try {
        oAcro4 = new ActiveXObject('PDF.PdfCtrl.1');
        if (oAcro4) {
          eFlag = true;
        }
      } catch (e) {
        eFlag = false;
      };

      try {
        oAcro7 = new ActiveXObject('AcroPDF.PDF.1');
        if (oAcro7) {
          eFlag = true;
        }
      } catch (e) {
        eFlag = false;
      };

      if (!eFlag) { //支持
        alert("对不起,您还没有安装PDF阅读器软件呢,为了方便预览PDF文档,请选择安装！");
        window.location.href = "http://ardownload.adobe.com/pub/adobe/reader/win/9.x/9.3/chs/AdbeRdr930_zh_CN.exe";
      }
    } else {
      eFlag = true;
    }
    return eFlag;
  }

  /**
   * [20201223][RUN] 获取文件路径
   * @param fileUrl
   * @param tmpFlag
   * @returns {string}
   * [20210120][upd] 路径解码
   */
  this.getFilePath = function (fileUrl, tmpFlag) {
    var _dtd = $.Deferred()
    if (fileUrl && fileUrl.length > 0) {
      var data = {
        filename: decodeURIComponent(fileUrl),
        tmpFlag: tmpFlag || false
      }

      $.when(utils.ajax(apis.common.filePreview(data))).done(function (res) {
        utils.operate.removeLoad()
        if (res == null) {
          layer.msg("查看文件失败");
          return;
        }
        if (res.code == '000000') {
          _dtd.resolve(res.tmpPath)
        } else {
          return;
        }
      })
    }
    return _dtd;
  };

  /**
   * [20201223][RUN] 文件上传
   * @param eventObject
   * 依赖组件 <div class="upload-comp" data-version="20201218">
   */
  this.upload = function (eventObject) {
    var _this = this
    var _elem = $(eventObject.target);
    _this.fileJudgeOperate(eventObject, true).done(function (args) {
      utils.operate.removeLoad();
      if (args) {
        // <input type=hidden/>
        // [20210224][upd] 修改回显
        _elem.parent().children("input[type='text'].file-path").val(args);
        // <button>查看文件</button>
        _elem.parent().next().show().attr('data-path', args);
      }
    })
  }

  /**
   * [20201223][RUN] 查看文件
   * @param eventObject
   */
  this.preview = function (eventObject) {
    // 0120 upd
    var _fileUrl = $(eventObject.target)[0].dataset.path
    var _this = this
    if (_fileUrl.length > 0) {
      //获取文件后缀
      var suffix = _fileUrl.toLowerCase().split('.').splice(-1);
      var flag = true;
      if ("pdf" == suffix) {
        flag = _this.testIEPdfStorage();
      }
      if (flag) {
        $.when(utils.operate.addLoading("文件操作中，请稍等...")).done(function () {
          $.when(_this.getFilePath(_fileUrl)).done(function (tmpUrl) {
            layer.open({
              type: 2,
              title: "文件查看",
              area: ['90%', '80%'],
              shadeClose: false,
              shade: 0.8,
              content: M + tmpUrl
            });
          })
        })
      }
    } else {
      layer.msg("暂无文件");
    }
  }

  /**
   * [20210106][crt] 导出excel
   * @param elem
   * @param url
   */
  this.export = function (eventObject) {
    var _dataset = utils.param.transferToObject(eventObject.target.dataset)
    var _size = $('tbody').find('tr').length
    if (!_size) {
      layer.msg(TIPSEV.NO_DATA_EXPORT_WARNING)
      ret
    }
    if (confirm(TIPSEV.EXPORT_CONFIRM_TIP)) {
      var _action = apis.BASE_URL + "/" + _dataset.gate + apis.common[_dataset.url]()
      $("form").attr("action", _action)
      $("form").submit()
    }
  }
}

/**
 * [20201224] 事件中心-托管常用事件
 * @constructor
 */
function EventClass() {
  this.getListData = null // 查询列表方法
  this.getFormData = null // 查询详情方法
  this.billSample = null // 票据实例
  /**
   * [20201224][crt] 初始化
   */
  this.init = function (callback) {
    this.getListData = null
    this.getFormData = null
    this.billSample = null
    callback(this)
  }
  /**
   * [20201224][crt] 条件查询
   * @param pageFlag - 是否为分页查询
   * [20210119][upd] 添加同步操作，在页面数据渲染结束后，再移除加载框
   *  - 使用时，需要在getListData 方法中使用形参dtd 并return
   */
  this.search = function (pageFlag) {
    if (!pageFlag) {
      $("#pageNo").val($("#pageNo").data('default'))
      $("#pageSize").val($("#pageSize").data('default'))
    }
    this.getListData()
  }
  /**
   * [20201224][crt] 按钮重置
   * [20210119][upd] 添加同步操作，在页面数据渲染结束后，再移除加载框
   *  - 使用时，需要在getListData 方法中使用形参dtd 并return
   */
  this.reset = function () {
    $("#query").serializeObjectNew(1)
    $("#pageNo").val($("#pageNo").data('default'))
    $("#currentPage").val($("#currentPage").data('default'))
    $("#pageSize").val($("#pageSize").data('default'))
    this.getListData()
  }
  /**
   * [20201224][crt] 加载详情页数据
   * [20210119][upd] 添加同步操作，在页面数据渲染结束后，再移除加载框
   *  - 使用时，需要在getListData 方法中使用形参dtd 并return
   */
  this.loadForm = function () {
    this.getFormData();
  }
  /**
   * [20201224][crt] 文件上传
   * @param e - 事件对象
   */
  this.upload = function (e) {
    utils.file.upload(e)
  }
  /**
   * [20201224][crt] 预览图片
   * @param e - 事件对象
   */
  this.preview = function (e) {
    utils.file.preview(e)
  }
  /**
   * [20201224][crt] 页面跳转
   * @param e - 事件对象
   * [20210106][upd] 公用页面，返回页存放到隐藏域中，通过判断是否存在优先按隐藏域跳转
   */
  this.forward = function (e) {
    var dataset = e.target.dataset
    var _path = dataset.path
    // 解析参数值
    var _param = utils.param.transferToParam(dataset)
    // 0106
    if ($("#back").val()) {
      _path = $("#back").val()
    }
    $('#rightContent').load(M + "/pagePath" + _path + ".do?random=" + Math.random() + (_param ? "&" : "") + _param)
  }
  /**
   * [20201225][crt] 弹窗
   * @param e - 事件对象
   * @param operate - 操作类型，选择操作
   * [20201228][upd] 添加operate
   * [20210107][upd] 需求：
   *  1.弹窗选择后，operate="select"
   *  2.可配置弹窗尺寸
   *  3.添加直接触发关闭弹窗 operate=close
   */
  this.popup = function (e, operate) {
    // 0107 关闭弹窗
    if (operate == "close") {
      var _index = parent.layer.getFrameIndex(window.name)
      parent.layer.close(_index)
      return
    }
    var dataset = e.target.dataset
    var _dataObj = utils.param.transferToObject(dataset)
    if (operate == "select") {
      // [20201228][upd] 选择
      // var _dataObj = utils.param.transferToObject(dataset)
      var _index = parent.layer.getFrameIndex(window.name)
      parent.$("form").populateForm(_dataObj)
      parent.layer.close(_index)
    } else {
      // 解析参数值
      var _param = utils.param.transferToParam(dataset)
      var _page = "tablePopup"
      if (_dataObj.template) {
        _page = "formPopup"
      }

      var _width = "90%",
        _height = "80%"
      var _size = _dataObj.popupsize
      if (_size) {
        _sizeArr = _size.split(",")
        _width = _sizeArr[0] + "%"
        if (_sizeArr.length > 1) {
          _height = _sizeArr[1] + "%"
        }
      }
      layer.open({
        type: 2,
        title: _dataObj.title,
        maxmin: false,
        shadeClose: true, //点击遮罩关闭层
        area: [_width, _height],
        content: M + "/pagePath/common/" + _page + ".do?" + _param
      })
    }
  }
  /**
   * [20201224][crt] 票据事件
   * @param e
   * @param operate - front/back/level/print
   * [20210119][upd] 添加同步操作。
   */
  this.bill = function (e, operate) {
    var _this = this.billSample
    var _dtd = $.Deferred() // 0119
    switch (operate) {
      case "front":
        if (!_this.responseData.hasOwnProperty("front")) {
          $.when(_this.requestData(_this.queryParam, "front")).done(function (res) {
            _this.responseData.front = res;
            // 通过事件中心，暴露对应回调方法
            if (_this.eventCenter.front) {
              _this.eventCenter.front(res);
            }
            _this.transfer("front")
            _dtd.resolve(res) // 0119
          });
        } else {
          _this.transfer("front")
          _dtd.resolve() // 0119
        }
        break
      case "back":
        if (!_this.responseData.hasOwnProperty("back")) {
          $.when(_this.requestData(_this.queryParam, "back")).done(function (res) {
            _this.responseData.back = res.data;
            // 通过事件中心，暴露对应回调方法
            if (_this.eventCenter.back) {
              _this.eventCenter.back(res.data);
            }
            // 注意：需要首先展示层次图渲染，否则层次图尺寸会丢失
            $("#bill-back").hide();
            $("#bill-level").show();
            // 渲染层次图
            _this.renderSvg(res.data);
            _this.transfer("back")
            _dtd.resolve(res) // 0119
          });
        } else {
          _this.transfer("back")
          _dtd.resolve() // 0119
        }
        break
      case "level":
        _this.transfer("level")
        break
      case "print":
        printPage('bill')
        break
    }
    return _dtd // 0119
  }

  /**
   * [20201229][crt] 直接触发事件
   * @param e
   * [20210106][upd] 接口添加门户类型，如果存在则去门户对象_gate 中接口
   */
  this.native = function (e) {
    if (confirm(TIPSEV.NATIVE_OPERATE_MESSAGE)) {
      var dataset = e.target.dataset
      var _dataObj = utils.param.transferToObject(dataset)
      var _api = _dataObj.api
      var _gate = _dataObj.gate
      // var _apiEx = _apiEv[_api]

      delete _dataObj.api
      delete _dataObj.gate

      // if (_gate) {
      // 	_apiEx = apis[_gate][_api]
      // }
      $.when(utils.ajax(apis[_gate][_api](_dataObj))).done(function (res) {
        if (res.code == "000000") {
          layer.msg(TIPSEV.NATIVE_OPERATE_SUCCESS)
          utils.operate.delayInvokeFn(function () {
            eventInit.search()
          })
        } else {
          layer.msg(TIPSEV.NATIVE_OPERATE_ERROR + res.message)
        }
      })
    }
  }

  /**
   * [20201230][crt] 切换tab
   * @param e
   */
  this.tabchange = function (e) {
    var dataset = e.target.dataset
    // 是否已经是显示tab
    var _iscur = $(e.target).hasClass('active')
    if (!_iscur) {
      $(".tabs-warp ul li").removeClass('active')
      $(e.target).addClass('active')
      $(".tabs-items .tabs-item").removeClass('active')
      $(".tabs-items .tabs-item:nth-of-type(" + (+dataset.index + 1) + ")").addClass('active')
    }
  }

  /**
   * [20201230][crt] 文字提示
   * @param e
   * [20210311][upd] 只有不为空才提示信息
   */
  this.tip = function (e) {
    var dataset = e.target.dataset
    dataset.tip && layer.tips(dataset.tip, e.target, {
      tips: [1, '#3595CC'],
      time: 3000
    });
  }
  /**
   * [20210105][crt] 监听日期选择
   * @param e
   */
  this.changeDate = function (e) {
    var _cur = e.value
    var _id = e.name
    if (_cur) {
      $("." + _id).val(_cur).blur()
    }
  }
  /**
   * [20210106][crt] 导出
   * @param e
   */
  this.export = function (e) {
    utils.file.export(e)
  }
  /**
   * [20210106][crt] 跳转新标签页
   * @param e
   */
  this.target = function (e) {
    var _dataset = e.target.dataset
    var _params = utils.param.transferToParam(_dataset)
    window.open(apis.BASE_URL + "/pagePath" + _dataset.path + ".do?" + _params)
  }
  /**
   * [20210106][crt] 打印
   * @param e
   */
  this.print = function (e) {
    var _dataset = e.target.dataset
    var _element = _dataset.element
    var _printElement = "bill"
    if (_element) {
      _printElement = _element
    }
    printPage(_printElement)
  }
  /**
   * [20210107][crt] 获取验证码
   * @param e
   * - [20210120][upd] 点击更新验证码
   */
  this.code = function (e) {
    $('#codesLink').find("img").attr('src', apis.BASE_URL + '/userLogin/getValidateCode.do?x=' + Math.random() + '');
  }
}

/**
 * [20210104] tab
 * [20200104][bug][测试环境] 除必填项阻塞提交，其余校验规则不影响提交
 * @constructor
 */
function TabChangeControl() {
  this.tabFields = null
  this.data = null
  // 实例化
  this.init = function (tabFields, data) {
    this.tabFields = tabFields
    this.data = data
  }
  // 设置表单校验规则
  this.setValidRules = function (tabFields) {
    var _pageJSON = tabFields
    var _rules = {}
    var _this = this
    $.each(_pageJSON, function (index, item) {
      if (item.type == 'form') {
        _this.private.ergodicCheck(item.fields, _rules)
      }
      if (item.type == "table") {
        $.each(item.tbody, function (trindex, trfield) {
          _this.private.ergodicCheck(trfield, _rules)
        })
      }
    })
    return _rules
  }
  // 校验tab
  this.validTabRequired = function () {
    var _this = this
    if (!_this.tabFields) {
      return false
    }
    var _tabFields = _this.tabFields,
      _data = _this.data
    var flag = true,
      isFound = false // flag 是否校验通过， isFound 是否已找到必填未通过项
    $.each(_tabFields, function (index, elem) {
      // 如果遇到校验不通过，不继续校验下一tab页
      if (flag) {
        flag = _this.validRequired(elem, _data)
      }
      if (!flag && !isFound) {
        if (elem.type == "table" && !isFound) {
          layer.msg("存在未填项或未选择项", {
            anim: 1
          });
        }
        isFound = true // 标识已找到校验未通过项对应tab页
        $(".tabs-warp li").removeClass("active");
        $(".tabs-warp li:nth-of-type(" + (index + 1) + ")").addClass("active");

        $(".tabs-items .tabs-item").removeClass("active");
        $(".tabs-items .tabs-item:nth-of-type(" + (index + 1) + ")").addClass("active");

        setTimeout(function () {
          // 触发表单校验，将对应验证未通过项定位出来
          $("input[type='submit']").click()
        }, 100)
      }
    })
    return flag
  }
  // 校验必填
  this.validRequired = function (fields, data) {
    var _fields = fields.fields,
      _data = data,
      _type = fields.type
    var flag = true,
      isFound = false
    var _this = this
    if (_type == 'table') {
      _fields = fields.tbody
    }
    $.each(_fields, function (idx, item) {
      var _valid = null
      if (_type == 'table') {
        $.each(item, function (tridx, tritem) {
          if (!isFound) {
            _valid = _this.validColumn(tritem, _data, isFound)
            flag = _valid.flag
            isFound = _valid.isFound
          }
        })
      } else {
        if (!isFound) {
          _valid = _this.validColumn(item, _data, isFound)
          flag = _valid.flag
          isFound = _valid.isFound
        }
      }
    })
    return flag
  }
  // 校验单字段规则
  this.validColumn = function (item, data, isFound) {
    var _obj = {
      flag: true,
      isFound: false
    }
    // 条件：设置表单字段（prop）、控制配置、必填项、未找到对应项
    if (item.prop && item.control && item.control.required && !isFound) {
      if (!data[item.prop]) {
        _obj.flag = false
        _obj.isFound = true
      }
    }
    // 必填额外校验规则
    if (item.prop && item.control && item.control.valid && item.control.valid.length > 0 && !isFound) {
      $.each(item.control.valid, function (vindex, vitem) {
        switch (vitem) {
          case "validRatio":
            if (!checkFitRange(data[item.prop], 0, 1)) {
              _obj.flag = false
              _obj.isFound = true
            }
            break;
        }
      })
    }
    return _obj
  }
  // 非公开调用方法
  this.private = {
    /**
     * 遍历当前tab页下所有表单元素，并添加到校验规则中
     * @param fields
     * @param rules
     */
    ergodicCheck: function (fields, rules) {
      var _fields = fields,
        _rules = rules
      $.each(_fields, function (index, item) {
        if (item.prop && item.control.required) {
          _rules[item.prop] = {
            required: true
          }
        }
        if (item.control.valid && item.control.valid.length > 0) {
          $.each(item.control.valid, function (vindex, ruleKey) {
            if (!_rules[item.prop] || JSON.stringify(_rules[item.prop]) == "{}") {
              _rules[item.prop] = {}
            }
            _rules[item.prop][ruleKey] = true
          })
        }
      })
    }
  }
}

/**
 * [20201223] 当前页面对象
 * @constructor
 */
function PageClass() {
  this.pageJSON = null;
  // 默认请求参数
  this.queryForm = {
    pageNo: 1,
    currentPage: 1,
    pageSize: 3
  };
  this.getListData = null; // 1208 请求列表数据
  this.getFormData = null; // 1210 请求详情数据
  this.formRules = null; // 1221 绑定校验规则
  this.submitHandler = null; // 1221 绑定表单提交方法
  // 初始化
  this.init = function (pageJSON, callback) {
    // [20210202][upd]
    this.getListData = null
    this.getFormData = null

    var _curPage = this; // 0126
    if (pageJSON.type == "table") {
      // 绑定条件查询参数
      this.bindQuery(pageJSON);
    }
    // 0119 加载框
    utils.operate.addLoading()
    // 页面组成json，渲染整个页面
    this.renderTemplate(pageJSON)
    callback(this)
    // [20201224][crt] 事件中心初始化
    eventInit.init(function (eventCenter) {
      if (_curPage.billSample) {
        eventCenter.billSample = _curPage.billSample
      }
      // 绑定列表查询事件
      if (_curPage.getListData) {
        eventCenter.getListData = _curPage.getListData
        // 首次触发
        eventInit.search()
      }
      if (_curPage.getFormData) {
        eventCenter.getFormData = _curPage.getFormData
        // 首次触发
        eventInit.loadForm()
      }
      // [20210119][upd] getFormData 未设置时移除加载动效。
      if (pageJSON.type === "form" && !_curPage.getFormData) {
        utils.operate.removeLoad() // 0119
      }
    })
  };
  // 绑定条件请求参数
  // callback - 追加默认参数
  this.bindQuery = function (pageJSON, callback) {
    var _this = this;
    // 生成查询条件对象
    utils.param.getQueryObject(pageJSON, _this.queryForm);
  };
  // 1221 表单规则绑定-触发绑定校验规则/提交表单方法
  this.bindFormValidate = function (callback) {
    callback();
    var _this = this;
    $().ready(function () {
      $("#formEv").validate({
        /*
         * rules 基本框架
         * rules：{
         *   finanAmtKmt[input:name]: {
         *       requried: true,
         *       IDCard: true, // 自定义校验规则，通过jQuery.validator.addMethod(validatorName, callback)，在additional-methods-extend.js 中定义
         *   }
         * }
         * */
        rules: _this.formRules,
        submitHandler: function (form) {
          // 获取表单中input[name] 属性对象
          var _formData = $("form").serializeObjectNew()
          // [20210202][ext] 遍历表单元素，存在多个同名name 时，移除同名空值元素，保留最后一个
          // for(var key in _formData){
          // 	if($.isArray(_formData[key])){
          // 		$.each(_formData[key], function(index,item){
          // 			if(item){
          // 				_formData[key] = item
          // 			}
          // 		})
          // 	}
          // }
          _this.submitHandler(_formData);
        }
      });
    });
  };
  // 1208 渲染模板
  this.renderTemplate = function (pageJSON, callback) {
      // 渲染模板前，初始化数据
      // this.init(pageJSON); // 0126
      this.pageJSON = pageJSON;
      var _this = window;
      if (!_this.crumbTmpl) {
        _this.crumbTmpl = utils.file.getHTML("crumbTmpl");
      }
      // 面包屑对象
      var navObj = {
        tab: pageJSON.tab,
        module: pageJSON.module,
        menu: pageJSON.menu,
        page: pageJSON.page
      };
      utils.render.template(_this.crumbTmpl, navObj, "#crumbEv");
      // [20210219][upd] 数组匹配字段
      utils.param.matchFieldsFromArray(pageJSON);
      //
      // 列表
      if (pageJSON.type == "table") {
        if (!_this.queryTmpl) {
          _this.queryTmpl = utils.file.getHTML("queryTmplEv");
        }
        if (!_this.tableTmpl) {
          _this.tableTmpl = utils.file.getHTML("tableBodyTmpl");
        }
        // 1209 列表按钮
        if (!_this.tableButtonTmpl) {
          _this.tableButtonTmpl = utils.file.getHTML("tableButtonTmpl");
        }
        // 1216 加载状态值
        utils.param.statusLoad(pageJSON.query);
        // 1223 列表字段状态值
        utils.param.statusLoad(pageJSON.fields);
        var pager = [{
          pageNo: 1,
          currentPage: 1,
          pageSize: 2,
          totalCount: 0,
          totalPage: 0,
        }];
        utils.render.template(_this.queryTmpl, {
          query: pageJSON.query
        }, "#queryEv");
        utils.render.template(_this.tableTmpl, {
          fields: pageJSON.fields,
          pager: pager
        }, "#tableEv");
        utils.render.template(_this.tableButtonTmpl, {
          btns: pageJSON.btns
        }, "#tableButtonEv");
      } else if (pageJSON.type == "form") {
        // 优先渲染表单模板
        if (!_this.formBodyTmpl) {
          _this.formBodyTmpl = utils.file.getHTML("formBodyTmpl");
        }
        utils.render.template(_this.formBodyTmpl, {
          cards: pageJSON.cards
        }, "#formEv");
        // 渲染按钮组
        if (!_this.formButtonTmpl) {
          _this.formButtonTmpl = utils.file.getHTML("formButtonTmpl");
        }
        utils.render.template(_this.formButtonTmpl, {
          btns: pageJSON.btns
        }, "#formButtonEv");
        var _cards = pageJSON.cards;
        // var _this = _this;

        $.each(_cards, function (index, item) {
          // 1215 加载状态值
          utils.param.statusLoad(item.fields)
          // 加载模板
          if (item.template) {
            if (!_this[item.template]) {
              _this[item.template] = utils.file.getHTML('inherent/' + item.template);
            }
            var _item = item
            // [20201230][upd] 加载模板指定json 文件
            if (item.templateConfig && item.templateConfig.jsonPath) {
              item.templateConfig.otherFields = utils.file.getJSON(item.templateConfig.jsonPath)
              $.each(item.templateConfig.otherFields, function (oindex, oitem) {
                //
                if (oitem.type == 'form') {
                  utils.param.statusLoad(oitem.fields)
                } else if (oitem.type == 'table') {
                  $.each(oitem.tbody, function (tbindex, tbitem) {
                    utils.param.statusLoad(tbitem)
                  })
                }
              })
            }
            if (item.template == 'billSampleTmpl') {
              _item = {};
            }
            utils.render.template(_this[item.template], _item, "#card-item-" + index);
          } else {
            if (!_this.cardItemTmpl) {
              _this.cardItemTmpl = utils.file.getHTML("cardItemTmpl");
            }
            utils.render.template(_this.cardItemTmpl, item, "#card-item-" + index);
          }
        })
      }

    },
    // 1208 数据渲染
    this.renderData = function (pageJSON, data) {
      var _this = this;
      var fields = pageJSON.fields;
      var colBtns = pageJSON.colBtns;
      utils.render.template(window.tableTmpl, {
        fields: fields,
        colBtns: colBtns,
        datas: data.datas,
        pager: data.pager
      }, "#tableEv");
      // 1209 分页控件
      $('.M-box').pagination({
        coping: true,
        //mode:'fixed',
        isHide: true,
        pageCount: data.pager.totalPage,
        showData: 10,
        current: data.pager.currentPage, //当前第几页
        jump: true,
        items_per_page: 10,
        num_edge_entries: 2,
        num_display_entries: 4,
        homePage: '首页',
        endPage: '末页',
        prevContent: '上一页',
        nextContent: '下一页',
        callback: function ($pager) {
          // [20201224][upd] 采用页面隐藏域隐藏分页参数
          $("#pageNo").val($pager.getCurrent())
          $("#currentPage").val($pager.getCurrent())
          eventInit.search(1)
          // _this.getListData()
          // [20201223][src] 通过遍历query 生成查询条件对象
          // _this.queryForm.pageNo = $pager.getCurrent();
          // _this.queryForm.currentPage = $pager.getCurrent();
          // _this.getListData(_this.queryForm);
        } //点击事件后回调
      });
    };
  // 1208 数据渲染
  // 数据渲染通过对应item.data 进行，渲染前需要针对性的对不同card 对应的字段属性进行预处理
  // [20210127][crt] 渲染后执行回调
  this.renderForm = function (pageJSON) {
    var _cards = pageJSON.cards;
    $.each(_cards, function (index, item) {
      if (item.template) {
        // 对于直接套用模板渲染数据，渲染只需传递data
        // 1218 [upd] 部分配置参数可在json 配置，故变更为传入item
        var _item = item;
        if (item.template == "billSampleTmpl") {
          // [20201224][upd] 针对票据打印后返回处理
          _item = item.data;
          _item.attrs = item.templateConfig.attrs
        }
        utils.render.template(window[item.template], _item, "#card-item-" + index);
      } else {
        utils.render.template(window.cardItemTmpl, item, "#card-item-" + index);
      }
    })
  }
  // [20201224][upd] 票据实例化
  this.billInit = function (pageJSON, callback, afterRender) {
    var _this = this
    // 票据
    utils.bill.init(function (billSample) {
      // 将票据实例添加到页面实例中
      _this.billSample = billSample
      // [20210127][crt] 获取票面状态值文件
      utils.param.statusLoad([{
        label: "证件类型",
        prop: "docType",
        type: "select",
        control: {
          config: {
            remote: false,
            status: "DOC_TYPE",
            module: "default",
            default: "",
            queue: []
          }
        }
      }])
      // 绑定参数
      billSample.queryParam = {
        rowId: $("#rowId").val(),
        billNo: $("#billNo").val(),
        billFinanId: $("#billFinanId").val()
      };
      // 绑定票据对应面回调函数
      billSample.eventCenter.front = function (res) {
        pageJSON.cards[0].data.front = res;
        _this.renderForm(pageJSON);
        if (afterRender) {
          afterRender(billSample)
        }
      }
      billSample.eventCenter.back = function (res) {
        pageJSON.cards[0].data.back = res;
        _this.renderForm(pageJSON);
        if (afterRender) {
          afterRender(billSample)
        }
      }
      // 回调重写配置
      if (callback) {
        callback(billSample)
      }
    });
  }
}

/**
 * []
 */
function CustomFunctionClass() {
  this.name = "custructor";
}