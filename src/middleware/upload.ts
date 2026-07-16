// import multer from "multer";
// import fs from "fs";

// const tempDir = "uploads/temp";

// if (!fs.existsSync(tempDir)) {
//     fs.mkdirSync(tempDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination(req, file, cb) {
//         cb(null, tempDir);
//     },

//     filename(req, file, cb) {
//         cb(null, Date.now() + "-" + file.originalname);
//     },
// });

// export const upload = multer({
//     storage,
// });

import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // process.cwd() აბრუნებს პროექტის მთავარ დირექტორიას Render-ზე
        const uploadPath = path.join(process.cwd(), "uploads");
        
        // თუ საქაღალდე არ არსებობს, იქმნება ფაილის ჩაწერის მომენტში
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({ storage });