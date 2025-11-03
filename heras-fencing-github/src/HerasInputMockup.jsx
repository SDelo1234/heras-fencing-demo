import React, { useMemo, useState } from "react";

export default function HerasInputMockup() {
  // ---------------- State ----------------
  const [form, setForm] = useState({
    projectName: "",
    postcode: "",
    duration: "< 28 days",
    ground: "Hardstanding (concrete/asphalt)",
    height: "2.0 m",
    distanceToSea: "",
    altitude: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [wind, setWind] = useState<{ speed_ms: number; pressure_kpa: number } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  // ---------------- Helpers ----------------
  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.projectName.trim()) e.projectName = "Project name is required.";
    if (!/^\s*[A-Za-z]{1,2}\d[A-Za-z\d]?\s*\d[A-Za-z]{2}\s*$/i.test(form.postcode.trim())) {
      e.postcode = "Enter a valid UK postcode (e.g., SW4 6QD).";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Provided example images (note: ibb.co pages may not be direct images)
  const IMG1 = "https://i.ibb.co/LzMWRbqj/IMG1-fence-1.jpg";
  const IMG2 = "https://i.ibb.co/Kc61kkHd/IMG2-fence-2.jpg";
  const IMG3 = "https://i.ibb.co/VYkkBwWW/IMG3-fence-3.jpg";
  const IMG4 = "https://i.ibb.co/pBCs5YHd/IMG4-fence-4.jpg";

  // Catalogue of six options and capacities
  const options = useMemo(
    () => [
      { id: "A", name: "2.0 m panels @ 3.5 m centres",       capacity_kpa: 0.100, maxHeight_m: 2.0, img: IMG3 },
      { id: "B", name: "2.0 m panels + rear brace/ballast",  capacity_kpa: 0.200, maxHeight_m: 2.0, img: IMG2 },
      { id: "C", name: "2.4 m hoarding with buttress @ 2.4 m", capacity_kpa: 0.300, maxHeight_m: 2.4, img: IMG1 },
      { id: "D", name: "2.4 m mesh with rear braces @ 2.4 m", capacity_kpa: 0.300, maxHeight_m: 2.4, img: IMG2 },
      { id: "E", name: "2.4 m hoarding + heavy ballast",     capacity_kpa: 0.400, maxHeight_m: 2.4, img: IMG1 },
      { id: "F", name: "3.0 m hoarding with twin buttress",  capacity_kpa: 0.500, maxHeight_m: 3.0, img: IMG4 },
    ],
    [IMG1, IMG2, IMG3, IMG4]
  );

  const requiredHeight_m = useMemo(() => parseFloat(form.height), [form.height]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Mock wind results (deterministic example based on postcode)
    const base = 22; // m/s
    const codeSum = (form.postcode || "").toUpperCase().replace(/\s+/g, "").split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const speed = Math.round(base + (codeSum % 11)); // 0 dp
    const pressure = Number((0.0005 * speed * speed).toFixed(3)); // 3 dp

    const cappedPressure = Math.min(pressure, 0.149);
    const adjustedSpeed = Math.round(Math.sqrt(cappedPressure / 0.0005));
    setWind({ speed_ms: adjustedSpeed, pressure_kpa: cappedPressure });
    setSubmitted(true);
    setSelected([]);
  };

  const optionDisabled = (o: { capacity_kpa: number; maxHeight_m: number }) => {
    if (!wind) return true;
    const heightTooShort = requiredHeight_m > o.maxHeight_m;
    const overCapacity = wind.pressure_kpa > o.capacity_kpa;
    return heightTooShort || overCapacity;
  };

  const toggleSelect = (id: string, disabled: boolean) => {
    if (disabled) return;
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen w-full bg-gray-50 p-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Site‑Specific Heras Fencing – Quick Setup</h1>
          <p className="text-sm text-gray-600">Enter basic details to generate site‑specific designs and a calculation pack.</p>
        </header>

        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Project details */}
          <section className="lg:col-span-3 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-medium">Project details</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Project name</label>
                <input
                  className={`w-full rounded-xl border p-2.5 focus:outline-none focus:ring ${errors.projectName ? "border-red-500" : "border-gray-300"}`}
                  placeholder="e.g., Longreach STW – Perimeter"
                  value={form.projectName}
                  onChange={(e) => update("projectName", e.target.value)}
                />
                {errors.projectName && <p className="mt-1 text-xs text-red-600">{errors.projectName}</p>}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Project postcode</label>
                <input
                  className={`w-full rounded-xl border p-2.5 uppercase focus:outline-none focus:ring ${errors.postcode ? "border-red-500" : "border-gray-300"}`}
                  placeholder="SW4 6QD"
                  value={form.postcode}
                  onChange={(e) => update("postcode", e.target.value.toUpperCase())}
                />
                {errors.postcode && <p className="mt-1 text-xs text-red-600">{errors.postcode}</p>}
                <p className="mt-1 text-xs text-gray-500">Used to derive site wind data.</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Expected duration on site</label>
                <select
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring"
                  value={form.duration}
                  onChange={(e) => update("duration", e.target.value)}
                >
                  <option>&amp;lt; 28 days</option>
                  <option>1–3 months</option>
                  <option>3–6 months</option>
                  <option>&amp;gt; 6 months</option>
                </select>
              </div>
            </div>
          </section>

          {/* Site conditions */}
          <section className="lg:col-span-3 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-medium">Site conditions</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Ground conditions</label>
                <select
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring"
                  value={form.ground}
                  onChange={(e) => update("ground", e.target.value)}
                >
                  <option>Hardstanding (concrete/asphalt)</option>
                  <option>Firm granular (Type 1/compacted)</option>
                  <option>Soft/grass/soil</option>
                  <option>Unknown – assume worst case</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Distance to sea</label>
                <input
                  className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring"
                  placeholder="km"
                  value={form.distanceToSea}
                  onChange={(e) => update("distanceToSea", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Altitude</label>
                <input
                  className="w-full rounded-xl border p-2.5 focus:outline-none focus:ring"
                  placeholder="m AOD"
                  value={form.altitude}
                  onChange={(e) => update("altitude", e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Fence height</label>
                <select
                  className="w-full rounded-xl border border-gray-300 p-2.5 focus:outline-none focus:ring"
                  value={form.height}
                  onChange={(e) => update("height", e.target.value)}
                >
                  <option>2.0 m</option>
                  <option>2.4 m</option>
                  <option>3.0 m</option>
                </select>
              </div>
            </div>
          </section>

          {/* Actions */}
          <div className="lg:col-span-3 flex flex-col items-start gap-3">
            <button
              type="submit"
              className="rounded-2xl bg-black px-5 py-3 text-white shadow-sm hover:opacity-90"
            >
              Generate design options
            </button>
            <p className="text-xs text-gray-500">Displays calculated wind and filters options by pressure and height.</p>
          </div>
        </form>

        {/* Results */}
        {submitted && wind && (
          <section className="mt-8 space-y-6">
            {/* Wind results */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-lg font-medium">Wind results (example)</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Calculated wind speed</div>
                  <div className="text-2xl font-semibold">{wind.speed_ms.toFixed(0)} m/s</div>
                </div>
                <div className="rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500">Calculated wind pressure</div>
                  <div className="text-2xl font-semibold">{wind.pressure_kpa.toFixed(3)} kPa</div>
                </div>
              </div>
            </div>

            {/* Options grid */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-lg font-medium">Fencing options</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {options.map((o) => {
                  const disabled = optionDisabled(o);
                  const isSel = selected.includes(o.id);
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => toggleSelect(o.id, disabled)}
                      className={`group relative overflow-hidden rounded-2xl border p-3 text-left shadow-sm transition ${
                        disabled ? "cursor-not-allowed opacity-50 grayscale" : isSel ? "ring-2 ring-black" : "hover:shadow"
                      }`}
                    >
                      <img src={o.img} alt={o.name} className="mb-3 h-36 w-full rounded-xl object-cover" />
                      <div className="text-sm font-medium">{o.name}</div>
                      <div className="mt-1 text-xs text-gray-600">Capacity: {o.capacity_kpa.toFixed(3)} kPa · Max height: {o.maxHeight_m.toFixed(1)} m</div>
                      {disabled && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-xs font-medium text-gray-700">Not applicable</div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Download zone */}
              <div className="mt-5 flex flex-col items-start gap-3">
                <div className="text-sm">Download {selected.length} selected Heras fence option{selected.length === 1 ? "" : "s"}</div>
                <button
                  disabled={selected.length === 0}
                  className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${selected.length === 0 ? "cursor-not-allowed bg-gray-300 text-gray-600" : "bg-black text-white"}`}
                >
                  Download selected
                </button>
                <p className="text-xs text-gray-500">Mock only – would download drawings and calcs with title blocks populated.</p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
