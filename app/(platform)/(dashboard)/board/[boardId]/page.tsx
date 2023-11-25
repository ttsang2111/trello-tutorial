import { auth } from "@clerk/nextjs";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ListContainer } from "./_components/list-container";
import { ListWithCards } from "@/types";
 
interface BoardIdProps {
    params: {
        boardId: string;
    }
}

const BoardIdPage = async ({params}: BoardIdProps) => {

    const { orgId } = auth();
    if(!orgId) {
        redirect("/select-org");
    }

    const lists: ListWithCards[] = await db.list.findMany({
        where: {
            boardId: params.boardId,
            board: {
                orgId
            }
        },
        include: {
            cards: {
                orderBy: {
                    order: "asc"
                }
            }
        },
        orderBy: {
            order: "asc"
        }
    })
    return (
        <div className="h-full pt-4 pl-4">
            <ListContainer
                boardId={params.boardId}
                data={lists}
            />
        </div>
    )
}

export default BoardIdPage;