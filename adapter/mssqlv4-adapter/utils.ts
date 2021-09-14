import { Connection, ConnectionOptions, getConnectionManager } from 'typeorm';
import * as defaultEntities from './entities';

/** Ensure configOrString is normalized to an object. */
export function parseConnectionConfig(
  configOrString: string | ConnectionOptions
): ConnectionOptions {
  if (typeof configOrString !== 'string') {
    return {
      ...configOrString,
      entities: Object.values(configOrString.entities ?? defaultEntities)
    };
  }

  // If the input is URL string, automatically convert the string to an object
  // to make configuration easier (in most use cases).
  //
  // TypeORM accepts connection string as a 'url' option, but unfortunately
  // not for all databases (e.g. SQLite) or for all options, so we handle
  // parsing it in this function.
  try {
    const parsedUrl = new URL(configOrString);
    const config: any = {
      entities: Object.values(defaultEntities)
    };

    if (parsedUrl.protocol.startsWith('mongodb+srv')) {
      // Special case handling is required for mongodb+srv with TypeORM
      config.type = 'mongodb';
      config.url = configOrString.replace(/\?(.*)$/, '');
      config.useNewUrlParser = true;
    } else {
      config.type = parsedUrl.protocol.replace(/:$/, '');
      config.host = parsedUrl.hostname;
      config.port = Number(parsedUrl.port);
      config.username = parsedUrl.username;
      config.password = parsedUrl.password;
      config.database = parsedUrl.pathname.replace(/^\//, '').replace(/\?(.*)$/, '');
      config.options = {};
    }

    // This option is recommended by mongodb
    if (config.type === 'mongodb') {
      config.useUnifiedTopology = true;
    }

    // Prevents warning about deprecated option (sets default value)
    if (config.type === 'mssql') {
      config.options.enableArithAbort = true;
    }

    if (parsedUrl.search) {
      parsedUrl.search
        .replace(/^\?/, '')
        .split('&')
        .forEach((keyValuePair) => {
          /* eslint-disable-next-line prefer-const */
          let [key, value] = keyValuePair.split('=') as any;
          // Converts true/false strings to actual boolean values
          if (value === 'true') {
            value = true;
          }
          if (value === 'false') {
            value = false;
          }
          config[key] = value;
        });
    }

    return config;
  } catch (error) {
    // If URL parsing fails for any reason, try letting TypeORM handle it
    return { url: configOrString } as any;
  }
}

function entitiesChanged(prevEntities: any, newEntities: any[]): boolean {
  if (prevEntities?.length !== newEntities?.length) return true;

  for (let i = 0; i < prevEntities?.length; i++) {
    if (prevEntities[i] !== newEntities[i]) return true;
  }

  return false;
}

export async function updateConnectionEntities(connection: Connection, entities: any[]) {
  if (!entitiesChanged(connection.options.entities, entities)) return;

  // @ts-ignore
  connection.options.entities = entities;

  // @ts-ignore
  connection.buildMetadatas();
}

export async function ensureConnection(
  _connection: Connection,
  config: ConnectionOptions & { entities: any[] }
) {
  const connectionManager = getConnectionManager();

  if (connectionManager.has('default')) {
    _connection = connectionManager.get();

    _connection.isConnected || (await _connection.connect());

    if (process.env.NODE_ENV !== 'production') {
      await updateConnectionEntities(_connection, config.entities);
    }
  } else {
    _connection = await connectionManager.create(config).connect();
  }

  return _connection.manager;
}
