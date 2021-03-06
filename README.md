
#  DJS-chain
             
This code illustrates a chain of linked objects from browsers to a
single database via two servers using HTTP and WebSocket.

## Main Features

This code is part of the
[Diffuse Javascript](https://plus.google.com/communities/108273924382799882716) 
MOOC. It illustrates a chain of objects starting in the browser, linked to
server objects and backed up in an SQL database. When an object is
modified in a browser, an HTTP REST API call propagates the
modification towards the corresponding server object which is
persisted in an SQL database, the modification is then pushed towards
the various clients of the server via WebSocket so, at the end, all
browsers should eventually share the same state.

``` javascript
browserObject.setProperty(propName, newValue)
   ==> HTTP REST request to the server:
       ===> convert HTTP request into javascript code:
            serverObject.setProperty(propName, newValue)
            ===> convert modification into SQL: 
                 update table set propName = newValue
       <==  Broadcast updates to all browser clients via JSON and WebSocket
       {update: propName, value: newValue}
```

The code depends only on the `sqlite3` and `ws` modules, it does not
use elaborate framework for Web, ORM, REST, etc. but just plain
standard Node.js modules: `http`, `url` and `fs`. This keeps code
minimal, simple and disembarrassed of useless features. 

## Files required for servers

`dbobject` is a tiny ORM (Object Relational Mapping) converting rows
of SQL tables into Javascript objects. Conversely, modifying the
Javascript object runs appropriate SQL commands to update the
database.

`webapi` is a tiny HTTP server that offers a REST API mapping HTTP
requests into access to database objects. HTTP methods such as GET,
PUT, POST and DELETE are supported.

`wsapi` is a tiny WebSocket server that pushes modifications of
database objects to all connected clients. `webapi` could also have
been implemented with WebSocket but this separation illustrates the
different aspects of the two protocols.

## Files required for clients

`browserobj` is a tiny library that offers objects linked to remote
objects hosted on some server and accessed via an HTTP REST API. A
modification to such an object is translated into an HTTP PUT request.
Concurrently, the library fires a WebSocket client receiving the
updates to apply.

# Installation

The simplest way is to install the npm module `djs-chain` with

``` shell
npm install djs-chain
cd node_modules/djs-chain/
```

If you prefer to clone the repository, then you must regenerate the
webapp with the following commands:

``` shell
git clone https://github.com/ChristianQueinnec/DJS-chain.git
cd DJS-chain
gulp
```

## Demo

Start a server (by default on port 18080) with:

``` shell
npm run start
```

If you prefer another port, you may specify it explicitly with:

``` shell
export PORT=18080
cd Site
node ../src/chain.js
```

Note that websocket will use the next port (by default 18081).

Once the server is started, fire a browser on
`http://127.0.0.1:18080/`. The served page shows two independent
frames, you may modify objects in one frame and observe the
modifications arriving in the other frame (via the server).
A small documentation appears on the served page.

## Miscellaneous

### OpenAPI

An OpenAPI description of the HTTP REST API is available in
`Swagger/swagger.json`. You may visualize it on the
[Swagger site](https://app.swaggerhub.com/apis/chq/djs-chain/1.0.0)

### Heroku

Does Heroku supports two simultaneous open ports (http and ws) ?

