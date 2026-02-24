import express from 'express';
/*
    Import method(s) from associated controller
    
    import {[method names separate by commas]} from '[Path to Controller file with extension]';
*/

// gives us the "Router"
const router = express.Router();

/*
    create endpoints as needed following the format of:

    router.[method]('[relative path with any variables], [method name from controller]);

    EX: router.get('/:id', getPost );
*/

export default router;