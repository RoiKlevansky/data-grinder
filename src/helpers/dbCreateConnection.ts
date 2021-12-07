import { Connection, createConnection } from 'typeorm';

import settings from '../config/config';

export const dbCreateConnection = async (): Promise<Connection> => {
  const conn = await createConnection({
    type: 'postgres',
    host: settings.db.host,
    port: settings.db.port,
    username: settings.db.username,
    password: settings.db.password,
    database: settings.db.database,
    entities: [__dirname + '/../entities/*.ts'],
    synchronize: true,
  });
  console.log(`Database connection success. Connection name: '${conn.name}' Database: '${conn.options.database}'`);
  return conn;
};