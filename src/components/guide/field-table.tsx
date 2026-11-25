type Field = {
  /** The label exactly as the form shows it. */
  name: string;
  required?: boolean;
  /** What it is for, in one or two sentences. */
  description: string;
  example?: string;
};

/** The fields of a form: label, whether it is required, what it does, an example. */
export function FieldTable({ fields }: { fields: Field[] }) {
  return (
    <div className="not-prose border-fd-border my-6 overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="bg-fd-muted text-fd-muted-foreground">
          <tr>
            <th className="w-48 px-3 py-2 font-semibold">Trường</th>
            <th className="w-24 px-3 py-2 font-semibold">Bắt buộc</th>
            <th className="px-3 py-2 font-semibold">Ý nghĩa</th>
            <th className="w-52 px-3 py-2 font-semibold">Ví dụ</th>
          </tr>
        </thead>
        <tbody className="divide-fd-border divide-y">
          {fields.map((field) => (
            <tr key={field.name}>
              <td className="px-3 py-2 align-top font-medium">{field.name}</td>
              <td className="px-3 py-2 align-top">{field.required ? "Có" : "Không"}</td>
              <td className="text-fd-muted-foreground px-3 py-2 align-top">{field.description}</td>
              <td className="text-fd-muted-foreground px-3 py-2 align-top">{field.example ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
