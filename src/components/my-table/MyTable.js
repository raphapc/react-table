import { CaretDownFilled, CaretDownOutlined, CaretUpFilled, CloseCircleOutlined, FilterFilled } from '@ant-design/icons';
import { Button, Input, Menu, Select, Space } from 'antd';
import arrayMove from 'array-move';
import _ from 'lodash';
import React, { cloneElement, Fragment, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import { Column, Table } from 'react-virtualized';
import './MyTable.css';

const getHeadersFrom = (headersList, totalWidth) => {
  const defaultWidth = totalWidth / headersList.length;
  return headersList.map((header) => {
    header.width = defaultWidth;
    return header;
  });
};

const MyTable = ({ dataSource, width, height, filterSort, columnsToDisplay, metadata }) => {
  const { Option } = Select;
  const inputRef = React.useRef(null);
  const [sortedList, setSortedList] = useState(dataSource);
  const [headers, setHeaders] = useState(() => getHeadersFrom(columnsToDisplay, width));
  const [sortFilter, setSortFilter] = useState(filterSort);
  const [selected, setSelected] = useState();

  useEffect(() => {
    // setHeaders(getHeadersFrom(columnsToDisplay, width));
  }, [columnsToDisplay, width]);

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
        } else {
          rule.isDescending = false;
        }
        return rule;
      });
    });

    return newList;
  };

  const _resizeColumn = (dataKey, deltaX) => {
    console.log('_resizeColumn', dataKey, deltaX);
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

      setSortedList((prevSortedList) => {
        const newSortedList = _.cloneDeep(dataSource);
        const filteredList = newSortedList.filter((row) => {
          return row[selected].includes(filter);
        });

        return filteredList;
      });
      console.log('sortedList', sortedList);
    }
  };

  const sortColumn = (sortBy) => {
    console.log('sortColumn', sortBy);
    _sort(sortBy);
  };

  const renderHeaderRow = (params) => {
    return <SortableHeaderRowRenderer {...params} axis="x" lockAxis="x" onSortEnd={onSortEnd} pressDelay={200} />;
  };

  const SortableHeaderRowRenderer = SortableContainer(({ className, columns, style }) => {
    return (
      <div className={className} role="row" style={style}>
        {React.Children.map(columns, (column, index) => {
          return (
            <Fragment key={column.key}>
              <SortableHeader index={index} onClick={() => sortColumn(column.props.id)}>
                {column}
              </SortableHeader>
              <Draggable
                axis="x"
                lockAxis="x"
                defaultClassName="DragHandle"
                defaultClassNameDragging="DragHandleActive"
                onStop={(_, { x }) => _resizeColumn(column.props.id, x)}
              >
                <span className="drag-handle-icon">|</span>
              </Draggable>
            </Fragment>
          );
        })}
      </div>
    );
  });

  const SortableHeader = SortableElement(({ children, ...headerProps }) => {
    const header = children.props.children[0];

    let headerClone = cloneElement(header, {
      ...header.props,
    });
    const result = findSort(filterSort, children.props.id);

    const sortIndicator = result.existing && (
      <span key="sortIndicator" className="table--header-icon">
        {result.filter && result.filterValue && <FilterFilled />}
        {result.isDescending !== undefined && [
          result.isDescending ? <CaretUpFilled key="arrow" /> : <CaretDownFilled key="arrow" />,
          result.sortIndex > 0 && <span key="ordinate">{result.sortIndex + 1}</span>,
        ]}
      </span>
    );
    return cloneElement(children, headerProps, [headerClone, sortIndicator]);
  });

  const getDropdownMenu = (colId, sorted) => {
    // const isDescending = sorted.ascending !== undefined ? sorted.existing && !sorted.ascending : undefined;
    // const isAscending = sorted.existing && sorted.ascending;
    // const sortingOrdinate = ' (' + (sorted.sortIndex + 1) + ')';
    // const descendingLabel = 'Sort descending' + (isDescending ? sortingOrdinate : '');
    // const ascendingLabel = 'Sort ascending' + (isAscending ? sortingOrdinate : '');
    const extraProps = { id: 'flight-list-column-header-menu-' + colId };
    return (
      <Menu {...extraProps} mode="horizontal">
        <Menu.SubMenu key={colId} icon={<CaretDownOutlined />}>
          <Menu.Item key={colId + '1'}>Sort ASC</Menu.Item>
          <Menu.Item key={colId + '2'}>Sort DESC</Menu.Item>
          <Menu.Item key={colId + '3'}>Filter</Menu.Item>
          <Menu.Item key={colId + '4'}>
            <CloseCircleOutlined />
            Clear Filters
          </Menu.Item>
        </Menu.SubMenu>
      </Menu>
    );
  };

  const findSort = (rules, key) => {
    const sortIndex = rules.filter((sort) => sort.isDescending !== undefined).findIndex((sort) => sort.key === key);
    const result = rules.find((sort) => sort.key === key);
    return {
      existing: !!result,
      sortIndex,
      ascending: !!result ? result.isDescending : undefined,
      filter: !!result ? result.filter : undefined,
      filterValue: !!result ? result.filterValue : undefined,
    };
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    console.log('sort end', oldIndex, newIndex);
    setHeaders(arrayMove(headers, oldIndex, newIndex));
  };

  return (
    <div className="">
      {sortedList && (
        <Table
          width={width || '100%'}
          height={height}
          headerHeight={20}
          rowHeight={30}
          rowCount={sortedList.length}
          rowGetter={({ index }) => sortedList[index]}
          overscanRowCount={10}
          headerRowRenderer={renderHeaderRow}
          className="table"
          headerClassName="table-header"
          rowClassName="table-row"
        >
          {headers &&
            headers.map((header) => (
              <Column className="" id={header.key} key={header.key} dataKey={header.key} label={header.label} width={header.width} />
            ))}
        </Table>
      )}
      <Space>
        <Select defaultValue="Column to Filter" style={{ width: 150 }} onChange={(selected) => setSelected(selected)}>
          {headers && headers.map((header) => <Option value={header.key}>{header.label}</Option>)}
        </Select>
        {selected && <Input ref={inputRef} placeholder="Filter by" />}
        <Button type="primary" onClick={handleFilter}>
          Apply
        </Button>
      </Space>
    </div>
  );
};

MyTable.propTypes = {};

export default MyTable;
