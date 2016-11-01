

// đây là vùng import tất cả các modules bên ngoài
import * as express from 'express';
import * as body_parser from 'body-parser';
import * as useragent from 'express-useragent'
import * as session from 'express-session'
import * as cookieParser from 'cookie-parser'
import { config } from '../config/Session.config'

// khai báo app chính
let app = express();

// sử dụng các middleware
app.use(body_parser.urlencoded({ extended: true }));
app.use(body_parser.json());
app.use(useragent.express());
app.use(cookieParser());
app.use(config);
app.use(express.static("public"))
app.set("view engine", "ejs")
app.set("views", "./views")

// import router
import { BookRouter } from './routes/book.router';
import { CheckSession } from './routes/CheckSession'


// sử dụng các router được định nghĩa từ các modules
app.use('/api', [(new BookRouter()).getRouter()]);
app.use('/', [new CheckSession().GetRoute()])
//Tạo Store khi lưu session
export let Store = new session.MemoryStore();
export default app;
