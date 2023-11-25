import { auth } from "@clerk/nextjs";

import { db } from "./db";
import { MAX_FREE_BOARDS } from "@/constants/boards";

export const decreaseAvailableCount = async () => {
    const { orgId } = auth();

    if (!orgId) {
        throw new Error("Unauthorized");
    }

    const orgLimit = await db.orgLimit.findUnique({
        where: {orgId}
    })

    if (orgLimit) {
        const newCount = orgLimit.count > 0 ? orgLimit.count - 1 : 0

        await db.orgLimit.update({
            where: { orgId },
            data: {count: newCount }
        });
    }
};

export const incrementAvailableCount = async () => {
    const { orgId } = auth();

    if (!orgId) {
        throw new Error("Unauthorized");
    }

    const orgLimit = await db.orgLimit.findUnique({
        where: {orgId}
    })

    if (orgLimit) {
        const newCount = orgLimit.count < MAX_FREE_BOARDS ? orgLimit.count + 1 : MAX_FREE_BOARDS
        
        await db.orgLimit.update({
            where: { orgId },
            data: {count: newCount }
        });
    } else {
        await db.orgLimit.create({
            data: { orgId, count: 1 }
        })
    }
};

export const hasAvailableCount = async() => {
    const { orgId } = auth();
    if (!orgId) {
        throw new Error("Unauthorized");
    }

    const orgLimit = await db.orgLimit.findUnique({
        where: { orgId }
    });

    if (!orgLimit || orgLimit.count < MAX_FREE_BOARDS) {
        return true;
    } else {
        return false;
    }
}

export const getAvailableCount = async () => {
    const { orgId } = auth();

    if(!orgId) {
        return 0;
    }

    const orgLimit = await db.orgLimit.findUnique({
        where: { orgId }
    });
    
    if (!orgLimit) {
        return 0;
    };

    return orgLimit.count;
}
