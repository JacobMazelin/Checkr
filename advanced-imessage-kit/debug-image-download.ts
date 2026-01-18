
import axios from "axios";
import fs from "fs";

const url = "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png";

async function testDownload() {
    try {
        console.log("Downloading...");
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
            }
        });
        console.log("Status:", response.status);
        console.log("Length:", response.data.length);
        fs.writeFileSync("test_download.jpg", response.data);
        console.log("Saved to test_download.jpg");
    } catch (e: any) {
        console.error("Error:", e.message);
        if (e.response) {
            console.error("Response Status:", e.response.status);
            console.error("Response Data:", e.response.data.toString());
        }
    }
}

testDownload();
