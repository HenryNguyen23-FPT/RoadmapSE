const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());


// --- CẤU HÌNH KẾT NỐI AIVEN ---
const dbConfig = {
    host: process.env.DB_HOST,     
    port: process.env.DB_PORT,      
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,  
    ssl: { rejectUnauthorized: false }
};

const pool = mysql.createPool(dbConfig);
app.get('/init-db', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        
        await connection.query('DROP TABLE IF EXISTS Questions');

        await connection.query(`
            CREATE TABLE Questions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                category VARCHAR(10),
                question_text TEXT NOT NULL,
                option_a VARCHAR(255),
                option_b VARCHAR(255),
                option_c VARCHAR(255),
                option_d VARCHAR(255),
                correct_answer CHAR(1),
                explanation TEXT
            )
        `);

        await connection.query('DROP TABLE IF EXISTS Questions');

        await connection.query(`
            CREATE TABLE Contacts (
                id INT IDENTITY(1,1) PRIMARY KEY,
                first_name VARCHAR(50) NOT NULL,
                last_name VARCHAR(50) NOT NULL,
                email_address VARCHAR(100) NOT NULL,
                phone_number VARCHAR(20),
                message TEXT,
                created_at DATETIME DEFAULT GETDATE()
            );
        `);

      
        const sqlInsert = `
            INSERT INTO Questions (category, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation) 
            VALUES ?`;
        
        const values = [
            // === JPD (TIẾNG NHẬT) - 20 Câu ===
            ['JPD', 'Chữ cái "あ" đọc là gì?', 'A', 'I', 'U', 'E', 'A', 'Trong bảng Hiragana, "あ" là nguyên âm đầu tiên, phát âm là "A".'],
            ['JPD', 'Nghĩa của từ "Arigatou"?', 'Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi', 'C', '"Arigatou" (ありがとう) dùng để nói lời cảm ơn thông thường.'],
            ['JPD', 'Số 1 trong tiếng Nhật là?', 'Ichi', 'Ni', 'San', 'Yon', 'A', 'Số đếm: 1-Ichi, 2-Ni, 3-San, 4-Yon/Shi.'],
            ['JPD', 'Buổi sáng chào thế nào?', 'Konbanwa', 'Konnichiwa', 'Oyasumi', 'Ohayou', 'D', 'Ohayou là chào buổi sáng. Konnichiwa là chào buổi trưa/chiều.'],
            ['JPD', 'Chữ "Sensei" nghĩa là gì?', 'Học sinh', 'Giáo viên', 'Bác sĩ', 'Nhân viên', 'B', 'Sensei (tiên sinh) thường dùng để gọi giáo viên, bác sĩ.'],
            ['JPD', 'Màu đỏ tiếng Nhật là?', 'Shiro', 'Kuro', 'Aka', 'Ao', 'C', 'Aka (赤) là màu đỏ. Shiro (trắng), Kuro (đen), Ao (xanh).'],
            ['JPD', 'Từ "Watashi" nghĩa là?', 'Bạn', 'Tôi', 'Anh ấy', 'Cô ấy', 'B', 'Watashi (私) là đại từ nhân xưng ngôi thứ nhất phổ biến nhất.'],
            ['JPD', 'Số 10 tiếng Nhật?', 'Roku', 'Nana', 'Hachi', 'Juu', 'D', 'Số 10 đọc là Juu (十).'],
            ['JPD', 'Tạm biệt là?', 'Sayounara', 'Sumimasen', 'Gomen', 'Hajimemashite', 'A', 'Sayounara là tạm biệt (lâu ngày không gặp).'],
            ['JPD', '"Mizu" nghĩa là gì?', 'Cơm', 'Nước', 'Trà', 'Bánh', 'B', 'Mizu (水) nghĩa là nước uống.'],
            ['JPD', '"Hon" nghĩa là gì?', 'Sách', 'Vở', 'Bút', 'Thước', 'A', 'Hon (本) nghĩa là sách.'],
            ['JPD', 'Khẳng định "Vâng/Có"?', 'Iie', 'Hai', 'Eeto', 'Ano', 'B', 'Hai (はい) nghĩa là Vâng/Có.'],
            ['JPD', 'Phủ định "Không"?', 'Hai', 'Sou', 'Iie', 'Ne', 'C', 'Iie (いいえ) nghĩa là Không.'],
            ['JPD', 'Con mèo tiếng Nhật?', 'Inu', 'Tori', 'Sakana', 'Neko', 'D', 'Neko (猫) là con mèo. Inu là con chó.'],
            ['JPD', 'Động từ "Ăn"?', 'Nomimasu', 'Tabemasu', 'Mimasu', 'Ikimasu', 'B', 'Tabemasu (食べます) là ăn.'],
            ['JPD', 'Hôm nay là?', 'Kyou', 'Ashita', 'Kinou', 'Asatte', 'A', 'Kyou (今日) là hôm nay.'],
            ['JPD', 'Thứ 2 tiếng Nhật?', 'Getsuyoubi', 'Kayoubi', 'Suiyoubi', 'Mokuyoubi', 'A', 'Getsuyoubi (月曜日) là thứ Hai.'],
            ['JPD', 'Trợ từ chỉ chủ ngữ?', 'Wo', 'Ni', 'Wa', 'De', 'C', 'Trợ từ Wa (は) dùng để xác định chủ ngữ.'],
            ['JPD', 'Đuôi câu hỏi trong tiếng Nhật?', 'Ne', 'Yo', 'Ka', 'Mo', 'C', 'Ka (か) đặt cuối câu để tạo thành câu hỏi.'],
            ['JPD', '"Oishii" nghĩa là?', 'Dở', 'Ngon', 'Đắt', 'Rẻ', 'B', 'Oishii (美味しい) nghĩa là ngon.'],

            // === MAS (XÁC SUẤT) - 20 Câu ===
            ['MAS', 'Xác suất tung đồng xu ngửa?', '25%', '50%', '75%', '100%', 'B', 'Đồng xu có 2 mặt, xác suất là 1/2.'],
            ['MAS', 'Median của {1, 3, 5} là?', '1', '3', '5', '9', 'B', 'Median là số ở giữa của dãy đã sắp xếp.'],
            ['MAS', 'Ký hiệu σ (Sigma) là?', 'Trung bình', 'Phương sai', 'Độ lệch chuẩn', 'Mốt', 'C', 'Sigma (σ) là độ lệch chuẩn.'],
            ['MAS', 'Tổng xác suất mọi biến cố?', '0', '0.5', '1', '100', 'C', 'Tổng xác suất không gian mẫu luôn bằng 1.'],
            ['MAS', 'Xúc xắc có mấy mặt?', '4', '6', '8', '12', 'B', 'Xúc xắc chuẩn có 6 mặt.'],
            ['MAS', 'P(A) + P(not A) = ?', '0', '0.5', '1', '2', 'C', 'Biến cố và biến cố đối luôn có tổng xác suất là 1.'],
            ['MAS', 'Mode của {2, 4, 4, 6}?', '2', '4', '6', '10', 'B', 'Mode (Mốt) là giá trị xuất hiện nhiều nhất.'],
            ['MAS', 'Mean của {2, 4} là?', '2', '3', '4', '6', 'B', 'Mean = (2+4)/2 = 3.'],
            ['MAS', 'Xác suất P(E) nằm trong?', '[-1, 1]', '[0, 1]', '[0, 100]', '(-vc, +vc)', 'B', 'Xác suất luôn nằm trong đoạn [0, 1].'],
            ['MAS', 'Công thức chỉnh hợp?', 'nCr', 'nPr', 'n!', 'n^2', 'B', 'Chỉnh hợp là nPr (Permutation).'],
            ['MAS', 'Hai biến cố độc lập P(AB)?', 'P(A)+P(B)', 'P(A)-P(B)', 'P(A).P(B)', 'P(A)/P(B)', 'C', 'Độc lập thì P(AB) = P(A) * P(B).'],
            ['MAS', 'Xác suất có điều kiện P(A|B)?', 'P(AB)/P(B)', 'P(AB)/P(A)', 'P(A)/P(B)', 'P(B)/P(A)', 'A', 'P(A|B) = P(A giao B) / P(B).'],
            ['MAS', 'Phương sai là bình phương của?', 'Mean', 'Median', 'Mode', 'Std Dev', 'D', 'Var = SD^2.'],
            ['MAS', 'Phân phối chuẩn hình gì?', 'Vuông', 'Tròn', 'Chuông', 'Tam giác', 'C', 'Bell-shaped curve (hình chuông).'],
            ['MAS', 'Trung bình chuẩn tắc?', '0', '1', '10', '100', 'A', 'Phân phối chuẩn tắc có Mean = 0.'],
            ['MAS', 'Độ lệch chuẩn chuẩn tắc?', '0', '1', '0.5', '2', 'B', 'Phân phối chuẩn tắc có SD = 1.'],
            ['MAS', 'Biến cố chắc chắn có P=?', '0', '0.5', '0.99', '1', 'D', 'Chắc chắn xảy ra thì P=1.'],
            ['MAS', 'Biến cố không thể có P=?', '0', '1', '-1', '0.1', 'A', 'Không thể xảy ra thì P=0.'],
            ['MAS', 'Tập hợp rỗng ký hiệu?', '{}', '[]', '()', '<>', 'A', '{} hoặc Ø.'],
            ['MAS', 'A giao B = rỗng là?', 'Độc lập', 'Xung khắc', 'Đối lập', 'Tương đương', 'B', 'Xung khắc (Mutually Exclusive) nghĩa là không thể cùng xảy ra.'],

            // === DBI (DATABASE) - 20 Câu ===
            ['DBI', 'Lệnh xóa toàn bộ bảng?', 'DELETE', 'DROP', 'REMOVE', 'CLEAR', 'B', 'DROP TABLE xóa cả bảng và cấu trúc.'],
            ['DBI', 'SQL viết tắt của?', 'Structured Query Language', 'Simple Query List', 'Strong Question Language', 'Standard Query Link', 'A', 'Structured Query Language.'],
            ['DBI', 'Primary Key phải?', 'Duy nhất', 'Không NULL', 'Cả A và B', 'Tùy ý', 'C', 'PK phải Unique và Not Null.'],
            ['DBI', 'Lệnh lấy dữ liệu?', 'GET', 'FETCH', 'SELECT', 'PULL', 'C', 'SELECT là lệnh truy vấn.'],
            ['DBI', 'Quan hệ 1 SV - nhiều Môn?', '1-1', '1-N', 'N-N', 'Không xác định', 'C', 'Sinh viên - Môn học là quan hệ Nhiều - Nhiều.'],
            ['DBI', 'Lệnh thêm dòng mới?', 'ADD', 'INSERT INTO', 'UPDATE', 'NEW', 'B', 'INSERT INTO table_name VALUES...'],
            ['DBI', 'Lệnh sửa dữ liệu?', 'CHANGE', 'MODIFY', 'UPDATE', 'FIX', 'C', 'UPDATE table_name SET...'],
            ['DBI', 'Loại bỏ giá trị trùng?', 'UNIQUE', 'DIFFERENT', 'DISTINCT', 'SINGLE', 'C', 'SELECT DISTINCT...'],
            ['DBI', 'Sắp xếp giảm dần?', 'ASC', 'DESC', 'DOWN', 'LOW', 'B', 'DESC (Descending).'],
            ['DBI', 'Lọc nhóm dữ liệu?', 'WHERE', 'HAVING', 'GROUP BY', 'ORDER BY', 'B', 'HAVING dùng để lọc sau khi Group.'],
            ['DBI', 'Lọc dòng dữ liệu?', 'WHERE', 'HAVING', 'FILTER', 'SELECT', 'A', 'WHERE dùng lọc dòng cơ bản.'],
            ['DBI', 'Kết nối 2 bảng dùng?', 'LINK', 'CONNECT', 'JOIN', 'COMBINE', 'C', 'JOIN (Inner, Left, Right...).'],
            ['DBI', 'Khóa ngoại tham chiếu đến?', 'Unique Key', 'Primary Key', 'Index', 'View', 'B', 'Foreign Key tham chiếu đến Primary Key của bảng khác.'],
            ['DBI', 'Lệnh tạo bảng mới?', 'MAKE TABLE', 'NEW TABLE', 'CREATE TABLE', 'ADD TABLE', 'C', 'CREATE TABLE...'],
            ['DBI', 'Hàm đếm số lượng?', 'SUM', 'COUNT', 'TOTAL', 'NUM', 'B', 'COUNT(*).'],
            ['DBI', 'Hàm tính trung bình?', 'AVG', 'MEAN', 'MEDIAN', 'AVERAGE', 'A', 'AVG().'],
            ['DBI', 'Ký tự đại diện (Wildcard)?', '*', '&', '%', '#', 'C', '% đại diện cho chuỗi bất kỳ trong LIKE.'],
            ['DBI', 'Ràng buộc không rỗng?', 'UNIQUE', 'NOT NULL', 'CHECK', 'DEFAULT', 'B', 'NOT NULL.'],
            ['DBI', 'ERD là viết tắt?', 'Entity Relation Diagram', 'Entity Row Data', 'Entry Record Data', 'Entity Relationship Diagram', 'D', 'Sơ đồ thực thể kết hợp.'],
            ['DBI', 'Chuẩn hóa để?', 'Tăng tốc', 'Giảm dư thừa', 'Tăng dung lượng', 'Dễ code', 'B', 'Normalization giúp giảm dư thừa dữ liệu (Redundancy).'],

            // === LAB (JAVA/C) - 20 Câu ===
            ['LAB', 'Vòng lặp chạy ít nhất 1 lần?', 'For', 'While', 'Do-While', 'Foreach', 'C', 'Do-While check điều kiện sau.'],
            ['LAB', 'Chỉ số mảng bắt đầu từ?', '1', '0', '-1', 'null', 'B', 'Index bắt đầu từ 0.'],
            ['LAB', 'Lệnh thoát vòng lặp?', 'Stop', 'Exit', 'Return', 'Break', 'D', 'Break thoát vòng lặp ngay lập tức.'],
            ['LAB', 'Kiểu chứa True/False?', 'Int', 'String', 'Boolean', 'Float', 'C', 'Boolean.'],
            ['LAB', 'Dấu "==" dùng để?', 'Gán', 'So sánh bằng', 'So sánh khác', 'Tăng', 'B', '== là so sánh bằng.'],
            ['LAB', 'Comment 1 dòng?', '//', '/* */', '#', '--', 'A', '// là comment 1 dòng trong C/Java.'],
            ['LAB', 'Toán tử AND logic?', '&', '&&', 'AND', '||', 'B', '&& là AND logic.'],
            ['LAB', 'Phép chia lấy dư?', '/', 'MOD', '%', 'DIV', 'C', '% là chia lấy dư.'],
            ['LAB', 'Toán tử khác nhau?', '=', '!=', '<>', '><', 'B', '!= là khác nhau.'],
            ['LAB', 'Kế thừa trong Java?', 'extends', 'implements', 'inherits', 'uses', 'A', 'class A extends B.'],
            ['LAB', 'Triển khai Interface?', 'extends', 'implements', 'interface', 'abstract', 'B', 'class A implements I.'],
            ['LAB', 'Hằng số trong Java?', 'const', 'final', 'static', 'var', 'B', 'Từ khóa final.'],
            ['LAB', 'In ra màn hình Java?', 'printf', 'cout', 'System.out.println', 'console.log', 'C', 'System.out.println().'],
            ['LAB', 'Hàm main trả về?', 'int', 'String', 'void', 'boolean', 'C', 'public static void main.'],
            ['LAB', 'Lỗi tràn mảng là?', 'NullPointer', 'IndexOutOfBounds', 'StackOverflow', 'ClassCast', 'B', 'ArrayIndexOutOfBoundsException.'],
            ['LAB', 'Lớp cha của mọi lớp?', 'Main', 'System', 'Object', 'Class', 'C', 'Object class.'],
            ['LAB', 'Access modifier kín nhất?', 'public', 'protected', 'default', 'private', 'D', 'Private chỉ nội bộ class thấy.'],
            ['LAB', 'Lấy độ dài chuỗi?', 'length', 'length()', 'size', 'size()', 'B', 'String.length().'],
            ['LAB', 'Vòng lặp biết trước số lần?', 'for', 'while', 'do-while', 'if', 'A', 'Vòng lặp for.'],
            ['LAB', 'Kiểu số nguyên lớn?', 'int', 'byte', 'long', 'short', 'C', 'Long (64 bit).'],

            // === SWEc (SOFTWARE ENGINEERING) - 20 Câu ===
            ['SWEc', 'SDLC là gì?', 'Software Design', 'System Design', 'Software Development Life Cycle', 'System Life', 'C', 'Vòng đời phát triển phần mềm.'],
            ['SWEc', 'Giai đoạn đầu SDLC?', 'Code', 'Test', 'Requirement', 'Deploy', 'C', 'Thu thập yêu cầu.'],
            ['SWEc', 'Mô hình thác nước?', 'Agile', 'Waterfall', 'Scrum', 'Spiral', 'B', 'Waterfall model.'],
            ['SWEc', 'Ai code chính?', 'Tester', 'Developer', 'BA', 'PM', 'B', 'Developer.'],
            ['SWEc', 'UML dùng để?', 'Code', 'Vẽ sơ đồ', 'Quản lý', 'Test', 'B', 'Unified Modeling Language.'],
            ['SWEc', 'Agile ưu tiên gì?', 'Công cụ', 'Quy trình', 'Phần mềm chạy được', 'Tài liệu', 'C', 'Working software over documentation.'],
            ['SWEc', 'Scrum Master là?', 'Sếp', 'Người hỗ trợ', 'Khách hàng', 'Lập trình viên', 'B', 'Servant Leader (Lãnh đạo phục vụ).'],
            ['SWEc', 'Unit Test ai làm?', 'Tester', 'Developer', 'User', 'PM', 'B', 'Dev viết Unit Test.'],
            ['SWEc', 'Test toàn hệ thống?', 'Unit Test', 'Integration Test', 'System Test', 'Acceptance Test', 'C', 'System Testing.'],
            ['SWEc', 'User Story mẫu?', 'As a... I want...', 'If... then...', 'When... then...', 'Given... when...', 'A', 'As a [role], I want [feature] so that [benefit].'],
            ['SWEc', 'Kanban tập trung?', 'Sprint', 'Trực quan hóa', 'Họp đứng', 'Tài liệu', 'B', 'Visualize work (Bảng Kanban).'],
            ['SWEc', 'Black-box testing?', 'Hộp trắng', 'Hộp đen', 'Hiệu năng', 'Bảo mật', 'B', 'Kiểm thử không nhìn code.'],
            ['SWEc', 'SRS là tài liệu?', 'Code', 'Yêu cầu', 'Test', 'Thiết kế', 'B', 'Software Requirement Specification.'],
            ['SWEc', 'Sprint kéo dài?', '1-4 tuần', '3 tháng', '6 tháng', '1 năm', 'A', 'Thường là 2-4 tuần.'],
            ['SWEc', 'Báo cáo lỗi cần?', 'Tên', 'Ảnh', 'Các bước tái hiện', 'Tất cả', 'D', 'Càng chi tiết càng tốt.'],
            ['SWEc', 'Git là công cụ?', 'Code', 'Quản lý phiên bản', 'Test', 'Deploy', 'B', 'Version Control System.'],
            ['SWEc', 'CI/CD là gì?', 'Code', 'Tích hợp/Triển khai liên tục', 'Test', 'Database', 'B', 'Continuous Integration / Continuous Deployment.'],
            ['SWEc', 'Product Backlog chứa?', 'Code', 'Task đã xong', 'Danh sách tính năng', 'Bug', 'C', 'Danh sách mọi thứ cần làm cho sản phẩm.'],
            ['SWEc', 'Burndown chart đo?', 'Tiền', 'Tiến độ', 'Lỗi', 'Nhân sự', 'B', 'Đo lượng công việc còn lại theo thời gian.'],
            ['SWEc', 'TDD là gì?', 'Test Driven Development', 'Test Design Document', 'Technical Design Data', 'Top Down Design', 'A', 'Phát triển hướng kiểm thử.']
        ];

        await connection.query(sqlInsert, [values]);

        connection.release();
        res.send(`<h1 style="color:green">✅ Đã nạp thành công 100 CÂU HỎI lên Aiven!</h1>`);
    } catch (err) {
        console.error(err);
        res.status(500).send(`<h1 style="color:red">❌ Lỗi: ${err.message}</h1>`);
    }
});

// --- API LẤY QUIZ ---
app.get('/api/quiz/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const [rows] = await pool.query(
            'SELECT * FROM Questions WHERE category = ? ORDER BY RAND() LIMIT 20', 
            [category]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Lỗi kết nối Aiven');
    }
});   


// --- API lƯU FEEDBACK ---
app.post('/feedback', async (req, res) => {
    try {
        const { name, email, phone, message} = req.body;
    
        const sql = "INSERT INTO Feedback (name, email, phone, message) VALUES (?, ?, ?, ?)";
    
        await pool.query(sql, [name, email, phone, message]);

        console.log("Đã nhận feeedback từ:", name);
        res.json({ success: true, message: "Cảm ơn bạn đã phản hồi!"})
    } catch (error) {
        console.error("Lỗi lưu feedback:", error);
        res.status(500).json({ success: false, message: "Lỗi lưu phản hồi."})
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));