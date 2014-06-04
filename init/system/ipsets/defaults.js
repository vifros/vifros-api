module.exports = {
  ipsets: [
    {
      setname       : 'rfc1918',
      type       : 'hash:net',
      description: 'Private address space per RFC 1918.',

      entries: [
        {
          entry      : '10/8',
          description: 'Private address range Class A per RFC 1918.'
        },
        {
          entry      : '172.16/12',
          description: 'Private address range Class B per RFC 1918.'
        },
        {
          entry      : '192.168/16',
          description: 'Private address range Class C per RFC 1918.'
        }
      ]
    },
    {
      setname       : 'rfc1700',
      type       : 'hash:net',
      description: 'Reserved address space per RFC 1700.',

      entries: [
        {
          entry      : '0/8',
          description: 'Source address space per RFC 1700.'
        },
        {
          entry      : '127/8',
          description: 'Loopback address space per RFC 1700.'
        },
        {
          entry      : '224/3',
          description: 'Multicast address space per RFC 1700.'
        }
      ]
    },
    {
      setname       : 'rfc3330',
      type       : 'hash:net',
      description: 'Reserved address space per RFC 3330.',

      entries: [
        {
          entry      : '169.254/16',
          description: 'Autoconf address space per RFC 1700.'
        },
        {
          entry      : '192.0.2/24',
          description: 'TEST-NET address space per RFC 1700.'
        }
      ]
    },
    {
      setname       : 'rfc3068',
      type       : 'hash:net',
      description: 'Reserved address space per RFC 3068.',

      entries: [
        {
          entry      : '192.88.99/24',
          description: '6to4 relay anycast address space per RFC 1700.'
        }
      ]
    },
    {
      setname       : 'rfc2544',
      type       : 'hash:net',
      description: 'Reserved address space per RFC 2544.',

      entries: [
        {
          entry      : '198.18.0.0/15',
          description: 'Device benchmarks address space per RFC 1700.'
        }
      ]
    },
    {
      setname       : 'all_martians',
      type       : 'list:set',
      description: 'All known martian address ranges.',

      entries: [
        {
          entry: 'rfc1918'
        },
        {
          entry: 'rfc1700'
        },
        {
          entry: 'rfc3330'
        },
        {
          entry: 'rfc3068'
        },
        {
          entry: 'rfc2544'
        }
      ]
    }
  ]
};