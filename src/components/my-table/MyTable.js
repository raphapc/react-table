import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';
import { Button, Input, Select, Space, Transfer } from 'antd';
import Checkbox from 'antd/lib/checkbox/Checkbox';
import arrayMove from 'array-move';
import _ from 'lodash';
import React, { cloneElement, Fragment, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
// import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import ReactDragListView from 'react-drag-listview';
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

const MyTable = ({ dataSource, width, height, filterSort, columnsToDisplay, metadata, secondGlanceRender, lineSelectable = false }) => {
  const { Option } = Select;
  const inputRef = React.useRef(null);
  const processedDatasource = getDatasource(lineSelectable, dataSource);
  const initialFilters = filterSort;
  //State variables
  const [expandedRows, setExpandedRows] = useState(() => new Set());
  const [isHeaderCheckboxSelected, setIsHeaderCheckboxSelected] = useState(false);
  const [headers, setHeaders] = useState(() => getHeadersFrom(columnsToDisplay, width, lineSelectable));
  const [selected, setSelected] = useState();
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [sortedList, setSortedList] = useState(processedDatasource);
  const [sortFilter, setSortFilter] = useState(filterSort);
  const [targetKeys, setTargetKeys] = useState(() => getInitialKeys(columnsToDisplay));

  useEffect(() => {
    console.log('reeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeender');
  });

  const _sort = (sortBy) => {
    setSortedList(_sortList(sortBy));
  };

  const _sortList = (sortBy) => {
    let columnType;
    let newList;
    const columnRule = sortFilter.filter((rule) => rule.key === sortBy);
    if (metadata && metadata.columnsType) {
      columnType = metadata.columnsType.find((colType) => colType.key === sortBy);
    }
    if (!columnType) {
      newList = _.sortBy(sortedList, [sortBy]);
    } else if (columnType.type === 'number') {
      newList = _.sortBy(sortedList, [(elem) => Number(elem[sortBy])]);
    } else if (columnType.type === 'date') {
      newList = _.sortBy(sortedList, [(elem) => elem[sortBy].getTime()]);
    } else if (columnType.type === 'boolean') {
      newList = _.sortBy(sortedList, [(elem) => Boolean(elem[sortBy])]);
    }

    const isDescending = columnRule.length !== 0 ? columnRule[0].isDescending : false;
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

  const handleFilter = () => {
    if (selected && inputRef.current.state.value) {
      const filter = inputRef.current.state.value;

      setSortedList(() => {
        const newSortedList = _.cloneDeep(processedDatasource);
        const filteredList = newSortedList.filter((row) => {
          return row[selected].includes(filter);
        });

        return filteredList;
      });

      setSortFilter((prevSortFilter) => {
        const newSortFilter = _.cloneDeep(prevSortFilter);
        return newSortFilter.map((rule) => {
          if (rule.key === selected) {
            rule.filterValue = filter;
          } else {
            rule.filterValue = '';
          }
          rule.isSorted = false;
          return rule;
        });
      });
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
    return <SortableHeaderRowRenderer {...params} helperClass='header--dragging' />;
  };

  const SortableHeaderRowRenderer = ({ className, columns, style }) => {
    return (
      <div className={className} role='row' style={style}>
        {React.Children.map(columns, (column, index) => {
          if (column.props.id === 'checkbox') {
            return (
              <Fragment key={column.key}>
                <CustomHeader index={index}>{column}</CustomHeader>
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
          return (
            <Fragment key={column.key}>
              <CustomHeader className='drag-header' index={index} onClick={() => sortColumn(column.props.id)} sortFilter={sorted}>
                {column}
              </CustomHeader>
              <Draggable
                axis='x'
                lockAxis='x'
                defaultClassName='DragHandle'
                defaultClassNameDragging='DragHandleActive'
                onStop={(_, { x }) => _resizeColumn(column.props.id, x)}
              >
                <span className='drag-handle-icon'>|</span>
              </Draggable>
            </Fragment>
          );
        })}
      </div>
    );
  };

  const CustomHeader = ({ children, sortFilter, ...headerProps }) => {
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

    return cloneElement(children, headerProps, [headerClone, sortIndicator, filterIndicator]);
  };

  // const SortableHeader = SortableElement(({ children, sortFilter, ...headerProps }) => {
  //   const header = children.props.children[0];

  //   let headerClone = cloneElement(header, {
  //     ...header.props,
  //   });

  //   const sortIndicator = sortFilter && sortFilter.isSorted && (
  //     <span key='sortIndicator' className='header__icon-sort'>
  //       {/* {sortFilter.isDescending ? <ReactSVG src='icons/sort-down.svg' className='icon' /> : <ReactSVG src='icons/sort-up.svg' className='icon' />} */}
  //       {sortFilter.isDescending ? <CaretDownOutlined className='icon' /> : <CaretUpOutlined className='icon' />}
  //     </span>
  //   );
  //   const filterIndicator = sortFilter && sortFilter.filterValue && (
  //     <span key='filterIndicator' className='header__icon-filter'>
  //       <ReactSVG src='icons/filter.svg' className='icon' />
  //     </span>
  //   );

  //   return cloneElement(children, headerProps, [headerClone, sortIndicator, filterIndicator]);
  // });

  const onDragEnd = (fromIndex, toIndex) => {
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
      return (
        <Fragment key={key}>
          <div className='expand-column' style={style}>
            {getSecondGlaceRender()}
            {defaultTableRowRenderer(props)}
          </div>
        </Fragment>
      );
    }
    return (
      <Fragment key={key}>
        {/* <ReactSVG src='icons/chevron-down.svg' style={style} /> {defaultTableRowRenderer(props)} */}
        {defaultTableRowRenderer(props)}
      </Fragment>
    );
  };

  const getSecondGlaceRender = () => {
    console.log('getSecondGlaceRender');
    return secondGlanceRender;
  };

  const renderCell = ({ cellData, columnData, columnIndex, dataKey, isScrolling, rowData, rowIndex }) => {
    if (dataKey === 'isSelected') {
      return getCheckbox({ isSelected: rowData.isSelected, onCheckboxClick: () => selectCheckbox(rowIndex) });
    }
    if (dataKey === '') {
      return <ReactSVG className='expand-icon' src='icons/chevron-down.svg' onClick={() => expandedRow(rowData)} />;
    }
    if (cellData == null) {
      return '';
    } else {
      return String(cellData);
    }
  };

  const expandedRow = (rowData) => {
    console.log('expandedRow', rowData);
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
    // handleSelector: '.ReactVirtualized__Table__headerColumn',
    lineClassName: 'line',
    ignoreSelector: '.DragHandle',
  };

  return (
    <Space>
      {sortedList && (
        <DragColumn {...dragProps}>
          <Table
            width={width || '100%'}
            height={height}
            headerHeight={20}
            rowHeight={30}
            rowCount={sortedList.length}
            rowGetter={({ index }) => sortedList[index]}
            overscanRowCount={10}
            headerRowRenderer={renderHeaderRow}
            className='table'
            headerClassName='header'
            rowClassName='row'
            rowRenderer={(renderParams) => renderRow(renderParams, expandedRows)}
          >
            {lineSelectable && (
              <Column
                id={'checkbox'}
                key={'checkbox'}
                dataKey={'isSelected'}
                label={getCheckbox({ isSelected: isHeaderCheckboxSelected, onCheckboxClick: selectAllRows })}
                width={40}
                cellRenderer={renderCell}
              />
            )}
            {secondGlanceRender && <Column id={'expand'} key={'expand'} dataKey={''} label='' width={40} cellRenderer={renderCell} />}
            {headers &&
              headers.map((header) => <Column id={header.key} key={header.key} dataKey={header.key} label={header.label} width={header.width} />)}
          </Table>
        </DragColumn>
      )}
      <Space direction='vertical'>
        <Space>
          <Select defaultValue='Column to Filter' style={{ width: 180 }} onChange={(selected) => setSelected(selected)}>
            {headers &&
              headers.map((header) => (
                <Option key={header.key} value={header.key}>
                  {header.label}
                </Option>
              ))}
          </Select>
          {selected && <Input ref={inputRef} placeholder='Filter by' />}
          <Button type='primary' onClick={handleFilter}>
            Apply Filter
          </Button>
          <Button type='danger' onClick={resetFilter}>
            Clear All
          </Button>
        </Space>
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
      </Space>
    </Space>
  );
};

MyTable.propTypes = {};

export default MyTable;
