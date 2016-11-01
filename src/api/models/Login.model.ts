import { ModelBase } from './model.base';

export class Login extends ModelBase{
    IdAccount:number;
    IP:string;
    TimeLogin:string;
    TimeLogout:string;
    Brower:string;
}