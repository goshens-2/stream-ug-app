import { createBrowserClient } from "@supabase/ssr";
const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://bwzbtwclfvdgezyqvswr.supabase.co";
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||"sb_publishable_fb8HkxyfjD0HGwthYXxYNA_riP2qpp1";
export function createClient(){return createBrowserClient(url,key);}
