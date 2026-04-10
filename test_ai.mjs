import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;

(async () => {
    try {
        const segmenter = await pipeline('image-segmentation', 'Xenova/clipseg-rd64-refined', {
            progress_callback: (x) => {
                 if (x.status === 'downloading') process.stdout.write('.');
            }
        });
        console.log('\nPipeline loaded.');
        const url = 'https://picsum.photos/200';
        const res = await segmenter(url, ['fish']);
        console.dir(res, { depth: null });
    } catch(e) {
        console.error("Error:", e);
    }
})();
