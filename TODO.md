- Document the API using swagger.

- Give meaningful default values to all fields so API always returns all fields.

- NAT
	- source
	- destination

	- add default rules to prevent auto-lockout:
		- out-if: lo
		- type: source
		- jump: ACCEPT

- Firewall

- IP sets

- Auth

- Add options to select from HTTP or HTTPS. Set HTTPS as the default.

- Add acceptance tests.

- Change errors to the new way. Add json errors even to 404 & 500. Change `log.error`
  to log all the error data.

- Logging: For logging purposes only log the entire error message instead and return
 more meaningful error messages or keep the current 500 way?