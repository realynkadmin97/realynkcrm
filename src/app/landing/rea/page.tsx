import { redirect } from "next/navigation";

/** The Rea door is locked as the global sign-in. */
export default function ReaLoginRedirect() {
  redirect("/login");
}
