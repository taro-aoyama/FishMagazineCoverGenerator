import { pipeline, env, RawImage } from '@huggingface/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        console.log('Loading RMBG-1.4...');
        const segmenter = await pipeline('image-segmentation', 'briaai/RMBG-1.4');
        
        console.log('Loading OWL-ViT...');
        const detector = await pipeline('zero-shot-object-detection', 'Xenova/owlvit-base-patch32');

        const url = './test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG';
        const image = await RawImage.read(url);
        
        console.log('Running RMBG-1.4...');
        const bgResult = await segmenter(image);
        
        const mask = Array.isArray(bgResult) ? bgResult[0].mask : (bgResult.mask || bgResult);
        console.log("RMBG mask dims:", mask.width || mask.dims?.[2], 'x', mask.height || mask.dims?.[1]);
        
        console.log('Running OWL-ViT...');
        const boxes = await detector(image, ['a fish'], { percentage: true, topk: 1 });
        console.log("OWL-ViT box:", JSON.stringify(boxes, null, 2));
        
        const box = Array.isArray(boxes[0]) ? boxes[0][0].box : boxes[0].box;
        
        // Now calculate intersection of mask and box!
        let fishPixels = 0;
        let otherForegroundPixels = 0;
        
        const maskW = mask.width;
        const maskH = mask.height;
        
        for (let y = 0; y < maskH; y++) {
            for (let x = 0; x < maskW; x++) {
                const isForeground = mask.data[y * maskW + x] > 120;
                
                const percentX = x / maskW;
                const percentY = y / maskH;
                const inBox = percentX >= box.xmin && percentX <= box.xmax &&
                              percentY >= box.ymin && percentY <= box.ymax;
                
                if (isForeground) {
                    if (inBox) fishPixels++;
                    else otherForegroundPixels++;
                }
            }
        }
        
        console.log(`Fish pixels inside box: ${fishPixels}`);
        console.log(`Foreground pixels outside box: ${otherForegroundPixels}`);
        console.log(`Ratio of fish to person: ${(fishPixels / (fishPixels + otherForegroundPixels) * 100).toFixed(1)}%`);
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
