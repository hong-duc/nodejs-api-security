import path = require('path');
import {PgPool} from './pg-pool'
import { Pool } from 'pg';
let env = process.env.NODE_ENV || 'Login';
let config = require(path.join(__dirname,'..','..', 'config', 'database.config.json'))[env];

export abstract class RepoBase {

    protected _pgPool: Pool;

    public constructor() {
        this._pgPool = PgPool.getPool();
    }

    //public abstract getList(option);
    //public abstract getOne(option);
    // them vai thu nua
    

}