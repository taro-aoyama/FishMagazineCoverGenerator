import { AutoProcessor, AutoTokenizer, AutoModel, RawImage, env } from '@huggingface/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        console.log('Loading clipseg...');
        const model_id = 'Xenova/clipseg-rd64-refined';
        const processor = await AutoProcessor.from_pretrained(model_id);
        const tokenizer = await AutoTokenizer.from_pretrained(model_id);
        const model = await AutoModel.from_pretrained(model_id);
        
        const url = './test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG';
        const image = await RawImage.read(url);
        
        const image_inputs = await processor(image);
        const text_inputs = tokenizer(['fish'], { padding: true, truncation: true });

        console.log('Running model...');
        const output = await model({ ...image_inputs, ...text_inputs });
        
        const probs = output.logits.sigmoid().data;
        const width = output.logits.dims[2];
        const height = output.logits.dims[1];
        
        console.log(`Output dims: ${width}x${height}`);

        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < probs.length; i++) {
            if (probs[i] > max) max = probs[i];
            if (probs[i] < min) min = probs[i];
        }
        
        console.log(`Min: ${min}, Max: ${max}`);

        const normalizedData = new Uint8ClampedArray(probs.length);
        for (let i = 0; i < probs.length; i++) {
             if (max === min) {
                 normalizedData[i] = 0;
             } else {
                 normalizedData[i] = Math.round(((probs[i] - min) / (max - min)) * 255);
             }
        }
        
        // Canvas Processing Simulation
        let sumX = 0; let sumY = 0; let count = 0;
        const THRESHOLD = 120;
        
        for(let y=0; y<height; y++) {
            for(let x=0; x<width; x++) {
                const i = (y * width) + x;
                const maskVal = normalizedData[i];
                if (maskVal > THRESHOLD) {
                    sumX += x;
                    sumY += y;
                    count++;
                }
            }
        }
        
        console.log(`Pixels > THRESHOLD (120): ${count} out of ${probs.length}`);
        
        if (count === 0) {
            console.log("No fish found.");
        } else {
            console.log(`Fish center: ${sumX/count}, ${sumY/count}`);
        }
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
