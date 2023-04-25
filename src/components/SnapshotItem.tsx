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
import * as timeformat from "timeformat";
import React, { useState } from "react";
import {
	Badge,
	Button,
	DataListItem,
	DataListToggle,
	DataListItemRow,
	DataListItemCells,
	DataListCell,
	DataListAction,
	DataListContent,
	Dropdown,
	DropdownItem,
	DropdownPosition,
	KebabToggle,
	Label,
	Tooltip,
} from "@patternfly/react-core";
import { CheckCircleIcon } from "@patternfly/react-icons";
import { TODO_TYPE } from "@/todo";

const _ = cockpit.gettext;

type SnapshotItemProps = {
	item: TODO_TYPE;
	waiting: string | null;
	setWaiting: (waiting: string | null) => void;
	setDirty: (dirty: boolean) => void;
};

const SnapshotItem = ({
	item,
	setDirty,
	setWaiting,
	waiting,
}: SnapshotItemProps) => {
	const [expanded, setExpanded] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);

	const rollback = async (snap: TODO_TYPE, msg: string, reboot: boolean) => {
		setWaiting(msg);
		try {
			let script = `transactional-update rollback ${snap.number}`;
			if (reboot) {
				script = script + " && reboot";
			}
			const out = await cockpit.script(script, {
				superuser: "require",
				err: "message",
			});
			console.log("rollback output: " + out);
			setDirty(true);
		} catch (e) {
			console.log("rollback error: " + e);
			// TODO: better error handling
			alert(e);
		}
		setWaiting(null);
	};
	const rollbackAndReboot = (snap: TODO_TYPE) => {
		rollback(snap, _("Rolling back..."), true);
	};
	const rollbackOnly = (snap: TODO_TYPE) => {
		rollback(snap, _("Rolling back..."), false);
	};
	const activateAndReboot = (snap: TODO_TYPE) => {
		rollback(snap, _("Activating..."), true);
	};
	const activateOnly = (snap: TODO_TYPE) => {
		rollback(snap, _("Activating..."), false);
	};
	const actions = (item: TODO_TYPE): any[] | undefined => {
		if (item.old) {
			return [
				<DropdownItem
					key="rollback"
					isDisabled={!!waiting}
					onClick={() => {
						rollbackOnly(item);
					}}
				>
					{_("Rollback without Reboot")}
				</DropdownItem>,
			];
		}
		if (!item.active && !item.old) {
			return [
				<DropdownItem
					key="activate"
					isDisabled={!!waiting}
					onClick={() => {
						activateOnly(item);
					}}
				>
					{_("Activate without Reboot")}
				</DropdownItem>,
			];
		}
		return undefined;
	};
	return (
		<DataListItem isExpanded={expanded}>
			<DataListItemRow>
				<DataListToggle
					id="TODO_TYPE"
					// hide extension part until we find some good use for it
					style={{ display: "none" }}
					onClick={() => {
						setExpanded(!expanded);
					}}
					isExpanded={expanded}
				/>
				<DataListItemCells
					dataListCells={[
						<DataListCell isIcon key="number">
							<Badge isRead={item.old}>#{item.number}</Badge>
						</DataListCell>,
						<DataListCell key="description">
							<b>{item.description}</b>
						</DataListCell>,
						<DataListCell key="date">
							<Tooltip content={timeformat.dateTimeSeconds(item.date)}>
								<span>{timeformat.distanceToNow(item.date, _("ago"))}</span>
							</Tooltip>
						</DataListCell>,
						<DataListCell key="labels">
							{item.active && (
								<Label color="green" icon={<CheckCircleIcon />}>
									{_("Active")}
								</Label>
							)}
							{item.default && <Label color="blue">{_("Default")}</Label>}
						</DataListCell>,
						<DataListCell key="buttons">
							{!item.active && !item.old && (
								<Button
									variant="primary"
									isDisabled={!!waiting}
									onClick={() => {
										activateAndReboot(item);
									}}
									isSmall
								>
									{_("Activate and Reboot")}
								</Button>
							)}
							{item.old && (
								<Button
									variant="secondary"
									isDisabled={!!waiting}
									onClick={() => {
										rollbackAndReboot(item);
									}}
									isSmall
								>
									{_("Rollback and Reboot")}
								</Button>
							)}
						</DataListCell>,
					]}
				/>
				<DataListAction
					aria-label="TODO_TYPE"
					aria-labelledby="TODO_TYPE"
					id="TODO_TYPE"
				>
					{actions(item) && (
						<Dropdown
							isPlain
							isOpen={menuOpen}
							position={DropdownPosition.right}
							toggle={
								<KebabToggle
									onToggle={() => {
										setMenuOpen(!menuOpen);
									}}
								/>
							}
							dropdownItems={actions(item)}
						/>
					)}
				</DataListAction>
			</DataListItemRow>
			<DataListContent isHidden={!expanded} aria-label="TODO_TYPE">
				More details about selected snapshot More details about selected
				snapshot More details about selected snapshot More details about
				selected snapshot
			</DataListContent>
		</DataListItem>
	);
};

export default SnapshotItem;
