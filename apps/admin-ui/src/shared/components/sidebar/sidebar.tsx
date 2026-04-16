"use client";
import useAdmin from "apps/admin-ui/src/hooks/useAdmin";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import SidebarMenu from "./sidebar.menu";
import SidebarItem from "./sidebar.item";
import Link from "next/link";
import {BellPlus, BellRing, CreditCard, FileClock, Home, ListOrdered, LogOut, PackageSearch, PencilRuler, Settings, Store, Users} from "lucide-react"

const SidebarWrapper = () => {
  const [activeSidebar, setActiveSidebar] = useState("/dashboard");
  const pathName = usePathname();
  const { admin } = useAdmin();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar])

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

    return (
      <div className="flex flex-col gap-6 text-white">
        {/* Sidebar Header */}
        <Link
          href={"/"}
          className="flex items-start gap-3 border-b border-slate-800 pb-4"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0f172a] shrink-0">
            <Store size={22} color="#0085ff" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-white truncate">
              {admin?.name}
            </h2>
            <p
              className="text-sm text-slate-400 truncate"
              title={admin?.email || ""}
            >
              {admin?.email}
            </p>
          </div>
        </Link>

        {/* Sidebar Body */}
        <div className="flex flex-col gap-4">
          <SidebarItem
            title="Dashboard"
            icon={
              <Home
                fill={getIconColor("/dashboard")}
                stroke={getIconColor("/dashboard")}
              />
            }
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />

          <SidebarMenu title="Main Menu">
            <SidebarItem
              title="Orders"
              icon={
                <ListOrdered
                  fill={getIconColor("/dashboard/orders")}
                  stroke={getIconColor("/dashboard/orders")}
                />
              }
              isActive={activeSidebar === "/dashboard/orders"}
              href="/dashboard/orders"
            />

            <SidebarItem
              title="Payments"
              icon={
                <CreditCard
                  fill={getIconColor("/dashboard/payments")}
                  stroke={getIconColor("/dashboard/payments")}
                />
              }
              isActive={activeSidebar === "/dashboard/payments"}
              href="/dashboard/payments"
            />

            <SidebarItem
              title="Products"
              icon={
                <PackageSearch
                  fill={getIconColor("/dashboard/products")}
                  stroke={getIconColor("/dashboard/products")}
                />
              }
              isActive={activeSidebar === "/dashboard/products"}
              href="/dashboard/products"
            />

            <SidebarItem
              title="Events"
              icon={
                <BellPlus
                  fill={getIconColor("/dashboard/events")}
                  stroke={getIconColor("/dashboard/events")}
                />
              }
              isActive={activeSidebar === "/dashboard/events"}
              href="/dashboard/events"
            />

            <SidebarItem
              title="Users"
              icon={
                <Users
                  fill={getIconColor("/dashboard/users")}
                  stroke={getIconColor("/dashboard/users")}
                />
              }
              isActive={activeSidebar === "/dashboard/users"}
              href="/dashboard/users"
            />

            <SidebarItem
              title="Sellers"
              icon={
                <Store
                  fill={getIconColor("/dashboard/sellers")}
                  stroke={getIconColor("/dashboard/sellers")}
                />
              }
              isActive={activeSidebar === "/dashboard/sellers"}
              href="/dashboard/sellers"
            />
          </SidebarMenu>

          <SidebarMenu title="Controllers">
            <SidebarItem
              title="Loggers"
              icon={
                <FileClock
                  fill={getIconColor("/dashboard/loggers")}
                  stroke={getIconColor("/dashboard/loggers")}
                />
              }
              isActive={activeSidebar === "/dashboard/loggers"}
              href="/dashboard/loggers"
            />

            <SidebarItem
              title="Management"
              icon={
                <Settings
                  fill={getIconColor("/dashboard/management")}
                  stroke={getIconColor("/dashboard/management")}
                />
              }
              isActive={activeSidebar === "/dashboard/management"}
              href="/dashboard/management"
            />

            <SidebarItem
              title="Notifications"
              icon={
                <BellRing
                  fill={getIconColor("/dashboard/notifications")}
                  stroke={getIconColor("/dashboard/notifications")}
                />
              }
              isActive={activeSidebar === "/dashboard/notifications"}
              href="/dashboard/notifications"
            />
          </SidebarMenu>

          <SidebarMenu title="Customization">
            <SidebarItem
              title="All Customizations"
              icon={
                <PencilRuler
                  fill={getIconColor("/dashboard/customization")}
                  stroke={getIconColor("/dashboard/customization")}
                />
              }
              isActive={activeSidebar === "/dashboard/customization"}
              href="/dashboard/customization"
            />
          </SidebarMenu>

          <SidebarMenu title="Extras">
            <SidebarItem
              title="Logout"
              icon={
                <LogOut
                  fill={getIconColor("/logout")}
                  stroke={getIconColor("/logout")}
                />
              }
              isActive={activeSidebar === "/logout"}
              href="/"
            />
          </SidebarMenu>
        </div>
      </div>
    );
};

export default SidebarWrapper;
