
import { Router, Response, Request } from 'express';
import * as session from 'express-session'
import * as  request from 'request'
import { AccountRepo } from '../repositories/Account.repo'
import { MyCache } from '../app'


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
    }

    private CheckLogin = (req: Request, res: Response) => {
        console.log(req.body.UserName + req.body.PassHash + req.body.Session)

        new AccountRepo().FindOne(req.body).then(resutl => {
            if (resutl) {
                console.log(req.body.TTL)
                MyCache.set(req.body.Session, req.body, req.body.TTL, (err, data) => {
                    if (!err && data)
                        res.status(200).send(req.body)
                })
            } else { res.sendStatus(404) }
        })
    }

    private CheckCookieInClient = (value) => {
        let r = request.post('http://localhost:3006/CheckSession', (err, response, body) => {
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
}


