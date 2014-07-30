/*
 * Schema definition.
 */
var Match = {};

Match.comment = {
  // Must be less than 256 chars.
  comment: String
};

/*
 * Only if ports are: tcp, udp, udplite, dccp, sctp.
 * Up to 15 ports.
 * A port range counts as two ports.
 */
Match.multiport = {
  'source-ports'     : {
    inverted: Boolean,
    value   : String
  },
  'destination-ports': {
    inverted: Boolean,
    value   : String
  },
  ports              : {
    inverted: Boolean,
    value   : String
  }
};

exports.MatchSchema = Match;