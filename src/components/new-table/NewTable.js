import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CaretRightOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  FilterFilled,
  FilterOutlined,
  SettingOutlined,
  StarOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Dropdown, Empty, Input, Menu } from 'antd';
import arrayMove from 'array-move';
import classNames from 'classnames';
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { AutoSizer, Column, Table } from 'react-virtualized';
import '../test/node_modules/react-virtualized/styles.css';
// import { getFlightKey } from '../../middleware/FlightMiddleware';
// import { DEFAULT_COLUMN_KEYS } from '../../states/flightList/Constants';
// import { getAllColumnsMatchingId, getAllColumnsMatchingIndex, getColumnTooltip } from '../../utils/FlightListUtils';
// import { extractLinkUrl, getDelayColor, getDelayNumber, LINKS } from '../../utils/FlightUtils';
// import { NOTIFICATION_TYPE } from '../../utils/NotificationUtils';
// import { tagReplacer } from '../../utils/TagReplacer';
// import Bookmark from '../bookmark/Bookmark';
// import { ChevronDown, ChevronRight } from '../Icons';
// import Toggle from '../toggleButton/Toggle';
// import Transfer from './../transfer';
// import FlightListTableAlertsDialog, { getUserAlertMeta } from './alerts/FlightListTableAlertsDialog';
// import {
//   ACCEPTABLE_CLASSNAMES_FOR_FILTER_SORT,
//   ADD_ALERT_LABEL,
//   ADD_FILTER_SORT_LABEL,
//   ADD_REMOVE_COLUMNS_LABEL,
//   ALIGNED_COLUMN_CLASSNAME,
//   CLEAR_FILTERS_AND_SORTS_LABEL,
//   DEFAULT_COLUMNS_WIDTHS,
//   DROPDOWN_CLASSNAME,
//   DROPDOWN_ITEM_CLASSNAME,
//   EMPTY_FLIGHT_LIST_CLASSNAME,
//   EXPAND_COLUMN_KEY,
//   EXTRA_COLUMNS,
//   FILTER_AND_SORT_LABEL,
//   FLIGHT_LIST_TABLE_CLASSNAME,
//   FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS,
//   FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS,
//   HEADER_DROPDOWN_BTN_CLASSNAME,
//   MANAGE_COLUMNS_CLASSNAME,
//   MENU_HIGHLIGHT_CLASSNAME,
//   MENU_SEPARATOR_CLASSNAME,
//   ROW_WITH_SECOND_GLANCE_CLASSNAME,
//   SORT_INDICATOR_CLASSNAME,
//   SUBMENU_HIGHLIGHT_CLASSNAME,
//   SUSPENDED_COLUMN_CLASSNAME,
// } from './Constants';
// import FlightListTableFilterSort from './FlightListTableFilterSort';
// import FlightListTableSecondGlance from './FlightListTableSecondGlance';

export const FlightListTableHeaderHeight = 50;
export const FlightListTableRowHeight = 30;
export const FlightListTableSecondGlanceRowHeight = 200;
export const FlightListTableEmptyTableHeight = 300;
const MANAGE_COLUMNS_WIDTH = 40;

const ALIGNED_COLUMNS = ['adepAt', 'ades', 'mostPenalisingRegulation'];
const SECOND_GLANCE_SUFFIX = '_secondGlance';

const DEFAULT_COLUMNS_WIDTHS = {
  fa: 35,
};

