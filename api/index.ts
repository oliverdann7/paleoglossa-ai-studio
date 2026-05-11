import serverless from 'serverless-http';
import { createApiApp } from '../server';

const app = createApiApp();
export const handler = serverless(app);
