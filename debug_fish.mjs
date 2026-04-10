import { AutoProcessor, AutoTokenizer, AutoModel, RawImage, env, Tensor } from '@xenova/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        console.log('Loading components...');
        const model_id = 'Xenova/clipseg-rd64-refined';
        const processor = await AutoProcessor.from_pretrained(model_id);
        const tokenizer = await AutoTokenizer.from_pretrained(model_id);
        const model = await AutoModel.from_pretrained(model_id);
        
        console.log('Loading image...');
        const image = await RawImage.read('./test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG');
        
        console.log('Processing inputs...');
        const image_inputs = await processor(image);
        const text_inputs = tokenizer(['fish'], { padding: true, truncation: true });

        console.log('Running model...');
        const output = await model({ ...image_inputs, ...text_inputs });
        
        console.log("Output keys:", Object.keys(output));
        const logits = output.logits;
        console.log("Logits dims:", logits.dims); // Should be [1, height, width] or [height, width]
        
        // sigmoid
        const probs = logits.sigmoid().data;
        console.log("Probs length:", probs.length);
        
        // sample 10 from probs
        const samples = [];
        let maxVal = -Infinity;
        let nonZero = 0;
        for (let i = 0; i < probs.length; i++) {
             if (i < 10) samples.push(probs[i]);
             if (probs[i] > maxVal) maxVal = probs[i];
             if (probs[i] > 0.5) nonZero++;
        }
        
        console.log("Sample probs:", samples.join(", "));
        console.log("Max val:", maxVal);
        console.log(`Pixels > 0.5: ${nonZero} out of ${probs.length}`);
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
