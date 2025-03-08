import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import bootstrap from './main.server';

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  /**
   * Example Express Rest API endpoints can be defined here.
   * Uncomment and define endpoints as necessary.
   *
   * Example:
   * ```ts
   * server.get('/api/**', (req, res) => {
   *   // Handle API request
   * });
   * ```
   */

  /**
   * Serve static files from /browser
   */
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  /**
   * Handle all other requests by rendering the Angular application.
   */
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => {
        console.error(err);
        res.sendStatus(500);
      });
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

// Check if this file is being run directly or imported
const mainModule = process.argv[1];
const moduleFilename = mainModule && fileURLToPath(mainModule);
if (moduleFilename === fileURLToPath(import.meta.url)) {
  run();
}
