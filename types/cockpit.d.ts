import { TODO_TYPE } from "@/todo";

// https://github.com/cockpit-project/cockpit/pull/13214

declare module "cockpit" {
    function gettext(text: string): string;
    function format(text: string, ...args: unknown[]): string;
    function dbus(...args: TODO_TYPE[]): TODO_TYPE;
    function script(script: string, args: TODO_TYPE): string;
    function jump(todo: string, arg1: TODO_TYPE): TODO_TYPE;
    function spawn(todo: TODO_TYPE, arg1: TODO_TYPE): TODO_TYPE;

    const transport: {host: TODO_TYPE};
}
