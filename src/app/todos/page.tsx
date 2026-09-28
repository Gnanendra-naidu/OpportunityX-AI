import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, Database, CheckCircle2 } from "lucide-react";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Queries todos table (fallback gracefully if table is not yet created in Supabase)
  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <Link
          href="/"
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to OpportunityX-AI Home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Supabase SSR Server Component Demo</h1>
            <p className="text-xs text-slate-500">Live query via @supabase/ssr server client</p>
          </div>
        </div>

        {error ? (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm mb-6">
            <p className="font-semibold mb-1">Notice: "todos" table not found in your Supabase project.</p>
            <p className="text-xs text-amber-700">
              Create a table named <code className="bg-amber-100 px-1 py-0.5 rounded">todos</code> in the Supabase Table Editor with columns <code className="bg-amber-100 px-1 py-0.5 rounded">id</code> and <code className="bg-amber-100 px-1 py-0.5 rounded">name</code>, or run <code className="bg-amber-100 px-1 py-0.5 rounded">supabase/schema.sql</code> for OpportunityX tables.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 mb-6">
            {todos && todos.length > 0 ? (
              todos.map((todo: any) => (
                <li key={todo.id} className="py-3 flex items-center gap-2 text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{todo.name}</span>
                </li>
              ))
            ) : (
              <li className="py-6 text-center text-slate-400 text-sm">
                No items in 'todos' table yet. Add rows in your Supabase dashboard!
              </li>
            )}
          </ul>
        )}

        <div className="pt-6 border-t border-slate-100 text-xs text-slate-400">
          Supabase URL: <code className="text-slate-600">{process.env.NEXT_PUBLIC_SUPABASE_URL}</code>
        </div>
      </div>
    </div>
  );
}
