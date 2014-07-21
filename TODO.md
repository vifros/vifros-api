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

- Add `/logs/settings`.

- Add options to select from HTTP or HTTPS. Set HTTPS as the default.

- Use `apidocjs` to generate API docs?

- Add acceptance tests.

- Change errors to the new way. Add json errors even to 404 & 500.