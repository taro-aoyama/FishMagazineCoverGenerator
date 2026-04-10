import { pipeline, env, RawImage } from '@huggingface/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        console.log('Loading ModNet...');
        const segmenter = await pipeline('image-segmentation', 'Xenova/modnet');
        
        const url = './test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG';
        const image = await RawImage.read(url);
        
        console.log('Running ModNet...');
        const result = await segmenter(image);
        
        console.log("Modnet result:", Array.isArray(result) ? 'array' : typeof result, result?.label);
        
        const mask = Array.isArray(result) ? result[0].mask : (result.mask || result);
        console.log("Mask dims:", mask?.width, mask?.height);
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
