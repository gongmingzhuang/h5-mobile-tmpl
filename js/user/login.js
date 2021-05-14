    // 表单渲染
    var formList = [{
      label: "账户名",
      prop: "username",
      type: "text"
    },
    {
      label: "密码",
      prop: "password",
      maxlength: 8,
      type: "password"
    }
    ];
    var buttonList = [{
      label: '登录',
      id: 'login',
      style: ''
    },
    {
      label: '注册',
      id: 'register',
      style: 'layui-btn-primary'
    }
    ]
    var logoSetting = {
      src: '../img/user/default.jpg',
      radius: '50%',
      size: '150px'
    }
    // 渲染
    ES.template('../template/user/login.tmpl.html')
      .render('', {
        logo: logoSetting,
        list: formList,
        buttonGroup: buttonList
      })

    $('#login').click(function () {
      var params = ES.object.formToObject($('form').serializeArray());
      if (!params[formList[0].prop] || !params[formList[1].prop]) {
        ES.$msg("账户名或密码不能为空")
        return;
      }
      ES.$ajax(login(params), function resolve(res) {
        if(res.code == 200){

        }
      }, function reject(err) {
        debugger
      })
    })