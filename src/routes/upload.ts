import { Router } from "express";

import { upload } from "../middleware/upload.js";

import { uploadPresentation } from "../controllers/uploadController.js";

const router = Router();

router.post(
    "/",
    upload.fields([
        {
            name: "pptx",
            maxCount: 1,
        },
        {
            name: "docx",
            maxCount: 1,
        },
    ]),
    uploadPresentation
);

export default router;