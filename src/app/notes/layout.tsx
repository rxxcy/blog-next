import type { ReactNode } from "react";
import "./notes-content.css";

type NotesLayoutProps = {
  children: ReactNode;
};

export default function NotesLayout({ children }: NotesLayoutProps) {
  return children;
}
