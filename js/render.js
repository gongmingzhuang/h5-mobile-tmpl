/**
 * [20210510][crt] 依赖地址栏参数加载页面数据
 */
function renderInfo(type, _this) {
  if (!_this) {
    _this = window
  }
  var query = util.getUrlQuery();
  _this.flag = query.page == 'agent' ? 'agent' : 'sale' /* 页面标识（业务员/代理商） */
  _this.listApi = query.page == 'agent' ? type ? 'getAgentDetail' : 'getAgentList' : type ? 'getSaleDetail' : 'getSaleList' /* 请求列表接口 */
  _this.docTitle = query.page == 'agent' ? '代理商交易明细' : '业务员交易明细' /* 页面标题 */
  _this.pageType = type ? 'detail' : 'list' /* 页面标识（全部明细/汇总） */
  document.title = docTitle
}

/**
 * [20210507][crt] 生成表单html
 */
function renderForm(formList) {
  if (!formList instanceof Array) {
    console.error("formList must be a Array.");
    return
  }
  var htmlString = "";
  $.each(formList, function (index, item) {
    if (item.type != 'buttonGroup') {
      htmlString += '' +
        '<div class="layui-form-item">' +
        '<label class="layui-form-label">' + item.label + '</label>' +
        '<div class="layui-input-block">';
    } else {
      htmlString += '' +
        '<div class="layui-form-item">' +
        '<div class="layui-input-block">';
    }
    switch (item.type) {
      case "text":
        htmlString += '' +
          ' <input type="text" name="' + item.prop + '" required  lay-verify="required" autocomplete="off" class="layui-input">';
        break;
      case "password":
        htmlString += '' +
          ' <input type="password" name="' + item.prop + '" required  lay-verify="required" autocomplete="off" class="layui-input">';
        break;
      case "buttonGroup":
        $.each(item.buttons, function (bidx, bitem) {
          htmlString += '' +
            '<button class="layui-btn" lay-submit lay-filter="formDemo">' + bitem.label + '</button>'
        })
        break;
    }
    htmlString += '</div></div>'
  })
  return htmlString;
}

/**
 * [20210507][crt] 渲染日期控件
 */
function renderDateRange(curProp, otherProp, tempDateRange, index) {
  layui.use('laydate', function () {
    var laydate = layui.laydate;
    laydate.render({
      elem: '#' + curProp,
      type: 'date',
      ready: function () {
        tempDateRange[index] = $("#" + curProp).val();
      },
      done: function (value, date) {
        var t2 = $("#" + otherProp).val();
        var t1 = new Date(value).getTime();
        /* [20210511][crt] 当只选择了开始时间或截止时间时，触发查询 */
        if (t1 && !t2) {
          pageType == 'detail' && loadListData(1)
        }
        if (t2) {
          var t2 = new Date(t2).getTime();
          if ((index && t1 < t2) || (!index && t1 > t2)) {
            layui.use('layer', function () {
              var layer = layui.layer
              layer.msg(index ? '结束时间不能小于开始时间' : '开始时间不能大于结束时间');
              if (tempDateRange[index]) {
                $("#" + curProp).val(tempDateRange[index]);
              } else {
                $("#" + curProp).val('');
              }
            })
          } else {
            /* [20210511][crt] 当选择了开始时间和截止时间时，只有两个时间不冲突时，才触发查询 */
            pageType == 'detail' && loadListData(1)
          }
        }
      }
    });
  })
}

/**
 * [20210507][crt] 生成日期范围html
 */
$.fn.extend({
  renderDateRange: function (dateRange) {
    if (!dateRange instanceof Array) {
      console.error("dateRange must be a Array.");
      return
    }
    var htmlString = "";
    $.each(dateRange, function (index, item) {
      htmlString += '' +
        '<div>' +
        '<span>' + item.label + '</span>' +
        '<input type="text" id="' + item.prop + '" name="' + item.prop + '" readonly class="layui-input">' +
        '</div>';
      if (!index) {
        htmlString += '<span>-</span>';
      }
    })

    $(this).html(htmlString);
    var tempDateRange = new Array(2); /* 临时缓存日期，用于开始日期与截止日期选择冲突时，恢复冲突前的日期值 */

    renderDateRange(dateRange[0].prop, dateRange[1].prop, tempDateRange, 0)

    renderDateRange(dateRange[1].prop, dateRange[0].prop, tempDateRange, 1)
  }
})


/**
 * [20210507][crt] 生成导航html
 */
function renderNav(navList) {

  if (!navList instanceof Array) {
    console.error("navList must be a Array.");
    return
  }
  var htmlString = "";
  $.each(navList, function (index, item) {
    htmlString += '' +
      '<li class="layui-nav-item layui-nav-itemed">' +
      '<a href="' + item.forward + '" class="pt-0-i">' + item.nav + '</a>' +
      '</li>';
  })
  return htmlString;
}

/**
 * [20210508][crt] 生成列表头部html
 */
