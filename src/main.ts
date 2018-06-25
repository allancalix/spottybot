import * as server from './bootstrap';

const PORT = process.env.PORT || 3000;

function main() {
  console.log(`Starting on port ${PORT}...`);
  server.init();
}

main();
