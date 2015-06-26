/*!
 * 注册路由表
 */
define({
    '^#ccenter(!.*)?$': "js/ccenter/vm",
    '^#monitor(!.*)?$': "js/monitor/task/strategyGroup",
    '^#cresource(!.*)?$': "js/cresource/env",
    '^#sysmanagement(!.*)?$': "js/sysmanagement/user",
    '^#ccenter/vmtype/metadataList/(.*)$' :"js/ccenter/vmtype/metadata",
    '^#ccenter/block/detail/(.*)$' :"js/ccenter/block/detail"
});
