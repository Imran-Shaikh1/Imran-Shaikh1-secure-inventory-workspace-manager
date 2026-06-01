const PageHeader = ({ title, description, action }) => (
  <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    {action}
  </div>
);

export default PageHeader;
