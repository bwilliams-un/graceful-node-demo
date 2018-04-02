# graceful shutdown demo

## Purpose

This demo is an experiment in what's needed to bleed connections from a web server prior to shutting down. In a managed scenario such as PM2 or a Container you will receive  signals or IPC that allow you to complete existing connections before you drop for a scale/shutdown/upgrade.

## Expectations

The goal is the following flow:

* Process receives SIGINT or IPC shutdown message
* Unregister from service discovery
* Stop listening for new connections
* Wait grace period to let connections finish
* End process or receive SIGKILL and shutdown

## Considerations

### keep-alive
Connections with keep-alive will stay open even if they are idle. Should you let the orchestrator force the shutdown in this case, or manually manage the sockets and close them forcefully during a shutdown?

### intentional long connections
Does the service provide an endpoint that would intentionally be open longer than a grace period? File delivery or some other transfer? If it does should the grace accomodate? Application specific case.
