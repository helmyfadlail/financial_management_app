"use client";

import { useEffect } from "react";

import { useSession } from "next-auth/react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { usePathname } from "@/i18n/navigation";

import { useTranslations } from "next-intl";

import { useAuth } from "@/hooks";

import { Dropdown, DropdownItem, DropdownDivider, AvatarImg, Img } from "@/components";

import { formatInitialName } from "@/utils";

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const t = useTranslations("dashboard");
  const { data: session, status } = useSession();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    { name: t("nav.dashboard"), href: "/admin/dashboard", icon: "📊" },
    { name: t("nav.transactions"), href: "/admin/dashboard/transactions", icon: "💰" },
    { name: t("nav.accounts"), href: "/admin/dashboard/accounts", icon: "💳" },
    { name: t("nav.categories"), href: "/admin/dashboard/categories", icon: "📁" },
    { name: t("nav.budgets"), href: "/admin/dashboard/budgets", icon: "📊" },
    { name: t("nav.goals"), href: "/admin/dashboard/goals", icon: "🎯" },
    { name: t("nav.reports"), href: "/admin/dashboard/reports", icon: "📈" },
  ];

  useEffect(() => {
    if (status !== "loading" && !session) {
      router.push("/login");
    }
  }, [status, session, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-t-primary border-primary-200 animate-spin" />
          <p className="text-primary-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-t-primary border-primary-200 animate-spin" />
          <p className="text-primary-600">{t("redirecting")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-primary-100">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-6 border-b border-primary-100">
            <Img src="/finarthax.png" alt="finarthax logo" width={40} height={40} objectFit="cover" priority />
            <div className="relative">
              <h1 className="font-bold text-primary-900">{t("appName")}</h1>
              <p className="text-xs text-primary-600">{t("appTagline")}</p>
            </div>
          </div>
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive ? "bg-primary text-white" : "text-primary-700 hover:bg-primary-50"}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-primary-100">
            <Dropdown
              trigger={
                <button className="flex items-center w-full gap-3 p-2 transition-colors rounded-lg hover:bg-primary-50">
                  {!session.user.avatar ? (
                    <div className="flex items-center justify-center w-10 h-10 font-medium rounded-full shrink-0 bg-primary-100 text-primary-700">{formatInitialName(session.user.name || "")}</div>
                  ) : (
                    <AvatarImg src={session.user.avatar} alt="User" size="md" className="shrink-0" />
                  )}
                  <div className="flex flex-col flex-1 min-w-0 text-left">
                    <p className="font-semibold truncate text-primary-900" title={session.user.name || ""}>
                      {session.user.name}
                    </p>
                    <p className="text-xs truncate text-primary-600" title={session.user.email}>
                      {session.user.email}
                    </p>
                  </div>
                </button>
              }
              align="left"
              position="bottom-16"
            >
              <DropdownItem icon={<span>⚙️</span>} onClick={() => router.push("/admin/dashboard/settings")}>
                {t("menu.settings")}
              </DropdownItem>
              <DropdownItem icon={<span>👤</span>} onClick={() => router.push("/admin/dashboard/profiles")}>
                {t("menu.profile")}
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem icon={<span>🚪</span>} danger onClick={() => logout()}>
                {t("menu.logout")}
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </aside>

      <main className="min-h-screen ml-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
