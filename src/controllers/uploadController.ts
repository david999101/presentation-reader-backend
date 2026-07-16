import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

import { convertPptxToPdf } from "../services/presentationConverter.js";
import { extractSlidesFromDocx } from "../services/docxParser.js";
import { saveSlidesJson } from "../services/saveSlides.js";

export const uploadPresentation = async (req: Request, res: Response) => {
    try {
        const files = req.files as {
            pptx?: Express.Multer.File[];
            docx?: Express.Multer.File[];
        };

        if (!files?.pptx?.length || !files?.docx?.length) {
            return res.status(400).json({
                message: "Both PPTX and DOCX files are required.",
            });
        }

        const id = crypto.randomUUID();
        const folder = path.join("uploads", id);

        // ვქმნით უნიკალურ ფოლდერს
        fs.mkdirSync(folder, { recursive: true });

        const pptx = files.pptx[0];
        const docx = files.docx[0];

        const pptxPath = path.join(folder, "presentation.pptx");
        const docxPath = path.join(folder, "script.docx");

        // უსაფრთხო გადატანა cross-device პრობლემის თავიდან ასაცილებლად
        fs.copyFileSync(pptx.path, pptxPath);
        fs.unlinkSync(pptx.path);

        fs.copyFileSync(docx.path, docxPath);
        fs.unlinkSync(docx.path);

        console.log("Files saved successfully");

        // PPTX -> PDF კონვერტაცია
        await convertPptxToPdf(pptxPath, folder);
        console.log("PDF created");

        // DOCX პარსინგი
        const slides = await extractSlidesFromDocx(docxPath);
        console.log("DOCX parsed");

        // ინახავს slides.json-ს
        saveSlidesJson(slides, folder);
        console.log("slides.json created");

        // ვაბრუნებთ ფრონტენდისთვის ხელმისაწვდომ URL-ებს
        return res.json({
            message: "Presentation processed successfully.",
            id,
            files: {
                pdf: `/uploads/${id}/presentation.pdf`,
                slides: `/uploads/${id}/slides.json`
            },
            totalSlides: slides.length
        });

    } catch (error) {
        console.error("Processing error:", error);
        return res.status(500).json({
            message: "Presentation processing failed.",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};