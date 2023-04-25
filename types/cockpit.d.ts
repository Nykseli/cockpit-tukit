import { TODO_TYPE } from "@/todo";

// https://github.com/cockpit-project/cockpit/pull/13214

interface Func1<T, R = void> {
	(arg: T): R;
}

declare type DbusOptions = {
	bus: "session" | "user" | "system" | "none";
	address: string;
	superuser?: "require";
	track: boolean;
};

type Fail = {
	message: string;
	problem?: string;
};

type SpawnFail = Fail & {
	exit_status?: number;
	exit_signal?: number;
};

type ErrorConfig = "message" | "out" | "ignore" | "pty";
type Superuser = "require" | "try";
type ProblemCodes =
	| "access-denied"
	| "authentication-failed"
	| "internal-error"
	| "no-cockpit"
	| "no-session"
	| "not-found"
	| "terminated"
	| "timeout"
	| "unknown-hostkey"
	| "no-forwarding";

type SpawnConfig = {
	err?: ErrorConfig;
	binary?: boolean;
	directory?: string;
	host?: string;
	environ?: string[];
	pty?: boolean;
	batch?: boolean;
	latency?: number;
	superuser?: Superuser;
};

interface Proxy {
	client: DbusClient;
	path: string;
	iface: string;
	valid: boolean;
	data: Object;
}

interface DbusClient {
	wait(callback?: string): Promise<TODO_TYPE>;
	close(problem?: string): void;
	proxy(interface?: string, path?: string): Proxy;
	proxies(interface?: string[], path?: string[]): Proxy[];
	options: DbusOptions;
	unique_name: string;
}

interface ClosableWithProblem {
	close(problem?: ProblemCodes): void;
}

interface SpawnPromise extends Promise<string>, ClosableWithProblem {
	stream(callback: Func1<string>): SpawnPromise;
	input(data?: string | Uint8Array, stream?: boolean): SpawnPromise;
}

declare module "cockpit" {
	function gettext(text: string): string;
	function gettext(context: string, text: string): string;
	function format(template: string, args: string[] | Object): string;

	function dbus(name: string, options?: DbusOptions[]): DbusClient;

	function jump(todo: string, host?: string | null): void;
	function script(script: string, args: SpawnConfig): SpawnPromise;
	function spawn(args: string | string[], options?: SpawnConfig): SpawnPromise;

	const transport: { host: TODO_TYPE };
}
