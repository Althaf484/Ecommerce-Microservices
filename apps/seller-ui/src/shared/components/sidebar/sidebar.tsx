"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import {
  Home,
  Store,
  ListOrdered,
  CreditCard,
  SquarePlus,
  PackageSearch,
  CalendarPlus,
  BellPlus,
  Mail,
  Settings,
  BellRing,
  TicketPercent,
  LogOut,
} from "lucide-react";
import SidebarItem from "./sidebar.item";
import SidebarMenu from "./sidebar.menu";
import Link from "next/link";

const Sidebar = () => {
  const [activeSidebar, setActiveSidebar] = useState("");
  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName]);

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
            {seller?.shop?.name || "My Shop"}
          </h2>
          <p
            className="text-sm text-slate-400 truncate"
            title={seller?.shop?.address || ""}
          >
            {seller?.shop?.address || "No address available"}
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
        </SidebarMenu>

        <SidebarMenu title="Products">
          <SidebarItem
            title="Create Product"
            icon={
              <SquarePlus
                fill={getIconColor("/dashboard/create-product")}
                stroke={getIconColor("/dashboard/create-product")}
              />
            }
            isActive={activeSidebar === "/dashboard/create-product"}
            href="/dashboard/create-product"
          />

          <SidebarItem
            title="All Products"
            icon={
              <PackageSearch
                fill={getIconColor("/dashboard/all-products")}
                stroke={getIconColor("/dashboard/all-products")}
              />
            }
            isActive={activeSidebar === "/dashboard/all-products"}
            href="/dashboard/all-products"
          />
        </SidebarMenu>

        <SidebarMenu title="Events">
          <SidebarItem
            title="Create Event"
            icon={
              <CalendarPlus
                fill={getIconColor("/dashboard/create-event")}
                stroke={getIconColor("/dashboard/create-event")}
              />
            }
            isActive={activeSidebar === "/dashboard/create-event"}
            href="/dashboard/create-event"
          />

          <SidebarItem
            title="All Events"
            icon={
              <BellPlus
                fill={getIconColor("/dashboard/all-events")}
                stroke={getIconColor("/dashboard/all-events")}
              />
            }
            isActive={activeSidebar === "/dashboard/all-events"}
            href="/dashboard/all-events"
          />
        </SidebarMenu>

        <SidebarMenu title="Controllers">
          <SidebarItem
            title="Inbox"
            icon={
              <Mail
                fill={getIconColor("/dashboard/inbox")}
                stroke={getIconColor("/dashboard/inbox")}
              />
            }
            isActive={activeSidebar === "/dashboard/inbox"}
            href="/dashboard/inbox"
          />

          <SidebarItem
            title="Settings"
            icon={
              <Settings
                fill={getIconColor("/dashboard/settings")}
                stroke={getIconColor("/dashboard/settings")}
              />
            }
            isActive={activeSidebar === "/dashboard/settings"}
            href="/dashboard/settings"
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

        <SidebarMenu title="Extras">
          <SidebarItem
            title="Discount Codes"
            icon={
              <TicketPercent
                fill={getIconColor("/dashboard/discount-codes")}
                stroke={getIconColor("/dashboard/discount-codes")}
              />
            }
            isActive={activeSidebar === "/dashboard/discount-codes"}
            href="/dashboard/discount-codes"
          />

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

export default Sidebar;
