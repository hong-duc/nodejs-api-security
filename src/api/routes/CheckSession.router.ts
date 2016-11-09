import { Router, Response, Request, NextFunction } from 'express';
import * as session from 'express-session'
import * as  request from 'request'
import { Cookie } from '../models/Cookie.model'
import { Store } from '../app'
import { SaveCookie, SaveSession, SetDataRequest,SetCookie } from '../routes/Controller.router'



export class CheckSession {
    private router: Router;
    private Sever: string;
    constructor(sever: string) {
        this.router = Router();
        this.Sever = sever;
    }

    public GetRoute = () => {
        this.router.route('')
            .get(this.Get)
            .post()
        return this.router;
    }

    //http://localhost:4000/
    /**
     * Login to Sever
     */
    private Get = (req: Request, res: Response, next: NextFunction) => {
        console.log("GET")
        console.log(req.session.id)
        req.session.touch(err => { })
        Store.get(req.session.id, (err, sess) => {
            if (!err && !sess) {
                if (req.cookies['UserName']) {
                    return this.ReqToSever(`${this.Sever}/checkcache`, SetDataRequest(req.cookies['UserName'], null, req, res))
                        .then((result) => {
                            SaveSession(req.session.id, req.session.cookie.maxAge, req.session)

                            res.cookie("UserName", result, { maxAge: 60 * 4 * 1000 })
                            // .redirect("../")
                            next()
                            return;
                        })
                        .catch(() => res.redirect(`http://localhost:3007/login`))
                }

                return res.redirect(`http://localhost:3007/login`)
            }
            next();
            // return res.redirect("../")
        })
    }

    /**
     * Request to Server
     */
    private ReqToSever = (Server: string, value: {}) => {
        return new Promise((resolve, reject) => {
            let r = request.post(Server, (err, respone, body) => {
                if (err) {
                    console.log(err)
                    r.abort();
                    return reject(404)
                }
                if (respone.statusCode == 200) {
                    this.DestroyOldSession(body['Session'])
                    return resolve(body['UserName'])
                }
                if (respone.statusCode == 404)
                    return reject(404)
            }).json(value)
        })
    }

    private DestroyOldSession = (sid: string) => {
        //console.log(`SID: ${sid}`)
        Store.get(sid, (err, sess) => {
            console.log(sess)
        })
        Store.destroy(sid, er => { })
    }
}