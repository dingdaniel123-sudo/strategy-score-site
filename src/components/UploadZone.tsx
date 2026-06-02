type UploadZoneProps = {
  onUpload: (file: File) => void;
};

export default function UploadZone({ onUpload }: UploadZoneProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-5">
      <p className="mb-3 text-sm text-slate-500">上传策略 CSV（日期 + 净值）</p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
        }}
        className="block w-full text-sm"
      />
    </div>
  );
}
