import express, { Express } from 'express';
import path from 'path';
import swaggerUI from 'swagger-ui-express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const swaggerDocs = require('../swagger.json');

export default function (app: Express) {
	app.use('/swagger.json', express.static(path.join(__dirname, '../swagger.json')));
	app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));
}
