import { type PlateElementProps, PlateElement } from "platejs/react";
import { type TDateElement } from "platejs";

export function DateElementStatic(props: PlateElementProps<TDateElement>) {
  const { element } = props;

  return (
    <PlateElement className="inline-block" {...props}>
      <span className="w-fit rounded-sm bg-muted px-1 text-muted-foreground">
        {element.date ? (
          (() => {
            const today = new Date();
            const elementDate = new Date(element.date);
            const isToday =
              elementDate.getDate() === today.getDate() &&
              elementDate.getMonth() === today.getMonth() &&
              elementDate.getFullYear() === today.getFullYear();

            const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
            const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            const isYesterday = yesterday.toDateString() === elementDate.toDateString();
            const isTomorrow = tomorrow.toDateString() === elementDate.toDateString();

            if (isToday) return "Today";
            if (isYesterday) return "Yesterday";
            if (isTomorrow) return "Tomorrow";

            return elementDate.toLocaleDateString(undefined, {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
          })()
        ) : (
          <span>Pick a date</span>
        )}
      </span>
      {props.children}
    </PlateElement>
  );
}