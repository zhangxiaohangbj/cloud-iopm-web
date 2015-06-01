<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ include file="../widgets/header.jsp"%>
<link href="${pageContext.request.contextPath}/resources/css/ccenter.css" rel="stylesheet" type="text/css"/>
<body>
	<div id="page-main" class="container clearfix">
	<script src="${pageContext.request.contextPath}/resources/js/ccenter/init.js"></script>
		<div class="page-content clearfix">
			<p class="error-tips text-danger">加载中...</p>
		</div>
	</div>
</body>

<script type="text/javascript">
	Initializer.resize();	//sidebar生成后初始化内容区宽高
</script>
