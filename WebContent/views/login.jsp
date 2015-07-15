<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html class="no-js">
<head lang="zh-CN">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="renderer" content="webkit">
    <title>云海开放平台</title>
    <!-- stylesheets -->
    <link href="${pageContext.request.contextPath}/resources/lib/css/base.css" rel="stylesheet" type="text/css"/>
    <link href="${pageContext.request.contextPath}/resources/css/login/login.css" rel="stylesheet" type="text/css"/>
    <!-- scripts -->
    <script src="${pageContext.request.contextPath}/resources/lib/js/pubView.js" data-pub-root="${pageContext.request.contextPath}" data-require-base="${pageContext.request.contextPath}/resources"></script>
</head>
</head>

<body>
<div class="signin-box">
	<div class="signin-header">
		<div class="signin-title">
			<img class="signin-logo" alt="IOP Manager" src="${pageContext.request.contextPath}/resources/css/login/img/header-logo.png"/>
		</div>
	</div>
	<div class="signin-body">
		<form id="login_form" class="form-signin" method="post">
			<div class="input-group">
				<span class="signin-icons signin-icon-input signin-icon-user">
					<i class="signin-icons signin-icon-br"></i>
				</span>
				<input id="loginName" class="form-control" name="loginName" type="text" value="admin"/>
			</div>
			<div class="input-group">
				<span class="signin-icons signin-icon-input signin-icon-pwd">
					<i class="signin-icons signin-icon-br"></i>
				</span>
				<input id="password" class="form-control" name="password" type="password" value="123456a?"/>
			</div>
			<div class="checkbox">
				<label>
					<input type="checkbox" name="remember_me" value="1" /> 记住密码
				</label>
				<label>
					<input type="checkbox" name="save_signin" value="1"> 自动登录
				</label>
			</div>
			<button id="signin-btn" type="button" class="btn btn-primary" >登&emsp;&emsp;录</button>
		</form>
	</div>
	<i class="signin-stamp"></i>
</div>   
</body>
<script type="text/javascript">

	require(['json','jq/form/validator-bs3','bs/popover'], function(JSON) {
		
		$(document).on('keydown', '#password', function() {
			var e = event || window.event || arguments.callee.caller.arguments[0];
			if (e && e.keyCode == 13) { // enter 键
				submitForm();
			}
		});
		$(document).on('keydown', '#loginName', function() {
			var e = event || window.event || arguments.callee.caller.arguments[0];
			if (e && e.keyCode == 13) { // enter 键
				document.getElementById('password').focus();
			}
		});
		//光标定位到账号输入框
		document.getElementById('loginName').focus();
		var errorTip = function($tar, msg) {
	        if(PubView.utils.is$($tar)) {
	            $tar.popover({
	                container: $("#login_form"),
	                className: "popover-danger",
	                placement: "left top",
	                content: '<i class="glyphicon glyphicon-exclamation-sign"></i> '+(msg||''),
	                trigger: 'manual',
	                html: true
	            }).popover("show");
	        }
	    };
	    $("#login_form").validate({
			errorContainer: '_form',
	        rules: {
	        	'loginName': {
	                required: true
	            },
	            'password': {
	            	required: true
	            }
	        },
	        messages: {
	        	'loginName': {
	                required: "请输入登录账号！"
	            },
	            'password': {
	            	required: "请输入登录密码！"
	            }
	        }
	    });
		$(document).on('click', '#signin-btn', function() {
			var valid = $("#login_form").valid();
    		if(!valid) return false;
			submitForm();
		});
		function submitForm() {
			var url = "${pageContext.request.contextPath}/identity/v2.0/tokens";
			var data = {
					 'auth': {
					        'tenantId': "",
					        'passwordCredentials': {
					            'username': $('#loginName').val(),
					            'password':  $('#password').val()
					        }
					    }
			}
			$.ajax({
	            'type': 'POST',
	            'url': url,
	            'data': JSON.stringify(data),
	            'dataType': 'json',
		        'contentType': 'application/json',
	            'success': callbackSuccess,
	            'error':callbackErr
	        });
		}
		function callbackSuccess(res){
			if(res != null && res.error == null && res.access.token != null){
				if(res.access.user.status=='reset_pwd'){
					alert("由于系统升级，须重设密码...");
					window.location.href="${pageContext.request.contextPath}/resetpwd";
				}else{
					window.location.href="${pageContext.request.contextPath}";
				}
			}else{
				showErrorInfo(res);
			}
		}
		function callbackErr(res){
			showErrorInfo(JSON.parse(res.responseText));
		}
		function showErrorInfo(res){
			if(res.inner_code == "username_is_null"){
				errorTip($('#loginName'), "请输入登录账号！");
			}else if(res.inner_code == "password_is_null"){
				errorTip($('#password'), "请输入登录密码！");
			}else if(res.inner_code == "invalid_username"){
				errorTip($('#loginName'), "用户名或密码错误！");
			}else if(res.inner_code == "password_is_incorrect"){
				errorTip($('#loginName'), "用户名或密码错误！");
			}else if(res.inner_code == "account_is_locked"){
				errorTip($('#loginName'), "账号已锁定！");
			}else if(res.inner_code == "account_is_disabled"){
				errorTip($('#loginName'), "账号已禁用！");
			}else{
				errorTip($('#loginName'), "系统错误！");
			}
		}
	});
</script>
</html>
