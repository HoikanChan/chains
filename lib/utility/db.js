const Datastore = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path')
const fs = require('fs-extra');
const { app, remote }  =  require('electron');
 
const APP = process.type === 'renderer' ? remote.app : app;
const STORE_PATH = APP.getPath('userData')
const adapter = new FileSync(path.join(STORE_PATH, '/data.json'))
const db = Datastore(adapter);