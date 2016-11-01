import { ModelBase } from './model.base';

export class ChangePass extends ModelBase{
    IdAccount: number;
    LastPass:string;
    NewPass:string;
    TimeChange:string;
    IP:string;
    Brower:string;
}