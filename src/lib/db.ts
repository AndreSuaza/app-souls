import { MongoClient, ServerApiVersion } from "mongodb"
import dns from "node:dns"
import { promisify } from "node:util"
 
if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}
 
const uri = process.env.DATABASE_URL

// Some local DNS resolvers reject MongoDB Atlas SRV records. Keep the
// resolver override opt-in so production continues using its own DNS setup.
const configuredDnsServers = process.env.MONGODB_DNS_SERVERS
  ?.split(",")
  .map((server) => server.trim())
  .filter(Boolean)
const dnsServers = configuredDnsServers?.length
  ? configuredDnsServers
  : process.env.NODE_ENV === "development"
    ? ["1.1.1.1", "8.8.8.8"]
    : undefined

if (dnsServers?.length) {
  dns.setServers(dnsServers)

  // The MongoDB driver resolves mongodb+srv records through its own
  // promise methods, so provide it with the same explicit resolver.
  const resolver = new dns.Resolver()
  resolver.setServers(dnsServers)
  dns.promises.resolveSrv = promisify(resolver.resolveSrv.bind(resolver))
  dns.promises.resolveTxt = promisify(resolver.resolveTxt.bind(resolver))
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}
 
let client: MongoClient
 
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClient?: MongoClient
  }
 
  if (!globalWithMongo._mongoClient) {
    globalWithMongo._mongoClient = new MongoClient(uri, options)
  }
  client = globalWithMongo._mongoClient
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
}
 
// Export a module-scoped MongoClient. By doing this in a
// separate module, the client can be shared across functions.
export default client
