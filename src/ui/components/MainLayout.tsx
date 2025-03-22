import ChatTray from "./chat/ChatTray";
import ConnectedSocket from "./ConnectedSocket";
import Container from "./Container";
import SidebarComponent from "./sidebar/SidebarComponent";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <div className="w-full h-screen ">
                <div className="flex gap-3">
                    <SidebarComponent />
                    <div className="w-full ml-[200px] pb-20">
                        <Container>
                            {children}
                        </Container>
                    </div>
                </div>

                <ChatTray />
                <ConnectedSocket />
            </div>
        </>
    )
}