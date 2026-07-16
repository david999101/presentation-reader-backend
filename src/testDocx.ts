import { extractSlidesFromDocx } from "./services/docxParser.js";


extractSlidesFromDocx(
    "uploads/da1c23fd-d930-41f9-a99c-c82613d5fa2b/script.docx"
)
.then(result => {

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

})
.catch(console.error);