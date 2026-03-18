import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
let supabase = null;
export function getSupabase() {
    if (!supabase) {
        supabase = createClient(config.supabase.url, config.supabase.serviceKey);
    }
    return supabase;
}
//# sourceMappingURL=client.js.map