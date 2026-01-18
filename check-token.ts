import dotenv from 'dotenv'
import path from 'path'

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') })

import { supabaseServer } from './lib/supabase'

async function checkToken() {
    const phoneInt = 16304864819;
    
    console.log(`Checking OAuth token for phone: ${phoneInt}`);
    
    const { data, error } = await supabaseServer
        .from('checkrdata')
        .select('*')
        .eq('phone', phoneInt)
        .single();
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    if (!data) {
        console.log('❌ No data found for this phone number');
        return;
    }
    
    console.log('\n✅ Record found:');
    console.log('Phone:', data.phone);
    console.log('Has oauthcode:', !!data.oauthcode);
    console.log('Token length:', data.oauthcode?.length);
    console.log('Token prefix:', data.oauthcode?.substring(0, 20) + '...');
    console.log('Token type:', data.oauthcode?.startsWith('ya29.') ? 'Access Token' : 'Unknown/ID Token');
    console.log('\nDescription:', data.description || 'None');
}

checkToken().catch(console.error);
