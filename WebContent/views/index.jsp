<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<jsp:include page="../widgets/header.jsp" flush="true" />
<body>
	<script src="${pageContext.request.contextPath}/resources/js/index-init.js"></script>
	<div id="page-main" class="clearfix">
	
		<div class="page-header clearfix">
			<ol class="breadcrumb">
			  <li class="active">服务器列表</li>
			</ol>
		</div>
		<div class="page-body">
			
		</div>
	</div>
</body>


<script type="text/javascript">
resizeContent();	//sidebar生成后初始化内容区宽高
PubView.setSideBar(1, 1);
</script>
</html>
