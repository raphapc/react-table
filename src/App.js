import faker from 'faker';
import React from 'react';
import MyTable from './components/my-table/MyTable';

function App() {
  const fetchDatasource = () =>
    new Array(100).fill(true).map(() => ({
      accountName: faker.finance.accountName(),
      name: faker.name.findName(),
      amount: faker.finance.amount(),
      transactionType: faker.finance.transactionType(),
      date: faker.date.recent(),
      creditCardNumber: faker.finance.creditCardNumber(),
      account: faker.finance.account(),
    }));

  const fetchFilters = () => {
    return [
      {
        key: 'account',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'amount',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'transactionType',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'date',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'creditCardNumber',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'name',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
      {
        key: 'accountName',
        isDescending: false,
        subSort: '',
        filter: '',
        filterValue: '',
      },
    ];
  };

  const fetchColumns = () => [
    { key: 'name', label: 'Name' },
    { key: 'account', label: 'Account' },
    { key: 'accountName', label: 'Account Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'date', label: 'Date' },
    // { key: 'transactionType', label: 'Transaction Type' },
  ];

  const fetchMetadata = () => {
    return {
      columnsType: [
        { key: 'amount', type: 'number' },
        { key: 'date', type: 'date', format: 'DD-MM-yyyy - HH:mm' },
      ],
      columnsDisplay: [
        { key: 'name', label: 'Name' },
        { key: 'accountName', label: 'Account Name' },
        { key: 'amount', label: 'Amount' },
        { key: 'date', label: 'Date' },
        { key: 'transactionType', label: 'Transaction Type' },
        { key: 'creditCardNumber', label: 'Credit Card Number' },
        { key: 'account', label: 'Account' },
      ],
    };
  };

  const dados = fetchDatasource();
  const filters = fetchFilters();
  const columns = fetchColumns();
  const meta = fetchMetadata();

  const secondGlaceRender = (text) => {
    console.log('secondGlaceRender pai', text);
    return <div>Hello</div>;
  };

  const selectedRow = (selectedRows) => {
    console.log('selectedRows', selectedRows);
  };

  return (
    <MyTable
      dataSource={dados}
      width={800}
      height={600}
      columnsToDisplay={columns}
      filterSort={filters}
      metadata={meta}
      // tableClassName='testTable'
      // cellClassName='testCell'
      // headerClassName='testHeader'
      // secondGlanceRender={secondGlaceRender}
      lineSelectable={true}
      onRowSelected={selectedRow}
      // small
      // hasDropdown={false}
    />
  );
  // filterSort={filters}
}

export default App;
