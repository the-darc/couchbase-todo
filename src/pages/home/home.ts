import { Component, NgZone } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
// import { PouchDBProvider } from "../../providers/pouchdb-provider";
import { CouchbaseLiteProvider } from "../../providers/couchbase-lite-provider";
import * as Uuid from "uuid";

// Necessary to avoid typescript error:
//   "Property 'cblite' does not exist on type 'Window'"
declare var window: any;

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    public items: Array<any>;
    public peerDbUrl: string = null;
    public logs: string = "";
    public dbUrl: string = "Not connected"

    public constructor(
        public navCtrl: NavController,
        public alertCtrl: AlertController,
        // private database: PouchDBProvider,
        private couchbase: CouchbaseLiteProvider,
        private zone: NgZone,
        private platform: Platform
    ) {
        this.items = [];
    }

    public ionViewDidEnter() {
        /*this.database.fetch().then(result => {
            this.items = [];
            for(let i = 0; i < result.rows.length; i++) {
                this.items.push(result.rows[i].doc);
            }
        }, error => {
            console.error(error);
        });*/
        this.platform.ready().then(() => {
            setTimeout(() => {
                this.couchbase.getChangeListener().subscribe(data => {
                    for(let i = 0; i < data.length; i++) {
                        if(!data[i].hasOwnProperty("deleted") && data[i].id.indexOf("_design") === -1) {
                            this.couchbase.getDatabase().getDocument(data[i].id).then(result => {
                                if(result.type === "list") {
                                    this.zone.run(() => {
                                        this.items.push(result);
                                    });
                                }
                            });
                        }
                    }
                });
                this.refresh();

                if(!window.cblite) {
                    this.log("Couchbase Lite is not installed!");
                } else {
                    this.dbUrl = this.couchbase.getDatabase().getUrl();
                    console.log('dbUrl: ' + this.dbUrl);
                    // window.cblite
                }
            }, 1000);
        });

    }

    public refresh() {
        this.couchbase.getDatabase().queryView("_design/todo", "items", {})
        .then(result => {
            this.items = [];
            for(var i = 0; i < result.rows.length; i++) {
                this.items.push(result.rows[i].value);
            }
        }, error => {
            console.error("ERROR: " + JSON.stringify(error));
        });
    }

    public updateSync() {
        let prompt = this.alertCtrl.create({
            title: 'Update sync URI',
            message: "Update the PouchDB sync destination URI",
            inputs: [
                {
                    name: 'dbUrl',
                    placeholder: 'http://localhost'
                },
                {
                    name: 'port',
                    placeholder: '4984'
                }
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {}
                },
                {
                    text: 'Save',
                    handler: data => {
                        if (data.dbUrl || data.port) {
                            this.peerDbUrl = (data.dbUrl || 'localhost') + ':' +
                                           (data.port || '4984') + '/example';
                        } else {
                            this.peerDbUrl = undefined;
                        }
                        this.log('try to syncing with: ' + this.peerDbUrl);
                        this.couchbase.getDatabase().sync(this.peerDbUrl, true).then(result => {
                            this.log('sync ok');
                            this.log(JSON.stringify(result));
                        }).catch(err => {
                            this.log('sync erro');
                            this.log(JSON.stringify(err));
                        });
                        /*this.database.sync(this.peerDbUrl);
                        this.database.getChangeListener().subscribe(data => {
                            for(let i = 0; i < data.change.docs.length; i++) {
                                this.zone.run(() => {
                                    this.items.push(data.change.docs[i]);
                                });
                            }
                        });*/
                    }
                }
            ]
        });
        prompt.present();
    }

    /*public insert() {
        let prompt = this.alertCtrl.create({
            title: 'Todo Items',
            message: "Add a new item to the todo list",
            inputs: [
                {
                    name: 'title',
                    placeholder: 'Title'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {}
                },
                {
                    text: 'Save',
                    handler: data => {
                        this.database.put({type: "list", title: data.title}, Uuid.v4());
                    }
                }
            ]
        });
        prompt.present();
    }*/

    public add() {
        let prompt = this.alertCtrl.create({
            title: 'Todo Items',
            message: "Add a new item to the todo list",
            inputs: [
                {
                    name: 'title',
                    placeholder: 'Title'
                },
            ],
            buttons: [
                {
                    text: 'Cancel',
                    handler: data => {}
                },
                {
                    text: 'Save',
                    handler: data => {
                        this.couchbase.getDatabase()
                        .createDocument({type: "list", title: data.title});
                    }
                }
            ]
        });
        prompt.present();
    }

    public log(str) {
        this.logs += "\r\n";
        this.logs += str;
    }

}
