import * as passport from 'passport'
import { Router, Response, Request, NextFunction } from 'express';
import * as  request from 'request'
import { Cookie } from '../models/Cookie.model'
import { Store } from '../app'
import { SaveCookie, SaveSession, SetDataRequest } from '../routes/Controller.router'

export class Login {
    private router: Router;
    private Sever: string;
    constructor(sever: string) {
        this.router = Router()
        this.Sever = sever;
    }

    public GetRoute = () => {
        this.router.route('/')
            .get(this.login)
            .post(this.Send)
        return this.router;
    }

    private login(req: Request, res: Response) {
        res.render("login");
    }

    private Send = (req: Request, res: Response, next: NextFunction) => {
        console.log("POST")
        let UserName = req.body.UserName;
        let PassHash = req.body.PassHash;
        this.RequestToSever(`${this.Sever}/login`, "login", req, res, next)
    }

    private RequestToSever = (sever: string, view: string, req: Request, res: Response, next: NextFunction) => {
        let r = request.post(sever, (err, response, body) => {


            if (!err && response.statusCode == 200) {
                return SaveSession(body['Session'], body['TTL'], req.session)
                    .then((result) => {
                        return SaveCookie(body, res, next)
                    })
                    .catch(err => console.error(err))
            }
            if (!err && response.statusCode == 404) {
                return res.render(view);
            }

        }).json(SetDataRequest(req.body.UserName, req.body.PassHash, req, res))
    }
    
}