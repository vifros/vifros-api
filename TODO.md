
- Auth

- Add options to select from HTTP or HTTPS. Set HTTPS as the default.

- Add acceptance tests. Make them dynamic base on the API schema?

- Logging: For logging purposes only log the entire error message instead and return
 more meaningful error messages or keep the current 500 way?

- NAT
	- source
	- destination

	- add default rules to prevent auto-lockout:
		- out-if: lo
		- type: source
		- jump: ACCEPT

- Firewall

- IP sets