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

### Solution 1: Centralized Sync Gateway

This setup use a solution based on a centralized server to orchestrate all the sincronize operations between the devices. You can install this server in the local network to ensure that all the devices will sync with each others even when the internet connection is off. And configure this server to sync with a cloud server too. So it will sync with the cloud when the internet connection is on. Basically, the solution will have those components:

- First device emulated with `ionic serve -p 8100`
- Secound device emulated with `ionic serve -p 8200`
- Each device has your own local data storage using PouchDB
- One Couchbase Sync-Gateway server running locally with Docker
- Devices syncs with each other through the Sync-Gateway Server 

> _Note: Sync-gateway is used just as a communication gateway between all the devices. So, without a Couchbase server connect on it. If you start only one device and the Sync-Gateway. Then add one note on this device, and stop the device and the sync-gateway. Then restart the sync-gateway and start the another device. The note saved will not be visible on this other device until you start the first device again. The data saved on the sync-gateway is a cache data and will be lost if this server is restarted. But will resync when the device one reconnect with the sync-gateway server._

#### Setup Couchbase Sync-gateway using Docker

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

#### Ionic project

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

### Solution 2: P2P with Couchbase lite

This solution is basically a database distributed on devices of a local network synchronized with each other by a offline P2P network. And optionally syncronized with a single remote database when internet connection is available. The solution will have those components:

- First device emulated IOS emulator `ionic emulate ios --target "iPhone-4s, 9.2"`
- Secound device runned in a device on the same network `ionic run android -l -c -p 8100`
- Each device has your own local data storage using Couchbase Lite
- No Couchbase Sync-Gateway is required
- A Couchbase server running in the local network (ideally in a remote server)
- Devices syncs directly with the Couchbase server
- If Couchbase is off, devices sync with each other throw a P2P network.

> *NOTES:*  
>  - The Couch _Couchbase-Lite-PhoneGap-Plugin_ is not recognized by the browser. For that reason we are not using the `ionic server` to test this solution

#### Couchbase setup

As the database will be installed directly in the device (using _Couchbase-Lite-PhoneGap-Plugin_) is not necessary to install any database in your workspace.

#### Ionic setup

You can use the same setup of the previous solution, except that will be necessary to execute the following command before run the app:

```
ionic plugin add https://github.com/couchbaselabs/Couchbase-Lite-PhoneGap-Plugin.git
```

## References:

**Project based on:**

- [Syncing with Couchbase in an Ionic 2 App using PouchDB](https://blog.couchbase.com/2017/january/syncing-with-couchbase-in-an-ionic-2-app-using-pouchdb)
- [Data Synchronization with Couchbase in Ionic 2 Hybrid Mobile Apps](https://blog.couchbase.com/2016/december/data-synchronization-with-couchbase-in-ionic-2-hybrid-mobile-apps)

**Other references:**

DOCKER:

- [Docker for MAC](https://docs.docker.com/docker-for-mac/)
- [Docker Hub: couchbase/sync-gateway](https://hub.docker.com/r/couchbase/sync-gateway/)
- [Docker Hub: couchbase-server](https://hub.docker.com/_/couchbase/)

COUCHBASE:

- [Couchbase configuration file](https://developer.couchbase.com/documentation/mobile/1.3/guides/sync-gateway/config-properties/index.html)
- [Couchbase training](http://training.couchbase.com/online)
- [Couchbase Sync Gateway Intallation](https://developer.couchbase.com/documentation/mobile/current/installation/sync-gateway/index.html)
- [Couchbase REST APIs](https://developer.couchbase.com/documentation/mobile/1.1.0/develop/references/sync-gateway/rest-api/index.html)

COUCHBASE LITE (P2P):

- [Cordova Couchbase Lite Plugin](https://github.com/couchbaselabs/Couchbase-Lite-PhoneGap-Plugin)
- [JS Wrapper for Cordova Couchbase Lite Plugin](https://github.com/couchbaselabs/cordova-couchbase)
- [Let your Devices talk to each other](https://blog.couchbase.com/2015/october/let-your-devices-talk-to-each-other-p2p)
- [Building a Peer-to-Peer Photo Sharing App with Couchbase Mobile](https://blog.couchbase.com/photodrop)
- [couchbaselabs/TodoLite-Ionic](https://github.com/couchbaselabs/TodoLite-Ionic)
- [ldoguin/couchbase-messages-p2p-sample](https://github.com/ldoguin/couchbase-messages-p2p-sample)

PUCHDB:

- [PouchDB Guide](https://pouchdb.com/guides/)
- [First steps with PouchDB & Sync Gateway](https://blog.couchbase.com/first-steps-with-pouchdb--sync-gateway-todomvc-todolite)
  
  
  