function renderThead(tableList) {
  var _this = this;
  if (!tableList instanceof Array) {
    console.error("tableList must be a Array.");
    return
  }
  var htmlString = "<tr>";
  $.each(tableList, function (index, item) {
    htmlString += '' +
      '<th data-field="' + item.prop + '">' +
      '<div class="layerui-table-cell">' +
      '<span>' + item.label + '</span>' +
      '</div > ' +
      '</th>';
  })
  return htmlString + '</tr>'
}

/**
 * [20210508][crt] 生成列表数据
 */
$.fn.extend({
  renderTbody: function (tableList, requestApi, resetFlag, callback) {
    var params = util.formToObject($('.query').find('input').serializeArray());
    var htmlString = '';
    var _this = this;
    var _pager = {
      current: 1,
      pages: 0,
      size: 10,
      total: 0
    };
    // 获取当前列表分页参数
    // [20210510][upd] 使用attr()获取，因data()获取有时会出现取值错误
    var _current = $(this).attr("data-current") || 1
    var _pages = $(this).attr("data-pages") || 1
    /* [20210510][upd] 判断是否追加数据 - 1.当前分页是否小于总页数；2.当前是否处于重置查询条件状态(resetFlag = true) */
    var _isAppend = _current < _pages ? !resetFlag ? true : false : false
    util.assign(params, {
      /* [20210510][upd] 如果当前处于重置查询条件状态，则分页重置为第一页 */
      current: _isAppend ? Number(_current) + 1 : resetFlag ? 1 : _current,
      pages: _pages
    })

    $.when($ajax(window[requestApi](params))).done(function (res) {
      if (res.code == 200) {
        _pager = res.data.pager;
        $.each(res.data.list, function (ridx, ritm) {
          htmlString += "<tr>";
          $.each(tableList, function (tidx, titm) {
            htmlString += '' +
              '<td data-field="' + titm.prop + '">' +
              '<div class="layerui-table-cell">' +
              '<span class="' + (titm.type == "money" && 'wordBreakAll') + '">' + (titm.type == "money" ? ritm[titm.prop] : titm.type == "date" ? moment(ritm[titm.prop]).format(titm.format || "YYYY-MM-DD HH:mm:ss") : ritm[titm.prop]) + '</span>' +
              '</div > ' +
              '</td>';
          })
          htmlString += '</tr>'
        })
      } else {
        htmlString = ""
      }
      _isAppend ? $(_this).append(htmlString) : $(_this).html(htmlString);
      // 设置列表分页参数
      $(_this).attr({
        "data-current": _pager.current,
        "data-pages": _pager.pages,
        "data-size": _pager.size,
        "data-total": _pager.total
      })
    }).always(function (res) {
      callback(res)
    })
  }
})

/**
 * [20210507][crt] 生成按钮组html
 */
function renderButton(buttonList) {
  if (!buttonList instanceof Array) {
    console.error("buttonList must be a Array.");
    return
  }
  var htmlString = "";
  $.each(buttonList, function (index, item) {
    htmlString += '' +
      '<button class="layui-btn layui-btn-primary ' + (item.type) + '" lay-submit lay-filter="formDemo" data-forward="' + item.forward + '">' + item.buttonName + '</button>'
  })
  return htmlString;
}

/**
 * [20210511][crt] 生成下拉框html
 */
$.fn.extend({
  renderSelect: function (formProp, optionList) {
    if (!optionList instanceof Array) {
      console.error("optionList must be a Array.");
      return
    }
    var htmlString = '' +
      '<div class="layui-form reset">' +
      '<div class="layui-form-item">' +
      '<div class="layui-inline">' +
      '<div class="layui-input-inline">' +
      /* [20210511][crt] 由于layui 对原select 控件进行隐藏处理，所以添加隐藏域以便serializeArray 获取到该下拉框值 */
      '<input type="hidden" name="' + formProp + '"/>' + 
      '<select name="' + formProp + '" lay-filter="' + formProp + '">'
    $.each(optionList, function (index, item) {
      htmlString += '<option value="' + item.value + '">' + (item.label || item.name) + '</option>';
    })
    htmlString += ''
    '</select>' +
    '</div>' +
    '</div>' +
    '</div>' +
    '</div>';
    // return htmlString;
    $(this).html(htmlString)
    // layui.onevent('form', function () {
    // var form = layui.form;
    layui.form.on('select(' + formProp + ')', function (data) {
      // console.log(data.elem); //得到select原始DOM对象
      // console.log(data.value); //得到被选中的值
      // console.log(data.othis); //得到美化后的DOM对象
      $('input[name="' + formProp + '"]').val(data.value)
      pageType == 'detail' && loadListData(1)
    })
    // });      

  }
})
/**
 * [20210510][crt] 上拉加载初始化对象
 */
function pullInitParam() {
  return {
    pullRefresh: {
      container: '.table-container', //待刷新区域标识，querySelector能定位的css选择器均可，比如：id、.class等
      up: {
        height: 50, //可选.默认50.触发上拉加载拖动距离
        auto: true, //可选,默认false.自动上拉加载一次
        contentrefresh: "正在加载中...", //可选，正在加载状态时，上拉加载控件上显示的标题内容
        contentnomore: '没有更多数据了', //可选，请求完毕若没有更多数据时显示的提醒内容；
        callback: pullFresh
      }
    }
  }
}

