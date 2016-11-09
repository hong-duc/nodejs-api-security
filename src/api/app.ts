

// đây là vùng import tất cả các modules bên ngoài
import * as express from 'express';
import * as body_parser from 'body-parser';
import * as useragent from 'express-useragent'
import * as session from 'express-session'
import * as cookieParser from 'cookie-parser'
import { config } from '../config/Session.config'
import * as passport from 'passport'

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
import { CheckSession } from './routes/CheckSession.router'
import { Ticker } from './routes/Ticker.router'
import { Login } from './routes/LoginPassport.router'
// sử dụng các router được định nghĩa từ các modules
app.use('/api', [(new BookRouter()).getRouter()]);

app.use('/login',new Login(`http://localhost:4000`).GetRoute())
app.use('/tiker',new Ticker().GetRouter())

//middleware
app.use(new CheckSession(`http://localhost:4000`).GetRoute())
//Tạo Store khi lưu session
export let Store = new session.MemoryStore();
export default app;
