module.exports = {
	tables: [
		{
			name       : 'local',
			id         : 255,
			description: 'Special routing table containing high priority control routes for local and broadcast addresses.'
		},
		{
			name       : 'main',
			id         : 254,
			description: 'The normal routing table containing all non-policy routes.'
		},
		{
			name       : 'default',
			id         : 253,
			description: 'Reserved for post-processing if no previous default rules selected the packet.'
		},
		{
			name       : 'unspec',
			id         : 0,
			description: 'System reserved.'
		}
	]
};