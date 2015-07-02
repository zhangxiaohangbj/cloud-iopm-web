/*!
 * 注册路由表
 */
define('commons/router_table', function() {
    return {
        '^#monitor(!.*)?$': "js/monitor/task/strategyGroup",
        '^#cresource(!.*)?$': "js/cresource/env",
        '^#cresource/zone/detail/(.*)?$': "js/cresource/zone/detail",
        '^#cresource/region/detail/(.*)?$': "js/cresource/region/detail",
        '^#cresource/env/detail/(.*)?$': "js/cresource/env/detail",
        '^#cresource/metadata/namespace/detail/(.*)?$': "js/cresource/metadata/namespace/detail",
        '^#cresource/metadata/tag/detail/(.*)?$': "js/cresource/metadata/tag/detail",
        '^#sysmanagement(!.*)?$': "js/sysmanagement/user",
        '^#ccenter/vmtype/metadataList/(.*)$' :"js/ccenter/vmtype/metadata",
        '^#fservice/block/detail/(.*)$' :"js/fservice/block/detail",
        '^#fservice/snapshot/detail/(.*)$' :"js/fservice/snapshot/detail",
        '^#ccenter/vdc/usage/(.*)$' :"js/ccenter/vdc/usage",
        '^#fservice/vm/detail/(.*)$' :"js/fservice/vm/detail",
        '^#fservice/security/keypair/detail/(.*)$' :"js/fservice/security/keypair/detail",
        '^#aservice/cae/version/(.*)$' :"js/aservice/cae/version",
        '^#aservice/cae/env/(.*)$' :"js/aservice/cae/env",
        '^#aservice/cae/storage/(.*)$' :"js/aservice/cae/storage"
    };
});
