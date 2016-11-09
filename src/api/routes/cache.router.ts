
import { Router, Response, Request } from 'express';
import { MyCache } from '../app'
import * as  request from 'request'


let min: Array<number>
export class Cache {
    public AllCache = () => {
        min = new Array<number>()
        this.addmin()
        //  this.expired()

    }

    private addmin = () => {
        MyCache.on('set', (key, values) => {
            min.push(parseInt(values['TTL']))
            let a = this.callNTimes(() => {
                return this.RequestToClient(a)
            })
        })
    }

    private expired = () => {
        MyCache.on('expired', (key, values) => {
            console.log(`Keys Chet: ${key}`)
        })
    }
    private FindMin = () => {
        let keys = MyCache.keys();
        if (min.length != 0) {
            return Math.min(...min)
        } else {
            return 2000;
        }
    }
    /**
     * Hàm Đệ quy
     * biến n lấy Id của NodeJS.Timer
     * biến a lấy ID của request
     * Lăng nghe sự kiện nếu có Cache được xếp vào thì kích hoạt sự kiện
     * Hàm this.callNTimes sẽ được gọi 
     * Hàm this.callNTimes gọi hàm FindMin tìm giá trị bé nhất trong mảng min và thực thi hàm RequestToClient
     * RequestToClient: Nếu MyCache.keys().length != thì nó gọi hàm this.callNTimes
     * Sẽ lấy từng keys trong Cache và lấy từng data trong Cache
     * nó sẽ request xuống từ Server để kiểm tra
     * Nếu mã trả về 404 thì nó xóa trong cache và xóa vị trí đó trong min
     * Nếu mã trả về 200 thì set lại TTL
     * hàm this.callback() sẽ được gọi
     * 
     * */
    private RequestToClient = (times?: NodeJS.Timer) => {
        let n
        if (MyCache.keys().length != 0) {
            n = this.callNTimes(() => {
                MyCache.keys().forEach((element, index) => {
                    MyCache.get(element, (err, data) => {
                        if (err) return;

                        console.info(`${element}_${index}`)
                        let a = request.post(`${data['Server']}/tiker`, (err, response, body) => {
                            if (err) return;
                            if (response.statusCode == 404) {
                                console.info(`del ${element}`)
                                MyCache.del(element)
                                min.splice(index, 1)
                            }
                            if (response.statusCode == 200) {
                                console.info(`tll ${element}_${body['TTL']}`)
                                MyCache.ttl(element, body['TTL'])
                            }
                            return this.callback(a, n, times)
                        }).json({ Session: data['Session'] })
                    })
                })
            })
        } else {
            console.info(`chua co keys`)
            //return this.callback(null, n, times)
        }
    }

    /**
     * Có 3 tham số
     * a là id: request nếu min.length == 0 sẽ abort()
     * n và times là id NodeJS.Timer
     * sẽ clearTimeout của 2 loop phía trên tránh tình trạng gọi loop nhìu 
     */

    private callback(a?: request.Request, n?, times?) {
        clearTimeout(n)
        clearTimeout(times)
        if (min.length == 0) {
            if (a) {
                console.info(`stop`)
                a.abort();
            }
        } else {
            return new Cache().AllCache()
        }
    }
    private callNTimes = (fn): NodeJS.Timer => {

        function callFn() {
            fn();
            //     return setTimeout(callFn, new Cache().FindMin());
        }
        return setTimeout(callFn, new Cache().FindMin());

    }

}