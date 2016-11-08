import { RepoBase } from './repositories.base';
import { Account } from '../models/Account.model'
import { ListBrower } from '../models/ListBrower.model'
import { Pool, QueryResult } from 'pg';

export class AccountRepo extends RepoBase {
    constructor() {
        super();
    }

    private rollback = (client) => {
        client.query('ROLLBACK', err => {
            console.error(err)
            return (err)
        })
    }

    public FindOne = (option: Account) => {
        let text = 'select * from "account" where username = $1 and passhash = $2'
        return this._pgPool.query(text, [option.UserName, option.PassHash])
            .then(result => {
                if (result.rowCount == 1)
                    return Promise.resolve(result)
            })
            .catch((err) => {
                return Promise.reject(err);
            })
    }

    public AddBrower = (opBrower: ListBrower, idaccount: string) => {
        let text2 = 'select * from "dsbrower" where namebrower = $1 and os = $2 and version = $3 and platform =$4'
        let query3 = 'insert into "dsbrower" (idaccount,namebrower,os,version,platform) values ($1,$2,$3,$4,$5)'
        return this._pgPool.query(text2, [opBrower.NameBrower, opBrower.OS, opBrower.Version, opBrower.PlatForm])
            .then(result => {
                if (result.rowCount == 0)
                    return this._pgPool.query(query3, [idaccount, opBrower.NameBrower, opBrower.OS, opBrower.Version, opBrower.PlatForm])
                        .then(() => { Promise.resolve() })
                else
                    return Promise.resolve();
            }).catch(err => {
                return Promise.reject(err)
            })
    }

    /**
     * Kiểm tra DSBROWER theo tiêu chi namebrower, os ,version, platform
     * Nếu 1 trong 4 cái khác thì thêm vào còn k thì té
     */
    private MapValues = (values: QueryResult) => {
        let list: ListBrower[] = values.rows.map(r => {
            let lists = new ListBrower();
            lists.NameBrower = r.namebrower;
            lists.OS = r.os;
            lists.PlatForm = r.platform;
            lists.Version = r.version;
            return lists;
        })
        return list;
    }
}