

// đây là vùng import tất cả các modules bên ngoài
import * as express from 'express';
import * as body_parser from 'body-parser';
import * as useragent from 'express-useragent'
import * as session from 'express-session'
import * as cookieParser from 'cookie-parser'
import { config } from '../config/Session.config'
import * as NodeCache from 'node-cache'

// khai báo app chính
let app = express();

// sử dụng các middleware
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(useragent.express());
app.use(cookieParser());
app.use(config);

// import router
import { BookRouter } from './routes/book.router';
import { CheckSession } from './routes/CheckSession'
import { XXXRouter } from './routes/XXX.router'

// sử dụng các router được định nghĩa từ các modules
let a = new XXXRouter();
export let Store = new session.MemoryStore();
export const MyCache = new NodeCache({})

app.use('/api', [(new BookRouter()).getRouter()]);
app.use('/', [a.GetRouter()])
//Tạo Store khi lưu session
a.Check();
export default app;
