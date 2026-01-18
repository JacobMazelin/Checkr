require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkToken() {
  try {
    const { data, error } = await supabase
      .from('checkrdata')
      .select('*')
      .eq('phone', 16304864819)
      .single();
    
    if (error) {
      console.log('❌ Error:', error);
      return;
    }
    
    if (!data) {
      console.log('❌ No data found');
      return;
    }
    
    console.log('\n✅ Token found for 16304864819:');
    console.log('Phone:', data.phone);
    console.log('Has token:', !!data.oauthcode);
    console.log('Token length:', data.oauthcode?.length);
    console.log('Token prefix:', data.oauthcode?.substring(0, 30) + '...');
    console.log('Is Access Token (starts with ya29):', data.oauthcode?.startsWith('ya29.'));
    
    // Try to make a Google Calendar API call with this token
    const axios = require('axios');
    try {
      console.log('\n🔍 Testing token with Google Calendar API...');
      const response = await axios.get(
        'https://www.googleapis.com/calendar/v3/calendars/primary',
        {
          headers: {
            Authorization: `Bearer ${data.oauthcode}`
          }
        }
      );
      console.log('✅ Token is VALID! Calendar ID:', response.data.id);
    } catch (apiError) {
      console.log('❌ Token is INVALID or EXPIRED');
      console.log('Error:', apiError.response?.data?.error?.message || apiError.message);
      console.log('\n🔄 User needs to re-authenticate at:');
      console.log('http://localhost:3000?num=16304864819');
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

checkToken();
