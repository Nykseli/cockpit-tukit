import { TODO_TYPE } from "@/todo";

declare module "notifications" {
	class PageStatus {
		constructor();
		get(page: TODO_TYPE, host: TODO_TYPE): TODO_TYPE;
		set_own(status: TODO_TYPE): void;
	}

	const page_status: PageStatus;
}
