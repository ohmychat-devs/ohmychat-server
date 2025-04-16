import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'
const { SUPABASE_DB_API_KEY : key, SUPABASE_DB_URL : url }: { [key: string]: string } = process.env;

export default createClient(url, key);