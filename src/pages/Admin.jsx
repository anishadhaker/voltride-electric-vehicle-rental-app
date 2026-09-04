function Admin() {
  return <main className="mx-auto max-w-6xl px-6 pb-24 pt-36 lg:px-8"><p className="font-semibold text-lime-600">OPERATIONS</p><h1 className="mt-2 text-5xl font-bold tracking-tight">Admin dashboard</h1><div className="mt-10 grid gap-4 sm:grid-cols-3">{[["24", "Active vehicles"], ["18", "Today's rides"], ["96%", "Fleet uptime"]].map(([value, label]) => <div key={label} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100"><p className="text-4xl font-bold">{value}</p><p className="mt-2 text-sm text-gray-500">{label}</p></div>)}</div></main>;
}

export default Admin;
