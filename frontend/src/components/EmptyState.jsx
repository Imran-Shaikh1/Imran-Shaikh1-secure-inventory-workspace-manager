const EmptyState = ({ title, description }) => (
  <div className="panel flex min-h-48 flex-col items-center justify-center p-6 text-center">
    <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
    <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">{description}</p>
  </div>
);

export default EmptyState;
