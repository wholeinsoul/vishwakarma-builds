import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import EmailCapture from "@/components/EmailCapture";
import { supabase } from "@/lib/supabase";
import type { County } from "@/types";

export const revalidate = 3600;

async function getCounties(): Promise<County[]> {
  const { data } = await supabase
    .from("counties")
    .select("*")
    .eq("is_active", true)
    .order("name");
  return (data as County[]) || [];
}

export default async function HomePage() {
  const counties = await getCounties();

  return (
    <>
      <section className="relative py-20 md:py-32">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 text-balance">
            Find Trusted Septic Services{" "}
            <span className="text-orange-500">Near You</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
            Compare local septic pumping, repair, and installation providers.
            Read real reviews from homeowners in your county.
          </p>
          <div className="flex justify-center mb-8">
            <SearchBar />
          </div>
          <p className="text-sm text-zinc-500">
            Currently serving {counties.length} counties across the US
          </p>
        </div>
      </section>

      {counties.length > 0 && (
        <section className="py-16 bg-zinc-900/50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              Browse by County
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {counties.map((county) => (
                <Link
                  key={county.id}
                  href={`/county/${county.slug}`}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 hover:border-orange-500/50 transition-colors group"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-orange-500 transition-colors">
                    {county.name}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {county.state_full}
                  </p>
                  {county.population && (
                    <p className="text-xs text-zinc-500 mt-2">
                      Pop. {county.population.toLocaleString()}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Search by County
              </h3>
              <p className="text-sm text-zinc-400">
                Find septic providers serving your area with our county-based
                directory.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Read Real Reviews
              </h3>
              <p className="text-sm text-zinc-400">
                Honest reviews from homeowners who have used the service. No
                fakes, no filters.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Call Directly
              </h3>
              <p className="text-sm text-zinc-400">
                No middleman. Get provider phone numbers and call them directly
                to schedule service.
              </p>
            </div>
          </div>

          <div className="max-w-lg mx-auto">
            <EmailCapture source="homepage" />
          </div>
        </div>
      </section>
    </>
  );
}
