
- Auth

- Add options to select from HTTP or HTTPS. Set HTTPS as the default.

- Add more comprehensive tests to the basic acceptance ones.

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

- Catch all possible errors before they get to the ORM or system libs, to return appropriate
 error codes and the 500 error codes remain low and appropriate when unrecoverable errors
 may truly happen. This is an ongoing work.

	- Catch errors when not a valid json is sent (create/update actions) and return
	 appropriate error messages.

	- Catch errors when not the proper object was sent in the json (create/update actions)
	 and return appropriate error messages.