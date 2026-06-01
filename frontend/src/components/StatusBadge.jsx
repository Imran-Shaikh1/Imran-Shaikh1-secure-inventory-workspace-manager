import { titleCase } from "../utils/format";

const tone = {
  available: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-200",
  assigned: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-200",
  occupied: "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950 dark:text-blue-200",
  pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20 dark:bg-yellow-950 dark:text-yellow-200",
  approved: "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950 dark:text-green-200",
  rejected: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950 dark:text-red-200",
  maintenance: "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950 dark:text-orange-200",
  retired: "bg-gray-100 text-gray-700 ring-gray-600/20 dark:bg-gray-900 dark:text-gray-200"
};

const StatusBadge = ({ value }) => (
  <span
    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
      tone[value] || tone.retired
    }`}
  >
    {titleCase(value)}
  </span>
);

export default StatusBadge;
