import { convertPptxToPdf } from "./services/presentationConverter.js";


convertPptxToPdf(
    "uploads/da1c23fd-d930-41f9-a99c-c82613d5fa2b/presentation.pptx",
    "uploads/da1c23fd-d930-41f9-a99c-c82613d5fa2b"
)
.then(result => {
    console.log("PDF created:");
    console.log(result);
})
.catch(error => {
    console.error(error);
});