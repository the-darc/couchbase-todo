# couchbase-todo

A Mobile App to manage notes.

This app was created just to test the  power of [Couchbase](couchbase.com) + [PouchDb](pouchdb.com) tools.

## Features:

### Identify your self

To use the app the first thing to do is identify your self. This will
be done by the user when he puts your name (need to be unique) on the app.

After that the user will be identified as a single **NODE** on the couchbase
architeture. The user node data [name; group; lan address] will be saved in
the user local storage and synched with the couchbase remote storage.

### Create your Own notes

The notes created by the app user (a Node) will be **saved in the device local
storage** and **synched with the couchbase** server storage. Thouse notes will be
only visible for his creator.

### Choose a group to be in

The user of the app could enter in a group of nodes to view and create notes in
that group.

When the user enter in a group. The local app will get from the remote couchbase
all the nodes of that group. But, the list of nodes of the group will not be saved
locally in the app storage. It will be synched on demand whe the user change his group
or when the user click in a sync button.

### Create Group Notes

A user of a Group can create and remove notes in that group. Notes of the group
will be saved in the device local storage and synched with the couchbase remote storage.

Most importantly, the notes of a group will be synched directly between the users
of that group if they are in the same network. Even if they don't have access to the 
internet (remote chouchbase storage)

## Setup the application:

### Solution preview

This setup use a solution based on:

- First device emulated with `ionic serve -p 8100`
- Secound device emulated with `ionic serve -p 8200`
- Each device has your own local data storage using PouchDB
- One Couchbase Sync-Gateway server running locally with Docker
- Devices syncs with each other through the Sync-Gateway Server 

> _Note: There is no remote data server. Sync-gateway is used just as a communication gateway between all the devices. If you start one device and the Sync-Gateway only. Then add one note on the device, and stop the device and the sync-gateway. Then restart the sync-gateway and start the another device. The note saved will not exist in the base. The data saved on the sync-gateway is a cache data and will be lost if this server is restarted. But will resync when the device one reconnect with the sync-gateway server._

### Setup Couchbase Sync-gateway using Docker

```bash
# Download sync-gateway container
docker pull couchbase/sync-gateway

# Save config file
mkdir ~/docker
cd ~/docker
vim my-sg-config.json

# Added above value and save
{
    "log":["CRUD+", "REST+", "Changes+", "Attach+"],
    "databases": {
        "example": {
            "server":"walrus:",
            "sync":`
                function (doc) {
                    channel (doc.channels);
                }
            `,
            "users": {
                "GUEST": {
                    "disabled": false,
                    "admin_channels": ["*"]
                }
            }
        }
    },
    "CORS": {
        "Origin": ["http://localhost:8100", "http://localhost:8200"],
        "LoginOrigin": ["http://localhost:8100", "http://localhost:8200"],
        "Headers": ["Content-Type"],
        "MaxAge": 17280000
    }
}

# Start sync-gateway using config file
docker run -p 4984:4984 -d --name cbSG -v ~/docker:/tmp/config couchbase/sync-gateway /tmp/config/my-sg-config.json


# SG url: http://localhost:4984
curl http://localhost:4984

# View Sync-Gateway logs
docker logs cbSG
```

**If you want to access the Sync-gateway admin port:**
```
# Admin url: http://localhost:4985
docker exec -ti cbSG bash
curl http://localhost:4985

# Exposing admin port:
# $ docker run -p 4984-4985:4984-4985 -d couchbase-sync-gateway -adminInterface :4985 /etc/sync_gateway/config.json
```

> **NOTE:**  
> _**Walrus mode**_ - By default, Sync Gateway uses a built-in, in-memory server called "Walrus" that can withstand most prototyping use cases, extending support to at most one or two users. In a staging or production environment, you must connect each Sync Gateway instance to a Couchbase Server cluster.

### Ionic project

**Using this repository:**
```bash
git clone https://github.com/the-darc/couchbase-todo.git
cd couchbase-todo
npm install
ionic state restore
ionic server -p 8100
ionic server -p 8100
# Run the last one it in annoter terminal
```

**Creating a new Ionic:**
```bash
ionic start couchbase-todo blank --v2
cd couchbase-todo
ionic platform add ios
ionic platform add android
npm install pouchdb --save
npm install @types/node --save
npm install @types/uuid --save
```

## References:

**Project based on:**

[Syncing with Couchbase in an Ionic 2 App using PouchDB](https://blog.couchbase.com/2017/january/syncing-with-couchbase-in-an-ionic-2-app-using-pouchdb)

**Other references:**

- [Docker for MAC](https://docs.docker.com/docker-for-mac/)
- [Docker Hub: couchbase/sync-gateway](https://hub.docker.com/r/couchbase/sync-gateway/)
- [Docker Hub: couchbase-server](https://hub.docker.com/_/couchbase/)
- [Couchbase configuration file](https://developer.couchbase.com/documentation/mobile/1.3/guides/sync-gateway/config-properties/index.html)
- [Couchbase training](http://training.couchbase.com/online)
- [Couchbase Sync Gateway Intallation](https://developer.couchbase.com/documentation/mobile/current/installation/sync-gateway/index.html)
- [Couchbase REST APIs](https://developer.couchbase.com/documentation/mobile/1.1.0/develop/references/sync-gateway/rest-api/index.html)
- [PouchDB Guide](https://pouchdb.com/guides/)
  
  
  
