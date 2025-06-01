import { clsx } from "clsx";
import React from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function cloneElement(element, classNames) {
  return React.cloneElement(element, {
    className: twMerge(element.props.className, classNames),
  });
}
