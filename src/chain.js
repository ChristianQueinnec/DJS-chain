// Chained objects from browser to sql
// This code starts two servers (HTTP and WS) to manage a database.
// It also serves a default page for a quick demo.

const fs = require('fs');

const dbobject = require('./dbobject.js');
const webapi   = require('./webapi.js');
const wsapi    = require('./wsapi.js');

let localport = process.env.PORT || 18080;

/** 
    Enrich the HTTP server to deliver local files.
    This is a demonstration, don't use this code in production, it is too
    simple and probably unsafe.
*/

function addRoutes (routes) {
    function serveFile (filename, response) {
        console.log(`serving ${filename}`);
        if ( fs.existsSync(filename) ) {
            let rs = fs.createReadStream(filename);
            response.statusCode = 200;
            if ( filename.endsWith('.js') ) {
                response.setHeader('Content-Type', 'text/javascript');
            } else if ( filename.endsWith('.html') ) {
                response.setHeader('Content-Type', 'text/html; charset="UTF-8"');
            } else if ( filename.endsWith('favicon.ico') ) {
                response.setHeader('Content-Type', 'image/vnd.microsoft.icon');
            } else {
                response.setHeader('Content-Type', 'application/octet-stream');
            }
            rs.pipe(response);
        } else {
            response.statusCode = 404;
            response.end();
        }
    }
    routes.GET.unshift({
        regexp: new RegExp('^/([^.]+[.](html|js|ico))$'),
        reaction: function (matches, request, response) {
            serveFile(matches[1], response);
        }
    });
    routes.GET.unshift({
        regexp: new RegExp('^/$'),
        reaction: function (matches, request, response) {
            serveFile('index.html', response);
        }
    });
    return routes;
}

/**
   Create database, fill it and start two servers http and ws:
*/

let servers;
function startServers () {
    /*eslint no-console: 0 */
    return new dbobject.DBsqlite3().then((db) => {
        console.log(`created database`);
        return db.createTable('Person',
                              { nickname: { type: 'text' },
                                age:      { type: 'num' } })
            .then((table) => {
                console.log(`created table Person`);
                table.insert({nickname: "Joe", age: 42});
                table.insert({nickname: "Jill", age: 43});
                console.log(`inserted Joe and Jill`);
                return webapi.generateRoutes(db)
                    .then((routes) => {
                        console.log(`generated routes for Person`);
                        routes = addRoutes(routes);
                        console.log(`added route for static files`);
                        servers = wsapi.mkservers(localport, routes);
                        let url = `http://127.0.0.1:${localport}/`;
                        console.log(`servers ready, browse ${url}`);
                        return Promise.resolve(servers);
                    });
            });
    }).catch(console.log);
}

startServers();

// end of chain.js
