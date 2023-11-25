"use server"

import { auth } from "@clerk/nextjs"
import { revalidatePath } from "next/cache";

import { InputType, ReturnType } from "./types"
import { DeleteList } from "./schema";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
    const { userId, orgId } = auth();

    if (!userId || !orgId) {
        return {
            error: "Unathorized",
        };
    }

    const { id, boardId } = data;
    let list;
    
    try {
        list = await db.list.delete({
            where: {
                id,
                boardId
            }
        })

        await createAuditLog({
            entityId: list.id,
            entityTitle: list.title,
            entityType: ENTITY_TYPE.LIST,
            action: ACTION.DELETE,
        })

    } catch (error) {
        return {
            error: "Failed to delete"
        }
    }
    revalidatePath(`/board/${boardId}`);

    return {
        data: list
    }
}

export const deleteList = createSafeAction(DeleteList, handler);