function Fcheck() {
    this.validater = function(e) {
        this.submitEvent = e;
        if (window.validate) {
            if (window.validate(this) === false) {
                return;
            }
        }
        this.submit();
    },
    this.submit = function() {
        var e = this.submitEvent;
        try {
            e.stopPropagation();
            e.preventDefault();
            var self = this;
            var tar = $(e.target || e.srcElement);
            if (tar.attr("disabled")) {
                return;
            };
            var form = tar.closest('form');
            if (!form || form.length == 0) {
                return;
            } else {
                form = form[0];
            }
            tar = $(form);
            var time = tar.attr('startdate');	//开始时间，不填不验证 参数在作为form标签的属性存在
            if (time) {
                time = parseInt(time);
                var now = (new Date()).getTime();
                if (time > now) {
                    showTip("提交时间未开始, 禁止提交.");
                    return;
                }
            }
            var time = tar.attr('enddate');		//截止时间，不填不验证 参数在作为form标签的属性存在
            if (time) {
                time = parseInt(time);
                var now = (new Date()).getTime();
                if (time < now) {
                    showTip("已超过截至时间, 禁止提交.");
                    return;
                }
            }
            if (valid()) {		//自己定义验证方法 valid()
                //开始提交
                self.subStart(form);
                var fd = new FormData(form);
                $.ajax({
                    url: form.action,
                    data: fd,
                    type: 'POST',
                    processData: false,
                    contentType: false,
                    dataType: 'json',
                    error: function(res) {
                        showTip("请求错误,内容:\n" + res.responseText);
                        self.subError(form);
                    },
                    success: function(res) {
                        if (res.status == 1) {
                            self.subSucess(form);
                        } else {
                            showTip(res.msg);
                            self.subError(form);
                        }
                    }
                });
            }
        } catch(e) {
            console.error(e);
        }
    };
    this.warning = function(doc, msg) {
        doc.focus().select();
        doc[0].style.border = '1px solid red';
        var mg = doc.attr('msg');
        msg = mg ? mg: (msg ? msg: '请输入!');
        showTip(msg);
    };
    this.subStart = function(form) {
        //禁用提交按钮,防止重复提交数据
        var but = $(form).find('input[type="submit"]');
        but.attr("disabled", true);
        this.buttext = but.attr("value");
        but.attr("value", "数据请求中...");
    };
    this.subSucess = function(form) {
        var but = $(form).find('input[type="submit"]');
        var showMsg = form.getAttribute('msg');
        if (showMsg) {
            but.attr("value", showMsg);
            showTip(showMsg);
        } else {
            but.attr("value", "数据提交成功");
            showTip("数据提交成功");
        }
        var red = form.getAttribute('redirect');//事先定义的跳转地址 参数在作为form标签的属性存在
        if (red) {
            window.location.href = red;
        }
    };
    this.subError = function(form) {
        //取消按钮禁用
        var but = $(form).find('input[type="submit"]');
        but.removeAttr('disabled');
        but.attr("value", this.buttext);
    };
}
function showTip(tipTxt) {
	var div = document.createElement('div');
	div.innerHTML = '<div class="deploy_ctype_tip"><p>' + tipTxt + '</p></div>';
	var tipNode = div.firstChild;
	$("#wrap").after(tipNode);
	setTimeout(function () {
		$(tipNode).remove();
	}, 1500);
}
