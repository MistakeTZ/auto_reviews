import React, { useRef } from "react";
import { useInView } from "framer-motion";

type RevealProps<T extends React.ElementType = "div"> = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "zoom";
  as?: T;
  style?: React.CSSProperties;
} & Omit<React.ComponentPropsWithoutRef<T>, "children" | "className" | "style" | "as">;

export default function Reveal<T extends React.ElementType = "div">({
  children,
  className = "",
  delay = 0,
  direction = "up",
  as,
  style,
  ...props
}: RevealProps<T>) {
  const ref = useRef<Element>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -50px 0px" });

  const revealDelay = {
    "--reveal-delay": `${delay}ms`,
    ...style,
  } as React.CSSProperties;

  const Component = as || "div";

  return React.createElement(
    Component,
    {
      ref,
      className: `${className} ${isInView ? "is-revealed" : ""}`,
      "data-reveal": direction,
      style: revealDelay,
      ...props,
    },
    children
  );
}
