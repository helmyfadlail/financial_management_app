import { useTranslations } from "next-intl";
import Link from "next/link";

export default function NotFound() {
  const t = useTranslations("notFoundPage");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center">
      <h1 className="text-6xl font-bold text-slate-800">404</h1>
      <h2 className="text-xl font-medium text-slate-600">{t("title")}</h2>
      <p className="text-slate-500">{t("description")}</p>
      <Link href="/admin/dashboard" className="px-4 py-2 mt-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600">
        {t("homeButton")}
      </Link>
    </div>
  );
}
