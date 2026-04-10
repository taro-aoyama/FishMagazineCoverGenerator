import { AutoProcessor, AutoTokenizer, AutoModel, RawImage, env } from '@xenova/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        const model_id = 'Xenova/clipseg-rd64-refined';
        const processor = await AutoProcessor.from_pretrained(model_id);
        const tokenizer = await AutoTokenizer.from_pretrained(model_id);
        const model = await AutoModel.from_pretrained(model_id);
        
        const image = await RawImage.read('./test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG');
        const image_inputs = await processor(image);
        
        const prompts = ['a fish', 'a person', 'water', 'sky', 'background', 'hands'];
        const text_inputs = tokenizer(prompts, { padding: true, truncation: true });

        const output = await model({ ...image_inputs, ...text_inputs });
        const probs = output.logits.sigmoid(); // [num_prompts, height, width]
        
        const height = output.logits.dims[1];
        const width = output.logits.dims[2];
        const pixelsPerPrompt = height * width;

        let fishCount = 0;
        let personCount = 0;
        let backgroundCount = 0;

        for (let i = 0; i < pixelsPerPrompt; i++) {
             let bestPrompt = -1;
             let bestScore = -Infinity;
             
             for (let p = 0; p < prompts.length; p++) {
                 const v = probs.data[p * pixelsPerPrompt + i];
                 if (v > bestScore) {
                     bestScore = v;
                     bestPrompt = p;
                 }
             }
             
             if (bestPrompt === 0) fishCount++;
             if (bestPrompt === 1) personCount++;
             if (bestPrompt >= 2) backgroundCount++;
        }
        
        console.log(`Total pixels: ${pixelsPerPrompt}`);
        console.log(`Assigned to "a fish": ${fishCount}`);
        console.log(`Assigned to "a person": ${personCount}`);
        console.log(`Assigned to "background": ${backgroundCount}`);
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
