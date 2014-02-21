# TO

## Implement

### Immediate

- Add header with link to API profile. Store the profile in the vifros instance to be accessible locally?

### Queue

- Seguir pensando en si pasar settings y addresses para / y no como subresource. Desde punto de vista programacion es
  mas limpio y tiene logica desde REST dado que seria el mismo resource setting. Se filtraria via module.

- **interfaces:** Monitor to detect changes and propagate them to operational state.

- **logs:** Add `/logs/settings`.

- Implement the Auth package.

- Log API requests in all routes. With `express` middleware? How to get `res` status code?

## Research

- To add **i18n** using [https://github.com/mashpie/i18n-node](https://github.com/mashpie/i18n-node).