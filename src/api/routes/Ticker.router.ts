import { Router, Response, Request, NextFunction } from 'express';
import * as session from 'express-session'
import * as  request from 'request'
import { Cookie } from '../models/Cookie.model'
import { Store } from '../app'

export class Ticker {
    private router: Router;
    constructor() {
        this.router = Router();
    }

    public GetRouter() {
        this.router.route('/')
            .get()
            .post(this.Check)
        return this.router;
    }

    private Check(req: Request, res: Response) {
        let Session = req.body['Session']
        Store.get(Session, (err, session) => {
            if (err) {
                console.error(err)
                return;
            }
            if (!session){
                console.info(`Khong co session`)
                return res.sendStatus(404)
            }
            else{
                console.info(`Co Session ${req.session.cookie.maxAge}`)
                return res.status(200).send({TTL:req.session.cookie.maxAge})
            }
        })
        return console.info(req.body);
    }
}