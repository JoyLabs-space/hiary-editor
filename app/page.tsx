import { redirect } from "next/navigation";

export default function Page() {
  // 정적 내보내기 환경에서도 동작하는 리다이렉션
  redirect("/notion-like/");
}
