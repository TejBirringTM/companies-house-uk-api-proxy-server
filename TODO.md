# TO DO

List of work to be done, in no particular order:

- [ ] Facilitate connection to external memory store for rate limiting (generic, vendor-agnostic abstraction + implementation for a popular vendor)

- [ ] Facilitate connection to external memory store for caching (generic, vendor-agnostic abstraction + implementation for a popular vendor)

- [ ] Implement authentication middleware builder (generic, vendor-agnostic abstraction)

    * User Identities
    * User Roles
    * JWT Tokens
    * API Keys

- [ ] Self-documentation of server including its endpoints, i.e. using `OPTIONS` request

- [ ] Implement graceful shutdown

- [ ] Centralise error handling

    * Consistent custom error classes
    * Error logging

- [ ] Implement structured logging mechanism

- [ ] Facilitate/implement event-based audit logging

- [ ] Initial test setup

    * Unit test
    * Integration tests
    * API tests
    * Load tests
    * Coverage reports

- [ ] Explore options to ease deployment (support various types): scripts, CI/CD workflows, etc.
