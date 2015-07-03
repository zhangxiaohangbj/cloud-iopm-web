/*!
 * 注册路由表
 */
define('commons/router_table', function() {
    return {
        '^#monitor(!.*)?$': "js/monitor/task/strategyGroup",
        '^#ccenter/zone/detail/(.*)?$': "js/ccenter/zone/detail",
        '^#ccenter/region/detail/(.*)?$': "js/ccenter/region/detail",
        '^#ccenter/env/detail/(.*)?$': "js/ccenter/env/detail",
        '^#ccenter/metadata/namespace/detail/(.*)?$': "js/ccenter/metadata/namespace/detail",
        '^#ccenter/metadata/tag/detail/(.*)?$': "js/ccenter/metadata/tag/detail",
        '^#cresource(!.*)?$': "js/cresource/env",
        '^#fservice(!.*)?$': "js/fservice/vm/index",
        '^#bservice(!.*)?$': "js/bservice/nosql/index",
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
