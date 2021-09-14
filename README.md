# Reproduction for failed connection

https://github.com/nextauthjs/adapters/issues/222

How to setup

- Go to adapter/mssqlv4-adapter and run `docker-compose up -d`
- Express SQL db will start and create `nextauth` db automatically
- Use .env example for db connection setup and add a provider, doesn't matter which one.
- Observe db connection error in console when signing in

This is where the code fails [[...next-auth].ts](https://github.com/Fronix/next-auth-adapter--222/blob/35bcc8fd6b38113d676b75b0cf4cf951f25f39c4/pages/api/auth/%5B...nextauth%5D.ts#L60) read comment inside the `signIn` callback for information.

Might only be for MSSQL (not sure and dont have time to test other dbs)
