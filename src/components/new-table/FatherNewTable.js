import faker from 'faker';
import React from 'react';
import NewTable from './NewTable';

function FatherNewTable() {
  const props = {};

  const fetchRowInfo = () =>
    new Array(1000).fill(true).map(() => ({
      id: faker.random.uuid(),
      name: faker.name.findName(),
      email: faker.internet.email(),
      location: faker.address.city(),
    }));
  return (
    <NewTable
      id="flight-list-table-focus"
      flights={fetchRowInfo()}
      //  highlight={highlightForFocusList} ref={focusFlightListRef}
      columns={props.columns}
      // reorderColumns={(columns) => props.reorderColumns(columns, defaultColumnsOrder)}
      enableColumnConfig={false}
      fetchHeavyFields={props.fetchHeavyFields}
      routeCache={props.routeCache}
      expandedRows={props.expandedRows.focus}
      onRowExpand={(expandedRows) => props.onTableRowExpand(expandedRows, true)}
      displayNotification={(type, title, message) => props.displayNotification(type, title + ' on Filtered Flight List', message)}
      filterSortColumns={props.filterSortColumns}
      filterSort={props.filterSort}
      sortedFlights={props.filterSort.focusFlights}
      meta={props.meta}
      clearSort={props.clearSort}
      // manageColumns={(colKeys) =>
      //   props.manageColumns(colKeys, defaultColumnsOrder, {
      //     allColumnsMatchingIndex: ALL_COLUMNS_MATCHING_INDEX,
      //     allColumnsMatchingId: ALL_COLUMNS_MATCHING_ID,
      //   })
      // }
      actionTriggered={props.actionTriggered}
      triggerSlotSwapAction={props.triggerSlotSwapAction}
      onResizeColumn={props.onResizeColumn}
      expandedColumnsWidths={props.expandedColumnsWidths}
      alertConfigData={props.alertConfigData}
      onAlertConfigApply={props.onAlertConfigApply}
      onBookmarkUpdated={props.onBookmarkUpdated}
      handleMarkAsSeen={props.handleMarkAsSeen}
      onUpdateRemarks={props.onUpdateRemarks}
      onMessageSent={props.onMessageSent}
      messageActions={props.messageActions}
    />
  );
}

export default FatherNewTable;
