var rule_types = require('iproute').rule.utils.types;

module.exports = {
	rules: [
		{
			type       : rule_types.unicast,
			priority   : 0,
			table      : 255, // local
			description: 'Special routing table containing high priority control routers for local and broadcast addresses.'
		},
		{
			type       : rule_types.unicast,
			priority   : 32766,
			table      : 254, // main
			description: 'The normal routing table containing all non-policy routes.'
		},
		{
			type       : rule_types.unicast,
			priority   : 32767,
			table      : 253, // default
			description: 'Reserved for post-processing if no previous default rules selected the packet.'
		}
	]
};