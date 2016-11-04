import { Router, Response, Request } from 'express';
import * as session from 'express-session'
import * as  request from 'request'
import { Cookie } from '../models/Cookie.model'
import { Store } from '../app'



export class CheckSession {
    private router: Router;
    constructor() {
        this.router = Router();
    }

    public GetRoute = () => {
        this.router.route('/')
            .get(this.Login)
            .post(this.Send)
        return this.router;
    }


    /**
     * Login to Sever
     */
    private Login = (req: Request, res: Response) => {
        console.log("GET")
        console.log(req.session.id)
        Store.get(req.session.id, (err, sess) => {
            if (!err && !sess) {
                if (req.cookies['UserName']) {
                    return this.ReqToSever("http://localhost:4000/checkcache", this.SetDataRequest(req.cookies['UserName'], null, req, res))
                        .then((result) => {
                            res.cookie("UserName", result, { maxAge: 60 * 4 * 1000 })
                                .redirect("../sign")
                            return;
                        })
                        .catch(() => res.render("login"))
                }
                return res.render("login")
            }
            return res.redirect("../sign")
        })
    }

    /**
     * Send user + pass to Sever... send post to server
     */
    private Send = (req: Request, res: Response) => {
        console.log("POST")
        let UserName = req.body.UserName;
        let PassHash = req.body.PassHash;
        this.RequestToSever('http://localhost:4000/login', "login", req, res)
    }

    /**
     *  Request to Sever :
     *  View : Layout Login
     *  Nếu Respone = 202 thì Làm típ 
     *  Nếu Respone = 200 thì Làm đăng nhập thành công
     * Nếu Respone = 404 thì KHông có trong Cache xuất ra file Login 
     */
    private RequestToSever = (sever: string, view: string, req: Request, res: Response) => {
        let r = request.post(sever, (err, response, body) => {
            if (!err && response.statusCode == 202) {
                req.session.touch;
                //this.SaveCookie(body, res)
                return res.send(200)
            }

            if (!err && response.statusCode == 200) {
                return this.SaveSession(body['Session'], body['TTL'], req.session)
                    .then((result) => {
                        return this.SaveCookie(body, res)
                    })
                    .catch(err => console.error(err))
            }
            if (!err && response.statusCode == 404) {
                return res.render(view);
            }

        }).json(this.SetDataRequest(req.body.UserName, req.body.PassHash, req, res))
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

    /**
     * SetCookie Trong Session
     */
    private SetCookie = (req: Request, res: Response) => {
        let c = new Cookie();

        c.IP = req.connection.remoteAddress;
        c.Brower = req.useragent.browser;
        c.Sever = req.protocol + '://' + req.get('host') + req.originalUrl
        c.PlatForm = req.useragent.platform;
        c.Version = req.useragent.version;
        c.OS = req.useragent.os;
        return c;
    }
    private SetDataRequest = (UserName: string, pass: string, req: Request, res: Response) => {
        let values = {
            Cookie: this.SetCookie(req, res),
            UserName: UserName,
            PassHash: pass,
            Session: req.session.id,
            TTL: req.session.cookie.maxAge,
            Server: req.protocol + '://' + req.get('host') + req.originalUrl
        };
        return values;
    }

    /**
     * Lưu session vào Store 
     * SessionID
     * TTL: time to life
     * UserName ,Brower,Sever
     */
    private SaveSession = (sid: string, TTL: number | string, sess: Express.Session) => {
        return new Promise((resolve, reject) => {

            Store.set(sid, sess, err => {
                if (err)
                    reject("Faile cmnr");
                resolve("Luu session thanh cong");
            })
        })
    }
    /**
     * , httpOnly: true thì nó sẽ disable javascript trên trình duyệt document.cookie
     */
    private SaveCookie = (Value: {}, res: Response) => {
        // maxAge: Value['TTL']
        res
            .cookie('UserName', Value['UserName'], { maxAge: 60 * 4 * 1000 })
            .redirect("../sign")
    }

    private DestroyOldSession = (sid: string) => {
        Store.all((err, obj) => {
            console.log(obj)
        })
        console.log(`SID: ${sid}`)
        Store.get(sid, (err, sess) => {
            console.log(sess)
        })
        Store.destroy(sid, er => { })
    }

}