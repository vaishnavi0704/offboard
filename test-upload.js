import { uploadGitHubData } from './lib/airtable-s3.js';

async function test() {
    try {
        const result = await uploadGitHubData(
            'recEb2reDyXwwonhP', // Your Airtable record ID
            'https://github.com/test/repo',
            'This is a test description',
            'Test-User'
        );
        
        console.log('✅ Success!');
        console.log('Link URL:', result.link.url);
        console.log('Description URL:', result.description.url);
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

test();