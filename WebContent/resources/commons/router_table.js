/*!
 * 注册路由表
 */
define({
    '^#ccenter(!.*)?$': "js/ccenter/vm",
    '^#monitor(!.*)?$': "js/monitor/task/strategyGroup",
    '^#cresource(!.*)?$': "js/cresource/env",
    '^#sysmanagement(!.*)?$': "js/sysmanagement/user"
});
