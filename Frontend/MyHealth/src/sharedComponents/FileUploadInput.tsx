interface FileUploadInputProps {
    label: string;
    name: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
  }

function FileUploadInput({ label, name, onChange, error }: FileUploadInputProps)  {
    return (
        <div className="flex flex-col space-y-1">
          <label className="text-gray-700">{label}</label>
          <input
            type="file"
            name={name}
            onChange={onChange}
            className="border p-2 rounded bg-white"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      );
}

export default FileUploadInput