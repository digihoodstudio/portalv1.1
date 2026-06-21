"use client";
import { useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle } from "lucide-react";
import Papa from "papaparse";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFile = (f: File) => {
    setFile(f);
    setDone(false);
    Papa.parse(f, {
      header: true,
      preview: 5,
      complete: (res) => setPreview(res.data as any[]),
    });
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    Papa.parse(file, {
      header: true,
      complete: async (res) => {
        const rows = res.data as any[];
        await fetch("/api/leads/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });
        setUploading(false);
        setDone(true);
      },
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-semibold text-white mb-2">Import Leads</h1>
      <p className="text-foreground/60 mb-8">
        Upload a CSV file with name, phone, email columns.
      </p>

      <div className="rounded-3xl border-2 border-dashed border-white/10 bg-glass p-10 text-center">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-gold mb-4" />
        <input
          type="file"
          accept=".csv"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          id="csv-input"
        />
        <label
          htmlFor="csv-input"
          className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-background font-bold hover:brightness-110"
        >
          <Upload size={16} />
          {file ? file.name : "Choose CSV File"}
        </label>
      </div>

      {preview.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-glass p-6">
          <p className="text-sm uppercase tracking-widest text-gold mb-3">
            Preview (first 5 rows)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {Object.keys(preview[0] || {}).map((k) => (
                    <th key={k} className="py-2 text-white/70">
                      {k}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Object.values(row).map((v: any, j) => (
                      <td key={j} className="py-2 text-white/80">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={upload}
            disabled={uploading || done}
            className="mt-4 rounded-full bg-gold px-6 py-3 text-background font-bold disabled:opacity-50"
          >
            {done ? (
              <>
                <CheckCircle className="inline mr-2" size={16} />
                Uploaded!
              </>
            ) : uploading ? (
              "Uploading..."
            ) : (
              "Confirm Upload"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
