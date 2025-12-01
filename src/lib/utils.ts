import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as React from "react";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function cloneElement(element: React.ReactElement, classNames: string) {
  return React.cloneElement(element, {
    className: twMerge(element.props.className, classNames),
  });
}
