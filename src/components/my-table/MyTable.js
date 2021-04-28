import { CaretDownOutlined, CaretUpOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Col, DatePicker, Dropdown, Input, Menu, Row } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import SubMenu from 'antd/lib/menu/SubMenu';
import arrayMove from 'array-move';
import classNames from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import React, { forwardRef, cloneElement, Fragment, useEffect, useState } from 'react';
import ReactDragListView from 'react-drag-listview';
import Draggable from 'react-draggable';
import { ReactSVG } from 'react-svg';
import { Column, defaultTableRowRenderer, Table } from 'react-virtualized';
import './MyTable.css';
const { DragColumn } = ReactDragListView;

const getHeadersFrom = (headersList, totalWidth, isSelectable) => {
  let adjustedWidth = totalWidth;
  if (isSelectable) {
    adjustedWidth -= 40;
  }
  const defaultWidth = adjustedWidth / headersList.length;
  return headersList.map((header) => {
    header.width = defaultWidth;
    return header;
  });
};
const getInitialKeys = (columnsToDisplay) => {
  return columnsToDisplay ? columnsToDisplay.map((column) => column.key) : [];
};

const getDatasource = (lineSelectable, dataSource) => {
  return lineSelectable ? addSelectableColumnToRows(dataSource) : dataSource;
};

const addSelectableColumnToRows = (rows) => {
  return rows.map((row) => {
    row.isSelected = false;
    return row;
  });
};

const getColumnType = (metadata, columnId) => {
  if (metadata && metadata.columnsType) {
    return metadata.columnsType.find((colType) => colType.key === columnId);
  }
  return '';
};

const defaultRowHeight = 50;
const smallRowHeight = 40;

const numberFilters = {
  equals: 'equals',
  lessThan: 'lessThan',
  greaterThan: 'greaterThan',
  between: 'between',
};

const dateFilters = {
  equals: 'equals',
  before: 'before',
  after: 'after',
  interval: 'interval',
};

const stringFilters = {
  contains: 'contains',
  notContains: 'notContains',
};

