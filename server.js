import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
/*
    For all route files include
        import [routeFileVariableName] from '[path to file with extension]';
    
        EX: import posts from './routes/genericRouteFile.js';
*/
import logger from './middleware/logger.js';
import errorHandler from './middleware/error.js';
import notFound from './middleware/notFound.js';

const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));

/*
    For all route files include
        app.use('prefix to append to all the routes in the route file', classObjectName)
    
    EX: app.use('/api/posts', posts);
*/

app.use(notFound);
app.use(errorHandler);
app.listen(port, () => console.log(`Server running on port ${port}`));