import { redirect } from "next/navigation";

export default function DashboardPage() {
  // Currently, we default to the teacher dashboard as it is the most complete.
  // In a real app, this would check the user's role and redirect accordingly.
  redirect("/teacher");
}
