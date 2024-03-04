/**
 * v0 by Vercel.
 * @see https://v0.dev/t/KHrgwLuLvn0
 */
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar"
import { HoverCardTrigger, HoverCardContent, HoverCard } from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
export default function Component({ setSelecteCompoId, username }) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("user_id");
    router.push("/");
  };
  
  return (

    <HoverCard>
      <HoverCardTrigger asChild>
        <Avatar>
          <AvatarImage alt="User's Avatar" src="/placeholder.svg?height=50&width=50" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4 space-y-3">
        <div className="flex justify-between items-center space-x-3">
          <Avatar className="w-16 h-16">
            <AvatarImage alt="User's Avatar" src="/placeholder.svg?height=50&width=50" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="space-y-1">

            <h4 className="text-lg font-semibold">{username}</h4>
            
          </div>
          <div></div>
          <Button className="w-fit font-bold" variant="outline" onClick={handleLogout}>로그아웃</Button>


        </div>
        

        <Button className="w-full font-bold" variant="outline" onClick={() => setSelecteCompoId(3)}>
          마이페이지
        </Button>
      </HoverCardContent>
    </HoverCard>
  )
}