const NewTable = (props, ref) => {
  const ALL_COLUMNS_MATCHING_INDEX = !!props.meta ? getAllColumnsMatchingIndex(props.meta.labels) : {};
  const ALL_COLUMNS_MATCHING_ID = !!props.meta ? getAllColumnsMatchingId(props.meta.labels) : {};
  const tableRef = useRef();
  const [colMngtVisible, setColMngtVisible] = useState(false);
  const [filterSortVisible, setFilterSortVisible] = useState(false);
  const [alertConfigVisible, setAlertConfigVisible] = useState(false);
  const [remarksInputVisibleRowKey, setRemarksInputVisibleRowKey] = useState();
  const defaultColumnsWidths = { ...DEFAULT_COLUMNS_WIDTHS, ...props.expandedColumnsWidths };

  useEffect(() => {
    forceUpdateTable();
  }, [props.expandedRows, !!props.filterSort && props.filterSort.rules]);

  useImperativeHandle(ref, () => ({
    onAutoRefresh: () => {
      tableRef && tableRef.current && tableRef.current.scrollToPosition(0);
    },
  }));

  const LINKS = {
    FLIGHT_TAGS: 'flightTags',
    DETAILS: 'detail',
    FIELDS: 'fields',
    HELP_DESK: 'helpDesk',
    SLOT_SWAP: 'slotSwap',
    MAP: 'map',
  };

  const getAllColumnsMatchingId = (columns) => {
    let allColumnsObject = {};
    !!columns && columns.map((column) => (allColumnsObject[column.key] = column));
    return allColumnsObject;
  };

  const getAllColumnsMatchingIndex = (columns) => {
    let allColumnsObject = {};
    !!columns && columns.map((column) => (allColumnsObject[column.dataIndex] = column));
    return allColumnsObject;
  };

  const isSorted = () => {
    return !!props.filterSort && !!props.filterSort.rules && props.filterSort.rules.length > 0;
  };

  const getDropdownMenuItemContent = (icon, label) => {
    return (
      <div className={'DROPDOWN_ITEM_CLASSNAME'}>
        <span className={'DROPDOWN_ITEM_CLASSNAME-icon'}>{icon}</span>
        <span className={'DROPDOWN_ITEM_CLASSNAME-label'}>{label}</span>
      </div>
    );
  };

  const getDropdownMenuItem = (key, className, icon, label, disabled) => {
    const extraProps = { id: 'flight-list-table-column-menu-dropdown-item-' + key.toLowerCase() };
    return (
      <Menu.Item key={key} className={className} disabled={disabled} {...extraProps}>
        {getDropdownMenuItemContent(icon, label)}
      </Menu.Item>
    );
  };

  const FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS = {
    SORT_DESC: 'sortDescending',
    SORT_ASC: 'sortAcending',
    CLEAR_SORT: 'cleraSort',
    ADD_FILTER: 'addFilter',
    ADD_ALERT: 'addAlert',
  };

  const FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS = {
    ADD_REMOVE_COLS: 'addRemoveCols',
    CLEAR_ALL_SORTING: 'clearAllSorting',
    FILTER_AND_SORT: 'filterAndSort',
    ALERT_CONFIG: 'alertConfig',
  };

  const getDropdownSubMenu = (ascending, label, sorts, icon, columnSort) => {
    const key = ascending ? FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_ASC : FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_DESC;
    const isSortOrderSame = ascending ? columnSort.ascending : columnSort.ascending !== undefined ? !columnSort.ascending : undefined;
    const subSortIndex = isSortOrderSame && columnSort.existing ? sorts.findIndex((sort) => sort === columnSort.subSort) : -1;
    return (
      <Menu.SubMenu
        key={key}
        title={getDropdownMenuItemContent(icon, label)}
        className={classNames({ ['SUBMENU_HIGHLIGHT_CLASSNAME']: subSortIndex !== -1 })}
        popupClassName={classNames({ ['SUBMENU_HIGHLIGHT_CLASSNAME']: subSortIndex !== -1 })}
      >
        {sorts.map((sort, index) => (
          <Menu.Item key={key + '-' + sort} id={key + '-' + sort} className={classNames({ ['MENU_HIGHLIGHT_CLASSNAME']: subSortIndex === index })}>
            {sort}
          </Menu.Item>
        ))}
      </Menu.SubMenu>
    );
  };

  const getDropdownMenu = (colId, sorted) => {
    const isDescending = sorted.ascending !== undefined ? sorted.existing && !sorted.ascending : undefined;
    const isAscending = sorted.existing && sorted.ascending;
    const sortingOrdinate = ' (' + (sorted.sortIndex + 1) + ')';
    const descendingLabel = 'Sort descending' + (isDescending ? sortingOrdinate : '');
    const ascendingLabel = 'Sort ascending' + (isAscending ? sortingOrdinate : '');
    const extraProps = { id: 'flight-list-column-header-menu-' + colId };
    return (
      <Menu
        {...extraProps}
        onClick={(event) =>
          onHeaderDropdownClick(event, colId, {
            isDescending,
            isAscending,
          })
        }
        className={'DROPDOWN_CLASSNAME'}
      >
        {!!props.meta && !!props.meta.patterns[colId]
          ? getDropdownSubMenu(true, ascendingLabel, Object.keys(props.meta.patterns[colId].sorts), <ArrowUpOutlined />, sorted)
          : getDropdownMenuItem(
              FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_ASC,
              classNames({ ['MENU_HIGHLIGHT_CLASSNAME']: isAscending }),
              <ArrowUpOutlined />,
              ascendingLabel,
              false
            )}
        {!!props.meta && !!props.meta.patterns[colId]
          ? getDropdownSubMenu(false, descendingLabel, Object.keys(props.meta.patterns[colId].sorts), <ArrowDownOutlined />, sorted)
          : getDropdownMenuItem(
              FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_DESC,
              classNames({ ['MENU_HIGHLIGHT_CLASSNAME']: isDescending }),
              <ArrowDownOutlined />,
              descendingLabel,
              false
            )}
        {getDropdownMenuItem(
          FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.CLEAR_SORT,
          'MENU_SEPARATOR_CLASSNAME',
          undefined,
          'CLEAR_FILTERS_AND_SORTS_LABEL',
          !sorted.existing
        )}
        {getDropdownMenuItem(FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.ADD_FILTER, undefined, <FilterOutlined />, 'ADD_FILTER_SORT_LABEL', false)}
        {getDropdownMenuItem(FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.ADD_ALERT, undefined, <ExclamationCircleOutlined />, 'ADD_ALERT_LABEL', false)}
      </Menu>
    );
  };

  const onHeaderDropdownClick = (event, colId, status) => {
    switch (event.key) {
      case FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_DESC:
        !status.isDescending &&
          !!props.filterSortColumns &&
          props.filterSortColumns(
            [
              {
                colId: colId,
                ascending: false,
              },
            ],
            ALL_COLUMNS_MATCHING_INDEX,
            ALL_COLUMNS_MATCHING_ID,
            true
          );
        break;

      case FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_ASC:
        !status.isAscending &&
          !!props.filterSortColumns &&
          props.filterSortColumns(
            [
              {
                colId: colId,
                ascending: true,
              },
            ],
            ALL_COLUMNS_MATCHING_INDEX,
            ALL_COLUMNS_MATCHING_ID,
            true
          );
        break;

      case FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.CLEAR_SORT:
        !!props.clearSort && props.clearSort();
        break;

      case FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.ADD_FILTER:
        setFilterSortVisible(true);
        break;

      case FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.ADD_ALERT:
        setAlertConfigVisible(true);
        break;

      default:
        if (!!props.meta && !!props.meta.patterns[colId]) {
          if (event.key.startsWith(FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_ASC)) {
            onHeaderSubSortClicked(event.key, true, colId, status);
          } else {
            onHeaderSubSortClicked(event.key, false, colId, status);
          }
        }
    }
  };

  const onHeaderSubSortClicked = (key, ascending, colId, status) => {
    const replaceKey = ascending ? FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_ASC : FLIGHT_LIST_TABLE_HEADER_DROPDOWN_KEYS.SORT_DESC;
    const clickedSubSort = key.replace(replaceKey + '-', '');
    const result = findSort(props.filterSort.rules, colId);
    const currentSubSort = !!result ? result.subSort : undefined;
    const isSameSortClicked = ascending ? status.isAscending : status.isDescending;
    if (!isSameSortClicked || clickedSubSort !== currentSubSort) {
      props.filterSortColumns &&
        props.filterSortColumns(
          [
            {
              colId: colId,
              ascending,
              subSort: clickedSubSort,
            },
          ],
          ALL_COLUMNS_MATCHING_INDEX,
          ALL_COLUMNS_MATCHING_ID,
          true
        );
    }
  };

  const SortableHeader = SortableElement(({ children, ...headerProps }) => {
    const header = children.props.children[0];
    const tooltip = !!ALL_COLUMNS_MATCHING_INDEX[children.props.id] ? ALL_COLUMNS_MATCHING_INDEX[children.props.id].tooltip : undefined;

    let headerClone = React.cloneElement(header, {
      ...header.props,
      title: tooltip,
    });

    if (children.props.id === 'bookmark') {
      headerClone = React.cloneElement(header, { ...header.props, title: tooltip }, [<StarOutlined key={'star'} style={{ color: 'black' }} />]);
    }

    if (children.props.id === 'markAsSeen') {
      headerClone = React.cloneElement(header, { ...header.props, title: undefined }, [<CheckCircleFilled key="markAsSeen" />]);
    }

    const result = findSort(props.filterSort.rules, children.props.id);
    const sortIndicator = result.existing && (
      <span key="sortIndicator" className={'SORT_INDICATOR_CLASSNAME'}>
        {props.enableColumnConfig && result.filter && result.filterValue && (
          <FilterFilled id={props.id + '-' + children.props.id + '-header-filter'} />
        )}
        {result.ascending !== undefined && [
          result.ascending ? (
            <ArrowUpOutlined id={props.id + '-' + children.props.id + '-header-asc'} key="arrow" />
          ) : (
            <ArrowDownOutlined id={props.id + '-' + children.props.id + '-header-desc'} key="arrow" />
          ),
          <span id={props.id + '-' + children.props.id + '-header-ordinate'} key="ordinate">
            {result.sortIndex + 1}
          </span>,
        ]}
      </span>
    );

    const dropdown = (
      <Dropdown overlay={getDropdownMenu(children.props.id, result)} key="dropdown" trigger={['click']}>
        <CaretRightOutlined className={'HEADER_DROPDOWN_BTN_CLASSNAME'} />
      </Dropdown>
    );
    return React.cloneElement(children, headerProps, [headerClone, dropdown, sortIndicator]);
  });

  const SortableHeaderRowRenderer = SortableContainer(({ className, columns, style }) => {
    delete style.paddingRight;
    const innerStyle = { ...style };
    innerStyle.display = 'flex';
    innerStyle.width = style.width - MANAGE_COLUMNS_WIDTH;
    const menu = (
      <Menu onClick={onManageColumnsClick} className={'DROPDOWN_CLASSNAME'}>
        {getDropdownMenuItem(FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.ADD_REMOVE_COLS, undefined, <TableOutlined />, 'ADD_REMOVE_COLUMNS_LABEL', false)}
        {getDropdownMenuItem(FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.FILTER_AND_SORT, undefined, <FilterOutlined />, 'FILTER_AND_SORT_LABEL', false)}
        {getDropdownMenuItem(
          FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.CLEAR_ALL_SORTING,
          undefined,
          undefined,
          'CLEAR_FILTERS_AND_SORTS_LABEL',
          !isSorted()
        )}
        {getDropdownMenuItem(FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.ALERT_CONFIG, undefined, <ExclamationCircleOutlined />, 'ADD_ALERT_LABEL', false)}
      </Menu>
    );
    return (
      <div className={className} role="row" style={style}>
        <div style={innerStyle}>
          {React.Children.map(columns, (column, index) => {
            if (column.props.id === 'EXPAND_COLUMN_KEY') {
              return React.cloneElement(column, { className: 'EXPAND_COLUMN_KEY' + '-header' });
            }
            return (
              <React.Fragment key={column.key}>
                <SortableHeader index={index}>{column}</SortableHeader>
                <Draggable
                  axis="x"
                  defaultClassName="DragHandle"
                  defaultClassNameDragging="DragHandleActive"
                  onStop={(event, { x }) => resizeColumn(column, x)}
                  position={{ x: 0, y: 0 }}
                  zIndex={999}
                >
                  <span className="DragHandleIcon">⋮</span>
                </Draggable>
              </React.Fragment>
            );
          })}
        </div>
        {props.enableColumnConfig && (
          <div className={'MANAGE_COLUMNS_CLASSNAME'} style={{ width: MANAGE_COLUMNS_WIDTH }}>
            <Dropdown overlay={menu} key="dropdown" trigger={['click']}>
              <SettingOutlined />
            </Dropdown>
          </div>
        )}
      </div>
    );
  });

  const resizeColumn = (column, x) => {
    const dataKey = ALL_COLUMNS_MATCHING_INDEX[column.props.id].key;
    const newValue = defaultColumnsWidths[dataKey] + x;

    props.onResizeColumn(dataKey, newValue < 0 ? defaultColumnsWidths[dataKey] : newValue);
  };

  const onManageColumnsClick = (event) => {
    switch (event.key) {
      case FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.ADD_REMOVE_COLS:
        setColMngtVisible(true);
        break;

      case FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.FILTER_AND_SORT:
        setFilterSortVisible(true);
        break;

      case FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.CLEAR_ALL_SORTING:
        !!props.clearSort && props.clearSort();
        break;

      case FLIGHT_LIST_TABLE_COLUMNS_MGMT_KEYS.ALERT_CONFIG:
        setAlertConfigVisible(true);
        break;

      default:
        break;
    }
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    // !!props.reorderColumns && props.reorderColumns(arrayMove(props.columns, oldIndex - EXTRA_COLUMNS.length, newIndex - EXTRA_COLUMNS.length));
  };

  const renderHeaderRow = (params) => {
    return <SortableHeaderRowRenderer {...params} axis="x" lockAxis="x" onSortEnd={onSortEnd} pressDelay={200} />;
  };

  const extractLinkUrl = (type, links) => {
    return Array.isArray(links) ? links.reduce((result, link) => (link.name === type ? link.details : result), undefined) : undefined;
  };

  const onRowClick = (rowId, flight) => {
    let newExpandedRows = props.expandedRows.slice(0);
    if (newExpandedRows.includes(rowId)) {
      newExpandedRows = newExpandedRows.filter((rowIndex) => rowIndex !== rowId);
    } else {
      const maxOpenSecondGlances = props.maxOpenSecondGlances || 5;
      if (newExpandedRows.length >= maxOpenSecondGlances) {
        props.displayNotification(
          'NOTIFICATION_TYPE.WARNING',
          'Maximum reached',
          'Please close one second glance before opening a new one. Maximum ' + maxOpenSecondGlances + ' can be open.'
        );
        return;
      }
      newExpandedRows.push(rowId);
    }

    if (newExpandedRows.includes(rowId) && props.fetchHeavyFields && !getRouteFromCache(flight)) {
      const fetchUrl = extractLinkUrl('LINKS.FIELDS', flight.links);
      !!fetchUrl && props.fetchHeavyFields(fetchUrl);
    }

    props.onRowExpand && props.onRowExpand(newExpandedRows);
  };

  const onHeaderColumnClick = (data) => {
    const colId = data.dataKey;
    if (colId === 'EXPAND_COLUMN_KEY') {
      return;
    } // Disable sorting
    const result = findSort(props.filterSort.rules, colId);
    if (!result.existing && !!props.meta.patterns[colId]) {
      result.subSort = findDefaultSubSort(colId);
    }
    const newSort = { colId, ...result };
    newSort.ascending = newSort.ascending === undefined ? true : !newSort.ascending;
    // ACCEPTABLE_CLASSNAMES_FOR_FILTER_SORT.includes(data.event.target.className) &&
    //   props.filterSortColumns &&
    //   props.filterSortColumns([newSort], ALL_COLUMNS_MATCHING_INDEX, ALL_COLUMNS_MATCHING_ID, true);
  };

  const onMultipleFilterSortApply = (rules) => {
    props.filterSortColumns && props.filterSortColumns(rules, ALL_COLUMNS_MATCHING_INDEX, ALL_COLUMNS_MATCHING_ID, false);
    setFilterSortVisible(false);
  };

  const findDefaultSubSort = (colId) => {
    const defaultSort = Object.entries(props.meta.patterns[colId].sorts).find((entry) => !!entry[1].defaultSort);
    return !!defaultSort ? defaultSort[0] : '';
  };

  const columnCellDataGetter = ({ columnData, dataKey, rowData }) => {
    return rowData[dataKey];
  };

  const forceUpdateTable = () => {
    // Clear cached size
    tableRef && tableRef.current && tableRef.current.recomputeRowHeights();
    // Rerender list with new size
    tableRef && tableRef.current && tableRef.current.forceUpdateGrid();
  };

  const onRemarksColumnClick = (event, rowKey) => {
    event.stopPropagation();
    setRemarksInputVisibleRowKey(rowKey);
  };

  const onUpdateRemarks = (link) => (event) => {
    const value = !!event.target ? event.target.value : '';
    props.onUpdateRemarks(value, link);
    setRemarksInputVisibleRowKey(undefined);
  };

  const onMarkAsSeenClick = (link, value, delay) => {
    props.handleMarkAsSeen(link, value, getThresholdsFromDelay(delay));
  };

  const getThresholdsFromDelay = (delay) => {
    let result = {};
    if (+delay >= 10) {
      result.maxDelay = +delay + 20;
      result.minDelay = +delay - 10;
    } else {
      result.maxDelay = 20;
      result.minDelay = 0;
    }
    return result;
  };

  const getCtotColor = (highlights, rowData) => {
    if (highlights.slotAllocation && highlights.slotAllocation.aircraftIds.includes(rowData.key)) {
      return highlights.slotAllocation.color;
    }

    if (highlights.delayChange && highlights.delayChange.aircraftIds.includes(rowData.key)) {
      // return !!rowData.delay ? getDelayColor(getDelayNumber(rowData.delay)) : undefined;
    }

    if (highlights.regulationLifted && highlights.regulationLifted.aircraftIds.includes(rowData.key)) {
      return highlights.regulationLifted.color;
    }

    return undefined;
  };

  const renderRow = ({ className, columns, index, key, onColumnClick, onRowClick, rowData, style }, highlights) => {
    if (rowData.key === 'empty') {
      return (
        <div className={classNames(className, 'EMPTY_FLIGHT_LIST_CLASSNAME')} key="empty-flight-list" style={style}>
          <Empty description="Empty flight list" />
        </div>
      );
    } else {
      if (rowData.mainRow) {
        const suspended = highlights.suspended && highlights.suspended.aircraftIds.includes(rowData.key);
        const delayColor = getCtotColor(highlights, rowData);
        const alertColumnKeys = Object.keys({});
        let isRowHighlightedByAlert = false;

        const updatedColumns = columns.map((column) => {
          const columnId = column.props['aria-describedby'];
          const columnClassName = column.props['className'];
          const columnStyle = column.props['style'];
          const columnValue = column.props['children'];

          // if (columnId === EXPAND_COLUMN_KEY) {
          //   return React.cloneElement(
          //     column,
          //     {
          //       onClick: () => onRowClick(rowData.key, rowData),
          //       className: columnClassName + ' ' + EXPAND_COLUMN_KEY,
          //     },
          //     [rowData.hasSecondGlanceOpen ? <ChevronDown key={rowData.key} /> : <ChevronRight key={rowData.key} />]
          //   );
          // }

          // if (columnId === 'bookmark') {
          //   return React.cloneElement(column, { className: columnClassName + ' ' + ALIGNED_COLUMN_CLASSNAME }, [
          //     <div key={rowData.key}>
          //       <Bookmark
          //         rowKey={rowData.key}
          //         starColor={rowData.bm}
          //         links={extractLinkUrl(LINKS.FLIGHT_TAGS, rowData.links)}
          //         onBookmarkUpdated={props.onBookmarkUpdated}
          //         readOnly={rowData.readOnly}
          //       />
          //     </div>,
          //   ]);
          // }

          if (columnId === 'lv') {
            return React.cloneElement(column, { className: columnClassName + ' ' + 'ALIGNED_COLUMN_CLASSNAME' }, [
              <div key={rowData.key} title={rowData.lv}>
                {rowData.eobtValidity}
              </div>,
            ]);
          }

          if (ALIGNED_COLUMNS.includes(columnId)) {
            return React.cloneElement(
              column,
              { className: columnClassName + ' ' + 'ALIGNED_COLUMN_CLASSNAME' + ' ' + 'ALIGNED_COLUMN_CLASSNAME' + '-' + columnId },
              [<span key={columnId}>{columnValue}</span>]
            );
          }

          // if (columnId === 'aircraftId') {
          //   return React.cloneElement(
          //     column,
          //     {
          //       className: columnClassName + ' ' + 'ALIGNED_COLUMN_CLASSNAME' + ' ' + 'ALIGNED_COLUMN_CLASSNAME' + '-' + columnId,
          //       title: undefined,
          //     },
          //     [tagReplacer(columnValue, column, undefined, true, true)]
          //   );
          // }

          // if (columnId === 'attot' || alertColumnKeys.includes(columnId)) {
          //   return tagReplacer(columnValue, column, (hlRow) => {
          //     isRowHighlightedByAlert = hlRow;
          //   });
          // }

          if (columnId === 'delay' && delayColor) {
            return React.cloneElement(
              column,
              {
                style: {
                  ...columnStyle,
                  backgroundColor: delayColor.replace('ALPHA', 0.3),
                },
                className: columnClassName + ' flight-list-column-' + columnId,
              },
              [
                <span key="full-color" style={{ backgroundColor: delayColor.replace('ALPHA', 1) }} className="flight-list-column-delay-full-color" />,
                <span key={rowData.tactId}>{rowData.delay}</span>,
              ]
            );
          }

          if (columnId === 'remarks') {
            return React.cloneElement(
              column,
              {
                onClick: (e) => !rowData.readOnly && onRemarksColumnClick(e, rowData.key),
              },
              [
                remarksInputVisibleRowKey === rowData.key ? (
                  <Input
                    onPressEnter={onUpdateRemarks(extractLinkUrl(LINKS.FLIGHT_TAGS, rowData.links))}
                    onBlur={onUpdateRemarks(extractLinkUrl(LINKS.FLIGHT_TAGS, rowData.links))}
                    id={columnId + '-input'}
                    ref={(remarksInputRef) => !!remarksInputRef && remarksInputRef.focus()}
                    className={'flight-list-remarks-column-input'}
                    maxLength={25}
                    defaultValue={rowData.rm}
                    key={columnId + '-input'}
                  />
                ) : (
                  rowData.rm
                ),
              ]
            );
          }

          // if (columnId === 'markAsSeen') {
          //   return React.cloneElement(column, { className: columnClassName + ' ' + ALIGNED_COLUMN_CLASSNAME }, [
          //     <div key={rowData.key}>
          //       <Toggle
          //         value={rowData.markAsSeen === undefined ? undefined : !rowData.markAsSeen}
          //         disabled={rowData.readOnly}
          //         onToggle={(toggleValue) => onMarkAsSeenClick(extractLinkUrl(LINKS.FLIGHT_TAGS, rowData.links), toggleValue, rowData.delay)}
          //         key={columnId}
          //       />
          //     </div>,
          //   ]);
          // }

          // if (columnId === 'turn') {
          //   const columnTooltipIndex = !!rowData.turn ? (rowData.turn.charAt(0) === 'T' ? 0 : rowData.turn.charAt(0) === 't' ? 1 : -1) : -1;
          //   const columnTooltip =
          //     columnTooltipIndex !== -1 && !!props.meta ? getColumnTooltip(props.meta.labels, columnId, columnTooltipIndex) : column.props.title;
          //   return React.cloneElement(column, { title: columnTooltip });
          // }

          return column;
        });

        style.width = parseInt(style.width, 10) - MANAGE_COLUMNS_WIDTH + 'px';
        suspended && !isRowHighlightedByAlert && (style.borderRadius = '20px');

        if (rowData.hasSecondGlanceOpen) {
          style.boxShadow = '0px -5px 6px -5px #424242';
        }

        return (
          <div
            key={key}
            className={classNames(className, {
              ['SUSPENDED_COLUMN_CLASSNAME']: suspended,
              ['ROW_WITH_SECOND_GLANCE_CLASSNAME']: rowData.mainRowWithSecondGlanceOpen,
            })}
            style={{
              ...style,
              paddingRight: 0,
              backgroundColor: suspended ? highlights.suspended.color : 'initial',
            }}
          >
            {updatedColumns}
          </div>
        );
      } else {
        style.boxShadow = '0px 11px 10px -11px #424242';
        style.width = parseInt(style.width, 10) - MANAGE_COLUMNS_WIDTH + 'px';
        return (
          <div style={style} key={key} className={classNames(className, 'flight-list-2nd-glance-row')}>
            <span>Second Glance</span>
            {/* <FlightListTableSecondGlance
              id={rowData.key}
              key={rowData.key}
              flight={rowData.flight}
              heavyFields={getRouteFromCache(rowData.flight)}
              triggerSlotSwapAction={props.triggerSlotSwapAction}
              actionTriggered={props.actionTriggered}
              onMessageSent={props.onMessageSent}
              messageActions={props.messageActions}
            /> */}
          </div>
        );
      }
    }
  };

  const getRouteFromCache = (flight) => {
    // const heavyFieldId = getFlightKey(flight);
    // return props.routeCache && props.routeCache[heavyFieldId];
  };

  const getRow = (index, rows) => {
    return rows[index];
  };

  const getRowHeight = (index, rows) => {
    return rows[index] && rows[index].key === 'empty'
      ? FlightListTableEmptyTableHeight
      : rows[index].mainRow
      ? FlightListTableRowHeight
      : FlightListTableSecondGlanceRowHeight;
  };

  const getFlights = () => {
    return !!props.filterSort && !!props.filterSort.rules && props.filterSort.rules.length > 0 ? props.sortedFlights : props.flights;
  };

  const isEmptyTable = () => {
    return !getFlights() || getFlights().length === 0;
  };

  const tableExtraProps = {};
  const updatedRows = [];
  if (isEmptyTable()) {
    updatedRows.push({
      key: 'empty',
    });
  } else {
    !!props.filterSortColumns && (tableExtraProps.onHeaderClick = onHeaderColumnClick);
    getFlights().forEach((flight, index) => {
      const flightKey = index;
      const flightWithSecondGlance = props.expandedRows.includes(flightKey);
      const mainRow = {
        key: flightKey,
        expanded: false,
        mainRow: true,
        mainRowWithSecondGlanceOpen: flightWithSecondGlance,
        sourceIndex: index,
        ...flight,
      };
      updatedRows.push(mainRow);

      if (flightWithSecondGlance) {
        const secondGlanceRow = {
          key: flightKey + SECOND_GLANCE_SUFFIX,
          sourceIndex: index,
          mainRow: false,
          flight: flight,
        };
        mainRow.hasSecondGlanceOpen = true;
        updatedRows.push(secondGlanceRow);
      }
    });
  }

  const findSort = (rules, colId) => {
    const sortIndex = rules.filter((sort) => sort.ascending !== undefined).findIndex((sort) => sort.colId === colId);
    const result = rules.find((sort) => sort.colId === colId);
    return {
      existing: !!result,
      sortIndex,
      ascending: !!result ? result.ascending : undefined,
      subSort: !!result ? result.subSort : undefined,
      filter: !!result ? result.filter : undefined,
      filterValue: !!result ? result.filterValue : undefined,
    };
  };

  const highlightAircraftKeys = {};
  props.highlight &&
    Object.keys(props.highlight).forEach((key) => {
      highlightAircraftKeys[key] = {
        color: props.highlight[key].color,
        // aircraftIds: props.highlight[key].flights.map((flight) => getFlightKey(flight)),
      };
    });
  const allColumns = props.meta && props.meta.labels ? props.meta.labels.sort((a, b) => !!a.title && a.title.localeCompare(b.title)) : [];
  const renderedColumnKeys = !!props.columns ? props.columns.map((column) => column.key) : [];
  const totalColumnWidth = !!props.columns ? props.columns.reduce((total, column) => total + defaultColumnsWidths[column.key], 0) : 0;
  const sortedFilteredColumnIds = !!props.filterSort && Array.isArray(props.filterSort.rules) ? props.filterSort.rules.map((rule) => rule.colId) : [];
  const columnsToDisplay = !!props.columns ? 'EXTRA_COLUMNS'.concat(props.columns) : [];
  return (
    <React.Fragment>
      <AutoSizer>
        {({ height, width }) => {
          const accordionWidth = width || 1200;
          const accordionHeight = height || 800;
          return (
            <Table
              id={props.id}
              ref={tableRef}
              width={totalColumnWidth > accordionWidth ? totalColumnWidth : accordionWidth}
              height={accordionHeight}
              headerHeight={FlightListTableHeaderHeight}
              rowHeight={({ index }) => getRowHeight(index, updatedRows)}
              rowCount={updatedRows.length}
              rowGetter={({ index }) => getRow(index, updatedRows)}
              headerRowRenderer={props.meta && renderHeaderRow}
              rowRenderer={(data) => renderRow(data, highlightAircraftKeys)}
              onRowClick={onRowClick}
              className={'FLIGHT_LIST_TABLE_CLASSNAME'}
              {...tableExtraProps}
            >
              {props.meta &&
                !!columnsToDisplay &&
                columnsToDisplay.map((column) => {
                  const columnExtraProps = {};
                  if (accordionWidth - totalColumnWidth > 800) {
                    columnExtraProps.maxWidth = defaultColumnsWidths[column.key] + 20;
                  }
                  return (
                    <Column
                      id={column.dataIndex}
                      key={column.dataIndex}
                      label={column.title}
                      dataKey={column.dataIndex}
                      width={
                        sortedFilteredColumnIds.includes(column.dataIndex) && accordionWidth - totalColumnWidth < 500
                          ? defaultColumnsWidths[column.key] + 30
                          : defaultColumnsWidths[column.key]
                      }
                      cellDataGetter={columnCellDataGetter}
                      flexGrow={1}
                      {...columnExtraProps}
                    />
                  );
                })}
            </Table>
          );
        }}
      </AutoSizer>
      {/* <Transfer
        id={props.id + '-manage-columns'}
        visible={colMngtVisible}
        dataSource={allColumns}
        // defaultKeys={DEFAULT_COLUMN_KEYS}
        targetKeys={renderedColumnKeys}
        headerTitle={'ADD_REMOVE_COLUMNS_LABEL'}
        selectionTitles={['Available', 'Rendering']}
        onOk={(colKeys) => {
          props.manageColumns &&
            props.manageColumns(colKeys, {
              allColumnsMatchingIndex: ALL_COLUMNS_MATCHING_INDEX,
              allColumnsMatchingId: ALL_COLUMNS_MATCHING_ID,
            });
          setColMngtVisible(false);
        }}
        onCancel={() => setColMngtVisible(false)}
        operations={['Add', 'Remove']}
      /> */}
      {/* 
      <FlightListTableFilterSort
        id={props.id + '-filter-sort'}
        headerTitle={FILTER_AND_SORT_LABEL}
        visible={filterSortVisible}
        dataSource={props.filterSort.rules}
        availableColumns={props.columns}
        meta={props.meta}
        onOk={onMultipleFilterSortApply}
        onCancel={() => setFilterSortVisible(false)}
      /> */}

      {/* <FlightListTableAlertsDialog
        id={props.id + '-alert-config'}
        headerTitle="Customise alerts"
        visible={alertConfigVisible}
        dataSource={props.alertConfigData}
        meta={props.meta}
        onOk={(data) => {
          props.onAlertConfigApply(data);
          setAlertConfigVisible(false);
        }}
        onCancel={() => setAlertConfigVisible(false)}
      /> */}
    </React.Fragment>
  );
};

export default forwardRef(NewTable);
