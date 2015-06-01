<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!DOCTYPE html>
<html class="no-js">
<head lang="en">
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1"/>
    <meta name="renderer" content="webkit">
    <title>云海开发平台</title>
    <!-- stylesheets -->
    <link href="${pageContext.request.contextPath}/resources/lib/css/base.css" rel="stylesheet" type="text/css"/>
   	<link href="${pageContext.request.contextPath}/resources/css/core.css" rel="stylesheet" type="text/css"/>
   	<script type="text/javascript">
   		var PubVars = {
   				contextPath: "${pageContext.request.contextPath}",
   				userInfo: "${sessionScope.userInfo}"
   		}
   	</script>
    <!-- scripts -->
    <script src="${pageContext.request.contextPath}/resources/lib/js/pubView.js" data-require-base="${pageContext.request.contextPath}/resources"></script>
    <script src="${pageContext.request.contextPath}/resources/js/common-init.js"></script>
</head>

