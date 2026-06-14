import { BrandMarquee } from "./BrandMarquee";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function BrandMarqueeServer() {
  const supabase = await getSupabaseServerClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("id, name, slug")
    .eq("is_active", true)
    .limit(15);

  if (!brands || brands.length === 0) return null;

  return <BrandMarquee brands={brands as never} />;
}
