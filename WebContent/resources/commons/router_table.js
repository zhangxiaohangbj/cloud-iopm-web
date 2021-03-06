/*!
 * 注册路由表
 */
define('commons/router_table', function() {
    return {
        '^#logout$': 'js/logout',
        '^#monitor(!.*)?$': "js/monitor/task/strategyGroup",
        '^#aservice$' :"js/aservice/rds/instance",
        '^#bservice(!.*)?$' :"js/bservice/nosql/index",
        '^#fservice(!.*)?$' :"js/fservice/vm/index",
        '^#ccenter(!.*)?$' :"js/ccenter/region",
        '^#ccenter/zone/detail/(.*)?$': "js/ccenter/zone/detail",
        '^#ccenter/region/detail/(.*)?$': "js/ccenter/region/detail",
        '^#ccenter/env/detail/(.*)?$': "js/ccenter/env/detail",
        '^#ccenter/env/connector/(.*)?$': "js/ccenter/env/connector",
        '^#ccenter/metadata/namespace/detail/(.*)?$': "js/ccenter/metadata/namespace/detail",
        '^#ccenter/metadata/tag/detail/(.*)?$': "js/ccenter/metadata/tag/detail",
        '^#sysmanagement(!.*)?$': "js/sysmanagement/user",
        '^#ccenter/vmtype/metadataList/(.*)$' :"js/ccenter/vmtype/metadata",
        '^#fservice/block/detail/(.*)$' :"js/fservice/block/detail",
        '^#fservice/snapshot/volume/detail/(.*)$' :"js/fservice/snapshot/volume/detail",
        '^#fservice/snapshot/vm/detail/(.*)$' :"js/fservice/snapshot/detail",
        '^#ccenter/vdc/usage/(.*)$' :"js/ccenter/vdc/usage",
        '^#fservice/vm/detail/(.*)$' :"js/fservice/vm/detail",
        '^#fservice/autoscaling/detail' :"js/fservice/autoscaling/detail",
        '^#fservice/security/keypair/detail/(.*)$' :"js/fservice/security/keypair/detail",
        '^#aservice/cae/storage/(.*)$' :"js/aservice/cae/storage",
        '^#aservice/cae/appenv/detail' :"js/aservice/cae/appenv/detail",
        /*'^#aservice/cae/appenv/(.*)$' :"js/aservice/cae/appenv/index",*/
        '^#aservice/container/docker-image/detail/' :"js/aservice/container/docker-image/detail",
        '^#aservice/container/bay/detail/' :"js/aservice/container/bay/detail",
        '^#fservice/vpc/network/detail/(.*)$' :"js/fservice/vpc/network/detail",
        '^#fservice/vpc/subnet/detail/(.*)$' :"js/fservice/vpc/subnet/detail",
        '^#fservice/vpc/router/detail/(.*)$' :"js/fservice/vpc/router/detail",
        '^#fservice/security/firewall/rule/detail/(.*)$' :"js/fservice/security/firewall/rule_detail",
    	'^#fservice/security/firewall/policy/detail/(.*)$' :"js/fservice/security/firewall/policy_detail",
    	'^#fservice/security/firewall/firewall/detail/(.*)$' :"js/fservice/security/firewall/firewall_detail",
		'^#fservice/security/firewall/tab/(.*)$' :"js/fservice/security/firewall/index",
		'^#fservice/lbaas/pool/detail/(.*)$' :"js/fservice/lbaas/pool/detail",
		'^#fservice/lbaas/member/detail/(.*)$' :"js/fservice/lbaas/member/detail",
		'^#fservice/lbaas/monitor/detail/(.*)$' :"js/fservice/lbaas/monitor/detail",
		'^#monitor/monitor/alarm/detail(.*)$' :"js/monitor/monitor/alarm/detail",
        '^#monitor/monitor/agent/detail/(.*)$' :"js/monitor/monitor/agent_detail"
    };
});
