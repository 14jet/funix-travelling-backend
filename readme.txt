1. Em dùng thư viện 'config' để cấu hình các biến môi trường. File config ở src/config.

2. Do tương lai sẽ có 2 ngôn ngữ Anh - Việt nên các message trả về client sẽ như thế này:
{
    message: {
        en: "hello",
        vi: "xin chào"
    }
}
Sau này muốn thêm ngôn ngữ nào, ví dụ như tiếng Ý, chỉ cần thêm vào 1 key là được.

Có thể admin không cần trả về nhiều ngôn ngữ nhưng e lười phân loại nên em làm vậy hết luôn.

3. Handle error: 
Flow handle error của e là: 
    - Lỗi xảy ra: 400, 401, 403, 500, vân vân... >> 
    - next(createError( errorObject, httpCode, clientMessage )) (A vào helpers/errorCreator.js đọc nhé)
    - error được chuyển về errorHandler.middleware.js (trong thư mục middlewares);
    - errorHandler middleware sẽ: 
        + In lỗi vào file log trong src/logs/error.log
        + Lỗi không phải 500 thì chỉ in message, method, time
        + Lỗi 500 thì sẽ in thêm stack
        

4. Em tính chia ra controller, routes thành 2 thư mục routes, admin (dù có thể sẽ có phương thức sẽ bị lặp) cho rõ ràng.

5. Em chưa làm dự án thực tế lần nào, a xem có gì không được chỉ e với nhá. :)

6. API còn khá sơ sài chưa viết nhiều. Có gì a xem lại model, controller, routes xem có gì thừa hay sao không dùm e với.