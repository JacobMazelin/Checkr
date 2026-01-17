
import axios from 'axios';
import fs from 'fs/promises';

const imageUrl = "https://lh3.googleusercontent.com/p/AF1QipMmJxYfQhXNKHdVs9G1zSdkPIWQR1sWTyB4HTAQ=s1360-w1360-h1020";

const CleanImageUrl = "https://lh3.googleusercontent.com/p/AF1QipMmJxYfQhXNKHdVs9G1zSdkPIWQR1sWTyB4HTAQ";

async function testDownload(url: string, name: string) {
    console.log(`Testing download for ${name}: ${url}`);
    try {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://www.google.com/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Sec-Fetch-Dest': 'document',
                'Sec-Fetch-Mode': 'navigate',
                'Sec-Fetch-Site': 'cross-site',
            }
        });
        console.log(`Success! Status: ${response.status}`);
        console.log(`Size: ${response.data.length} bytes`);
    } catch (error: any) {
        console.error(`${name} failed! Status: ${error.response?.status}`);
    }
}

async function run() {
    await testDownload(imageUrl, "Original");
    await testDownload(CleanImageUrl, "Cleaned");
}

run();
