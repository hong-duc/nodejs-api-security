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

    // public Insert = (option: Account, opBrower: ListBrower) => {

    //     let query = "Insert INTO ACCOUNT (UserName,PassHash,Email,isActivite,CreateDate,UpdateDate) Values($1,$2,$3,$4,$5,$6)"
    //     let query2 = "SELECT IDACCOUNT FROM ACCOUNT WHERE UserName = '$1' AND PassHash = '$2'"
    //     let query3 = "INSERT INTO DSBROWER (IDACCOUNT,NAMEBROWER,OS,VERSION,PLATFORM) VALUES ($1,$2,$3,$4,$5)"

    //     this._pgPool.connect((err, client, done) => {
    //         if (err) throw err;
    //         client.query('BEGIN', err => {

    //             if (err)
    //                 return this.rollback(client, done)

    //             process.nextTick(() => {
    //                 client.query(query,
    //                     [
    //                         option.UserName,
    //                         option.PassHash,
    //                         option.Email, true,
    //                         option.CreateDate,
    //                         option.UpdateDate
    //                     ], err => {
    //                         if (err) return this.rollback(client, done)
    //                         client.query(query2, [option.UserName, option.PassHash], (err, reuslt) => {
    //                             if (err) return this.rollback(client, done)
    //                             console.log(reuslt[0].IdAccountlt)
    //                             client.query(query3,
    //                                 [
    //                                     reuslt[0].IdAccount,
    //                                     opBrower.NameBrower,
    //                                     opBrower.OS,
    //                                     opBrower.Version,
    //                                     opBrower.PlatForm
    //                                 ], err => {
    //                                     if (err) return this.rollback(client, done)
    //                                     else console.log("Đã Thêm xong 2 bảng vl")
    //                                     client.query('COMMIT', done);
    //                                 })
    //                         })
    //                     })
    //             })
    //         })
    //     })
    // }

    public FindOne = (option: Account, opBrower: ListBrower) => {
        let text = 'select * from "account" where username = $1 and passhash = $2'
        let query3 = 'insert into "dsbrower" (idaccount,namebrower,os,version,platform) values ($1,$2,$3,$4,$5)'

        return this._pgPool.query('BEGIN')
            .then(() => {
                this._pgPool.query(text, [option.UserName, option.PassHash])
                    .then(result => {
                        this._pgPool.query(query3,
                            [
                                result.rows[0].idaccount,
                                opBrower.NameBrower,
                                opBrower.OS,
                                opBrower.Version,
                                opBrower.PlatForm
                            ]).then(()=>{
                                this._pgPool.query('COMMIT')
                            })
                    })
            }).catch(()=>{
                this._pgPool.query('ROLLBACK')
            })
    }
}