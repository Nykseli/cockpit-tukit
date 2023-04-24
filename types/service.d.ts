import {TODO_TYPE} from "@/todo"

declare module "service" {
    function proxy(name: TODO_TYPE, kind?: TODO_TYPE): TODO_TYPE;
}
