import type { ProductSpecification } from "@/types";

interface ProductSpecificationsProps {
  specifications: ProductSpecification[];
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  if (!specifications.length) return null;

  const groups = specifications.reduce<Record<string, ProductSpecification[]>>(
    (acc, spec) => {
      if (!acc[spec.spec_group]) acc[spec.spec_group] = [];
      acc[spec.spec_group].push(spec);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([group, specs]) => (
        <div key={group}>
          <h3 className="mb-2 font-semibold text-gray-800">{group}</h3>
          <table className="w-full text-sm">
            <tbody>
              {specs.map((spec) => (
                <tr key={spec.id} className="border-b border-gray-100 last:border-0">
                  <td className="w-2/5 py-2.5 pr-4 text-gray-500">{spec.spec_name}</td>
                  <td className="py-2.5 font-medium text-gray-800">{spec.spec_value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
