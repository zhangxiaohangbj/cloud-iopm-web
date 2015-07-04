/*!
 * 注册路由表
 */
define('commons/router_table', function() {
    return {
        '^#monitor(!.*)?$': "js/monitor/task/strategyGroup",
        '^#aservice(!.*)?$' :"js/aservice/rds/instance",
        '^#bservice(!.*)?$' :"js/bservice/nosql/index",
        '^#fservice(!.*)?$' :"js/fservice/vm/index",
        '^#ccenter(!.*)?$' :"js/ccenter/region",
        '^#ccenter/zone/detail/(.*)?$': "js/ccenter/zone/detail",
        '^#ccenter/region/detail/(.*)?$': "js/ccenter/region/detail",
        '^#ccenter/env/detail/(.*)?$': "js/ccenter/env/detail",
        '^#ccenter/metadata/namespace/detail/(.*)?$': "js/ccenter/metadata/namespace/detail",
        '^#ccenter/metadata/tag/detail/(.*)?$': "js/ccenter/metadata/tag/detail",
        '^#sysmanagement(!.*)?$': "js/sysmanagement/user",
        '^#ccenter/vmtype/metadataList/(.*)$' :"js/ccenter/vmtype/metadata",
        '^#fservice/block/detail/(.*)$' :"js/fservice/block/detail",
        '^#fservice/snapshot/detail/(.*)$' :"js/fservice/snapshot/detail",
        '^#ccenter/vdc/usage/(.*)$' :"js/ccenter/vdc/usage",
        '^#fservice/vm/detail/(.*)$' :"js/fservice/vm/detail",
        '^#fservice/autoscaling/detail/(.*)$' :"js/fservice/autoscaling/detail",
        '^#fservice/security/keypair/detail/(.*)$' :"js/fservice/security/keypair/detail",
        '^#aservice/cae/version/(.*)$' :"js/aservice/cae/version",
        '^#aservice/cae/env/list/(.*)$' :"js/aservice/cae/env",
        '^#aservice/cae/storage/(.*)$' :"js/aservice/cae/storage",
        '^#aservice/cae/env/detail/(.*)$' :"js/aservice/cae/detail",
        '^#aservice/container/docker-image/detail/(.*)$' :"js/aservice/container/docker-image/detail",
        '^#aservice/container/bay/detail/(.*)$' :"js/aservice/container/bay/detail"
    };
});
