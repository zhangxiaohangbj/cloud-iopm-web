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
    <link href="${pageContext.request.contextPath}/resources/css/core.css" rel="stylesheet" type="text/css"/>
    <!-- scripts -->
    <script src="${pageContext.request.contextPath}/resources/lib/js/pubView.js" data-main="initializer" data-pub-root="${pageContext.request.contextPath}" data-require-base="${pageContext.request.contextPath}/resources"></script>
    <script type="text/javascript">
        PubView.setDefaults({userInfo: '${sessionScope.userInfo}', sideBar: {wrapper: '#page-main'}, footer: null});
    </script>
</head>