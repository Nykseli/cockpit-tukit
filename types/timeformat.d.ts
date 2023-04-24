import { TODO_TYPE } from "@/todo";

declare module "timeformat" {
    function dateFormatLang(): string
    function formatter(options?: Intl.DateTimeFormatOptions | undefined): string
    function time(t: Date | number): string
    function timeSeconds(t: Date | number): string
    function date(t: Date | number): string
    function dateShort(t: Date | number): string
    function dateTime(t: Date | number): string
    function dateTimeSeconds(t: Date | number): string
    function dateTimeNoYear(t: Date | number): string
    function weekdayDate(t: Date | number): string
    function dateShortFormat(): string
    // accordign to the docs, addSuffix is bool or undefined
    // https://date-fns.org/docs/formatDistanceToNow
    // But is used as a string in code with `_("ago")`
    function distanceToNow(t: Date | number, addSuffix?: TODO_TYPE): string
}
