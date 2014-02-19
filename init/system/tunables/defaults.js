module.exports = {
	tunables: [
		{
			path       : 'net.ipv4.neigh.default.gc_thresh1',
			value      : 9216,
			description: 'If the No. of entries will increased from the digit mentioned in gc_thresh1 file the garbage collector will run after the time interval mentioned in gc_interval file. This value called soft maximum value.'
		},
		{
			path       : 'net.ipv4.neigh.default.gc_thresh2',
			value      : 18432,
			description: 'If the No. of entries will increased from the digit mentioned in gc_thresh2 file, the garbage collector will run immediately. This value called hard maximum value.'
		},
		{
			path       : 'net.ipv4.neigh.default.gc_thresh3',
			value      : 36864,
			description: 'Is the maximum No. of ARP entries which can be kept in table.'
		}
		/*,
		 // TODO: Available only after `modprobe nf_conntrack`.
		 {
		 path       : 'net.netfilter.nf_conntrack_max',
		 value      : 100000,
		 description: 'Concurrent connections that filter will allow to pass through.'
		 }*/
	]
};