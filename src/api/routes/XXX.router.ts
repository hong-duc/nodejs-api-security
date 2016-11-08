
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
        const key = `${req.body['UserName']}_${req.body['Server']}_${req.body['Cookie']['Brower']}`;
        // console.log(key)
        MyCache.get(key, (err, data) => {
            if (data) {
                let dataA = this.Account(data);
                let browerA = this.Brower(data);
                let dataB = this.Account(req.body)
                let browerB = this.Brower(req.body)
                if (
                    dataA.UserName == dataB.UserName
                    && browerA.NameBrower === browerB.NameBrower
                    && browerA.OS == browerB.OS
                    && browerA.PlatForm == browerB.PlatForm
                    && browerA.Version == browerB.Version
                ) {
                    MyCache.set(key, req.body, req.body['TTL'], err => {
                        if (err) {
                            console.error(err)
                            return res.sendStatus(404)
                        }
                        return console.log("Da set Cache voi Session moi")
                    });
                    return res.status(200).send({ Session: data['Session'], UserName: data['UserName'] });
                }
                return res.sendStatus(404);
            }
            return res.sendStatus(404);
        })
    }

    /**
     * Login tài khoản Nếu đúng thì nó lưu Cache với key = UserName
     */
    private CheckLogin = (req: Request, res: Response) => {
        const body = req.body;
        return new AccountRepo().FindOne(this.Account(body))
            .then((result) => {
                return this.FindCache(body, result.rows[0].idaccount);
            })
            .then(result => {
                return new AccountRepo().AddBrower(this.Brower(body), result)
            })
            .then(() => {
                return res.status(200).send(body)
            })
            .catch(() => { return res.sendStatus(404) })
    }


    private FindCache = (value:{}, id: string): Promise<any> => {

        let text = `${value['UserName']}_${value['Server']}_${value['Cookie']['Brower']}`;

        return new Promise((resolve, reject) => {
            MyCache.get(text, (err, data) => {
                if (data) {
                    console.info("Đã update value")
                    data = value
                    return resolve(id);
                } else {
                    console.log(value)
                    return MyCache.set(text, value, value['TTL'], (err) => {
                        if (err)
                            reject(err);
                        console.log("Đã thêm vào Cache")
                        return resolve(id);
                    })
                }
            })
            return reject("Error")
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


