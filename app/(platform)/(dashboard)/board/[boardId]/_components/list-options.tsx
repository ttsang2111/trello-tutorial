"use client"

import { List } from "@prisma/client"

import {
    Popover,
    PopoverTrigger,
    PopoverContent
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { MoreHorizontal, X } from "lucide-react";
import { PopoverClose } from "@radix-ui/react-popover";
import { FormSubmit } from "@/components/form/form-submit";
import { Separator } from "@/components/ui/separator";
import { useAction } from "@/hooks/use-action";
import { deleteList } from "@/actions/delete-list";
import { toast } from "sonner";
import { copyList } from "@/actions/copy-list";
import { ElementRef, useRef } from "react";

interface ListOptionsProps {
    data: List,
    onAddCard: () => void;
}

export const ListOptions = ({
    data,
    onAddCard
}: ListOptionsProps) => {
    const closeRef = useRef<ElementRef<"button">>(null);
    // delete action
    const { execute: deleteExecute } = useAction(deleteList, {
        onSuccess: (data) => {
            toast.success(`Deleted "${data.title}" list`)
        },
        onError: (error) => {
            toast.error(error);
        }
    })

    const onDelete = (formData: FormData) => {
        const id = formData.get("id") as string;
        const boardId = formData.get("boardId") as string;

        deleteExecute({ id, boardId })
    }
    // copy action
    const { execute: copyExecute } = useAction(copyList, {
        onSuccess: (data) => {
            closeRef.current?.click();
            toast.success(`Copied "${data.title}" list`);
        },
        onError: (error) => {
            toast.error(error);
        }
    })

    const onCopy = (formData: FormData) => {
        const id = formData.get("id") as string;
        const boardId = formData.get("boardId") as string;

        copyExecute({ id, boardId });
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className="w-auto h-auto p-2"  variant="ghost">
                    <MoreHorizontal className="h-4 w-4"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="px-0 pt-3 pb-3" side="bottom" align="start">
                    <div className="text-sm font-medium text-center text-neutral-600 pb-4">
                        List Actions
                    </div>
                    <PopoverClose
                        ref={closeRef}
                        className="h-auto w-auto p-2 absolute top-2 right-2">
                        <X
                        className="h-4 w-4" />
                    </PopoverClose>
                    <Button 
                        onClick={onAddCard}
                        className="rounded-none w-full h-auto p-2 px-5 
                        justify-start font-normal text-sm"
                        variant="ghost"
                    >
                        Add card...
                    </Button>
                    <form
                        action={onCopy}>
                        <input hidden name="id" value={data.id} />
                        <input hidden name="boardId" value={data.boardId} />
                        <FormSubmit 
                            className="rounded-none w-full h-auto p-2 px-5 
                            justify-start font-normal text-sm"
                            variant="ghost"
                        >
                            Copy list...
                        </FormSubmit>
                    </form>
                    <Separator />
                    <form action={onDelete}>
                        <input hidden name="id" value={data.id} />
                        <input hidden name="boardId" value={data.boardId} />
                        <FormSubmit 
                            className="rounded-none w-full h-auto p-2 px-5 
                            justify-start font-normal text-sm"
                            variant="ghost"
                        >
                            Delete list
                        </FormSubmit>
                    </form>
            </PopoverContent>
        </Popover>
    )
}