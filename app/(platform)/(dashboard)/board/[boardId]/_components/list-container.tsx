"use client"

import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd"

import { useAction } from "@/hooks/use-action";
import { updateListOrder } from "@/actions/update-list-order";
import { updateCardOrder } from "@/actions/update-card-order";

import { ListWithCards } from "@/types"

import { ListForm } from "./list-form"
import ListItem from "./list-item";
import { toast } from "sonner";

interface ListContainerProps {
    boardId: string,
    data: ListWithCards[]
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
}

export const ListContainer = ({
    boardId,
    data
}: ListContainerProps) => {
    const [orderedData, setOrderedData] = useState(data);

    const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
        onSuccess: (data) => {
            toast.success("List reordered");
        },
        onError: (error) => {
            toast.error(error);
        }
    });

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: (data) => {
            toast.success("Card reordered");
        },
        onError: (error) => {
            toast.error(error);
        }
    })
    useEffect(() => {
        setOrderedData(data);
    }, [data])

    const onDragEnd = (result: any) => {
        const { destination, source, type } = result;

        if (!destination) {
            return;
        }

        // Dropped in the same position
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // User moves a list
        if (type === "list") {
            const items = reorder(
                orderedData,
                source.index,
                destination.index
            ).map((item, index) => ({...item, order: index}));

            setOrderedData(items);
            executeUpdateListOrder({ items, boardId });

        }
        
        // User moves a card
        if (type === "card") {
            let newOrderedData = [...orderedData];

            // Source and destination list
            const sourceList = newOrderedData.find(list => list.id === source.droppableId)
            const desList = newOrderedData.find(list => list.id === destination.droppableId)

            if (!sourceList || !desList) {
                return;
            }

            // Check if cards exists on the `sourceList`
            if (!sourceList.cards) {
                sourceList.cards = [];
            }

            // CHeck if cards exists on the `desList`
            if (!desList.cards) {
                desList.cards = [];
            }

            // Moving the card in the same list
            if (source.droppableId === destination.droppableId) {
                const reorderedCards = reorder(
                    sourceList.cards,
                    source.index,
                    destination.index
                )

                reorderedCards.forEach((card, idx) => {
                    card.order = idx;
                });

                sourceList.cards = reorderedCards;
                setOrderedData(newOrderedData);
                executeUpdateCardOrder({ boardId, items: reorderedCards});

            // User moves the card to another list
            } else {
                // Remove card from the source list
                const [movedCard] = sourceList.cards.splice(source.index, 1);

                // Assign the new listId to the moved card
                movedCard.listId = destination.droppableId;

                // Add card to the destination list
                desList.cards.splice(destination.index, 0, movedCard);

                // Update the order for each card in the source list
                sourceList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                // Update the order for each card in the destination list
                desList.cards.forEach((card, idx) => {
                    card.order = idx;
                });

                setOrderedData(newOrderedData);
                executeUpdateCardOrder({
                    boardId,
                    items: desList.cards
                })
            }
        }
        
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="lists" type="list" direction="horizontal">
                {(provided) => (
                    <ol 
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-x-3 h-full"
                    >
                        {orderedData.map((list, index) => {
                            return (
                                <ListItem
                                    key={list.id}
                                    index={index}
                                    data={list}
                                />
                            )
                        })}
                        {provided.placeholder}
                        <ListForm />
                        <div className="flex-shrink-0 w-1" />
                    </ol>
                )}
            </Droppable>
        </DragDropContext>
    )
}