import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

const TEST_PHONE = 16304864819;

function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        return decoded;
    } catch (e) {
        return null;
    }
}

async function checkToken() {
    const { data } = await supabase
        .from('checkrdata')
        .select('oauthcode')
        .eq('phone', TEST_PHONE)
        .single();

    if (!data?.oauthcode) {
        console.log('⏳ Waiting for OAuth token...');
        return false;
    }

    console.log('✅ Token found!\n');
    
    const decoded = decodeJWT(data.oauthcode);
    
    if (decoded?.iss === 'https://accounts.google.com') {
        if (decoded.aud && !decoded.scope) {
            console.log('⚠️  Still an ID_TOKEN');
            return false;
        }
    }
    
    console.log('📋 Token Analysis:');
    console.log(`   Type: ${decoded?.aud && !decoded?.scope ? 'ID_TOKEN' : 'ACCESS_TOKEN'}`);
    console.log(`   Expires: ${new Date(decoded?.exp * 1000).toISOString()}`);
    console.log(`   Email: ${decoded?.email || 'N/A'}`);
    
    if (decoded?.aud && !decoded?.scope) {
        console.log('\n❌ Still wrong token type');
        return false;
    }
    
    console.log('\n✅ Correct token type!');
    return true;
}

async function monitor() {
    console.log('⏱️  Monitoring OAuth token updates...\n');
    
    for (let i = 0; i < 60; i++) {
        const success = await checkToken();
        
        if (success) {
            console.log('\n🎉 Ready to test! Run: node test-e2e.js');
            break;
        }
        
        if (i < 59) {
            console.log(`\nRetrying in 2 seconds... (${60 - i} retries left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}

monitor();
