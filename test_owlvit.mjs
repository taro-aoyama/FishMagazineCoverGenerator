import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        console.log('Loading OWL-ViT detector...');
        const detector = await pipeline('zero-shot-object-detection', 'Xenova/owlvit-base-patch32');
        
        const url = './test-images/1E60C45F-7CDB-4F4F-85F5-56F5E63C7AD1.JPG';
        const candidate_labels = ['fish', 'a fish', 'human face'];
        
        console.log('Running detection...');
        const output = await detector(url, candidate_labels, { percentage: true });
        
        console.log(JSON.stringify(output, null, 2));
        
    } catch(e) {
        console.error("Error:", e);
    }
})();
