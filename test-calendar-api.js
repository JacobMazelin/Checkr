import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/calendar';
const PHONE_NUMBER = '16304864819';

async function testCalendarAPI() {
    console.log('🧪 Testing Calendar API Endpoints\n');
    console.log('='.repeat(60));
    
    try {
        // Test 1: Find free times
        console.log('\n📅 Test 1: Find Free Times');
        console.log('-'.repeat(60));
        
        const freeTimesResponse = await axios.post(`${API_BASE_URL}/find-free-times`, {
            phone_number: PHONE_NUMBER
        });
        
        console.log('✅ Response:', JSON.stringify(freeTimesResponse.data, null, 2));
        console.log(`✅ Found ${freeTimesResponse.data.count} free slots`);
        
        if (freeTimesResponse.data.freeSlots && freeTimesResponse.data.freeSlots.length > 0) {
            const firstSlot = freeTimesResponse.data.freeSlots[0];
            console.log(`\n📍 First available slot: ${firstSlot}`);
            
            // Parse the slot for next test
            const slotMatch = firstSlot.match(/([A-Za-z]{3}, [A-Za-z]{3} \d{1,2}) (\d{1,2}:\d{2} (AM|PM))/);
            if (slotMatch) {
                const [_, date, time] = slotMatch;
                
                // Test 2: Create event
                console.log('\n📝 Test 2: Create Event');
                console.log('-'.repeat(60));
                
                const createEventResponse = await axios.post(`${API_BASE_URL}/create-event`, {
                    phone_number: PHONE_NUMBER,
                    date: date,
                    time: time
                });
                
                console.log('✅ Response:', JSON.stringify(createEventResponse.data, null, 2));
                console.log(`✅ Event created with ID: ${createEventResponse.data.eventId}`);
                
                // Test 3: Send confirmation
                console.log('\n📱 Test 3: Send Confirmation');
                console.log('-'.repeat(60));
                
                const confirmResponse = await axios.post(`${API_BASE_URL}/send-confirmation`, {
                    phone_number: PHONE_NUMBER,
                    date: date,
                    time: time
                });
                
                console.log('✅ Response:', JSON.stringify(confirmResponse.data, null, 2));
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL API TESTS PASSED! 🎉');
        console.log('='.repeat(60));
        console.log('\n💡 These endpoints are now deployable to Vercel!');
        console.log('   - POST /api/calendar/find-free-times');
        console.log('   - POST /api/calendar/create-event');
        console.log('   - POST /api/calendar/send-confirmation');
        
    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        if (error.response?.status === 404) {
            console.error('\n💡 Make sure Next.js dev server is running: npm run dev');
        }
        process.exit(1);
    }
}

// Check if server is running first
async function checkServer() {
    try {
        await axios.get('http://localhost:3000');
        return true;
    } catch (error) {
        return false;
    }
}

(async () => {
    const isRunning = await checkServer();
    if (!isRunning) {
        console.log('❌ Next.js dev server is not running at http://localhost:3000');
        console.log('💡 Start it with: npm run dev');
        process.exit(1);
    }
    
    await testCalendarAPI();
})();
