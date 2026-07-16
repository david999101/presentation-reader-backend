import fs from "fs";
import path from "path";


export function saveSlidesJson(
    slides: unknown[],
    folder: string
) {

    const filePath = path.join(
        folder,
        "slides.json"
    );


    fs.writeFileSync(
        filePath,
        JSON.stringify(
            slides,
            null,
            2
        ),
        "utf-8"
    );


    return filePath;
}