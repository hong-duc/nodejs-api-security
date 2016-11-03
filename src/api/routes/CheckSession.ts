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
        this.router.route('/CheckSession')
            .post(this.CheckSess)
        return this.router;
    }


    /**
     * Login to Sever
     */
    private Login = (req: Request, res: Response) => {
        console.log("GET")
        Store.get(req.session.id, (err, sess) => {
            if (!err && !sess) {
                if (req.cookies['UserName']) {
                    return this.ReqToSever("http://localhost:4000/checkcache", req.cookies)
                }
                return res.render("login")
            }
            return res.redirect(200, "../sign")
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
                return this.SaveCookie(body, res)
            }

            if (!err && response.statusCode == 200) {
                console.info(body)
                return this.SaveSession(req.session.cookie.maxAge, body['UserName'], req.session)
                
                    .then((result) => {
                         this.SaveCookie(body, res)
                    })
            }
            if (!err && response.statusCode == 404) {
                return res.render(view);
            }

        }).json({
            Cookie: this.SetCookie(req, res),
            UserName: req.body.UserName,
            PassHash: req.body.PassHash,
            Session: req.session.id,
            TTL: req.session.cookie.maxAge,
            Server: req.protocol + '://' + req.get('host') + req.originalUrl
        })
    }

    /**
     * Request to Server
     */
    private ReqToSever = (Server: string, value: string) => {
        let r = request.post(Server, (err, respone, body) => {
            if (err) {
                console.log(err)
                return r.abort();
            }
            if (respone.statusCode == 200) {
                return console.log(body)
            }
        }).json({ value })
    }

    /**
     * SetCookie Trong Session
     */
    private SetCookie = (req: Request, res: Response) => {
        let c = new Cookie();
        c.UserName = req.cookies['UserName'];
        c.IP = req.connection.remoteAddress;
        c.Brower = req.useragent.browser;
        c.Sever = req.protocol + '://' + req.get('host') + req.originalUrl
        c.PlatForm = req.useragent.platform;
        c.Version = req.useragent.version;
        c.OS = req.useragent.os;
        return c;
    }

    /**
     * Lưu session vào Store 
     * SessionID
     * TTL: time to life
     * UserName ,Brower,Sever
     */
    private SaveSession = (TTL: number | string, UserName: string, sess: Express.Session) => {
        return new Promise((resolve, reject) => {
            session['UserName'] = UserName;
            Store.set(UserName, sess, err => {
                if (!err) {
                    resolve("Luu session thanh cong")
                } else {
                    reject("Faile cmnr")
                }
            })
        })
    }
    /**
     * , httpOnly: true thì nó sẽ disable javascript trên trình duyệt document.cookie
     */
    private SaveCookie = (Value: {}, res: Response) => {
        res
            .cookie('UserName', Value['UserName'], { maxAge: Value['TTL'] })
            .redirect(200, "../sign")
    }

    private CheckSess = (req: Request, res: Response) => {
        console.log(req.body)
    }

}