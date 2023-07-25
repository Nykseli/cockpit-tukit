/*
 * Copyright (C) 2022 SUSE LLC
 *
 * This program is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Cockpit; If not, see <http://www.gnu.org/licenses/>.
 *
 * To contact SUSE LLC about this file by physical or electronic mail, you may
 * find current contact information at www.suse.com.
 */

import cockpit from "cockpit";
import React, { useEffect } from "react";
import {
	Card,
	CardBody,
	CardTitle,
	List,
	ListItem,
	Tooltip,
} from "@patternfly/react-core";
import {
	CheckCircleIcon,
	ExclamationCircleIcon,
	ExclamationTriangleIcon,
	InfoCircleIcon,
	PendingIcon,
} from "@patternfly/react-icons";

import "./StatusPanel.scss";
import { Update } from "@/update";
import { TODO_TYPE } from "@/todo";

const _ = cockpit.gettext;

type StatusPanelProps = {
	updates: Update[];
	waiting: string | null | boolean;
	status: TODO_TYPE;
	setStatus: (status: TODO_TYPE) => void;
	updatesError: string | null;
	snapshots: TODO_TYPE[];
};

const StatusPanel = ({
	waiting,
	status,
	setStatus,
	updates,
	updatesError,
	snapshots,
}: StatusPanelProps) => {
	// update page status
	useEffect(() => {
		console.log("Updating page status");
		if (waiting) {
			setStatus([
				{
					key: "wait",
					title: waiting,
					details: { icon: "pending" },
				},
			]);
			return;
		}
		const s = [];
		if (updatesError) {
			s.push({
				key: "updates-error",
				type: "error",
				title: updatesError,
			});
		}
		if (snapshots.length > 0 && !snapshots[0].active) {
			s.push({
				key: "new-snapshot",
				type: "info",
				title: cockpit.format(
					_("New snapshot #$1 available: $0"),
					snapshots[0].description,
					snapshots[0].number,
				),
			});
		}
		if (updates.length > 0) {
			const security_updates = updates.filter((u) => u.category === "security");
			const [t, msg] =
				security_updates.length > 0
					? ["warning", _("Security updates available")]
					: ["info", _("Updates available")];
			s.push({
				key: "updates",
				type: t,
				title: msg,
			});
		}
		// no status? it's good!
		if (s.length === 0) {
			s.push({
				key: "system-ok",
				title: _("System is up to date"),
				details: { icon: "check" },
			});
		}
		setStatus(s);
	}, [waiting, snapshots, updates, updatesError, setStatus]);

	const icon = (s: TODO_TYPE) => {
		const i = (s.details && s.details.icon) || s.type;
		const c = `tukit-status-${i}`;
		if (i === "error") return <ExclamationCircleIcon className={c} />;
		else if (i === "warning") return <ExclamationTriangleIcon className={c} />;
		else if (i === "check") return <CheckCircleIcon className={c} />;
		else if (i === "pending") return <PendingIcon className={c} />;
		else return <InfoCircleIcon className={c} />;
	};
	return (
		<Card className="ct-card-info tukit-status-panel">
			<CardTitle>{_("Status")}</CardTitle>
			<CardBody>
				<List isPlain iconSize="large">
					{status.map((s: TODO_TYPE) => (
						<ListItem icon={icon(s)} key={s.key}>
							<Tooltip
								className="tukit-tooltip-pre"
								isContentLeftAligned
								maxWidth="30rem"
								position="auto"
								content={s.title}
							>
								<span className="tukit-status-text">{s.title}</span>
							</Tooltip>
						</ListItem>
					))}
				</List>
			</CardBody>
		</Card>
	);
};

export default StatusPanel;
