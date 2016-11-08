
import { Router, Response, Request } from 'express';
import { MyCache } from '../app'
import * as  request from 'request'


let min = new Array<number>()
export class Cache {
    public AllCache = () => {
        this.callNTimes(() => {
            return this.RequestToClient()
        })
    }


    private FindMin = () => {
        min = new Array<number>()
        let keys = MyCache.keys();
        if (keys.length != 0) {
            keys.forEach(element => {
                MyCache.get(element, (err, data) => {
                    min.push(parseInt(data['TTL']))
                })
            })

        } else {
            return 2000;
        }
        return Math.min(...min)
    }
    /**
     * Hàm Đệ quy
     * Khi New Cache().AllCache() được gọi sẽ tạo 
     * Delay mỗi 2s nó sẽ check có nhiu keys add vô Mảng min và trả về giá trị nhỏ nhất
     * Hàm RequestToClient hoạt động ...
     * Khi chạy tới hàm callNTimes nó sẽ đếm setTimeout thời gian nó còn lại nó sẽ gọi về client
     * Khi được trả về statusCode = 404 nó sẽ xóa phần tử trong mảng min và xóa trong MyCache
     * Típ đến nó sẽ check xem mảng min == 0 thì nó tao mới lại 
     * */
    private RequestToClient = (times?) => {
        if (MyCache.keys().length != 0) {
            MyCache.keys().forEach((element, index) => {
                MyCache.get(element, (err, data) => {
                    if (err) return;
                    console.info(`${data['Server']}/tiker`)
                    this.callNTimes(() => {
                        console.info(`${new Cache().FindMin()}`)
                        let a = request.post(`${data['Server']}/tiker`, (err, response, body) => {
                            if (err) return;

                            if (response.statusCode == 404) {
                                console.info(`del ${element}`)
                                MyCache.del(element)
                                min.splice(index, 1)
                            }
                            if (min.length == 0) {
                                a.abort();
                                return new Cache().AllCache();
                            }
                            if (response.statusCode == 200) {
                                console.info(`tll ${element}`)
                                MyCache.ttl(element, body['TTL'])
                                return;
                            }
                        }).json({ Session: data['Session'] })
                    })
                })
            })
            return;
        } else {
            console.info(`chua co keys`)
        }
        return;
    }

    private callNTimes = (fn) => {
        function callFn() {
            fn();
            setTimeout(callFn, new Cache().FindMin());
        }
        setTimeout(callFn, new Cache().FindMin());
        return;
    }
}