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
        console.log(req.cookies)
        this.RequestToSever('http://localhost:4000/checkcache', "login", req, res, req.cookies['Session'])
    }

    /**
     * Send user + pass to Sever
     */
    private Send = (req: Request, res: Response) => {
        let UserName = req.body.UserName;
        let PassHash = req.body.PassHash;
        this.RequestToSever('http://localhost:4000/login', "login", req, res, req.session.id)
    }

    /**
     *  Request to Sever :
     *  View : Layout Login
     *  Nếu Respone = 202 thì Làm típ 
     *  Nếu Respone = 200 thì Làm đăng nhập thành công
     * Nếu Respone = 404 thì KHông có trong Cache xuất ra file Login 
     */
    private RequestToSever = (sever: string, view: string, req: Request, res: Response, sid: string) => {
    
        let r = request.post(sever, (err, response, body) => {
            if (!err && response.statusCode == 202)
                res.sendStatus(200)
            if (!err && response.statusCode == 200) {
                // console.log(body)

                this.SaveSession(req.session.id,
                    req.session.cookie.maxAge,
                    body['UserName'],
                    body['Brower'],
                    body['Sever'],
                    req
                ).then((result) => {
                    this.SaveCookie(body, res)
                    
                })
            }
            if (!err && response.statusCode == 404) {
                res.render(view);
            }

            r.abort();
        }).json({
            Cookie: this.SetCookie(req, res),
            UserName: req.body.UserName,
            PassHash: req.body.PassHash,
            Session: sid,
            TTL: req.session.cookie.maxAge
        })
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
        return c;
    }

    /**
     * Lưu session vào Store 
     * SessionID
     * TTL: time to life
     * UserName ,Brower,Sever
     */
    private SaveSession = (SessionID: string, TTL: number | string, UserName: string, Brower: string, Sever: string, req: Request) => {
        return new Promise((resolve, reject) => {
            session['UserName'] = UserName;
            session['Brower'] = Brower;
            session['Sever'] = Sever;
            Store.set(SessionID, req.session, err => {
                if (!err) {
                    resolve("Luu session thanh cong")
                } else {
                    reject("Faile cmnr")
                }
            })
        })
    }

    private SaveCookie = (Value: {}, res: Response) => {
        res
            .cookie('Session', Value['Session'], { maxAge: Value['TTL'] })
            .cookie('UserName', Value['UserName'], { maxAge: Value['TTL'] })
            .sendStatus(200)
    }
}