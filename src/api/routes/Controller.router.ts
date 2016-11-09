import { Router, Response, Request, NextFunction } from 'express';
import * as session from 'express-session'
import * as  request from 'request'
import { Store } from '../app'
import { Cookie } from '../models/Cookie.model'

export let SetCookie = (req: Request, res: Response) => {
    let c = new Cookie();

    c.IP = req.connection.remoteAddress;
    c.Brower = req.useragent.browser;
    c.Sever = req.protocol + '://' + req.get('host')
    c.PlatForm = req.useragent.platform;
    c.Version = req.useragent.version;
    c.OS = req.useragent.os;
    return c;
}
export let SetDataRequest = (UserName: string, pass: string, req: Request, res: Response) => {
    let values = {
        Cookie: this.SetCookie(req, res),
        UserName: UserName,
        PassHash: pass,
        Session: req.session.id,
        TTL: req.session.cookie.maxAge,
        Server: req.protocol + '://' + req.get('host')
    };
    return values;
}

/**
 * Lưu session vào Store 
 * SessionID
 * TTL: time to life
 * UserName ,Brower,Sever
 */
export let SaveSession = (sid: string, TTL: number | string, sess: Express.Session) => {
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
export let SaveCookie = (Value: {}, res: Response, next: NextFunction) => {
    // maxAge: Value['TTL']
    res
        .cookie('UserName', Value['UserName'], { maxAge: 60 * 4 * 1000 })
        .redirect("../")
    next();
}