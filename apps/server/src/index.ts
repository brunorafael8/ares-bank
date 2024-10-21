import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import ws from 'ws';
import { config } from './config';
import { connectDatabase } from './database';
import { schema } from './schema/schema';
import app from './server/app';

(async () => {
  await connectDatabase();

  const server = createServer(app.callback());

  server.listen(config.PORT, () => {
    console.log(`server running on port :${config.PORT}`);
  });
  const graphqlWs = new ws.Server({ server });
  useServer({ schema }, graphqlWs);
})();