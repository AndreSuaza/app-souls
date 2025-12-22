export const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs text-gray-500 sm:text-sm">
          &copy; {currentYear} Souls In Xtinction. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
};
