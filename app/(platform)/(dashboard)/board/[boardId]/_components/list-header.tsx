"use client"

import { updateList } from "@/actions/update-list";

import { FormInput } from "@/components/form/form-input";
import { useAction } from "@/hooks/use-action";
import { List } from "@prisma/client"

import { useState, useRef, ElementRef } from 'react';
import { toast } from "sonner";
import { useEventListener } from "usehooks-ts";
import { ListOptions } from "./list-options";

interface ListHeaderProps {
    data: List,
    onAddCard: () => void
}
export const ListHeader = ({ data, onAddCard }: ListHeaderProps) => {
    const [title, setTitle] = useState(data.title);
    const [isEditting, setIsEditing] = useState(false);

    const formRef = useRef<ElementRef<"form">>(null);
    const inputRef = useRef<ElementRef<"input">>(null);

    const enableEditting = () => {
        setIsEditing(true);
        setTimeout(() => {
            inputRef.current?.focus();
            inputRef.current?.select();
        })
    }

    const disableEditing = () => {
        setIsEditing(false);
    }

    const { execute, fieldErrors } = useAction(updateList, {
        onSuccess: (data) => {
            disableEditing();
            setTitle(data.title);
            toast.success("List updated successfully");
        },
        onError: (error) => {
            toast.error(error);
        }
    })

    const onSubmit = (formData: FormData) => {
        const title = formData.get("title") as string;
        const id = formData.get("id") as string;
        const boardId = formData.get("boardId") as string;

        if (title === data.title) {
            return disableEditing();
        }

        execute({title, id, boardId})
    }

    const onBlur = () => {
        formRef.current?.requestSubmit();
      }

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            formRef.current?.requestSubmit();
        }
    }

    useEventListener("keydown", onKeyDown)

    return (
        <div className="pt-2 px-2 gap-x-2 text-sm font-semibold flex
        justify-between items-start">
            {isEditting ? (
            <form
                ref={formRef}
                action={onSubmit}
                className="flex-1 px-[2px]"
            >
                <input hidden id="id" name="id" value={data.id}/>
                <input hidden id="boardId" name="boardId" value={data.boardId}/>
                <FormInput 
                    ref={inputRef}
                    onBlur={onBlur}
                    id="title"
                    placeholder="Enter list title..."
                    defaultValue={data.title}
                    className="text-sm px-[7px] py-1 h-7 font-medium
                    border-transparent hover:border-input focus:border-input
                    transition truncate bg-transparent focus:bg-white"
                    errors={fieldErrors}
                />
                <button type="submit" hidden />

            </form>
            ) : (
                <div onClick={enableEditting} className="w-full text-sm px-2.5 py-1 h-7 font-medium
                    border-transparent">
                    {title}
                </div>
            )}
              <ListOptions
                    onAddCard={onAddCard}
                    data={data}
                />
        </div>
    )
}