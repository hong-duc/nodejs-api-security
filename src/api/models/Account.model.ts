import { ModelBase } from './model.base';


export class Account extends ModelBase {
    UserName: string;
    PassHash: string;
    Email?: string;
    isActivite: boolean = true;
    CreateDate?: string | number;
    UpdateDate?: string | number ;
}

