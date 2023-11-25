"use server";

import { subscriptionConfig } from "@/config/subscription";
import { db } from "@/lib/db";

export const getBoards = async (orgId: string) => {
    let boards;

    if (subscriptionConfig.is_released) {
        boards = await db.board.findMany({
            where: {
                orgId
            },
            orderBy: {
                createdAt: "desc"
            }
        })
    } else {
        boards = await db.board.findMany({
            where: {
                orgId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: subscriptionConfig.beta_boards_limit
        })
    }
    

    return boards;
}