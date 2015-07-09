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
		<div class="signin-title" style="font-size: 25px;font-weight: bold;">
			重置密码
		</div>
	</div>
	<div class="signin-body">
		<form id="login_form" class="form-signin">
			<div class="input-group">
				原密码:<input id="password" class="form-control" name="password" type="password" value=""/>
			</div>
			<div class="input-group">
				新密码:<input id="newPassword" class="form-control" name="newPassword" type="password" value=""/>
			</div>
			<div class="input-group">
				确认密码:<input id="confirmPassword" class="form-control" name="confirmPassword" type="password" value=""/>
			</div>
			<button id="signin-btn" type="button" class="btn btn-primary" >确定</button>
		</form>
	</div>
	<i class="signin-stamp"></i>
</div>   
</body>
<script type="text/javascript">

	require(['json'], function(JSON) {
		
		$(document).on('click', '#signin-btn', function() {
			submitForm();
		});
		function submitForm() {
			var url = "${pageContext.request.contextPath}/identity/v2.0/users/password";
			var data = {
					 'user': {
					        'id': "<%=request.getAttribute("id")%>",
					        'password':$('#password').val(),
					        'newPassword':$('#newPassword').val()
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
			if(res == '1'){
				alert("密码重置成功！");
			}else{
				alert("密码重置失败！"+res);
			}
		}
		function callbackErr(res){
			showErrorInfo(JSON.parse(res.responseText));
		}
		function showErrorInfo(res){
			alert(res)
		}
	});
</script>
</html>
