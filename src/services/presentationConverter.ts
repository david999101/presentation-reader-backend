import { execa } from "execa";
import path from "path";

import { LIBREOFFICE_PATH } from "../config/libreoffice.js";


export async function convertPptxToPdf(
    pptxPath: string,
    outputDir: string
) {
    await execa(
        LIBREOFFICE_PATH,
        [
            "--headless",
            "--convert-to",
            "pdf",
            "--outdir",
            outputDir,
            pptxPath,
        ]
    );

    const pdfName =
        path.basename(pptxPath, path.extname(pptxPath)) + ".pdf";

    return path.join(outputDir, pdfName);
}