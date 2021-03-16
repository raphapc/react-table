import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CaretRightOutlined,
  CheckCircleFilled,
  FilterFilled,
  FilterOutlined,
  SettingOutlined,
  StarOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Dropdown, Menu } from 'antd';
import arrayMove from 'array-move';
import classNames from 'classnames';
import _ from 'lodash';
import { Children, cloneElement, Fragment, React, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { FaArrowsAltH, FaFilter } from 'react-icons/fa';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { AutoSizer, Column, SortDirection, SortIndicator, Table } from 'react-virtualized';
import './MyTable.css';

const getHeadersFrom = (list, totalWidth) => {
  const headers = Object.keys(list);
  const defaultWidth = totalWidth / headers.length;
  return headers.map((key) => {
    return { name: key, width: defaultWidth };
  });
};

const DEFAULT_COLUMNS_WIDTHS = {
  name: 35,
};
const MANAGE_COLUMNS_WIDTH = 40;

function MyTableMerge({
  // rows,
  width,
  height,
  id,
  tableRef,
  clearSort,
  onResizeColumn,
  meta,
  expandedColumnsWidths,
  enableColumnConfig,
  filterSortColumns,
  reorderColumns,
  columns,
}) {
  const [sortedDirection, setSortedDirection] = useState(SortDirection.ASC);
  // const [sortedList, setSortedList] = useState(_.cloneDeep(rows));
  const [headers, setHeaders] = useState();
  const [sortedBy, setSortedBy] = useState('');

  const [updatedRows, setUpdatedRows] = useState(columns);
  const [colMngtVisible, setColMngtVisible] = useState(false);
  const [filterSortVisible, setFilterSortVisible] = useState(false);

  const ALL_COLUMNS_MATCHING_INDEX = !!meta ? getAllColumnsMatchingIndex(meta.labels) : {};
  const ALL_COLUMNS_MATCHING_ID = !!meta ? getAllColumnsMatchingId(meta.labels) : {};

  const defaultColumnsWidths = { ...DEFAULT_COLUMNS_WIDTHS, ...expandedColumnsWidths };

  const filterSort = {
    rules: [
      {
        colId: '',
        ascending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
    ],
  };

  useEffect(() => {
    forceUpdateTable();
  }, [!!filterSort && filterSort.rules]);

  const forceUpdateTable = () => {
    // Clear cached size
    tableRef && tableRef.current && tableRef.current.recomputeRowHeights();
    // Rerender list with new size
    tableRef && tableRef.current && tableRef.current.forceUpdateGrid();
  };
  useEffect(() => {
    setHeaders(getHeadersFrom(columns[0], width));
  }, [columns, width]);

  // const _sort = ({ sortBy, sortDirection }) => {
  //   setSortedBy(sortBy);
  //   setSortedDirection(sortDirection);
  //   setSortedList(_sortList(sortBy, sortDirection));
  // };

  // const _sortList = (sortBy, sortDirection) => {
  //   let newList = _.sortBy(sortedList, [sortBy]);
  //   if (sortDirection === SortDirection.DESC) {
  //     newList.reverse();
  //   }
  //   return newList;
  // };

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

  const _resizeRow = (dataKey, deltaX) => {
    setHeaders((prevHeaders) => {
      console.log('setHeaders');
      let novoHeaders = _.cloneDeep(prevHeaders);
      return novoHeaders.map((header, index) => {
        if (header.name === dataKey) {
          const nextHeader = novoHeaders[index + 1];
          header.name = dataKey;
          header.width = header.width + deltaX;
          if (nextHeader) {
            nextHeader.width = nextHeader.width - deltaX;
          }
        }
        return header;
      });
    });
  };

  const handleFilterClick = () => {
    console.log('click');
  };

  const headerRenderer = ({ columnData, dataKey, disableSort, label, sortBy, sortDirection }) => {
    const showSortIndicator = sortedBy.includes(dataKey);
    return (
      <Fragment key={dataKey}>
        <div className="header-label">{label}</div>
        {showSortIndicator && <SortIndicator className="sort-icon" sortDirection={sortedDirection} />}
        {/* <FaFilter className="icon" onClick={handleFilterClick} /> */}
        <SortableHeader index={label}>{label}</SortableHeader>
        <Draggable
          axis="x"
          defaultClassName="DragHandle"
          defaultClassNameDragging="DragHandleActive"
          grid={[25, 25]}
          onDrag={(_, { deltaX }) => {
            _resizeRow(dataKey, deltaX);
          }}
          position={{ x: 0 }}

          // zIndex={999}
        >
          {/* <span className="drag-handle-icon">||</span> */}
          <FaArrowsAltH className="icon drag-handle-icon" />
        </Draggable>
      </Fragment>
    );
  };

  const onManageColumnsClick = (event) => {
    switch (event.key) {
      case 'addRemoveCols': {
        setColMngtVisible(true);
        break;
      }
      case 'filterSort': {
        setFilterSortVisible(true);
        break;
      }
      case 'clearSort': {
        !!clearSort && clearSort();
        break;
      }
      default:
        break;
    }
  };

  const isSorted = () => {
    return !!filterSort && !!filterSort.rules && filterSort.rules.length > 0;
  };

  const getDropdownMenuItemContent = (icon, label) => {
    return (
      <div className={'DROPDOWN_ITEM_CLASSNAME'}>
        <span className={'DROPDOWN_ITEM_CLASSNAME-icon'}>{icon}</span>
        <span className={'DROPDOWN_ITEM_CLASSNAME-label'}>{label}</span>
      </div>
    );
  };

  const getDropdownMenuItem = ({ key, className, icon, label, disabled = false }) => {
    const extraProps = { id: 'flight-list-table-column-menu-dropdown-item-' + key.toLowerCase() };
    return (
      <Menu.Item key={key} className={className} disabled={disabled} {...extraProps}>
        {getDropdownMenuItemContent(icon, label)}
      </Menu.Item>
    );
  };

  const resizeColumn = (column, x) => {
    const dataKey = column.props.id;
    const newValue = defaultColumnsWidths[dataKey] + x;

    onResizeColumn(dataKey, newValue < 0 ? defaultColumnsWidths[dataKey] : newValue);
  };

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

  const onHeaderDropdownClick = (event, colId, status) => {
    switch (event.key) {
      case 'sortDescending':
        !status.isDescending &&
          !!filterSortColumns &&
          filterSortColumns(
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

      case 'sortAscending': {
        !status.isAscending &&
          !!filterSortColumns &&
          filterSortColumns(
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
      }

      case 'clearSort': {
        !!clearSort && clearSort();
        break;
      }

      case 'addFilter': {
        setFilterSortVisible(true);
        break;
      }

      default:
        if (!!meta && !!meta.patterns[colId]) {
          if (event.key.startsWith('sortAscending')) {
            onHeaderSubSortClicked(event.key, true, colId, status);
          } else {
            onHeaderSubSortClicked(event.key, false, colId, status);
          }
        }
    }
  };

  const onHeaderSubSortClicked = (key, ascending, colId, status) => {
    const replaceKey = ascending ? 'sortAscending' : 'sortDescending';
    const clickedSubSort = key.replace(replaceKey + '-', '');
    const result = findSort(filterSort.rules, colId);
    const currentSubSort = !!result ? result.subSort : undefined;
    const isSameSortClicked = ascending ? status.isAscending : status.isDescending;
    if (!isSameSortClicked || clickedSubSort !== currentSubSort) {
      filterSortColumns &&
        filterSortColumns(
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

  const getDropdownSubMenu = (ascending, label, sorts, icon, columnSort) => {
    const key = ascending ? 'sortAscending' : 'sortDes';
    const isSortOrderSame = ascending ? columnSort.ascending : columnSort.ascending !== undefined ? !columnSort.ascending : undefined;
    const subSortIndex = isSortOrderSame && columnSort.existing ? sorts.findIndex((sort) => sort === columnSort.subSort) : -1;
    return (
      <Menu.SubMenu
        key={key}
        title={getDropdownMenuItemContent(icon, label)}
        className={classNames({ ['sub-menu-highlight']: subSortIndex !== -1 })}
        popupClassName={classNames({ ['sub-menu-highlight']: subSortIndex !== -1 })}
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
        {!!meta && !!meta.patterns[colId]
          ? getDropdownSubMenu(true, ascendingLabel, Object.keys(meta.patterns[colId].sorts), <ArrowUpOutlined />, sorted)
          : getDropdownMenuItem({
              key: 'sortAscending',
              className: classNames({ ['MENU_HIGHLIGHT_CLASSNAME']: isAscending }),
              icon: <ArrowUpOutlined />,
              label: ascendingLabel,
              disabled: false,
            })}
        {!!meta && !!meta.patterns[colId]
          ? getDropdownSubMenu(false, descendingLabel, Object.keys(meta.patterns[colId].sorts), <ArrowDownOutlined />, sorted)
          : getDropdownMenuItem({
              key: 'sortDescending',
              className: classNames({ ['MENU_HIGHLIGHT_CLASSNAME']: isDescending }),
              icon: <ArrowDownOutlined />,
              label: descendingLabel,
              disabled: false,
            })}
        {getDropdownMenuItem({
          key: 'clearSort',
          className: 'MENU_SEPARATOR_CLASSNAME',
          label: 'Clear all',
          disabled: !sorted.existing,
        })}
        {getDropdownMenuItem({ key: 'addFilter', icon: <FilterOutlined />, label: 'Add filter', disabled: false })}
      </Menu>
    );
  };

  const SortableHeader = SortableElement(({ children, ...headerProps }) => {
    const header = children.props.children[0];
    const tooltip = !!ALL_COLUMNS_MATCHING_INDEX[children.props.id] ? ALL_COLUMNS_MATCHING_INDEX[children.props.id].tooltip : undefined;

    let headerClone = cloneElement(header, {
      ...header.props,
      title: tooltip,
    });

    const result = findSort(filterSort.rules, children.props.id);
    const sortIndicator = result.existing && (
      <span key="sortIndicator" className={'SORT_INDICATOR_CLASSNAME'}>
        {enableColumnConfig && result.filter && result.filterValue && <FilterFilled id={id + '-' + children.props.id + '-header-filter'} />}
        {result.ascending !== undefined && [
          result.ascending ? (
            <ArrowUpOutlined id={id + '-' + children.props.id + '-header-asc'} key="arrow" />
          ) : (
            <ArrowDownOutlined id={id + '-' + children.props.id + '-header-desc'} key="arrow" />
          ),
          <span id={id + '-' + children.props.id + '-header-ordinate'} key="ordinate">
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
    return cloneElement(children, headerProps, [headerClone, dropdown, sortIndicator]);
  });

  const SortableHeaderRowRenderer = SortableContainer(({ className, columns, style }) => {
    // delete style.paddingRight;
    const innerStyle = { ...style };
    innerStyle.display = 'flex';
    innerStyle.width = style.width - 40;
    const menu = (
      <Menu onClick={onManageColumnsClick} className={'DROPDOWN_CLASSNAME'}>
        {getDropdownMenuItem({ key: 'addRemoveCols', icon: <TableOutlined />, label: 'Add/Remove Cols' })}
        {getDropdownMenuItem({ key: 'filterSort', icon: <FilterOutlined />, label: 'Filter/Sort' })}
        {getDropdownMenuItem({
          key: 'clearSort',
          label: 'Clear filters',
          disabled: !isSorted(),
        })}
      </Menu>
    );
    return (
      <div className={className} role="row" style={style}>
        <div style={innerStyle}>
          {Children.map(columns, (column, index) => {
            return (
              <Fragment key={column.key}>
                <SortableHeader index={index}>{column}</SortableHeader>
                <Draggable
                  axis="x"
                  defaultClassName="DragHandle"
                  defaultClassNameDragging="DragHandleActive"
                  onDrag={(_, { x }) => resizeColumn(column, x)}
                  position={{ x: 0, y: 0 }}
                  zIndex={999}
                >
                  <span className="DragHandleIcon">⋮</span>
                </Draggable>
              </Fragment>
            );
          })}
        </div>
        {enableColumnConfig && (
          <div className={'MANAGE_COLUMNS_CLASSNAME'} style={{ width: MANAGE_COLUMNS_WIDTH }}>
            <Dropdown overlay={menu} key="dropdown" trigger={['click']}>
              <SettingOutlined />
            </Dropdown>
          </div>
        )}
      </div>
    );
  });

  const onSortEnd = ({ oldIndex, newIndex }) => {
    console.log('sort end', oldIndex, newIndex, reorderColumns);
    !!reorderColumns && arrayMove(columns, oldIndex, newIndex);
  };

  const getRow = (index, rows) => {
    // console.log('getRow', rows[index]);
    return rows[index];
  };

  const renderHeaderRow = (params) => {
    console.log('params', params);
    return <SortableHeaderRowRenderer {...params} axis="x" lockAxis="x" onSortEnd={onSortEnd} pressDelay={200} />;
  };

  const sortedFilteredColumnIds = !!filterSort && Array.isArray(filterSort.rules) ? filterSort.rules.map((rule) => rule.colId) : [];

  const columnCellDataGetter = ({ columnData, dataKey, rowData }) => {
    return rowData[dataKey];
  };

  const renderRow = ({ className, columns, index, key, onColumnClick, onRowClick, rowData, style }, highlights) => {
    console.log(`renderRow columns ${columns}`);
    return <div key={key}>{columns}</div>;
  };

  console.log('RENDEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEER');
  return (
    <div className="">
      <AutoSizer>
        {({ height2, width2 }) => (
          <Table
            id={id}
            ref={tableRef}
            width={width}
            height={height}
            headerHeight={20}
            rowHeight={30}
            rowCount={updatedRows.length}
            // rowRenderer={(row) => renderRow(row)}
            rowGetter={({ index }) => getRow(index, updatedRows)}
            overscanRowCount={10}
            headerRowRenderer={renderHeaderRow}
          >
            {!!headers &&
              headers.map((header, index) => {
                return (
                  <Column
                    id={header.name}
                    key={header.name}
                    label={header.name}
                    dataKey={header.name}
                    width={header.width}
                    // headerRenderer={headerRenderer}
                    cellDataGetter={columnCellDataGetter}
                    // flexGrow={1}
                  />
                );
              })}
          </Table>
        )}
      </AutoSizer>
    </div>
  );
}

MyTableMerge.propTypes = {};

export default MyTableMerge;
