# Reproduction for failed connection

https://github.com/nextauthjs/adapters/issues/222

How to setup

- Go to adapter/mssqlv4-adapter and run `docker-compose up -d`
- Express SQL db will start and create `nextauth` db automatically
- Use .env example for db connection setup and add a provider, doesn't matter which one.
- Observe db connection error in console

Might only be for MSSQL (not sure and dont have time to test other dbs)
