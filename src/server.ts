import express from "express";
import cors from "cors";
import uploadRouter from "./routes/upload.js";
import { Communicate } from "edge-tts-universal";


const app = express();

// app.use(
//     cors({
//         origin: "http://localhost:5173",
//     })
// );

app.use(cors({ origin: "*" }));

app.use(express.json());

// ტექსტის გასუფთავება
function cleanTextForGeorgianTTS(text: string): string {
    return text
        .replace(/[*_#`~[\]()]/g, "") // აშორებს Markdown სიმბოლოებს და ფრჩხილებს
        .replace(/[-\u2013\u2014]/g, " ") // აშორებს ტირეებს
        .replace(/[A-Za-z]+/g, "") // ამოჭრის ინგლისურ ასოებს
        .replace(/\s+/g, " ") // აერთიანებს ზედმეტ სფეისებს
        .trim();
}

// ტექსტის დაყოფა
function splitText(text: string, maxLength = 300): string[] {
    const result: string[] = [];
    let remainingText = cleanTextForGeorgianTTS(text);

    if (!remainingText) return [];

    while (remainingText.length > maxLength) {
        let index = remainingText.lastIndexOf(".", maxLength);

        if (index === -1) {
            index = remainingText.lastIndexOf(" ", maxLength);
        }

        if (index === -1) {
            index = maxLength;
        }

        result.push(remainingText.substring(0, index + 1));
        remainingText = remainingText.substring(index + 1).trim();
    }

    if (remainingText.length) {
        result.push(remainingText);
    }

    return result;
}

app.get("/api/tts", async (req, res) => {
    const text = req.query.text as string;
    if (!text) {
        return res.status(400).send("Text query parameter is required.");
    }

    try {
        console.log(`[Edge TTS] Raw text: "${text.substring(0, 50)}..."`);
        
        const parts = splitText(text);
        
        // თუ ტექსტის გასუფთავების შემდეგ არაფერი დარჩა (მაგალითად მხოლოდ ინგლისური იყო სლაიდზე),
        // ვაბრუნებთ მცირე სიჩუმეს, რომ აპლიკაცია არ დაეკრაშოს ფრონტენდს
        if (parts.length === 0) {
            console.log("[Edge TTS] No text remaining after cleaning. Sending silence.");
            const silentBuffer = Buffer.from([
                0xff, 0xf3, 0x44, 0xc4, 0x00, 0x00, 0x00, 0x03, 0x48, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
            ]);
            res.set({
                "Content-Type": "audio/mpeg",
                "Content-Length": silentBuffer.length,
            });
            return res.send(silentBuffer);
        }

        const buffers: Buffer[] = [];
        console.log(`[Edge TTS] Split cleaned text into ${parts.length} parts.`);

        for (const part of parts) {
            if (!part.trim()) continue;

            console.log(`[Edge TTS] Fetching part: "${part}"`);
            
            const fetchPartAudio = () => new Promise<Buffer[]>(async (resolve, reject) => {
                const partBuffers: Buffer[] = [];
                const timeout = setTimeout(() => {
                    console.warn(`[Edge TTS Warning] Timeout (10s) for part: "${part}"`);
                    resolve([]); 
                }, 10000); 

                try {
                    const communicate = new Communicate(part, { voice: "ka-GE-EkaNeural" });
                    for await (const chunk of communicate.stream()) {
                        if (chunk.type === "audio" && chunk.data) {
                            partBuffers.push(chunk.data);
                        }
                    }
                    clearTimeout(timeout);
                    resolve(partBuffers);
                } catch (err) {
                    clearTimeout(timeout);
                    reject(err);
                }
            });

            try {
                const partAudio = await fetchPartAudio();
                buffers.push(...partAudio);
            } catch (partError) {
                console.error(`[Edge TTS Part Error] Failed to generate part:`, partError);
            }
        }

        let audioBuffer: Buffer;

        if (buffers.length === 0) {
            console.warn("[Edge TTS Warning] No audio chunks generated. Sending silence.");
            audioBuffer = Buffer.from([
                0xff, 0xf3, 0x44, 0xc4, 0x00, 0x00, 0x00, 0x03, 0x48, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
            ]);
        } else {
            audioBuffer = Buffer.concat(buffers);
        }

        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Length": audioBuffer.length,
            "Accept-Ranges": "bytes"
        });

        res.send(audioBuffer);
        console.log("[Edge TTS] Audio process finished successfully.");
    } catch (error: any) {
        console.error("Edge TTS General Error:", error);
        res.status(500).send(`TTS Generation failed: ${error.message}`);
    }
});

app.use("/uploads", express.static("uploads"));

app.get("/", (_, res) => {
    res.json({ message: "Presentation Reader AI Backend is running 🚀" });
});

app.use("/upload", uploadRouter);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});

