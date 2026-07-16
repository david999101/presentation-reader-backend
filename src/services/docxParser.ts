import mammoth from "mammoth";


interface SlideText {
    slide: number;
    text: string;
}


export async function extractSlidesFromDocx(
    filePath: string
): Promise<SlideText[]> {

    const result = await mammoth.extractRawText({
        path: filePath,
    });

    const text = result.value;


    const sections = text.split(
        /# Slide \s*\d+/i
    );


    const slides: SlideText[] = [];


    const matches = [
        ...text.matchAll(/# Slide\s*(\d+)/gi)
    ];


    matches.forEach((match, index) => {

        const slideNumber = Number(match[1]);

        slides.push({
            slide: slideNumber,
            text: sections[index + 1]?.trim() || ""
        });
    });


    return slides;
}