import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { TypeORMLegacyAdapter } from "../../../adapter/mssqlv4-adapter"

export const adapter = TypeORMLegacyAdapter({
  type: "mssql",
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_DB,
  port: 1434,
  synchronize: true,
  logger: "debug",
  logging: true,
  options: {
    encrypt: false, // just used for express docker db setup
  },
})

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export default NextAuth({
  // https://next-auth.js.org/configuration/providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  // Setup adapter
  adapter,
  // The secret should be set to a reasonably long random string.
  // It is used to sign cookies and to sign and encrypt JSON Web Tokens, unless
  // a separate secret is defined explicitly for encrypting the JWT.
  secret: process.env.SECRET,
  // Dont use JWT
  session: {
    jwt: false,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  // You can define custom pages to override the built-in ones. These will be regular Next.js pages
  // so ensure that they are placed outside of the '/api' folder, e.g. signIn: '/auth/mycustom-signin'
  // The routes shown here are the default URLs that will be used when a custom
  // pages is not specified for that route.
  // https://next-auth.js.org/configuration/pages
  pages: {
    // signIn: '/auth/signin',  // Displays signin buttons
    // signOut: '/auth/signout', // Displays form with sign out button
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // Used for check email page
    // newUser: null // If set, new users will be directed here on first sign in
  },

  // Callbacks are asynchronous functions you can use to control what happens
  // when an action is performed.
  // https://next-auth.js.org/configuration/callbacks
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      /**
       * This is where it fails!
       * We run some database checks here which makes the database connection fail with
       * !! Cannot create a new connection named "default", because connection with such name already exist
       * !! and it now has an active connection session. AlreadyHasActiveConnectionError:
       * !! Cannot create a new connection named "default", because connection with such name already exist and it now has an active connection session.
       *
       * Comment out this code and return true and it works again
       */
      console.log("running custom db thing")
      // Here we run a custom adapter function before login, only using getUserByEmail as example
      const someDbLookupData = await adapter.getUserByEmail(
        "blabladoesntmatter"
      )
      return !!someDbLookupData

      // return true
    },
    // async redirect({ url, baseUrl }) { return baseUrl },
    // async session({ session, token, user }) { return session },
    // async jwt({ token, user, account, profile, isNewUser }) { return token }
  },

  // Events are useful for logging
  // https://next-auth.js.org/configuration/events
  events: {},

  // Enable debug messages in the console if you are having problems
  debug: true,
})