const MyTable = ({
  dataSource,
  width,
  height,
  filterSort,
  columnsToDisplay,
  metadata,
  secondGlanceRender,
  lineSelectable = false,
  onRowSelected = () => {},
  tableClassName = 'table',
  headerClassName = '',
  rowClassName = 'row',
  cellClassName = 'cell',
  small = false,
  hasDropdown = true,
}) => {
  const inputRef = React.useRef(null);
  const inputRef2 = React.useRef(null);
  const processedDatasource = getDatasource(lineSelectable, dataSource);
  const initialFilters = filterSort;
  const rowHeight = small ? smallRowHeight : defaultRowHeight;
  const hasSelectedListChanged = React.useRef(false);
  let filterDates = [];

  //State variables
  const [expandedRows, setExpandedRows] = useState(() => new Set());
  const [isHeaderCheckboxSelected, setIsHeaderCheckboxSelected] = useState(false);
  const [headers, setHeaders] = useState(() => getHeadersFrom(columnsToDisplay, width, lineSelectable));
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [sortedList, setSortedList] = useState(processedDatasource);
  const [sortFilter, setSortFilter] = useState(filterSort);
  const [targetKeys, setTargetKeys] = useState(() => getInitialKeys(columnsToDisplay));

  useEffect(() => {
    console.log('reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeender');
  });

  useEffect(() => {
    if (hasSelectedListChanged.current) {
      const selectedRows = sortedList.filter((row) => row.isSelected);
      onRowSelected(selectedRows);
      hasSelectedListChanged.current = false;
    }
  }, [sortedList, onRowSelected]);

  const _sort = (sortBy, sortDirection) => {
    setSortedList(_sortList(sortBy, sortDirection));
  };

  const _sortList = (sortBy, sortDirection) => {
    let columnType;
    let newList;
    const columnRule = sortFilter.filter((rule) => rule.key === sortBy);
    columnType = getColumnType(metadata, sortBy);
    if (!columnType) {
      newList = _.sortBy(sortedList, [sortBy]);
    } else if (columnType.type === 'number') {
      newList = _.sortBy(sortedList, [(elem) => Number(elem[sortBy])]);
    } else if (columnType.type === 'date') {
      newList = _.sortBy(sortedList, [(elem) => elem[sortBy].getTime()]);
    } else if (columnType.type === 'boolean') {
      newList = _.sortBy(sortedList, [(elem) => Boolean(elem[sortBy])]);
    }

    let isDescending = columnRule.length !== 0 ? columnRule[0].isDescending : false;
    if (sortDirection) {
      isDescending = sortDirection === 'descending' ? true : false;
    }
    if (columnRule.length !== 0 && isDescending) {
      newList.reverse();
    }

    setSortFilter((prevSortFilter) => {
      const newSortFilter = _.cloneDeep(prevSortFilter);
      return newSortFilter.map((rule) => {
        if (rule.key === sortBy) {
          rule.isDescending = !rule.isDescending;
          rule.isSorted = true;
        } else {
          rule.isDescending = false;
          rule.isSorted = false;
        }
        return rule;
      });
    });
    return newList;
  };

  const _resizeColumn = (dataKey, deltaX) => {
    setHeaders((prevHeaders) => {
      const novoHeaders = _.cloneDeep(prevHeaders);
      return novoHeaders.map((header, index) => {
        if (header.key === dataKey) {
          const nextHeader = novoHeaders[index + 1];
          header.width = header.width + deltaX;
          if (nextHeader) {
            nextHeader.width = nextHeader.width - deltaX;
          }
        }
        return header;
      });
    });
  };

  const handleFilter = (columnType, idColumn, operation, isDate = false) => {
    let filterBy;
    let filterUntil;
    if (isDate) {
      filterBy = filterDates[0];
      filterUntil = filterDates[1] || '';
    } else {
      filterBy = inputRef.current.state.value;
      filterUntil = inputRef2?.current?.state?.value || '';
    }

    switch (columnType?.type) {
      case 'number': {
        filterColByNumber(operation, filterBy, filterUntil, idColumn);
        break;
      }
      case 'date': {
        filterColByDate(operation, filterBy, filterUntil, idColumn);
        break;
      }
      default: {
        filterColByString(operation, filterBy, idColumn);
      }
    }

    setSortFilter((prevSortFilter) => {
      const newSortFilter = _.cloneDeep(prevSortFilter);
      return newSortFilter.map((rule) => {
        if (rule.key === idColumn) {
          rule.filterValue = filterBy;
        } else {
          rule.filterValue = '';
        }
        rule.isSorted = false;
        return rule;
      });
    });
  };

  const filterColByNumber = (operation, filterBy, filterUntil, idColumn) => {
    switch (operation) {
      case numberFilters.equals: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return row[idColumn] === filterBy;
          });

          return filteredList;
        });
        break;
      }
      case numberFilters.lessThan: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return Number(row[idColumn]) < Number(filterBy);
          });

          return filteredList;
        });
        break;
      }
      case numberFilters.greaterThan: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return Number(row[idColumn]) > Number(filterBy);
          });

          return filteredList;
        });
        break;
      }
      case numberFilters.between: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return Number(row[idColumn]) > Number(filterBy) && Number(row[idColumn]) < Number(filterUntil);
          });

          return filteredList;
        });
        break;
      }
      default: {
      }
    }
  };

  const filterColByString = (operation, filterBy, idColumn) => {
    switch (operation) {
      case stringFilters.contains: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return row[idColumn].toUpperCase().includes(filterBy.toUpperCase());
          });

          return filteredList;
        });
        break;
      }
      case stringFilters.notContains: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return !row[idColumn].toUpperCase().includes(filterBy.toUpperCase());
          });

          return filteredList;
        });
        break;
      }
      default: {
      }
    }
  };

  const filterColByDate = (operation, filterBy, filterUntil, idColumn) => {
    switch (operation) {
      case dateFilters.equals: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return moment(row[idColumn]).isSame(filterBy, 'day');
          });

          return filteredList;
        });
        break;
      }
      case dateFilters.before: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return moment(row[idColumn]).isBefore(filterBy, 'day');
          });

          return filteredList;
        });
        break;
      }
      case dateFilters.after: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return moment(row[idColumn]).isAfter(filterBy, 'day');
          });

          return filteredList;
        });
        break;
      }
      case dateFilters.interval: {
        setSortedList(() => {
          const newSortedList = _.cloneDeep(processedDatasource);
          const filteredList = newSortedList.filter((row) => {
            return moment(row[idColumn]).isBetween(filterBy, filterUntil, 'day');
          });

          return filteredList;
        });
        break;
      }
      default: {
      }
    }
  };

  const resetFilter = () => {
    setSortedList(processedDatasource);
    setSortFilter(initialFilters);
  };

  const sortColumn = (sortBy) => {
    _sort(sortBy);
  };

  const renderHeaderRow = (params) => {
    return <SortableHeaderRowRenderer {...params} />;
  };

  const SortableHeaderRowRenderer = ({ className, columns, style }) => {
    return (
      <div className={className} role='row' style={style}>
        {React.Children.map(columns, (column, index) => {
          if (column.props.id === 'checkbox') {
            return (
              <Fragment key={column.key}>
                <CustomHeader className='checkbox' index={index}>
                  {column}
                </CustomHeader>
              </Fragment>
            );
          }
          if (column.props.id === '') {
            return (
              <Fragment key={column.key}>
                <CustomHeader index={index}></CustomHeader>
              </Fragment>
            );
          }

          const sorted = sortFilter.find((filter) => filter.key === column.props.id && (filter.isSorted || filter.filterValue));
          const headerClass = headerClassName;
          return (
            <Fragment key={column.key}>
              <CustomHeader
                className={classNames('drag-header', headerClass)}
                index={index}
                onClick={() => sortColumn(column.props.id)}
                sortFilter={sorted}
                idColumn={column.props.id}
              >
                {column}
              </CustomHeader>
              <Draggable
                axis='x'
                lockAxis='x'
                defaultClassName='DragHandle'
                defaultClassNameDragging='DragHandleActive'
                onStop={(_, { x }) => _resizeColumn(column.props.id, x)}
              >
                <span>|</span>
              </Draggable>
            </Fragment>
          );
        })}
      </div>
    );
  };

  const CustomHeader = ({ children, sortFilter, idColumn, ...headerProps }, ref) => {
    const header = children.props.children[0];

    let headerClone = cloneElement(header, {
      ...header.props,
    });

    const sortIndicator = sortFilter && sortFilter.isSorted && (
      <span key='sortIndicator' className='header__icon-sort'>
        {/* {sortFilter.isDescending ? <ReactSVG src='icons/sort-down.svg' className='icon' /> : <ReactSVG src='icons/sort-up.svg' className='icon' />} */}
        {sortFilter.isDescending ? <CaretDownOutlined className='icon' /> : <CaretUpOutlined className='icon' />}
      </span>
    );
    const filterIndicator = sortFilter && sortFilter.filterValue && (
      <span key='filterIndicator' className='header__icon-filter'>
        <ReactSVG src='icons/filter.svg' className='icon' />
      </span>
    );

    const dropdownMenu = hasDropdown && idColumn && (
      <Dropdown key={idColumn} overlay={getMenuOptions(idColumn)} trigger={['click']} placement='bottomRight'>
        <DownOutlined onClick={(e) => getDrop(e)} />
      </Dropdown>
    );

    return cloneElement(children, headerProps, [headerClone, sortIndicator, filterIndicator, dropdownMenu]);
  };

  const getDrop = (e) => {
    e.stopPropagation();
  };

  const getMenuOptions = (idColumn) => {
    const columnType = getColumnType(metadata, idColumn);
    let filterOptions = [];
    let sortOptions = [];

    if (columnType?.type === 'number') {
      filterOptions.push(
        <SubMenu
          title='Equals'
          key={idColumn + '-equals'}
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItem({ inputRef, columnType, idColumn, operation: numberFilters.equals })}
        </SubMenu>
      );
      filterOptions.push(
        <SubMenu
          title='Less than'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItem({ inputRef, columnType, idColumn, operation: numberFilters.lessThan })}
        </SubMenu>
      );
      filterOptions.push(
        <SubMenu
          title='Greater than'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItem({ inputRef, columnType, idColumn, operation: numberFilters.greaterThan })}
        </SubMenu>
      );
      filterOptions.push(
        <SubMenu
          title='Between'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItem({ inputRef, inputRef2, columnType, idColumn, operation: numberFilters.between })}
        </SubMenu>
      );
    } else if (columnType?.type === 'date') {
      filterOptions.push(
        <SubMenu
          title='Equals'
          key={idColumn + '-equals'}
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItemDate({ inputRef, columnType, idColumn, operation: dateFilters.equals })}
        </SubMenu>
      );
      filterOptions.push(
        <SubMenu
          title='Before'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItemDate({ inputRef, columnType, idColumn, operation: dateFilters.before })}
        </SubMenu>
      );
      filterOptions.push(
        <SubMenu
          title='After'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItemDate({ inputRef, columnType, idColumn, operation: dateFilters.after })}
        </SubMenu>
      );
      filterOptions.push(
        <SubMenu
          title='Date interval'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItemDate({ inputRef, inputRef2, columnType, idColumn, operation: dateFilters.interval })}
        </SubMenu>
      );
    } else {
      filterOptions.push(
        <SubMenu
          title='Contains'
          key={idColumn + '-contains'}
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItem({ inputRef, columnType, idColumn, operation: stringFilters.contains })}
        </SubMenu>
      );
      filterOptions.push(
        <SubMenu
          title='Does not contain'
          key={idColumn + '-notContains'}
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {getMenuItem({ inputRef, columnType, idColumn, operation: stringFilters.notContains })}
        </SubMenu>
      );
    }

    sortOptions.push(
      <Menu.Item
        key={idColumn + '-asc'}
        onClick={({ domEvent: e }) => {
          e.stopPropagation();
          _sort(idColumn, 'asceding');
        }}
      >
        Asceding
      </Menu.Item>
    );
    sortOptions.push(
      <Menu.Item
        key={idColumn + '-desc'}
        onClick={({ domEvent: e }) => {
          e.stopPropagation();
          _sort(idColumn, 'descending');
        }}
      >
        Descending
      </Menu.Item>
    );
    return (
      <Menu triggerSubMenuAction='click'>
        <SubMenu
          title='Filter'
          key='filter'
          popupClassName='sub-menu'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {filterOptions.map((filterOption) => filterOption)}
        </SubMenu>
        <SubMenu
          title='Sort'
          key='sort'
          onTitleClick={(e) => {
            e.domEvent.stopPropagation();
          }}
        >
          {sortOptions.map((sortOption) => sortOption)}
        </SubMenu>
        <Menu.Divider />
        <Menu.Item
          key='clear'
          onClick={({ domEvent: e }) => {
            e.stopPropagation();
            resetFilter();
          }}
        >
          Clear Filter/Sort
        </Menu.Item>
      </Menu>
    );
  };

  const getMenuItem = ({ inputRef, inputRef2, columnType, idColumn, operation }) => {
    return (
      <Menu.Item>
        <Col>
          <div className='input-wrapper'>
            {inputRef2 && <label className='input-label'>Min:</label>}
            <Input
              ref={inputRef}
              style={{ width: 130, marginLeft: 3 }}
              placeholder='Value'
              onClick={(e) => {
                e.stopPropagation();
              }}
            />
          </div>
          {inputRef2 && (
            <div className='input-wrapper'>
              <label className='input-label'>Max:</label>
              <Input
                ref={inputRef2}
                style={{ width: 130, marginLeft: 3 }}
                placeholder='Second Value'
                onClick={(e) => {
                  e.stopPropagation();
                }}
              />
            </div>
          )}
          <Button
            type='primary'
            onClick={(e) => {
              e.stopPropagation();
              handleFilter(columnType, idColumn, operation);
            }}
          >
            Ok
          </Button>
        </Col>
      </Menu.Item>
    );
  };

  const getMenuItemDate = ({ inputRef, inputRef2, columnType, idColumn, operation }) => {
    return (
      <Menu.Item>
        <Col
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {!inputRef2 && <DatePicker className='date-picker' format={'DD-MM-YYYY'} onChange={(value) => (filterDates = [value])} />}
          {inputRef2 && <DatePicker.RangePicker className='range-picker' format={'DD-MM-YYYY'} onChange={(value) => (filterDates = value)} />}
          <Button
            type='primary'
            onClick={() => {
              handleFilter(columnType, idColumn, operation, true);
            }}
          >
            Ok
          </Button>
        </Col>
      </Menu.Item>
    );
  };

  const onDragEnd = (fromIndex, toIndex) => {
    if (lineSelectable) {
      //need to remove one position because of the checkbox
      fromIndex--;
      toIndex--;
    }
    setHeaders(arrayMove(headers, fromIndex, toIndex));
  };

  const onChangeTransfer = (nextTargetKeys, ...rest) => {
    setTargetKeys(nextTargetKeys);
  };

  const onSelectTansferChange = (sourceSelectedKeys, targetSelectedKeys) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const handleAddRemoveColumn = () => {
    const newColumnsToDisplay = metadata.columnsDisplay.filter((column) => targetKeys.includes(column.key));
    setHeaders(getHeadersFrom(newColumnsToDisplay, width));
  };

  const getCheckbox = ({ isSelected = false, onCheckboxClick }) => {
    return <Checkbox checked={isSelected} onClick={onCheckboxClick} />;
  };

  const selectCheckbox = (rowSelectedIndex) => {
    hasSelectedListChanged.current = true;
    setSortedList((prevSortedList) => {
      const newSortedList = _.cloneDeep(prevSortedList);
      return newSortedList.map((row, index) => {
        if (index === rowSelectedIndex) {
          if (row.isSelected) {
            setIsHeaderCheckboxSelected(false);
          }
          row.isSelected = !row.isSelected;
        }
        return row;
      });
    });
  };

  const selectAllRows = () => {
    hasSelectedListChanged.current = true;
    setIsHeaderCheckboxSelected((prevSelected) => !prevSelected);
    setSortedList((prevSortedList) => {
      const newSortedList = _.cloneDeep(prevSortedList);
      return newSortedList.map((row) => {
        row.isSelected = !isHeaderCheckboxSelected;
        return row;
      });
    });
  };

  const renderRow = (props, expandedRows) => {
    const { className, columns, index, key, onColumnClick, onRowClick, rowData, style } = props;
    if (expandedRows.has(rowData)) {
      console.log('expanded ---');
      return (
        <Fragment key={key}>
          <div className='expand-column' style={style}>
            {getSecondGlaceRender('hallo')}
            {defaultTableRowRenderer(props)}
          </div>
        </Fragment>
      );
    }

    if (lineSelectable && rowData.isSelected) {
      props.className = classNames(props.className, { selected: rowData.isSelected });
    }
    return (
      <Fragment key={key}>
        {/* <ReactSVG src='icons/chevron-down.svg' className='icon' style={style} /> {defaultTableRowRenderer(props)} */}
        {defaultTableRowRenderer(props)}
      </Fragment>
    );
  };

  const getSecondGlaceRender = (text) => {
    console.log('getSecondGlaceRender');
    return secondGlanceRender(text);
  };

  const renderCell = ({ cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex }) => {
    let columnType;
    if (metadata && metadata.columnsType) {
      columnType = metadata.columnsType.find((colType) => colType.key === dataKey);
    }
    if (dataKey === 'isSelected') {
      return getCheckbox({ isSelected: rowData.isSelected, onCheckboxClick: () => selectCheckbox(rowIndex) });
    }
    if (dataKey === '') {
      return <ReactSVG className='expand-icon' src='icons/chevron-down.svg' onClick={() => expandedRow(rowData)} />;
    }
    if (cellData == null) {
      return '';
    } else {
      if (columnType && columnType.type === 'date') {
        const formatedDate = columnType.format ? columnType.format : 'DD-MM-yyyy';
        return moment(cellData).format(formatedDate);
      }
      return String(cellData);
    }
  };

  const expandedRow = (rowData) => {
    console.log('expandedRow func', rowData);
    setExpandedRows((prevRows) => {
      let newRows = _.cloneDeep(prevRows);
      if (newRows.has(rowData)) {
        newRows.delete(rowData);
      } else {
        newRows.add(rowData);
      }
      console.log('newRows', newRows);
      return newRows;
    });
  };

  const updatedRows = new Map();
  if (sortedList) {
    sortedList.forEach((row, index) => {
      const rowKey = row.key;
      const rowtWithSecondGlance = expandedRows.has(rowKey);
      const mainRow = {
        key: rowKey,
        mainRow: true,
        expanded: false,
        mainRowWithSecondGlanceOpen: rowtWithSecondGlance,
      };
    });
  }

  const dragProps = {
    onDragEnd,
    nodeSelector: '.drag-header',
    lineClassName: 'line',
    ignoreSelector: '.DragHandle',
  };

  return (
    <Fragment>
      {sortedList && (
        <DragColumn {...dragProps}>
          <Table
            width={width}
            height={height}
            headerHeight={rowHeight}
            rowHeight={rowHeight}
            rowCount={sortedList.length}
            rowGetter={({ index }) => sortedList[index]}
            overscanRowCount={10}
            headerRowRenderer={renderHeaderRow}
            className={tableClassName}
            rowClassName={rowClassName}
            rowRenderer={(renderParams) => renderRow(renderParams, expandedRows)}
          >
            {lineSelectable && (
              <Column
                id={'checkbox'}
                key={'checkbox'}
                dataKey={'isSelected'}
                className={'checkbox'}
                label={getCheckbox({ isSelected: isHeaderCheckboxSelected, onCheckboxClick: selectAllRows })}
                width={40}
                cellRenderer={renderCell}
              />
            )}
            {secondGlanceRender && <Column id={'expand'} key={'expand'} dataKey={''} label='' width={40} cellRenderer={renderCell} />}
            {headers &&
              headers.map((header) => (
                <Column
                  id={header.key}
                  key={header.key}
                  dataKey={header.key}
                  label={header.label}
                  width={header.width}
                  className={cellClassName}
                  cellRenderer={renderCell}
                />
              ))}
          </Table>
        </DragColumn>
      )}
      {/* <Space direction='vertical'>
        <Space>
          <Transfer
            dataSource={metadata.columnsDisplay}
            titles={['Available', 'Displayed']}
            operations={['Add', 'Remove']}
            targetKeys={targetKeys}
            selectedKeys={selectedKeys}
            onChange={onChangeTransfer}
            onSelectChange={onSelectTansferChange}
            render={(header) => header.label}
            rowKey={(header) => header.key}
          />
          <Button type='primary' onClick={handleAddRemoveColumn}>
            Apply
          </Button>
        </Space>
      </Space> */}
    </Fragment>
  );
};

MyTable.propTypes = {};

export default MyTable;
