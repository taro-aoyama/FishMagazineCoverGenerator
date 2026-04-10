import { AutoProcessor, AutoModel, RawImage, env } from '@xenova/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        console.log('Loading SAM...');
        const model_id = 'Xenova/slimsam-77-uniform';
        const processor = await AutoProcessor.from_pretrained(model_id);
        const model = await AutoModel.from_pretrained(model_id);
        
        const url = './test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG';
        const image = await RawImage.read(url);
        
        // input_boxes expects an array of bounding boxes [xmin, ymin, xmax, ymax]
        // Coordinates must be in absolute pixels or format supported.
        // OWL-ViT gave percentage. Let's convert to absolute pixels:
        // xmin: 0.297, ymin: 0.071, xmax: 0.515, ymax: 0.732
        const box = [
             0.297 * image.width,
             0.071 * image.height,
             0.515 * image.width,
             0.732 * image.height
        ];
        
        console.log('Box (absolute):', box);
        
        const inputs = await processor(image, { input_boxes: [[box]] });
        
        console.log('Running model...');
        const output = await model(inputs);
        
        console.log('Output properties:', Object.keys(output));
        
        if (output.pred_masks) {
            const masks = output.pred_masks; // usually [1, 1, 3, H, W] for SAM
            console.log('Masks dims:', masks.dims);
        }
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
