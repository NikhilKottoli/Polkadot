import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function NavUser({
  user
}) {
  const { isMobile } = useSidebar()
const navigate = useNavigate()
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
            onClick={(e)=>{e.preventDefault(); navigate("/assethub")}}
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground flex flex-col h-50 p-4 py-8 bg-white/5 rounded-2xl gap-4">
            
            
              <Avatar className="h-8 w-8 rounded-lg ">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>


              <div className="w-full  p-2 rounded-sm text-left text-sm leading-tight flex justify-center flex-col items-center">
                <div className="truncate font-medium">{user.name}</div>
                <div className="text-muted-foreground truncate text-xs">
                  {user.email}
                </div>
              </div>
    
     <div className="w-full bg-white/10 p-2 rounded-sm text-left text-sm leading-tight pb-3 text-center flex justify-center items-center">
                go to assethub <ArrowRight className="ml-2 h-4 w-4" />
              
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
  
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="truncate font-medium">{user.name}</div>
                  <div className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </div>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
      
              <DropdownMenuItem         onClick={()=> navigate("/assethub")}>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
                   
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconLogout />
              Assethub
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
