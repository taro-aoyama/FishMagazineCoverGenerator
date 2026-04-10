import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        console.log('Loading Segformer...');
        const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512');
        
        const url = './test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG';
        console.log('Running segmentation...');
        // Segformer returns masks for all classes it finds
        const results = await segmenter(url);
        
        for (const res of results) {
            let nonZero = 0;
            if (res.mask && res.mask.data) {
                 for(let i=0; i<res.mask.data.length; i++) {
                     if (res.mask.data[i] > 0) nonZero++;
                 }
            }
            console.log(`Label: ${res.label}, Score: ${res.score}, Pixels: ${nonZero}`);
        }
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