/**
 * [20210510][crt] 上拉加载回调函数
 */
function pullFresh(resetFlag) {
  var _this = mui(".table-container").pullRefresh();
  $('tbody').renderTbody(tableList, listApi, resetFlag, function (res) {
    // 判断是否还有数据
    var pager = res.data.pager
    if (res.code == 201 || pager.current == pager.pages) {
      //1、加载完新数据后，必须执行如下代码，true表示没有更多数据了：
      _this.endPullupToRefresh(true);
    } else {
      _this.endPullupToRefresh(false);
    }
  });
}

/**
 * [20210510][crt] 生成列表头部html
 */
$.fn.extend({
  renderPageHtml: function (page, type, _this) {
    if (!_this) {
      _this = window
    }
    if (!page) {
      page = 'sale'
    }
    // [20210511][crt] 下拉控件
    var optionList = [{
      value: 0,
      label: '全部业务员'
    }];
    // tab 控件 - 个人交易明细
    var buttonList = [{
        buttonName: "全部明细",
        type: "summary",
        forward: "saleList.html?page=sale"
      },
      {
        buttonName: "汇总",
        type: "detail",
        forward: "saleDetail.html?page=sale"
      }
    ];
    // tab 控件 - 代理商交易明细
    if (page != 'sale' || page == 'agent') {
      buttonList = [{
          buttonName: "全部明细",
          type: "summary",
          forward: "saleList.html?page=agent"
        },
        {
          buttonName: "汇总",
          type: "detail",
          forward: "saleDetail.html?page=agent"
        }
      ];
    }

    var htmlString = '' +
      '<div class="button-group"></div> ' +
      '  <div class="query">';
    // [20210511][crt] 业务员/代理商交易明细-全部明细列表商户搜索按钮
    if (!type) {
      htmlString +=
        '    <div class="query-item">' +
        '      <input type="text" name="queryId" placeholder="输入商户号/手机号查询" autocomplete="off" class="layui-input">' +
        '      <button class="layui-btn">搜索</button>' +
        '    </div>';
    }
    htmlString +=
      '    <div class="query-item">' +
      '      <div class="date-range"></div>' +
      '    </div>';
    // [20210511][crt] 代理商交易明细/汇总列表
    if (page == 'agent') {
      htmlString +=
        '    <div class="query-item">' +
        '      <div class="user-select"></div>' +
        '    </div>';
    }
    htmlString +=
      '</div>' +
      '<div class="table-container">' +
      '  <div class="table-list">' +
      '    <table>' +
      '      <thead></thead>' +
      '      <tbody></tbody>' +
      '    </table>' +
      '  </div>' +
      '</div>';

    $(this).html(htmlString);

    // 列表头部字段名字
    $('thead').html(renderThead(tableList))

    // tab 按钮
    $('.button-group').html(renderButton(buttonList));

    // 渲染日期控件
    $('.date-range').renderDateRange(dateRange);

    // 默认按钮样式 - 控制tab 按钮切换
    var btnClassName = 'summary',
      otherClassName = 'detail'
    if (type) {
      btnClassName = 'detail'
      otherClassName = 'summary'
    }
    $('.button-group .' + btnClassName).removeClass('layui-btn-primary')
    // "搜索"按钮事件
    $(".button-group").on("click", "button", function (event) {
      $(this).parent().children().addClass('layui-btn-primary')
      // 汇总
      if ($(this).hasClass(otherClassName)) {
        $("tbody").html('')
        var _forward = $(this).attr("data-forward");
        console.log(_forward)
        // [20210510][crt] 替换当前地址，点击返回到列表导航页busiList.html
        history.replaceState(null, null, _forward);
        location.reload();
      }
      if ($(this).hasClass(btnClassName)) {
        $(this).removeClass('layui-btn-primary')
      }
    });
    // 下拉框
    // [20210511][crt] 
    if (page == 'agent') {
      $.when($ajax(getSalesmanList())).done(function (res) {
        window.optionList = [{
          value: 0,
          name: "全部业务员"
        }]
        if (res.code == 200) {
          optionList = optionList.concat(res.data.list)
          $(".user-select").renderSelect(selectProp, optionList)
          //只有执行了这一步，部分表单元素才会自动修饰成功
          layui.use('form', function () {
            var form = layui.form;
            form.render();
          });
        }
      })
    }

    // 搜索按钮
    $(".query-item").on("click", "button", function (event) {
      loadListData(1)
    })
  }
})

/**
 * [20210511][crt] 重置当前列表查询与上拉加载
 * @param resetFlag[Boolean] 是否重置当前列表，上拉加载-false
 */
function loadListData (resetFlag) {
  mui('.table-container').pullRefresh().refresh(true);
  pullFresh(resetFlag)
}