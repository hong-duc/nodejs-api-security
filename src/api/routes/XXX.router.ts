
import { Router, Response, Request } from 'express';
import * as session from 'express-session'
import * as  request from 'request'
import { AccountRepo } from '../repositories/Account.repo'
import { MyCache } from '../app'
import { Account } from '../models/Account.model'
import { ListBrower } from '../models/ListBrower.model'

export class XXXRouter {
    private router: Router;
    constructor() {
        this.router = Router();
    }

    public GetRouter = () => {
        this.router.route('/checkcache')
            .post(this.CheckCache)
        this.router.route('/login')
            .post(this.CheckLogin)
        return this.router;
    }

    private CheckCache = (req: Request, res: Response) => {
        MyCache.get(req.body.Session, (err, data) => {
            if (data == undefined) {
                console.log("Chua co trong Cache")
                res.sendStatus(404)
            } else {
                console.log("Da Co Trong Cache")
                MyCache.ttl(req.body.Session, req.body.TTL, (err, changed) => {
                    if (!err && changed) {
                        console.log("Đã thay đổi TTL " + req.body.Session + " : " + req.body.TTL)
                        res.status(202).send(data)
                    }
                })
            }
        })
        console.log(MyCache.keys())
    }

    private CheckLogin = (req: Request, res: Response) => {

        new AccountRepo().FindOne(this.Account(req.body), this.Brower(req.body)).then(() => {
            MyCache.set(req.body.Session, req.body, req.body.TTL, (err, data) => {
                if (!err && data)
                    res.status(200).send(req.body)
            })
        }).catch(() => { res.sendStatus(404) })
        res.status(200).send(req.body)
    }

    private CheckCookieInClient = (value) => {
        let r = request.post('http://localhost:3008/CheckSession', (err, response, body) => {
            if (!err) {
                if (response.statusCode == 404) {
                    console.log("Thang Cookie o duoi chet cmnr")
                }
            }
        }).json(value)

    }

    public Check = () => {
        MyCache.on("expired", (key, value) => {
            console.log("Thang nay chet cmnr " + key + value)
            this.CheckCookieInClient(value)
        })
    }

    private Account = (value): Account => {
        let account = new Account();
        account.UserName = value.UserName;
        account.PassHash = value.PassHash;
        return account;
    }
    private Brower = (value): ListBrower => {
        let list = new ListBrower();
        list.NameBrower = value['Cookie'].Brower
        list.OS = value['Cookie'].OS
        list.PlatForm = value['Cookie'].PlatForm
        list.Version = value['Cookie'].Version
        return list;
    }
}


