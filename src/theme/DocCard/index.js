import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
import {
  findFirstCategoryLink,
  useDocById,
} from "@docusaurus/theme-common/internal";
import isInternalUrl from "@docusaurus/isInternalUrl";
import styles from "./styles.module.css";
import {
  BsFillFileEarmarkTextFill,
  BsFolderFill,
  BsPaperclip,
} from "react-icons/bs";
import { HiChatBubbleLeft, HiServerStack } from "react-icons/hi2";
function CardContainer({ href, children }) {
  return (
    <Link
      href={href}
      className={clsx("card padding--lg", styles.cardContainer)}
    >
      {children}
    </Link>
  );
}
function CardLayout({ href, icon, title, description }) {
  return (
    <CardContainer href={href}>
      <h2
        className={clsx(
          "text--truncate gap-2 flex items-center",
          styles.cardTitle
        )}
        title={title}
      >
        {icon} {title}
      </h2>
      {description && (
        <p
          className={clsx("text--truncate", styles.cardDescription)}
          title={description}
        >
          {description}
        </p>
      )}
    </CardContainer>
  );
}
function CardCategory({ item }) {
  const href = findFirstCategoryLink(item);
  const icon = item?.customProps?.icon || (
    <BsFolderFill className="w-4 h-4 text-accent" />
  );
  const description = item?.customProps?.description;
  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }
  return (
    <CardLayout
      href={href}
      icon={
        (item.label === "Client" && <HiChatBubbleLeft className="w-4 h-4" />) ||
        (item.label === "Server" && <HiServerStack className="w-4 h-4" />) ||
        icon
      }
      title={item.label}
      description={description || null}
    />
  );
}
function CardLink({ item }) {
  const icon =
    item?.customProps?.icon || isInternalUrl(item.href) ? (
      <BsFillFileEarmarkTextFill className="w-4 h-4 text-gray-300" />
    ) : (
      <BsPaperclip className="w-4 h-4 text-gray-300" />
    );
  const doc = useDocById(item.docId ?? undefined);
  return (
    <CardLayout
      href={item.href}
      icon={icon}
      title={item.label}
      description={doc?.description}
    />
  );
}
export default function DocCard({ item }) {
  switch (item.type) {
    case "link":
      return <CardLink item={item} />;
    case "category":
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
