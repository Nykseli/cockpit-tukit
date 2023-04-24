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
import { page_status } from "notifications";
import React, { useState, useEffect } from "react";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    DataList,
    EmptyState,
    EmptyStateBody,
    EmptyStateIcon,
    Gallery,
    Page,
    PageSection,
    Spinner,
    Title,
} from "@patternfly/react-core";
import { ExclamationCircleIcon, RedoIcon } from "@patternfly/react-icons";

import SnapshotItem from "./components/SnapshotItem";
import UpdatesItem from "./components/UpdatesItem";
import StatusPanel from "./components/StatusPanel";
import UpdatesPanel from "./components/UpdatesPanel";

import { createSnapshot, snapshotsProxy, tukitdProxy } from "./tukit";
import { mostSevereStatus } from "./status";
import { TODO_TYPE } from "./todo";
import { Update } from "./update";

const _ = cockpit.gettext;

const Application = () => {
    const [status, setStatus] = useState([]);

    const [snapshots, setSnapshots] = useState([]);
    const [snapshotsWaiting, setSnapshotsWaiting] = useState<string | null>(null);
    const [snapshotsDirty, setSnapshotsDirty] = useState(true);

    const [updates, setUpdates] = useState<Update[]>([]);
    const [updatesWaiting, setUpdatesWaiting] = useState<string | null>(null);
    const [updatesError, setUpdatesError] = useState<string | null>(null);
    const [updatesDirty, setUpdatesDirty] = useState(true);

    const [serviceReady, setServiceReady] = useState(false);

    const setDirty = (v: boolean) => {
        setSnapshotsDirty(v);
        setUpdatesDirty(v);
    };

    useEffect(() => {
        getSnapshots();
        // TODO: FIX!
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [snapshotsDirty]);

    // forward status to Cockpit
    useEffect(() => {
        console.log("Forwarding page status");
        if (status.length > 0) {
            // page_status can show only one status
            // use most important one
            page_status.set_own(mostSevereStatus(status));
        } else {
            page_status.set_own(null);
        }
    }, [status]);

    const showServiceDetails = () => {
        cockpit.jump("/system/services#/tukitd.service", cockpit.transport.host);
    };

    const loading = () => {
        return (
            <EmptyState>
                <EmptyStateIcon variant="icon" icon={Spinner} />
                <Title headingLevel="h2">{_("Loading...")}</Title>
            </EmptyState>
        );
    };

    const serviceProblem = () => {
        // service proxy not ready yet?
        if (!serviceReady) {
            tukitdProxy().wait(() => { setServiceReady(true) });
            return loading();
        }
        if (!tukitdProxy().exists) {
            return (
                <EmptyState>
                    <EmptyStateIcon
                        className="serviceError"
                        variant="icon"
                        icon={ExclamationCircleIcon}
                    />
                    <Title headingLevel="h2" size="md">
                        {_("Transactional update service not installed")}
                    </Title>
                    <EmptyStateBody>
                        {_("Please ensure package tukitd is installed.")}
                    </EmptyStateBody>
                </EmptyState>
            );
        }
        if (tukitdProxy().state !== "running") {
            return (
                <EmptyState>
                    <EmptyStateIcon
                        className="serviceError"
                        variant="icon"
                        icon={ExclamationCircleIcon}
                    />
                    <Title headingLevel="h2" size="md">
                        {_("Transactional update service not running")}
                    </Title>
                    <EmptyStateBody>
                        <Button
                            variant="link"
                            isInline
                            onClick={showServiceDetails}
                        >
                            {_("more details")}
                        </Button>
                    </EmptyStateBody>
                </EmptyState>
            );
        }
        return false;
    };

    const getSnapshots = () => {
        if (!snapshotsDirty) {
            return;
        }
        setSnapshotsDirty(false);

        setSnapshotsWaiting(_("Fetching snapshots..."));
        const proxy = snapshotsProxy();
        proxy.wait(async () => {
            try {
                const snaps = (
                    await proxy.List("number,default,active,date,description")
                ).map((snap: TODO_TYPE) => createSnapshot(snap));
                // remove "current" snapshot
                snaps.shift();
                snaps.sort((a: TODO_TYPE, b: TODO_TYPE) => b.number - a.number);
                // mark old snapshots
                let active: TODO_TYPE | null = null;
                snaps.forEach((s: TODO_TYPE) => {
                    if (active) s.old = true;
                    if (s.active) active = s;
                });
                setSnapshots(snaps);
            } catch (e) {
                // service problems are reported in serviceProblem()
                if (serviceReady && tukitdProxy().state === "running") {
                    alert("ERROR " + e);
                }
            }
            setSnapshotsWaiting(null);
        });
    };

    return (
        <Page>
            <PageSection>
                <h1>Hello from typescript!</h1>
                <Gallery className="ct-cards-grid" hasGutter>
                    <StatusPanel
                        waiting={snapshotsWaiting || updatesWaiting}
                        status={status}
                        setStatus={setStatus}
                        updates={updates}
                        updatesError={updatesError}
                        snapshots={snapshots}
                    />
                    <UpdatesPanel
                        setUpdates={setUpdates}
                        setError={setUpdatesError}
                        dirty={updatesDirty}
                        setDirty={setUpdatesDirty}
                        waiting={updatesWaiting || snapshotsWaiting}
                        setWaiting={setUpdatesWaiting}
                    />
                    <Card>
                        <CardTitle>
                            {_("Snapshots & Updates")}
                            <Button
                                isDisabled={!!snapshotsWaiting || !!updatesWaiting}
                                isSmall
                                variant="plain"
                                onClick={() => { setDirty(true) }}
                            >
                                <RedoIcon />
                            </Button>
                        </CardTitle>
                        <CardBody>
                            {serviceProblem() || (snapshotsWaiting && loading()) || (
                                <DataList isCompact aria-label="data-list">
                                    {updates.length > 0 && (
                                        <UpdatesItem
                                            updates={updates}
                                            setError={setUpdatesError}
                                            setDirty={setDirty}
                                            setWaiting={setUpdatesWaiting}
                                            waiting={
                                                snapshotsWaiting ||
                                                updatesWaiting
                                            }
                                        />
                                    )}
                                    {snapshots.map((item: TODO_TYPE) => (
                                        <SnapshotItem
                                            key={item.number}
                                            item={item}
                                            setDirty={setSnapshotsDirty}
                                            setWaiting={setSnapshotsWaiting}
                                            waiting={
                                                snapshotsWaiting ||
                                                updatesWaiting
                                            }
                                        />
                                    ))}
                                </DataList>
                            )}
                        </CardBody>
                    </Card>
                </Gallery>
            </PageSection>
        </Page>
    );
};

export default Application;
