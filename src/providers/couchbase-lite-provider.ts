import { Injectable, EventEmitter} from '@angular/core';
import { Http } from '@angular/http';
import { Platform } from 'ionic-angular';
import { Couchbase, Database } from "cordova-couchbase/core";
import 'rxjs/add/operator/map';

@Injectable()
export class CouchbaseLiteProvider {

    private isInstantiated: boolean;
    private database: Database;
    private listener: EventEmitter<any> = new EventEmitter();

    public constructor(
        public http: Http,
        platform: Platform) {

        if(!this.isInstantiated) {
            console.log('1');
            platform.ready().then(() => {
                console.log('2');
                (new Couchbase()).openDatabase("nraboy").then(database => {
                    console.log('3');
                    this.database = database;
                    console.log('THIS.DATABASE WAS SETTED!');
                    let views = {
                        items: {
                            map: function(doc, emit) {
                                if(doc.type == "list" && doc.title) {
                                    emit(doc._id, {title: doc.title, rev: doc._rev})
                                }
                            }.toString()
                        }
                    };
                    this.database.createDesignDocument("_design/todo", views);
                    this.database.listen(change => {
                        this.listener.emit(change.detail);
                    });
                    this.isInstantiated = true;
                }, error => {
                    console.error(error);
                });
            });
        } else {
            console.log('WARN: CouchbaseLiteProvider already instantiated');
        }
    }

    public getDatabase() {
        console.log('this.database was getted!');
        return this.database;
    }

    public getChangeListener(): EventEmitter<any> {
        return this.listener;
    }
}
