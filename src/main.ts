import * as server from './bootstrap';

import { PORT } from './constants';

function main() {
  console.log(`Starting on port ${PORT}...`);
  server.init();
}

main();
